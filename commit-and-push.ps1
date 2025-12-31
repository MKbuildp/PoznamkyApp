# Skript pro commit a push změn
# Spusť v PowerShell nebo Git Bash

Write-Host "Kontrola stavu git repozitáře..." -ForegroundColor Green

# Funkce pro nalezení git.exe
function Find-Git {
    # Zkus najít git v PATH
    $git = Get-Command git -ErrorAction SilentlyContinue
    if ($git) {
        return $git.Source
    }
    
    # Zkus běžná umístění
    $commonPaths = @(
        "$env:ProgramFiles\Git\bin\git.exe",
        "$env:ProgramFiles\Git\cmd\git.exe",
        "${env:ProgramFiles(x86)}\Git\bin\git.exe",
        "${env:ProgramFiles(x86)}\Git\cmd\git.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    return $null
}

# Najdi git
$gitPath = Find-Git
if (-not $gitPath) {
    Write-Host "CHYBA: Git není nalezen!" -ForegroundColor Red
    Write-Host "Možnosti:" -ForegroundColor Yellow
    Write-Host "1. Nainstaluj Git z https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. Nebo použij Git Bash a spusť příkazy ručně:" -ForegroundColor Yellow
    Write-Host "   git add ." -ForegroundColor Cyan
    Write-Host "   git commit -m 'Přidán remote origin pro GitHub'" -ForegroundColor Cyan
    Write-Host "   git push -u origin master:main" -ForegroundColor Cyan
    exit 1
}

# Vytvoř alias pro git, pokud není v PATH
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    function git { & $gitPath $args }
}

# Přidej všechny změny
Write-Host "Přidávám změny do staging area..." -ForegroundColor Green
git add .

# Zkontroluj, jestli jsou nějaké změny
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Žádné změny k commitnutí." -ForegroundColor Yellow
    exit 0
}

# Vytvoř commit
Write-Host "Vytvářím commit..." -ForegroundColor Green
git commit -m "Přidán remote origin pro GitHub propojení"

# Push na GitHub
Write-Host "Pushuji na GitHub..." -ForegroundColor Green
# Zkus push na main (pokud existuje), jinak na master
git push -u origin master:main 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Zkouším push na master..." -ForegroundColor Yellow
    git push -u origin master
}

Write-Host "Hotovo! Změny byly pushnuty na GitHub." -ForegroundColor Green

