/**
 * @description Index soubor pro Firebase služby
 */

// Konfigurace
export { default as app, db, auth } from './config';

// Typy
export * from './types';

// Služby
export * from './firestore';
export * from './auth';

// Re-export pro pohodlí
export { syncService } from '../storage/syncService';

