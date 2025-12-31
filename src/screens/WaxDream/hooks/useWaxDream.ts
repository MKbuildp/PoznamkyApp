/** useWaxDream - Hook pro správu dat WaxDream s real-time Firebase synchronizací */
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFirestoreRealtime } from '../../../hooks/useFirestoreRealtime';
import { FirestoreService, FIRESTORE_COLLECTIONS, FirestoreWaxDreamPrijem, FirestoreWaxDreamVydaj } from '../../../services/firestoreService';

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

const ASYNC_STORAGE_KEY_VYBRANY_ROK = 'waxdream_vybrany_rok';

/**
 * @description Transformace Firestore dat na lokální typ pro příjmy
 */
const transformWaxDreamPrijem = (doc: any): WaxDreamPrijem => {
  return {
    id: doc.id,
    castka: doc.castka,
    datum: doc.datum,
    popis: doc.popis,
    rok: doc.rok,
    firestoreId: doc.id
  };
};

/**
 * @description Transformace Firestore dat na lokální typ pro výdaje
 */
const transformWaxDreamVydaj = (doc: any): WaxDreamVydaj => {
  return {
    id: doc.id,
    castka: doc.castka,
    datum: doc.datum,
    kategorie: doc.kategorie,
    dodavatel: doc.dodavatel,
    rok: doc.rok,
    firestoreId: doc.id
  };
};

