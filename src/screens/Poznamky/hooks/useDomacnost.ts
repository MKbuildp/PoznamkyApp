import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  DomacnostState, 
  UseDomacnostReturn, 
  DomacnostVydaj, 
  KategorieDomacnostVydaju,
  DenniZaznamDomacnosti 
} from '../types/types';
import { FirestoreService, FIRESTORE_COLLECTIONS } from '../../../services/firestoreService';

const DOMACNOST_STORAGE_KEY = 'domacnostVydajeData_v1';

/**
 * @description Hook pro logiku obrazovky Domácnost
 */
export const useDomacnost = (): UseDomacnostReturn => {
  const [vybranyMesic, setVybranyMesic] = useState(new Date().getMonth());
  const [vybranyRok, setVybranyRok] = useState(new Date().getFullYear());

  const [state, setState] = useState<DomacnostState>({
    // Formulář
    castka: '',
    datum: new Date(),
    kategorie: undefined,
    ucel: '',
    isDatePickerVisible: false,
    isLoading: false,
    
    // Data
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

  /**
   * @description Normalizace záznamů - převod starých string hodnot na enum hodnoty
   */
  const normalizujVydaje = useCallback((vydaje: DomacnostVydaj[]): DomacnostVydaj[] => {
    return vydaje.map(vydaj => {
      // Pokud je kategorie už enum hodnota, necháme ji beze změny
      if (Object.values(KategorieDomacnostVydaju).includes(vydaj.kategorie as KategorieDomacnostVydaju)) {
        return vydaj;
      }
      // Převod starého stringu na enum hodnotu
      return {
        ...vydaj,
        kategorie: mapKategorieStringToEnum(vydaj.kategorie as string)
      };
    });
  }, []);

  const nactiData = useCallback(async () => {
    setState(s => ({ ...s, nacitaSe: true }));
    try {
      const jsonValue = await AsyncStorage.getItem(DOMACNOST_STORAGE_KEY);
      const nacteneVydaje: DomacnostVydaj[] = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // Normalizace záznamů - převod starých string hodnot na enum hodnoty
      const normalizovaneVydaje = normalizujVydaje(nacteneVydaje);
      
      // Pokud se některé záznamy změnily, aktualizujeme AsyncStorage
      const byloTrebaNormalizovat = nacteneVydaje.some((v, index) => 
        v.kategorie !== normalizovaneVydaje[index].kategorie
      );
      
      if (byloTrebaNormalizovat) {
        await AsyncStorage.setItem(DOMACNOST_STORAGE_KEY, JSON.stringify(normalizovaneVydaje));
        // Aktualizace v Firestore, pokud mají firestoreId
        for (const vydaj of normalizovaneVydaje) {
          if (vydaj.firestoreId) {
            try {
              const firestoreData = {
                castka: vydaj.castka,
                datum: vydaj.datum,
                kategorie: vydaj.kategorie,
                ucel: vydaj.ucel || ''
              };
              await FirestoreService.aktualizujDomacnostVydaj(vydaj.firestoreId, firestoreData);
            } catch (firestoreError) {
              console.error('Chyba při aktualizaci kategorie v Firestore:', firestoreError);
              // Pokračujeme i při chybě Firestore
            }
          }
        }
      }
      
      const zpracovanaData = zpracujData(normalizovaneVydaje);
      
      setState(s => ({
        ...s,
        ...zpracovanaData,
        vsechnyVydaje: normalizovaneVydaje,
        nacitaSe: false,
      }));
    } catch (e) {
      console.error('Nepodařilo se načíst domácí výdaje z AsyncStorage:', e);
      setState(s => ({ ...s, nacitaSe: false }));
    }
  }, [zpracujData, normalizujVydaje]);

  // Inicializační načtení dat
  useEffect(() => {
    nactiData();
  }, [nactiData]);

  // Automatická aktualizace při návratu na obrazovku
  useFocusEffect(
    useCallback(() => {
      nactiData();
    }, [nactiData])
  );

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
      const novyVydaj: DomacnostVydaj = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        castka: parseFloat(state.castka),
        datum: state.datum.toISOString(),
        kategorie: state.kategorie,
        ucel: state.ucel.trim() || undefined,
      };



      // Uložení do AsyncStorage (lokální úložiště)
      const existujiciVydajeString = await AsyncStorage.getItem(DOMACNOST_STORAGE_KEY);
      const existujiciVydaje: DomacnostVydaj[] = existujiciVydajeString 
        ? JSON.parse(existujiciVydajeString) 
        : [];

      const noveVydaje = [...existujiciVydaje, novyVydaj];
      await AsyncStorage.setItem(DOMACNOST_STORAGE_KEY, JSON.stringify(noveVydaje));

      // Uložení do Firestore (cloud synchronizace)
      try {
        const firestoreData = {
          castka: novyVydaj.castka,
          datum: novyVydaj.datum,
          kategorie: novyVydaj.kategorie,
          ucel: novyVydaj.ucel || ''
        };
        
        const firestoreId = await FirestoreService.ulozDomacnostVydaj(firestoreData);
        
        // Označení jako synchronizované v AsyncStorage
        novyVydaj.firestoreId = firestoreId;
        const aktualizovaneVydajeData = noveVydaje.map(v => 
          v.id === novyVydaj.id ? { ...v, firestoreId } : v
        );
        await AsyncStorage.setItem(DOMACNOST_STORAGE_KEY, JSON.stringify(aktualizovaneVydajeData));
      } catch (firestoreError) {
        console.error('Chyba při ukládání do Firestore:', firestoreError);
        // Data zůstávají v AsyncStorage i při chybě Firestore
        Alert.alert('Upozornění', 'Data uložena lokálně, ale nepodařilo se synchronizovat s cloudem');
      }

      // Reset formuláře
      setState(prev => ({
        ...prev,
        castka: '',
        datum: new Date(),
        kategorie: KategorieDomacnostVydaju.JIDLO,
        ucel: '',
        isLoading: false,
      }));

      // Okamžitá aktualizace UI bez čekání na načtení dat
      const zpracovanaData = zpracujData(noveVydaje);
      setState(s => ({
        ...s,
        ...zpracovanaData,
        vsechnyVydaje: noveVydaje,
      }));

      Alert.alert('Úspěch', 'Výdaj byl uložen');
    } catch (error) {
      console.error('DOMACNOST ERROR: Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.castka, state.datum, state.kategorie, state.ucel, nactiData]);

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
      const novyVydaj: DomacnostVydaj = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        castka: parseFloat(data.castka),
        datum: data.datum.toISOString(),
        kategorie: kategorieEnum,
        ucel: data.ucel?.trim() || undefined,
      };

      // Uložení do AsyncStorage (lokální úložiště)
      const existujiciVydajeString = await AsyncStorage.getItem(DOMACNOST_STORAGE_KEY);
      const existujiciVydaje: DomacnostVydaj[] = existujiciVydajeString 
        ? JSON.parse(existujiciVydajeString) 
        : [];

      const noveVydaje = [...existujiciVydaje, novyVydaj];
      await AsyncStorage.setItem(DOMACNOST_STORAGE_KEY, JSON.stringify(noveVydaje));

      // Uložení do Firestore (cloud synchronizace)
      try {
        const firestoreData = {
          castka: novyVydaj.castka,
          datum: novyVydaj.datum,
          kategorie: novyVydaj.kategorie,
          ucel: novyVydaj.ucel || ''
        };
        
        const firestoreId = await FirestoreService.ulozDomacnostVydaj(firestoreData);
        
        // Označení jako synchronizované v AsyncStorage
        novyVydaj.firestoreId = firestoreId;
        const aktualizovaneVydajeData = noveVydaje.map(v => 
          v.id === novyVydaj.id ? { ...v, firestoreId } : v
        );
        await AsyncStorage.setItem(DOMACNOST_STORAGE_KEY, JSON.stringify(aktualizovaneVydajeData));
      } catch (firestoreError) {
        console.error('Chyba při ukládání do Firestore:', firestoreError);
        // Data zůstávají v AsyncStorage i při chybě Firestore
        Alert.alert('Upozornění', 'Data uložena lokálně, ale nepodařilo se synchronizovat s cloudem');
      }

      // Reset formuláře
      setState(prev => ({
        ...prev,
        castka: '',
        datum: new Date(),
        kategorie: KategorieDomacnostVydaju.JIDLO,
        ucel: '',
        isLoading: false,
      }));

      // Okamžitá aktualizace UI bez čekání na načtení dat
      const zpracovanaData = zpracujData(noveVydaje);
      setState(s => ({
        ...s,
        ...zpracovanaData,
        vsechnyVydaje: noveVydaje,
      }));

      Alert.alert('Úspěch', 'Výdaj byl uložen');
    } catch (error) {
      console.error('DOMACNOST ERROR: Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [nactiData]);

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
      const existujiciData = await AsyncStorage.getItem('domacnostVydajeData_v1');
      if (!existujiciData) {
        Alert.alert('Info', 'Žádné výdaje k odstranění');
        return;
      }

      const vydajeData: DomacnostVydaj[] = JSON.parse(existujiciData);
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
                // Odstraníme poslední záznam z AsyncStorage
                const aktualizovanaData = vydajeData.filter(v => v.id !== posledniVydaj.id);
                await AsyncStorage.setItem('domacnostVydajeData_v1', JSON.stringify(aktualizovanaData));
                
                // Odstraníme také z Firebase, pokud má firestoreId
                if (posledniVydaj.firestoreId) {
                  try {
                    await FirestoreService.smazDokument(FIRESTORE_COLLECTIONS.DOMACNOST, posledniVydaj.firestoreId);
                  } catch (firebaseError) {
                    console.error('Chyba při mazání z Firebase:', firebaseError);
                    // Pokračujeme i při chybě Firebase
                  }
                }
                
                Alert.alert('Úspěch', 'Poslední výdaj byl odstraněn');
                await nactiData();
                
                // Explicitní aktualizace měsíčních výdajů pro UI
                const aktualizovaneVydaje = await AsyncStorage.getItem(DOMACNOST_STORAGE_KEY);
                if (aktualizovaneVydaje) {
                  const vydaje: DomacnostVydaj[] = JSON.parse(aktualizovaneVydaje);
                  const mesicniVydaje = vydaje.filter(v => {
                    const datumVydaje = new Date(v.datum);
                    return (
                      datumVydaje.getFullYear() === vybranyRok &&
                      datumVydaje.getMonth() === vybranyMesic
                    );
                  });
                  const serazeneMesicniVydaje = mesicniVydaje.sort((a, b) => 
                    new Date(b.datum).getTime() - new Date(a.datum).getTime()
                  );
                  setMesicniVydaje(serazeneMesicniVydaje);
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
  }, [nactiData]);

  const formatujDatum = useCallback((datum: string): string => {
    const date = new Date(datum);
    return date.toLocaleDateString('cs-CZ');
  }, []);

  const editovatVydaj = useCallback(async (editedVydaj: DomacnostVydaj) => {
    try {
      // Aktualizace v AsyncStorage
      const existujiciData = await AsyncStorage.getItem(DOMACNOST_STORAGE_KEY);
      if (!existujiciData) {
        throw new Error('Nepodařilo se načíst data pro editaci');
      }

      const vydajeData: DomacnostVydaj[] = JSON.parse(existujiciData);
      const aktualizovanaData = vydajeData.map(v => 
        v.id === editedVydaj.id ? editedVydaj : v
      );

      await AsyncStorage.setItem(DOMACNOST_STORAGE_KEY, JSON.stringify(aktualizovanaData));

      // Aktualizace v Firestore, pokud má firestoreId
      if (editedVydaj.firestoreId) {
        try {
          const firestoreData = {
            castka: editedVydaj.castka,
            datum: editedVydaj.datum,
            kategorie: editedVydaj.kategorie,
            ucel: editedVydaj.ucel || ''
          };
          
          await FirestoreService.aktualizujDomacnostVydaj(editedVydaj.firestoreId, firestoreData);
        } catch (firestoreError) {
          console.error('Chyba při aktualizaci v Firestore:', firestoreError);
          Alert.alert('Upozornění', 'Změny uloženy lokálně, ale nepodařilo se synchronizovat s cloudem');
        }
      }

      // Okamžitá aktualizace UI
      const zpracovanaData = zpracujData(aktualizovanaData);
      setState(s => ({
        ...s,
        ...zpracovanaData,
        vsechnyVydaje: aktualizovanaData,
      }));

      Alert.alert('Úspěch', 'Výdaj byl úspěšně upraven');
    } catch (error) {
      console.error('Chyba při editaci výdaje:', error);
      throw error;
    }
  }, [zpracujData]);

  const smazatVydaj = useCallback(async (vydaj: DomacnostVydaj) => {
    try {
      // Smazání z AsyncStorage
      const existujiciData = await AsyncStorage.getItem(DOMACNOST_STORAGE_KEY);
      if (!existujiciData) {
        throw new Error('Nepodařilo se načíst data pro smazání');
      }

      const vydajeData: DomacnostVydaj[] = JSON.parse(existujiciData);
      const aktualizovanaData = vydajeData.filter(v => v.id !== vydaj.id);

      await AsyncStorage.setItem(DOMACNOST_STORAGE_KEY, JSON.stringify(aktualizovanaData));

      // Smazání z Firestore, pokud má firestoreId
      if (vydaj.firestoreId) {
        try {
          await FirestoreService.smazDokument(FIRESTORE_COLLECTIONS.DOMACNOST, vydaj.firestoreId);
        } catch (firestoreError) {
          console.error('Chyba při mazání z Firestore:', firestoreError);
          // Pokračujeme i při chybě Firestore
        }
      }

      // Okamžitá aktualizace UI
      const zpracovanaData = zpracujData(aktualizovanaData);
      setState(s => ({
        ...s,
        ...zpracovanaData,
        vsechnyVydaje: aktualizovanaData,
      }));

      Alert.alert('Úspěch', 'Výdaj byl úspěšně smazán');
    } catch (error) {
      console.error('Chyba při mazání výdaje:', error);
      throw error;
    }
  }, [zpracujData]);

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
