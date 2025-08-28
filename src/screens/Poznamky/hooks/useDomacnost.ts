import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from '../../../services/storage/syncService';
import { 
  DomacnostState, 
  UseDomacnostReturn, 
  DomacnostVydaj, 
  KategorieDomacnostVydaju,
  DenniZaznamDomacnosti 
} from '../types/types';

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
    kategorie: KategorieDomacnostVydaju.JIDLO,
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

    const celkovaCastka = mesicniVydaje.reduce((sum, v) => sum + v.castka, 0);

    // Vytvoř záznam pro každý den v měsíci
    for (let den = 1; den <= dnyVMesici; den++) {
      const datumString = `${vybranyRok}-${String(vybranyMesic + 1).padStart(2, '0')}-${String(den).padStart(2, '0')}`;
      
      // Najdi výdaje pro tento den
      const vydajProDen = mesicniVydaje
        .filter(v => {
          const datumVydaje = new Date(v.datum);
          return datumVydaje.getDate() === den;
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

  // FIREBASE INTEGRACE: Načítání dat přes syncService
  const nactiData = useCallback(async () => {
    setState(s => ({ ...s, nacitaSe: true }));
    try {
      // Používáme syncService místo AsyncStorage
      const nacteneVydaje = await syncService.nactiLokalnDataProUI('domacnost');
      
      const zpracovanaData = zpracujData(nacteneVydaje);
      
      setState(s => ({
        ...s,
        ...zpracovanaData,
        vsechnyVydaje: nacteneVydaje,
        nacitaSe: false,
      }));
    } catch (e) {
      console.error('Nepodařilo se načíst domácí výdaje:', e);
      setState(s => ({ ...s, nacitaSe: false }));
    }
  }, [zpracujData]);

  // Inicializační načtení dat
  useEffect(() => {
    nactiData();
  }, [nactiData]);

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
    setState(prev => ({ ...prev, kategorie }));
  }, []);

  const handleDatePickerVisibilityChange = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, isDatePickerVisible: visible }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!state.castka || parseFloat(state.castka) <= 0) {
      Alert.alert('Chyba', 'Zadejte platnou částku');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const novyVydaj: DomacnostVydaj = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        castka: parseFloat(state.castka),
        datum: state.datum.toISOString(),
        kategorie: state.kategorie,
      };

      // FIREBASE INTEGRACE: Používáme syncService místo přímého AsyncStorage
      await syncService.pridatZaznam('domacnost', novyVydaj);
      
      // Původní kód (zachováno jako záloha):
      // const existujiciVydajeString = await AsyncStorage.getItem(DOMACNOST_STORAGE_KEY);
      // const existujiciVydaje: DomacnostVydaj[] = existujiciVydajeString 
      //   ? JSON.parse(existujiciVydajeString) 
      //   : [];
      // const noveVydaje = [...existujiciVydaje, novyVydaj];
      // await AsyncStorage.setItem(DOMACNOST_STORAGE_KEY, JSON.stringify(noveVydaje));

      // Reset formuláře
      setState(prev => ({
        ...prev,
        castka: '',
        datum: new Date(),
        kategorie: KategorieDomacnostVydaju.JIDLO,
        isLoading: false,
      }));

      // Znovu načti data
      await nactiData();

      Alert.alert('Úspěch', 'Výdaj byl uložen');
    } catch (error) {
      console.error('Chyba při ukládání výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se uložit výdaj');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.castka, state.datum, state.kategorie, nactiData]);

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

  // FIREBASE INTEGRACE: Upravená funkce pro mazání posledního výdaje
  const smazatPosledniVydaj = useCallback(async () => {
    try {
      // Používáme syncService místo přímého AsyncStorage
      const data = await syncService.nactiLokalnDataProUI('domacnost');
      if (data.length === 0) {
        Alert.alert('Info', 'Žádné výdaje k smazání');
        return;
      }

      // Najdi poslední výdaj podle data
      const posledniVydaj = data.reduce((latest, current) => {
        return new Date(current.datum) > new Date(latest.datum) ? current : latest;
      });

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
                // FIREBASE: Používáme syncService pro mazání
                await syncService.smazatZaznam('domacnost', posledniVydaj.id);
                Alert.alert('Úspěch', 'Poslední výdaj byl smazán');
                await nactiData();
              } catch (error) {
                console.error('Chyba při mazání výdaje:', error);
                Alert.alert('Chyba', 'Nepodařilo se smazat výdaj');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Chyba při mazání posledního výdaje:', error);
      Alert.alert('Chyba', 'Nepodařilo se načíst výdaje');
    }
  }, [nactiData]);

  const formatujDatum = useCallback((datum: string): string => {
    const date = new Date(datum);
    return date.toLocaleDateString('cs-CZ');
  }, []);



  return {
    state,
    mesicniVydaje,
    formatujCastku,
    formatujDatum,
    handleCastkaChange,
    handleDatumChange,
    handleKategorieChange,
    handleDatePickerVisibilityChange,
    handleSubmit,
    nactiData,
    zmenitMesic,
    vybranyMesic,
    vybranyRok,
    getNazevMesice,
    getNazevDne,
    jeVikend,
    rozdelZaznamyDoSloupcu,
    smazatPosledniVydaj,
  };
};
