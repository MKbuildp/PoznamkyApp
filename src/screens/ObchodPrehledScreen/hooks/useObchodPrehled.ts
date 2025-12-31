import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useFirestoreRealtime } from '../../../hooks/useFirestoreRealtime';
import { FirestoreService, FIRESTORE_COLLECTIONS, FirestorePrijem, FirestoreVydaj } from '../../../services/firestoreService';
import { 
  Prijem, 
  KategoriePrijmu,
  ObchodPrehledState, 
  UseObchodPrehledReturn, 
  DenniZaznamObchodu 
} from '../types/types';

// Typ pro výdaj
interface Vydaj {
  id: string;
  castka: number;
  datum: string;
  kategorie: 'ZBOZI' | 'PROVOZ';
  dodavatel: string;
}

/**
 * @description Transformace Firestore dat na lokální typ pro příjmy
 */
const transformPrijem = (doc: any): Prijem => {
  return {
    id: doc.id,
    castka: doc.castka,
    datum: doc.datum,
    kategorie: doc.kategorie as KategoriePrijmu,
    popis: doc.popis || undefined,
    firestoreId: doc.id
  };
};

/**
 * @description Transformace Firestore dat na lokální typ pro výdaje
 */
const transformVydaj = (doc: any): Vydaj => {
  return {
    id: doc.id,
    castka: doc.castka,
    datum: doc.datum,
    kategorie: doc.kategorie as 'ZBOZI' | 'PROVOZ',
    dodavatel: doc.dodavatel
  };
};

/**
 * @description Hook pro logiku obrazovky ObchodPrehledScreen s real-time Firebase synchronizací.
 */
