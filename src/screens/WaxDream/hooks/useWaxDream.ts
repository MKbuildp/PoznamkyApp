/** useWaxDream - Hook pro správu dat WaxDream s AsyncStorage a Firebase */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreService } from '../../../services/firestoreService';

// Typy pro WaxDream data
export interface WaxDreamPrijem {
  id: string;
  castka: number;
  datum: string; // ISO string
  popis: string;
  rok: number;
  firestoreId?: string; // ID v Firestore pro synchronizaci
}

export interface WaxDreamVydaj {
  id: string;
  castka: number;
  datum: string; // ISO string
  kategorie: 'MATERIAL' | 'PROVOZ';
  dodavatel: string;
  rok: number;
  firestoreId?: string; // ID v Firestore pro synchronizaci
}

export interface WaxDreamState {
  prijmy: WaxDreamPrijem[];
  vydaje: WaxDreamVydaj[];
  vybranyRok: number;
  nacitaSe: boolean;
}

export interface WaxDreamHandlers {
  // Příjmy
  pridatPrijem: (castka: number, datum: Date, popis: string) => Promise<void>;
  upravitPrijem: (prijem: WaxDreamPrijem) => Promise<void>;
  smazatPrijem: (prijem: WaxDreamPrijem) => Promise<void>;
  
  // Výdaje
  pridatVydaj: (castka: number, datum: Date, kategorie: 'MATERIAL' | 'PROVOZ', dodavatel: string) => Promise<void>;
  upravitVydaj: (vydaj: WaxDreamVydaj) => Promise<void>;
  smazatVydaj: (vydaj: WaxDreamVydaj) => Promise<void>;
  
  // Rok
  zmenitRok: (rok: number) => void;
  
  // Data
  nactiData: () => Promise<void>;
  
  // Utility funkce
  formatujCastku: (castka: number) => string;
  vypoctiCelkovePrijmy: () => number;
  vypoctiCelkoveVydaje: () => number;
  vypoctiBilance: () => number;
  vypoctiMaterialVydaje: () => number;
  vypoctiProvozVydaje: () => number;
}

const ASYNC_STORAGE_KEYS = {
  PRIJMY: 'waxdream_prijmy',
  VYDAJE: 'waxdream_vydaje',
  VYBRANY_ROK: 'waxdream_vybrany_rok',
} as const;

