import { useState, useCallback, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFirestoreRealtime } from '../../../hooks/useFirestoreRealtime';
import { FirestoreService, FIRESTORE_COLLECTIONS, FirestoreVydaj } from '../../../services/firestoreService';
import { KategorieVydaju, Vydaj } from '../types/types';

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
 * @description Hook pro správu dat přehledu výdajů s real-time Firebase synchronizací
 */
export const useVydajePrehled = (): UseVydajePrehledReturn => {
  const [vybranyMesic, setVybranyMesic] = useState<number>(new Date().getMonth());
  const [vybranyRok, setVybranyRok] = useState<number>(new Date().getFullYear());

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

  // Filtrování výdajů pro vybraný měsíc a rok
  const vydaje = useMemo(() => {
    const vydajeMesice = vsechnyVydaje.filter(vydaj => {
      const datum = new Date(vydaj.datum);
      return datum.getFullYear() === vybranyRok && datum.getMonth() === vybranyMesic;
    });

    // Seřazení výdajů podle data (od nejnovějšího)
    return [...vydajeMesice].sort((a, b) => 
      new Date(b.datum).getTime() - new Date(a.datum).getTime()
    );
  }, [vsechnyVydaje, vybranyMesic, vybranyRok]);

  // Výpočet sum podle dodavatelů
  const vydajePodleDodavatelu = useMemo(() => {
    const sumy = vydaje.reduce((acc: { [key: string]: number }, vydaj) => {
      acc[vydaj.dodavatel] = (acc[vydaj.dodavatel] || 0) + vydaj.castka;
      return acc;
    }, {});

    // Převod na pole a seřazení podle částky
    return Object.entries(sumy).map(([dodavatel, castka]) => ({
      dodavatel,
      castka: castka as number,
    })).sort((a, b) => b.castka - a.castka);
  }, [vydaje]);

  // Error handling
  if (firestoreError) {
    console.error('Firestore error v useVydajePrehled:', firestoreError);
  }

  // State pro formulář
  const [castka, setCastka] = useState<string>('');
  const [datum, setDatum] = useState<Date>(new Date());
  const [kategorie, setKategorie] = useState<KategorieVydaju>(KategorieVydaju.ZBOZI);
  const [dodavatel, setDodavatel] = useState<string>('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * @description Změní vybraný měsíc
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
  }, [vybranyMesic, vybranyRok]);

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
      Alert.alert('Chyba', 'Vyplňte všechny povinné údaje');
      return;
    }

    setIsLoading(true);
    
    try {
      // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
      await FirestoreService.ulozVydaj({
        castka: parseFloat(castka),
        datum: datum.toISOString(),
        kategorie: kategorie,
        dodavatel: dodavatel.trim()
      });

      // Reset formuláře
      setCastka('');
      setDatum(new Date());
      setKategorie(KategorieVydaju.ZBOZI);
      setDodavatel('');

      Alert.alert('Úspěch', 'Výdaj byl uložen');
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
    } finally {
      setIsLoading(false);
    }
  }, [castka, dodavatel, datum, kategorie]);

  const smazatPosledniVydaj = useCallback(async () => {
    try {
      if (vydaje.length === 0) {
        Alert.alert('Info', 'Žádné výdaje k odstranění');
        return;
      }

      // Seřadíme podle data a vezmeme poslední (nejnovější) záznam
      const posledniVydaj = vydaje[0]; // Už jsou seřazené od nejnovějšího
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
  }, [vydaje]);

  // Placeholder pro nactiData - zachováno pro kompatibilitu
  const nactiData = useCallback(async (mesic: number, rok: number) => {
    // Real-time listener automaticky načítá data
    // Tato funkce je pouze pro kompatibilitu
    setVybranyMesic(mesic);
    setVybranyRok(rok);
  }, []);

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
