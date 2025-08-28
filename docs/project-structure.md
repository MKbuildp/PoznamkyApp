# Struktura projektu

Poslední aktualizace: 28.08.2025 - Přidána Firebase integrace

## Kořenový adresář
```
/
├── .expo/                 # Expo konfigurační soubory
├── .vscode/              # VS Code konfigurace
├── assets/               # Statické soubory (obrázky, fonty)
│   ├── adaptive-icon.png # Adaptivní ikona aplikace
│   ├── favicon.png       # Favicon
│   ├── icon.png          # Hlavní ikona aplikace
│   ├── prehled-icon.png  # Ikona pro přehled
│   └── splash-icon.png   # Splash screen ikona
├── docs/                 # Dokumentace projektu
│   ├── project-structure.md # Tento soubor
│   └── git-setup-guide.md   # Průvodce propojením s Gitem
├── node_modules/         # Závislosti projektu
├── src/                  # Zdrojový kód aplikace
├── temp/                 # Dočasné soubory (prázdná)
├── App.tsx              # Hlavní komponenta aplikace
├── app.json             # Expo konfigurace (aktualizováno pro Firebase)
├── create-apk.bat       # Skript pro vytvoření APK
├── FIREBASE_SETUP.md    # Instrukce pro nastavení Firebase
├── index.ts             # Vstupní bod aplikace
├── metro.config.js      # Metro bundler konfigurace
├── package.json         # Závislosti a skripty (přidán Firebase)
├── package-lock.json    # Zámky verzí závislostí
├── README.md            # Dokumentace projektu
├── tsconfig.json        # TypeScript konfigurace
├── .gitignore           # Git ignore soubor
└── .git/                # Git repozitář (po inicializaci)
```

## Zdrojový kód (src/)
```
src/
├── components/          # Sdílené komponenty
│   └── SpolecnaHlavicka/ # Sdílená hlavička (prázdná složka)
├── config/             # Konfigurační soubory (prázdná)
├── navigation/         # Navigační logika
│   └── TabNavigator.tsx # Hlavní tab navigace
├── screens/           # Obrazovky aplikace
├── services/          # NOVÉ: Firebase a storage služby
│   ├── firebase/      # Firebase konfigurace a služby
│   │   ├── config.ts  # Firebase konfigurace
│   │   ├── auth.ts    # Autentizační služby
│   │   ├── firestore.ts # Firestore CRUD operace
│   │   ├── types.ts   # Firebase typy
│   │   └── index.ts   # Export soubor
│   ├── storage/       # Storage služby
│   │   ├── asyncStorage.ts # AsyncStorage wrapper
│   │   ├── syncService.ts  # Synchronizační služba
│   │   └── index.ts   # Export soubor
│   ├── hooks/         # Sdílené hooks
│   │   └── useFirebaseConnection.ts # Firebase connection hook
│   └── index.ts       # Hlavní export soubor
├── ObchodPrehledScreen/ # Přehled obchodů (obsah sloučen s PrijmyVydaje)
│   ├── Poznamky/           # Poznámky obrazovka
│   ├── Prehled/            # Přehled obrazovka
│   ├── PrijmyVydaje/       # Sloučená obrazovka příjmů, výdajů a tržeb
│   ├── Prijmy/             # Příjmy obrazovka (zastaralá)
│   ├── Vydaje/             # Výdaje obrazovka (zastaralá)
│   └── VydajePrehled/      # Přehled výdajů
├── scripts/           # Pomocné skripty
│   └── resetStorage.ts # Skript pro vymazání AsyncStorage
├── types/             # TypeScript typy
│   └── navigation.ts  # Typy pro navigaci
└── utils-ignore-warnings.ts  # Utility pro ignorování varování
```

## Detailní struktura obrazovek

### Prehled/
```
Prehled/
├── components/
│   └── PrehledTabulka.tsx    # Tabulka s měsíčním přehledem
├── hooks/
│   ├── usePrehled.ts         # Hook pro celkový přehled financí
│   └── usePrehledTabulka.ts  # Hook pro tabulku přehledu
├── types/                    # (prázdná)
└── PrehledScreen.tsx         # Hlavní komponenta obrazovky
```

