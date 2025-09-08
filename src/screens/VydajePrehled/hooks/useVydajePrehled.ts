import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { KategorieVydaju, Vydaj } from '../types/types';
import { FirestoreService, FIRESTORE_COLLECTIONS } from '../../../services/firestoreService';

const VYDAJE_STORAGE_KEY = 'seznamVydajuData_v1';



interface DodavatelSuma {
  dodavatel: string;
  castka: number;
}

export interface UseVydajePrehledReturn {
  vydajePodleDodavatelu: DodavatelSuma[];
  vydaje: Vydaj[];
  vybranyMesic: number;
  vybranyRok: number;
  nacitaSe: boolean;
  zmenitMesic: (posun: number) => void;
  formatujCastku: (castka: number) => string;
  getNazevMesice: (mesic: number) => string;
  nactiData: (mesic: number, rok: number) => Promise<void>;
  // Formulář
  formular: {
    castka: string;
    datum: Date;
    kategorie: KategorieVydaju;
    dodavatel: string;
    isDatePickerVisible: boolean;
    isLoading: boolean;
  };
  onCastkaChange: (text: string) => void;
  onDatumChange: (date: Date) => void;
  onKategorieChange: (kategorie: KategorieVydaju) => void;
  onDodavatelChange: (text: string) => void;
  onSubmit: () => void;
  onDatePickerVisibilityChange: (isVisible: boolean) => void;
  smazatPosledniVydaj: () => void;
}

/**
 * @description Hook pro správu dat přehledu výdajů
 */
