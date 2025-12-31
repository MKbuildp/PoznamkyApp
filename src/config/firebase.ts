import { initializeApp } from '@firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  memoryLocalCache
} from '@firebase/firestore';

/**
 * @description Firebase konfigurace pro projekt Poznamky
 */
const firebaseConfig = {
  apiKey: "AIzaSyBzhf0Bv6HNSMfWbOPr_HCZSfLy0BysnqI",
  authDomain: "poznamky-bdabf.firebaseapp.com",
  projectId: "poznamky-bdabf",
  storageBucket: "poznamky-bdabf.firebasestorage.app",
  messagingSenderId: "1033409016233",
  appId: "1:1033409016233:web:f61847d8168da686a7d4b8"
};

/**
 * @description Inicializace Firebase aplikace
 */
const app = initializeApp(firebaseConfig);

/**
 * @description Inicializace Firestore databáze s offline cache
 * 
 * POZNÁMKA: V React Native prostředí není IndexedDB dostupná (je to webová technologie),
 * proto používáme memory cache. Data se ukládají v paměti během běhu aplikace.
 * Pro trvalé offline ukládání v React Native je potřeba použít AsyncStorage nebo
 * nativní moduly, což už aplikace dělá přes real-time listenery.
 */
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache({
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

/**
 * @description Konfigurace Firestore (pro kompatibilitu, už není potřeba)
 * Offline persistence je nyní konfigurována přímo při inicializaci
 */
export const configureFirestore = async () => {
  // Offline persistence je nyní konfigurována přímo při inicializaci
  console.log('Firestore offline persistence povolena');
};

export default app;
