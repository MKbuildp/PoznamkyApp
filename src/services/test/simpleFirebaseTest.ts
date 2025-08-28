/**
 * @description Jednoduchý test Firebase připojení pro sdílená data
 */

import { syncService } from '../storage/syncService';
import { getCurrentUserId } from '../firebase/auth';

/**
 * @description Test přidání testovacího příjmu
 */
export const testPridaniPrijmu = async () => {
  console.log('🧪 Test Firebase - Přidávání příjmu...');
  
  try {
    const userId = getCurrentUserId();
    console.log('👤 User ID:', userId);
    
    // Test příjem
    const testPrijem = {
      castka: 500,
      datum: new Date().toISOString(),
      kategorie: 'Tržba' as any,
      popis: 'Test Firebase - sdílená data'
    };
    
    console.log('💰 Přidávám testovací příjem:', testPrijem);
    const id = await syncService.pridatZaznam('prijmy', testPrijem);
    console.log('✅ Příjem přidán s ID:', id);
    
    // Test načtení dat
    console.log('📖 Načítám data pro UI...');
    const data = await syncService.nactiLokalnDataProUI('prijmy');
    console.log('📊 Počet příjmů:', data.length);
    console.log('📋 Poslední příjem:', data[0]);
    
    return { success: true, id, dataCount: data.length };
    
  } catch (error) {
    console.error('❌ Test selhal:', error);
    return { success: false, error: error.message };
  }
};

/**
 * @description Test statistik synchronizace
 */
export const testStatistiky = async () => {
  console.log('📊 Test statistik synchronizace...');
  
  try {
    const stats = await syncService.getStatistikySynchronizace();
    console.log('📈 Statistiky:', JSON.stringify(stats, null, 2));
    return stats;
  } catch (error) {
    console.error('❌ Chyba při načítání statistik:', error);
    return null;
  }
};