### PrijmyVydaje/ (SLOUČENÁ OBRAZOVKA - PŘÍJMY A TRŽBY)
```
PrijmyVydaje/
├── components/
│   ├── FormularPrijmu.tsx        # Formulář pro přidání příjmů
│   └── TabulkaJinychPrijmu.tsx   # Tabulka jiných příjmů
├── hooks/
│   └── usePrijmyVydaje.ts        # Hook pro správu příjmů
├── types/
│   └── types.ts                  # TypeScript typy pro příjmy
└── PrijmyVydajeScreen.tsx        # Hlavní komponenta obrazovky
```

**FUNKCIONALITA**: Obrazovka obsahuje:
1. **Formulář pro příjmy** (nahoře)
2. **Tlačítko "Smazat poslední příjem"** - pro rychlou opravu chyb
3. **Sekce Tržby** (uprostřed) - s měsíční navigací
4. **Jiné příjmy** (dole) - filtrované podle vybraného měsíce
5. **Provoz za měsíc** - celkové výdaje kategorie "Provoz"

**Poznámka**: Formulář pro výdaje byl přesunut na samostatnou obrazovku "Výdaje"

### Vydaje/ (ZASTARALÁ - nahrazena PrijmyVydaje)
```
Vydaje/
├── components/
│   ├── FormularVydaju.tsx        # Formulář pro přidání/editaci výdajů
│   └── MesicniPrehledVydaju.tsx  # Měsíční přehled výdajů
├── hooks/
│   └── useVydaje.ts              # Hook pro správu výdajů
├── types/
│   └── types.ts                  # TypeScript typy pro výdaje
└── VydajeScreen.tsx              # Hlavní komponenta obrazovky
```

### Prijmy/ (ZASTARALÁ - nahrazena PrijmyVydaje)
```
Prijmy/
├── components/
│   ├── FormularPrijmu.tsx        # Formulář pro přidání/editaci příjmů
│   ├── MesicniPrehled.tsx        # Měsíční přehled příjmů
│   └── MesicniPrehledPrijmu.tsx  # Alternativní měsíční přehled
├── hooks/
│   └── usePrijmy.ts              # Hook pro správu příjmů
├── types/
│   └── types.ts                  # TypeScript typy pro příjmy
└── PrijmyScreen.tsx              # Hlavní komponenta obrazovky
```

### VydajePrehled/ (Obrazovka "Výdaje")
```
VydajePrehled/
├── components/
│   ├── DodavateleTabulka.tsx     # Tabulka dodavatelů (nepoužito)
│   ├── FormularVydaju.tsx        # Formulář pro zadávání výdajů
│   └── VydajeSeznam.tsx          # Seznam všech výdajů pro vybraný měsíc
├── hooks/
│   └── useVydajePrehled.ts       # Hook pro měsíční přehled a formulář
├── types/
│   └── types.ts                  # TypeScript typy (včetně FormularVydajuProps)
└── VydajePrehledScreen.tsx       # Hlavní komponenta obrazovky
```

**Funkcionality:**
- **Formulář pro výdaje** - umístěný nad tabulkou s možností zadávání částky, dodavatele, data a kategorie (Zboží/Provoz)
- **Tlačítko "Smazat poslední výdaj"** - pro rychlou opravu chyb při zadávání
- Měsíční přehled všech výdajů (místo původního ročního)
- Navigace mezi měsíci (< Březen 2025 >)
- Zobrazení všech kategorií výdajů v jednom seznamu
- Automatické doplňování dodavatelů z existujících záznamů
- Okamžité aktualizace seznamu po přidání nového výdaje

### Poznamky/ (Obrazovka "Domácnost")
```
Poznamky/
├── components/
│   └── FormularDomacnosti.tsx    # Formulář pro domácí výdaje
├── hooks/
│   └── useDomacnost.ts           # Hook pro správu domácích výdajů
├── types/
│   └── types.ts                  # TypeScript typy pro domácnost
└── PoznamkyScreen.tsx            # Hlavní komponenta obrazovky (DomacnostScreen)
```