export const useVydajePrehled = (): UseVydajePrehledReturn => {
  const [vydajePodleDodavatelu, setVydajePodleDodavatelu] = useState<DodavatelSuma[]>([]);
  const [vydaje, setVydaje] = useState<Vydaj[]>([]);
  const [vybranyMesic, setVybranyMesic] = useState<number>(new Date().getMonth());
  const [vybranyRok, setVybranyRok] = useState<number>(new Date().getFullYear());
  const [nacitaSe, setNacitaSe] = useState<boolean>(true);

  // State pro formulář
  const [castka, setCastka] = useState<string>('');
  const [datum, setDatum] = useState<Date>(new Date());
  const [kategorie, setKategorie] = useState<KategorieVydaju>(KategorieVydaju.ZBOZI);
  const [dodavatel, setDodavatel] = useState<string>('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * @description Načte data z úložiště a zpracuje je
   */
  const nactiData = useCallback(async (mesic: number, rok: number) => {
    setNacitaSe(true);
    try {
      const vydajeString = await AsyncStorage.getItem(VYDAJE_STORAGE_KEY);
      const vsechnyVydaje: Vydaj[] = vydajeString ? JSON.parse(vydajeString) : [];

      // Filtrování výdajů pro vybraný měsíc a rok
      const vydajeMesice = vsechnyVydaje.filter(vydaj => {
        const datum = new Date(vydaj.datum);
        return datum.getFullYear() === rok && datum.getMonth() === mesic;
      });

      // Zobrazujeme všechny výdaje (bez filtrování podle kategorie)
      const filtrovaneVydaje = vydajeMesice;

      // Seřazení výdajů podle data (od nejnovějšího)
      const serazeneVydaje = [...filtrovaneVydaje].sort((a, b) => 
        new Date(b.datum).getTime() - new Date(a.datum).getTime()
      );

      // Výpočet sum podle dodavatelů
      const sumy = filtrovaneVydaje.reduce((acc: { [key: string]: number }, vydaj) => {
        acc[vydaj.dodavatel] = (acc[vydaj.dodavatel] || 0) + vydaj.castka;
        return acc;
      }, {});

      // Převod na pole a seřazení podle částky
      const sumyArray = Object.entries(sumy).map(([dodavatel, castka]) => ({
        dodavatel,
        castka,
      })).sort((a, b) => b.castka - a.castka);

      setVydajePodleDodavatelu(sumyArray);
      setVydaje(serazeneVydaje);
      setNacitaSe(false);
    } catch (error) {
      console.error('Chyba při načítání výdajů:', error);
      setNacitaSe(false);
    }
  }, []);

  /**
   * @description Změní vybraný měsíc a načte nová data
   */
  const zmenitMesic = useCallback((posun: number) => {
    let novyMesic = vybranyMesic + posun;
    let novyRok = vybranyRok;

    if (novyMesic < 0) {
      novyMesic = 11; // Prosinec
      novyRok = vybranyRok - 1;
    } else if (novyMesic > 11) {
      novyMesic = 0; // Leden
      novyRok = vybranyRok + 1;
    }

    setVybranyMesic(novyMesic);
    setVybranyRok(novyRok);
    nactiData(novyMesic, novyRok);
  }, [vybranyMesic, vybranyRok, nactiData]);



  /**
   * @description Formátuje částku do českého formátu
   */
  const formatujCastku = useCallback((castka: number): string => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(castka);
  }, []);

  const getNazevMesice = useCallback((mesic: number): string => {
    const mesice = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return mesice[mesic];
  }, []);

  // Handlery pro formulář
  const onCastkaChange = useCallback((text: string) => {
    setCastka(text);
  }, []);

  const onDatumChange = useCallback((date: Date) => {
    setDatum(date);
    setIsDatePickerVisible(false);
  }, []);

  const onKategorieChange = useCallback((novaKategorie: KategorieVydaju) => {
    setKategorie(novaKategorie);
  }, []);

  const onDodavatelChange = useCallback((text: string) => {
    setDodavatel(text);
  }, []);

  const onDatePickerVisibilityChange = useCallback((isVisible: boolean) => {
    setIsDatePickerVisible(isVisible);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!castka || !dodavatel) {
      return;
    }

    setIsLoading(true);
    
    try {
      const novyVydaj: Vydaj = {
        id: Date.now().toString(),
        castka: parseFloat(castka),
        datum: datum.toISOString().split('T')[0],
        kategorie,
        dodavatel: dodavatel.trim(),
      };

      // Uložení do AsyncStorage (lokální úložiště)
      const existujiciData = await AsyncStorage.getItem(VYDAJE_STORAGE_KEY);
      const vydajeData = existujiciData ? JSON.parse(existujiciData) : [];
      
      vydajeData.push(novyVydaj);
      await AsyncStorage.setItem(VYDAJE_STORAGE_KEY, JSON.stringify(vydajeData));

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
        const aktualizovaneVydajeData = vydajeData.map(v => 
          v.id === novyVydaj.id ? { ...v, firestoreId } : v
        );
        await AsyncStorage.setItem(VYDAJE_STORAGE_KEY, JSON.stringify(aktualizovaneVydajeData));
      } catch (firestoreError) {
        console.error('Chyba při ukládání do Firestore:', firestoreError);
        // Data zůstávají v AsyncStorage i při chybě Firestore
        Alert.alert('Upozornění', 'Data uložena lokálně, ale nepodařilo se synchronizovat s cloudem');
      }

      // Reset formuláře
      setCastka('');
      setDatum(new Date());
      setKategorie(KategorieVydaju.ZBOZI);
      setDodavatel('');

      // Přenačtení dat
      await nactiData(vybranyMesic, vybranyRok);
    } catch (error) {
      console.error('VYDAJE PREHLED ERROR: Chyba při ukládání výdaje:', error);
    } finally {
      setIsLoading(false);
    }
  }, [castka, dodavatel, datum, kategorie, vybranyMesic, vybranyRok, nactiData]);

  const smazatPosledniVydaj = useCallback(async () => {
    try {
      const existujiciData = await AsyncStorage.getItem(VYDAJE_STORAGE_KEY);
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
                await AsyncStorage.setItem(VYDAJE_STORAGE_KEY, JSON.stringify(aktualizovanaData));
                
                // Odstraníme také z Firebase, pokud má firestoreId
                if (posledniVydaj.firestoreId) {
                  try {
                    await FirestoreService.smazDokument(FIRESTORE_COLLECTIONS.VYDAJE, posledniVydaj.firestoreId);
                  } catch (firebaseError) {
                    console.error('Chyba při mazání z Firebase:', firebaseError);
                    // Pokračujeme i při chybě Firebase
                  }
                }
                
                Alert.alert('Úspěch', 'Poslední výdaj byl odstraněn');
                await nactiData(vybranyMesic, vybranyRok);
                
                // Explicitní aktualizace výdajů pro UI
                const aktualizovaneVydaje = await AsyncStorage.getItem(VYDAJE_STORAGE_KEY);
                if (aktualizovaneVydaje) {
                  const vydaje: Vydaj[] = JSON.parse(aktualizovaneVydaje);
                  const mesicniVydaje = vydaje.filter(v => {
                    const datumVydaje = new Date(v.datum);
                    return (
                      datumVydaje.getFullYear() === vybranyRok &&
                      datumVydaje.getMonth() === vybranyMesic
                    );
                  });
                  setVydaje(mesicniVydaje);
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
  }, [vybranyMesic, vybranyRok, nactiData]);

  // Načtení dat při prvním renderu
  useEffect(() => {
    nactiData(vybranyMesic, vybranyRok);
  }, [vybranyMesic, vybranyRok, nactiData]);

  return {
    vydajePodleDodavatelu,
    vydaje,
    vybranyMesic,
    vybranyRok,
    nacitaSe,
    zmenitMesic,
    formatujCastku,
    getNazevMesice,
    nactiData,
    formular: {
      castka,
      datum,
      kategorie,
      dodavatel,
      isDatePickerVisible,
      isLoading,
    },
    onCastkaChange,
    onDatumChange,
    onKategorieChange,
    onDodavatelChange,
    onSubmit,
    onDatePickerVisibilityChange,
    smazatPosledniVydaj,
  };
};
