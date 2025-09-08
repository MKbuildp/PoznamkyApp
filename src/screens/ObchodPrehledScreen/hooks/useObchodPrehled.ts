import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Prijem, 
  KategoriePrijmu,
  ObchodPrehledState, 
  UseObchodPrehledReturn, 
  DenniZaznamObchodu 
} from '../types/types';

const ASYNC_STORAGE_KEY = 'seznamPrijmuData_v2'; // Stejný klíč jako v usePrijmy
const VYDAJE_STORAGE_KEY = 'seznamVydajuData_v1'; // Klíč pro výdaje

// Typ pro výdaj
interface Vydaj {
  id: string;
  castka: number;
  datum: string;
  kategorie: 'ZBOZI' | 'PROVOZ';
  dodavatel: string;
}

/**
 * @description Hook pro logiku obrazovky ObchodPrehledScreen.
 */
export const useObchodPrehled = (
  vybranyMesic: number = new Date().getMonth(),
  vybranyRok: number = new Date().getFullYear()
): UseObchodPrehledReturn => {
  const [stav, setStav] = useState<ObchodPrehledState>({
    denniZaznamy: [],
    mesicniPrijemObchod: 0,
    nacitaSe: true,
    vsechnyPrijmy: [],
  });

  // Stav pro jiné příjmy a měsíční výdaje
  const [jinePrijmy, setJinePrijmy] = useState<Prijem[]>([]);
  const [mesicniVydaje, setMesicniVydaje] = useState<number>(0);

  const formatujCastku = useCallback((castka: number): string => {
    return `${Math.round(castka).toLocaleString('cs-CZ')} Kč`;
  }, []);

  const formatujDatumZeStringu = useCallback((datum: string): string => {
    const date = new Date(datum);
    return date.toLocaleDateString('cs-CZ');
  }, []);

  const zpracujData = useCallback((prijmy: Prijem[]) => {
    const dnyVMesici = new Date(vybranyRok, vybranyMesic + 1, 0).getDate();
    const noveDenniZaznamy: DenniZaznamObchodu[] = [];

    // Filtruj příjmy pro kategorii "Tržba" a vybraný měsíc/rok
    const mesicniPrijmyObchod = prijmy
      .filter(p => p.kategorie === KategoriePrijmu.TRZBA)
      .filter(p => {
      const datumPrijmu = new Date(p.datum);
      return (
          datumPrijmu.getFullYear() === vybranyRok &&
          datumPrijmu.getMonth() === vybranyMesic
      );
    });

    const soucetMesicniPrijem = mesicniPrijmyObchod.reduce((sum, p) => sum + p.castka, 0);

    // Vytvoř záznam pro každý den v měsíci
    for (let den = 1; den <= dnyVMesici; den++) {
      const datumString = `${vybranyRok}-${String(vybranyMesic + 1).padStart(2, '0')}-${String(den).padStart(2, '0')}`;
      
      // Najdi příjmy pro tento den
      const prijemProDen = mesicniPrijmyObchod
        .filter(p => {
            const datumPrijmu = new Date(p.datum);
            return datumPrijmu.getDate() === den;
        })
        .reduce((sum, p) => sum + p.castka, 0);
      
      noveDenniZaznamy.push({
        den: den,
        datum: datumString,
        castka: prijemProDen,
      });
    }

    return {
      denniZaznamy: noveDenniZaznamy,
      mesicniPrijemObchod: soucetMesicniPrijem,
    };
  }, [vybranyMesic, vybranyRok]);

  const nactiData = useCallback(async () => {
    setStav(s => ({ ...s, nacitaSe: true }));
    try {
      const jsonValue = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      const nactenePrijmy: Prijem[] = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      const zpracovanaData = zpracujData(nactenePrijmy);
      
      setStav(s => ({
        ...s,
        ...zpracovanaData,
        vsechnyPrijmy: nactenePrijmy,
        nacitaSe: false,
      }));
    } catch (e) {
      console.error('Nepodařilo se načíst příjmy z AsyncStorage v useObchodPrehled:', e);
      setStav(s => ({ ...s, nacitaSe: false }));
    }
  }, [zpracujData]);

  // Načtení jiných příjmů pro vybraný měsíc
  const nactiJinePrijmy = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      if (jsonValue) {
        const vsechnyPrijmy: Prijem[] = JSON.parse(jsonValue);
        const jinePrijmyData = vsechnyPrijmy
          .filter(prijem => prijem.kategorie === KategoriePrijmu.JINE)
          .filter(prijem => {
            const datumPrijmu = new Date(prijem.datum);
            return (
              datumPrijmu.getFullYear() === vybranyRok &&
              datumPrijmu.getMonth() === vybranyMesic
            );
          });
        setJinePrijmy(jinePrijmyData);
      }
    } catch (error) {
      console.error('Chyba při načítání jiných příjmů:', error);
    }
  }, [vybranyMesic, vybranyRok]);

  // Načtení měsíčních výdajů (pouze kategorie PROVOZ)
  const nactiMesicniVydaje = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(VYDAJE_STORAGE_KEY);
      if (jsonValue) {
        const vsechnyVydaje: Vydaj[] = JSON.parse(jsonValue);
        const mesicniVydajeData = vsechnyVydaje
          .filter(vydaj => {
            const datumVydaje = new Date(vydaj.datum);
            return (
              datumVydaje.getFullYear() === vybranyRok &&
              datumVydaje.getMonth() === vybranyMesic &&
              vydaj.kategorie === 'PROVOZ' // Pouze výdaje kategorie PROVOZ
            );
          })
          .reduce((sum, vydaj) => sum + vydaj.castka, 0);
        setMesicniVydaje(mesicniVydajeData);
      }
    } catch (error) {
      console.error('Chyba při načítání měsíčních výdajů:', error);
      setMesicniVydaje(0);
    }
  }, [vybranyMesic, vybranyRok]);

  // Inicializační načtení dat
  useEffect(() => {
    nactiData();
    nactiJinePrijmy();
    nactiMesicniVydaje();
  }, [nactiData, nactiJinePrijmy, nactiMesicniVydaje]);

  // Smazání jiného příjmu
  const smazatJinyPrijem = useCallback(async (id: string) => {
    try {
      const jsonValue = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      if (jsonValue) {
        const vsechnyPrijmy: Prijem[] = JSON.parse(jsonValue);
        const novePrijmy = vsechnyPrijmy.filter(prijem => prijem.id !== id);
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(novePrijmy));
        await nactiJinePrijmy();
        await nactiData();
        await nactiMesicniVydaje();
        Alert.alert('Úspěch', 'Příjem byl smazán');
      }
    } catch (error) {
      console.error('Chyba při mazání příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se smazat příjem');
    }
  }, [nactiJinePrijmy, nactiData, nactiMesicniVydaje]);

  return {
    ...stav,
    jinePrijmy,
    mesicniVydaje,
    formatujCastku,
    formatujDatumZeStringu,
    nactiData,
    nactiJinePrijmy,
    nactiMesicniVydaje,
    smazatJinyPrijem,
  };
}; 