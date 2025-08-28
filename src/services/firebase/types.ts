/**
 * @description Firebase typy pro aplikaci Poznámky
 * Rozšíření existujících typů o Firebase metadata
 */

import { KategoriePrijmu } from '../../screens/ObchodPrehledScreen/types/types';
import { KategorieDomacnostVydaju } from '../../screens/Poznamky/types/types';

/**
 * @description Základní Firebase metadata pro všechny dokumenty
 */
export interface FirebaseMetadata {
  id: string;
  userId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * @description Firebase verze příjmu
 */
export interface FirebasePrijem extends FirebaseMetadata {
  castka: number;
  datum: string; // ISO string
  kategorie: KategoriePrijmu;
  popis?: string; // Volitelný popis pro kategorii "Jiné"
}

/**
 * @description Firebase verze výdaje pro obchod
 */
export interface FirebaseVydaj extends FirebaseMetadata {
  castka: number;
  datum: string; // ISO string
  kategorie: string;
  dodavatel: string;
}

/**
 * @description Firebase verze domácího výdaje
 */
export interface FirebaseDomacnostVydaj extends FirebaseMetadata {
  castka: number;
  datum: string; // ISO string
  kategorie: KategorieDomacnostVydaju;
}

/**
 * @description Stav synchronizace dokumentu
 */
export enum SyncStatus {
  PENDING = 'pending',     // Čeká na synchronizaci
  SYNCED = 'synced',       // Synchronizováno
  ERROR = 'error'          // Chyba při synchronizaci
}

/**
 * @description Lokální metadata pro synchronizaci
 */
export interface LocalSyncMetadata {
  syncStatus: SyncStatus;
  lastSyncAt?: string; // ISO string
  syncError?: string;  // Popis chyby
}

/**
 * @description Kombinovaný typ pro lokální data s sync informacemi
 */
export type LocalDataWithSync<T> = T & LocalSyncMetadata;


