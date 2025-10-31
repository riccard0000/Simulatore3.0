/**
 * Test Suite per Simulatore Conto Termico 3.0
 * 
 * Test automatici per verificare la correttezza dei calcoli
 * con casi di test predefiniti e valori attesi.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Crea un contesto sandbox con window
const sandbox = { window: {}, console };
vm.createContext(sandbox);

// Carica e esegui data.js nel sandbox
const dataPath = path.join(__dirname, '../src/data.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');
vm.runInContext(dataContent, sandbox);

const calculatorData = sandbox.window.calculatorData;

if (!calculatorData) {
    console.error('❌ Impossibile caricare calculatorData');
    process.exit(1);
}

// Suite di test per ogni intervento
const testCases = [
    // ============================================
    // ISOLAMENTO TERMICO
    // ============================================
    {
        name: "Isolamento termico - PA - Zona E",
        interventionId: "isolamento-opache",
        params: {
            superficie: 100,
            costo_specifico: 200,
            zona_climatica: "E"
        },
        operatorType: "pa",
        expectedMin: 19000, // 100% × 200 × 100 = 20000, con tolleranza
        expectedMax: 21000,
        description: "PA in zona E dovrebbe ottenere 100% dell'incentivo"
    },
    {
        name: "Isolamento termico - Privato - Zona E",
        interventionId: "isolamento-opache",
        params: {
            superficie: 100,
            costo_specifico: 200,
            zona_climatica: "E"
        },
        operatorType: "private_tertiary",
        expectedMin: 9500,  // 50% × 200 × 100 = 10000
        expectedMax: 10500,
        description: "Privato terziario in zona E dovrebbe ottenere 50%"
    },
    {
        name: "Isolamento termico - Privato - Zona C",
        interventionId: "isolamento-opache",
        params: {
            superficie: 100,
            costo_specifico: 200,
            zona_climatica: "C"
        },
        operatorType: "private_tertiary",
        expectedMin: 7600,  // 40% × 200 × 100 = 8000
        expectedMax: 8400,
        description: "Privato terziario in zona C dovrebbe ottenere 40%"
    },
    
    // ============================================
    // INFISSI
    // ============================================
    {
        name: "Infissi - PA - Zona D",
        interventionId: "sostituzione-infissi",
        params: {
            superficie: 50,
            costo_specifico: 700,
            zona_climatica: "D"
        },
        operatorType: "pa",
        expectedMin: 34000, // 100% × 700 × 50 = 35000
        expectedMax: 36000,
        description: "PA dovrebbe ottenere 100% dell'incentivo per infissi"
    },
    
    // ============================================
    // POMPE DI CALORE
    // ============================================
    {
        name: "Pompa di calore - Zona E",
        interventionId: "pompa-calore",
        params: {
            energia_incentivata: 10000, // kWh/anno
            zona_climatica: "E"
        },
        operatorType: "pa",
        expectedMin: 3800,  // Coefficiente zona E circa 0.4 €/kWh
        expectedMax: 4200,
        description: "Pompa di calore in zona E con coefficiente maggiorato"
    },
    
    // ============================================
    // SOLARE TERMICO
    // ============================================
    {
        name: "Solare termico - Zona C",
        interventionId: "solare-termico",
        params: {
            superficie_apertura: 10,
            zona_climatica: "C"
        },
        operatorType: "pa",
        expectedMin: 2800,  // Circa 300-350 €/m² × 10
        expectedMax: 3500,
        description: "Solare termico 10m² in zona C"
    },
    
    // ============================================
    // EDIFICIO NZEB
    // ============================================
    {
        name: "Edificio NZEB - PA",
        interventionId: "edificio-nzeb",
        params: {
            superficie_utile: 500,
            costo_specifico: 800
        },
        operatorType: "pa",
        expectedMin: 200000, // Tetto massimo
        expectedMax: 200000,
        description: "NZEB dovrebbe raggiungere il tetto massimo"
    },
    
    // ============================================
    // BIOMASSA
    // ============================================
    {
        name: "Biomassa - 5 stelle - Zona E",
        interventionId: "generatore-biomassa",
        params: {
            energia_incentivata: 15000,
            zona_climatica: "E",
            classe_emissioni: 5,
            premiums: {
                "biomassa-5stelle": true
            }
        },
        operatorType: "pa",
        expectedMin: 6500,  // Con maggiorazione 20%
        expectedMax: 8000,
        description: "Biomassa 5 stelle con maggiorazione"
    }
];

// ============================================
// FUNZIONE DI TEST
// ============================================
function runTests() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TEST SIMULATORE CONTO TERMICO 3.0');
    console.log('═══════════════════════════════════════════════════\n');
    
    let passed = 0;
    let failed = 0;
    const failedTests = [];
    
    testCases.forEach((test, index) => {
        const intervention = calculatorData.interventions[test.interventionId];
        
        if (!intervention) {
            console.error(`❌ Test ${index + 1}: Intervento ${test.interventionId} non trovato`);
            failed++;
            return;
        }
        
        if (!intervention.calculate || typeof intervention.calculate !== 'function') {
            console.error(`❌ Test ${index + 1}: Funzione calculate non disponibile per ${test.interventionId}`);
            failed++;
            return;
        }
        
        try {
            const result = intervention.calculate(test.params, test.operatorType);
            const isInRange = result >= test.expectedMin && result <= test.expectedMax;
            
            if (isInRange) {
                console.log(`✅ Test ${index + 1}: ${test.name}`);
                console.log(`   Risultato: €${result.toFixed(2)} (atteso: €${test.expectedMin}-${test.expectedMax})`);
                console.log(`   ${test.description}\n`);
                passed++;
            } else {
                console.error(`❌ Test ${index + 1}: ${test.name}`);
                console.error(`   Risultato: €${result.toFixed(2)} (atteso: €${test.expectedMin}-${test.expectedMax})`);
                console.error(`   ${test.description}\n`);
                failed++;
                failedTests.push({
                    test: test.name,
                    expected: `€${test.expectedMin}-${test.expectedMax}`,
                    actual: `€${result.toFixed(2)}`
                });
            }
        } catch (error) {
            console.error(`❌ Test ${index + 1}: ${test.name}`);
            console.error(`   Errore: ${error.message}\n`);
            failed++;
            failedTests.push({
                test: test.name,
                expected: `€${test.expectedMin}-${test.expectedMax}`,
                actual: `ERRORE: ${error.message}`
            });
        }
    });
    
    // Riepilogo
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   RIEPILOGO TEST');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Passati: ${passed}/${testCases.length}`);
    console.log(`❌ Falliti: ${failed}/${testCases.length}`);
    
    if (failedTests.length > 0) {
        console.log('\n❌ TEST FALLITI:');
        failedTests.forEach((fail, i) => {
            console.log(`\n${i + 1}. ${fail.test}`);
            console.log(`   Atteso: ${fail.expected}`);
            console.log(`   Ottenuto: ${fail.actual}`);
        });
    }
    
    console.log('\n═══════════════════════════════════════════════════\n');
    
    // Exit code per CI/CD
    process.exit(failed > 0 ? 1 : 0);
}

// Esegui i test se chiamato direttamente
if (require.main === module) {
    runTests();
}

module.exports = { runTests, testCases };
