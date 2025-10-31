# 🧪 GUIDA RAPIDA AI TEST

## ▶️  Avvio Rapido

```bash
npm test
```

Questo comando:
1. Avvia un server locale
2. Apre automaticamente `test-runner.html` nel browser
3. Mostra un'interfaccia grafica con i test

## 🎯 Come Usare l'Interfaccia di Test

1. **Esegui Tutti i Test**: Clicca il pulsante per verificare tutti i calcoli
2. **Controlla i Risultati**: 
   - ✅ Verde = Test passato
   - ❌ Rosso = Test fallito
3. **Confronta WASM vs JS**: Verifica che entrambe le implementazioni diano lo stesso risultato

## 📋 Test Manuali Rapidi

Apri la console del browser (F12) e copia-incolla:

```javascript
// Test veloce
const test = (id, params, op, expected) => {
    const result = calculatorData.interventions[id].calculate(params, op);
    const ok = Math.abs(result - expected) < expected * 0.1;
    console.log(`${ok ? '✅' : '❌'} ${id}: €${result.toFixed(2)} (atteso: ~€${expected})`);
};

// Esempi
test('isolamento-opache', {superficie: 100, costo_specifico: 200, zona_climatica: "E"}, 'pa', 20000);
test('pompa-calore', {energia_incentivata: 10000, zona_climatica: "E"}, 'pa', 4000);
```

## 🔍 Cosa Testare

### Test Essenziali (fai sempre prima di committare)
1. Isolamento termico - PA - Zona E → ~€20,000
2. Infissi - PA - Zona D → ~€35,000
3. Pompa di calore - Zona E → ~€4,000

### Test Completi (prima di release)
- Tutti i 16 interventi
- 3 tipi di operatore (PA, Privato terziario, Privato residenziale)
- Zone climatiche diverse
- Con e senza premialità

## 🚨 Se un Test Fallisce

1. **Verifica i parametri**: I valori di input sono corretti?
2. **Controlla la formula**: Rivedi `src/data.js` per l'intervento
3. **Calcolo manuale**: Fai il calcolo a mano per confronto
4. **Console**: Guarda eventuali errori nella console
5. **Aggiorna il test**: Se la formula è corretta, aggiorna i valori attesi

## 📊 Interpretazione Risultati

### Tutti Verde ✅
Ottimo! Il simulatore funziona correttamente.

### Alcuni Rossi ❌
- Verifica i falliti uno per uno
- Controlla se è un problema di formula o di test
- Confronta con calcoli manuali

### Tutti Rossi ❌
- Verifica che `calculatorData` sia caricato
- Controlla errori JavaScript in console
- Assicurati di aver aperto con `npm test` (non file:// diretto)

## 💡 Tips

- **Test frequenti**: Esegui i test dopo ogni modifica importante
- **Console sempre aperta**: Molte info utili nei log
- **Confronta versioni**: Testa sia `npm run dev` (sviluppo) che `npm run test:package` (produzione)
- **Screenshot**: Se trovi un bug, fai screenshot di test fallito + console

## 🛠️  Troubleshooting

### "calculatorData non definito"
→ Assicurati di usare `npm test` invece di aprire HTML direttamente

### "WASM non caricato"
→ Normale se non hai compilato WASM. Il fallback JavaScript dovrebbe funzionare.

### "Test sempre fallisce ma il calcolo sembra giusto"
→ Aggiorna i valori `expectedMin` e `expectedMax` nel test

## 📚 File di Test

- `test-runner.html` - Interfaccia grafica per test (USA QUESTO)
- `test-calculator.js` - Test unitari Node.js (WIP)
- `e2e-test.js` - Test E2E Puppeteer (Avanzato)
- `compare-wasm-js.js` - Confronto WASM vs JavaScript
- `README.md` - Documentazione completa

---

**Domande?** Controlla `tests/README.md` per la documentazione completa.
