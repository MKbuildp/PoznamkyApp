import { useState, useCallback, useMemo } from 'react';
import { useFirestoreRealtime } from '../../../hooks/useFirestoreRealtime';
import { FIRESTORE_COLLECTIONS, FirestorePrijem, FirestoreVydaj } from '../../../services/firestoreService';

interface PrehledState {
  celkovePrijmy: number;
  celkoveVydaje: number;
  celkoveVydajeZbozi: number;
  celkoveVydajeProvoz: number;
  nacitaSe: boolean;
}

interface UsePrehledReturn extends PrehledState {
  formatujCastku: (castka: number) => string;
  nactiData: () => Promise<void>;
}

/**
 * @description Hook pro načítání celkových částek příjmů a výdajů s real-time synchronizací
 * @param vybranyRok - Rok, pro který se mají zobrazit data
 */
export const usePrehled = (vybranyRok: number): UsePrehledReturn => {
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

  // Výpočet celkových částek pro vybraný rok
  const vypocty = useMemo(() => {
    // Filtrování příjmů podle vybraného roku
    const prijmyZRoku = firestorePrijmy.filter((prijem) => {
      const datumPrijmu = new Date(prijem.datum);
      return datumPrijmu.getFullYear() === vybranyRok;
    });
    
    // Filtrování výdajů podle vybraného roku
    const vydajeZRoku = firestoreVydaje.filter((vydaj) => {
      const datumVydaje = new Date(vydaj.datum);
      return datumVydaje.getFullYear() === vybranyRok;
    });
    
    const celkovePrijmy = prijmyZRoku.reduce((sum, prijem) => sum + prijem.castka, 0);
    
    const celkoveVydaje = vydajeZRoku.reduce((sum, vydaj) => sum + vydaj.castka, 0);
    
    const celkoveVydajeZbozi = vydajeZRoku
      .filter(vydaj => vydaj.kategorie === 'ZBOZI')
      .reduce((sum, vydaj) => sum + vydaj.castka, 0);
    
    const celkoveVydajeProvoz = vydajeZRoku
      .filter(vydaj => vydaj.kategorie === 'PROVOZ')
      .reduce((sum, vydaj) => sum + vydaj.castka, 0);

    return {
      celkovePrijmy,
      celkoveVydaje,
      celkoveVydajeZbozi,
      celkoveVydajeProvoz
    };
  }, [firestorePrijmy, firestoreVydaje, vybranyRok]);

  const nacitaSe = prijmyNacitaSe || vydajeNacitaSe;

  const formatujCastku = useCallback((castka: number): string => {
    return `${Math.round(castka).toLocaleString('cs-CZ')} Kč`;
  }, []);

  // Placeholder funkce pro kompatibilitu
  const nactiData = useCallback(async () => {
    // Real-time listener automaticky načítá data
    // Tato funkce je pouze pro kompatibilitu
  }, []);

  return {
    celkovePrijmy: vypocty.celkovePrijmy,
    celkoveVydaje: vypocty.celkoveVydaje,
    celkoveVydajeZbozi: vypocty.celkoveVydajeZbozi,
    celkoveVydajeProvoz: vypocty.celkoveVydajeProvoz,
    nacitaSe,
    formatujCastku,
    nactiData,
  };
}; 