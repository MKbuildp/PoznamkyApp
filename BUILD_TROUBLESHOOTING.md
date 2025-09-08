# Řešení Build Problémů - PoznamkyApp

## Problém
```
AssertionError [ERR_ASSERTION]: Chunk containing module not found: undefined
```

## Implementovaná řešení

### 1. ✅ Přidané build scripty
V `package.json` jsou nyní dostupné:
- `npm run build:android` - Build pro produkci
- `npm run build:android-dev` - Build pro development
- `npm run prebuild` - Vyčištění a příprava build
- `npm run clean` - Vyčištění cache

### 2. ✅ Vypnutá New Architecture
V `app.json` nastaveno `"newArchEnabled": false` pro lepší kompatibilitu.

### 3. ✅ Optimalizovaná Metro konfigurace
V `metro.config.js` přidány optimalizace pro stabilitu bundleru.

## Postup řešení

### Krok 1: Vyčištění cache
```bash
# Spustit batch skript (Windows)
clean-and-rebuild.bat

# Nebo PowerShell skript
.\clean-and-rebuild.ps1

# Nebo manuálně
npx expo start --clear
```

### Krok 2: Zkusit build
```bash
npm run build:android
```

### Krok 3: Pokud problém přetrvává
```bash
# Manuální vyčištění
rm -rf node_modules
rm package-lock.json
npm install

# Znovu build
npm run build:android
```

## Alternativní build příkazy

```bash
# Expo CLI přímo
npx expo export:embed --platform android --dev false

# S yarn (pokud používáte)
yarn expo export:embed --platform android --dev false
```

## Kontrola kompatibility

Problém může být způsoben:
- React 19.0.0 + React Native 0.79.2 + Expo SDK 53
- Některé knihovny nemusí být kompatibilní s nejnovějšími verzemi

## Kontakt
Pokud problém přetrvává, zkontrolujte:
1. Expo CLI verzi: `npx expo --version`
2. Node.js verzi: `node --version`
3. Logy z build procesu
