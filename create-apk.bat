@echo off
echo ===== VYTVORENI APK PRO POZNAMKY APP =====
echo.

REM Určení cílové složky
set TARGET_DIR=C:\PoznamkyAppBuild

echo Cílový adresář pro build: %TARGET_DIR%
echo.

REM Kontrola zda cílový adresář existuje, jinak ho vytvoříme
if not exist "%TARGET_DIR%" (
  echo Vytvářím adresář %TARGET_DIR%...
  mkdir "%TARGET_DIR%"
) else (
  echo Adresář %TARGET_DIR% už existuje, bude přepsán.
  rmdir /S /Q "%TARGET_DIR%"
  mkdir "%TARGET_DIR%"
)

echo.
echo Kopíruji soubory projektu do %TARGET_DIR%...
xcopy /E /I /Y ".\" "%TARGET_DIR%\"

echo.
echo Přecházím do adresáře %TARGET_DIR%
cd /d "%TARGET_DIR%"

echo.
echo Spouštím přípravu nativního kódu...
call npx expo prebuild -p android

echo.
echo Přecházím do adresáře android...
cd android

echo.
echo Spouštím build APK...
call .\gradlew assembleRelease

echo.
if exist "app\build\outputs\apk\release\app-release.apk" (
  echo APK ÚSPĚŠNĚ VYTVOŘENO!
  echo.
  echo APK soubor najdete v: %TARGET_DIR%\android\app\build\outputs\apk\release\app-release.apk
  
  REM Zkopírování APK do výchozí složky projektu pro snadnější přístup
  echo.
  echo Kopíruji APK zpět do původního adresáře...
  copy "app\build\outputs\apk\release\app-release.apk" "..\..\PoznamkyApp.apk"
  
  echo.
  echo APK zkopírováno do: %~dp0PoznamkyApp.apk
) else (
  echo Chyba při vytváření APK!
  echo Zkontrolujte výpis chyb výše.
)

echo.
echo ===== KONEC =====
pause 