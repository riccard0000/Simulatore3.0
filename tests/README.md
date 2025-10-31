# Test Suite - Simulatore Conto Termico 3.0

## 📋 Tipologie di Test

### 1. **Test Manuali nella Console Browser** (CONSIGLIATO)
Il modo più semplice e affidabile per testare.

**Procedura:**
1. Apri `http://localhost:8080` (con `npm run dev`)
2. Apri DevTools (F12) → Console
3. Incolla e esegui:

```javascript
// Test singolo
const test = {
    superficie: 100,
    costo_specifico: 200,
    zona_climatica: "E"
};
const result = calculatorData.interventions['isolamento-opache'].calculate(test, 'pa');
console.log(`Risultato: €${result.toFixed(2)}`);
// Atteso: ~€20,000

// Test multipli
[
    { id: 'isolamento-opache', params: {superficie: 100, costo_specifico: 200, zona_climatica: "E"}, op: 'pa', expected: 20000 },
    { id: 'sostituzione-infissi', params: {superficie: 50, costo_specifico: 700, zona_climatica: "D"}, op: 'pa', expected: 35000 },
    { id: 'pompa-calore', params: {energia_incentivata: 10000, zona_climatica: "E"}, op: 'pa', expected: 4000 }
].forEach(t => {
    const result = calculatorData.interventions[t.id].calculate(t.params, t.op);
    const pass = Math.abs(result - t.expected) < t.expected * 0.1;
    console.log(`${pass ? '✅' : '❌'} ${t.id}: €${result.toFixed(2)} (atteso: ~€${t.expected})`);
});
```

### 2. **Test Comparazione WASM vs JavaScript**
Verifica che entrambe le implementazioni diano lo stesso risultato.

**Carica il test in pagina:**
```html
<script src="tests/compare-wasm-js.js"></script>
```

**Esegui in console:**
```javascript
runComparisonTests();
```

### 3. **Test E2E con Puppeteer** (Avanzato)
Test automatici che simulano utente reale.

**Installazione:**
```bash
npm install --save-dev puppeteer
```

**Nota:** Richiede configurazione aggiuntiva per funzionare con `file://` protocol.
Alternativa: usa Playwright o Cypress per test E2E più robusti.

## 🚀 Workflow Consigliato

### Durante lo Sviluppo

**Opzione 1: Test automatici nel browser** (CONSIGLIATO)
```bash
npm test
```
Apre automaticamente `test-runner.html` con interfaccia grafica per i test.

**Opzione 2: Test nella console**
```bash
npm run dev
```
Poi apri DevTools e usa gli snippet nel README.

### Pre-Release
1. **Test completi**: `npm test` → verifica tutti i casi
2. **Test package**: `npm run test:package` → testa lo ZIP
3. **Test manuale**: Prova tutti gli interventi nell'interfaccia
4. **Verifica console**: Nessun errore rosso in DevTools

## 📊 Checklist Pre-Deploy

- [ ] Tutti i test in `test-runner.html` passano (verde)
- [ ] Test manuali di almeno 3 interventi diversi
- [ ] Nessun errore in console del browser
- [ ] Test su PA e Privato terziario
- [ ] Test zone climatiche diverse (A, C, E)
- [ ] Test con e senza premialità
- [ ] Verifica importi contro calcoli manuali
- [ ] Test su Chrome, Firefox, Edge

## 🎯 Casi di Test Critici

### Obbligatori Prima di Ogni Release

1. **Isolamento PA Zona E** - Deve dare 100% incentivo
2. **Infissi Privato Zona D** - Deve rispettare percentuale corretta
3. **Pompa calore con coefficiente zona** - Formula complessa
4. **Multi-intervento con maggiorazione** - Somma e premialità
5. **Biomassa 5 stelle** - Maggiorazione 20%
6. **Tetti massimi** - Verifica cap non superati

### Test Regressione

Se modifichi una formula, testa:
- ✅ Intervento modificato
- ✅ Almeno 2 interventi non modificati
- ✅ Multi-intervento che include l'intervento modificato

## 📊 Aggiungere Nuovi Test

### Test Unitario
Modifica `tests/test-calculator.js`:

```javascript
{
    name: "Il tuo test",
    interventionId: "id-intervento",
    params: {
        // parametri
    },
    operatorType: "pa",
    expectedMin: 1000,
    expectedMax: 1500,
    description: "Descrizione"
}
```

### Test E2E
Modifica `tests/e2e-test.js`:

```javascript
{
    name: "Il tuo test E2E",
    steps: [
        { action: 'select', selector: '#operator-type', value: 'pa' },
        { action: 'click', selector: 'input[value="intervento"]' },
        { action: 'type', selector: 'input[name="campo"]', value: '100' },
        { action: 'click', selector: '#calculate-btn' }
    ],
    expectedMin: 1000,
    expectedMax: 1500
}
```

## 🔍 Test Coverage

### Interventi Testati
- ✅ Isolamento termico
- ✅ Sostituzione infissi
- ✅ Pompe di calore
- ✅ Solare termico
- ✅ Edificio NZEB
- ✅ Biomassa
- ⚠️  Altri da aggiungere

### Casi d'Uso Testati
- ✅ PA (100% incentivo)
- ✅ Privato terziario (25-50%)
- ✅ Zone climatiche diverse
- ✅ Maggiorazioni (biomassa 5 stelle)
- ⚠️  Multi-intervento da testare
- ⚠️  Premialità UE da testare

## 🐛 Debugging Test Falliti

### Test Unitario Fallisce
1. Verifica formule in `src/data.js`
2. Controlla parametri in `tests/test-calculator.js`
3. Esegui calcolo manuale per confronto

### Test E2E Fallisce
1. Esegui con `headless: false` per vedere browser
2. Aggiungi screenshot: `await page.screenshot({path: 'debug.png'})`
3. Verifica selettori DOM
4. Controlla console browser: `page.on('console', msg => console.log(msg.text()))`

## 📈 Metriche di Successo

### Target
- ✅ Test unitari: 100% passati
- ✅ Test E2E: 100% passati
- ⏱️ Tempo esecuzione: < 10 secondi totali
- 📊 Coverage: > 90% delle formule

## 🔄 Integrazione Continua

### GitHub Actions (esempio)
```yaml
name: Test Simulatore
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

## 📝 Note

- I test unitari non testano WASM (solo JavaScript)
- I test E2E testano l'implementazione finale (WASM o JS)
- Aggiungi più casi d'uso man mano che emergono bug
- Mantieni sempre i test aggiornati con le formule
