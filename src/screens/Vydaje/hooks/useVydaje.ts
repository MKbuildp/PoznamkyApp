import { useState, useCallback, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFirestoreRealtime } from '../../../hooks/useFirestoreRealtime';
import { FirestoreService, FIRESTORE_COLLECTIONS, FirestoreVydaj } from '../../../services/firestoreService';
import { VydajeState, UseVydajeReturn, Vydaj, KategorieVydaju } from '../types/types';

const DODAVATELE_STORAGE_KEY = 'seznamDodavateluData_v1'; // Pouze pro návrhy dodavatelů

/**
 * @description Transformace Firestore dat na lokální typ
 */
const transformVydaj = (doc: any): Vydaj => {
  return {
    id: doc.id,
    castka: doc.castka,
    datum: doc.datum, // ISO string z Firestore
    kategorie: doc.kategorie as KategorieVydaju,
    dodavatel: doc.dodavatel,
    firestoreId: doc.id
  };
};

/**
 * @description Hook pro správu logiky výdajů s real-time Firebase synchronizací
 */
export const useVydaje = (): UseVydajeReturn => {
  const [state, setState] = useState<VydajeState>({
    castka: '',
    datum: new Date(),
    kategorie: undefined as any,
    dodavatel: '',
    vybranyRok: new Date().getFullYear(),
    isDatePickerVisible: false,
    isLoading: false,
    navrhovaniDodavateleViditelne: false,
    navrhyDodavatelu: [],
    rocniVydaje: {
      zbozi: 0,
      provoz: 0,
      celkem: 0,
    },
  });

  // Real-time synchronizace výdajů z Firestore
  const { 
    data: firestoreVydaje, 
    loading: nacitaSe, 
    error: firestoreError 
  } = useFirestoreRealtime<FirestoreVydaj>({
    collectionName: FIRESTORE_COLLECTIONS.VYDAJE,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: transformVydaj
  });

  // Transformace na lokální typy
  const vsechnyVydaje: Vydaj[] = useMemo(() => {
    return firestoreVydaje.map(v => ({
      id: v.id || '',
      castka: v.castka,
      datum: v.datum,
      kategorie: v.kategorie as KategorieVydaju,
      dodavatel: v.dodavatel,
      firestoreId: v.id
    }));
  }, [firestoreVydaje]);

  // Výpočet ročních výdajů
  const rocniVydaje = useMemo(() => {
    const aktualniRok = new Date().getFullYear();
    const rocniVydaje = vsechnyVydaje.filter(vydaj => {
      const datum = new Date(vydaj.datum);
      return datum.getFullYear() === aktualniRok;
    });

    const zbozi = rocniVydaje
      .filter(v => v.kategorie === KategorieVydaju.ZBOZI)
      .reduce((sum, v) => sum + v.castka, 0);
    
    const provoz = rocniVydaje
      .filter(v => v.kategorie === KategorieVydaju.PROVOZ)
      .reduce((sum, v) => sum + v.castka, 0);

    return {
      zbozi,
      provoz,
      celkem: zbozi + provoz,
    };
  }, [vsechnyVydaje]);

  // Aktualizace ročních výdajů ve state
  useMemo(() => {
    setState(prev => ({
      ...prev,
      rocniVydaje
    }));
  }, [rocniVydaje]);

  // Error handling
  if (firestoreError) {
    console.error('Firestore error v useVydaje:', firestoreError);
  }

  // Načtení seznamu unikátních dodavatelů z Firestore pro návrhy
  const nactiDodavatele = useCallback(async () => {
    try {
      // Získáme unikátní dodavatele z aktuálních výdajů
      const unikatniDodavatele = Array.from(new Set(vsechnyVydaje.map(v => v.dodavatel)));
      
      // Uložíme do AsyncStorage pro rychlý přístup při návrzích
      await AsyncStorage.setItem(DODAVATELE_STORAGE_KEY, JSON.stringify(unikatniDodavatele));
    } catch (error) {
      console.error('Chyba při ukládání seznamu dodavatelů:', error);
    }
  }, [vsechnyVydaje]);

  // Aktualizace seznamu dodavatelů při změně výdajů
  useEffect(() => {
    nactiDodavatele();
  }, [nactiDodavatele]);

  const handleCastkaChange = useCallback((text: string) => {
    const cistyText = text.replace(/[^0-9.]/g, '');
    const parts = cistyText.split('.');
    if (parts.length > 2) {
      return;
    }
    setState(prev => ({ ...prev, castka: cistyText }));
  }, []);

  const handleDatumChange = useCallback((date: Date) => {
    setState(prev => ({ ...prev, datum: date, isDatePickerVisible: false }));
  }, []);

  const handleKategorieChange = useCallback((kategorie: KategorieVydaju) => {
    setState(prev => ({ ...prev, kategorie }));
  }, []);

  // Funkce pro zpracování změny textu v poli dodavatel
  const handleDodavatelChange = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, dodavatel: text }));
    
    if (text.trim().length >= 2) {
      try {
        // Načítání existujících dodavatelů pro návrhy z AsyncStorage
        const ulozeneDodavateleString = await AsyncStorage.getItem(DODAVATELE_STORAGE_KEY);
        if (ulozeneDodavateleString) {
          const ulozeneDodavatele: string[] = JSON.parse(ulozeneDodavateleString);
          
          // Filtrujeme dodavatele podle zadaného textu (bez ohledu na velká/malá písmena)
          const filtrovaniDodavatele = ulozeneDodavatele.filter(
            dodavatel => dodavatel.toLowerCase().includes(text.toLowerCase())
          );
          
          setState(prev => ({ 
            ...prev, 
            navrhyDodavatelu: filtrovaniDodavatele,
            navrhovaniDodavateleViditelne: filtrovaniDodavatele.length > 0
          }));
        }
      } catch (error) {
        console.error('Chyba při načítání návrhů dodavatelů:', error);
      }
    } else {
      // Pokud je vstup příliš krátký, skryjeme návrhy
      setState(prev => ({ 
        ...prev, 
        navrhovaniDodavateleViditelne: false 
      }));
    }
  }, []);

  // Funkce pro výběr dodavatele z návrhů
  const handleDodavatelSelect = useCallback((dodavatel: string) => {
    setState(prev => ({ 
      ...prev, 
      dodavatel: dodavatel,
      navrhovaniDodavateleViditelne: false 
    }));
  }, []);

  // Funkce pro uložení nového dodavatele do seznamu
  const ulozNovehoDodavatele = useCallback(async (dodavatel: string) => {
    if (!dodavatel.trim()) return;
    
    try {
      const ulozeneDodavateleString = await AsyncStorage.getItem(DODAVATELE_STORAGE_KEY);
      let ulozeneDodavatele: string[] = ulozeneDodavateleString 
        ? JSON.parse(ulozeneDodavateleString) 
        : [];
      
      // Přidáme dodavatele pouze pokud už v seznamu není
      if (!ulozeneDodavatele.includes(dodavatel)) {
        ulozeneDodavatele.push(dodavatel);
        await AsyncStorage.setItem(DODAVATELE_STORAGE_KEY, JSON.stringify(ulozeneDodavatele));
      }
    } catch (error) {
      console.error('Chyba při ukládání nového dodavatele:', error);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!state.castka || isNaN(parseFloat(state.castka))) {
      Alert.alert('Chyba', 'Prosím zadejte platnou částku');
      return;
    }

    if (!state.dodavatel.trim()) {
      Alert.alert('Chyba', 'Prosím zadejte dodavatele');
      return;
    }

    if (!state.kategorie) {
      Alert.alert('Chyba', 'Prosím vyberte kategorii');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
      await FirestoreService.ulozVydaj({
        castka: parseFloat(state.castka),
        datum: state.datum.toISOString(),
        kategorie: state.kategorie,
        dodavatel: state.dodavatel.trim()
      });

      // Uložíme dodavatele do seznamu pro budoucí návrhy
      await ulozNovehoDodavatele(state.dodavatel.trim());

      setState(prev => ({
        ...prev,
        castka: '',
        dodavatel: '',
        datum: new Date(),
        kategorie: undefined as any,
        isLoading: false,
      }));
      
      Alert.alert('Úspěch', 'Výdaj byl úspěšně uložen');
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.castka, state.datum, state.kategorie, state.dodavatel, ulozNovehoDodavatele]);

  /**
   * @description Handler pro uložení nového výdaje s daty z modálního okna
   */
  const handleSubmitWithData = useCallback(async (data: any) => {
    if (!data.castka || isNaN(parseFloat(data.castka))) {
      Alert.alert('Chyba', 'Prosím zadejte platnou částku');
      return;
    }

    if (!data.dodavatel?.trim()) {
      Alert.alert('Chyba', 'Prosím zadejte dodavatele');
      return;
    }

    if (!data.kategorie) {
      Alert.alert('Chyba', 'Prosím vyberte kategorii');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
      await FirestoreService.ulozVydaj({
        castka: parseFloat(data.castka),
        datum: data.datum.toISOString(),
        kategorie: data.kategorie,
        dodavatel: data.dodavatel.trim()
      });

      // Uložíme dodavatele do seznamu pro budoucí návrhy
      await ulozNovehoDodavatele(data.dodavatel.trim());

      setState(prev => ({
        ...prev,
        castka: '',
        dodavatel: '',
        datum: new Date(),
        kategorie: undefined as any,
        isLoading: false,
      }));
      
      Alert.alert('Úspěch', 'Výdaj byl úspěšně uložen');
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [ulozNovehoDodavatele]);

  // Funkce pro editaci výdaje
  const editovatVydaj = useCallback(async (editedVydaj: Vydaj) => {
    if (!editedVydaj.firestoreId) {
      Alert.alert('Chyba', 'Záznam nemá Firestore ID');
      return;
    }

    try {
      await FirestoreService.aktualizujVydaj(editedVydaj.firestoreId, {
        castka: editedVydaj.castka,
        datum: editedVydaj.datum,
        kategorie: editedVydaj.kategorie,
        dodavatel: editedVydaj.dodavatel
      });
      // Real-time listener automaticky aktualizuje UI
      Alert.alert('Úspěch', 'Výdaj byl úspěšně upraven');
    } catch (error) {
      console.error('Chyba při editaci výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se upravit výdaj');
      throw error;
    }
  }, []);

  // Funkce pro smazání výdaje
  const smazatVydaj = useCallback(async (vydaj: Vydaj) => {
    if (!vydaj.firestoreId) {
      Alert.alert('Chyba', 'Záznam nemá Firestore ID');
      return;
    }

    try {
      await FirestoreService.smazVydaj(vydaj.firestoreId);
      // Real-time listener automaticky aktualizuje UI
      Alert.alert('Úspěch', 'Výdaj byl úspěšně smazán');
    } catch (error) {
      console.error('Chyba při mazání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se smazat výdaj');
      throw error;
    }
  }, []);

  const handleDatePickerVisibilityChange = useCallback((isVisible: boolean) => {
    setState(prev => ({ ...prev, isDatePickerVisible: isVisible }));
  }, []);

  const formatujDatum = useCallback((date: Date): string => {
    return date.toLocaleDateString('cs-CZ');
  }, []);

  const smazatPosledniVydaj = useCallback(async () => {
    try {
      if (vsechnyVydaje.length === 0) {
        Alert.alert('Info', 'Žádné výdaje k odstranění');
        return;
      }

      // Seřadíme podle data a vezmeme poslední (nejnovější) záznam
      const serazeneData = [...vsechnyVydaje].sort((a, b) => 
        new Date(b.datum).getTime() - new Date(a.datum).getTime()
      );
      
      const posledniVydaj = serazeneData[0];
      const datumPosledniho = new Date(posledniVydaj.datum).toLocaleDateString('cs-CZ');
      const castkaPosledniho = posledniVydaj.castka.toLocaleString('cs-CZ');

      Alert.alert(
        'Smazat poslední výdaj?',
        `Datum: ${datumPosledniho}\nČástka: ${castkaPosledniho} Kč\nKategorie: ${posledniVydaj.kategorie}\nDodavatel: ${posledniVydaj.dodavatel}`,
        [
          { text: 'Zrušit', style: 'cancel' },
          {
            text: 'Smazat',
            style: 'destructive',
            onPress: async () => {
              try {
                if (posledniVydaj.firestoreId) {
                  await FirestoreService.smazVydaj(posledniVydaj.firestoreId);
                  // Real-time listener automaticky aktualizuje UI
                  Alert.alert('Úspěch', 'Poslední výdaj byl odstraněn');
                } else {
                  Alert.alert('Chyba', 'Záznam nemá Firestore ID');
                }
              } catch (error) {
                console.error('Chyba při mazání výdaje:', error);
                Alert.alert('Chyba', 'Nepodařilo se odstranit výdaj');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Chyba při načítání výdajů:', error);
      Alert.alert('Chyba', 'Nepodařilo se načíst výdaje');
    }
  }, [vsechnyVydaje]);

  // Placeholder pro nactiRocniVydaje - zachováno pro kompatibilitu
  const nactiRocniVydaje = useCallback(async () => {
    // Real-time listener automaticky načítá data
    // Tato funkce je pouze pro kompatibilitu
  }, []);

  // Automatická aktualizace při návratu na obrazovku - placeholder
  useFocusEffect(
    useCallback(() => {
      // Real-time listener automaticky aktualizuje data
      // Tato funkce je pouze pro kompatibilitu
    }, [])
  );

  return {
    state,
    handlers: {
      handleCastkaChange,
      handleDatumChange,
      handleKategorieChange,
      handleDodavatelChange,
      handleDodavatelSelect,
      handleSubmit,
      handleSubmitWithData,
      handleDatePickerVisibilityChange,
      smazatPosledniVydaj,
      editovatVydaj,
      smazatVydaj,
    },
    utils: {
      formatujDatum,
      nactiRocniVydaje,
    },
  };
};
