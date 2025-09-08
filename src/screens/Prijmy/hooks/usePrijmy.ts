import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrijmyState, UsePrijmyReturn, Prijem } from '../types/types';
import { KategoriePrijmu } from '../../ObchodPrehledScreen/types/types';
import { FirestoreService } from '../../../services/firestoreService';

const STORAGE_KEY = 'seznamPrijmuData_v2';

/**
 * @description Hook pro správu logiky příjmů s hybridním ukládáním (AsyncStorage + Firestore)
 */
export const usePrijmy = (): UsePrijmyReturn => {
  const [state, setState] = useState<PrijmyState>({
    castka: '',
    datum: new Date(),
    vybranyRok: new Date().getFullYear(),
    isDatePickerVisible: false,
    isLoading: false,
    rocniPrijem: 0,
  });

  // Načtení a výpočet roční částky
  const nactiRocniPrijem = useCallback(async () => {
    try {
      const existujiciPrijmyString = await AsyncStorage.getItem(STORAGE_KEY);
      if (existujiciPrijmyString) {
        const existujiciPrijmy: Prijem[] = JSON.parse(existujiciPrijmyString);
        
        // Filtrování příjmů pro aktuální rok
        const rocniPrijmy = existujiciPrijmy.filter(prijem => {
          const datum = new Date(prijem.datum);
          return datum.getFullYear() === new Date().getFullYear();
        });

        // Výpočet celkové částky pro aktuální rok
        const celkovaCastka = rocniPrijmy.reduce((sum, prijem) => sum + prijem.castka, 0);
        setState(prev => ({ ...prev, rocniPrijem: celkovaCastka }));
      }
    } catch (error) {
      console.error('Chyba při načítání roční částky:', error);
    }
  }, []);

  useEffect(() => {
    nactiRocniPrijem();
  }, [nactiRocniPrijem]);

  // Automatická aktualizace při návratu na obrazovku
  useFocusEffect(
    useCallback(() => {
      nactiRocniPrijem();
    }, [nactiRocniPrijem])
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
    // Ošetření neplatného data
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Neplatné datum:', date);
      Alert.alert('Chyba', 'Prosím vyberte platné datum');
      return;
    }
    
    // Nastavení času na půlnoc pro konzistentní ukládání
    const upraveneDatum = new Date(date);
    upraveneDatum.setHours(0, 0, 0, 0);
    
    setState(prev => ({ 
      ...prev, 
      datum: upraveneDatum, 
      isDatePickerVisible: false 
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!state.castka || isNaN(parseFloat(state.castka))) {
      Alert.alert('Chyba', 'Prosím zadejte platnou částku');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const novyPrijem: Prijem = {
        id: Date.now().toString(),
        castka: parseFloat(state.castka),
        datum: state.datum.toISOString(),
        kategorie: KategoriePrijmu.TRZBA,
      };

      // Uložení do AsyncStorage (lokální úložiště)
      const existujiciPrijmyString = await AsyncStorage.getItem(STORAGE_KEY);
      const existujiciPrijmy: Prijem[] = existujiciPrijmyString 
        ? JSON.parse(existujiciPrijmyString) 
        : [];

      const novePrijmy = [...existujiciPrijmy, novyPrijem];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novePrijmy));

      // Uložení do Firestore (cloud synchronizace)
      try {
        const firestoreData = {
          castka: novyPrijem.castka,
          datum: novyPrijem.datum,
          kategorie: novyPrijem.kategorie,
          popis: ''
        };
        
        const firestoreId = await FirestoreService.ulozPrijem(firestoreData);
        
        // Označení jako synchronizované v AsyncStorage
        novyPrijem.firestoreId = firestoreId;
        const aktualizovanePrijmy = [...existujiciPrijmy, novyPrijem];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(aktualizovanePrijmy));
      } catch (firestoreError) {
        console.error('PRIJMY ERROR: Chyba při ukládání do Firestore:', firestoreError);
        console.error('PRIJMY ERROR: Full error object:', JSON.stringify(firestoreError, null, 2));
        // Data zůstávají v AsyncStorage i při chybě Firestore
        Alert.alert('Upozornění', 'Data uložena lokálně, ale nepodařilo se synchronizovat s cloudem');
      }

      setState(prev => ({
        ...prev,
        castka: '',
        datum: new Date(),
        isLoading: false,
      }));

      // Okamžitá aktualizace UI - přepočítání ročního příjmu
      const aktualizovanePrijmy = [...existujiciPrijmy, novyPrijem];
      const rocniPrijmy = aktualizovanePrijmy.filter(prijem => {
        const datum = new Date(prijem.datum);
        return datum.getFullYear() === new Date().getFullYear();
      });
      const celkovaCastka = rocniPrijmy.reduce((sum, prijem) => sum + prijem.castka, 0);
      setState(prev => ({ ...prev, rocniPrijem: celkovaCastka }));
      
      Alert.alert('Úspěch', 'Příjem byl úspěšně uložen');
    } catch (error) {
      console.error('Chyba při ukládání příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit příjem');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.castka, state.datum, nactiRocniPrijem]);

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
      handleSubmit,
      handleDatePickerVisibilityChange,
    },
    utils: {
      formatujDatum,
      nactiRocniPrijem,
    },
  };
}; 