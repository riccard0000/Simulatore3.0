# 🔍 Guida alla Validazione dei Test

## Problemi Risolti

### 1. ID Interventi Errati
**Problema**: Gli ID nel test non corrispondevano a quelli in `data.js`

**Correzioni effettuate**:
- ❌ `edificio-nzeb` → ✅ `nzeb`
- ❌ `pompa-calore-elettrica` → ✅ **RIMOSSO** (non esiste in data.js)
- ❌ `sistema-ibrido` → ✅ `sistemi-ibridi`
- ❌ `generatore-biomassa` → ✅ `biomassa`

### 2. Parametri Mancanti o Errati

#### illuminazione-led
**Era**: `{ potenza_installata: 50, costo_specifico: 200 }`  
**Ora**: `{ superficie: 500, costo_specifico: 30, tipo_lampada: 'LED' }`  
**Motivo**: L'intervento richiede superficie e tipo_lampada, non potenza_installata

#### pompa-calore
**Era**: `{ energia_incentivata: 10000 }`  
**Ora**: 
```javascript
{ 
    tipo_pompa: 'aria/acqua (≤35kW)', 
    potenza_nominale: 20, 
    scop: 4.5, 
    scop_minimo: 4.0 
}
```
**Motivo**: La formula richiede SCOP, potenza e tipo per calcolare l'incentivo

#### sistemi-ibridi
**Era**: `{ energia_incentivata: 12000 }`  
**Ora**: 
```javascript
{ 
    tipo_sistema: 'PDC aria/acqua + caldaia condensazione',
    potenza_pdc: 15,
    potenza_caldaia: 25,
    scop: 4.2,
    scop_minimo: 3.8,
    eta_caldaia: 0.94
}
```

#### biomassa
**Era**: `{ energia_incentivata: 15000, classe_emissioni: 3 }`  
**Ora**: `{ potenza_nominale: 30, classe_emissioni: 3 }`  
**Motivo**: La formula usa potenza_nominale, non energia_incentivata

#### solare-termico
**Era**: `{ superficie_apertura: 10 }` (+ zona climatica)  
**Ora**: 
```javascript
{ 
    superficie_lorda: 10,
    tipo_impianto: 'Produzione ACS',
    tipo_collettore: 'Piani vetrati'
}
```
**Motivo**: Rimossa zona climatica (non usata), aggiunti parametri richiesti

#### scaldacqua-pdc
**Era**: `{ capacita_accumulo: 200, costo_totale: 2000 }`  
**Ora**: 
```javascript
{ 
    capacita: 200,  // Era capacita_accumulo
    classe_energetica: 'Classe A+',
    costo_totale: 2000 
}
```

#### teleriscaldamento
**Era**: `{ potenza_termica: 100, costo_totale: 50000 }`  
**Ora**: `{ potenza_contrattuale: 30, costo_totale: 5000 }`  
**Motivo**: Nome parametro corretto + valori più realistici

---

## 🎯 Come Verificare la Correttezza dei Test

### Metodo 1: Controllo Visivo
1. Esegui `npm test`
2. Clicca "▶️ Esegui Tutti i Test"
3. Verifica che:
   - ✅ Non ci siano più "Intervento non trovato"
   - ✅ Nessun test dia "€0.00 (invalido)"
   - ✅ Tutti i test ritornino un valore > 0

### Metodo 2: Test Manuale sul Simulatore
Per ogni intervento che fallisce:

1. Apri `http://127.0.0.1:8080/src/index.html` (run `npm run dev`)
2. Seleziona l'intervento nel form
3. Inserisci ESATTAMENTE gli stessi parametri del test
4. Clicca "Calcola Incentivo"
5. Confronta il risultato con quello del test

**Esempio per illuminazione-led**:
```javascript
// Nel test:
baseParams: { superficie: 500, costo_specifico: 30, tipo_lampada: 'LED' }

// Nel simulatore:
- Superficie edificio Sed (m²): 500
- Costo specifico C (€/m²): 30
- Tipo di lampada: LED
- Operatore: PA

Risultato atteso: > €0 (es. €17,500)
```

### Metodo 3: Console del Browser
1. Apri DevTools (F12) → Console
2. Esegui i test
3. Controlla i messaggi di log:
```
📊 Generati 59 test automatici  // Dovrebbe essere ~55-60 (non più 72)
Calculating for: illuminazione-led
Parameters: {superficie: 500, costo_specifico: 30, tipo_lampada: "LED", ...}
Result: 17500
```

### Metodo 4: Test Specifico in Console
```javascript
// Nella console del browser (su test-runner.html):
const testData = window.calculatorData;
const intervention = testData.interventions['illuminazione-led'];

// Test manuale
const result = intervention.calculate({
    superficie: 500,
    costo_specifico: 30,
    tipo_lampada: 'LED',
    premiums: {}
}, 'pa');

console.log('Risultato:', result); // Deve essere > 0
```

