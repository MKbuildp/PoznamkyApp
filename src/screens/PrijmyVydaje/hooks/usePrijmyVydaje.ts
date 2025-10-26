import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrijmyVydajeState, UsePrijmyVydajeReturn, Prijem } from '../types/types';
import { KategoriePrijmu } from '../../ObchodPrehledScreen/types/types';
import { FirestoreService, FIRESTORE_COLLECTIONS } from '../../../services/firestoreService';

const PRIJMY_STORAGE_KEY = 'seznamPrijmuData_v2';

/**
 * @description Hook pro správu logiky obrazovky Koloniál (původně Příjmy)
 * 
 * POZNÁMKA: Tento hook slouží pro tab "Koloniál" v aplikaci
 * Původní název byl "Příjmy", ale uživatel ji označuje jako "Koloniál"
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

  // Stav pro jiné příjmy
  const [jinePrijmy, setJinePrijmy] = useState<Prijem[]>([]);

  // Načtení a výpočet roční částky příjmů
  const nactiRocniPrijem = useCallback(async () => {
    try {
      const existujiciPrijmyString = await AsyncStorage.getItem(PRIJMY_STORAGE_KEY);
      
      if (existujiciPrijmyString) {
        const existujiciPrijmy: Prijem[] = JSON.parse(existujiciPrijmyString);
        const aktuálníRok = state.prijmy.vybranyRok;
        
        const prijmyZRoku = existujiciPrijmy.filter(prijem => {
          const rokPrijmu = new Date(prijem.datum).getFullYear();
          return rokPrijmu === aktuálníRok;
        });
        
        const celkovyPrijem = prijmyZRoku.reduce((suma, prijem) => suma + prijem.castka, 0);
        
        setState(prev => ({
          ...prev,
          prijmy: {
            ...prev.prijmy,
            rocniPrijem: celkovyPrijem
          }
        }));
      }
    } catch (error) {
      console.error('Chyba při načítání ročního příjmu:', error);
    }
  }, [state.prijmy.vybranyRok]);

  // Načtení jiných příjmů
  const nactiJinePrijmy = useCallback(async () => {
    try {
      const existujiciPrijmyString = await AsyncStorage.getItem(PRIJMY_STORAGE_KEY);
      
      if (existujiciPrijmyString) {
        const existujiciPrijmy: Prijem[] = JSON.parse(existujiciPrijmyString);
        
        // Filtrujeme pouze "Jiné" příjmy z aktuálního roku
        const jinePrijmyZRoku = existujiciPrijmy.filter(prijem => {
          const rokPrijmu = new Date(prijem.datum).getFullYear();
          return rokPrijmu === state.prijmy.vybranyRok && prijem.kategorie === KategoriePrijmu.JINE;
        });
        
        // Seřadíme podle data od nejnovějšího
        const serazeneJinePrijmy = jinePrijmyZRoku.sort((a, b) => 
          new Date(b.datum).getTime() - new Date(a.datum).getTime()
        );
        
        setJinePrijmy(serazeneJinePrijmy);
      } else {
        setJinePrijmy([]);
      }
    } catch (error) {
      console.error('Chyba při načítání jiných příjmů:', error);
      setJinePrijmy([]);
    }
  }, [state.prijmy.vybranyRok]);

  // Načtení dat při prvním renderu a při změně roku
  useEffect(() => {
    nactiRocniPrijem();
    nactiJinePrijmy();
  }, [nactiRocniPrijem, nactiJinePrijmy]);

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
      const novyPrijem: Prijem = {
        id: Date.now().toString(),
        castka: parseFloat(state.prijmy.castka),
        datum: state.prijmy.datum.toISOString(),
        kategorie: state.prijmy.kategorie,
        popis: state.prijmy.kategorie === KategoriePrijmu.JINE ? state.prijmy.popis : undefined,
      };

      // Uložení do AsyncStorage (lokální úložiště)
      const existujiciData = await AsyncStorage.getItem(PRIJMY_STORAGE_KEY);
      const prijmyData = existujiciData ? JSON.parse(existujiciData) : [];
      
      prijmyData.push(novyPrijem);
      await AsyncStorage.setItem(PRIJMY_STORAGE_KEY, JSON.stringify(prijmyData));

      // Uložení do Firestore (cloud synchronizace)
      try {
        const firestoreData = {
          castka: novyPrijem.castka,
          datum: novyPrijem.datum,
          kategorie: novyPrijem.kategorie,
          popis: novyPrijem.popis || ''
        };
        
        const firestoreId = await FirestoreService.ulozPrijem(firestoreData);
        
        // Označení jako synchronizované v AsyncStorage
        novyPrijem.firestoreId = firestoreId;
        const aktualizovanaPrijmyData = prijmyData.map(p => 
          p.id === novyPrijem.id ? { ...p, firestoreId } : p
        );
        await AsyncStorage.setItem(PRIJMY_STORAGE_KEY, JSON.stringify(aktualizovanaPrijmyData));
      } catch (firestoreError) {
        console.error('Chyba při ukládání do Firestore:', firestoreError);
        // Data zůstávají v AsyncStorage i při chybě Firestore
        Alert.alert('Upozornění', 'Data uložena lokálně, ale nepodařilo se synchronizovat s cloudem');
      }

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
      await nactiRocniPrijem();
      await nactiJinePrijmy();
    } catch (error) {
      console.error('PRIJMY VYDAJE ERROR: Chyba při ukládání příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit příjem');
      setState(prev => ({ 
        ...prev, 
        prijmy: { ...prev.prijmy, isLoading: false }
      }));
    }
  }, [state.prijmy.castka, state.prijmy.datum, state.prijmy.kategorie, state.prijmy.popis, nactiRocniPrijem, nactiJinePrijmy]);

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
      const novyPrijem: Prijem = {
        id: Date.now().toString(),
        castka: parseFloat(data.castka),
        datum: data.datum.toISOString(),
        kategorie: data.kategorie,
        popis: data.kategorie === KategoriePrijmu.JINE ? data.popis : undefined,
      };

      // Uložení do AsyncStorage (lokální úložiště)
      const existujiciData = await AsyncStorage.getItem(PRIJMY_STORAGE_KEY);
      const prijmyData = existujiciData ? JSON.parse(existujiciData) : [];
      
      prijmyData.push(novyPrijem);
      await AsyncStorage.setItem(PRIJMY_STORAGE_KEY, JSON.stringify(prijmyData));

      // Uložení do Firestore (cloud synchronizace)
      try {
        const firestoreData = {
          castka: novyPrijem.castka,
          datum: novyPrijem.datum,
          kategorie: novyPrijem.kategorie,
          popis: novyPrijem.popis || ''
        };
        
        const firestoreId = await FirestoreService.ulozPrijem(firestoreData);
        
        // Označení jako synchronizované v AsyncStorage
        novyPrijem.firestoreId = firestoreId;
        const aktualizovanaData = prijmyData.map((p: any) => 
          p.id === novyPrijem.id ? { ...p, firestoreId } : p
        );
        await AsyncStorage.setItem(PRIJMY_STORAGE_KEY, JSON.stringify(aktualizovanaData));
      } catch (firestoreError) {
        console.error('Chyba při ukládání do Firestore:', firestoreError);
        // Data zůstávají v AsyncStorage i při chybě Firestore
        Alert.alert('Upozornění', 'Data uložena lokálně, ale nepodařilo se synchronizovat s cloudem');
      }

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
      await nactiRocniPrijem();
      await nactiJinePrijmy();
    } catch (error) {
      console.error('PRIJMY VYDAJE ERROR: Chyba při ukládání příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit příjem');
      setState(prev => ({ 
        ...prev, 
        prijmy: { ...prev.prijmy, isLoading: false }
      }));
    }
  }, [nactiRocniPrijem, nactiJinePrijmy]);

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
      const existujiciData = await AsyncStorage.getItem(PRIJMY_STORAGE_KEY);
      if (!existujiciData) {
        Alert.alert('Info', 'Žádné příjmy k odstranění');
        return;
      }

      const prijmyData: Prijem[] = JSON.parse(existujiciData);
      if (prijmyData.length === 0) {
        Alert.alert('Info', 'Žádné příjmy k odstranění');
        return;
      }

      // Seřadíme podle data a vezmeme poslední (nejnovější) záznam
      const serazeneData = [...prijmyData].sort((a, b) => 
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
                // Odstraníme poslední záznam z AsyncStorage
                const aktualizovanaData = prijmyData.filter(p => p.id !== posledniPrijem.id);
                await AsyncStorage.setItem(PRIJMY_STORAGE_KEY, JSON.stringify(aktualizovanaData));
                
                // Odstraníme také z Firebase, pokud má firestoreId
                if (posledniPrijem.firestoreId) {
                  try {
                    await FirestoreService.smazDokument(FIRESTORE_COLLECTIONS.PRIJMY, posledniPrijem.firestoreId);
                  } catch (firebaseError) {
                    console.error('Chyba při mazání z Firebase:', firebaseError);
                    // Pokračujeme i při chybě Firebase
                  }
                }
                
                Alert.alert('Úspěch', 'Poslední příjem byl odstraněn');
                await nactiRocniPrijem();
                await nactiJinePrijmy();
                
                // Explicitní aktualizace příjmů pro UI
                const aktualizovanePrijmy = await AsyncStorage.getItem(PRIJMY_STORAGE_KEY);
                if (aktualizovanePrijmy) {
                  const prijmy: Prijem[] = JSON.parse(aktualizovanePrijmy);
                  const rocniPrijmy = prijmy.filter(p => {
                    const datumPrijmu = new Date(p.datum);
                    return datumPrijmu.getFullYear() === state.prijmy.vybranyRok;
                  });
                  setJinePrijmy(rocniPrijmy);
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
  }, [nactiRocniPrijem, nactiJinePrijmy]);

  const formatujDatum = useCallback((date: Date): string => {
    return date.toLocaleDateString('cs-CZ');
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