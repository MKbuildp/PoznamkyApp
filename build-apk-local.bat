@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ===== LOKALNI BUILD APK =====
echo.

REM Automaticke hledani a nastaveni JAVA_HOME
if defined JAVA_HOME (
    echo Pouzivam existujici JAVA_HOME: %JAVA_HOME%
    goto :java_ok
)

echo JAVA_HOME neni nastaven, hledam Java automaticky...

REM Zkus Android Studio JBR v LocalAppData
if exist "%LOCALAPPDATA%\Android\Sdk\jbr\bin\java.exe" (
    set "JAVA_HOME=%LOCALAPPDATA%\Android\Sdk\jbr"
    echo Nalezena Java v Android Studio JBR: !JAVA_HOME!
    goto :java_ok
)

REM Zkus Android Studio JRE v LocalAppData
if exist "%LOCALAPPDATA%\Android\Sdk\jre\bin\java.exe" (
    set "JAVA_HOME=%LOCALAPPDATA%\Android\Sdk\jre"
    echo Nalezena Java v Android Studio JRE: !JAVA_HOME!
    goto :java_ok
)

REM Zkus Android Studio JBR v User AppData
if exist "%USERPROFILE%\AppData\Local\Android\Sdk\jbr\bin\java.exe" (
    set "JAVA_HOME=%USERPROFILE%\AppData\Local\Android\Sdk\jbr"
    echo Nalezena Java v Android Studio JBR - User: !JAVA_HOME!
    goto :java_ok
)

REM Zkus Android Studio JBR v Program Files
set "AS_PATH1=C:\Program Files\Android\Android Studio\jbr\bin\java.exe"
if exist "%AS_PATH1%" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    echo Nalezena Java v Android Studio JBR - Program Files: !JAVA_HOME!
    goto :java_ok
)

REM Zkus Android Studio JBR v Program Files (x86)
set "AS_PATH2=C:\Program Files (x86)\Android\Android Studio\jbr\bin\java.exe"
if exist "%AS_PATH2%" (
    set "JAVA_HOME=C:\Program Files (x86)\Android\Android Studio\jbr"
    echo Nalezena Java v Android Studio JBR - Program Files x86: !JAVA_HOME!
    goto :java_ok
)

REM Zkus Program Files - Eclipse Adoptium
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk-*") do (
    if exist "%%i\bin\java.exe" (
        set "JAVA_HOME=%%i"
        echo Nalezena Java v Eclipse Adoptium: !JAVA_HOME!
        goto :java_ok
    )
)

REM Zkus Program Files - Oracle JDK
for /d %%i in ("C:\Program Files\Java\jdk-*") do (
    if exist "%%i\bin\java.exe" (
        set "JAVA_HOME=%%i"
        echo Nalezena Java v Oracle JDK: !JAVA_HOME!
        goto :java_ok
    )
)

REM Zkus Program Files (x86)
for /d %%i in ("C:\Program Files (x86)\Java\jdk-*") do (
    if exist "%%i\bin\java.exe" (
        set "JAVA_HOME=%%i"
        echo Nalezena Java v Program Files x86: !JAVA_HOME!
        goto :java_ok
    )
)

REM Java nebyla nalezena
echo.
echo CHYBA: Java nebyla nalezena!
echo.
echo Instrukce:
echo 1. Nainstalujte Java JDK - doporuceno: Eclipse Adoptium nebo Android Studio
echo 2. Nebo nastavte promennou JAVA_HOME rucne:
echo    setx JAVA_HOME "C:\cesta\k\java"
echo 3. Nebo pridejte Java do PATH
echo.
pause
exit /b 1

:java_ok
echo JAVA_HOME nastaven na: %JAVA_HOME%
echo.

REM Dočasné odstranění edgeToEdgeEnabled z app.json pro prebuild
echo Upravuji app.json pro prebuild...
set EDGE_TO_EDGE_BACKUP=0
findstr /C:"edgeToEdgeEnabled" app.json >nul
if %errorlevel%==0 (
    set EDGE_TO_EDGE_BACKUP=1
    echo Dočasně odstraňuji edgeToEdgeEnabled z app.json...
    REM Vytvoření dočasného app.json bez edgeToEdgeEnabled
    powershell -Command "$content = Get-Content app.json -Raw; $content = $content -replace '(?m)^(\s*)\"edgeToEdgeEnabled\":\s*true,?\r?$', ''; $content = $content -replace ',\s*\"edgeToEdgeEnabled\":\s*true', ''; Set-Content app.json.tmp -Value $content -NoNewline"
    if exist "app.json.tmp" (
        move /Y app.json.tmp app.json >nul
    )
)

REM Vzdy spustime prebuild s --clean pro zajištění správné konfigurace
echo Spoustim expo prebuild s --clean...
if exist "android" (
    echo Smazani existujici android slozky...
    rmdir /S /Q "android"
)
call npx expo prebuild --clean -p android
set PREBUILD_ERROR=%errorlevel%

REM Obnovení edgeToEdgeEnabled v app.json
if %EDGE_TO_EDGE_BACKUP%==1 (
    echo Obnovuji edgeToEdgeEnabled v app.json...
    powershell -Command "$content = Get-Content app.json -Raw; if ($content -notmatch 'edgeToEdgeEnabled') { $content = $content -replace '(\"versionCode\":\s*\d+),', '$1,`r`n      \"edgeToEdgeEnabled\": true,'; Set-Content app.json -Value $content -NoNewline }"
)

