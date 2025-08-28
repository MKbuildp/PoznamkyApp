# Git Setup pro PoznamkyApp - PowerShell skript
# Spustit jako: .\scripts\git-setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Setup pro PoznamkyApp" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kontrola Git stavu
Write-Host "Kontroluji Git stav..." -ForegroundColor Yellow
try {
    $gitStatus = git status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Git je jiz inicializovan!" -ForegroundColor Green
        git status
        Write-Host ""
        Write-Host "Pro pokracovani pouzij: git remote add origin URL_REPOZITARE" -ForegroundColor Yellow
        Read-Host "Stiskni Enter pro ukonceni"
        exit
    }
} catch {
    # Git není inicializován, pokračujeme
}

Write-Host "Inicializuji Git repozitare..." -ForegroundColor Yellow
git init

Write-Host ""
Write-Host "Vytvarim prvni commit..." -ForegroundColor Yellow
git add .
git commit -m "Initial commit: React Native aplikace pro správu financí

- Základní struktura aplikace s TypeScript
- Expo SDK 53 s Managed Workflow
- Navigace pomocí React Navigation
- Obrazovky: Přehled, Příjmy/Výdaje, Výdaje, Poznámky
- Firebase integrace pro online ukládání
- AsyncStorage pro offline funkcionalitu
- Česká lokalizace a UX"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Git repozitare byl uspesne inicializovan!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Dalsi kroky:" -ForegroundColor Yellow
Write-Host "1. Vytvor repozitar na GitHub/GitLab" -ForegroundColor White
Write-Host "2. Spust: git remote add origin URL_REPOZITARE" -ForegroundColor White
Write-Host "3. Spust: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Pro vice informaci viz: docs/git-setup-guide.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "Stiskni Enter pro ukonceni"
