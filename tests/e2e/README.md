# 🎭 Test E2E con Playwright

## 📦 Setup Iniziale

### 1. Installa Playwright
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Verifica installazione
```bash
npx playwright --version
```

## 🚀 Esecuzione Test

### Comandi Base
```bash
# Esegui tutti i test E2E
npx playwright test

# Esegui test su browser specifico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=mobile-chrome

# Esegui un singolo file di test
npx playwright test tests/e2e/example.spec.js

# Esegui con browser visibile (headed mode)
npx playwright test --headed

# Modalità debug (step-by-step)
npx playwright test --debug

# Esegui test che matchano un pattern
npx playwright test -g "PA può calcolare"
```

### Visualizzazione Risultati
```bash
# Apri report HTML dei test
npx playwright show-report tests/e2e/playwright-report

# Apri trace viewer per debug dettagliato
npx playwright show-trace tests/e2e/test-results/trace.zip
```

## 📊 Interpretazione Output

### ✅ Test Passato
```
✓ [chromium] › example.spec.js:15:5 › PA può calcolare incentivo (2.5s)
```

### ❌ Test Fallito
```
✗ [chromium] › example.spec.js:45:5 › Multi-intervento applica maggiorazione (5.2s)

  Error: expect(received).toContain(expected)
  Expected substring: "multi-intervento"
  Received string: "..."

  Screenshot: tests/e2e/test-results/multi-intervento-failure.png
  Video: tests/e2e/test-results/multi-intervento-failure.webm
```

## 🔧 Troubleshooting

### Problema: "Target closed"
**Causa:** Il server locale non è attivo o la pagina si chiude prematuramente

**Soluzione:**
```bash
# Avvia server manualmente in un altro terminale
npm run dev

# Poi esegui test
npx playwright test
```

### Problema: "Timeout waiting for locator"
**Causa:** L'elemento non appare entro il timeout (5s default)

**Soluzione:** Aumenta timeout o verifica selector
```javascript
// Aumenta timeout per questo test
test.setTimeout(60000);

// Oppure per singolo locator
await page.locator('#element').click({ timeout: 10000 });
```

### Problema: Test falliscono su CI ma passano localmente
**Causa:** Differenze ambiente (velocità, fonts, etc.)

**Soluzione:** Usa wait espliciti
```javascript
// Invece di timeout fissi
await page.waitForTimeout(1000);

// Usa wait condizionali
await page.waitForSelector('#element', { state: 'visible' });
await page.waitForLoadState('networkidle');
```

## 📝 Scrivere Nuovi Test

### Template Base
```javascript
test('Descrizione del test', async ({ page }) => {
    // 1. ARRANGE: Setup
    await page.goto('/');
    
    // 2. ACT: Azione utente
    await page.click('#button');
    await page.fill('#input', 'valore');
    
    // 3. ASSERT: Verifica risultato
    await expect(page.locator('#result')).toContainText('Atteso');
});
```

### Selettori Consigliati (ordine di priorità)
```javascript
// ✅ OTTIMO: Test ID o data-testid
await page.locator('[data-testid="submit-btn"]').click();

// ✅ BUONO: ID univoco
await page.locator('#calculate-btn').click();

// ⚠️ OK: Classe + testo
await page.locator('button:has-text("Calcola")').click();

// ❌ EVITARE: Selettori fragili
await page.locator('div > div:nth-child(2) > button').click();
```

### Best Practices
1. **Un test = una funzionalità**
2. **Test indipendenti** (non dipendono da altri test)
3. **Wait espliciti** (non timeout fissi)
4. **Assertions chiare** (messaggi comprensibili)
5. **Cleanup** (ripristina stato iniziale)

## 🎯 Copertura Test Consigliata

### Priorità ALTA
- [ ] Caricamento pagina
- [ ] Flusso PA completo (Step 1 → 2 → 3 → Calcolo)
- [ ] Flusso Privato Terziario completo
- [ ] Flusso Residenziale completo
- [ ] Multi-intervento (1.A + 2.A)
- [ ] Art. 48-ter (100% incentivo)
- [ ] Visibilità dinamica campi (1.G)

### Priorità MEDIA
- [ ] Validazione campi obbligatori
- [ ] Premio prodotti UE (+10%)
- [ ] Diagnosi energetica (+€1000)
- [ ] Biomassa 5 stelle (+20%)
- [ ] Layout responsive mobile

### Priorità BASSA
- [ ] Performance (< 3s load)
- [ ] Compatibilità cross-browser
- [ ] Accessibilità (screen reader)
- [ ] Print CSS

## 🔗 Risorse

- [Documentazione Playwright](https://playwright.dev/)
- [Selettori Playwright](https://playwright.dev/docs/selectors)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debug Guide](https://playwright.dev/docs/debug)

## 💡 Tips & Tricks

### Debug Interattivo
```bash
# Apri Playwright Inspector
npx playwright test --debug

# Pausa esecuzione in un punto specifico
await page.pause();
```

### Generazione Test Automatica
```bash
# Registra azioni utente e genera codice
npx playwright codegen http://localhost:8080
```

### Screenshot Comparazione
```javascript
// Salva screenshot baseline
await page.screenshot({ path: 'tests/screenshots/baseline.png' });

// Confronta con baseline
await expect(page).toHaveScreenshot('baseline.png');
```

### Test con Dati Multipli
```javascript
const testCases = [
    { operator: 'pa', expected: 20000 },
    { operator: 'private_tertiary_person', expected: 8000 }
];

for (const tc of testCases) {
    test(`Calcolo per ${tc.operator}`, async ({ page }) => {
        // ... test logic
        expect(result).toBe(tc.expected);
    });
}
```
