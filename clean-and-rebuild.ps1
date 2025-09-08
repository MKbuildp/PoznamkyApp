Write-Host "========================================" -ForegroundColor Green
Write-Host "Cisteni cache a reinstalace PoznamkyApp" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "1. Mazu node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

Write-Host "2. Mazu package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json"
}

Write-Host "3. Instaluju dependencies..." -ForegroundColor Yellow
npm install

Write-Host "4. Cistim Expo cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Hotovo! Nyni muzete zkusit build:" -ForegroundColor Green
Write-Host "npm run build:android" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
