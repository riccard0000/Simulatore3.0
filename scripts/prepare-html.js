/**
 * Script per generare index.html con caricamento WASM
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Generazione index.html per SharePoint (con WASM)...\n');

const srcHtmlPath = path.join(__dirname, '..', 'src', 'index.html');
const buildHtmlPath = path.join(__dirname, '..', 'build', 'index.html');

// Leggi il file HTML sorgente
let content = fs.readFileSync(srcHtmlPath, 'utf8');

// Trova il blocco degli script prima di </body>
const scriptPattern = /<!-- Caricamento moduli -->[\s\S]*?<\/body>/;

// Crea il nuovo blocco con WASM (senza inizializzazione inline - gestita da script.js)
const wasmScripts = `<!-- Caricamento moduli con WASM -->
    <script src="data.js"></script>
    <script src="loader.js"></script>
    <script src="script.js"></script>

</body>`;

content = content.replace(scriptPattern, wasmScripts);

// Crea directory build se non esiste
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Salva il file
fs.writeFileSync(buildHtmlPath, content, 'utf8');

console.log('✅ File generato: build/index.html');
console.log('🔒 Versione con caricamento WASM per SharePoint\n');
