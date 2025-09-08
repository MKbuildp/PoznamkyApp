# Firebase Setup pro PoznamkyApp

## Přehled
Tato aplikace nyní používá hybridní přístup k ukládání dat:
- **AsyncStorage** - lokální úložiště pro offline funkcionalitu
- **Firestore** - cloud databáze pro synchronizaci mezi zařízeními

## Instalace Firebase závislostí
```bash
npm install @firebase/app @firebase/firestore
```

## Konfigurace Firebase

### 1. Získání Firebase konfigurace
1. Jděte na [Firebase Console](https://console.firebase.google.com/)
2. Vyberte projekt "Poznamky"
3. Klikněte na ⚙️ (nastavení) → Project settings
4. V sekci "Your apps" klikněte na "Add app" → Web app
5. Zkopírujte konfiguraci

### 2. Aktualizace konfigurace
Otevřete `src/config/firebase.ts` a nahraďte placeholder hodnoty skutečnými:

```typescript
const firebaseConfig = {
  apiKey: "VAŠE_SKUTEČNÉ_API_KEY",
  authDomain: "poznamky-bdabf.firebaseapp.com",
  projectId: "poznamky-bdabf",
  storageBucket: "poznamky-bdabf.appspot.com",
  messagingSenderId: "VAŠE_SKUTEČNÉ_SENDER_ID",
  appId: "VAŠE_SKUTEČNÉ_APP_ID"
};
```

## Testování Firebase

### 1. Spuštění aplikace
```bash
npm start
```

### 2. Navigace na obrazovku Příjmy
- Otevřete Expo Go
- Přejděte na záložku "Příjmy"
- Dole uvidíte "Firebase Test Status" komponentu

### 3. Testování funkcionality
1. **Test Firestore** - Otestuje ukládání a načítání z Firestore
2. **Sync → Firestore** - Synchronizuje lokální data do cloudu
3. **Sync ← Firestore** - Načte data z cloudu do lokálního úložiště
4. **Smazat test data** - Vymaže test data z Firestore

## Struktura dat v Firestore

### Kolekce
- `prijmy` - Příjmy uživatele
- `vydaje` - Výdaje uživatele
- `domacnost` - Domácí výdaje
- `poznamky` - Poznámky a úkoly

### Dokumenty
Každý dokument obsahuje:
- `id` - Unikátní ID
- `castka` - Částka
- `datum` - Datum v ISO formátu
- `kategorie` - Kategorie příjmu/výdaje
- `createdAt` - Čas vytvoření
- `updatedAt` - Čas poslední aktualizace

## Offline podpora
- Firestore automaticky ukládá data offline
- Při obnovení připojení se data synchronizují
- Aplikace funguje i bez internetu

## Řešení problémů

### Chyba "Firebase not initialized"
- Zkontrolujte, zda je `src/config/firebase.ts` správně importován v `App.tsx`
- Ověřte, že Firebase konfigurace obsahuje správné hodnoty

### Chyba "Permission denied"
- Zkontrolujte Firestore security rules
- Aktuálně jsou nastaveny na `allow read, write: if true;` (veřejný přístup)

### Data se neukládají
- Zkontrolujte konzoli pro chybové zprávy
- Ověřte připojení k internetu
- Testujte pomocí "Test Firestore" tlačítka

## Další kroky
1. ✅ Implementace Firebase základní funkcionality
2. 🔄 Testování na obrazovce Příjmy
3. 📱 Rozšíření na další obrazovky
4. 🔒 Implementace bezpečnostních pravidel
5. 📊 Monitoring a analýza použití

## Užitečné odkazy
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Expo Firebase Integration](https://docs.expo.dev/guides/using-firebase/)