**Funkcionality:**
- **Formulář domácích výdajů** - zadávání částky, data a kategorie (Jídlo/Jiné)
- **Tlačítko "Smazat poslední výdaj"** - pro rychlou opravu chyb při zadávání
- **Měsíční tabulka výdajů** - dvousloupcové zobrazení s detaily
- **Okno celkové částky** - suma za aktuální měsíc
- **Seznam všech měsíčních výdajů** - s barevnými indikátory kategorií (🟢 Jídlo, 🟠 Jiné)
- **Datum a navigace** - český formát datumů a intuitivní ovládání

### ObchodPrehledScreen/ (OBSAH SLOUČEN S PRIJMYVYDAJE)
```
ObchodPrehledScreen/
├── components/                   
│   └── TabulkaJinychPrijmu.tsx   # Tabulka jiných příjmů (používá se v PrijmyVydaje)
├── hooks/
│   └── useObchodPrehled.ts       # Hook pro přehled konkrétního obchodu (používá se v PrijmyVydaje)
├── types/
│   └── types.ts                  # TypeScript typy pro přehled obchodu
└── ObchodPrehledScreen.tsx       # Původní komponenta (nepoužívá se)
```

**POZOR**: Tato složka je nyní pouze pro referenci. Její obsah je sloučen s obrazovkou `PrijmyVydaje`.

## Popis hlavních složek

### components/
Obsahuje znovupoužitelné komponenty napříč aplikací. Aktuálně obsahuje pouze složku `SpolecnaHlavicka/`, která je prázdná.

### screens/
Obsahuje jednotlivé obrazovky aplikace. Každá obrazovka má vlastní složku s následující strukturou:
```
NázevObrazovky/
├── components/     # Komponenty specifické pro obrazovku
├── hooks/         # Custom hooks pro obrazovku
├── types/         # TypeScript typy
└── NázevObrazovkyScreen.tsx  # Hlavní komponenta obrazovky
```

### navigation/
Obsahuje konfiguraci navigace:
- `TabNavigator.tsx` - Hlavní tab navigace aplikace (nyní se 4 záložkami)

### types/
Obsahuje sdílené TypeScript typy:
- `navigation.ts` - Typy pro navigaci mezi obrazovkami (aktualizováno - odstraněny zastaralé typy)

### config/
Prázdná složka určená pro konfigurační soubory a konstanty.

### scripts/
Obsahuje pomocné skripty:
- `resetStorage.ts` - Skript pro vymazání dat z AsyncStorage

## Přehled projektu

PoznamkyApp je mobilní aplikace pro správu osobních financí vyvinutá v React Native s použitím Expo Managed Workflow a TypeScriptu. Aplikace umožňuje uživatelům sledovat své příjmy a výdaje, zobrazovat přehledy podle období a jednotlivých obchodů.

## Technologie

- **Framework**: React Native s Expo SDK 53
- **Programovací jazyk**: TypeScript
- **Navigace**: React Navigation (Bottom Tabs + Native Stack)
- **Ukládání dat**: AsyncStorage
- **Ikony**: Expo Vector Icons
- **UUID generování**: react-native-uuid
- **Picker komponenty**: @react-native-picker/picker
- **Datum/čas**: @react-native-community/datetimepicker, react-native-modal-datetime-picker
- **Práce s daty**: date-fns

## Obrazovky a jejich obsah

### 1. Přehled (PrehledScreen)

**Účel**: Hlavní obrazovka aplikace, zobrazuje celkový přehled financí.

**Komponenty**:
- `PrehledTabulka` - Tabulka s měsíčním přehledem příjmů a výdajů

**Hooky**:
- `usePrehled` - Načítá celkové příjmy a výdaje, formátuje částky, umožňuje vymazat data
- `usePrehledTabulka` - Obsluhuje tabulku s přehledem dle roku

