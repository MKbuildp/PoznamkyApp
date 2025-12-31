import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useFirestoreRealtime } from '../../../hooks/useFirestoreRealtime';
import { FirestoreService, FIRESTORE_COLLECTIONS, FirestorePrijem } from '../../../services/firestoreService';
import { PrijmyVydajeState, UsePrijmyVydajeReturn, Prijem } from '../types/types';
import { KategoriePrijmu } from '../../ObchodPrehledScreen/types/types';

/**
 * @description Transformace Firestore dat na lokální typ
 */
const transformPrijem = (doc: any): Prijem => {
  return {
    id: doc.id,
    castka: doc.castka,
    datum: doc.datum, // ISO string z Firestore
    kategorie: doc.kategorie as KategoriePrijmu,
    popis: doc.popis || undefined,
    firestoreId: doc.id
  };
};

/**
 * @description Hook pro správu logiky obrazovky Koloniál s real-time Firebase synchronizací
 */
export const usePrijmyVydaje = (): UsePrijmyVydajeReturn => {
  const [state, setState] = useState<PrijmyVydajeState>({
    prijmy: {
      castka: '',
      datum: new Date(),
      kategorie: undefined as any,
      popis: '',
      vybranyRok: new Date().getFullYear(),
      isDatePickerVisible: false,
      isLoading: false,
      rocniPrijem: 0,
    },
  });

  // Real-time synchronizace z Firestore
  const { 
    data: firestorePrijmy, 
    loading: nacitaSe, 
    error: firestoreError 
  } = useFirestoreRealtime<FirestorePrijem>({
    collectionName: FIRESTORE_COLLECTIONS.PRIJMY,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: transformPrijem
  });

  // Transformace na lokální typy
  const vsechnyPrijmy: Prijem[] = useMemo(() => {
    return firestorePrijmy.map(p => ({
      id: p.id || '',
      castka: p.castka,
      datum: p.datum,
      kategorie: p.kategorie,
      popis: p.popis,
      firestoreId: p.id
    }));
  }, [firestorePrijmy]);

  // Výpočet ročního příjmu
  const rocniPrijem = useMemo(() => {
    const prijmyZRoku = vsechnyPrijmy.filter(prijem => {
      const rokPrijmu = new Date(prijem.datum).getFullYear();
      return rokPrijmu === state.prijmy.vybranyRok;
    });
    return prijmyZRoku.reduce((suma, prijem) => suma + prijem.castka, 0);
  }, [vsechnyPrijmy, state.prijmy.vybranyRok]);

  // Aktualizace ročního příjmu ve state
  useMemo(() => {
    setState(prev => ({
      ...prev,
      prijmy: {
        ...prev.prijmy,
        rocniPrijem
      }
    }));
  }, [rocniPrijem]);

  // Filtrování jiných příjmů pro aktuální rok
  const jinePrijmy = useMemo(() => {
    const jinePrijmyZRoku = vsechnyPrijmy.filter(prijem => {
      const rokPrijmu = new Date(prijem.datum).getFullYear();
      return rokPrijmu === state.prijmy.vybranyRok && prijem.kategorie === KategoriePrijmu.JINE;
    });
    return jinePrijmyZRoku.sort((a, b) => 
      new Date(b.datum).getTime() - new Date(a.datum).getTime()
    );
  }, [vsechnyPrijmy, state.prijmy.vybranyRok]);

  // Error handling
  if (firestoreError) {
    console.error('Firestore error v usePrijmyVydaje:', firestoreError);
  }

  // PŘÍJMY HANDLERS
  const prijmyHandleCastkaChange = useCallback((text: string) => {
    const cistyText = text.replace(/[^0-9.]/g, '');
    const parts = cistyText.split('.');
    if (parts.length > 2) {
      return;
    }
    setState(prev => ({ 
      ...prev, 
      prijmy: { ...prev.prijmy, castka: cistyText }
    }));
  }, []);

  const prijmyHandleDatumChange = useCallback((date: Date) => {
    setState(prev => ({ 
      ...prev, 
      prijmy: { 
        ...prev.prijmy, 
        datum: date, 
        isDatePickerVisible: false 
      }
    }));
  }, []);

  const prijmyHandleKategorieChange = useCallback((kategorie: KategoriePrijmu) => {
    setState(prev => ({ 
      ...prev, 
      prijmy: { ...prev.prijmy, kategorie }
    }));
  }, []);

  const prijmyHandleSubmit = useCallback(async () => {
    if (!state.prijmy.castka || isNaN(parseFloat(state.prijmy.castka))) {
      Alert.alert('Chyba', 'Zadejte platnou částku');
      return;
    }

    // Kontrola popisu pro kategorii "Jiné"
    if (state.prijmy.kategorie === KategoriePrijmu.JINE && !state.prijmy.popis.trim()) {
      Alert.alert('Chyba', 'Pro kategorii "Jiné" je povinný popis');
      return;
    }

    setState(prev => ({ 
      ...prev, 
      prijmy: { ...prev.prijmy, isLoading: true }
    }));

    try {
      // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
      await FirestoreService.ulozPrijem({
        castka: parseFloat(state.prijmy.castka),
        datum: state.prijmy.datum.toISOString(),
        kategorie: state.prijmy.kategorie!,
        popis: state.prijmy.kategorie === KategoriePrijmu.JINE ? state.prijmy.popis : ''
      });

      setState(prev => ({ 
        ...prev, 
        prijmy: {
          ...prev.prijmy,
          castka: '',
          datum: new Date(),
          kategorie: undefined as any,
          popis: '',
          isLoading: false
        }
      }));

      Alert.alert('Úspěch', 'Příjem byl úspěšně uložen');
    } catch (error) {
      console.error('Chyba při ukládání příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit příjem');
      setState(prev => ({ 
        ...prev, 
        prijmy: { ...prev.prijmy, isLoading: false }
      }));
    }
  }, [state.prijmy.castka, state.prijmy.datum, state.prijmy.kategorie, state.prijmy.popis]);

  /**
   * @description Handler pro uložení nového příjmu s daty z modálního okna
   */
  const prijmyHandleSubmitWithData = useCallback(async (data: any) => {
    if (!data.castka || isNaN(parseFloat(data.castka))) {
      Alert.alert('Chyba', 'Zadejte platnou částku');
      return;
    }

    // Kontrola popisu pro kategorii "Jiné"
    if (data.kategorie === KategoriePrijmu.JINE && !data.popis?.trim()) {
      Alert.alert('Chyba', 'Pro kategorii "Jiné" je povinný popis');
      return;
    }

    setState(prev => ({ 
      ...prev, 
      prijmy: { ...prev.prijmy, isLoading: true }
    }));

    try {
      // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
      await FirestoreService.ulozPrijem({
        castka: parseFloat(data.castka),
        datum: data.datum.toISOString(),
        kategorie: data.kategorie,
        popis: data.kategorie === KategoriePrijmu.JINE ? data.popis : ''
      });

      setState(prev => ({ 
        ...prev, 
        prijmy: {
          ...prev.prijmy,
          castka: '',
          datum: new Date(),
          kategorie: undefined as any,
          popis: '',
          isLoading: false
        }
      }));

      Alert.alert('Úspěch', 'Příjem byl úspěšně uložen');
    } catch (error) {
      console.error('Chyba při ukládání příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit příjem');
      setState(prev => ({ 
        ...prev, 
        prijmy: { ...prev.prijmy, isLoading: false }
      }));
    }
  }, []);

  const prijmyHandleDatePickerVisibilityChange = useCallback((isVisible: boolean) => {
    setState(prev => ({ 
      ...prev, 
      prijmy: { ...prev.prijmy, isDatePickerVisible: isVisible }
    }));
  }, []);

  const prijmyHandlePopisChange = useCallback((text: string) => {
    setState(prev => ({ 
      ...prev, 
      prijmy: { ...prev.prijmy, popis: text }
    }));
  }, []);

  const smazatPosledniPrijem = useCallback(async () => {
    try {
      if (vsechnyPrijmy.length === 0) {
        Alert.alert('Info', 'Žádné příjmy k odstranění');
        return;
      }

      // Seřadíme podle data a vezmeme poslední (nejnovější) záznam
      const serazeneData = [...vsechnyPrijmy].sort((a, b) => 
        new Date(b.datum).getTime() - new Date(a.datum).getTime()
      );
      
      const posledniPrijem = serazeneData[0];
      const datumPosledniho = new Date(posledniPrijem.datum).toLocaleDateString('cs-CZ');
      const castkaPosledniho = posledniPrijem.castka.toLocaleString('cs-CZ');

      Alert.alert(
        'Smazat poslední příjem?',
        `Datum: ${datumPosledniho}\nČástka: ${castkaPosledniho} Kč\nKategorie: ${posledniPrijem.kategorie}`,
        [
          { text: 'Zrušit', style: 'cancel' },
          {
            text: 'Smazat',
            style: 'destructive',
            onPress: async () => {
              try {
                if (posledniPrijem.firestoreId) {
                  await FirestoreService.smazPrijem(posledniPrijem.firestoreId);
                  // Real-time listener automaticky aktualizuje UI
                  Alert.alert('Úspěch', 'Poslední příjem byl odstraněn');
                } else {
                  Alert.alert('Chyba', 'Záznam nemá Firestore ID');
                }
              } catch (error) {
                console.error('Chyba při mazání příjmu:', error);
                Alert.alert('Chyba', 'Nepodařilo se odstranit příjem');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Chyba při načítání příjmů:', error);
      Alert.alert('Chyba', 'Nepodařilo se načíst příjmy');
    }
  }, [vsechnyPrijmy]);

  const formatujDatum = useCallback((date: Date): string => {
    return date.toLocaleDateString('cs-CZ');
  }, []);

  // Placeholder pro nactiRocniPrijem - zachováno pro kompatibilitu
  const nactiRocniPrijem = useCallback(async () => {
    // Real-time listener automaticky načítá data
    // Tato funkce je pouze pro kompatibilitu
  }, []);

  return {
    state,
    prijmyHandlers: {
      handleCastkaChange: prijmyHandleCastkaChange,
      handleDatumChange: prijmyHandleDatumChange,
      handleSubmit: prijmyHandleSubmit,
      handleSubmitWithData: prijmyHandleSubmitWithData,
      handleDatePickerVisibilityChange: prijmyHandleDatePickerVisibilityChange,
      handleKategorieChange: prijmyHandleKategorieChange,
      handlePopisChange: prijmyHandlePopisChange,
      smazatPosledniPrijem: smazatPosledniPrijem,
    },
    utils: {
      formatujDatum,
      nactiRocniPrijem,
    },
  };
};
