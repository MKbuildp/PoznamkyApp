/**
 * @description Synchronizační služba pro koordinaci mezi AsyncStorage a Firebase
 * Implementuje offline-first přístup s automatickou synchronizací
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserId } from '../firebase/auth';
import { 
  prijmyFirestore, 
  vydajeFirestore, 
  domacnostFirestore 
} from '../firebase/firestore';
import {
  FirebasePrijem,
  FirebaseVydaj,
  FirebaseDomacnostVydaj,
  LocalDataWithSync,
  SyncStatus
} from '../firebase/types';
import { Prijem } from '../../screens/PrijmyVydaje/types/types';
import { DomacnostVydaj } from '../../screens/Poznamky/types/types';

/**
 * @description Typy pro různé datové kolekce
 */
type DataType = 'prijmy' | 'vydaje' | 'domacnost';

/**
 * @description Mapování typů na jejich lokální varianty
 */
type LocalDataMap = {
  prijmy: LocalDataWithSync<Prijem>;
  vydaje: LocalDataWithSync<any>; // TODO: Definovat typ pro výdaje
  domacnost: LocalDataWithSync<DomacnostVydaj>;
};

/**
 * @description Hlavní synchronizační služba
 */
export class SyncService {
  private static instance: SyncService;
  
  /**
   * @description Singleton pattern pro jednu instanci služby
   */
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * @description Získá klíč pro AsyncStorage
   */
  private getStorageKey(type: DataType): string {
    return `@PoznamkyApp:${type}`;
  }

