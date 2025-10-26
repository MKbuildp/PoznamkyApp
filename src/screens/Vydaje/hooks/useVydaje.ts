import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VydajeState, UseVydajeReturn, Vydaj, KategorieVydaju } from '../types/types';
import { FirestoreService, FIRESTORE_COLLECTIONS } from '../../../services/firestoreService';

const STORAGE_KEY = 'seznamVydajuData_v1';
const DODAVATELE_STORAGE_KEY = 'seznamDodavateluData_v1';

/**
 * @description Hook pro správu logiky výdajů s hybridním ukládáním (AsyncStorage + Firestore)
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

  // Načtení seznamu unikátních dodavatelů
  const nactiDodavatele = useCallback(async () => {
    try {
      const ulozeneDodavateleString = await AsyncStorage.getItem(DODAVATELE_STORAGE_KEY);
      if (ulozeneDodavateleString) {
        const ulozeneDodavatele: string[] = JSON.parse(ulozeneDodavateleString);
        // Seznam je již načten, ale neaktualizujeme state, abychom nezpůsobili zbytečný re-render
        // Použijeme tento seznam jen když je potřeba, např. při změně pole dodavatel
      }
    } catch (error) {
      console.error('Chyba při načítání seznamu dodavatelů:', error);
    }
  }, []);

  // Načtení seznamu dodavatelů při inicializaci
  useEffect(() => {
    nactiDodavatele();
  }, [nactiDodavatele]);

  // Načtení a výpočet ročních výdajů
  const nactiRocniVydaje = useCallback(async () => {
    try {
      const existujiciVydajeString = await AsyncStorage.getItem(STORAGE_KEY);
      if (existujiciVydajeString) {
        const existujiciVydaje: Vydaj[] = JSON.parse(existujiciVydajeString);
        
        // Filtrování výdajů pro aktuální rok
        const rocniVydaje = existujiciVydaje.filter(vydaj => {
          const datum = new Date(vydaj.datum);
          return datum.getFullYear() === new Date().getFullYear();
        });

        // Výpočet součtů podle kategorií
        const zbozi = rocniVydaje
          .filter(v => v.kategorie === KategorieVydaju.ZBOZI)
          .reduce((sum, v) => sum + v.castka, 0);
        
        const provoz = rocniVydaje
          .filter(v => v.kategorie === KategorieVydaju.PROVOZ)
          .reduce((sum, v) => sum + v.castka, 0);

        setState(prev => ({
          ...prev,
          rocniVydaje: {
            zbozi,
            provoz,
            celkem: zbozi + provoz,
          },
        }));
      }
    } catch (error) {
      console.error('Chyba při načítání ročních výdajů:', error);
    }
  }, []);

  useEffect(() => {
    nactiRocniVydaje();
  }, [nactiRocniVydaje]);

  // Automatická aktualizace při návratu na obrazovku
  useFocusEffect(
    useCallback(() => {
      nactiRocniVydaje();
    }, [nactiRocniVydaje])
  );

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
        // Načítání existujících dodavatelů pro návrhy
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

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const novyVydaj: Vydaj = {
        id: Date.now().toString(),
        castka: parseFloat(state.castka),
        datum: state.datum.toISOString(),
        kategorie: state.kategorie,
        dodavatel: state.dodavatel.trim(),
      };

      // Uložení do AsyncStorage (lokální úložiště)
      const existujiciVydajeString = await AsyncStorage.getItem(STORAGE_KEY);
      const existujiciVydaje: Vydaj[] = existujiciVydajeString 
        ? JSON.parse(existujiciVydajeString) 
        : [];

      const noveVydaje = [...existujiciVydaje, novyVydaj];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(noveVydaje));

      // Uložení do Firestore (cloud synchronizace)
      try {
        const firestoreData = {
          castka: novyVydaj.castka,
          datum: novyVydaj.datum,
          kategorie: novyVydaj.kategorie,
          dodavatel: novyVydaj.dodavatel
        };
        
        const firestoreId = await FirestoreService.ulozVydaj(firestoreData);
        
        // Označení jako synchronizované v AsyncStorage
        novyVydaj.firestoreId = firestoreId;
        const aktualizovaneVydaje = [...existujiciVydaje, novyVydaj];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(aktualizovaneVydaje));
      } catch (firestoreError) {
        console.error('VYDAJE ERROR: Chyba při ukládání do Firestore:', firestoreError);
        console.error('VYDAJE ERROR: Full error object:', JSON.stringify(firestoreError, null, 2));
        // Data zůstávají v AsyncStorage i při chybě Firestore
        Alert.alert('Upozornění', 'Data uložena lokálně, ale nepodařilo se synchronizovat s cloudem');
      }

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

      // Okamžitá aktualizace UI - přepočítání ročních výdajů
      const aktualizovaneVydaje = [...existujiciVydaje, novyVydaj];
      const rocniVydaje = aktualizovaneVydaje.filter(vydaj => {
        const datum = new Date(vydaj.datum);
        return datum.getFullYear() === new Date().getFullYear();
      });

      const zbozi = rocniVydaje
        .filter(v => v.kategorie === KategorieVydaju.ZBOZI)
        .reduce((sum, v) => sum + v.castka, 0);
      
      const provoz = rocniVydaje
        .filter(v => v.kategorie === KategorieVydaju.PROVOZ)
        .reduce((sum, v) => sum + v.castka, 0);

      setState(prev => ({
        ...prev,
        rocniVydaje: {
          zbozi,
          provoz,
          celkem: zbozi + provoz,
        },
      }));
      
      Alert.alert('Úspěch', 'Výdaj byl úspěšně uložen');
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.castka, state.datum, state.kategorie, state.dodavatel, nactiRocniVydaje, ulozNovehoDodavatele]);

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

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const novyVydaj: Vydaj = {
        id: Date.now().toString(),
        castka: parseFloat(data.castka),
        datum: data.datum.toISOString(),
        kategorie: data.kategorie,
        dodavatel: data.dodavatel.trim(),
      };

      // Uložení do AsyncStorage (lokální úložiště)
      const existujiciVydajeString = await AsyncStorage.getItem(STORAGE_KEY);
      const existujiciVydaje: Vydaj[] = existujiciVydajeString 
        ? JSON.parse(existujiciVydajeString) 
        : [];

      const noveVydaje = [...existujiciVydaje, novyVydaj];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(noveVydaje));

      // Uložení do Firestore (cloud synchronizace)
      try {
        const firestoreData = {
          castka: novyVydaj.castka,
          datum: novyVydaj.datum,
          kategorie: novyVydaj.kategorie,
          dodavatel: novyVydaj.dodavatel
        };
        
        const firestoreId = await FirestoreService.ulozVydaj(firestoreData);
        
        // Označení jako synchronizované v AsyncStorage
        novyVydaj.firestoreId = firestoreId;
        const aktualizovaneVydaje = [...existujiciVydaje, novyVydaj];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(aktualizovaneVydaje));
      } catch (firestoreError) {
        console.error('VYDAJE ERROR: Chyba při ukládání do Firestore:', firestoreError);
        console.error('VYDAJE ERROR: Full error object:', JSON.stringify(firestoreError, null, 2));
        // Data zůstávají v AsyncStorage i při chybě Firestore
        Alert.alert('Upozornění', 'Data uložena lokálně, ale nepodařilo se synchronizovat s cloudem');
      }

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

      // Okamžitá aktualizace UI - přepočítání ročních výdajů
      const aktualizovaneVydaje = [...existujiciVydaje, novyVydaj];
      const rocniVydaje = aktualizovaneVydaje.filter(vydaj => {
        const datum = new Date(vydaj.datum);
        return datum.getFullYear() === new Date().getFullYear();
      });

      const zbozi = rocniVydaje
        .filter(vydaj => vydaj.kategorie === KategorieVydaju.ZBOZI)
        .reduce((sum, vydaj) => sum + vydaj.castka, 0);

      const provoz = rocniVydaje
        .filter(vydaj => vydaj.kategorie === KategorieVydaju.PROVOZ)
        .reduce((sum, vydaj) => sum + vydaj.castka, 0);

      setState(prev => ({
        ...prev,
        rocniVydaje: {
          zbozi,
          provoz,
          celkem: zbozi + provoz,
        },
      }));
      
      Alert.alert('Úspěch', 'Výdaj byl úspěšně uložen');
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [nactiRocniVydaje, ulozNovehoDodavatele]);

  // Funkce pro editaci výdaje
  const editovatVydaj = useCallback(async (editedVydaj: Vydaj) => {
    try {
      const existujiciData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existujiciData) {
        throw new Error('Žádné výdaje k editaci');
      }

      const vydajeData: Vydaj[] = JSON.parse(existujiciData);
      const vydajIndex = vydajeData.findIndex(v => v.id === editedVydaj.id);
      
      if (vydajIndex === -1) {
        throw new Error('Výdaj nebyl nalezen');
      }

      // Aktualizace v AsyncStorage
      vydajeData[vydajIndex] = editedVydaj;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(vydajeData));

      // Aktualizace v Firestore, pokud má firestoreId
      if (editedVydaj.firestoreId) {
        try {
          const firestoreData = {
            castka: editedVydaj.castka,
            datum: editedVydaj.datum,
            kategorie: editedVydaj.kategorie,
            dodavatel: editedVydaj.dodavatel
          };
          
          await FirestoreService.aktualizujVydaj(editedVydaj.firestoreId, firestoreData);
        } catch (firestoreError) {
          console.error('Chyba při aktualizaci v Firestore:', firestoreError);
          // Pokračujeme i při chybě Firestore
        }
      }

      // Aktualizace ročních výdajů
      await nactiRocniVydaje();
      
      Alert.alert('Úspěch', 'Výdaj byl úspěšně upraven');
    } catch (error) {
      console.error('Chyba při editaci výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se upravit výdaj');
      throw error;
    }
  }, [nactiRocniVydaje]);

  // Funkce pro smazání výdaje
  const smazatVydaj = useCallback(async (vydaj: Vydaj) => {
    try {
      const existujiciData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existujiciData) {
        throw new Error('Žádné výdaje k smazání');
      }

      const vydajeData: Vydaj[] = JSON.parse(existujiciData);
      const aktualizovanaData = vydajeData.filter(v => v.id !== vydaj.id);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(aktualizovanaData));

      // Smazání z Firestore, pokud má firestoreId
      if (vydaj.firestoreId) {
        try {
          await FirestoreService.smazDokument(FIRESTORE_COLLECTIONS.VYDAJE, vydaj.firestoreId);
        } catch (firestoreError) {
          console.error('Chyba při mazání z Firestore:', firestoreError);
          // Pokračujeme i při chybě Firestore
        }
      }

      // Aktualizace ročních výdajů
      await nactiRocniVydaje();
      
      Alert.alert('Úspěch', 'Výdaj byl úspěšně smazán');
    } catch (error) {
      console.error('Chyba při mazání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se smazat výdaj');
      throw error;
    }
  }, [nactiRocniVydaje]);

  const handleDatePickerVisibilityChange = useCallback((isVisible: boolean) => {
    setState(prev => ({ ...prev, isDatePickerVisible: isVisible }));
  }, []);

  const formatujDatum = useCallback((date: Date): string => {
    return date.toLocaleDateString('cs-CZ');
  }, []);

  const smazatPosledniVydaj = useCallback(async () => {
    try {
      const existujiciData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existujiciData) {
        Alert.alert('Info', 'Žádné výdaje k odstranění');
        return;
      }

      const vydajeData: Vydaj[] = JSON.parse(existujiciData);
      if (vydajeData.length === 0) {
        Alert.alert('Info', 'Žádné výdaje k odstranění');
        return;
      }

      // Seřadíme podle data a vezmeme poslední (nejnovější) záznam
      const serazeneData = [...vydajeData].sort((a, b) => 
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
                // Odstraníme poslední záznam z AsyncStorage
                const aktualizovanaData = vydajeData.filter(v => v.id !== posledniVydaj.id);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(aktualizovanaData));
                
                // Odstraníme také z Firebase, pokud má firestoreId
                if (posledniVydaj.firestoreId) {
                  try {
                    await FirestoreService.smazDokument('vydaje', posledniVydaj.firestoreId);
                  } catch (firebaseError) {
                    console.error('Chyba při mazání z Firebase:', firebaseError);
                    // Pokračujeme i při chybě Firebase
                  }
                }
                
                Alert.alert('Úspěch', 'Poslední výdaj byl odstraněn');
                await nactiRocniVydaje();
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
  }, [nactiRocniVydaje]);

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