export const useWaxDream = (): { state: WaxDreamState; handlers: WaxDreamHandlers } => {
  const [vybranyRok, setVybranyRok] = useState(new Date().getFullYear());

  // Real-time synchronizace příjmů z Firestore
  const { 
    data: firestorePrijmy, 
    loading: prijmyNacitaSe, 
    error: prijmyError 
  } = useFirestoreRealtime<FirestoreWaxDreamPrijem>({
    collectionName: FIRESTORE_COLLECTIONS.WAXDREAM_PRIJMY,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: transformWaxDreamPrijem
  });

  // Real-time synchronizace výdajů z Firestore
  const { 
    data: firestoreVydaje, 
    loading: vydajeNacitaSe, 
    error: vydajeError 
  } = useFirestoreRealtime<FirestoreWaxDreamVydaj>({
    collectionName: FIRESTORE_COLLECTIONS.WAXDREAM_VYDAJE,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: transformWaxDreamVydaj
  });

  // Transformace na lokální typy
  const prijmy: WaxDreamPrijem[] = useMemo(() => {
    return firestorePrijmy.map(p => ({
      id: p.id || '',
      castka: p.castka,
      datum: p.datum,
      popis: p.popis,
      rok: p.rok,
      firestoreId: p.id
    }));
  }, [firestorePrijmy]);

  const vydaje: WaxDreamVydaj[] = useMemo(() => {
    return firestoreVydaje.map(v => ({
      id: v.id || '',
      castka: v.castka,
      datum: v.datum,
      kategorie: v.kategorie,
      dodavatel: v.dodavatel,
      rok: v.rok,
      firestoreId: v.id
    }));
  }, [firestoreVydaje]);

  // Načtení vybraného roku z AsyncStorage (pouze pro UI preferenci)
  useEffect(() => {
    const nactiVybranyRok = async () => {
      try {
        const vybranyRokData = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_VYBRANY_ROK);
        if (vybranyRokData) {
          setVybranyRok(parseInt(vybranyRokData));
        }
      } catch (error) {
        console.error('Chyba při načítání vybraného roku:', error);
      }
    };
    nactiVybranyRok();
  }, []);

  // Error handling
  if (prijmyError) {
    console.error('Firestore error v useWaxDream (příjmy):', prijmyError);
  }
  if (vydajeError) {
    console.error('Firestore error v useWaxDream (výdaje):', vydajeError);
  }

  const nacitaSe = prijmyNacitaSe || vydajeNacitaSe;

  // Handlers
  const handlers: WaxDreamHandlers = {
    /**
     * @description Přidá nový příjem
     */
    pridatPrijem: async (castka: number, datum: Date, popis: string) => {
      try {
        // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
        await FirestoreService.ulozWaxDreamPrijem({
          castka,
          datum: datum.toISOString(),
          popis,
          rok: datum.getFullYear()
        });
      } catch (error) {
        console.error('Chyba při ukládání příjmu do Firestore:', error);
        throw error;
      }
    },

    /**
     * @description Upraví existující příjem
     */
    upravitPrijem: async (upravenyPrijem: WaxDreamPrijem) => {
      if (!upravenyPrijem.firestoreId) {
        throw new Error('Záznam nemá Firestore ID');
      }

      try {
        await FirestoreService.aktualizujWaxDreamPrijem(upravenyPrijem.firestoreId, {
          castka: upravenyPrijem.castka,
          datum: upravenyPrijem.datum,
          popis: upravenyPrijem.popis,
          rok: upravenyPrijem.rok
        });
        // Real-time listener automaticky aktualizuje UI
      } catch (error) {
        console.error('Chyba při aktualizaci příjmu v Firestore:', error);
        throw error;
      }
    },

    /**
     * @description Smaže příjem
     */
    smazatPrijem: async (prijem: WaxDreamPrijem) => {
      if (!prijem.firestoreId) {
        throw new Error('Záznam nemá Firestore ID');
      }

      try {
        await FirestoreService.smazWaxDreamPrijem(prijem.firestoreId);
        // Real-time listener automaticky aktualizuje UI
      } catch (error) {
        console.error('Chyba při mazání příjmu z Firestore:', error);
        throw error;
      }
    },

    /**
     * @description Přidá nový výdaj
     */
    pridatVydaj: async (castka: number, datum: Date, kategorie: 'MATERIAL' | 'PROVOZ', dodavatel: string) => {
      try {
        // Přímé uložení do Firestore (real-time listener automaticky aktualizuje UI)
        await FirestoreService.ulozWaxDreamVydaj({
          castka,
          datum: datum.toISOString(),
          kategorie,
          dodavatel,
          rok: datum.getFullYear()
        });
      } catch (error) {
        console.error('Chyba při ukládání výdaje do Firestore:', error);
        throw error;
      }
    },

    /**
     * @description Upraví existující výdaj
     */
    upravitVydaj: async (upravenyVydaj: WaxDreamVydaj) => {
      if (!upravenyVydaj.firestoreId) {
        throw new Error('Záznam nemá Firestore ID');
      }

      try {
        await FirestoreService.aktualizujWaxDreamVydaj(upravenyVydaj.firestoreId, {
          castka: upravenyVydaj.castka,
          datum: upravenyVydaj.datum,
          kategorie: upravenyVydaj.kategorie,
          dodavatel: upravenyVydaj.dodavatel,
          rok: upravenyVydaj.rok
        });
        // Real-time listener automaticky aktualizuje UI
      } catch (error) {
        console.error('Chyba při aktualizaci výdaje v Firestore:', error);
        throw error;
      }
    },

    /**
     * @description Smaže výdaj
     */
    smazatVydaj: async (vydaj: WaxDreamVydaj) => {
      if (!vydaj.firestoreId) {
        throw new Error('Záznam nemá Firestore ID');
      }

      try {
        await FirestoreService.smazWaxDreamVydaj(vydaj.firestoreId);
        // Real-time listener automaticky aktualizuje UI
      } catch (error) {
        console.error('Chyba při mazání výdaje z Firestore:', error);
        throw error;
      }
    },

    /**
     * @description Změní vybraný rok
     */
    zmenitRok: (rok: number) => {
      setVybranyRok(rok);
      // Uložení do AsyncStorage pouze pro UI preferenci
      AsyncStorage.setItem(ASYNC_STORAGE_KEY_VYBRANY_ROK, rok.toString()).catch(error => {
        console.error('Chyba při ukládání vybraného roku:', error);
      });
    },

    /**
     * @description Načte data - placeholder pro kompatibilitu
     */
    nactiData: async () => {
      // Real-time listener automaticky načítá data
      // Tato funkce je pouze pro kompatibilitu
    },

    /**
     * @description Formátuje částku
     */
    formatujCastku: (castka: number) => `${castka.toLocaleString()} Kč`,

    /**
     * @description Vypočítá celkové příjmy pro vybraný rok
     */
    vypoctiCelkovePrijmy: () => {
      return prijmy
        .filter(prijem => prijem.rok === vybranyRok)
        .reduce((sum, prijem) => sum + prijem.castka, 0);
    },

    /**
     * @description Vypočítá celkové výdaje pro vybraný rok
     */
    vypoctiCelkoveVydaje: () => {
      return vydaje
        .filter(vydaj => vydaj.rok === vybranyRok)
        .reduce((sum, vydaj) => sum + vydaj.castka, 0);
    },

    /**
     * @description Vypočítá bilanci pro vybraný rok
     */
    vypoctiBilance: () => {
      const prijmySum = handlers.vypoctiCelkovePrijmy();
      const vydajeSum = handlers.vypoctiCelkoveVydaje();
      return prijmySum - vydajeSum;
    },

    /**
     * @description Vypočítá výdaje za materiál pro vybraný rok
     */
    vypoctiMaterialVydaje: () => {
      return vydaje
        .filter(vydaj => vydaj.rok === vybranyRok && vydaj.kategorie === 'MATERIAL')
        .reduce((sum, vydaj) => sum + vydaj.castka, 0);
    },

    /**
     * @description Vypočítá výdaje za provoz pro vybraný rok
     */
    vypoctiProvozVydaje: () => {
      return vydaje
        .filter(vydaj => vydaj.rok === vybranyRok && vydaj.kategorie === 'PROVOZ')
        .reduce((sum, vydaj) => sum + vydaj.castka, 0);
    },
  };

  return { 
    state: {
      prijmy,
      vydaje,
      vybranyRok,
      nacitaSe
    }, 
    handlers 
  };
};
