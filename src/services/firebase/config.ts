/**
 * @description Konfigurace Firebase pro aplikaci Poznámky
 * Kompatibilní s Expo Go - používá web Firebase SDK
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase konfigurace pro projekt Poznamky
const firebaseConfig = {
  projectId: "poznamky-bdabf", // Tvůj skutečný Firebase projekt
};

// Pro testování můžeš použít tyto demo hodnoty:
// const firebaseConfig = {
//   apiKey: "demo-api-key",
//   authDomain: "demo-project.firebaseapp.com",
//   projectId: "demo-project",
//   storageBucket: "demo-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:demo"
// };

// Inicializace Firebase aplikace
const app = initializeApp(firebaseConfig);

// Inicializace služeb
export const db = getFirestore(app);
// Auth není potřeba pro veřejnou databázi
// export const auth = getAuth(app);

// Pro development - můžeš připojit k lokálnímu emulátoru
// if (__DEV__) {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectAuthEmulator(auth, 'http://localhost:9099');
//   } catch (error) {
//     console.log('Emulator už je připojen nebo nedostupný');
//   }
// }

export default app;