---

## 📊 Risultati Attesi (dopo correzioni)

### Tutti i test DEVONO:
- ✅ Restituire un valore > €0
- ✅ Mostrare il soggetto operatore corretto (PA / PRIVATE_TERTIARY / PRIVATE_RESIDENTIAL)
- ✅ Applicare correttamente le maggiorazioni (+UE, +5⭐)
- ✅ Rispettare i tetti massimi

### Interventi completamente funzionanti:
1. ✅ **isolamento-opache** (16 test) - 100% pass
2. ✅ **sostituzione-infissi** (12 test) - 100% pass
3. ✅ **schermature-solari** (4 test) - 100% pass
4. ✅ **nzeb** (2 test)
5. ✅ **illuminazione-led** (4 test) - CORRETTO
6. ✅ **microcogenerazione** (1 test) - 100% pass

### Interventi da verificare:
- ⚠️ **pompa-calore** (6 test) - Parametri complessi
- ⚠️ **sistemi-ibridi** (2 test) - Parametri complessi
- ⚠️ **biomassa** (6 test) - Parametri complessi
- ⚠️ **solare-termico** (2 test) - Parametri semplificati
- ⚠️ **scaldacqua-pdc** (2 test)
- ⚠️ **teleriscaldamento** (1 test)

**Totale test**: ~56 (ridotti da 72 perché rimosso l'intervento inesistente)

---

## 🔧 Debugging: Se un Test Fallisce

### 1. Verifica i Parametri Richiesti
```bash
# Apri data.js e cerca l'intervento:
code src/data.js

# Cerca: 'nome-intervento': {
# Guarda la sezione: inputs: [ ... ]
# Verifica che calculate() usi quegli esatti nomi di parametri
```

### 2. Controlla la Funzione calculate()
```javascript
// In data.js, per ogni intervento:
calculate: (params, operatorType) => {
    const { param1, param2, ... } = params;  // ← Questi sono i nomi richiesti!
    if (!param1 || !param2) return 0;  // ← Se mancano, ritorna 0
    ...
}
```

### 3. Confronta Test vs. Implementazione
```javascript
// test-runner.html
baseParams: { nome_parametro: valore }

// data.js
inputs: [ { id: 'nome_parametro', ... } ]
```

**DEVONO CORRISPONDERE ESATTAMENTE!**

---

## ✅ Checklist di Validazione

Dopo ogni modifica ai test:

- [x] Tutti i test generano un risultato > €0 ✅ **100% (41/41)**
- [x] Nessun messaggio "Intervento non trovato" ✅ **0 errori**
- [x] Nessun messaggio "€0.00 (invalido)" ✅ **0 errori**
- [ ] I test per PA danno importi più alti (100% vs 40-65%)
- [ ] Le maggiorazioni funzionano (+10% UE, +20% biomassa 5⭐)
- [ ] I test manuali sul simulatore danno gli stessi risultati
- [ ] La console non mostra errori JavaScript

### 🎉 Verifica Automatica Completata

**Comando**: `npm run verify`

**Risultati**:
```
✅ Passati: 41/41 (100.0%)
❌ Falliti: 0/41
```

**Interventi testati**:
1. ✅ isolamento-opache (8 test) - 100%
2. ✅ sostituzione-infissi (6 test) - 100%
3. ✅ schermature-solari (2 test) - 100%
4. ✅ nzeb (1 test) - 100% **[CORRETTO]**
5. ✅ illuminazione-led (2 test) - 100%
6. ✅ pompa-calore (6 test) - 100%
7. ✅ sistemi-ibridi (4 test) - 100%
8. ✅ biomassa (6 test) - 100% **[CORRETTO]**
9. ✅ solare-termico (2 test) - 100%
10. ✅ scaldacqua-pdc (2 test) - 100%
11. ✅ teleriscaldamento (1 test) - 100%
12. ✅ microcogenerazione (1 test) - 100%

---

## 🚀 Prossimi Passi

1. **Esegui**: `npm test`
2. **Verifica**: Tutti i test passano
3. **Se falliscono**: Usa questa guida per il debug
4. **Documenta**: Aggiungi note sui valori attesi per intervento

---

## 📝 Note Tecniche

### Differenza tra test automatici e manuali
- **Test automatici**: Verificano solo che `result > 0`
- **Test manuali**: Confrontano con valori attesi specifici

Per test più robusti, considera di aggiungere `expectedValue` in ogni test caso:
```javascript
{
    name: 'isolamento-opache PA Zona A',
    expectedValue: 20000,  // Valore esatto atteso
    tolerance: 0.01  // Tolleranza 1%
}
```

### Formula generale di verifica
```javascript
function verifyTest(result, expected, tolerance = 0.01) {
    const diff = Math.abs(result - expected) / expected;
    return diff <= tolerance;
}
```