export const useWaxDream = (): { state: WaxDreamState; handlers: WaxDreamHandlers } => {
  const [state, setState] = useState<WaxDreamState>({
    prijmy: [],
    vydaje: [],
    vybranyRok: new Date().getFullYear(),
    nacitaSe: true,
  });

  /**
   * @description Načte data z AsyncStorage
   */
  const nactiData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, nacitaSe: true }));
      
      const [prijmyData, vydajeData, vybranyRokData] = await Promise.all([
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.PRIJMY),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.VYDAJE),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.VYBRANY_ROK),
      ]);

      const prijmy: WaxDreamPrijem[] = prijmyData ? JSON.parse(prijmyData) : [];
      const vydaje: WaxDreamVydaj[] = vydajeData ? JSON.parse(vydajeData) : [];
      const vybranyRok = vybranyRokData ? parseInt(vybranyRokData) : new Date().getFullYear();

      setState({
        prijmy,
        vydaje,
        vybranyRok,
        nacitaSe: false,
      });
    } catch (error) {
      console.error('Chyba při načítání dat WaxDream:', error);
      setState(prev => ({ ...prev, nacitaSe: false }));
    }
  }, []);

  /**
   * @description Uloží příjmy do AsyncStorage
   */
  const ulozPrijmy = useCallback(async (prijmy: WaxDreamPrijem[]) => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.PRIJMY, JSON.stringify(prijmy));
    } catch (error) {
      console.error('Chyba při ukládání příjmů WaxDream:', error);
    }
  }, []);

  /**
   * @description Uloží výdaje do AsyncStorage
   */
  const ulozVydaje = useCallback(async (vydaje: WaxDreamVydaj[]) => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.VYDAJE, JSON.stringify(vydaje));
    } catch (error) {
      console.error('Chyba při ukládání výdajů WaxDream:', error);
    }
  }, []);

  /**
   * @description Uloží vybraný rok do AsyncStorage
   */
  const ulozVybranyRok = useCallback(async (rok: number) => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.VYBRANY_ROK, rok.toString());
    } catch (error) {
      console.error('Chyba při ukládání vybraného roku WaxDream:', error);
    }
  }, []);

  // Handlers
  const handlers: WaxDreamHandlers = {
    /**
     * @description Přidá nový příjem
     */
    pridatPrijem: async (castka: number, datum: Date, popis: string) => {
      const novyPrijem: WaxDreamPrijem = {
        id: Date.now().toString(),
        castka,
        datum: datum.toISOString(),
        popis,
        rok: datum.getFullYear(),
      };

      // Synchronizace s Firebase
      try {
        const firestoreId = await FirestoreService.ulozWaxDreamPrijem({
          castka: novyPrijem.castka,
          datum: novyPrijem.datum,
          popis: novyPrijem.popis,
          rok: novyPrijem.rok
        });
        novyPrijem.firestoreId = firestoreId;
      } catch (error) {
        console.error('Chyba při synchronizaci příjmu s Firebase:', error);
        // Pokračujeme i při chybě - data se uloží lokálně
      }

      const novePrijmy = [...state.prijmy, novyPrijem];
      setState(prev => ({ ...prev, prijmy: novePrijmy }));
      await ulozPrijmy(novePrijmy);
    },

  /**
   * @description Upraví existující příjem
   */
  upravitPrijem: async (upravenyPrijem: WaxDreamPrijem) => {
    // Synchronizace s Firebase
    if (upravenyPrijem.firestoreId) {
      try {
        await FirestoreService.aktualizujWaxDreamPrijem(upravenyPrijem.firestoreId, {
          castka: upravenyPrijem.castka,
          datum: upravenyPrijem.datum,
          popis: upravenyPrijem.popis,
          rok: upravenyPrijem.rok
        });
      } catch (error) {
        console.error('Chyba při aktualizaci příjmu v Firebase:', error);
        // Pokračujeme i při chybě
      }
    }

    const novePrijmy = state.prijmy.map(p => 
      p.id === upravenyPrijem.id ? upravenyPrijem : p
    );
    setState(prev => ({ ...prev, prijmy: novePrijmy }));
    await ulozPrijmy(novePrijmy);
  },

  /**
   * @description Smaže příjem
   */
  smazatPrijem: async (prijem: WaxDreamPrijem) => {
    // Synchronizace s Firebase
    if (prijem.firestoreId) {
      try {
        await FirestoreService.smazWaxDreamPrijem(prijem.firestoreId);
      } catch (error) {
        console.error('Chyba při mazání příjmu z Firebase:', error);
        // Pokračujeme i při chybě
      }
    }

    const novePrijmy = state.prijmy.filter(p => p.id !== prijem.id);
    setState(prev => ({ ...prev, prijmy: novePrijmy }));
    await ulozPrijmy(novePrijmy);
  },

    /**
     * @description Přidá nový výdaj
     */
    pridatVydaj: async (castka: number, datum: Date, kategorie: 'MATERIAL' | 'PROVOZ', dodavatel: string) => {
      const novyVydaj: WaxDreamVydaj = {
        id: Date.now().toString(),
        castka,
        datum: datum.toISOString(),
        kategorie,
        dodavatel,
        rok: datum.getFullYear(),
      };

      // Synchronizace s Firebase
      try {
        const firestoreId = await FirestoreService.ulozWaxDreamVydaj({
          castka: novyVydaj.castka,
          datum: novyVydaj.datum,
          kategorie: novyVydaj.kategorie,
          dodavatel: novyVydaj.dodavatel,
          rok: novyVydaj.rok
        });
        novyVydaj.firestoreId = firestoreId;
      } catch (error) {
        console.error('Chyba při synchronizaci výdaje s Firebase:', error);
        // Pokračujeme i při chybě - data se uloží lokálně
      }

      const noveVydaje = [...state.vydaje, novyVydaj];
      setState(prev => ({ ...prev, vydaje: noveVydaje }));
      await ulozVydaje(noveVydaje);
    },

  /**
   * @description Upraví existující výdaj
   */
  upravitVydaj: async (upravenyVydaj: WaxDreamVydaj) => {
    // Synchronizace s Firebase
    if (upravenyVydaj.firestoreId) {
      try {
        await FirestoreService.aktualizujWaxDreamVydaj(upravenyVydaj.firestoreId, {
          castka: upravenyVydaj.castka,
          datum: upravenyVydaj.datum,
          kategorie: upravenyVydaj.kategorie,
          dodavatel: upravenyVydaj.dodavatel,
          rok: upravenyVydaj.rok
        });
      } catch (error) {
        console.error('Chyba při aktualizaci výdaje v Firebase:', error);
        // Pokračujeme i při chybě
      }
    }

    const noveVydaje = state.vydaje.map(v => 
      v.id === upravenyVydaj.id ? upravenyVydaj : v
    );
    setState(prev => ({ ...prev, vydaje: noveVydaje }));
    await ulozVydaje(noveVydaje);
  },

  /**
   * @description Smaže výdaj
   */
  smazatVydaj: async (vydaj: WaxDreamVydaj) => {
    // Synchronizace s Firebase
    if (vydaj.firestoreId) {
      try {
        await FirestoreService.smazWaxDreamVydaj(vydaj.firestoreId);
      } catch (error) {
        console.error('Chyba při mazání výdaje z Firebase:', error);
        // Pokračujeme i při chybě
      }
    }

    const noveVydaje = state.vydaje.filter(v => v.id !== vydaj.id);
    setState(prev => ({ ...prev, vydaje: noveVydaje }));
    await ulozVydaje(noveVydaje);
  },

    /**
     * @description Změní vybraný rok
     */
    zmenitRok: (rok: number) => {
      setState(prev => ({ ...prev, vybranyRok: rok }));
      ulozVybranyRok(rok);
    },

    /**
     * @description Načte data z AsyncStorage
     */
    nactiData: async () => {
      await nactiData();
    },

    /**
     * @description Formátuje částku
     */
    formatujCastku: (castka: number) => `${castka.toLocaleString()} Kč`,

    /**
     * @description Vypočítá celkové příjmy pro vybraný rok
     */
    vypoctiCelkovePrijmy: () => {
      return state.prijmy
        .filter(prijem => prijem.rok === state.vybranyRok)
        .reduce((sum, prijem) => sum + prijem.castka, 0);
    },

    /**
     * @description Vypočítá celkové výdaje pro vybraný rok
     */
    vypoctiCelkoveVydaje: () => {
      return state.vydaje
        .filter(vydaj => vydaj.rok === state.vybranyRok)
        .reduce((sum, vydaj) => sum + vydaj.castka, 0);
    },

    /**
     * @description Vypočítá bilanci pro vybraný rok
     */
    vypoctiBilance: () => {
      const prijmy = handlers.vypoctiCelkovePrijmy();
      const vydaje = handlers.vypoctiCelkoveVydaje();
      return prijmy - vydaje;
    },

    /**
     * @description Vypočítá výdaje za materiál pro vybraný rok
     */
    vypoctiMaterialVydaje: () => {
      return state.vydaje
        .filter(vydaj => vydaj.rok === state.vybranyRok && vydaj.kategorie === 'MATERIAL')
        .reduce((sum, vydaj) => sum + vydaj.castka, 0);
    },

    /**
     * @description Vypočítá výdaje za provoz pro vybraný rok
     */
    vypoctiProvozVydaje: () => {
      return state.vydaje
        .filter(vydaj => vydaj.rok === state.vybranyRok && vydaj.kategorie === 'PROVOZ')
        .reduce((sum, vydaj) => sum + vydaj.castka, 0);
    },
  };

  // Načtení dat při inicializaci
  useEffect(() => {
    nactiData();
  }, [nactiData]);

  return { state, handlers };
};
