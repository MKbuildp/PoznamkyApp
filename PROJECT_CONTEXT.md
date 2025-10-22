# PROJECT_CONTEXT.md - PoznámkyApp

## 1. RYCHLÝ PŘEHLED

**PoznámkyApp** je mobilní aplikace pro správu domácích financí vytvořená v React Native s Expo. Aplikace umožňuje sledování příjmů, výdajů a domácích výdajů s možností synchronizace přes Firebase.

### Klíčové funkce:
- 📊 **Přehled** - Celkový přehled financí s měsíčními statistikami
- 💰 **Příjmy** - Správa příjmů podle kategorií
- 🛒 **Výdaje** - Sledování výdajů podle dodavatelů
- 🏠 **Domácnost** - Domácí výdaje (jídlo, pravidelné, jiné)

### Technologie:
- React Native 0.79.5 + Expo SDK 53
- TypeScript
- Firebase Firestore (synchronizace dat)
- React Navigation 6
- AsyncStorage (lokální úložiště)

---

## 2. ARCHITEKTURA APLIKACE

### 2.1 Navigační struktura
```
App.tsx
├── TabNavigator (Bottom Tabs)
    ├── TAB_NAMES.VYDAJE ('ZboziTab') → VydajePrehledScreen (Výdaje)
    ├── TAB_NAMES.PRIJMY ('VydajeTab') → PrijmyVydajeScreen (Příjmy) 
    ├── TAB_NAMES.PREHLED ('PrehledTab') → PrehledScreen (Přehled)
    └── TAB_NAMES.DOMACNOST ('PoznamkyTab') → PoznamkyScreen (Domácnost)
```

**Poznámka:** Názvy tabů neodpovídají zobrazovanému textu v tab baru. Používají se konstanty `TAB_NAMES` pro lepší dokumentaci a údržbu.

### 2.2 Struktura složek
```
src/
├── components/          # Znovupoužitelné UI komponenty
├── config/             # Konfigurace (Firebase)
├── hooks/              # Custom hooks (logika)
├── navigation/         # Navigační konfigurace
├── screens/            # Obrazovky aplikace
│   ├── Prehled/        # Přehled financí
│   ├── VydajePrehled/  # Výdaje podle dodavatelů
│   ├── PrijmyVydaje/   # Příjmy a výdaje
│   └── Poznamky/       # Domácí výdaje
├── services/           # Služby (Firestore)
└── types/              # TypeScript typy
```

### 2.3 Datový model
**Firestore kolekce:**
- `prijmy` - Příjmy s kategoriemi
- `vydaje` - Výdaje podle dodavatelů  
- `domacnost` - Domácí výdaje (jídlo, pravidelné, jiné)

**AsyncStorage klíče:**
- `seznamPrijmuData_v2` - Příjmy
- `seznamVydajuData_v1` - Výdaje
- `domacnostVydajeData_v1` - Domácí výdaje

---

## 3. KLÍČOVÉ KOMPONENTY

### 3.1 Navigace
- **TabNavigator.tsx** - Spodní navigační lišta s 4 záložkami
- **TAB_NAMES konstanty** - Centralizované názvy tabů s vysvětlením
- **Stack navigátory** - Pro každou záložku samostatný stack
- **Ikony** - Ionicons (receipt, cash, home, storefront)

**Konstanty pro názvy tabů:**
```typescript
const TAB_NAMES = {
  VYDAJE: 'ZboziTab', // Zobrazuje "Výdaje" v tab baru
  PRIJMY: 'VydajeTab', // Zobrazuje "Příjmy" v tab baru  
  PREHLED: 'PrehledTab', // Zobrazuje "Přehled" v tab baru
  DOMACNOST: 'PoznamkyTab' // Zobrazuje "Domácnost" v tab baru
} as const;
```

### 3.2 Synchronizace dat
- **useFirestoreSync.ts** - Hook pro synchronizaci AsyncStorage ↔ Firestore
- **FirestoreService.ts** - Služba pro CRUD operace s Firestore
- **Automatická synchronizace** při spuštění aplikace

### 3.3 Obrazovky

#### PrehledScreen (Přehled)
- Celkové příjmy a výdaje
- Bilance s kategoriemi (Zboží, Provoz)
- Měsíční přehled tabulka
- Pull-to-refresh synchronizace

