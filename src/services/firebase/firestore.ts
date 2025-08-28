/**
 * @description Firestore služby pro aplikaci Poznámky
 * Implementuje CRUD operace pro všechny datové typy
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { 
  FirebasePrijem, 
  FirebaseVydaj, 
  FirebaseDomacnostVydaj 
} from './types';

/**
 * @description Abstraktní třída pro společné Firestore operace
 */
abstract class BaseFirestoreService<T> {
  protected abstract collectionName: string;

  protected getCollection(userId: string) {
    return collection(db, `users/${userId}/${this.collectionName}`);
  }

  protected getDocRef(userId: string, docId: string) {
    return doc(db, `users/${userId}/${this.collectionName}/${docId}`);
  }

  /**
   * @description Přidá nový dokument
   */
  async pridat(userId: string, data: Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docData = {
        ...data,
        userId,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(this.getCollection(userId), docData);
      return docRef.id;
    } catch (error) {
      console.error(`Chyba při přidávání do ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * @description Aktualizuje existující dokument
   */
  async aktualizovat(userId: string, docId: string, data: Partial<Omit<T, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(this.getDocRef(userId, docId), updateData);
    } catch (error) {
      console.error(`Chyba při aktualizaci ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * @description Smaže dokument
   */
  async smazat(userId: string, docId: string): Promise<void> {
    try {
      await deleteDoc(this.getDocRef(userId, docId));
    } catch (error) {
      console.error(`Chyba při mazání z ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * @description Načte všechny dokumenty uživatele
   */
  async nacistVse(userId: string): Promise<T[]> {
    try {
      const q = query(
        this.getCollection(userId),
        orderBy('datum', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Chyba při načítání ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * @description Načte dokumenty podle data
   */
  async nacistPodleDatumu(userId: string, od: Date, doDatum: Date): Promise<T[]> {
    try {
      const q = query(
        this.getCollection(userId),
        where('datum', '>=', od.toISOString()),
        where('datum', '<=', doDatum.toISOString()),
        orderBy('datum', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Chyba při načítání ${this.collectionName} podle data:`, error);
      throw error;
    }
  }
}

/**
 * @description Služba pro správu příjmů v Firestore
 */
class PrijmyFirestoreService extends BaseFirestoreService<FirebasePrijem> {
  protected collectionName = 'prijmy';

  /**
   * @description Načte příjmy podle roku a měsíce
   */
  async nacistPodleRokuAMesice(userId: string, rok: number, mesic: number): Promise<FirebasePrijem[]> {
    try {
      // Vytvoř datum začátku a konce měsíce
      const odDatum = new Date(rok, mesic - 1, 1);
      const doDatum = new Date(rok, mesic, 0, 23, 59, 59);

      return await this.nacistPodleDatumu(userId, odDatum, doDatum);
    } catch (error) {
      console.error('Chyba při načítání příjmů podle roku a měsíce:', error);
      throw error;
    }
  }
}

/**
 * @description Služba pro správu výdajů v Firestore
 */
class VydajeFirestoreService extends BaseFirestoreService<FirebaseVydaj> {
  protected collectionName = 'vydaje';

  /**
   * @description Načte výdaje podle dodavatele
   */
  async nacistPodleDodavatele(userId: string, dodavatel: string): Promise<FirebaseVydaj[]> {
    try {
      const q = query(
        this.getCollection(userId),
        where('dodavatel', '==', dodavatel),
        orderBy('datum', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseVydaj));
    } catch (error) {
      console.error('Chyba při načítání výdajů podle dodavatele:', error);
      throw error;
    }
  }
}

/**
 * @description Služba pro správu domácích výdajů v Firestore
 */
class DomacnostFirestoreService extends BaseFirestoreService<FirebaseDomacnostVydaj> {
  protected collectionName = 'domacnost';
}

// Export instancí služeb
export const prijmyFirestore = new PrijmyFirestoreService();
export const vydajeFirestore = new VydajeFirestoreService();
export const domacnostFirestore = new DomacnostFirestoreService();
