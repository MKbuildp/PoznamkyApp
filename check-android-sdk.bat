@echo off
echo ===== CHECKING ANDROID SDK CONFIGURATION =====
echo.

echo 1. Checking ANDROID_HOME environment variable...
if defined ANDROID_HOME (
    echo    ANDROID_HOME is set to: %ANDROID_HOME%
    if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
        echo    [OK] ADB found - SDK path is valid
    ) else (
        echo    [ERROR] ADB not found - SDK path may be invalid
    )
) else (
    echo    [WARNING] ANDROID_HOME is not set
)
echo.

echo 2. Checking common SDK locations...
set SDK_FOUND=0

if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    echo    [FOUND] %LOCALAPPDATA%\Android\Sdk
    set SDK_FOUND=1
    set SDK_PATH=%LOCALAPPDATA%\Android\Sdk
)

if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
    echo    [FOUND] %USERPROFILE%\AppData\Local\Android\Sdk
    if "%SDK_FOUND%"=="0" (
        set SDK_FOUND=1
        set SDK_PATH=%USERPROFILE%\AppData\Local\Android\Sdk
    )
)

if exist "C:\Program Files\Android\Sdk\platform-tools\adb.exe" (
    echo    [FOUND] C:\Program Files\Android\Sdk
    if "%SDK_FOUND%"=="0" (
        set SDK_FOUND=1
        set SDK_PATH=C:\Program Files\Android\Sdk
    )
)

if exist "C:\Program Files (x86)\Android\Sdk\platform-tools\adb.exe" (
    echo    [FOUND] C:\Program Files (x86)\Android\Sdk
    if "%SDK_FOUND%"=="0" (
        set SDK_FOUND=1
        set SDK_PATH=C:\Program Files (x86)\Android\Sdk
    )
)

echo.
if "%SDK_FOUND%"=="1" (
    echo 3. Recommended SDK path: %SDK_PATH%
    echo.
    echo 4. To set ANDROID_HOME permanently, run:
    echo    setx ANDROID_HOME "%SDK_PATH%"
    echo.
    echo 5. To set ANDROID_HOME for current session, run:
    echo    set ANDROID_HOME=%SDK_PATH%
) else (
    echo 3. [ERROR] Android SDK not found in common locations!
    echo.
    echo    Please:
    echo    1. Open Android Studio
    echo    2. Go to File - Settings - Appearance and Behavior - System Settings - Android SDK
    echo    3. Copy the "Android SDK Location" path
    echo    4. Set ANDROID_HOME: setx ANDROID_HOME "your_sdk_path"
)

echo.
echo ===== CHECK COMPLETE =====
pause


