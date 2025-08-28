# GitHub Actions Setup pro PoznamkyApp

**Datum vytvoření:** 28.08.2025  
**Účel:** Automatické sestavení APK a IPA souborů

## 🚀 Přehled

GitHub Actions automaticky sestavuje tvou aplikaci při:
- Push na `main` nebo `develop` branch
- Vytvoření tagu (např. `v1.0.0`)
- Pull request na `main` branch
- Manuálním spuštění

## 📱 Podporované platformy

### Android (APK)
- **Runner:** Ubuntu Latest
- **Java:** 17 (Zulu distribution)
- **Build:** Expo EAS Build
- **Výstup:** `PoznamkyApp.apk`

### iOS (IPA)
- **Runner:** macOS Latest
- **Build:** Expo EAS Build
- **Výstup:** `PoznamkyApp.ipa`

## ⚙️ Nastavení

### 1. Expo Token
1. Jdi na [expo.dev](https://expo.dev)
2. Přihlas se do svého účtu
3. Jdi do Account Settings → Access Tokens
4. Vytvoř nový token
5. Zkopíruj token

### 2. GitHub Secrets
1. Jdi do tvého GitHub repozitáře
2. Settings → Secrets and variables → Actions
3. Klikni "New repository secret"
4. Název: `EXPO_TOKEN`
5. Hodnota: Vlož svůj Expo token

## 🔄 Workflow soubory

### `build-android.yml`
- Sestavuje pouze Android APK
- Spouští se na Ubuntu
- Vytváří artifact s APK souborem

### `build-ios.yml`
- Sestavuje pouze iOS IPA
- Spouští se na macOS
- Vytváří artifact s IPA souborem

### `build-all-platforms.yml`
- Sestavuje obě platformy najednou
- Android build běží paralelně s iOS
- Po dokončení obou se vytvoří release

## 📦 EAS Build konfigurace

### `eas.json`
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 🎯 Jak používat

### Automatické sestavení
1. Push kódu na `main` branch
2. GitHub Actions se automaticky spustí
3. Počkej na dokončení buildů
4. Stáhni artifacts z Actions tab

### Manuální spuštění
1. Jdi do Actions tab na GitHubu
2. Vyber workflow (např. "Build All Platforms")
3. Klikni "Run workflow"
4. Vyber branch a klikni "Run workflow"

### Vytvoření release
1. Vytvoř tag: `git tag v1.0.0`
2. Push tag: `git push origin v1.0.0`
3. GitHub Actions automaticky vytvoří release
4. APK a IPA soubory budou dostupné v release

## 📋 Build proces

### Android Build
1. Setup Node.js 18
2. Setup Java 17
3. Instalace závislostí
4. Setup Expo CLI a EAS CLI
5. Login do Expo
6. EAS Build konfigurace
7. Sestavení APK
8. Upload artifact

### iOS Build
1. Setup Node.js 18
2. Instalace závislostí
3. Setup Expo CLI a EAS CLI
4. Login do Expo
5. EAS Build konfigurace
6. Sestavení IPA
7. Upload artifact

## 🚨 Řešení problémů

### Build selhal
1. Zkontroluj Actions tab pro chyby
2. Ověř, že `EXPO_TOKEN` je správně nastaven
3. Zkontroluj, že `eas.json` existuje
4. Ověř Expo SDK kompatibilitu

### Expo login selhal
1. Zkontroluj platnost `EXPO_TOKEN`
2. Ověř, že token má správná oprávnění
3. Zkus vytvořit nový token

### Local build selhal
1. Zkontroluj, že máš nainstalovaný EAS CLI
2. Ověř Expo konfiguraci
3. Zkus cloud build místo local

## 📚 Užitečné odkazy

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS CLI](https://docs.expo.dev/eas-cli/)
- [GitHub Actions for React Native](https://github.com/marketplace?type=actions&query=react+native)

## ✅ Kontrolní seznam

- [ ] Expo token vytvořen
- [ ] GitHub secret `EXPO_TOKEN` nastaven
- [ ] Workflow soubory přidány do `.github/workflows/`
- [ ] `eas.json` konfigurace vytvořena
- [ ] První build spuštěn
- [ ] Artifacts úspěšně staženy
- [ ] Release vytvořen (volitelně)

---

**Úspěšné automatické sestavení! 🎉**
