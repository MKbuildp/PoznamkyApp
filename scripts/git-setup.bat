@echo off
echo ========================================
echo Git Setup pro PoznamkyApp
echo ========================================
echo.

echo Kontroluji Git stav...
git status >nul 2>&1
if %errorlevel% equ 0 (
    echo Git je jiz inicializovan!
    git status
    echo.
    echo Pro pokracovani pouzij: git remote add origin URL_REPOZITARE
    pause
    exit /b
)

echo Inicializuji Git repozitare...
git init

echo.
echo Vytvarim prvni commit...
git add .
git commit -m "Initial commit: React Native aplikace pro správu financí

- Základní struktura aplikace s TypeScript
- Expo SDK 53 s Managed Workflow
- Navigace pomocí React Navigation
- Obrazovky: Přehled, Příjmy/Výdaje, Výdaje, Poznámky
- Firebase integrace pro online ukládání
- AsyncStorage pro offline funkcionalitu
- Česká lokalizace a UX"

echo.
echo ========================================
echo Git repozitare byl uspesne inicializovan!
echo ========================================
echo.
echo Dalsi kroky:
echo 1. Vytvor repozitar na GitHub/GitLab
echo 2. Spust: git remote add origin URL_REPOZITARE
echo 3. Spust: git push -u origin main
echo.
echo Pro vice informaci viz: docs/git-setup-guide.md
echo.
pause
