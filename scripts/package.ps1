# ============================================
# SCRIPT DI PACKAGING PER SHAREPOINT
# Crea un pacchetto ZIP pronto per l'upload
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  SIMULATORE CONTO TERMICO 3.0" -ForegroundColor Cyan
Write-Host "  Packaging per SharePoint" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$workspaceRoot = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $workspaceRoot "build"
$distDir = Join-Path $workspaceRoot "dist"
$packageDir = Join-Path $workspaceRoot "package-sharepoint"

# 1. Pulizia directory
Write-Host "[1/9] Pulizia directory precedenti..." -ForegroundColor Yellow
# NON cancellare build/ perché contiene il WASM compilato
Remove-Item -Path $distDir -Recurse -ErrorAction SilentlyContinue
Remove-Item -Path $packageDir -Recurse -ErrorAction SilentlyContinue

# 2. Crea directory
Write-Host "[2/9] Creazione directory..." -ForegroundColor Yellow
New-Item -Path $buildDir -ItemType Directory -Force | Out-Null
New-Item -Path $distDir -ItemType Directory -Force | Out-Null
New-Item -Path $packageDir -ItemType Directory -Force | Out-Null

# 3. Verifica esistenza file sorgenti
Write-Host "[3/9] Verifica file sorgenti..." -ForegroundColor Yellow
$srcFiles = @("src/index.html", "src/style.css", "src/data.js", "src/script.js")
$allFilesExist = $true
foreach ($file in $srcFiles) {
    $filePath = Join-Path $workspaceRoot $file
    if (-Not (Test-Path $filePath)) {
        Write-Host "   [X] File mancante: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}
if (-Not $allFilesExist) {
    Write-Host "`n[ERRORE] File sorgenti mancanti!" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Tutti i file sorgenti presenti" -ForegroundColor Green

# 4. Copia file necessari
Write-Host "`n[4/9] Preparazione file distribuzione..." -ForegroundColor Yellow

$filesToCopy = @(
    @{ Source = "src/index.html"; Dest = "index.html" },
    @{ Source = "src/style.css"; Dest = "style.css" },
    @{ Source = "src/data.js"; Dest = "data.js" },  # Usa data.js completo con formule JavaScript
    @{ Source = "src/script.js"; Dest = "script.js" },
    @{ Source = "src/loader.js"; Dest = "loader.js" },
    @{ Source = "build/calculator.wasm"; Dest = "calculator.wasm" }
)

foreach ($file in $filesToCopy) {
    $sourcePath = Join-Path $workspaceRoot $file.Source
    $destPath = Join-Path $distDir $file.Dest
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath
        Write-Host "   [OK] $($file.Dest)" -ForegroundColor Green
    } else {
        Write-Host "   [X] $($file.Source) non trovato" -ForegroundColor Red
    }
}

# 5. Genera hash per cache busting (opzionale) - DISABILITATO per ora
# if (Test-Path $wasmDistPath) {
#     $wasmHash = (Get-FileHash $wasmDistPath -Algorithm MD5).Hash.Substring(0,8)
#     $wasmNewName = "calculator.$wasmHash.wasm"
#     Rename-Item $wasmDistPath $wasmNewName
#     Write-Host "`n[5/9] Cache busting: $wasmNewName" -ForegroundColor Cyan
#     
#     # Aggiorna il loader.js con il nuovo nome
#     $loaderPath = Join-Path $distDir "loader.js"
#     $loaderContent = Get-Content $loaderPath -Raw
#     $loaderContent = $loaderContent -replace "calculator\.wasm", $wasmNewName
#     Set-Content -Path $loaderPath -Value $loaderContent
#     Write-Host "   [OK] loader.js aggiornato" -ForegroundColor Green
# }

# 6. Crea README per l'admin
$readmePath = Join-Path $packageDir "README-INSTALLAZIONE.txt"
$readmeContent = @"
========================================
SIMULATORE CONTO TERMICO 3.0
Pacchetto per SharePoint
========================================

ISTRUZIONI PER L'AMMINISTRATORE SHAREPOINT:

1. CARICAMENTO FILE
   - Accedi a SharePoint Admin Center
   - Vai su Site Assets o Document Library dedicata
   - Crea una cartella "simulatore" (se non esiste)
   - Carica tutti i file da questa cartella

2. FILE INCLUSI:
   [OK] index.html           (Interfaccia utente)
   [OK] style.css            (Stili)
   [OK] data.js              (Dati interventi - metadati)
   [OK] script.js            (Logica applicazione)
   [OK] loader.js            (Caricatore formule protette)
   [OK] calculator.wasm      (Formule calcolo PROTETTE in formato binario)

3. INTEGRAZIONE NELLA PAGINA:
   
   Opzione A - Embed Web Part:
   - Aggiungi Embed Web Part alla pagina
   - URL: /SiteAssets/simulatore/index.html

   Opzione B - Script Editor:
   - Aggiungi Script Editor Web Part
   - Incolla questo codice:

   <div id="simulatore-container"></div>
   <link rel="stylesheet" href="/SiteAssets/simulatore/style.css">
   <script src="/SiteAssets/simulatore/data.js"></script>
   <script src="/SiteAssets/simulatore/loader.js"></script>
   <script src="/SiteAssets/simulatore/script.js"></script>

4. IMPORTANTE - MIME TYPE WASM:
   SharePoint potrebbe bloccare i file .wasm
   
   Soluzione A - Configurazione server:
   - Aggiungi MIME type: application/wasm per estensione .wasm
   
   Soluzione B - Rinominare:
   - Rinomina calculator.wasm in calculator.bin
   - In loader.js, sostituisci "calculator.wasm" con "calculator.bin"

5. VERIFICA:
   - Apri la pagina del simulatore
   - Apri Console Browser (F12)
   - Verifica messaggio: "✅ WASM caricato con successo"
   - Se vedi errori WASM, applica Soluzione B sopra

========================================
Data build: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Versione: 1.0.0
========================================
"@
Set-Content -Path $readmePath -Value $readmeContent

# 7. Copia file in package-sharepoint
Write-Host "`n[6/9] Creazione pacchetto finale..." -ForegroundColor Yellow
Copy-Item -Path "$distDir/*" -Destination $packageDir -Recurse

# 8. Crea ZIP
$zipPath = Join-Path $workspaceRoot "Simulatore-CT30-SharePoint.zip"
Remove-Item $zipPath -ErrorAction SilentlyContinue

Write-Host "`n[7/9] Compressione ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$packageDir/*" -DestinationPath $zipPath -Force

# 9. Statistiche
$zipSize = (Get-Item $zipPath).Length / 1KB
Write-Host "`n================================================" -ForegroundColor Green
Write-Host "  [OK] PACKAGING COMPLETATO CON SUCCESSO!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n[8/9] RIEPILOGO:" -ForegroundColor Cyan
Write-Host "   Pacchetto: Simulatore-CT30-SharePoint.zip" -ForegroundColor White
Write-Host "   Dimensione: $([math]::Round($zipSize, 2)) KB" -ForegroundColor White
Write-Host "   Cartella: package-sharepoint/" -ForegroundColor White
Write-Host "   File inclusi:" -ForegroundColor White
Get-ChildItem $packageDir | ForEach-Object { 
    Write-Host "      - $($_.Name)" -ForegroundColor Gray
}

Write-Host "`n[9/9] PROSSIMI PASSI:" -ForegroundColor Yellow
Write-Host "   1. Invia 'Simulatore-CT30-SharePoint.zip' all'admin SharePoint" -ForegroundColor White
Write-Host "   2. L'admin troverà le istruzioni nel file README-INSTALLAZIONE.txt" -ForegroundColor White
Write-Host "   3. Dopo l'upload, testa su: [URL SharePoint]/SiteAssets/simulatore/" -ForegroundColor White

Write-Host "`n[OK] Percorso ZIP:" -ForegroundColor Cyan
Write-Host "   $zipPath" -ForegroundColor White

# 10. Apri la cartella
Write-Host "`nApertura cartella..." -ForegroundColor Yellow
Start-Process explorer.exe -ArgumentList $workspaceRoot
