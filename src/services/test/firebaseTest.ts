/**
 * @description Testovací funkce pro ověření Firebase integrace
 * Spusť tyto testy po dokončení konfigurace Firebase
 */

import { syncService } from '../storage/syncService';
import { useFirebaseConnection } from '../hooks/useFirebaseConnection';

/**
 * @description Test základní funkcionalité SyncService
 */
export const testSyncService = async () => {
  console.log('🧪 Testování SyncService...');
  
  try {
    // Test přidání testovacího záznamu
    const testPrijem = {
      castka: 100,
      datum: new Date().toISOString(),
      kategorie: 'Tržba' as any,
      popis: 'Test Firebase integrace'
    };
    
    console.log('📝 Přidávám testovací příjem...');
    const id = await syncService.pridatZaznam('prijmy', testPrijem);
    console.log('✅ Příjem přidán s ID:', id);
    
    // Test načtení dat
    console.log('📖 Načítám lokální data...');
    const data = await syncService.nactiLokalnDataProUI('prijmy');
    console.log('✅ Načteno záznamů:', data.length);
    
    // Test statistik
    console.log('📊 Načítám statistiky...');
    const stats = await syncService.getStatistikySynchronizace();
    console.log('✅ Statistiky:', stats);
    
    // Test smazání
    console.log('🗑️ Mazání testovacího záznamu...');
    await syncService.smazatZaznam('prijmy', id);
    console.log('✅ Záznam smazán');
    
    console.log('🎉 SyncService test úspěšně dokončen!');
    
  } catch (error) {
    console.error('❌ SyncService test selhal:', error);
    throw error;
  }
};

/**
 * @description Test Firebase připojení (pro použití v komponentě)
 */
export const FirebaseTestComponent = () => {
  const connection = useFirebaseConnection();
  
  console.log('🔥 Firebase Connection Test:');
  console.log('- Je přihlášen:', connection.isAuthenticated);
  console.log('- User ID:', connection.userId);
  console.log('- Je online:', connection.isOnline);
  console.log('- Synchronizuje:', connection.isSyncing);
  console.log('- Chyba:', connection.syncError);
  
  return connection;
};

/**
 * @description Rychlý test všech služeb
 */
export const runAllTests = async () => {
  console.log('🚀 Spouštím všechny Firebase testy...');
  
  try {
    await testSyncService();
    console.log('✅ Všechny testy úspěšně dokončeny!');
    return true;
  } catch (error) {
    console.error('❌ Některé testy selhaly:', error);
    return false;
  }
};


