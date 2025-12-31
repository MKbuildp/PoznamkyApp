# PROJECT_CONTEXT.md - PoznámkyApp

## 1. RYCHLÝ PŘEHLED

**PoznámkyApp** je mobilní aplikace pro správu domácích financí vytvořená v React Native s Expo. Aplikace umožňuje sledování příjmů, výdajů a domácích výdajů s možností synchronizace přes Firebase.

### Klíčové funkce:
- 📊 **Přehled** - Celkový přehled financí s měsíčními statistikami
- 💰 **Koloniál** - Správa příjmů podle kategorií + **integrované výdaje** + **editace/mazání záznamů**
- 🛒 **Výdaje** - Přesměrování na tab Koloniál (výdaje integrovány)
- 🏠 **Domácnost** - Domácí výdaje (jídlo, pravidelné, jiné) + **editace/mazání záznamů**
- 🔥 **WaxDream** - Nový tab pro správu příjmů a výdajů za celý rok s vlastními funkcemi

### Technologie:
- React Native 0.81.5 + Expo SDK 54
- TypeScript 5.9.2
- Firebase Firestore (synchronizace dat) - **REAL-TIME SYNCHRONIZACE**
- React Navigation 6
- AsyncStorage (pouze pro migraci, data primárně v Firebase)

---

## 2. ARCHITEKTURA APLIKACE

### 2.1 Navigační struktura
```
App.tsx
├── TabNavigator (Bottom Tabs)
    ├── TAB_NAMES.VYDAJE ('ZboziTab') → VydajePrehledScreenEmpty (Výdaje - přesměrování)
    ├── TAB_NAMES.PRIJMY ('VydajeTab') → PrijmyVydajeScreen (Koloniál + Výdaje) 
    ├── TAB_NAMES.PREHLED ('PrehledTab') → PrehledScreen (Přehled)
    ├── TAB_NAMES.DOMACNOST ('PoznamkyTab') → PoznamkyScreen (Domácnost)
    └── TAB_NAMES.WAXDREAM ('WaxDreamTab') → WaxDreamScreen (WaxDream - nový tab)
```

**Poznámka:** Názvy tabů neodpovídají zobrazovanému textu v tab baru. Používají se konstanty `TAB_NAMES` pro lepší dokumentaci a údržbu.

**Aktualizace 2024-12-19:** Tab Výdaje nyní zobrazuje informační obrazovku s přesměrováním na tab Koloniál, kde jsou výdaje integrovány.

**Aktualizace 2024-12-19:** Přidán nový tab WaxDream s vlastními funkcemi pro správu příjmů a výdajů za celý rok.

### 2.2 Struktura složek
```
src/
├── components/                    # Znovupoužitelné UI komponenty
│   ├── FormularPrijemVydaj/       # Nový sloučený formulář Příjem/Výdaj
│   └── CelkovyPrehled/            # Celkový přehled komponenta
├── config/                        # Konfigurace (Firebase)
├── hooks/                         # Custom hooks (logika)
├── navigation/                    # Navigační konfigurace
├── screens/                       # Obrazovky aplikace
│   ├── Prehled/                   # Přehled financí
│   ├── VydajePrehled/             # Výdaje podle dodavatelů (nyní přesměrování)
│   ├── PrijmyVydaje/              # Koloniál a výdaje (se sloučeným formulářem + výdaje)
│   ├── Poznamky/                  # Domácí výdaje
│   └── WaxDream/                  # Nový tab WaxDream s vlastními funkcemi
├── services/                      # Služby (Firestore)
└── types/                         # TypeScript typy
```

### 2.3 Datový model
**Firestore kolekce (PRIMÁRNÍ ZDROJ DAT):**
- `prijmy` - Koloniál příjmy s kategoriemi (**REAL-TIME**)
- `vydaje` - Výdaje podle dodavatelů (**REAL-TIME**)
- `domacnost` - Domácí výdaje (jídlo, pravidelné, jiné) (**REAL-TIME**)
- `waxdream_prijmy` - WaxDream příjmy (**REAL-TIME**)
- `waxdream_vydaje` - WaxDream výdaje (**REAL-TIME**)

**AsyncStorage klíče (POUZE PRO MIGRACI):**
- `seznamPrijmuData_v2` - Koloniál příjmy (deprecated, data v Firebase)
- `seznamVydajuData_v1` - Výdaje (deprecated, data v Firebase)
- `domacnostVydajeData_v1` - Domácí výdaje (deprecated, data v Firebase)
- `waxdream_prijmy` - WaxDream příjmy (deprecated, data v Firebase)
- `waxdream_vydaje` - WaxDream výdaje (deprecated, data v Firebase)
- `waxdream_vybrany_rok` - WaxDream vybraný rok (lokální preference)

---

## 3. KLÍČOVÉ KOMPONENTY

### 3.1 Navigace
- **TabNavigator.tsx** - Spodní navigační lišta s 5 záložkami
- **TAB_NAMES konstanty** - Centralizované názvy tabů s vysvětlením
- **Stack navigátory** - Pro každou záložku samostatný stack
- **Ikony** - Ionicons (receipt, cash, home, storefront, flame)

**Konstanty pro názvy tabů:**
```typescript
const TAB_NAMES = {
  VYDAJE: 'ZboziTab', // Zobrazuje "Výdaje" v tab baru
  PRIJMY: 'VydajeTab', // Zobrazuje "Koloniál" v tab baru  
  PREHLED: 'PrehledTab', // Zobrazuje "Přehled" v tab baru
  DOMACNOST: 'PoznamkyTab', // Zobrazuje "Domácnost" v tab baru
  WAXDREAM: 'WaxDreamTab' // Zobrazuje "WaxDream" v tab baru (nový)
} as const;
```

### 3.2 Synchronizace dat
- **useFirestoreRealtime.ts** - Hook pro real-time synchronizaci z Firestore (**PRIMÁRNÍ ZDROJ**)
  - Univerzální hook pro real-time načítání kolekcí z Firestore
  - Podporuje filtrování (`whereClause`), řazení (`orderBy`), transformaci dat
  - Automatické odpojení listenerů při unmount komponenty
  - Loading a error stavy
  - Používá `onSnapshot` pro automatickou aktualizaci UI
