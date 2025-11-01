# 🛡️ Strategia di Test Completa - Simulatore CT 3.0

## 📊 Problema Identificato

**Situazione attuale:**
- ✅ Test di unità esistenti (`verify-tests.js`) - 96 test
- ⚠️ **Limitazione**: testano solo le formule matematiche `calculate()`
- ❌ **Non testano**: UI, visibilità campi, validazione, interazioni utente

**Risultato:** Modifiche al codice UI possono rompere funzionalità senza che i test lo rilevino.

---

## 🎯 Strategia Multi-Livello

### **Livello 1: Test di Unità** ✅ (già implementato)
**File:** `tests/verify-tests.js`

**Cosa testa:**
- Formule matematiche pure (`calculate()`)
- Diversi operatori (PA, privati, residenziale)
- Zone climatiche
- Parametri tecnici

**Esecuzione:**
```bash
node tests/verify-tests.js
```

**✅ Vantaggi:**
- Veloce (< 1 secondo)
- Affidabile
- Facile debug

**❌ Limiti:**
- Non testa UI
- Non testa integrazione tra componenti
- Non rileva bug di visibilità campi, validazione, ecc.

---

### **Livello 2: Test di Integrazione** 🆕 (appena creato)
**File:** `tests/integration-tests.js`

**Cosa testa:**
- Integrazione tra `data.js` e `script.js`
- Logica `visible_if` per campi dinamici
- Funzionamento con tabelle (`righe_opache`)
- Calcolo 100% incentivo con Art. 48-ter
- Rilevamento automatico multi-intervento
- Validazione parametri mancanti

**Esecuzione:**
```bash
npm install jsdom  # Solo la prima volta
node tests/integration-tests.js
```

**✅ Vantaggi:**
- Testa interazione tra moduli
- Simula comportamento reale dell'app
- Rileva problemi di integrazione

**❌ Limiti:**
- Non testa rendering visivo effettivo
- DOM simulato (non browser reale)

---

### **Livello 3: Test E2E (End-to-End)** ⚠️ (da implementare)
**File:** `tests/e2e-playwright.js` (nuovo)

**Cosa testa:**
- Flusso utente completo in browser reale
- Click su checkbox, selezione dropdown, compilazione form
- Calcolo finale e visualizzazione risultati
- Responsività mobile
- Compatibilità cross-browser

**Esecuzione:**
```bash
npm install @playwright/test  # Solo la prima volta
npx playwright test
```

**✅ Vantaggi:**
- Simula utente reale
- Testa su browser veri (Chrome, Firefox, Safari)
- Cattura screenshot in caso di errore

**❌ Limiti:**
- Lento (~30 secondi per suite completa)
- Setup più complesso

---

### **Livello 4: Test di Regressione Visiva** 🔮 (opzionale)
**File:** `tests/visual-regression.js`

**Cosa testa:**
- Screenshot prima/dopo modifiche
- Rileva cambiamenti non intenzionali nel layout
- Verifica stili CSS

**Tool consigliati:**
- Percy.io (gratuito fino a 5000 screenshot/mese)
- BackstopJS (self-hosted)

---

## 🚀 Workflow Consigliato

### **Prima di ogni commit:**
```bash
# 1. Test di unità (veloce, sempre)
node tests/verify-tests.js

# 2. Test di integrazione (medio, sempre)
node tests/integration-tests.js
```

### **Prima di ogni deploy:**
```bash
# 3. Test completi (lento, prima del deploy)
npm test  # Esegue tutto

# 4. Test manuale spot-check
# - Apri http://localhost:8080
# - Testa i 3 scenari principali (PA, Privato, Residenziale)
# - Verifica 1-2 interventi chiave (1.A, 2.A)
```

---

## 📝 Come Aggiungere Test per Nuove Funzionalità

### **Esempio: Hai aggiunto un nuovo intervento "Fotovoltaico + Accumulo"**

#### **1. Test di Unità** (`verify-tests.js`)
```javascript
'fotovoltaico-accumulo': {
    baseParams: { 
        potenza_fv: 6,  // kWp
        capacita_accumulo: 10,  // kWh
        costo_totale: 15000
    },
    operators: ['pa', 'private_tertiary_person'],
    expectedResults: {
        'pa': { min: 3000, max: 5000 },
        'private_tertiary_person': { min: 1500, max: 3000 }
    }
}
```

#### **2. Test di Integrazione** (`integration-tests.js`)
```javascript
// Test: Verifica che i campi siano visibili solo per gli operatori giusti
console.log('📋 Test N: Fotovoltaico disponibile solo per PA e Terziario');
try {
    const intervention = window.calculatorData.interventions['fotovoltaico-accumulo'];
    
    if (!intervention.allowedOperators.includes('pa')) {
        throw new Error('PA dovrebbe poter accedere a fotovoltaico');
    }
    
    if (intervention.allowedOperators.includes('private_residential')) {
        throw new Error('Residenziale NON dovrebbe accedere a fotovoltaico');
    }
    
    console.log('✅ Restrizioni operatore corrette');
    passed++;
} catch (e) {
    console.log(`❌ FALLITO: ${e.message}`);
    failed++;
}
```

