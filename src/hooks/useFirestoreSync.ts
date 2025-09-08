import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreService } from '../services/firestoreService';
import { FIRESTORE_COLLECTIONS } from '../services/firestoreService';

/**
 * @description Hook pro synchronizaci dat mezi AsyncStorage a Firestore
 */
export const useFirestoreSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  /**
   * @description Synchronizace dat z AsyncStorage do Firestore
   */
  const synchronizujDoFirestore = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // Synchronizace příjmů
      const prijmyData = await AsyncStorage.getItem('seznamPrijmuData_v2');
      if (prijmyData) {
        const prijmy = JSON.parse(prijmyData);
        for (const prijem of prijmy) {
          if (!prijem.firestoreId) { // Kontrola, zda už není v Firestore
            try {
              const firestoreId = await FirestoreService.ulozPrijem({
                castka: prijem.castka,
                datum: prijem.datum,
                kategorie: prijem.kategorie,
                popis: prijem.popis || ''
              });
              
              // Označení jako synchronizované v AsyncStorage
              prijem.firestoreId = firestoreId;
            } catch (error) {
              console.error('Chyba při synchronizaci příjmu:', error);
            }
          }
        }
        await AsyncStorage.setItem('seznamPrijmuData_v2', JSON.stringify(prijmy));
      }

      // Synchronizace výdajů
      const vydajeData = await AsyncStorage.getItem('seznamVydajuData_v1');
      if (vydajeData) {
        const vydaje = JSON.parse(vydajeData);
        for (const vydaj of vydaje) {
          if (!vydaj.firestoreId) {
            try {
              const firestoreId = await FirestoreService.ulozVydaj({
                castka: vydaj.castka,
                datum: vydaj.datum,
                kategorie: vydaj.kategorie,
                dodavatel: vydaj.dodavatel || ''
              });
              
              vydaj.firestoreId = firestoreId;
            } catch (error) {
              console.error('Chyba při synchronizaci výdaje:', error);
            }
          }
        }
        await AsyncStorage.setItem('seznamVydajuData_v1', JSON.stringify(vydaje));
      }

      // Synchronizace domácích výdajů
      const domacnostData = await AsyncStorage.getItem('domacnostVydajeData_v1');
      if (domacnostData) {
        const domacnostVydaje = JSON.parse(domacnostData);
        for (const vydaj of domacnostVydaje) {
          if (!vydaj.firestoreId) {
            try {
              const firestoreId = await FirestoreService.ulozDomacnostVydaj({
                castka: vydaj.castka,
                datum: vydaj.datum,
                kategorie: vydaj.kategorie,
                ucel: vydaj.ucel || ''
              });
              
              vydaj.firestoreId = firestoreId;
            } catch (error) {
              console.error('Chyba při synchronizaci domácího výdaje:', error);
            }
          }
        }
        await AsyncStorage.setItem('domacnostVydajeData_v1', JSON.stringify(domacnostVydaje));
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Chyba při synchronizaci do Firestore:', error);
      setSyncError('Nepodařilo se synchronizovat data');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * @description Synchronizace dat z Firestore do AsyncStorage
   */
  const synchronizujZFirestore = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // Načtení dat z Firestore
      const [prijmy, vydaje, domacnostVydaje] = await Promise.all([
        FirestoreService.nactiPrijmy(),
        FirestoreService.nactiVydaje(),
        FirestoreService.nactiDomacnostVydaje()
      ]);

      // Konverze Firestore dat do formátu AsyncStorage
      const prijmyProStorage = prijmy.map(prijem => ({
        id: prijem.id,
        castka: prijem.castka,
        datum: prijem.datum,
        kategorie: prijem.kategorie,
        popis: prijem.popis || '',
        firestoreId: prijem.id
      }));

      const vydajeProStorage = vydaje.map(vydaj => ({
        id: vydaj.id,
        castka: vydaj.castka,
        datum: vydaj.datum,
        kategorie: vydaj.kategorie,
        dodavatel: vydaj.dodavatel,
        firestoreId: vydaj.id
      }));

      const domacnostProStorage = domacnostVydaje.map(vydaj => ({
        id: vydaj.id,
        castka: vydaj.castka,
        datum: vydaj.datum,
        kategorie: vydaj.kategorie,
        ucel: vydaj.ucel,
        firestoreId: vydaj.id
      }));

      // Uložení do AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('seznamPrijmuData_v2', JSON.stringify(prijmyProStorage)),
        AsyncStorage.setItem('seznamVydajuData_v1', JSON.stringify(vydajeProStorage)),
        AsyncStorage.setItem('domacnostVydajeData_v1', JSON.stringify(domacnostProStorage))
      ]);

      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Chyba při synchronizaci z Firestore:', error);
      setSyncError('Nepodařilo se načíst data z Firestore');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * @description Automatická synchronizace při spuštění
   */
  useEffect(() => {
    synchronizujZFirestore();
  }, [synchronizujZFirestore]);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    synchronizujDoFirestore,
    synchronizujZFirestore
  };
};



