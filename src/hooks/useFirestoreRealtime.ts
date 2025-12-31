import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  Query,
  FirestoreError 
} from '@firebase/firestore';
import { db } from '../config/firebase';

export interface UseFirestoreRealtimeOptions<T> {
  collectionName: string;
  orderByField?: string;
  orderByDirection?: 'asc' | 'desc';
  whereClause?: {
    field: string;
    operator: '<' | '<=' | '==' | '>=' | '>' | '!=';
    value: any;
  }[];
  transform?: (doc: any) => T;
  onError?: (error: FirestoreError) => void;
}

export interface UseFirestoreRealtimeReturn<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
  unsubscribe: () => void;
}

/**
 * @description Univerzální hook pro real-time synchronizaci Firestore kolekce
 */
export const useFirestoreRealtime = <T = any>(
  options: UseFirestoreRealtimeOptions<T>
): UseFirestoreRealtimeReturn<T> => {
  const { 
    collectionName, 
    orderByField, 
    orderByDirection = 'desc',
    whereClause,
    transform,
    onError
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Vytvoření query
    let q: Query = collection(db, collectionName);

    // Přidání where klauzulí
    if (whereClause) {
      whereClause.forEach(clause => {
        q = query(q, where(clause.field, clause.operator, clause.value));
      });
    }

    // Přidání orderBy
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderByDirection));
    }

    // Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const docs = snapshot.docs.map(doc => {
            const docData = doc.data();
            const transformed = transform 
              ? transform({ id: doc.id, ...docData })
              : { id: doc.id, ...docData };
            return transformed as T;
          });
          
          setData(docs);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error(`Chyba při transformaci dat z ${collectionName}:`, err);
          setError(err as FirestoreError);
          setLoading(false);
        }
      },
      (err) => {
        console.error(`Chyba při načítání ${collectionName}:`, err);
        setError(err);
        setLoading(false);
        if (onError) {
          onError(err);
        }
      }
    );

    setUnsubscribeFn(() => unsubscribe);

    // Cleanup při unmount
    return () => {
      unsubscribe();
    };
  }, [collectionName, orderByField, orderByDirection, JSON.stringify(whereClause)]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeFn) {
      unsubscribeFn();
    }
  }, [unsubscribeFn]);

  return {
    data,
    loading,
    error,
    unsubscribe
  };
};


