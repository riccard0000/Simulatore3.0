# Test Multi-Intervento - Guida

## Panoramica

Il file `test-multi-intervento.html` contiene test specifici per verificare il corretto funzionamento del simulatore quando vengono **combinati più interventi** nello stesso progetto.

## Funzionalità testate

### 1. Calcolo combinato
✅ Somma corretta degli incentivi di più interventi  
✅ Applicazione automatica del **bonus multi-intervento (+10%)** quando sono selezionati almeno 2 interventi  
✅ Gestione corretta delle **maggiorazioni globali** (PMI +15%, Diagnosi €1000)  
✅ Rispetto dei **tetti massimi** per tipo di operatore

### 2. Scenari di test

Il test suite include 6 scenari rappresentativi:

#### Scenario 1: PA - Isolamento + Infissi
- Operatore: Pubblica Amministrazione
- 2 interventi di efficienza energetica
- **Verifica**: bonus multi-intervento +10%

#### Scenario 2: PA - Triplo intervento
- 3 interventi: Isolamento + Infissi + LED
- **Verifica**: bonus multi-intervento su somma maggiore

#### Scenario 3: Terziario PMI - Multi + PMI
- Operatore: Soggetto privato terziario (PMI)
- 2 interventi: Isolamento + LED
- **Verifica**: bonus multi-intervento +10% E bonus PMI +15%

#### Scenario 4: Residenziale - Fonti rinnovabili
- Operatore: Privato residenziale
- 2 interventi: Pompa di calore + Solare termico
- **Verifica**: bonus multi-intervento su fonti rinnovabili

#### Scenario 5: PA - Quattro interventi + diagnosi
- 4 interventi combinati
- Premialità diagnosi energetica (+€1000)
- **Verifica**: cumulo corretto di tutti i bonus

#### Scenario 6: Singolo intervento (controllo negativo)
- Solo 1 intervento
- **Verifica**: NO bonus multi-intervento (deve essere assente)

## Come usare

### 1. Aprire il test

```bash
# Avvia il server (se non già attivo)
npm test
```

Poi nel browser: `http://127.0.0.1:8081/tests/test-multi-intervento.html`

### 2. Eseguire i test

Click su **"▶️ Esegui Test Multi-Intervento"**

### 3. Interpretare i risultati

- ✅ **PASS**: Tutti i comportamenti attesi sono corretti
- ⚠️ **PASS con avvisi**: Funziona ma con valori sotto soglia attesa
- ❌ **FAIL**: Comportamento non conforme

### 4. Dettagli mostrati

Per ogni scenario:
- **Subtotale interventi** (somma incentivi base)
- **Premialità globali applicate** (multi-intervento, PMI, diagnosi)
- **Totale finale** (con indicazione di eventuali cap)
- **Avvisi/Errori** se comportamento non conforme

## Logica di calcolo combinato

### Formula applicata

```
SUBTOTALE = Σ incentivi_singoli

PREMIALITÀ GLOBALI:
  + Multi-intervento: +10% su SUBTOTALE (se interventi >= 2)
  + PMI: +15% su SUBTOTALE (se operator = private_tertiary)
  + Diagnosi: +€1000 fissi

TOTALE = min(SUBTOTALE + PREMIALITÀ, TETTO_MASSIMO)
```

### Tetti massimi per operatore

- **PA**: €5.000.000
- **Private Tertiary**: €2.000.000
- **Private Residential**: €1.000.000

## Verifica comportamenti

Il test verifica automaticamente:

1. ✅ Numero corretto di interventi elaborati
2. ✅ Presenza/assenza del bonus multi-intervento
3. ✅ Applicazione del bonus PMI (se richiesto)
4. ✅ Applicazione del bonus diagnosi (se richiesto)
5. ⚠️ Totale sopra soglia minima attesa

## Integrazione con il simulatore

Il simulatore già supporta il calcolo di più interventi perché:

1. **`script.js`** permette di selezionare checkbox multiple
2. Gli incentivi vengono **sommati** nel ciclo `forEach`
3. Le **premialità globali** vengono applicate sul totale

### Funzione aggiunta: `calculateCombinedIncentives()`

Nuova funzione in `data.js` che:
- Calcola tutti gli interventi selezionati
- Applica automaticamente il bonus multi-intervento
- Gestisce le premialità globali (PMI, diagnosi)
- Rispetta i tetti massimi normativi

## Best Practices

### Per garantire correttezza:

1. **Testare combinazioni realistiche**
   - Verificare interventi che effettivamente si fanno insieme
   - Es: Isolamento + Infissi + Caldaia è un "pacchetto tipico"

2. **Verificare tetti massimi**
   - Combinazioni di molti interventi possono superare i limiti
   - Il simulatore deve applicare il cap correttamente

3. **Documentare le premialità**
   - Multi-intervento è automatico (>=2 interventi)
   - PMI e Diagnosi sono opzionali ma devono essere esplicitati

4. **Test edge cases**
   - 1 solo intervento (NO multi-bonus)
   - Molti interventi piccoli vs pochi grandi
   - Raggiungimento del tetto massimo

## Troubleshooting

### "Funzione calcolo combinato NON disponibile"

Verifica che `data.js` includa:
```javascript
calculatorData.calculateCombinedIncentives = function(...) { ... }
```

### "Bonus multi-intervento NON applicato"

Controlla:
1. `selectedInterventions.length >= 2`
2. La funzione applica correttamente `sumBaseIncentives * 0.10`

### "Totale sotto soglia minima"

Questo è un **warning**, non un errore. Indica che i parametri di test producono un incentivo inferiore al previsto. Verifica:
- Costi specifici troppo bassi
- Zone climatiche con coefficienti ridotti
- Superfici/potenze ridotte

## Prossimi sviluppi

- [ ] Export CSV dei risultati multi-intervento
- [ ] Test con WASM per calcolo combinato
- [ ] Validazione automatica dei tetti per categoria di intervento
- [ ] Test con tutte le 16 combinazioni possibili

## Riferimenti normativi

- **D.M. Conto Termico 3.0, Art. 11**: Maggiorazioni e premialità
- **Allegato 2**: Formule di calcolo per tipo di intervento
- **Art. 12**: Tetti massimi per tipo di soggetto beneficiario