- **FirestoreService.ts** - Služba pro CRUD operace s Firestore
  - Všechny `nacti*()` metody odstraněny (data se načítají přes real-time listenery)
  - Specifické `smaz*()` metody pro každou kolekci
  - Všechny operace přímo do Firestore
- **Real-time listenery** - Automatická aktualizace UI při změnách v Firestore
- **Offline persistence** - Memory cache pro React Native prostředí
- **useFirestoreSync.ts** - Deprecated, používá se pouze pro migraci dat

### 3.3 Komponenty

#### FormularPrijemVydaj (Nový sloučený formulář)
- **Umístění**: `src/components/FormularPrijemVydaj/FormularPrijemVydaj.tsx`
- **Účel**: Sloučený formulář pro příjmy i výdaje s tab přepínačem
- **Funkce**:
  - Tab přepínač: Příjem / Výdaj
  - Datum a Částka vedle sebe na jednom řádku
  - **Příjem**: Tlačítka Tržba, Jiné (s popisem)
  - **Výdaj**: Tlačítka Zboží, Provoz (s dodavatelem)
  - Tlačítka šedá → aktivní po zadání částky → světle zelená při výběru
  - Modré tlačítko "Uložit"
  - Popisky na středu, prázdná input pole
- **Props**: Podporuje všechny potřebné handlery a stavy z obou původních formulářů
- **Rozklikávací funkcionalita**: Podporuje `isCollapsible`, `isVisible`, `onToggleVisibility` props
- **Hlavička**: "Nový záznam" s rozklikávací funkcionalitou
- **Design**: Šedé ohraničení (#E0E0E0) a vnitřní šedé čáry pro jednotný vzhled

#### FormularDomacnostiV2 (Nový formulář pro domácnost)
- **Umístění**: `src/screens/Poznamky/components/FormularDomacnostiV2.tsx`
- **Účel**: Nový formulář pro domácí výdaje s podobným designem jako FormularPrijemVydaj
- **Funkce**:
  - Datum a Částka vedle sebe na jednom řádku
  - **Pod datem**: Tlačítka Jídlo, Jiné
  - **Pod částkou**: Tlačítka Pravidelné, Příjem
  - Tlačítka šedá → aktivní po zadání částky → světle zelená při výběru
  - Modré tlačítko "Uložit"
  - Pole Účel se zobrazuje pro všechny kategorie kromě Příjem
  - Defaultně žádné tlačítko není aktivní (undefined kategorie)
- **Design**: Stejný jako FormularPrijemVydaj s šedým rámem a zelenými akcenty
- **Hlavička**: "Přidat záznam" se šedým pozadím přes celou šířku
- **Rozestupy**: Zvětšená mezera nad textem "Datum" a "Částka"

#### Modální okna pro editaci záznamů
- **EditVydajModal (Domácnost)**: `src/screens/Poznamky/components/EditVydajModal.tsx`
- **EditVydajModal (Příjmy)**: `src/screens/PrijmyVydaje/components/EditVydajModal.tsx`
- **EditTrzbaModal**: `src/screens/PrijmyVydaje/components/EditTrzbaModal.tsx`
- **WaxDreamEditPrijemModal**: `src/screens/WaxDream/components/WaxDreamEditPrijemModal.tsx`
- **WaxDreamEditVydajModal**: `src/screens/WaxDream/components/WaxDreamEditVydajModal.tsx`

**Funkce modálních oken:**
- **Editace**: Změna částky, data, kategorie, popisu/dodavatele
- **Mazání**: Tlačítko "Smazat" vedle tlačítka "Uložit" → potvrzovací dialog
- **Synchronizace**: Změny se ukládají do AsyncStorage i Firestore
- **Bezpečnost**: Potvrzovací dialog před smazáním s možností zrušení
- **Jednotný design**: Transparentní overlay, centrované okno, první řádek Datum+Částka
- **Kategorie**: Pouze zelená barva pro všechny kategorie v editaci
- **AKTUALIZACE DOMÁCNOST**: Modální okno nyní podporuje editaci všech kategorií včetně příjmů
- **ROZLIŠNÁ POLE**: Pro výdaje pole "Účel", pro příjmy pole "Popis" (volitelné)

#### NovyZaznamButton (Rozšířené tlačítko pro rozklikávací funkcionalitu)
- **Umístění**: `src/components/NovyZaznamButton/NovyZaznamButton.tsx`
- **Účel**: Univerzální tlačítko pro otevření modálního okna nebo rozklikávací funkcionalitu
- **Funkce**:
  - **Moderní design**: Světle šedé pozadí s šedým rámečkem
  - **Dynamická šipka**: ▶ pro standardní akce, ▶/▼ pro rozklikávací podle stavu
  - **Stín**: Subtle shadow pro hloubku
  - **Rozestupy**: Konzistentní s ostatními komponentami
- **Props**: 
  - `onPress` (funkce)
  - `title` (text tlačítka)
  - `isCollapsible` (boolean) - zda je rozklikávací
  - `isExpanded` (boolean) - aktuální stav rozbalení
  - `noMargin` (boolean) - vypne margin pro použití uvnitř kontejnerů
- **Použití**: 
  - **Standardní**: Otevření modálního okna na všech třech obrazovkách
  - **Rozklikávací**: Nahrazuje všechny rozklikávací hlavičky na všech obrazovkách
- **Rozklikávací hlavičky**:
  - **WaxDream**: "Příjmy", "Výdaje"
  - **Domácnost**: "Denní přehled", "Podrobný přehled"
  - **Koloniál**: "Tržby", "Jiné příjmy", "Výdaje"

#### NovyZaznamModal (Nové modální okno pro přidání záznamů)
- **Umístění**: `src/components/NovyZaznamModal/NovyZaznamModal.tsx`
- **Účel**: Univerzální modální okno pro přidání nových záznamů na všech třech obrazovkách
- **Funkce**:
  - **Přepínač Příjem/Výdaj**: Vždy nahoře s barevným rozlišením (zeleně/červeně)
  - **Výchozí nastavení**: Pro typ 'domacnost' se automaticky nastaví tab "Výdaj" při otevření modalu
  - **Datum a Částka**: Vždy pod přepínačem vedle sebe
  - **Specifické pole**: Podle typu obrazovky a vybraného tabu
  - **Kategorie**: S vlastními barvami podle záznamů (modrá, oranžová, zelená, fialová)
  - **Nadpis "Kategorie"**: Nad tlačítky kategorií
  - **Rozložení**: Tlačítka kategorií ve dvou sloupcích
  - **Popisky**: Všechny na středu s jednotným fontem (14px, font-weight 600)
  - **Tlačítka**: Zrušit (šedé) a Uložit (modré) vedle sebe
- **Typy obrazovek**:
  - **WaxDream**: Příjem (Popis), Výdaj (Materiál/Provoz + Dodavatel)
  - **Koloniál**: Příjem (Tržba/Jiné + Popis), Výdaj (Zboží/Provoz + Dodavatel)
  - **Domácnost**: Příjem (Popis), Výdaj (Jídlo/Jiné/Pravidelné + Účel) - **výchozí tab: Výdaj**
    - **POZNÁMKA**: `NovyZaznamModal` posílá stringy ('JIDLO', 'JINE', 'PRAVIDELNE', 'PRIJEM'), které se automaticky převádějí na enum hodnoty ("Jídlo", "Jiné", "Pravidelné", "Příjem") v `handleSubmitWithData` funkci v `useDomacnost.ts`
- **Design**: Stejný styl jako edit modály s transparentním overlayem
- **Barvy kategorií**: Stejné jako v záznamech pro vizuální konzistenci

#### Rozklikávací komponenty pro tab Příjmy
- **JinePrijmySeznam**: `src/screens/PrijmyVydaje/components/JinePrijmySeznam.tsx`
  - Komponenta pro zobrazení seznamu jiných příjmů s rozklikávací hlavičkou
  - Integrovaná hlavička "Jiné příjmy" s šipkou (▶/▼)
  - Šedé ohraničení (#E0E0E0) pro jednotný design
- **VydajeSeznam**: `src/screens/VydajePrehled/components/VydajeSeznam.tsx`
  - Komponenta pro zobrazení seznamu výdajů s rozklikávací funkcionalitou
  - Podporuje `isCollapsible`, `isVisible`, `onToggleVisibility` props
  - Šedé ohraničení a vnitřní čáry pro konzistentní vzhled

#### WaxDream komponenty (Nový tab)
- **WaxDreamCelkovyPrehled**: `src/screens/WaxDream/components/WaxDreamCelkovyPrehled.tsx`
  - Vlastní celkový přehled pro WaxDream s přepínáním roků místo měsíců
  - Zobrazuje "Materiál" místo "Zboží" v kategoriích
  - Stejný design jako původní CelkovyPrehled
- **WaxDreamFormular**: `src/screens/WaxDream/components/WaxDreamFormular.tsx`
  - Vlastní formulář pro WaxDream s upravenými kategoriemi
  - **Příjem**: Pouze "Popis" (odstraněna možnost "Tržba")
  - **Výdaj**: "Materiál" (místo "Zboží") a "Provoz" + pole "Dodavatel"
  - Rozklikávací funkcionalita s hlavičkou "Nový záznam"
- **WaxDreamEditPrijemModal**: `src/screens/WaxDream/components/WaxDreamEditPrijemModal.tsx`
  - Modální okno pro editaci příjmů
  - Pole: Částka, Datum, Popis
  - Tlačítko 🗑️ pro mazání s potvrzovacím dialogem
- **WaxDreamEditVydajModal**: `src/screens/WaxDream/components/WaxDreamEditVydajModal.tsx`
  - Modální okno pro editaci výdajů
  - Pole: Částka, Datum, Kategorie (Materiál/Provoz), Dodavatel
  - Tlačítko 🗑️ pro mazání s potvrzovacím dialogem

**Funkce modálních oken:**
- **Editace**: Změna částky, data, kategorie, popisu/dodavatele
- **Mazání**: Tlačítko 🗑️ v hlavičce → potvrzovací dialog s detaily záznamu
- **Synchronizace**: Změny se ukládají do AsyncStorage i Firestore
- **Bezpečnost**: Potvrzovací dialog před smazáním s možností zrušení

### 3.4 Obrazovky

#### PrehledScreen (Přehled)
- **Filtrování podle roku**: Výdaje, Příjmy a Bilance zobrazují data pouze pro vybraný rok
- **Synchronizace s přepínačem**: Změna roku v Ročním přehledu automaticky aktualizuje všechny hodnoty
- Bilance s kategoriemi (Zboží, Provoz) pro vybraný rok
- Měsíční přehled tabulka s přepínačem roků
- **Real-time synchronizace** - automatická aktualizace při změnách dat

#### VydajePrehledScreenEmpty (Výdaje - přesměrování)
- Informační obrazovka s oznámením o přesunu
- Automatické přesměrování na tab Příjmy za 2 sekundy
- Manuální tlačítko pro okamžité přesměrování
- **POZOR**: Původní funkcionalita byla přesunuta do tabu Příjmy

#### PoznamkyScreen (Domácnost)
- Domácí výdaje s kategoriemi:
  - **Jídlo** (modrá)
  - **Pravidelné** (fialová) 
  - **Jiné** (oranžová)
  - **Příjmy** (zelená)
- Měsíční přehled s víkendovým označením
- Dvousloupcová tabulka pro lepší přehlednost
- **NOVÝ FORMULÁŘ**: FormularDomacnostiV2 s podobným designem jako tab Příjmy
- **AKTUALIZOVANÝ VZHLED**: Jednotný šedý design s černými hodnotami
- **HLAVIČKY**: "Denní přehled" a "Podrobný přehled" uvnitř komponent
- **BAREVNÉ PUNTÍKY**: Před popisky kategorií v měsíčním přehledu
- **ORANŽOVÉ POZADÍ**: Za textem měsíce pro vizuální oddělení
- **ŘÁDEK CELKEM**: Přidán čtvrtý řádek s celkovou bilancí (Příjmy - Výdaje) - zelená pro kladný, červená pro záporný výsledek
- **KONZISTENTNÍ FONT**: Velikost fontu Příjmy/Výdaje sjednocena na 18px jako v ostatních komponentách CelkovyPrehled
- **EDITACE ZÁZNAMŮ**: Dlouhý stisk na řádek → modální okno pro editaci
- **MAZÁNÍ ZÁZNAMŮ**: Tlačítko 🗑️ v modálním okně → potvrzovací dialog
- **ZOBRAZENÍ PŘÍJMŮ**: Příjmy se nyní zobrazují i v sekci "Podrobný přehled" se zeleným stylováním
- **NOVÉ MODÁLNÍ OKNO**: NovyZaznamButton + NovyZaznamModal nahrazují původní rozklikávací formulář
- **UNIFORMNÍ TLAČÍTKA**: Všechna rozklikávací tlačítka ("Denní přehled", "Podrobný přehled") mají stejný moderní design

#### PrijmyVydajeScreen (Koloniál) - **SLOUČENÝ KONTEJNER**
- **Nový sloučený formulář** pro příjmy i výdaje
- Tab přepínač: Příjem / Výdaj
- **Příjem**: Kategorie Tržba, Jiné (s popisem)
- **Výdaj**: Kategorie Zboží, Provoz (s dodavatelem)
- Tlačítka jsou šedá → aktivní po zadání částky → světle zelená při výběru
- Modré tlačítko "Uložit"
- Měsíční přehled příjmů a tržeb
- **NOVĚ**: Kontejner s výdaji pod sekcí "Jiné příjmy"
- **EDITACE ZÁZNAMŮ**: Dlouhý stisk na řádek → modální okno pro editaci
- **MAZÁNÍ ZÁZNAMŮ**: Tlačítko 🗑️ v modálním okně → potvrzovací dialog
- **ROZKLIKÁVACÍ KOMPONENTY**: Všechny komponenty mají rozklikávací hlavičky
- **JEDNOTNÝ DESIGN**: Šedé ohraničení (#E0E0E0) a vnitřní šedé čáry
- **ROZESTUPY**: Sjednocené mezery mezi komponentami (10px/13px) podle tabu Domácnost
- **NOVÉ MODÁLNÍ OKNO**: NovyZaznamButton + NovyZaznamModal nahrazují původní rozklikávací formulář
- **UNIFORMNÍ TLAČÍTKA**: Všechna rozklikávací tlačítka ("Tržby", "Jiné příjmy", "Výdaje") mají stejný moderní design

#### WaxDreamScreen (WaxDream) - **NOVÝ TAB S VLASTNÍMI FUNKCEMI A FIREBASE**
- **Účel**: Správa příjmů a výdajů za celý rok (bez měsíčního dělení)
- **Celkový přehled**: Přepínání roků místo měsíců
- **Kategorie**: "Materiál" místo "Zboží" v celkovém přehledu
- **Formulář**: Vlastní WaxDreamFormular s upravenými kategoriemi
  - **Příjem**: Pouze "Popis" (odstraněna možnost "Tržba")
  - **Výdaj**: "Materiál" a "Provoz" + pole "Dodavatel"
- **Podrobné přehledy**: Dva rozklikávací seznamy - "Příjmy" a "Výdaje"
- **Tabulkové zobrazení**: Podle předlohy z tabu Domácnost
  - Hlavičky bez popisků "Datum" a "Kat."
  - Barevné puntíky pro kategorie (🔵 Materiál, 🟠 Provoz)
  - Krátké datum formát (DD.MM)
- **Editace záznamů**: Long press na řádek → modální okno
- **AsyncStorage**: Vlastní klíče pro ukládání dat
- **Hook**: `useWaxDream` pro správu dat a funkcionalitu (**ROZŠÍŘENO O FIREBASE**)
- **Firebase integrace**: **PLNĚ INTEGROVÁNO** - automatická synchronizace všech operací
- **Pull-to-refresh**: Synchronizace dat z Firebase
- **Design**: Stejný jako ostatní taby s šedým ohraničením
- **NOVÉ MODÁLNÍ OKNO**: NovyZaznamButton + NovyZaznamModal nahrazují původní rozklikávací formulář
- **UNIFORMNÍ TLAČÍTKA**: Všechna rozklikávací tlačítka ("Příjmy", "Výdaje") mají stejný moderní design

---

## 4. DESIGN SYSTÉM

### 4.1 Barvy
- **Příjmy**: `#4CAF50` (zelená)
- **Výdaje**: `#E53935` (červená)
- **Jídlo**: `#2196F3` (modrá)
- **Pravidelné**: `#9C27B0` (fialová)
- **Jiné**: `#FF9800` (oranžová)
- **Hlavní**: `#880E4F` (tmavě růžová)
- **Ohraničení**: `#E0E0E0` (šedá) - jednotný design pro všechny komponenty
- **Rozklikávací hlavičky**: `#F5F5F5` (světle šedá)

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
- **Rozestupy**: Jednotné mezery mezi komponentami
  - `uniformniRozestup`: 10px (standardní mezera)
  - `vetsiMezeraNahore`: 13px (zvětšená mezera pro první komponentu)

---

## 5. TECHNICKÉ DETAILY

### 5.1 Závislosti
```json
{
  "expo": "^54.0.0",
  "react": "19.1.0", 
  "react-native": "^0.81.5",
  "@firebase/firestore": "^4.9.1",
  "@react-navigation/bottom-tabs": "^6.6.1",
  "@react-native-async-storage/async-storage": "2.2.0",
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
- **Offline persistence**: Memory cache (vhodné pro React Native)
- **Real-time synchronizace**: Všechny obrazovky používají `onSnapshot` listenery
- **Automatická aktualizace UI**: Změny v Firestore se okamžitě projeví v aplikaci
- **WaxDream kolekce**: `waxdream_prijmy`, `waxdream_vydaje` (**REAL-TIME**)
- **Kompletní CRUD**: Všechny operace přímo do Firestore, real-time aktualizace

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
- **Offline režim**: Memory cache (data se ukládají pouze v paměti během běhu aplikace)
- **Jednodužší validace**: Základní validace formulářů
- **Žádné uživatelské účty**: Všechna data jsou veřejně přístupná v Firestore
- **Firebase integrace**: **REAL-TIME** - všechny taby používají real-time listenery
- **AsyncStorage**: Používá se pouze pro migraci starých dat, není primární zdroj

### 7.2 Plánované vylepšení
- Uživatelské účty a autentizace
- Pokročilé reporty a grafy
- Export dat (CSV, PDF)
- Push notifikace

---

## 8. BUILD_FAILURE_HISTORY

### 8.1 Nedávné změny

- **2024-12-20**: **PŘECHOD NA REAL-TIME FIREBASE SYNCHRONIZACI** - Kompletní refaktoring datového modelu
  - **Problém**: Aplikace používala hybridní model AsyncStorage + Firestore s jednorázovým načítáním dat
  - **Řešení**: Přechod na čistý real-time model s Firestore jako jediným zdrojem dat
  - **useFirestoreRealtime hook**: Vytvořen univerzální hook pro real-time synchronizaci kolekcí
    - Podporuje filtrování (`whereClause`), řazení (`orderBy`), transformaci dat
    - Automatické odpojení listenerů při unmount komponenty
    - Loading a error stavy
  - **FirestoreService refaktoring**: 
    - Odstraněny všechny `nacti*()` metody (data se načítají přes real-time listenery)
    - Přidány specifické `smaz*()` metody pro každou kolekci
    - Všechny CRUD operace přímo do Firestore
  - **Aktualizované hooky**:
    - `useDomacnost.ts` - real-time listener pro domácí výdaje
    - `usePrijmyVydaje.ts` - real-time listener pro příjmy
    - `useWaxDream.ts` - real-time listenery pro příjmy i výdaje
    - `useObchodPrehled.ts` - real-time listenery pro Koloniál
    - `usePrehled.ts` - real-time listenery pro celkový přehled
    - `usePrehledTabulka.ts` - real-time listenery pro měsíční přehled
  - **Aktualizované obrazovky**:
    - Odstraněn `useFirestoreSync` ze všech obrazovek
    - Pull-to-refresh pouze pro vizuální feedback (data se aktualizují automaticky)
    - Real-time listenery automaticky aktualizují UI při změnách
  - **Firebase konfigurace**:
    - Aktualizováno z `enableIndexedDbPersistence()` na `initializeFirestore` s `memoryLocalCache`
    - Memory cache je vhodná pro React Native (IndexedDB není podporována)
    - Offline persistence funguje v paměti během běhu aplikace
  - **Migrační skript**: Vytvořen `migrateToFirestore.ts` pro jednorázový přesun dat z AsyncStorage
  - **Výsledek**: 
    - Všechny změny se okamžitě synchronizují mezi zařízeními
    - UI se automaticky aktualizuje bez nutnosti pull-to-refresh
    - Jednodušší architektura bez duplikace dat
    - Lepší výkon díky real-time listenerům

- **2024-12-20**: **OPRAVA EDITACE JINÝCH PŘÍJMŮ** - Implementace editace záznamů kategorie "Jiné"
  - **Problém**: Záznamy v kategorii "Jiné příjmy" nešly editovat
  - **Řešení**: 
    - Vytvořeno modální okno `EditJinyPrijemModal.tsx` pro editaci jiných příjmů
    - Přidána funkce `editovatJinyPrijem` do `useObchodPrehled.ts`
    - Aktualizována komponenta `JinePrijmySeznam.tsx` - přidán `onLongPress` handler
    - Propojeno modální okno v `PrijmyVydajeScreen.tsx`
  - **Funkce**: Dlouhý stisk na záznam → modální okno s editací částky, data a popisu
  - **Výsledek**: Uživatelé mohou nyní editovat záznamy v kategorii "Jiné příjmy"

- **2024-12-20**: **AKTUALIZACE OBRAZOVKY PŘEHLED - FILTROVÁNÍ PODLE ROKU**
  - **Problém**: Výdaje, Příjmy a Bilance zobrazovaly celkové součty za všechny roky
  - **Požadavek**: Tyto hodnoty mají zobrazovat data pouze pro vybraný rok (stejný jako v Ročním přehledu)
  - **Řešení**:
    - Upraven `usePrehled.ts` - přidán parametr `vybranyRok`
    - Data se filtrují podle vybraného roku před výpočtem součtů
    - `PrehledScreen.tsx` předává `vybranyRok` z `usePrehledTabulka` do `usePrehled`
    - Loading state kombinuje oba hooky
  - **Výsledek**: 
    - Při změně roku v přepínači se automaticky aktualizují všechny hodnoty
    - Výdaje, Příjmy a Bilance zobrazují data pouze pro vybraný rok
    - Real-time synchronizace funguje pro oba hooky

- **2024-12-20**: **OPRAVA CHYB A VAROVÁNÍ**
  - **Chyba `isSyncing`**: Odstraněno použití nedefinované proměnné v `WaxDreamScreen.tsx`
  - **Varování deprecace**: Aktualizována konfigurace Firestore na nový způsob (`memoryLocalCache`)
  - **Varování IndexedDB**: Vysvětleno a opraveno - React Native nepodporuje IndexedDB, používá se memory cache
  - **Výsledek**: Aplikace běží bez chyb a varování
- **2024-12-19**: **OPRAVA PŘIŘAZOVÁNÍ KATEGORIÍ V DOMÁCNOSTI** - Oprava problému s nesprávným zobrazením kategorií a částek
  - **Problém**: Při vytváření nových záznamů se kategorie nepřiřazovaly správně - všechny záznamy měly oranžovou barvu jako "Jiné"
  - **Příčina**: `NovyZaznamModal` posílal stringy ('JIDLO', 'JINE', 'PRAVIDELNE', 'PRIJEM'), ale enum `KategorieDomacnostVydaju` má hodnoty ("Jídlo", "Jiné", "Pravidelné", "Příjem")
  - **Důsledek**: V celkovém přehledu se zobrazovaly správně pouze částky pro kategorii Jídlo, zbylé kategorie (Jiné, Pravidelné) zobrazovaly nulu i když byly záznamy
  - **Řešení**: 
    - Přidána funkce `mapKategorieStringToEnum` v `useDomacnost.ts` pro převod stringů na enum hodnoty
    - Upravena funkce `handleSubmitWithData` - převádí kategorie před uložením
    - Přidána funkce `normalizujVydaje` pro normalizaci starých záznamů při načítání z AsyncStorage/Firestore
    - Upravena funkce `nactiData` - automaticky normalizuje staré záznamy a aktualizuje je v AsyncStorage i Firestore
  - **Implementace**:
    - `useDomacnost.ts`: Přidána `mapKategorieStringToEnum` a `normalizujVydaje` funkce
    - `handleSubmitWithData`: Převod kategorií před uložením nového záznamu
    - `nactiData`: Automatická normalizace při načtení dat
  - **Výsledek**: 
    - Nové záznamy se ukládají se správnými enum hodnotami
    - Staré záznamy se automaticky převedou při načtení
    - V celkovém přehledu se zobrazují správné částky pro všechny kategorie (Jídlo, Jiné, Pravidelné)
    - Barvy kategorií se zobrazují správně (modrá pro Jídlo, oranžová pro Jiné, fialová pro Pravidelné, zelená pro Příjem)
    - Data v AsyncStorage a Firestore se automaticky aktualizují na správný formát

- **2024-12-19**: **VÝCHOZÍ NASTAVENÍ MODÁLNÍHO OKNA DOMÁCNOST** - Automatické nastavení tabu Výdaj
  - **NovyZaznamModal**: Přidán useEffect pro automatické nastavení aktivního tabu na "Výdaj" při otevření modalu pro typ 'domacnost'
  - **Zlepšení UX**: Uživatel nemusí ručně přepínat na tab Výdaj, který je nejčastěji používaný
  - **Implementace**: useEffect sleduje změny `visible` a `type` props a nastaví `aktivniTab` na 'vydaj' pro typ 'domacnost'
  - **Výsledek**: Při otevření modálního okna "Nový záznam" na obrazovce Domácnost se automaticky zobrazí tab Výdaj místo Příjem

- **2024-12-19**: **UNIFORMNÍ DESIGN ROZKLIKÁVACÍCH TLAČÍTEK** - Sjednocení všech rozklikávacích hlaviček na všech obrazovkách
  - **NovyZaznamButton rozšíření**: Přidány props `isCollapsible`, `isExpanded`, `noMargin` pro rozklikávací funkcionalitu
  - **Dynamická šipka**: Automatické přepínání mezi ▶ (sbalené) a ▼ (rozbalené) podle stavu
  - **WaxDream obrazovka**: Nahrazeny hlavičky "Příjmy" a "Výdaje" jednotným stylem
  - **Domácnost obrazovka**: Nahrazeny hlavičky "Denní přehled" a "Podrobný přehled" jednotným stylem
  - **Koloniál obrazovka**: Nahrazeny hlavičky "Tržby", "Jiné příjmy" a "Výdaje" jednotným stylem
  - **Konzistentní šířka**: Všechny komponenty mají stejnou šířku jako Celkový přehled (`margin: 8`)
  - **Jednotné mezery**: Opraveny mezery mezi tlačítky pro konzistentní rozložení
  - **Struktura**: Tlačítka jsou samostatné komponenty, obsah se zobrazuje pouze při rozbalení
  - **Výsledek**: Všechny tři obrazovky mají nyní jednotný moderní design rozklikávacích tlačítek

- **2024-12-19**: **NOVÉ MODÁLNÍ OKNO PRO PŘIDÁNÍ ZÁZNAMŮ** - Univerzální řešení pro všechny obrazovky
  - **NovyZaznamButton**: Nové tlačítko s moderním designem nahrazující rozklikávací formuláře
  - **NovyZaznamModal**: Univerzální modální okno pro přidání záznamů na všech třech obrazovkách
  - **Přepínač Příjem/Výdaj**: Vždy nahoře s barevným rozlišením (zeleně/červeně)
  - **Datum a Částka**: Vždy pod přepínačem vedle sebe
  - **Kategorie s barvami**: Stejné barvy jako v záznamech (modrá, oranžová, zelená, fialová)
  - **Nadpis "Kategorie"**: Nad tlačítky kategorií
  - **Rozložení**: Tlačítka kategorií ve dvou sloupcích
  - **Popisky**: Všechny na středu s jednotným fontem (14px, font-weight 600)
  - **Implementace**: WaxDream, Koloniál, Domácnost - všechny používají stejné modální okno
  - **Design**: Stejný styl jako edit modály s transparentním overlayem
  - **Funkčnost**: Zachována všechna původní funkcionalita, pouze změněn způsob zadávání
  - **OPRAVA VALIDACE**: Opraven problém s chybnou hláškou "Zadejte platnou částku" při zadání platné částky
    - **Problém**: Modální okno předávalo data správně, ale `handleNovyZaznamSubmit` funkce je ignorovaly
    - **Řešení**: Vytvořeny nové funkce `handleSubmitWithData` v příslušných hookách pro správné předání dat
    - **PoznamkyScreen**: Přidána `handleSubmitWithData` do `useDomacnost` hooku
    - **PrijmyVydajeScreen**: Přidány `prijmyHandleSubmitWithData` a `handleSubmitWithData` do příslušných hooků
    - **WaxDreamScreen**: Už správně používal data z modálního okna, oprava nebyla potřeba
    - **Výsledek**: Modální okno nyní správně ukládá záznamy s platnou částkou bez chybových hlášek

- **2024-12-19**: **PŘIDÁNÍ ŘÁDKU CELKEM DO DOMÁCNOSTI** - Sjednocení struktury CelkovyPrehled komponent
  - **PoznamkyScreen**: Přidán čtvrtý řádek "Celkem" s výpočtem bilance (Příjmy - Výdaje)
  - **Konzistentní design**: Stejný vzhled jako v Koloniál a WaxDream s řádkem Celkem
  - **Barevné rozlišení**: Zelená barva pro kladný výsledek, červená pro záporný
  - **Sjednocení fontů**: Velikost fontu Příjmy/Výdaje nastavena na 18px pro konzistenci s ostatními komponentami
  - **Styly**: Přidány styly `celkemNazev`, `celkemCastka`, `celkemPozitivni`, `celkemNegativni`
  - **Výsledek**: Všechny tři místa s CelkovyPrehled (Koloniál, WaxDream, Domácnost) mají nyní jednotnou strukturu

- **2024-12-19**: **AKTUALIZACE ZOBRAZENÍ PŘÍJMŮ V DOMÁCNOSTI** - Příjmy se nyní zobrazují ve spodní komponentě
  - **PoznamkyScreen**: Odstraněn filtr pro příjmy v sekci "Podrobný přehled"
  - **Zobrazení všech záznamů**: Nyní se zobrazují výdaje i příjmy v jednom seznamu
  - **Stylování příjmů**: Přidána zelená barva pro tečky a text příjmů
  - **EditVydajModal**: Rozšířeno o podporu kategorie Příjem
  - **Rozlišná pole**: Pro výdaje pole "Účel", pro příjmy pole "Popis" (volitelné)
  - **Univerzální název**: Změněn název modálního okna z "Editovat výdaj" na "Editovat záznam"
  - **Kulaté indikátory**: Všechny kategorie používají kulaté barevné tečky pro jednotnost

- **2024-12-19**: **FIREBASE INTEGRACE WAXDREAM** - Kompletní napojení WaxDream obrazovky na Firebase
  - **FirestoreService**: Rozšířen o nové kolekce `waxdream_prijmy` a `waxdream_vydaje`
  - **Nové typy**: `FirestoreWaxDreamPrijem` a `FirestoreWaxDreamVydaj` s Firebase metadata
  - **CRUD metody**: Implementovány všechny operace pro WaxDream data v Firebase
  - **useFirestoreSync**: Rozšířen o synchronizaci WaxDream dat v obou směrech
  - **useWaxDream**: Integrovány Firebase operace do všech CRUD metod
  - **Firebase synchronizace**: Automatická při přidání/editaci/mazání záznamů
  - **Pull-to-refresh**: Implementována skutečná synchronizace z Firebase
  - **Error handling**: Robustní zpracování chyb Firebase s offline fallback
  - **Offline-first**: Data se ukládají lokálně i při chybách Firebase
  - **Konzistence**: Stejný pattern jako ostatní taby aplikace
  - **Loading stavy**: Přidány indikátory během synchronizace

- **2024-12-19**: **AKTUALIZACE MODÁLNÍCH OKEN** - Jednotný moderní design pro všechna modální okna
  - Aktualizována všechna modální okna podle vzoru WaxDream
  - **EditVydajModal (Domácnost)**: Nový transparentní overlay, Datum+Částka vedle sebe, kategorie pouze zelené
  - **EditVydajModal (Příjmy)**: Stejný design jako Domácnost, Zboží+Provoz vedle sebe
  - **EditTrzbaModal**: Minimální rozložení pouze Datum+Částka, bez kategorií
  - **WaxDreamEditPrijemModal**: Původní design zachován jako vzor
  - **WaxDreamEditVydajModal**: Původní design zachován jako vzor
  - **Jednotné prvky**: Transparentní overlay, centrované okno, ✕ tlačítko, tlačítka Smazat+Uložit vedle sebe
  - **Kategorie**: Pouze zelená barva pro všechny kategorie v editaci
  - **DateTimePickerModal**: Nahrazen DateTimePicker ve všech modálních oknech
  - **ActivityIndicator**: Přidán loading stav do všech modálních oken

- **2024-12-19**: **NOVÝ TAB WAXDREAM** - Kompletní implementace nového tabu s vlastními funkcemi
  - Vytvořen nový tab WaxDream s ikonou svíčky (flame)
  - Odstraněn redundantní tab Výdaje (pouze přesměrování)
  - Implementován vlastní hook `useWaxDream` s AsyncStorage funkcionalitou
  - Vytvořeny vlastní komponenty: WaxDreamCelkovyPrehled, WaxDreamFormular, WaxDreamEditPrijemModal, WaxDreamEditVydajModal
  - Celkový přehled s přepínáním roků místo měsíců
  - Kategorie "Materiál" místo "Zboží" v celkovém přehledu
  - Formulář s upravenými kategoriemi: Příjem (pouze Popis), Výdaj (Materiál + Provoz + Dodavatel)
  - Tabulkové zobrazení podle předlohy z tabu Domácnost s možností editace
  - AsyncStorage klíče: waxdream_prijmy, waxdream_vydaje, waxdream_vybrany_rok
  - Aktualizována navigace v TabNavigator.tsx a typy v navigation.ts
  - Plně funkční editace a mazání záznamů s modálními okny

- **2024-12-19**: **NOVÝ FORMULÁŘ PRO DOMÁCNOST** - FormularDomacnostiV2
  - Vytvořena nová komponenta FormularDomacnostiV2 podobná FormularPrijemVydaj
  - Tlačítka: Pod datem (Jídlo, Jiné), pod částkou (Pravidelné, Příjem)
  - Stejný design jako tab Příjmy: šedý rám, zelené akcenty, modré tlačítko Uložit
  - Defaultně žádné tlačítko není aktivní (undefined kategorie)
  - Pole Účel bez nápověd, prázdné placeholder
  - Aktualizovány typy: kategorie může být undefined
  - Přidána validace pro undefined kategorii v handleSubmit
  - Nahrazena stará komponenta FormularDomacnosti v PoznamkyScreen

- **2024-12-19**: **AKTUALIZACE VZHLEDU TABU DOMÁCNOST** - Jednotný design
  - **Měsíční přehled**: Změněn rám z fialové na šedou (#E0E0E0)
  - **Vnitřní čáry**: Všechny oddělovací čáry změněny z černé na šedou (#E0E0E0)
  - **Hodnoty**: Všechny hodnoty změněny z fialové na černou (#000000)
  - **Barevné puntíky**: Přidány před popisky Jídlo, Jiné, Pravidelné
  - **Pozadí měsíce**: Světle oranžové pozadí (#FFF3E0) za textem měsíce
  - **Hlavičky**: Přidány "Denní přehled" a "Podrobný přehled" uvnitř komponent
  - **Velikosti fontů**: Měsíční přehled (16px), Denní přehled (13px), Podrobný přehled (13px)
  - **Jednotný styl**: Všechny komponenty mají stejný šedý rám a černé hodnoty

- **2024-12-19**: **AKTUALIZACE FORMULÁŘE DOMÁCNOST** - FormularDomacnostiV2 vylepšení
  - **Nadpis**: Změněn z "Přidat domácí výdaj" na "Přidat záznam"
  - **Hlavička**: Přidáno šedé pozadí (#F5F5F5) přes celou šířku komponenty
  - **Oddělovací čára**: Šedá čára (#E0E0E0) pod hlavičkou
  - **Rozestupy**: Zvětšena mezera nad textem "Datum" a "Částka" (16px)
  - **Design**: Stejný styl jako hlavičky "Denní přehled" a "Podrobný přehled"
  - **Logika barev**: Nulové hodnoty (0 Kč) černě, nenulové hodnoty červeně

- **2024-12-19**: **EDITACE A MAZÁNÍ ZÁZNAMŮ** - Implementace modálních oken pro editaci a mazání
  - Přidána možnost editace záznamů přes dlouhý stisk na řádek
  - Implementována tři modální okna: EditVydajModal (Domácnost), EditVydajModal (Příjmy), EditTrzbaModal
  - Přidáno tlačítko 🗑️ pro mazání záznamů v každém modálním okně
  - Potvrzovací dialog před smazáním s detaily záznamu
  - Synchronizace změn do AsyncStorage i Firestore
  - Odstraněna tlačítka "Smazat poslední výdaj" a "Smazat poslední příjem" (nahrazena precizním mazáním)
  - Oprava chyby: `FIRESTORE_COLLECTIONS` nebylo importováno v `useVydaje.ts`

- **2024-12-19**: **INTEGRACE VÝDAJŮ** - Přesun kontejneru s výdaji do tabu Koloniál
  - Přesunut kontejner s výdaji z `VydajePrehledScreen` do `PrijmyVydajeScreen`
  - Vytvořena nová obrazovka `VydajePrehledScreenEmpty` s přesměrováním
  - Tab Výdaje nyní zobrazuje informační obrazovku s automatickým přesměrováním
  - Aktualizována navigace v `TabNavigator.tsx`
  - Zachována všechna původní funkcionalita výdajů v tabu Koloniál

- **2024-12-19**: **SYNCHRONIZACE PŘEPÍNAČŮ MĚSÍCŮ** - Oprava problému s třemi různými přepínači
  - **Problém**: Na tabu Koloniál byly tři různé přepínače měsíců (Celkový přehled, Příjmy, Výdaje)
  - **Řešení**: Sjednoceny všechny přepínače na jeden společný měsíc (`vybranyMesic`)
  - **Synchronizace**: Přepnutí měsíce v horní části nyní ovlivní i všechny spodní sekce
  - **Aktualizace**: `zmenitMesic` funkce nyní volá `vydajeNactiData` pro synchronizaci výdajů
  - **VydajeSeznam**: Změněn z `vydajeMesic` na `vybranyMesic` pro jednotnost
  - **onRefresh**: Aktualizován pro použití správného měsíce
  - **useFocusEffect**: Přidána synchronizace výdajů při návratu na obrazovku
  - **Debug logy**: Odstraněny po identifikaci a opravě problému

- **2024-12-19**: **ODSTRANĚNÍ DUPLIKOVANÝCH PŘEPÍNAČŮ** - Zjednodušení UI
  - **Odstraněny**: Spodní dva přepínače měsíců (Příjmy sekce a Výdaje sekce)
  - **Zachován**: Pouze horní přepínač v Celkovém přehledu pro ovládání všech sekcí
  - **VydajeSeznam**: Odstraněn přepínač měsíců a související styly
  - **PrijmyVydajeScreen**: Odstraněn přepínač měsíců z tabulky tržeb
  - **Typy**: Aktualizován `VydajeSeznamProps` - odstraněna `zmenitMesic` prop
  - **Výsledek**: Čistší UI s jedním centrálním přepínačem měsíců

- **2024-12-19**: **ROZKLIKÁVACÍ HLAVIČKY PRO SPODNÍ KOMPONENTY** - Implementace rozklikávacího designu
  - **Styl**: Replikován design z komponenty "Podrobný přehled" z tabu Domácnost
  - **Hlavičky**: Přidány rozklikávací hlavičky s názvy "Tržby", "Jiné příjmy", "Výdaje"
  - **Funkčnost**: Každá hlavička má šipku (▶/▼) pro indikaci stavu rozbalení
  - **State**: Přidány `trzbyVisible`, `jinePrijmyVisible`, `vydajeVisible` pro řízení viditelnosti
  - **Výchozí stav**: Všechny komponenty jsou sbalené (collapsed) ve výchozím stavu
  - **Styly**: Přidány `rozklikavaciHeader` a `rozklikavaciHeaderText` podle vzoru z Domácnost
  - **Kontejner**: Vytvořen nový `vydajeContainer` pro výdaje s rozklikávací hlavičkou
  - **Výsledek**: Jednotný rozklikávací design napříč všemi spodními komponentami

- **2024-12-19**: **REFACTORING ROZKLIKÁVACÍCH KOMPONENT** - Oprava zdvojených kontejnerů a integrace hlaviček
  - **Problém**: Komponenty měly zdvojené kontejnery (vnější wrapper + vnitřní komponenta)
  - **Řešení**: Integrovány rozklikávací hlavičky přímo do komponent
  - **FormularPrijemVydaj**: Přidána podpora `isCollapsible`, `isVisible`, `onToggleVisibility` props
  - **JinePrijmySeznam**: Vytvořena nová komponenta s integrovanou rozklikávací hlavičkou
  - **VydajeSeznam**: Aktualizována pro podporu rozklikávací funkcionality
  - **Hlavička**: Změněn název z "Příjem a výdaj" na "Nový záznam"
  - **Ohraničení**: Změněno z fialové (#880E4F) na šedou (#E0E0E0) pro jednotný design
  - **Vnitřní čáry**: Změněny z černé (#000) na šedou (#E0E0E0) pro jemnější vzhled
  - **Rozestupy**: Sjednoceny mezery mezi komponentami podle tabu Domácnost (10px/13px)
  - **Výsledek**: Čistší kód bez duplikace kontejnerů a jednotný šedý design

- **2024-12-19**: **MAJOR REFACTOR** - Sloučení formulářů Příjem a Výdaj
  - Vytvořen nový sloučený komponenta `FormularPrijemVydaj`
  - Odstraněny původní komponenty `FormularPrijmu` a `FormularVydaju` z obrazovek
  - Implementován tab přepínač Příjem/Výdaj
  - Nové chování tlačítek: šedá → aktivní po zadání částky → světle zelená při výběru
  - Modré tlačítko "Uložit", popisky na středu, prázdná input pole
  - Oprava chyby: `utils.nactiRocniPrijem is not a function` - přidán export do utils
  - Aktualizace typů: `kategorie` nyní může být `undefined` pro žádnou předvolbu

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
