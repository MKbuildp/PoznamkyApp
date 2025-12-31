import { useState, useCallback, useMemo } from 'react';
import { useFirestoreRealtime } from '../../../hooks/useFirestoreRealtime';
import { FIRESTORE_COLLECTIONS, FirestorePrijem, FirestoreVydaj } from '../../../services/firestoreService';

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
 * @description Hook pro práci s daty tabulky přehledu s real-time synchronizací
 */
export const usePrehledTabulka = (): UsePrehledTabulkaReturn => {
  const [vybranyRok, setVybranyRok] = useState<number>(new Date().getFullYear());

  // Real-time synchronizace příjmů z Firestore
  const { 
    data: firestorePrijmy, 
    loading: prijmyNacitaSe 
  } = useFirestoreRealtime<FirestorePrijem>({
    collectionName: FIRESTORE_COLLECTIONS.PRIJMY,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: (doc) => ({
      id: doc.id,
      castka: doc.castka,
      datum: doc.datum,
      kategorie: doc.kategorie,
      popis: doc.popis,
      firestoreId: doc.id
    })
  });

  // Real-time synchronizace výdajů z Firestore
  const { 
    data: firestoreVydaje, 
    loading: vydajeNacitaSe 
  } = useFirestoreRealtime<FirestoreVydaj>({
    collectionName: FIRESTORE_COLLECTIONS.VYDAJE,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: (doc) => ({
      id: doc.id,
      castka: doc.castka,
      datum: doc.datum,
      kategorie: doc.kategorie,
      dodavatel: doc.dodavatel,
      firestoreId: doc.id
    })
  });

  // Výpočet měsíčních dat pro vybraný rok
  const rocniData = useMemo(() => {
    // Inicializace pole pro všechny měsíce
    const mesicniData: MesicniData[] = Array.from({ length: 12 }, (_, index) => ({
      mesic: index,
      vydaje: 0,
      prijmy: 0,
      bilance: 0
    }));

    // Zpracování příjmů
    firestorePrijmy.forEach((prijem) => {
      const datumPrijmu = new Date(prijem.datum);
      if (datumPrijmu.getFullYear() === vybranyRok) {
        const mesic = datumPrijmu.getMonth();
        mesicniData[mesic].prijmy += prijem.castka;
      }
    });

    // Zpracování výdajů
    firestoreVydaje.forEach((vydaj) => {
      const datumVydaje = new Date(vydaj.datum);
      if (datumVydaje.getFullYear() === vybranyRok) {
        const mesic = datumVydaje.getMonth();
        mesicniData[mesic].vydaje += vydaj.castka;
      }
    });

    // Výpočet bilance pro každý měsíc
    mesicniData.forEach(data => {
      data.bilance = data.prijmy - data.vydaje;
    });

    return mesicniData;
  }, [firestorePrijmy, firestoreVydaje, vybranyRok]);

  const nacitaSe = prijmyNacitaSe || vydajeNacitaSe;

  const zmenitRok = useCallback((rok: number) => {
    setVybranyRok(rok);
    // Real-time listener automaticky aktualizuje data
  }, []);

  // Placeholder funkce pro kompatibilitu
  const nactiDataProRok = useCallback(async (rok: number) => {
    setVybranyRok(rok);
    // Real-time listener automaticky načítá data
  }, []);

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