if %PREBUILD_ERROR% neq 0 (
    echo.
    echo CHYBA: Nepodarilo se vytvorit android slozku!
    if %EDGE_TO_EDGE_BACKUP%==1 (
        echo Obnovuji edgeToEdgeEnabled v app.json...
        powershell -Command "$content = Get-Content app.json -Raw; if ($content -notmatch 'edgeToEdgeEnabled') { $content = $content -replace '(\"versionCode\":\s*\d+),', '$1,`r`n      \"edgeToEdgeEnabled\": true,'; Set-Content app.json -Value $content -NoNewline }"
    )
    pause
    exit /b 1
)

REM Pokud máme edgeToEdgeEnabled a prebuild proběhl, přidáme ho ručně do MainApplication
if %EDGE_TO_EDGE_BACKUP%==1 (
    echo Pridavam edgeToEdgeEnabled do MainApplication...
    if exist "android\app\src\main\java\com\mkbuild\PoznamkyApp\MainApplication.java" (
        powershell -Command "$file = 'android\app\src\main\java\com\mkbuild\PoznamkyApp\MainApplication.java'; $content = Get-Content $file -Raw; if ($content -notmatch 'WindowCompat') { $content = $content -replace '(import android.os.Bundle;)', '$1`r`nimport androidx.core.view.WindowCompat;'; $content = $content -replace '(super.onCreate\(\);)', '$1`r`n    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);'; Set-Content $file -Value $content -NoNewline }"
        echo edgeToEdgeEnabled byl pridan do MainApplication.
    ) else (
        echo VAROVANI: MainApplication.java nebyl nalezen, edgeToEdgeEnabled nebyl pridán.
    )
)

echo.
echo Hledam Android SDK...
set ANDROID_SDK_FOUND=0

REM Zkus ANDROID_HOME promennou
if defined ANDROID_HOME (
    if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
        set "ANDROID_SDK=%ANDROID_HOME%"
        set ANDROID_SDK_FOUND=1
        echo Pouzivam existujici ANDROID_HOME: %ANDROID_SDK%
    )
)

REM Zkus LocalAppData
if "%ANDROID_SDK_FOUND%"=="0" if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set "ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"
    set ANDROID_SDK_FOUND=1
    echo Nalezeno Android SDK v LocalAppData: %ANDROID_SDK%
)

REM Zkus User AppData
if "%ANDROID_SDK_FOUND%"=="0" if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
    set "ANDROID_SDK=%USERPROFILE%\AppData\Local\Android\Sdk"
    set ANDROID_SDK_FOUND=1
    echo Nalezeno Android SDK v User AppData: %ANDROID_SDK%
)

REM Zkus Program Files
if "%ANDROID_SDK_FOUND%"=="0" if exist "C:\Program Files\Android\Sdk\platform-tools\adb.exe" (
    set "ANDROID_SDK=C:\Program Files\Android\Sdk"
    set ANDROID_SDK_FOUND=1
    echo Nalezeno Android SDK v Program Files: %ANDROID_SDK%
)

REM Zkus Program Files (x86)
if "%ANDROID_SDK_FOUND%"=="0" if exist "C:\Program Files (x86)\Android\Sdk\platform-tools\adb.exe" (
    set "ANDROID_SDK=C:\Program Files (x86)\Android\Sdk"
    set ANDROID_SDK_FOUND=1
    echo Nalezeno Android SDK v Program Files (x86): %ANDROID_SDK%
)

if "%ANDROID_SDK_FOUND%"=="0" (
    echo.
    echo CHYBA: Android SDK nebylo nalezeno!
    echo.
    echo Instrukce:
    echo 1. Otevřete Android Studio
    echo 2. Jděte na File - Settings - Appearance and Behavior - System Settings - Android SDK
    echo 3. Zkopírujte cestu "Android SDK Location"
    echo 4. Nastavte proměnnou ANDROID_HOME:
    echo    setx ANDROID_HOME "C:\cesta\k\android\sdk"
    echo 5. Nebo vytvořte soubor android\local.properties s obsahem:
    echo    sdk.dir=C:\\cesta\\k\\android\\sdk
    echo.
    pause
    exit /b 1
) else (
    echo Vytvarim local.properties soubor...
    (
        echo sdk.dir=%ANDROID_SDK%
    ) > android\local.properties
    echo Android SDK nastaveno na: %ANDROID_SDK%
)

echo.
echo Prechazim do adresare android...
cd android

echo.
echo Spoustim build APK...
call .\gradlew assembleRelease

echo.
cd ..
if exist "android\app\build\outputs\apk\release\app-release.apk" (
  echo.
  echo ===== APK USPESNE VYTVORENO! =====
  echo.
  echo APK soubor najdete v:
  echo %CD%\android\app\build\outputs\apk\release\app-release.apk
  echo.
) else (
  echo.
  echo CHYBA: APK nebylo vytvoreno!
  echo Zkontrolujte vypis chyb vyse.
  echo.
)

echo ===== KONEC =====
pause