#### VydajePrehledScreen (Výdaje)
- Formulář pro zadávání výdajů
- Seznam výdajů podle měsíců
- Smazání posledního výdaje
- Kategorie: Zboží, Provoz

#### PoznamkyScreen (Domácnost)
- Domácí výdaje s kategoriemi:
  - **Jídlo** (modrá)
  - **Pravidelné** (fialová) 
  - **Jiné** (oranžová)
  - **Příjmy** (zelená)
- Měsíční přehled s víkendovým označením
- Dvousloupcová tabulka pro lepší přehlednost

#### PrijmyVydajeScreen (Příjmy)
- Správa příjmů podle kategorií
- Měsíční přehled příjmů

---

## 4. DESIGN SYSTÉM

### 4.1 Barvy
- **Příjmy**: `#4CAF50` (zelená)
- **Výdaje**: `#E53935` (červená)
- **Jídlo**: `#2196F3` (modrá)
- **Pravidelné**: `#9C27B0` (fialová)
- **Jiné**: `#FF9800` (oranžová)
- **Hlavní**: `#880E4F` (tmavě růžová)

### 4.2 Typografie
- **Hlavičky**: 19px, bold
- **Částky**: 20px, bold
- **Text**: 13-16px, normal/medium
- **Malý text**: 11-12px

### 4.3 Rozložení
- **Responzivní design** s Dimensions API
- **Flexbox** pro rozložení
- **Elevation/shadow** pro kartičky
- **Border radius**: 8px

---

## 5. TECHNICKÉ DETAILY

### 5.1 Závislosti
```json
{
  "expo": "^53.0.22",
  "react": "19.0.0", 
  "react-native": "^0.79.5",
  "@firebase/firestore": "^4.9.1",
  "@react-navigation/bottom-tabs": "^6.6.1",
  "@react-native-async-storage/async-storage": "2.1.2",
  "date-fns": "^4.1.0"
}
```

### 5.2 Build konfigurace
- **Metro bundler** pro React Native
- **TypeScript** konfigurace
- **EAS Build** pro produkční buildy
- **Expo Managed Workflow**

### 5.3 Firebase konfigurace
- **Project ID**: `poznamky-bdabf`
- **Offline persistence** povolena
- **Automatická synchronizace** při připojení

---

## 6. VÝVOJOVÉ POKYNY

### 6.1 Spuštění vývoje
```bash
npm install
npm start
# Skenování QR kódu v Expo Go
```

### 6.2 Build pro Android
```bash
npm run build:android
# Generuje bundle.js a bundle.map
```

### 6.3 Čištění cache
```bash
npm run clean
# Vyčistí Metro cache
```

---

## 7. KNOWN ISSUES & LIMITATIONS

### 7.1 Aktuální omezení
- **Offline režim**: Data se ukládají lokálně, synchronizace při připojení
- **Jednodužší validace**: Základní validace formulářů
- **Žádné uživatelské účty**: Všechna data jsou lokální

### 7.2 Plánované vylepšení
- Uživatelské účty a autentizace
- Pokročilé reporty a grafy
- Export dat (CSV, PDF)
- Push notifikace

---

## 8. BUILD_FAILURE_HISTORY

### 8.1 Nedávné změny
- **2024-12-19**: Oprava matoucích názvů tabů - přidány konstanty `TAB_NAMES` pro lepší dokumentaci
  - Názvy tabů neodpovídaly zobrazovanému textu v tab baru
  - Implementováno Řešení 2: Konstanty s vysvětlením místo změny názvů
  - Zachovány původní názvy pro kompatibilitu

*Tato sekce bude aktualizována při výskytu build chyb podle Klíčového pravidla 6.*

---

## 9. CONTRIBUTORS & MAINTENANCE

### 9.1 Vývoj
- **Architektura**: React Native + Expo
- **Backend**: Firebase Firestore
- **Styling**: StyleSheet s design tokeny

### 9.2 Údržba
- **Dokumentace**: Automaticky aktualizována při změnách
- **Testování**: Manuální testování na zařízeních
- **Deployment**: EAS Build pro produkční verze

---

*Dokumentace vytvořena podle Klíčového pravidla 1 - důkladná, přehledná a jednotná dokumentace.*
