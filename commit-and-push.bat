@echo off
REM Batch skript pro commit a push změn
REM Spusť v Git Bash nebo po instalaci gitu

echo Kontrola stavu git repozitáře...

REM Zkontroluj, jestli je git dostupný
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo CHYBA: Git není v PATH!
    echo.
    echo Možnosti:
    echo 1. Nainstaluj Git z https://git-scm.com/download/win
    echo 2. Nebo použij Git Bash a spusť příkazy ručně:
    echo    git add .
    echo    git commit -m "Přidán remote origin pro GitHub"
    echo    git push -u origin master:main
    pause
    exit /b 1
)

REM Přidej všechny změny
echo Přidávám změny do staging area...
git add .

REM Vytvoř commit
echo Vytvářím commit...
git commit -m "Přidán remote origin pro GitHub propojení"

REM Push na GitHub
echo Pushuji na GitHub...
git push -u origin master:main
if %ERRORLEVEL% NEQ 0 (
    echo Zkouším push na master...
    git push -u origin master
)

echo.
echo Hotovo! Změny byly pushnuty na GitHub.
pause

