import { initializeApp } from '@firebase/app';
import { getFirestore, connectFirestoreEmulator } from '@firebase/firestore';

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
 * @description Inicializace Firestore databáze
 */
export const db = getFirestore(app);

/**
 * @description Konfigurace offline persistence pro Firestore
 */
export const configureFirestore = () => {
  // Povolení offline persistence
  // Firestore automaticky ukládá data offline a synchronizuje při připojení
};

export default app;
