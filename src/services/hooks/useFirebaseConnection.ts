/**
 * @description Hook pro správu Firebase připojení a synchronizace
 * Zjednodušená verze bez autentizace
 */

import { useState, useEffect } from 'react';
import { syncService } from '../storage/syncService';
import { getCurrentUserId } from '../firebase/auth';

/**
 * @description Hook pro správu Firebase připojení (bez autentizace)
 */
export const useFirebaseConnection = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  // Automatická synchronizace při startu (bez autentizace)
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId && !isSyncing) {
      // Nejprve stáhni data z Firebase, pak synchronizuj
      stahniAPotemSynchronizuj();
    }
  }, []);

  /**
   * @description Stáhne data z Firebase a pak synchronizuje
   */
  const stahniAPotemSynchronizuj = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setSyncError('Chyba: userId není dostupné');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);
      
      console.log('🔄 Stahování dat z Firebase...');
      await syncService.stahniDataZFirebase();
      
      console.log('🔄 Synchronizace lokálních změn...');
      await syncService.synchronizujVsechnyZaznamy();
      
      setLastSyncAt(new Date());
      console.log('✅ Kompletní synchronizace dokončena');
    } catch (error: any) {
      const errorMessage = error?.message || 'Neznámá chyba při synchronizaci';
      setSyncError(errorMessage);
      console.error('❌ Chyba při kompletní synchronizaci:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * @description Manuální synchronizace dat
   */
  const synchronizujData = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setSyncError('Chyba: userId není dostupné');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);
      
      await syncService.synchronizujVsechnyZaznamy();
      
      setLastSyncAt(new Date());
      console.log('Synchronizace dokončena');
    } catch (error: any) {
      const errorMessage = error?.message || 'Neznámá chyba při synchronizaci';
      setSyncError(errorMessage);
      console.error('Chyba při synchronizaci:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * @description Získání statistik synchronizace
   */
  const getStatistiky = async () => {
    try {
      return await syncService.getStatistikySynchronizace();
    } catch (error) {
      console.error('Chyba při získávání statistik:', error);
      return null;
    }
  };

  return {
    // Zjednodušený stav (bez autentizace)
    userId: getCurrentUserId(),
    isAuthenticated: true, // Vždy "přihlášen"
    isAuthLoading: false,
    authError: null,

    // Sync stav
    isSyncing,
    syncError,
    lastSyncAt,

    // Akce
    synchronizujData,
    getStatistiky,

    // Utility
    isOnline: true, // Vždy online (bez auth kontrol)
    canSync: !isSyncing
  };
};
