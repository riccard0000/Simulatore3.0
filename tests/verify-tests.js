/**
 * Script di verifica automatica dei test
 * Esegue test diretti sulle funzioni di calcolo per validare i parametri
 */

const fs = require('fs');
const path = require('path');

// Carica data.js
const dataPath = path.join(__dirname, '..', 'src', 'data.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Estrae calculatorData (simulazione ambiente browser)
const calculatorData = eval(`
    const window = {};
    ${dataContent}
    calculatorData;
`);

// Configurazioni test da test-runner.html
const testConfigs = {
    'isolamento-opache': {
        // Modello aggiornato: tabella righe_opache con tipologia, superficie e costo_totale per riga
        baseParams: { 
            righe_opache: [
                { tipologia_struttura: 'parete_esterno', superficie: 100, costo_totale: 20000 }
            ],
            zona_climatica: 'C'
        },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
        zones: ['A', 'C', 'E', 'F']
    },
    'sostituzione-infissi': {
        baseParams: { superficie: 50, costo_specifico: 600, zona_climatica: 'C' },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large'],
        zones: ['A', 'D', 'F']
    },
    'schermature-solari': {
        baseParams: { superficie: 30, costo_specifico: 150 },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large']
    },
    'nzeb': {
        baseParams: { superficie: 500, costo_specifico: 800, zona_climatica: 'C' },
        operators: ['pa']
    },
    'illuminazione-led': {
        baseParams: { superficie: 500, costo_specifico: 30, tipo_lampada: 'LED' },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large']
    },
    'infrastrutture-ricarica': {
        baseParams: { tipo_infrastruttura: 'Standard monofase (7.4-22kW)', numero_punti: 2, costo_totale: 4000 },
        operators: ['pa', 'private_tertiary_person']
    },
    'pompa-calore': {
        baseParams: { 
            tipo_pompa: 'aria/acqua (≤35kW)', 
            potenza_nominale: 20, 
            scop: 4.5, 
            scop_minimo: 4.0,
            zona_climatica: 'C'
        },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential'],
        zones: ['C', 'E', 'F']
    },
    'sistemi-ibridi': {
        baseParams: { 
            tipo_sistema: 'PDC aria/acqua + caldaia condensazione',
            potenza_pdc: 15,
            potenza_caldaia: 25,
            scop: 4.2,
            scop_minimo: 3.8,
            eta_caldaia: 0.94,
            zona_climatica: 'C'
        },
        operators: ['pa', 'private_tertiary_person', 'private_residential'],
        zones: ['C', 'E']
    },
    'biomassa': {
        baseParams: { 
            tipo_generatore: 'Caldaia a biomassa',
            potenza_nominale: 30,
            riduzione_emissioni: 'Dal 20% al 50%',
            centrale_teleriscaldamento: 'No',
            zona_climatica: 'D'
        },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential'],
        zones: ['D', 'E', 'F']
    },
    'solare-termico': {
        baseParams: { 
            superficie_lorda: 10,
            tipo_impianto: 'Produzione ACS',
            tipo_collettore: 'Piani vetrati'
        },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential']
    },
    'scaldacqua-pdc': {
        baseParams: { 
            capacita: 200, 
            classe_energetica: 'Classe A+',
            costo_totale: 2000 
        },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential']
    },
    'teleriscaldamento': {
        baseParams: { 
            potenza_contrattuale: 30,
            costo_totale: 5000 
        },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential']
    },
    'microcogenerazione': {
        baseParams: { 
            potenza_elettrica: 50, 
            costo_totale: 80000 
        },
        operators: ['pa', 'private_tertiary_person', 'private_tertiary_sme', 'private_tertiary_large', 'private_residential']
    }
};

console.log('🔍 VERIFICA AUTOMATICA DEI TEST\n');
console.log('='.repeat(80));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors = [];

// Testa ogni intervento
for (const [intId, config] of Object.entries(testConfigs)) {
    const intervention = calculatorData.interventions[intId];
    
    console.log(`\n📋 ${intervention?.name || intId}`);
    console.log('-'.repeat(80));
    
    if (!intervention) {
        console.log(`❌ ERRORE: Intervento '${intId}' non trovato in data.js`);
        errors.push({ intervention: intId, error: 'Intervento non trovato' });
        failedTests++;
        totalTests++;
        continue;
    }
    
    if (!intervention.calculate) {
        console.log(`❌ ERRORE: Funzione calculate() mancante`);
        errors.push({ intervention: intId, error: 'calculate() mancante' });
        failedTests++;
        totalTests++;
        continue;
    }
    
    // Testa ogni operatore
    for (const operator of config.operators) {
        const zones = config.zones || [null];
        
        for (const zone of zones) {
            totalTests++;
            
            const params = { ...config.baseParams };
            if (zone) params.zona_climatica = zone;
            params.premiums = {};
            
            try {
                const result = intervention.calculate(params, operator);
                
                const testName = `${operator.toUpperCase()}${zone ? ' | Zona ' + zone : ''}`;
                
                // Formatta i parametri per visualizzazione
                const paramsDisplay = Object.entries(params)
                    .filter(([key]) => key !== 'premiums')
                    .map(([key, val]) => `${key}=${val}`)
                    .join(', ');
                
                if (result > 0) {
                    console.log(`✅ ${testName}: €${result.toFixed(2)}`);
                    console.log(`   📊 Parametri: ${paramsDisplay}`);
                    passedTests++;
                } else {
                    console.log(`❌ ${testName}: €${result.toFixed(2)} (INVALIDO - deve essere > 0)`);
                    console.log(`   📊 Parametri: ${paramsDisplay}`);
                    failedTests++;
                    errors.push({
                        intervention: intId,
                        test: testName,
                        error: 'Risultato <= 0',
                        params: paramsDisplay,
                        result
                    });
                }
            } catch (error) {
                console.log(`❌ ${operator.toUpperCase()}: ERRORE - ${error.message}`);
                const paramsDisplay = Object.entries(params)
                    .filter(([key]) => key !== 'premiums')
                    .map(([key, val]) => `${key}=${val}`)
                    .join(', ');
                console.log(`   📊 Parametri: ${paramsDisplay}`);
                failedTests++;
                errors.push({
                    intervention: intId,
                    test: operator,
                    error: error.message,
                    params: paramsDisplay
                });
            }
        }
    }
}

// Riepilogo finale
// Test combinato: verifica applicazione premi multi-intervento + PMI
try {
    console.log('\n' + '='.repeat(80));
    console.log('🔗 TEST COMBINATO PREMI (Multi-intervento + PMI)');
    console.log('='.repeat(80));
    totalTests++;
    const selectedInterventions = ['isolamento-opache', 'pompa-calore'];
    const inputsByIntervention = {
        'isolamento-opache': { 
            righe_opache: [ { tipologia_struttura: 'parete_esterno', superficie: 200, costo_totale: 50000 } ],
            zona_climatica: 'E' 
        },
        'pompa-calore': { tipo_pompa: 'aria/acqua (≤35kW)', potenza_nominale: 20, scop: 4.5, scop_minimo: 4.0, zona_climatica: 'E' }
    };
    const operatorType = 'private_tertiary_sme';
    const globalPremiums = ['pmi'];
    const combo = calculatorData.calculateCombinedIncentives(selectedInterventions, inputsByIntervention, operatorType, globalPremiums);
    const okMulti = combo.appliedGlobalPremiums.some(p => p.id === 'multi-intervento');
    const okPMI = combo.appliedGlobalPremiums.some(p => p.id === 'pmi');
    if (okMulti && okPMI && combo.total > combo.subtotal) {
        console.log(`✅ Premi combinati applicati: totale=€${combo.total.toFixed(2)} (subtotal=€${combo.subtotal.toFixed(2)})`);
        passedTests++;
    } else {
        console.log('❌ Premi combinati non applicati correttamente');
        failedTests++;
        errors.push({
            intervention: 'combined',
            test: 'multi-intervento + pmi',
            error: 'Premi non applicati o totale non maggiore del subtotale'
        });
    }
} catch (e) {
    console.log(`❌ Errore test combinato: ${e.message}`);
    totalTests++;
    failedTests++;
    errors.push({ intervention: 'combined', test: 'multi-intervento + pmi', error: e.message });
}

console.log('\n' + '='.repeat(80));
console.log('📊 RIEPILOGO');
console.log('='.repeat(80));
console.log(`✅ Passati: ${passedTests}/${totalTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
console.log(`❌ Falliti: ${failedTests}/${totalTests}`);

if (errors.length > 0) {
    console.log('\n🔴 ERRORI DETTAGLIATI:');
    console.log('='.repeat(80));
    errors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.intervention}${err.test ? ' - ' + err.test : ''}`);
        console.log(`   Errore: ${err.error}`);
        if (err.params) console.log(`   Parametri: ${err.params}`);
        if (err.result !== undefined) console.log(`   Risultato: ${err.result}`);
    });
}

console.log('\n' + '='.repeat(80));
console.log(passedTests === totalTests ? '🎉 TUTTI I TEST PASSATI!' : '⚠️  CI SONO ERRORI DA CORREGGERE');
console.log('='.repeat(80));

// Exit code
process.exit(failedTests > 0 ? 1 : 0);
