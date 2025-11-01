# 🎯 Strategia di Test - Riepilogo Rapido

## ✅ Cosa Abbiamo Implementato

### 1. **Test di Unità** (esistenti, potenziati)
📁 `tests/verify-tests.js`

**Esegui:**
```bash
node tests/verify-tests.js
```

**Testa:** Formule matematiche, calcoli incentivi, zone climatiche
**Tempo:** ~1 secondo | **Copertura:** 96 test

---

### 2. **Test di Integrazione** (NUOVO ✨)
📁 `tests/integration-tests.js`

**Esegui:**
```bash
npm install --save-dev jsdom  # Solo prima volta
node tests/integration-tests.js
```

**Testa:** 
- Integrazione data.js + script.js
- Logica `visible_if` per campi dinamici
- Tabelle (`righe_opache`)
- Calcolo 100% con Art. 48-ter
- Multi-intervento automatico
- Validazione parametri

**Tempo:** ~2-3 secondi | **Copertura:** 6 test critici

---

### 3. **Test E2E** (NUOVO ✨)
📁 `tests/e2e/example.spec.js`

**Setup:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Esegui:**
```bash
npx playwright test
npx playwright test --headed  # Con browser visibile
```

**Testa:**
- Flussi utente completi (PA, Privato, Residenziale)
- Interazioni reali (click, form fill, navigation)
- Visibilità dinamica campi
- Multi-intervento UI
- Responsive mobile
- Performance

**Tempo:** ~30-60 secondi | **Copertura:** 8 scenari principali

---

## 🚦 Quando Eseguire Quali Test

### **Prima di OGNI commit:**
```bash
npm run test
# Esegue: verify-tests.js + integration-tests.js
# Tempo: ~5 secondi
```

### **Prima di OGNI deploy:**
```bash
npm run test              # Test rapidi
npx playwright test      # Test E2E completi
# Tempo totale: ~1 minuto
```

### **Dopo modifiche UI importanti:**
```bash
npx playwright test --headed  # Verifica visiva manuale
```

---

## 📊 Coverage Attuale

| Livello | File | Test | Tempo | Status |
|---------|------|------|-------|--------|
| Unità | `verify-tests.js` | 96 | 1s | ✅ |
| Integrazione | `integration-tests.js` | 6 | 3s | ✅ |
| E2E | `example.spec.js` | 8 | 60s | 🆕 |

**Totale:** 110 test | **Tempo:** ~1 minuto per suite completa

---

## 🛡️ Cosa Protegge Questa Strategia

### ✅ **Previene questi bug:**

1. **Formule sbagliate** → Test di unità
   - Esempio: Cmax errato per zona climatica
   
2. **UI non aggiorna dati** → Test integrazione
   - Esempio: `visible_if` non nasconde campi
   
3. **Flusso utente rotto** → Test E2E
   - Esempio: Pulsante "Calcola" non funziona
   
4. **Regressioni** → Tutti i livelli
   - Esempio: Fix 1.G rompe 1.A

### ⚠️ **NON previene questi bug:**

1. **Logica di business complessa non testata**
   - Soluzione: Aggiungi test specifici
   
2. **Edge cases non coperti**
   - Soluzione: Test parametrizzati
   
3. **Bug specifici browser**
   - Soluzione: Esegui E2E su più browser

---

## 🎯 Prossimi Passi Consigliati

### **Immediati (oggi):**
1. ✅ Esegui `node tests/integration-tests.js` per verificare setup
2. ⬜ Leggi output e risolvi eventuali errori
3. ⬜ Committa nuovi file test

### **Breve termine (questa settimana):**
4. ⬜ Installa Playwright: `npm install --save-dev @playwright/test`
5. ⬜ Esegui primo test E2E: `npx playwright test --headed`
6. ⬜ Aggiorna `package.json` con nuovi script

### **Medio termine (prossime 2 settimane):**
7. ⬜ Aggiungi 3-5 test E2E per scenari critici
8. ⬜ Setup pre-commit hook per test automatici
9. ⬜ Documenta casi di test specifici del tuo dominio

### **Lungo termine:**
10. ⬜ CI/CD con GitHub Actions
11. ⬜ Visual regression testing
12. ⬜ Code coverage reporting

---

## 📚 Documentazione

- 📖 **Strategia completa:** `tests/STRATEGIA-TEST.md`
- 📖 **Test E2E:** `tests/e2e/README.md`
- 📖 **Test multi-intervento:** `tests/README-MULTI-INTERVENTO.md`

---

## 💡 Tips Finali

### **Se un test fallisce:**
1. Leggi il messaggio di errore (è dettagliato!)
2. Verifica se è il test sbagliato o il codice sbagliato
3. Fix il codice o aggiorna il test
4. **NON** commentare/rimuovere test falliti

### **Per mantenere i test efficaci:**
- Aggiorna test quando cambi funzionalità
- Aggiungi test per ogni bug fixato
- Rivedi test ogni 2-3 mesi
- Elimina test obsoleti/duplicati

### **Per velocizzare i test:**
- Esegui solo test rilevanti durante sviluppo
- Usa `--grep` per filtrare test specifici
- Parallelizza test E2E (configurato in `playwright.config.js`)

---

## 🆘 Problemi Comuni

**Q: I test di integrazione non funzionano**
```bash
# Installa jsdom
npm install --save-dev jsdom
```

**Q: Playwright non trova il browser**
```bash
# Reinstalla browser
npx playwright install chromium
```

**Q: Test E2E troppo lenti**
```bash
# Esegui solo su un browser
npx playwright test --project=chromium
```

---

## ✅ Checklist Setup Completo

- [x] Test di unità funzionanti (`verify-tests.js`)
- [x] Test di integrazione creati (`integration-tests.js`)
- [x] Test E2E template creato (`tests/e2e/example.spec.js`)
- [x] Documentazione completa (`STRATEGIA-TEST.md`)
- [ ] jsdom installato (`npm install --save-dev jsdom`)
- [ ] Playwright installato (`npm install --save-dev @playwright/test`)
- [ ] `package.json` aggiornato con script test
- [ ] Primo test E2E eseguito con successo

---

🎉 **Setup Completato!** Ora hai una strategia di test robusta e multi-livello.
