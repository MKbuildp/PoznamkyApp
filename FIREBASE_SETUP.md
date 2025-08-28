# 🔥 Firebase Setup - Instrukce pro dokončení konfigurace

## ⚠️ DŮLEŽITÉ: Před testováním aplikace

Před spuštěním aplikace s Firebase funkcionalitou musíš dokončit konfiguraci:

### 1. 🔧 Firebase Console konfigurace

1. **Otevři Firebase Console**: https://console.firebase.google.com/
2. **Vyber projekt "Poznamky"**
3. **Přejdi na Project Settings** (ikona ozubeného kola)
4. **Sekce "Your apps"** → Klikni na "Add app" → **Vyber Web app** (</> ikona)
5. **App nickname**: `PoznamkyApp` (nebo jiný název)
6. **NEPOVOLUJ Firebase Hosting** (zatím nepotřebujeme)
7. **Zkopíruj konfigurační objekt** (firebaseConfig)

### 2. 📝 Aktualizace konfigurace

Otevři soubor `src/services/firebase/config.ts` a nahraď placeholder hodnoty:

```typescript
const firebaseConfig = {
  apiKey: "AIza...",                    // Z Firebase Console
  authDomain: "poznamky-xxxxx.firebaseapp.com",
  projectId: "poznamky-xxxxx",          // Tvoje Project ID
  storageBucket: "poznamky-xxxxx.appspot.com",
  messagingSenderId: "123456789",       // Z Firebase Console
  appId: "1:123456789:android:xxxxx"    // Z Firebase Console
};
```

### 3. 🗄️ Firestore Database

1. **Firebase Console** → **Firestore Database**
2. **Create database**
3. **Start in test mode** (pro začátek)
4. **Vyber region** (europe-west3 pro Evropu)

### 4. 🔐 Nastavení pravidel (volitelné pro začátek)

Firestore Security Rules pro test mode:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // POZOR: Pouze pro testování!
    }
  }
}
```

### 5. 🚀 Spuštění

Po dokončení konfigurace:

```bash
npm start
```

## 📱 Jak testovat Firebase integrace

### Testování autentizace
- Aplikace automaticky vytvoří anonymního uživatele
- Zkontroluj Firebase Console → Authentication → Users

### Testování Firestore
- Přidej příjem/výdaj v aplikaci
- Zkontroluj Firebase Console → Firestore Database
- Měly by se objevit kolekce: `users/{userId}/prijmy`, `users/{userId}/domacnost`

### Offline režim
- Aplikace funguje i bez internetu
- Data se synchronizují při obnovení připojení

## 🔧 Troubleshooting

### Chyba: "No Firebase App has been created"
- Zkontroluj, že `google-services.json` je v kořenovém adresáři
- Restart `npm start`

### Chyba: "Permission denied"
- Zkontroluj Firestore Security Rules
- Pro testování použij open rules (výše)

### Aplikace nefunguje v Expo Go
- Všechny použité Firebase balíčky jsou kompatibilní s Expo Go
- Zkontroluj, že máš nejnovější verzi Expo Go

## 📊 Monitorování

V aplikaci můžeš sledovat:
- Stav připojení k Firebase
- Statistiky synchronizace
- Chyby při synchronizaci

## 🎯 Další kroky

Po úspěšném testování můžeš:
1. Nastavit produkční Security Rules
2. Přidat email/password autentizaci
3. Implementovat real-time synchronizaci
4. Přidat offline indikátory v UI
