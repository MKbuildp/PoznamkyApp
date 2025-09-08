import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp,
  writeBatch
} from '@firebase/firestore';
import { db } from '../config/firebase';

/**
 * @description Konstanty pro kolekce v Firestore
 */
export const FIRESTORE_COLLECTIONS = {
  PRIJMY: 'prijmy',
  VYDAJE: 'vydaje', 
  DOMACNOST: 'domacnost',
  POZNAMKY: 'poznamky'
} as const;

/**
 * @description Typy pro Firestore data
 */
export interface FirestorePrijem {
  id?: string;
  castka: number;
  datum: string;
  kategorie: string;
  popis?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreVydaj {
  id?: string;
  castka: number;
  datum: string;
  kategorie: string;
  dodavatel: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreDomacnostVydaj {
  id?: string;
  castka: number;
  datum: string;
  kategorie: string;
  ucel?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestorePoznamka {
  id?: string;
  text: string;
  dokonceno: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * @description Služba pro práci s Firestore databází
 */
export class FirestoreService {
  
  /**
   * @description Uložení příjmu do Firestore
   */
  static async ulozPrijem(prijem: Omit<FirestorePrijem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const prijemData: FirestorePrijem = {
        ...prijem,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.PRIJMY), prijemData);
      return docRef.id;
    } catch (error) {
      console.error('Chyba při ukládání příjmu do Firestore:', error);
      throw error;
    }
  }

  /**
   * @description Uložení výdaje do Firestore
   */
  static async ulozVydaj(vydaj: Omit<FirestoreVydaj, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const vydajData: FirestoreVydaj = {
        ...vydaj,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.VYDAJE), vydajData);
      return docRef.id;
    } catch (error) {
      console.error('Chyba při ukládání výdaje do Firestore:', error);
      throw error;
    }
  }

  /**
   * @description Uložení domácího výdaje do Firestore
   */
  static async ulozDomacnostVydaj(vydaj: Omit<FirestoreDomacnostVydaj, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const vydajData: FirestoreDomacnostVydaj = {
        ...vydaj,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, FIRESTORE_COLLECTIONS.DOMACNOST), vydajData);
      return docRef.id;
    } catch (error) {
      console.error('Chyba při ukládání domácího výdaje do Firestore:', error);
      throw error;
    }
  }

  /**
   * @description Načtení všech příjmů z Firestore
   */
  static async nactiPrijmy(): Promise<FirestorePrijem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.PRIJMY));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestorePrijem[];
    } catch (error) {
      console.error('Chyba při načítání příjmů z Firestore:', error);
      throw error;
    }
  }

  /**
   * @description Načtení všech výdajů z Firestore
   */
  static async nactiVydaje(): Promise<FirestoreVydaj[]> {
    try {
      const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.VYDAJE));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreVydaj[];
    } catch (error) {
      console.error('Chyba při načítání výdajů z Firestore:', error);
      throw error;
    }
  }

  /**
   * @description Načtení všech domácích výdajů z Firestore
   */
  static async nactiDomacnostVydaje(): Promise<FirestoreDomacnostVydaj[]> {
    try {
      const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTIONS.DOMACNOST));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreDomacnostVydaj[];
    } catch (error) {
      console.error('Chyba při načítání domácích výdajů z Firestore:', error);
      throw error;
    }
  }

  /**
   * @description Aktualizace dokumentu v Firestore
   */
  static async aktualizujDokument(
    kolekce: string, 
    id: string, 
    data: Partial<FirestorePrijem | FirestoreVydaj | FirestoreDomacnostVydaj>
  ): Promise<void> {
    try {
      const docRef = doc(db, kolekce, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Chyba při aktualizaci dokumentu v Firestore:', error);
      throw error;
    }
  }

  /**
   * @description Smazání dokumentu z Firestore
   */
  static async smazDokument(kolekce: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, kolekce, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Chyba při mazání dokumentu z Firestore:', error);
      throw error;
    }
  }

  /**
   * @description Hromadné mazání dokumentů
   */
  static async smazVsechnyDokumenty(kolekce: string): Promise<void> {
    try {
      const querySnapshot = await getDocs(collection(db, kolekce));
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Chyba při hromadném mazání dokumentů z Firestore:', error);
      throw error;
    }
  }
}
