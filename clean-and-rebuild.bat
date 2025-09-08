@echo off
echo ========================================
echo Cisteni cache a reinstalace PoznamkyApp
echo ========================================
echo.

echo 1. Mazu node_modules...
if exist node_modules rmdir /s /q node_modules

echo 2. Mazu package-lock.json...
if exist package-lock.json del package-lock.json

echo 3. Instaluju dependencies...
npm install

echo 4. Cistim Expo cache...
npx expo start --clear

echo.
echo ========================================
echo Hotovo! Nyni muzete zkusit build:
echo npm run build:android
echo ========================================
pause