#### **3. Test E2E** (da creare)
```javascript
test('Utente PA può calcolare incentivo fotovoltaico', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Step 1: Seleziona PA
    await page.check('#subject-pa');
    
    // Step 2: Seleziona categoria edificio
    await page.selectOption('#building-category', 'E1');
    
    // Step 3: Seleziona intervento
    await page.check('input[value="fotovoltaico-accumulo"]');
    
    // Step 4: Compila form
    await page.fill('#input-fotovoltaico-accumulo-potenza_fv', '6');
    await page.fill('#input-fotovoltaico-accumulo-capacita_accumulo', '10');
    await page.fill('#input-fotovoltaico-accumulo-costo_totale', '15000');
    
    // Step 5: Calcola
    await page.click('#calculate-btn');
    
    // Step 6: Verifica risultato
    const result = await page.textContent('#result-total');
    expect(result).toContain('€');
    
    const value = parseFloat(result.replace(/[€.,]/g, ''));
    expect(value).toBeGreaterThan(3000);
    expect(value).toBeLessThan(5000);
});
```

---

## 🔧 Setup Iniziale per Test E2E

### **Installa Playwright:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### **Crea configurazione:**
```javascript
// playwright.config.js
module.exports = {
    testDir: './tests/e2e',
    use: {
        baseURL: 'http://localhost:8080',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
        { name: 'firefox', use: { browserName: 'firefox' } }
    ]
};
```

### **Crea primo test E2E:**
```bash
mkdir -p tests/e2e
```

---

## 📊 Metriche di Qualità

### **Coverage Target:**
- ✅ **Test di Unità**: 100% delle funzioni `calculate()`
- ✅ **Test di Integrazione**: Tutte le feature chiave (visible_if, multi-intervento, 100%, ecc.)
- 🎯 **Test E2E**: Top 5 scenari utente più comuni

### **Soglie di Accettazione:**
- 🟢 **Verde**: Tutti i test passano
- 🟡 **Giallo**: < 5% test falliti (può deployare con warning)
- 🔴 **Rosso**: ≥ 5% test falliti (NON deployare)

---

## 🛠️ Tool e Comandi Rapidi

### **Comandi NPM da aggiungere a `package.json`:**
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "node tests/verify-tests.js",
    "test:integration": "node tests/integration-tests.js",
    "test:e2e": "playwright test",
    "test:watch": "nodemon -x 'npm test'",
    "test:coverage": "c8 npm test"
  }
}
```

### **Pre-commit Hook (opzionale):**
```bash
# .git/hooks/pre-commit
#!/bin/sh
npm run test:unit || exit 1
```

---

## 📚 Risorse e Best Practices

### **Principi di Testing:**
1. **AAA Pattern**: Arrange, Act, Assert
2. **FIRST**: Fast, Independent, Repeatable, Self-validating, Timely
3. **Coverage ≠ Quality**: 100% coverage non garantisce 0 bug

### **Quando scrivere test:**
- ✅ **Prima** di fixare un bug (test che riproduce il bug)
- ✅ **Insieme** a nuove feature (TDD quando possibile)
- ✅ **Dopo** per documentare comportamenti complessi

### **Cosa NON testare:**
- ❌ Codice di terze parti (browser API, librerie)
- ❌ Costanti e configurazioni statiche
- ❌ Getter/setter banali

---

## 🎯 Prossimi Passi

### **Immediati:**
1. ✅ Esegui `node tests/integration-tests.js` per verificare setup
2. ✅ Aggiungi comandi NPM al `package.json`
3. ✅ Documenta eventuali test falliti

### **Breve termine (1-2 settimane):**
4. 📝 Installa Playwright e crea 3 test E2E base
5. 📝 Setup pre-commit hook per test automatici
6. 📝 Aggiungi badge status test al README

### **Lungo termine:**
7. 🔮 Visual regression testing con Percy/BackstopJS
8. 🔮 CI/CD con GitHub Actions (test automatici ad ogni push)
9. 🔮 Dashboard metriche qualità codice (SonarQube/Codecov)

---

## ❓ FAQ

**Q: I test rallentano lo sviluppo?**
A: No, i test **velocizzano** lo sviluppo nel medio-lungo termine, perché riduci tempo di debug e prevenzione bug.

**Q: Devo testare tutto al 100%?**
A: No, prioritizza test per:
   1. Logica di business critica (formule calcolo)
   2. Feature usate frequentemente (multi-intervento, 100% incentivo)
   3. Codice complesso/fragile (visible_if, validazione)

**Q: Come gestire test che falliscono?**
A: Se un test fallisce:
   1. Capire se è il test sbagliato o il codice sbagliato
   2. Fixare il codice o aggiornare il test
   3. NON ignorare o commentare test falliti

**Q: Quanto tempo dedicare ai test?**
A: Regola del 20/80:
   - 20% del tempo scrittura test
   - 80% del tempo sviluppo feature
   
   (Nel tempo il rapporto migliora perché scrivi meno bug!)

---

## 📞 Supporto

Per domande o problemi con i test:
1. Leggi questo documento
2. Controlla output dettagliato dei test
3. Cerca errori simili nella documentazione tool usati
4. Chiedi assistenza con dettagli specifici dell'errore
