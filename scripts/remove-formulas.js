/**
 * Script per generare data-wasm.js (versione senza formule)
 * Le formule sono nel WASM, qui ci sono solo i metadati
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Generazione data-wasm.js (senza formule di calcolo)...\n');

const dataJsPath = path.join(__dirname, '..', 'src', 'data.js');
const dataWasmPath = path.join(__dirname, '..', 'build', 'data-wasm.js');

// Leggi il file originale
let content = fs.readFileSync(dataJsPath, 'utf8');

// Pattern per trovare le funzioni calculate
const calculatePattern = /calculate:\s*\(params,\s*operatorType\)\s*=>\s*\{[\s\S]*?(?=\n\s{8}\}|\n\s{4}\},)/g;

// Sostituisci tutte le funzioni calculate con placeholder
content = content.replace(calculatePattern, 'calculate: null // Calcolo gestito da WASM');

// Aggiungi header con avviso
const header = `/**
 * Simulatore Conto Termico 3.0 - Data Configuration
 * 
 * ⚠️ VERSIONE PER SHAREPOINT CON WASM
 * 
 * Questo file contiene SOLO i metadati degli interventi.
 * Le formule di calcolo sono nel modulo WASM protetto (calculator.wasm).
 * 
 * NON MODIFICARE - File generato automaticamente
 */

`;

content = header + content;

// Crea directory build se non esiste
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Salva il file
fs.writeFileSync(dataWasmPath, content, 'utf8');

console.log('✅ File generato: build/data-wasm.js');
console.log('📝 Le funzioni calculate sono state rimosse');
console.log('🔒 I calcoli verranno eseguiti dal modulo WASM\n');