**Funkcionalita**:
- Zobrazení celkových příjmů a výdajů
- Výpočet bilance (rozdíl mezi příjmy a výdaji)
- Přehled po měsících v rámci vybraného roku
- Možnost vymazat všechna data
- Navigace na sloučenou obrazovku příjmů/výdajů přes dlaždice

### 2. Příjmy, Výdaje a Tržby (PrijmyVydajeScreen) - NOVÁ SLOUČENÁ OBRAZOVKA

**Účel**: Sloučená obrazovka pro správu příjmů, výdajů a zobrazení tržeb.

**Komponenty**:
- `FormularPrijmu` - Formulář pro přidání příjmů
- `FormularVydaju` - Formulář pro přidání výdajů
- `TabulkaJinychPrijmu` - Tabulka jiných příjmů (přesunuta z Tržby)

**Hooky**:
- `usePrijmyVydaje` - Kompletní logika pro správu příjmů a výdajů
- `useObchodPrehled` - Logika pro zobrazení tržeb (přesunuta z Tržby)

**Funkcionalita**:
- **Formulář pro příjmy** (nahoře)
- **Formulář pro výdaje** (uprostřed)
- **Sekce Tržby** (dole) obsahující:
  - Měsíční přepínač s navigací mezi měsíci
  - Dvousloupcovou tabulku denních tržeb
  - Zvýraznění víkendů
  - Tabulku jiných příjmů
  - Formátování částek a dat

### 3. Přehled výdajů (VydajeScreen)

**Účel**: Detailní přehled výdajů s možností filtrování a analýzy.

**Komponenty**:
- `DodavateleTabulka` - Tabulka s přehledem podle dodavatelů/obchodů
- `VydajeSeznam` - Seznam všech výdajů
- `ZalozkyPrepinac` - Přepínač mezi různými pohledy

**Hooky**:
- `useVydaje` - Kompletní logika pro správu výdajů

**Funkcionalita**:
- Přehled výdajů podle dodavatelů
- Seznam všech výdajů
- Přepínání mezi různými pohledy

### 4. Poznámky (PoznamkyScreen)

**Účel**: Kompletní správa poznámek/úkolů uživatele.

**Komponenty**:
- `PoznamkaDlazdice` - Zobrazení jednotlivé poznámky s možností editace/smazání
- `FormularPoznamky` - Modal formulář pro přidání a editaci poznámek

**Hooky**:
- `usePoznamky` - Kompletní logika pro CRUD operace s poznámkami

**Funkcionalita**:
- Zobrazení seznamu poznámek jako dlaždice
- Přidání nové poznámky přes kulaté tlačítko +
- Editace existujících poznámek přes vlastní modal
- Smazání poznámek s potvrzovacím dialogem
- Zobrazení data vytvoření u každé poznámky
- Rozbalování/sbalování dlouhých poznámek
- Ukládání do AsyncStorage
- Prázdný stav pro nové uživatele
- **Dostupná jako samostatná záložka v spodním tab baru**

### 5. Přehled obchodu (ObchodPrehledScreen) - OBSAH SLOUČEN

**Účel**: Obsah této obrazovky je nyní sloučen s obrazovkou Příjmy/Výdaje/Tržby.

**Funkcionalita** (nyní dostupná v sekci Tržby):
- Zobrazení statistik konkrétního obchodu
- Analýza výdajů v daném obchodě
- Měsíční přehled tržeb
- Tabulka jiných příjmů

## Hlavní datové struktury

### Příjmy
Data příjmů jsou uložena v AsyncStorage pod klíčem `seznamPrijmuData_v2`.

### Výdaje
Data výdajů jsou uložena v AsyncStorage pod klíčem `seznamVydajuData_v1`.

## Navigace

Aplikace používá `@react-navigation/bottom-tabs` pro hlavní navigaci a `@react-navigation/native-stack` pro vnořené navigace. Navigační struktura je definována v souboru `src/navigation/TabNavigator.tsx` a typy navigace jsou v `src/types/navigation.ts`.

