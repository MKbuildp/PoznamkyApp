# Průvodce propojením projektu s Gitem

**Datum vytvoření:** 28.08.2025  
**Projekt:** PoznamkyApp - React Native aplikace pro správu financí

## 📋 Přehled postupu

Tento průvodce tě provede kompletním procesem propojení tvého React Native projektu s Gitem, včetně:
1. Inicializace Git repozitáře
2. Vytvoření `.gitignore` souboru
3. Prvního commitu
4. Propojení s GitHub/GitLab
5. Nastavení workflow pro týmovou práci

---

## 🚀 Krok 1: Kontrola aktuálního stavu

### 1.1 Zkontroluj, zda už Git není inicializován
```bash
git status
```

**Pokud dostaneš chybu "not a git repository":** Git ještě není inicializován, pokračuj krokem 2.

**Pokud dostaneš informaci o Git stavu:** Git už je inicializován, přeskoč na krok 3.

### 1.2 Zkontroluj, zda existuje `.gitignore`
```bash
ls -la | grep .gitignore
```

---

## 🔧 Krok 2: Inicializace Git repozitáře

### 2.1 Inicializuj Git v kořenovém adresáři projektu
```bash
cd /c/1Cursor/Poznámky/PoznamkyApp
git init
```

### 2.2 Zkontroluj stav
```bash
git status
```

Měli bys vidět seznam všech souborů jako "untracked files".

---

## 📝 Krok 3: Vytvoření .gitignore souboru

### 3.1 Vytvoř `.gitignore` soubor
```bash
touch .gitignore
```

### 3.2 Přidej obsah do `.gitignore`
```bash
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
temp/
*.tmp
*.temp

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.production

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log

# EAS Build
.easignore

# Local Netlify folder
.netlify

# Flipper
ios/Pods/
android/.gradle/
```

---

## 🔍 Krok 4: První commit

### 4.1 Přidej všechny soubory do staging area
```bash
git add .
```

### 4.2 Zkontroluj, co bude commitováno
```bash
git status
```

### 4.3 Vytvoř první commit
```bash
git commit -m "Initial commit: React Native aplikace pro správu financí

- Základní struktura aplikace s TypeScript
- Expo SDK 53 s Managed Workflow
- Navigace pomocí React Navigation
- Obrazovky: Přehled, Příjmy/Výdaje, Výdaje, Poznámky
- Firebase integrace pro online ukládání
- AsyncStorage pro offline funkcionalitu
- Česká lokalizace a UX"
```

---

## 🌐 Krok 5: Propojení s GitHub/GitLab

### 5.1 Vytvoř nový repozitář na GitHub/GitLab
- Jdi na [github.com](https://github.com) nebo [gitlab.com](https://gitlab.com)
- Klikni na "New repository" nebo "New project"
- Název: `PoznamkyApp` nebo `poznamky-app`
- Popis: `Mobilní aplikace pro správu osobních financí v React Native`
- **NEOZNAČUJ jako Public** (pokud nechceš zveřejnit kód)
- **NEOZNAČUJ** "Initialize with README", "Add .gitignore", "Choose a license"

### 5.2 Přidej remote origin
```bash
git remote add origin https://github.com/TVUJE_USERNAME/PoznamkyApp.git
```

**Nahraď `TVUJE_USERNAME` svým GitHub username.**

### 5.3 Ověř remote
```bash
git remote -v
```

### 5.4 Pushni kód na GitHub
```bash
git push -u origin main
```

**Pokud máš branch `master` místo `main`:**
```bash
git branch -M main
git push -u origin main
```

---

## ⚙️ Krok 6: Nastavení pro týmovou práci

### 6.1 Nastav Git konfiguraci (pokud ještě není nastavena)
```bash
git config --global user.name "Tvoje Celé Jméno"
git config --global user.email "tvoje.email@example.com"
```

### 6.2 Nastav Git editor (volitelné)
```bash
git config --global core.editor "code --wait"
```

### 6.3 Nastav default branch
```bash
git config --global init.defaultBranch main
```

---

## 🔄 Krok 7: Denní workflow

### 7.1 Zkontroluj stav před prací
```bash
git status
```

### 7.2 Stáhni nejnovější změny
```bash
git pull origin main
```

### 7.3 Vytvoř novou branch pro feature (doporučeno)
```bash
git checkout -b feature/nazev-feature
```

### 7.4 Commit a push změn
```bash
git add .
git commit -m "Popis změny v češtině"
git push origin feature/nazev-feature
```

### 7.5 Merge do main (přes Pull Request)
- Vytvoř Pull Request na GitHub/GitLab
- Po review merge do main
- Smazat feature branch

---

## 📚 Užitečné Git příkazy

### Základní příkazy
```bash
git status          # Zobrazí stav repozitáře
git add .           # Přidá všechny změny
git commit -m "..." # Vytvoří commit
git push            # Odešle změny na server
git pull            # Stáhne změny ze serveru
```

### Branch management
```bash
git branch          # Zobrazí všechny branch
git checkout -b nova-branch  # Vytvoří a přepne na novou branch
git checkout main   # Přepne na main branch
git branch -d stara-branch  # Smaže starou branch
```

### Historie a změny
```bash
git log             # Zobrazí historii commitů
git diff            # Zobrazí změny v souborech
git show HEAD       # Zobrazí poslední commit
```

---

## 🚨 Časté problémy a řešení

### Problém: "Permission denied"
**Řešení:** Zkontroluj, zda máš správně nastavené SSH klíče nebo používáš správné heslo.

### Problém: "Branch 'main' does not exist"
**Řešení:** Vytvoř main branch:
```bash
git checkout -b main
git push -u origin main
```

### Problém: "Merge conflicts"
**Řešení:** 
1. Stáhni nejnovější změny: `git pull origin main`
2. Vyřeš konflikty v souborech
3. Přidej vyřešené soubory: `git add .`
4. Dokonči merge: `git commit`

---

## ✅ Kontrolní seznam

- [ ] Git repozitář inicializován
- [ ] `.gitignore` soubor vytvořen a naplněn
- [ ] První commit vytvořen
- [ ] Remote origin přidán
- [ ] Kód pushnut na GitHub/GitLab
- [ ] Git konfigurace nastavena
- [ ] Týmový workflow nastaven

---

## 🎯 Další kroky

Po úspěšném propojení s Gitem doporučuji:

1. **Nastavit GitHub Actions** pro automatické testování
2. **Vytvořit CONTRIBUTING.md** s pravidly pro přispívání
3. **Nastavit branch protection** pro main branch
4. **Vytvořit releases** pro stabilní verze
5. **Nastavit automatické deployment** na Expo

---

## 📞 Potřebuješ pomoc?

Pokud narazíš na problémy:
1. Zkontroluj chybové hlášky
2. Použij `git status` pro kontrolu stavu
3. Konzultuj Git dokumentaci
4. Obrať se na tým nebo komunitu

---

**Úspěšné propojení s Gitem! 🎉**
