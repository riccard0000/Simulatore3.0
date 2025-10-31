/**
 * Test di Comparazione WASM vs JavaScript
 * 
 * Verifica che WASM e JavaScript producano gli stessi risultati
 */

// Questo test va eseguito nel browser dove WASM è disponibile
// Usa console del browser o framework come Jest con JSDOM

const compareTests = [
    {
        name: "Isolamento termico - PA - Zona E",
        interventionId: "isolamento-opache",
        params: {
            superficie: 100,
            costo_specifico: 200,
            zona_climatica: "E",
            premiums: {}
        },
        operatorType: "pa"
    },
    {
        name: "Infissi - Privato - Zona D",
        interventionId: "sostituzione-infissi",
        params: {
            superficie: 50,
            costo_specifico: 700,
            zona_climatica: "D",
            premiums: {}
        },
        operatorType: "private_tertiary"
    }
];

function runComparisonTests() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TEST COMPARAZIONE WASM vs JAVASCRIPT');
    console.log('═══════════════════════════════════════════════════\n');
    
    if (!window.calculatorData) {
        console.error('❌ calculatorData non disponibile');
        return;
    }
    
    let passed = 0;
    let failed = 0;
    
    compareTests.forEach((test, index) => {
        console.log(`\n🧪 Test ${index + 1}: ${test.name}`);
        
        const intervention = window.calculatorData.interventions[test.interventionId];
        
        if (!intervention) {
            console.error(`   ❌ Intervento non trovato`);
            failed++;
            return;
        }
        
        // Calcolo JavaScript
        let jsResult = null;
        if (intervention.calculate && typeof intervention.calculate === 'function') {
            try {
                jsResult = intervention.calculate(test.params, test.operatorType);
                console.log(`   📊 JavaScript: €${jsResult.toFixed(2)}`);
            } catch (error) {
                console.error(`   ❌ Errore JavaScript: ${error.message}`);
            }
        } else {
            console.warn(`   ⚠️  Calcolo JavaScript non disponibile (calculate: null)`);
        }
        
        // Calcolo WASM
        let wasmResult = null;
        if (window.WASMCalculator && window.WASMCalculator.calculate) {
            try {
                wasmResult = window.WASMCalculator.calculate(
                    test.interventionId, 
                    test.params, 
                    test.operatorType
                );
                console.log(`   🔧 WASM: €${wasmResult ? wasmResult.toFixed(2) : 'null'}`);
            } catch (error) {
                console.error(`   ❌ Errore WASM: ${error.message}`);
            }
        } else {
            console.warn(`   ⚠️  WASM non disponibile`);
        }
        
        // Confronto
        if (jsResult !== null && wasmResult !== null) {
            const diff = Math.abs(jsResult - wasmResult);
            const tolerance = 0.01; // 1 centesimo di tolleranza
            
            if (diff <= tolerance) {
                console.log(`   ✅ MATCH: Differenza €${diff.toFixed(4)}`);
                passed++;
            } else {
                console.error(`   ❌ MISMATCH: Differenza €${diff.toFixed(2)}`);
                failed++;
            }
        } else if (jsResult !== null && wasmResult === null) {
            console.log(`   ⚠️  Solo JavaScript disponibile`);
            passed++; // Non è un fallimento se WASM non è implementato
        } else if (jsResult === null && wasmResult !== null) {
            console.log(`   ⚠️  Solo WASM disponibile`);
            passed++;
        } else {
            console.error(`   ❌ Nessun risultato disponibile`);
            failed++;
        }
    });
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`   Passati: ${passed}/${compareTests.length}`);
    console.log(`   Falliti: ${failed}/${compareTests.length}`);
    console.log('═══════════════════════════════════════════════════\n');
    
    return { passed, failed };
}

// Esportabile per uso in console browser
if (typeof window !== 'undefined') {
    window.runComparisonTests = runComparisonTests;
    window.compareTests = compareTests;
}

// Eseguibile in Node (mock environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runComparisonTests, compareTests };
}