export const useObchodPrehled = (
  vybranyMesic: number = new Date().getMonth(),
  vybranyRok: number = new Date().getFullYear()
): UseObchodPrehledReturn => {
  // Real-time synchronizace příjmů z Firestore
  const { 
    data: firestorePrijmy, 
    loading: prijmyNacitaSe, 
    error: prijmyError 
  } = useFirestoreRealtime<FirestorePrijem>({
    collectionName: FIRESTORE_COLLECTIONS.PRIJMY,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: transformPrijem
  });

  // Real-time synchronizace výdajů z Firestore
  const { 
    data: firestoreVydaje, 
    loading: vydajeNacitaSe, 
    error: vydajeError 
  } = useFirestoreRealtime<FirestoreVydaj>({
    collectionName: FIRESTORE_COLLECTIONS.VYDAJE,
    orderByField: 'datum',
    orderByDirection: 'desc',
    transform: transformVydaj
  });

  // Transformace na lokální typy
  const vsechnyPrijmy: Prijem[] = useMemo(() => {
    return firestorePrijmy.map(p => ({
      id: p.id || '',
      castka: p.castka,
      datum: p.datum,
      kategorie: p.kategorie,
      popis: p.popis,
      firestoreId: p.id
    }));
  }, [firestorePrijmy]);

  const vsechnyVydaje: Vydaj[] = useMemo(() => {
    return firestoreVydaje.map(v => ({
      id: v.id || '',
      castka: v.castka,
      datum: v.datum,
      kategorie: v.kategorie as 'ZBOZI' | 'PROVOZ',
      dodavatel: v.dodavatel
    }));
  }, [firestoreVydaje]);

  const nacitaSe = prijmyNacitaSe || vydajeNacitaSe;

  // Error handling
  if (prijmyError) {
    console.error('Firestore error v useObchodPrehled (příjmy):', prijmyError);
  }
  if (vydajeError) {
    console.error('Firestore error v useObchodPrehled (výdaje):', vydajeError);
  }

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

  // Zpracování dat pro UI při změně dat z real-time listeneru
  const zpracovanaData = useMemo(() => {
    return zpracujData(vsechnyPrijmy);
  }, [vsechnyPrijmy, zpracujData]);

  // Filtrování jiných příjmů pro vybraný měsíc
  const jinePrijmy = useMemo(() => {
    return vsechnyPrijmy
      .filter(prijem => prijem.kategorie === KategoriePrijmu.JINE)
      .filter(prijem => {
        const datumPrijmu = new Date(prijem.datum);
        return (
          datumPrijmu.getFullYear() === vybranyRok &&
          datumPrijmu.getMonth() === vybranyMesic
        );
      });
  }, [vsechnyPrijmy, vybranyMesic, vybranyRok]);

  // Výpočet měsíčních výdajů (pouze kategorie PROVOZ)
  const mesicniVydaje = useMemo(() => {
    return vsechnyVydaje
      .filter(vydaj => {
        const datumVydaje = new Date(vydaj.datum);
        return (
          datumVydaje.getFullYear() === vybranyRok &&
          datumVydaje.getMonth() === vybranyMesic &&
          vydaj.kategorie === 'PROVOZ' // Pouze výdaje kategorie PROVOZ
        );
      })
      .reduce((sum, vydaj) => sum + vydaj.castka, 0);
  }, [vsechnyVydaje, vybranyMesic, vybranyRok]);

  // Aktualizace state při změně dat z real-time listeneru
  const stav: ObchodPrehledState = useMemo(() => ({
    ...zpracovanaData,
    vsechnyPrijmy,
    nacitaSe,
  }), [zpracovanaData, vsechnyPrijmy, nacitaSe]);

  // Smazání jiného příjmu
  const smazatJinyPrijem = useCallback(async (id: string) => {
    try {
      const prijem = vsechnyPrijmy.find(p => p.id === id);
      if (!prijem) {
        Alert.alert('Chyba', 'Příjem nebyl nalezen');
        return;
      }

      if (prijem.firestoreId) {
        await FirestoreService.smazPrijem(prijem.firestoreId);
        // Real-time listener automaticky aktualizuje UI
        Alert.alert('Úspěch', 'Příjem byl smazán');
      } else {
        Alert.alert('Chyba', 'Záznam nemá Firestore ID');
      }
    } catch (error) {
      console.error('Chyba při mazání příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se smazat příjem');
    }
  }, [vsechnyPrijmy]);

  // Editace jiného příjmu
  const editovatJinyPrijem = useCallback(async (editedPrijem: Prijem) => {
    if (!editedPrijem.firestoreId) {
      Alert.alert('Chyba', 'Záznam nemá Firestore ID');
      return;
    }

    try {
      await FirestoreService.aktualizujPrijem(editedPrijem.firestoreId, {
        castka: editedPrijem.castka,
        datum: editedPrijem.datum,
        kategorie: editedPrijem.kategorie,
        popis: editedPrijem.popis || ''
      });
      // Real-time listener automaticky aktualizuje UI
      Alert.alert('Úspěch', 'Příjem byl úspěšně upraven');
    } catch (error) {
      console.error('Chyba při editaci příjmu:', error);
      Alert.alert('Chyba', 'Nepodařilo se upravit příjem');
      throw error;
    }
  }, []);

  // Editace tržby
  const editovatTrzbu = useCallback(async (editedTrzba: Prijem) => {
    if (!editedTrzba.firestoreId) {
      Alert.alert('Chyba', 'Záznam nemá Firestore ID');
      return;
    }

    try {
      await FirestoreService.aktualizujPrijem(editedTrzba.firestoreId, {
        castka: editedTrzba.castka,
        datum: editedTrzba.datum,
        kategorie: editedTrzba.kategorie,
        popis: editedTrzba.popis || ''
      });
      // Real-time listener automaticky aktualizuje UI
      Alert.alert('Úspěch', 'Tržba byla úspěšně upravena');
    } catch (error) {
      console.error('Chyba při editaci tržby:', error);
      Alert.alert('Chyba', 'Nepodařilo se upravit tržbu');
      throw error;
    }
  }, []);

  // Smazání tržby
  const smazatTrzbu = useCallback(async (trzba: Prijem) => {
    if (!trzba.firestoreId) {
      Alert.alert('Chyba', 'Záznam nemá Firestore ID');
      return;
    }

    try {
      await FirestoreService.smazPrijem(trzba.firestoreId);
      // Real-time listener automaticky aktualizuje UI
      Alert.alert('Úspěch', 'Tržba byla úspěšně smazána');
    } catch (error) {
      console.error('Chyba při mazání tržby:', error);
      Alert.alert('Chyba', 'Nepodařilo se smazat tržbu');
      throw error;
    }
  }, []);

  // Placeholder funkce pro kompatibilitu
  const nactiData = useCallback(async () => {
    // Real-time listener automaticky načítá data
    // Tato funkce je pouze pro kompatibilitu
  }, []);

  const nactiJinePrijmy = useCallback(async () => {
    // Real-time listener automaticky načítá data
    // Tato funkce je pouze pro kompatibilitu
  }, []);

  const nactiMesicniVydaje = useCallback(async () => {
    // Real-time listener automaticky načítá data
    // Tato funkce je pouze pro kompatibilitu
  }, []);

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
    editovatJinyPrijem,
    editovatTrzbu,
    smazatTrzbu,
  };
};
