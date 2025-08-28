import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from '../../../services/storage/syncService';
import { useFocusEffect } from '@react-navigation/native';

const PRIJMY_STORAGE_KEY = 'seznamPrijmuData_v2';
const VYDAJE_STORAGE_KEY = 'seznamVydajuData_v1';

interface PrehledState {
  celkovePrijmy: number;
  celkoveVydaje: number;
  celkoveVydajeZbozi: number;
  celkoveVydajeProvoz: number;
  nacitaSe: boolean;
}

interface UsePrehledReturn extends PrehledState {
  formatujCastku: (castka: number) => string;
}

/**
 * @description Hook pro načítání celkových částek příjmů a výdajů
 */
export const usePrehled = (): UsePrehledReturn => {
  const [state, setState] = useState<PrehledState>({
    celkovePrijmy: 0,
    celkoveVydaje: 0,
    celkoveVydajeZbozi: 0,
    celkoveVydajeProvoz: 0,
    nacitaSe: true,
  });

  // FIREBASE INTEGRACE: Načítání dat přes syncService
  const nactiData = useCallback(async () => {
    setState(prev => ({ ...prev, nacitaSe: true }));
    try {
      // Načtení příjmů přes syncService
      const prijmy = await syncService.nactiLokalnDataProUI('prijmy');
      const celkovePrijmy = prijmy.reduce((sum: number, prijem: any) => 
        sum + prijem.castka, 0);

      // Načtení výdajů přes syncService
      const vydaje = await syncService.nactiLokalnDataProUI('vydaje');
      
      // Výpočet celkových výdajů a výdajů podle kategorií
      const celkoveVydaje = vydaje.reduce((sum: number, vydaj: { castka: number }) => 
        sum + vydaj.castka, 0);
      
      const celkoveVydajeZbozi = vydaje
        .filter((vydaj: { kategorie: string }) => vydaj.kategorie === 'ZBOZI')
        .reduce((sum: number, vydaj: { castka: number }) => sum + vydaj.castka, 0);
      
      const celkoveVydajeProvoz = vydaje
        .filter((vydaj: { kategorie: string }) => vydaj.kategorie === 'PROVOZ')
        .reduce((sum: number, vydaj: { castka: number }) => sum + vydaj.castka, 0);

      setState({
        celkovePrijmy,
        celkoveVydaje,
        celkoveVydajeZbozi,
        celkoveVydajeProvoz,
        nacitaSe: false,
      });
    } catch (error) {
      console.error('Chyba při načítání dat přehledu:', error);
      setState(prev => ({ ...prev, nacitaSe: false }));
    }
  }, []);



  // Použijeme useFocusEffect místo useEffect pro aktualizaci při návratu na obrazovku
  useFocusEffect(
    useCallback(() => {
      nactiData();
    }, [nactiData])
  );

  const formatujCastku = useCallback((castka: number): string => {
    return `${Math.round(castka).toLocaleString('cs-CZ')} Kč`;
  }, []);

  return {
    ...state,
    formatujCastku,
  };
}; 