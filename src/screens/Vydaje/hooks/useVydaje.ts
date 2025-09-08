import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VydajeState, UseVydajeReturn, Vydaj, KategorieVydaju } from '../types/types';
import { FirestoreService } from '../../../services/firestoreService';

const STORAGE_KEY = 'seznamVydajuData_v1';
const DODAVATELE_STORAGE_KEY = 'seznamDodavateluData_v1';

/**
 * @description Hook pro správu logiky výdajů s hybridním ukládáním (AsyncStorage + Firestore)
 */
export const useVydaje = (): UseVydajeReturn => {
  const [state, setState] = useState<VydajeState>({
    castka: '',
    datum: new Date(),
    kategorie: KategorieVydaju.ZBOZI,
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

  const handleDatePickerVisibilityChange = useCallback((isVisible: boolean) => {
    setState(prev => ({ ...prev, isDatePickerVisible: isVisible }));
  }, []);

  const formatujDatum = useCallback((date: Date): string => {
    return date.toLocaleDateString('cs-CZ');
  }, []);

  return {
    state,
    handlers: {
      handleCastkaChange,
      handleDatumChange,
      handleKategorieChange,
      handleDodavatelChange,
      handleDodavatelSelect,
      handleSubmit,
      handleDatePickerVisibilityChange,
    },
    utils: {
      formatujDatum,
      nactiRocniVydaje,
    },
  };
}; 