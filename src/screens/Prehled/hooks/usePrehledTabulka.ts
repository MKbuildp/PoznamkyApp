import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIJMY_STORAGE_KEY = 'seznamPrijmuData_v2';
const VYDAJE_STORAGE_KEY = 'seznamVydajuData_v1';

interface MesicniData {
  mesic: number;
  vydaje: number;
  prijmy: number;
  bilance: number;
}

interface UsePrehledTabulkaReturn {
  rocniData: MesicniData[];
  vybranyRok: number;
  nacitaSe: boolean;
  zmenitRok: (rok: number) => void;
  nactiDataProRok: (rok: number) => Promise<void>;
  formatujCastku: (castka: number) => string;
}

/**
 * @description Hook pro práci s daty tabulky přehledu
 */
export const usePrehledTabulka = (): UsePrehledTabulkaReturn => {
  const [rocniData, setRocniData] = useState<MesicniData[]>([]);
  const [vybranyRok, setVybranyRok] = useState<number>(new Date().getFullYear());
  const [nacitaSe, setNacitaSe] = useState<boolean>(true);

  const nactiDataProRok = useCallback(async (rok: number) => {
    setNacitaSe(true);
    try {
      // Načtení příjmů
      const prijmyString = await AsyncStorage.getItem(PRIJMY_STORAGE_KEY);
      const prijmy = prijmyString ? JSON.parse(prijmyString) : [];

      // Načtení výdajů
      const vydajeString = await AsyncStorage.getItem(VYDAJE_STORAGE_KEY);
      const vydaje = vydajeString ? JSON.parse(vydajeString) : [];

      // Inicializace pole pro všechny měsíce
      const mesicniData: MesicniData[] = Array.from({ length: 12 }, (_, index) => ({
        mesic: index,
        vydaje: 0,
        prijmy: 0,
        bilance: 0
      }));

      // Zpracování příjmů
      prijmy.forEach((prijem: { castka: number; datum: string }) => {
        const datumPrijmu = new Date(prijem.datum);
        if (datumPrijmu.getFullYear() === rok) {
          const mesic = datumPrijmu.getMonth();
          mesicniData[mesic].prijmy += prijem.castka;
        }
      });

      // Zpracování výdajů
      vydaje.forEach((vydaj: { castka: number; datum: string }) => {
        const datumVydaje = new Date(vydaj.datum);
        if (datumVydaje.getFullYear() === rok) {
          const mesic = datumVydaje.getMonth();
          mesicniData[mesic].vydaje += vydaj.castka;
        }
      });

      // Výpočet bilance pro každý měsíc
      mesicniData.forEach(data => {
        data.bilance = data.prijmy - data.vydaje;
      });

      setRocniData(mesicniData);
      setNacitaSe(false);
    } catch (error) {
      console.error('Chyba při načítání dat tabulky:', error);
      setNacitaSe(false);
    }
  }, []);

  const zmenitRok = useCallback((rok: number) => {
    setVybranyRok(rok);
    nactiDataProRok(rok);
  }, [nactiDataProRok]);

  const formatujCastku = useCallback((castka: number): string => {
    return `${Math.round(castka).toLocaleString('cs-CZ')} Kč`;
  }, []);

  return {
    rocniData,
    vybranyRok,
    nacitaSe,
    zmenitRok,
    nactiDataProRok,
    formatujCastku
  };
}; 