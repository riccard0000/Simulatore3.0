# ============================================
# SCRIPT DI DEPLOY AUTOMATICO PER GITHUB PAGES
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEPLOY SIMULATORE SU GITHUB PAGES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Commit e push su master
Write-Host "[1/5] Commit modifiche su master..." -ForegroundColor Yellow
git add .
$commitMsg = Read-Host "Messaggio commit (lascia vuoto per usare timestamp)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

try {
    git commit -m $commitMsg
    Write-Host "   [OK] Commit creato" -ForegroundColor Green
} catch {
    Write-Host "   [INFO] Nessuna modifica da committare su master" -ForegroundColor Yellow
}

Write-Host "`n[2/5] Push su origin/master..." -ForegroundColor Yellow
git push origin master
Write-Host "   [OK] Master aggiornato" -ForegroundColor Green

# 2. Switch a gh-pages
Write-Host "`n[3/5] Switch a branch gh-pages..." -ForegroundColor Yellow
git checkout gh-pages
Write-Host "   [OK] Branch gh-pages attivo" -ForegroundColor Green

# 3. Copia file da src/
Write-Host "`n[4/5] Copia file da src/ a root..." -ForegroundColor Yellow
Copy-Item src/*.html . -Force -ErrorAction SilentlyContinue
Copy-Item src/*.js . -Force -ErrorAction SilentlyContinue
Copy-Item src/*.css . -Force -ErrorAction SilentlyContinue
Write-Host "   [OK] File copiati" -ForegroundColor Green

# 4. Commit e push gh-pages
Write-Host "`n[5/5] Deploy su GitHub Pages..." -ForegroundColor Yellow
git add index.html data.js script.js style.css loader.js
try {
    git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push origin gh-pages
    Write-Host "   [OK] GitHub Pages aggiornato" -ForegroundColor Green
} catch {
    Write-Host "   [INFO] Nessuna modifica da deployare" -ForegroundColor Yellow
}

# 5. Torna a master
Write-Host "`n[6/5] Ritorno a master..." -ForegroundColor Yellow
git checkout master
Write-Host "   [OK] Branch master attivo" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ DEPLOY COMPLETATO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nIl sito verrà aggiornato su GitHub Pages tra 1-2 minuti." -ForegroundColor White
Write-Host "URL: https://[tuo-username].github.io/Simulatore-CT30/`n" -ForegroundColor Cyan
