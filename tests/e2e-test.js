/**
 * Test E2E con Puppeteer
 * Testa il simulatore nel browser reale
 */

const puppeteer = require('puppeteer');
const path = require('path');

const TEST_CASES = [
    {
        name: "Isolamento termico - PA - Zona E",
        steps: [
            { action: 'select', selector: '#operator-type', value: 'pa' },
            { action: 'click', selector: 'input[value="isolamento-opache"]' },
            { action: 'type', selector: 'input[name="superficie"]', value: '100' },
            { action: 'type', selector: 'input[name="costo_specifico"]', value: '200' },
            { action: 'select', selector: 'select[name="zona_climatica"]', value: 'E' },
            { action: 'click', selector: '#calculate-btn' }
        ],
        expectedMin: 19000,
        expectedMax: 21000
    },
    {
        name: "Pompa di calore - Zona E",
        steps: [
            { action: 'select', selector: '#operator-type', value: 'pa' },
            { action: 'click', selector: 'input[value="pompa-calore"]' },
            { action: 'type', selector: 'input[name="energia_incentivata"]', value: '10000' },
            { action: 'select', selector: 'select[name="zona_climatica"]', value: 'E' },
            { action: 'click', selector: '#calculate-btn' }
        ],
        expectedMin: 3800,
        expectedMax: 4200
    }
];

async function runE2ETests() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TEST E2E - SIMULATORE BROWSER');
    console.log('═══════════════════════════════════════════════════\n');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Carica la pagina locale
    const htmlPath = 'file://' + path.resolve(__dirname, '../src/index.html');
    await page.goto(htmlPath);
    
    let passed = 0;
    let failed = 0;
    
    for (const test of TEST_CASES) {
        console.log(`\n🧪 Esecuzione: ${test.name}`);
        
        try {
            // Reload pagina per ogni test
            await page.reload();
            await page.waitForSelector('#operator-type');
            
            // Esegui gli step
            for (const step of test.steps) {
                switch (step.action) {
                    case 'select':
                        await page.select(step.selector, step.value);
                        await page.waitForTimeout(100);
                        break;
                    case 'click':
                        await page.click(step.selector);
                        await page.waitForTimeout(200);
                        break;
                    case 'type':
                        await page.type(step.selector, step.value);
                        await page.waitForTimeout(100);
                        break;
                }
            }
            
            // Attendi risultato
            await page.waitForSelector('#result-amount', { visible: true, timeout: 2000 });
            
            // Leggi il risultato
            const resultText = await page.$eval('#result-amount', el => el.textContent);
            const result = parseFloat(resultText.replace(/[€\s,]/g, '').replace('.', ''));
            
            // Verifica
            const isInRange = result >= test.expectedMin && result <= test.expectedMax;
            
            if (isInRange) {
                console.log(`   ✅ PASS: €${result.toFixed(2)} (atteso: €${test.expectedMin}-${test.expectedMax})`);
                passed++;
            } else {
                console.log(`   ❌ FAIL: €${result.toFixed(2)} (atteso: €${test.expectedMin}-${test.expectedMax})`);
                failed++;
            }
            
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            failed++;
        }
    }
    
    await browser.close();
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`   Passati: ${passed}/${TEST_CASES.length}`);
    console.log(`   Falliti: ${failed}/${TEST_CASES.length}`);
    console.log('═══════════════════════════════════════════════════\n');
    
    process.exit(failed > 0 ? 1 : 0);
}

runE2ETests().catch(console.error);
