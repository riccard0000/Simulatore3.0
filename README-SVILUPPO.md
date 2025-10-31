# 🛠️ Guida Sviluppo Simulatore Conto Termico 3.0

## 📋 Setup Iniziale (Una volta sola)

### 1. Installa Node.js
Scarica da: https://nodejs.org/ (versione LTS)

### 2. Installa dipendenze
```powershell
npm install
```

### 3. Installa AssemblyScript globalmente
```powershell
npm install -g assemblyscript
```

---

## 🚀 Workflow Quotidiano

### Scenario: Devi modificare una formula

#### **Passo 1: Modifica il codice sorgente**
Apri `src/data.js` e modifica:
```javascript
'isolamento-opache': {
    calculate: (params, operatorType) => {
        const cmax = 350; // ← MODIFICATO DA 300 A 350
        // ... resto del codice
    }
}
```

#### **Passo 2: Build e Package automatico**

**Opzione A - Con VS Code Task (RACCOMANDATO):**
1. Premi `Ctrl + Shift + P`
2. Digita "Tasks: Run Task"
3. Seleziona "🚀 Build Completo + Pacchetto"
4. Aspetta il completamento

**Opzione B - Con Keyboard Shortcut:**
- Premi `Ctrl + Shift + B`

**Opzione C - Con NPM:**
```powershell
npm run build
```

**Opzione D - Manualmente:**
```powershell
# 1. Sincronizza JS → TS
npm run sync

# 2. Compila WASM
npm run build:wasm

# 3. Crea pacchetto
npm run package
```

#### **Passo 3: Invia all'Admin SharePoint**
Troverai il file `Simulatore-CT30-SharePoint.zip` nella root del progetto.

---

## 🧪 Test Locale

### Test con JavaScript (senza WASM)
```powershell
npm run dev
```
Apre http://localhost:8080 con il codice JS originale

### Test con WASM compilato
```powershell
npm run test
```
Apre http://localhost:8081 con il WASM compilato

---

## 📦 Cosa viene generato

```
Simulatore CT3.0/
├── build/
│   └── calculator.wasm          ← WASM compilato
├── dist/
│   ├── index.html
│   ├── style.css
│   ├── loader.js
│   └── calculator.[hash].wasm   ← Con cache busting
├── package-sharepoint/
│   ├── index.html
│   ├── style.css
│   ├── loader.js
│   ├── calculator.[hash].wasm
│   └── README-INSTALLAZIONE.txt ← Istruzioni per admin
└── Simulatore-CT30-SharePoint.zip ← INVIA QUESTO FILE
```

---

## ⌨️ Comandi Disponibili

### Tasks VS Code (Ctrl+Shift+P → Tasks: Run Task)
- `🚀 Build Completo + Pacchetto` - Tutto in un click
- `🔄 Sync JS → TypeScript` - Solo sincronizzazione
- `🔨 Build WASM` - Solo compilazione
- `📦 Crea Pacchetto per SharePoint` - Solo packaging
- `🧪 Test Locale` - Server di sviluppo

### Comandi NPM
```powershell
npm run sync      # Sincronizza src/data.js → assembly/calculator.ts
npm run build:wasm # Compila WASM
npm run package   # Crea ZIP per SharePoint
npm run build     # Esegue tutto in sequenza
npm run dev       # Test locale con JS
npm run test      # Test locale con WASM
```

### Shortcut Tastiera
- `Ctrl + Shift + B` - Build completo
- `Ctrl + Shift + T` - Test locale

---

## 🔄 Pipeline Completa

```
┌─────────────────┐
│  Modifica       │
│  src/data.js    │ ← TU MODIFICHI QUI
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  sync-to-wasm   │
│  Converte in    │
│  TypeScript     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AssemblyScript │
│  Compila WASM   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  package.ps1    │
│  Crea ZIP       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ZIP pronto     │
│  per SharePoint │ ← INVIA ALL'ADMIN
└─────────────────┘
```

---

## 🐛 Troubleshooting

### "asc non è riconosciuto"
**Soluzione:**
```powershell
npm install -g assemblyscript
```

### "Errore di compilazione WASM"
**Soluzione:**
1. Verifica sintassi in `assembly/calculator.ts`
2. Controlla errori console
3. Esegui: `npm run build:wasm` per vedere dettagli

### "File WASM non caricato su SharePoint"
**Soluzione:**
1. Rinomina `.wasm` in `.bin`
2. Aggiorna `loader.js` con nuovo nome

---

## 📝 Note Importanti

- **NON modificare** `assembly/calculator.ts` manualmente
- Modifica sempre `src/data.js` come sorgente
- Esegui sempre il build completo dopo modifiche
- Testa localmente prima di inviare all'admin

---

## 🆘 Supporto

In caso di problemi:
1. Verifica di aver eseguito `npm install`
2. Controlla la console VS Code (Terminal)
3. Esegui `npm run build` passo per passo

---

**Ultima modifica:** $(Get-Date -Format "yyyy-MM-dd")
