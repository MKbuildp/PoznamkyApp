/**
 * @description Rozšířená verze usePrijmyVydaje hooku s Firebase integrací
 * Zachovává všechnu původní funkcionalitu + přidává online synchronizaci
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrijmyVydajeState, UsePrijmyVydajeReturn, Prijem } from '../types/types';
import { KategoriePrijmu } from '../../ObchodPrehledScreen/types/types';
import { syncService } from '../../../services/storage/syncService';
import { useFirebaseConnection } from '../../../services/hooks/useFirebaseConnection';

const PRIJMY_STORAGE_KEY = 'seznamPrijmuData_v2';

/**
 * @description Rozšířený interface pro Firebase funkcionalitu
 */
export interface UsePrijmyVydajeFirebaseReturn extends UsePrijmyVydajeReturn {
  // Firebase stav
  firebase: {
    isOnline: boolean;
    isSyncing: boolean;
    syncError: string | null;
    lastSyncAt: Date | null;
    canSync: boolean;
  };
  
  // Firebase akce
  firebaseActions: {
    manualniSynchronizace: () => Promise<void>;
    getStatistikySynchronizace: () => Promise<any>;
  };
}

/**
 * @description Hook pro správu logiky obrazovky příjmů s Firebase integrací
 */
export const usePrijmyVydajeFirebase = (): UsePrijmyVydajeFirebaseReturn => {
  const [state, setState] = useState<PrijmyVydajeState>({
    prijmy: {
      castka: '',
      datum: new Date(),
      kategorie: KategoriePrijmu.TRZBA,
      popis: '',
      vybranyRok: new Date().getFullYear(),
      isDatePickerVisible: false,
      isLoading: false,
      rocniPrijem: 0,
    },
  });

  // Firebase connection hook
  const {
    isOnline,
    isSyncing,
    syncError,
    lastSyncAt,
    canSync,
    synchronizujData,
    getStatistiky
  } = useFirebaseConnection();

  // Stav pro jiné příjmy
  const [jinePrijmy, setJinePrijmy] = useState<Prijem[]>([]);

  // FIREBASE INTEGRACE: Načtení roční částky přes syncService
  const nactiRocniPrijem = useCallback(async () => {
    try {
      // Používáme syncService místo AsyncStorage
      const existujiciPrijmy = await syncService.nactiLokalnDataProUI('prijmy');
      const aktuálníRok = state.prijmy.vybranyRok;
      
      const prijmyZRoku = existujiciPrijmy.filter((prijem: any) => {
        const rokPrijmu = new Date(prijem.datum).getFullYear();
        return rokPrijmu === aktuálníRok;
      });
      
      const celkovyPrijem = prijmyZRoku.reduce((suma: number, prijem: any) => suma + prijem.castka, 0);
      
      setState(prev => ({
        ...prev,
        prijmy: {
          ...prev.prijmy,
          rocniPrijem: celkovyPrijem
        }
      }));
    } catch (error) {
      console.error('Chyba při načítání roční částky:', error);
    }
  }, [state.prijmy.vybranyRok]);

  // FIREBASE INTEGRACE: Načtení jiných příjmů přes syncService
  const nactiJinePrijmy = useCallback(async () => {
    try {
      // Používáme syncService místo AsyncStorage
      const existujiciPrijmy = await syncService.nactiLokalnDataProUI('prijmy');
      const aktuálníMěsíc = new Date().getMonth();
      const aktuálníRok = new Date().getFullYear();
      
      const jinePrijmyMesice = existujiciPrijmy.filter((prijem: any) => {
        const datumPrijmu = new Date(prijem.datum);
        return datumPrijmu.getMonth() === aktuálníMěsíc && 
               datumPrijmu.getFullYear() === aktuálníRok && 
               prijem.kategorie === KategoriePrijmu.JINE;
      });
      
      setJinePrijmy(jinePrijmyMesice);
    } catch (error) {
      console.error('Chyba při načítání jiných příjmů:', error);
    }
  }, []);

  // Inicializace dat při načtení komponenty
  useEffect(() => {
    nactiRocniPrijem();
    nactiJinePrijmy();
  }, [nactiRocniPrijem, nactiJinePrijmy]);

  // Aktualizace dat při změně roku
  useEffect(() => {
    nactiRocniPrijem();
  }, [nactiRocniPrijem]);

  // Handler pro změnu částky
  const handleCastkaChange = useCallback((text: string) => {
    // Povolí pouze čísla a jednu desetinnou tečku/čárku
    const cleanedText = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    
    setState(prev => ({
      ...prev,
      prijmy: {
        ...prev.prijmy,
        castka: cleanedText
      }
    }));
  }, []);

  // Handler pro změnu data
  const handleDatumChange = useCallback((date: Date) => {
    setState(prev => ({
      ...prev,
      prijmy: {
        ...prev.prijmy,
        datum: date,
        isDatePickerVisible: false
      }
    }));
  }, []);

  // Handler pro změnu kategorie
  const handleKategorieChange = useCallback((kategorie: KategoriePrijmu) => {
    setState(prev => ({
      ...prev,
      prijmy: {
        ...prev.prijmy,
        kategorie: kategorie,
        popis: kategorie === KategoriePrijmu.JINE ? prev.prijmy.popis : ''
      }
    }));
  }, []);

  // Handler pro změnu popisu
  const handlePopisChange = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      prijmy: {
        ...prev.prijmy,
        popis: text
      }
    }));
  }, []);

  // Handler pro zobrazení/skrytí date pickeru
  const handleDatePickerVisibilityChange = useCallback((isVisible: boolean) => {
    setState(prev => ({
      ...prev,
      prijmy: {
        ...prev.prijmy,
        isDatePickerVisible: isVisible
      }
    }));
  }, []);

  // Handler pro odeslání formuláře - ROZŠÍŘENO o Firebase
  const handleSubmit = useCallback(async () => {
    const { castka, datum, kategorie, popis } = state.prijmy;

    if (!castka || parseFloat(castka) <= 0) {
      Alert.alert('Chyba', 'Prosím zadejte platnou částku');
      return;
    }

    if (kategorie === KategoriePrijmu.JINE && !popis.trim()) {
      Alert.alert('Chyba', 'Prosím zadejte popis pro kategorii "Jiné"');
      return;
    }

    setState(prev => ({
      ...prev,
      prijmy: { ...prev.prijmy, isLoading: true }
    }));

    try {
      const novyPrijem: Prijem = {
        id: Date.now().toString(),
        castka: parseFloat(castka),
        datum: datum.toISOString(),
        kategorie: kategorie,
        popis: kategorie === KategoriePrijmu.JINE ? popis.trim() : undefined,
      };

      // NOVÁ FUNKCIONALITA: Použití syncService místo přímého AsyncStorage
      await syncService.pridatZaznam('prijmy', novyPrijem);

      // Vymazání formuláře
      setState(prev => ({
        ...prev,
        prijmy: {
          ...prev.prijmy,
          castka: '',
          popis: '',
          isLoading: false
        }
      }));

      // Aktualizace dat
      await nactiRocniPrijem();
      await nactiJinePrijmy();

      Alert.alert('Úspěch', 'Příjem byl úspěšně přidán' + (isOnline ? ' a synchronizován' : ''));
    } catch (error) {
      console.error('Chyba při ukládání příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit příjem');
    } finally {
      setState(prev => ({
        ...prev,
        prijmy: { ...prev.prijmy, isLoading: false }
      }));
    }
  }, [state.prijmy, nactiRocniPrijem, nactiJinePrijmy, isOnline]);

  // FIREBASE INTEGRACE: Mazání posledního příjmu přes syncService
  const smazatPosledniPrijem = useCallback(async () => {
    try {
      // Používáme syncService místo AsyncStorage
      const existujiciPrijmy = await syncService.nactiLokalnDataProUI('prijmy');
      
      if (existujiciPrijmy.length === 0) {
        Alert.alert('Info', 'Žádné příjmy k smazání');
        return;
      }

      // Najdi poslední příjem (podle data)
      const posledniPrijem = existujiciPrijmy.reduce((latest, current) => {
        return new Date(current.datum) > new Date(latest.datum) ? current : latest;
      });

      Alert.alert(
        'Potvrzení',
        `Opravdu chcete smazat poslední příjem?\n\nČástka: ${posledniPrijem.castka} Kč\nDatum: ${formatujDatum(new Date(posledniPrijem.datum))}\nKategorie: ${posledniPrijem.kategorie}`,
        [
          { text: 'Zrušit', style: 'cancel' },
          {
            text: 'Smazat',
            style: 'destructive',
            onPress: async () => {
              try {
                // NOVÁ FUNKCIONALITA: Použití syncService pro mazání
                await syncService.smazatZaznam('prijmy', posledniPrijem.id);
                
                // Aktualizace dat
                await nactiRocniPrijem();
                await nactiJinePrijmy();
                
                Alert.alert('Úspěch', 'Poslední příjem byl smazán');
              } catch (error) {
                console.error('Chyba při mazání příjmu:', error);
                Alert.alert('Chyba', 'Nepodařilo se smazat příjem');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Chyba při mazání posledního příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se načíst příjmy');
    }
  }, [nactiRocniPrijem, nactiJinePrijmy]);

  // Utility funkce pro formátování data (zachováno)
  const formatujDatum = useCallback((date: Date): string => {
    const den = date.getDate().toString().padStart(2, '0');
    const mesic = (date.getMonth() + 1).toString().padStart(2, '0');
    const rok = date.getFullYear();
    return `${den}.${mesic}.${rok}`;
  }, []);

  // NOVÉ: Firebase akce
  const manualniSynchronizace = useCallback(async () => {
    await synchronizujData();
    // Po synchronizaci aktualizuj lokální data
    await nactiRocniPrijem();
    await nactiJinePrijmy();
  }, [synchronizujData, nactiRocniPrijem, nactiJinePrijmy]);

  const getStatistikySynchronizace = useCallback(async () => {
    return await getStatistiky();
  }, [getStatistiky]);

  return {
    // Původní funkcionalita
    state,
    prijmyHandlers: {
      handleCastkaChange,
      handleDatumChange,
      handleKategorieChange,
      handlePopisChange,
      handleSubmit,
      handleDatePickerVisibilityChange,
      smazatPosledniPrijem,
    },
    utils: {
      formatujDatum,
    },

    // NOVÁ: Firebase funkcionalita
    firebase: {
      isOnline,
      isSyncing,
      syncError,
      lastSyncAt,
      canSync,
    },
    firebaseActions: {
      manualniSynchronizace,
      getStatistikySynchronizace,
    }
  };
};
