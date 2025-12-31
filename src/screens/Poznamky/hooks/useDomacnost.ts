import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useFirestoreRealtime } from '../../../hooks/useFirestoreRealtime';
import { FirestoreService, FIRESTORE_COLLECTIONS, FirestoreDomacnostVydaj } from '../../../services/firestoreService';
import { 
  DomacnostState, 
  UseDomacnostReturn, 
  DomacnostVydaj, 
  KategorieDomacnostVydaju,
  DenniZaznamDomacnosti 
} from '../types/types';

/**
 * @description Transformace Firestore dat na lokální typ
 */
const transformDomacnostVydaj = (doc: any): DomacnostVydaj => {
  return {
    id: doc.id,
    castka: doc.castka,
    datum: doc.datum, // ISO string z Firestore
    kategorie: doc.kategorie as KategorieDomacnostVydaju,
    ucel: doc.ucel || undefined,
    firestoreId: doc.id
  };
};

/**
 * @description Hook pro logiku obrazovky Domácnost s real-time Firebase synchronizací
 */
export const useDomacnost = (): UseDomacnostReturn => {
  const [vybranyMesic, setVybranyMesic] = useState(new Date().getMonth());
  const [vybranyRok, setVybranyRok] = useState(new Date().getFullYear());

  // Real-time synchronizace z Firestore
  const { 
    data: firestoreVydaje, 
    loading: nacitaSe, 
    error: firestoreError 
  } = useFirestoreRealtime<FirestoreDomacnostVydaj>({
    collectionName: FIRESTORE_COLLECTIONS.DOMACNOST,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: transformDomacnostVydaj
  });

  // Transformace na lokální typy
  const vsechnyVydaje: DomacnostVydaj[] = useMemo(() => {
    return firestoreVydaje.map(v => ({
      id: v.id || '',
      castka: v.castka,
      datum: v.datum,
      kategorie: v.kategorie,
      ucel: v.ucel,
      firestoreId: v.id
    }));
  }, [firestoreVydaje]);

  const [state, setState] = useState<DomacnostState>({
    // Formulář
    castka: '',
    datum: new Date(),
    kategorie: undefined,
    ucel: '',
    isDatePickerVisible: false,
    isLoading: false,
    
    // Data - budou aktualizována z real-time listeneru
    denniZaznamy: [],
    mesicniCelkem: 0,
    nacitaSe: true,
    vsechnyVydaje: [],
  });

  // Stav pro seznam výdajů v měsíci
  const [mesicniVydaje, setMesicniVydaje] = useState<DomacnostVydaj[]>([]);

  /**
   * @description Pomocná funkce pro převod stringu z modálního okna na enum hodnotu
   */
  const mapKategorieStringToEnum = (kategorieString: string): KategorieDomacnostVydaju => {
    switch (kategorieString) {
      case 'JIDLO':
        return KategorieDomacnostVydaju.JIDLO;
      case 'JINE':
        return KategorieDomacnostVydaju.JINE;
      case 'PRAVIDELNE':
        return KategorieDomacnostVydaju.PRAVIDELNE;
      case 'PRIJEM':
        return KategorieDomacnostVydaju.PRIJEM;
      default:
        // Pokud už je to enum hodnota, vrátíme ji zpět
        if (Object.values(KategorieDomacnostVydaju).includes(kategorieString as KategorieDomacnostVydaju)) {
          return kategorieString as KategorieDomacnostVydaju;
        }
        // Fallback na "Jiné"
        return KategorieDomacnostVydaju.JINE;
    }
  };

  const formatujCastku = useCallback((castka: number): string => {
    return `${Math.round(castka).toLocaleString('cs-CZ')} Kč`;
  }, []);

  const zpracujData = useCallback((vydaje: DomacnostVydaj[]) => {
    const dnyVMesici = new Date(vybranyRok, vybranyMesic + 1, 0).getDate();
    const noveDenniZaznamy: DenniZaznamDomacnosti[] = [];

    // Filtruj výdaje pro vybraný měsíc/rok
    const mesicniVydaje = vydaje.filter(v => {
      const datumVydaje = new Date(v.datum);
      return (
        datumVydaje.getFullYear() === vybranyRok &&
        datumVydaje.getMonth() === vybranyMesic
      );
    });

    // Celková částka pouze z výdajů (bez příjmů)
    const celkovaCastka = mesicniVydaje
      .filter(v => v.kategorie !== KategorieDomacnostVydaju.PRIJEM)
      .reduce((sum, v) => sum + v.castka, 0);

    // Vytvoř záznam pro každý den v měsíci
    for (let den = 1; den <= dnyVMesici; den++) {
      const datumString = `${vybranyRok}-${String(vybranyMesic + 1).padStart(2, '0')}-${String(den).padStart(2, '0')}`;
      
      // Najdi výdaje pro tento den (bez příjmů)
      const vydajProDen = mesicniVydaje
        .filter(v => {
          const datumVydaje = new Date(v.datum);
          return datumVydaje.getDate() === den && v.kategorie !== KategorieDomacnostVydaju.PRIJEM;
        })
        .reduce((sum, v) => sum + v.castka, 0);
      
      noveDenniZaznamy.push({
        den: den,
        datum: datumString,
        castka: vydajProDen,
      });
    }

    // Seřadíme měsíční výdaje podle data (nejnovější nahoře)
    const serazeneMesicniVydaje = mesicniVydaje.sort((a, b) => 
      new Date(b.datum).getTime() - new Date(a.datum).getTime()
    );

    setMesicniVydaje(serazeneMesicniVydaje);

    return {
      denniZaznamy: noveDenniZaznamy,
      mesicniCelkem: celkovaCastka,
    };
  }, [vybranyMesic, vybranyRok]);

  // Zpracování dat pro UI při změně dat z real-time listeneru
  const zpracovanaData = useMemo(() => {
    return zpracujData(vsechnyVydaje);
  }, [vsechnyVydaje, zpracujData]);

  // Aktualizace state při změně dat z real-time listeneru
  useMemo(() => {
    setState(prev => ({
      ...prev,
      ...zpracovanaData,
      vsechnyVydaje,
      nacitaSe,
    }));
  }, [zpracovanaData, vsechnyVydaje, nacitaSe]);

  // Error handling
  if (firestoreError) {
    console.error('Firestore error v useDomacnost:', firestoreError);
  }

  const handleCastkaChange = useCallback((text: string) => {
    // Povolíme pouze čísla a jednu desetinnou čárku/tečku
    const cleanedText = text.replace(',', '.').replace(/[^0-9.]/g, '');
    const parts = cleanedText.split('.');
    const finalText = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanedText;
    
    setState(prev => ({ ...prev, castka: finalText }));
  }, []);

  const handleDatumChange = useCallback((datum: Date) => {
    setState(prev => ({ 
      ...prev, 
      datum, 
      isDatePickerVisible: false 
    }));
  }, []);

  const handleKategorieChange = useCallback((kategorie: KategorieDomacnostVydaju) => {
    setState(prev => ({ 
      ...prev, 
      kategorie,
      // Vymazat účel při změně na JIDLO
      ucel: kategorie === KategorieDomacnostVydaju.JIDLO ? '' : prev.ucel
    }));
  }, []);

  const handleUcelChange = useCallback((text: string) => {
    setState(prev => ({ ...prev, ucel: text }));
  }, []);

  const handleDatePickerVisibilityChange = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, isDatePickerVisible: visible }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!state.castka || parseFloat(state.castka) <= 0) {
      Alert.alert('Chyba', 'Zadejte platnou částku');
      return;
    }

    if (!state.kategorie) {
      Alert.alert('Chyba', 'Vyberte kategorii');
      return;
    }

    // Kontrola účelu pro kategorie "Jiné" a "Pravidelné" (povinné)
    if ((state.kategorie === KategorieDomacnostVydaju.JINE || state.kategorie === KategorieDomacnostVydaju.PRAVIDELNE) && !state.ucel.trim()) {
      Alert.alert('Chyba', `Pro kategorii "${state.kategorie}" je povinný účel`);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
      await FirestoreService.ulozDomacnostVydaj({
        castka: parseFloat(state.castka),
        datum: state.datum.toISOString(),
        kategorie: state.kategorie,
        ucel: state.ucel || ''
      });

      // Reset formuláře
      setState(prev => ({
        ...prev,
        castka: '',
        datum: new Date(),
        kategorie: KategorieDomacnostVydaju.JIDLO,
        ucel: '',
        isLoading: false,
      }));

      Alert.alert('Úspěch', 'Výdaj byl uložen');
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.castka, state.datum, state.kategorie, state.ucel]);

  /**
   * @description Handler pro uložení nového záznamu s daty z modálního okna
   */
  const handleSubmitWithData = useCallback(async (data: any) => {
    if (!data.castka || parseFloat(data.castka) <= 0) {
      Alert.alert('Chyba', 'Zadejte platnou částku');
      return;
    }

    if (!data.kategorie) {
      Alert.alert('Chyba', 'Vyberte kategorii');
      return;
    }

    // Převod stringu z modálního okna na enum hodnotu
    const kategorieEnum = mapKategorieStringToEnum(data.kategorie);

    // Kontrola účelu pro kategorie "Jiné" a "Pravidelné" (povinné)
    if ((kategorieEnum === KategorieDomacnostVydaju.JINE || kategorieEnum === KategorieDomacnostVydaju.PRAVIDELNE) && !data.ucel?.trim()) {
      Alert.alert('Chyba', `Pro kategorii "${kategorieEnum}" je povinný účel`);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
      await FirestoreService.ulozDomacnostVydaj({
        castka: parseFloat(data.castka),
        datum: data.datum.toISOString(),
        kategorie: kategorieEnum,
        ucel: data.ucel?.trim() || ''
      });

      // Reset formuláře
      setState(prev => ({
        ...prev,
        castka: '',
        datum: new Date(),
        kategorie: KategorieDomacnostVydaju.JIDLO,
        ucel: '',
        isLoading: false,
      }));

      Alert.alert('Úspěch', 'Výdaj byl uložen');
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

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

  const getNazevMesice = useCallback((mesic: number): string => {
    const mesice = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return mesice[mesic];
  }, []);

  const getNazevDne = useCallback((den: number, mesic: number, rok: number): string => {
    const datum = new Date(rok, mesic, den);
    const dnyVTydnu = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    return dnyVTydnu[datum.getDay()];
  }, []);

  const jeVikend = useCallback((den: number, mesic: number, rok: number): boolean => {
    const datum = new Date(rok, mesic, den);
    const denVTydnu = datum.getDay(); // 0 = neděle, 6 = sobota
    return denVTydnu === 0 || denVTydnu === 6;
  }, []);

  const rozdelZaznamyDoSloupcu = useCallback(() => {
    const pulka = Math.ceil(state.denniZaznamy.length / 2);
    return {
      levySloupec: state.denniZaznamy.slice(0, pulka),
      pravySloupec: state.denniZaznamy.slice(pulka)
    };
  }, [state.denniZaznamy]);

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
      const kategorieText = posledniVydaj.kategorie === KategorieDomacnostVydaju.JIDLO ? 'Jídlo' : 'Jiné';

      Alert.alert(
        'Smazat poslední výdaj?',
        `Datum: ${datumPosledniho}\nČástka: ${castkaPosledniho} Kč\nKategorie: ${kategorieText}`,
        [
          { text: 'Zrušit', style: 'cancel' },
          {
            text: 'Smazat',
            style: 'destructive',
            onPress: async () => {
              try {
                if (posledniVydaj.firestoreId) {
                  await FirestoreService.smazDomacnostVydaj(posledniVydaj.firestoreId);
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

  const formatujDatum = useCallback((datum: string): string => {
    const date = new Date(datum);
    return date.toLocaleDateString('cs-CZ');
  }, []);

  const editovatVydaj = useCallback(async (editedVydaj: DomacnostVydaj) => {
    if (!editedVydaj.firestoreId) {
      Alert.alert('Chyba', 'Záznam nemá Firestore ID');
      return;
    }

    try {
      await FirestoreService.aktualizujDomacnostVydaj(editedVydaj.firestoreId, {
        castka: editedVydaj.castka,
        datum: editedVydaj.datum,
        kategorie: editedVydaj.kategorie,
        ucel: editedVydaj.ucel || ''
      });
      // Real-time listener automaticky aktualizuje UI
      Alert.alert('Úspěch', 'Výdaj byl úspěšně upraven');
    } catch (error) {
      console.error('Chyba při editaci výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se aktualizovat výdaj');
      throw error;
    }
  }, []);

  const smazatVydaj = useCallback(async (vydaj: DomacnostVydaj) => {
    if (!vydaj.firestoreId) {
      Alert.alert('Chyba', 'Záznam nemá Firestore ID');
      return;
    }

    try {
      await FirestoreService.smazDomacnostVydaj(vydaj.firestoreId);
      // Real-time listener automaticky aktualizuje UI
      Alert.alert('Úspěch', 'Výdaj byl úspěšně smazán');
    } catch (error) {
      console.error('Chyba při mazání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se smazat výdaj');
      throw error;
    }
  }, []);

  // Placeholder pro nactiData - zachováno pro kompatibilitu s existujícím kódem
  const nactiData = useCallback(async () => {
    // Real-time listener automaticky načítá data
    // Tato funkce je pouze pro kompatibilitu
  }, []);

  return {
    state,
    mesicniVydaje,
    formatujCastku,
    formatujDatum,
    handleCastkaChange,
    handleDatumChange,
    handleKategorieChange,
    handleUcelChange,
    handleDatePickerVisibilityChange,
    handleSubmit,
    handleSubmitWithData,
    nactiData,
    zmenitMesic,
    vybranyMesic,
    vybranyRok,
    getNazevMesice,
    getNazevDne,
    jeVikend,
    rozdelZaznamyDoSloupcu,
    smazatPosledniVydaj,
    editovatVydaj,
    smazatVydaj,
  };
};