**Hlavní navigační cesty**:
- `Prehled` - Hlavní obrazovka
- `PrijmyVydaje` - Sloučená obrazovka příjmů, výdajů a tržeb
- `VydajePrehled` - Přehled výdajů
- `Poznamky` - Obrazovka poznámek

**Spodní navigační lišta (Tab Bar)** - NOVĚ SE 4 ZÁLOŽKAMI:
- `ZboziTab` - Výdaje (VydajePrehled) - měsíční přehled - ikona: 📋 receipt
- `VydajeTab` - Příjmy (PrijmyVydaje) - **SLOUČENO S TRŽBAMI** - ikona: 💰 cash
- `PrehledTab` - Přehled (Prehled) - ikona: 🏠 home
- `PoznamkyTab` - Domácnost (Poznamky) - ikona: 🏪 storefront

**Změny v navigaci**:
- Odstraněna záložka `TrzbyTab` 
- Obsah obrazovky Tržby je nyní součástí `VydajeTab`
- Aktualizován název záložky na "Příjmy" (formulář výdajů přesunut na obrazovku Výdaje)

## Utility a sdílené funkce

### Scripty
- `resetStorage.ts` - Skript pro vymazání dat z AsyncStorage
- `git-setup.bat` - Automatická Git inicializace na Windows

### Formátování
V aplikaci se používá jednotné formátování finančních částek v českém formátu (např. `10 000 Kč`).

## Závislosti projektu

### Hlavní závislosti
- `expo`: ~53.0.0 - Expo SDK
- `react`: 19.0.0 - React framework
- `react-native`: 0.79.2 - React Native framework
- `@react-navigation/bottom-tabs`: ^6.6.1 - Tab navigace
- `@react-navigation/native`: ^6.1.18 - Navigace
- `@react-navigation/native-stack`: ^6.11.0 - Stack navigace
- `@react-native-async-storage/async-storage`: 2.1.2 - Lokální úložiště
- `@expo/vector-icons`: ^14.0.0 - Ikony
- `date-fns`: ^4.1.0 - Práce s daty a formátování
- `react-native-uuid`: ^2.0.3 - Generování UUID (používá se vlastní implementace)

### Dev závislosti
- `typescript`: ^5.1.3 - TypeScript podpora
- `@types/react`: ^19.0.10 - React typy
- `@babel/core`: ^7.20.0 - Babel transpiler
- `metro`: ^0.82.3 - Metro bundler

## 🔥 Firebase Integrace (NOVÉ)

### Architektura
- **Offline-first přístup**: Aplikace funguje i bez internetu
- **Hybridní úložiště**: AsyncStorage pro rychlý přístup, Firebase pro backup a sync
- **Automatická synchronizace**: Při připojení se data automaticky synchronizují

### Služby
```
services/
├── firebase/
│   ├── config.ts          # Firebase konfigurace (vyžaduje nastavení)
│   ├── auth.ts            # Anonymní autentizace
│   ├── firestore.ts       # CRUD operace pro Firestore
│   └── types.ts           # Firebase typy
├── storage/
│   ├── syncService.ts     # Koordinace mezi AsyncStorage a Firebase
│   └── asyncStorage.ts    # Typově bezpečný AsyncStorage wrapper
└── hooks/
    └── useFirebaseConnection.ts # Hook pro Firebase stav
```

### Firestore Schema
```
users/{userId}/
├── prijmy/{prijemId}      # Příjmy uživatele
├── vydaje/{vydajId}       # Výdaje uživatele
└── domacnost/{vydajId}    # Domácí výdaje
```

### Ukázkové soubory
- `PrijmyVydajeScreenFirebase.tsx` - Ukázka integrace do UI
- `usePrijmyVydajeFirebase.ts` - Rozšířený hook s Firebase funkcionalitou
- `FirebaseStatusIndikator.tsx` - UI komponenta pro Firebase stav

### Nastavení
Viz `FIREBASE_SETUP.md` pro kompletní instrukce nastavení.

---

*Datum poslední aktualizace: 28.08.2025 (přidána Firebase integrace a Git setup pro verzování)* 