  /**
   * @description Načte lokální data z AsyncStorage
   */
  private async nactiLokalnData<T extends keyof LocalDataMap>(
    type: T
  ): Promise<LocalDataMap[T][]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.getStorageKey(type));
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error(`Chyba při načítání lokálních dat ${type}:`, error);
      return [];
    }
  }

  /**
   * @description Uloží lokální data do AsyncStorage
   */
  private async ulozLokalnData<T extends keyof LocalDataMap>(
    type: T,
    data: LocalDataMap[T][]
  ): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(this.getStorageKey(type), jsonValue);
    } catch (error) {
      console.error(`Chyba při ukládání lokálních dat ${type}:`, error);
      throw error;
    }
  }

  /**
   * @description Přidá nový záznam lokálně i do Firebase
   */
  async pridatZaznam<T extends keyof LocalDataMap>(
    type: T,
    data: Omit<LocalDataMap[T], 'id' | 'syncStatus' | 'lastSyncAt' | 'syncError'>
  ): Promise<string> {
    try {
      // Vygeneruj unikátní ID
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Připrav lokální záznam s sync metadata
      const localRecord: LocalDataWithSync<any> = {
        ...data,
        id,
        syncStatus: SyncStatus.PENDING
      };

      // Ulož lokálně
      const lokalniData = await this.nactiLokalnData(type);
      lokalniData.unshift(localRecord as LocalDataMap[T]);
      await this.ulozLokalnData(type, lokalniData);

      // Pokus o synchronizaci s Firebase
      await this.synchronizujJedenZaznam(type, id);

      return id;
    } catch (error) {
      console.error(`Chyba při přidávání záznamu ${type}:`, error);
      throw error;
    }
  }

  /**
   * @description Synchronizuje jeden konkrétní záznam s Firebase
   */
  private async synchronizujJedenZaznam<T extends keyof LocalDataMap>(
    type: T,
    recordId: string
  ): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('Uživatel není přihlášený, přeskakuji synchronizaci');
      return;
    }

    try {
      const lokalniData = await this.nactiLokalnData(type);
      const zaznam = lokalniData.find(item => item.id === recordId);
      
      if (!zaznam || zaznam.syncStatus === SyncStatus.SYNCED) {
        return;
      }

      // Připrav data pro Firebase (bez sync metadata)
      const { syncStatus, lastSyncAt, syncError, ...firebaseData } = zaznam;

      // Synchronizuj podle typu
      let firebaseId: string;
      switch (type) {
        case 'prijmy':
          firebaseId = await prijmyFirestore.pridat(userId, firebaseData);
          break;
        case 'vydaje':
          firebaseId = await vydajeFirestore.pridat(userId, firebaseData);
          break;
        case 'domacnost':
          firebaseId = await domacnostFirestore.pridat(userId, firebaseData);
          break;
        default:
          throw new Error(`Neznámý typ dat: ${type}`);
      }

      // Aktualizuj lokální záznam
      zaznam.syncStatus = SyncStatus.SYNCED;
      zaznam.lastSyncAt = new Date().toISOString();
      delete zaznam.syncError;

      await this.ulozLokalnData(type, lokalniData);
      
      console.log(`Záznam ${recordId} úspěšně synchronizován jako ${firebaseId}`);
    } catch (error) {
      console.error(`Chyba při synchronizaci záznamu ${recordId}:`, error);
      
      // Označ chybu v lokálních datech
      const lokalniData = await this.nactiLokalnData(type);
      const zaznam = lokalniData.find(item => item.id === recordId);
      if (zaznam) {
        zaznam.syncStatus = SyncStatus.ERROR;
        zaznam.syncError = error instanceof Error ? error.message : 'Neznámá chyba';
        await this.ulozLokalnData(type, lokalniData);
      }
    }
  }

  /**
   * @description Stáhne všechna data z Firebase a uloží je lokálně
   * Používá se při prvním spuštění na novém zařízení
   */
  async stahniDataZFirebase(): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('Uživatel není přihlášený, přeskakuji stahování');
      return;
    }

    console.log('Stahování dat z Firebase...');

    const typy: DataType[] = ['prijmy', 'vydaje', 'domacnost'];
    
    for (const typ of typy) {
      try {
        console.log(`Stahování ${typ} z Firebase...`);
        
        // Načti data z Firebase
        let firebaseData: any[] = [];
        switch (typ) {
          case 'prijmy':
            firebaseData = await prijmyFirestore.nacistVse(userId);
            break;
          case 'vydaje':
            firebaseData = await vydajeFirestore.nacistVse(userId);
            break;
          case 'domacnost':
            firebaseData = await domacnostFirestore.nacistVse(userId);
            break;
        }

        // Převeď Firebase data na lokální formát se sync metadaty
        const lokalniData = firebaseData.map(item => ({
          ...item,
          syncStatus: SyncStatus.SYNCED,
          lastSyncAt: new Date().toISOString()
        }));

        // Ulož lokálně
        await this.ulozLokalnData(typ, lokalniData as LocalDataMap[typeof typ][]);
        
        console.log(`✅ ${typ}: Staženo ${lokalniData.length} záznamů`);
        
      } catch (error) {
        console.error(`Chyba při stahování ${typ}:`, error);
      }
    }

    console.log('Stahování z Firebase dokončeno');
  }

  /**
   * @description Synchronizuje všechny nesynchronizované záznamy
   */
  async synchronizujVsechnyZaznamy(): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('Uživatel není přihlášený, přeskakuji synchronizaci');
      return;
    }

    console.log('Začínám úplnou synchronizaci...');

    const typy: DataType[] = ['prijmy', 'vydaje', 'domacnost'];
    
    for (const typ of typy) {
      try {
        const lokalniData = await this.nactiLokalnData(typ);
        const nesynchronizovane = lokalniData.filter(
          item => item.syncStatus === SyncStatus.PENDING || item.syncStatus === SyncStatus.ERROR
        );

        console.log(`${typ}: Synchronizuji ${nesynchronizovane.length} záznamů`);

        for (const zaznam of nesynchronizovane) {
          await this.synchronizujJedenZaznam(typ, zaznam.id);
          // Krátká pauza mezi požadavky
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Chyba při synchronizaci typu ${typ}:`, error);
      }
    }

    console.log('Úplná synchronizace dokončena');
  }

  /**
   * @description Smaže záznam lokálně i z Firebase
   */
  async smazatZaznam<T extends keyof LocalDataMap>(
    type: T,
    recordId: string
  ): Promise<void> {
    try {
      const lokalniData = await this.nactiLokalnData(type);
      const index = lokalniData.findIndex(item => item.id === recordId);
      
      if (index === -1) {
        throw new Error(`Záznam ${recordId} nebyl nalezen`);
      }

      const zaznam = lokalniData[index];

      // Smaž z Firebase, pokud byl synchronizován
      if (zaznam.syncStatus === SyncStatus.SYNCED) {
        const userId = getCurrentUserId();
        if (userId) {
          try {
            switch (type) {
              case 'prijmy':
                await prijmyFirestore.smazat(userId, recordId);
                break;
              case 'vydaje':
                await vydajeFirestore.smazat(userId, recordId);
                break;
              case 'domacnost':
                await domacnostFirestore.smazat(userId, recordId);
                break;
            }
          } catch (error) {
            console.error(`Chyba při mazání z Firebase: ${error}`);
            // Pokračuj v mazání lokálně i při chybě Firebase
          }
        }
      }

      // Smaž lokálně
      lokalniData.splice(index, 1);
      await this.ulozLokalnData(type, lokalniData);
      
      console.log(`Záznam ${recordId} smazán`);
    } catch (error) {
      console.error(`Chyba při mazání záznamu ${recordId}:`, error);
      throw error;
    }
  }

  /**
   * @description Načte všechna lokální data (pro zobrazení v UI)
   */
  async nactiLokalnDataProUI<T extends keyof LocalDataMap>(
    type: T
  ): Promise<Omit<LocalDataMap[T], 'syncStatus' | 'lastSyncAt' | 'syncError'>[]> {
    const data = await this.nactiLokalnData(type);
    // Odstraň sync metadata pro UI
    return data.map(({ syncStatus, lastSyncAt, syncError, ...rest }) => rest);
  }

  /**
   * @description Získá statistiky synchronizace
   */
  async getStatistikySynchronizace(): Promise<{
    [K in DataType]: {
      celkem: number;
      synchronizovane: number;
      cekajici: number;
      chyby: number;
    }
  }> {
    const statistiky = {} as any;

    const typy: DataType[] = ['prijmy', 'vydaje', 'domacnost'];
    
    for (const typ of typy) {
      const data = await this.nactiLokalnData(typ);
      statistiky[typ] = {
        celkem: data.length,
        synchronizovane: data.filter(item => item.syncStatus === SyncStatus.SYNCED).length,
        cekajici: data.filter(item => item.syncStatus === SyncStatus.PENDING).length,
        chyby: data.filter(item => item.syncStatus === SyncStatus.ERROR).length
      };
    }

    return statistiky;
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();

