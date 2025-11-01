/**
 * TEST E2E (End-to-End) - Simulatore CT 3.0
 * 
 * Questi test simulano un utente reale che interagisce con l'applicazione.
 * Usano Playwright per automatizzare browser reali (Chrome, Firefox, etc.)
 * 
 * SETUP INIZIALE:
 * npm install --save-dev @playwright/test
 * npx playwright install
 * 
 * ESECUZIONE:
 * npx playwright test
 * npx playwright test --headed  # Con browser visibile
 * npx playwright test --debug    # Con debugger
 */

const { test, expect } = require('@playwright/test');

// Configurazione comune
const BASE_URL = 'http://localhost:8080';

test.describe('Simulatore CT 3.0 - Test E2E', () => {
    
    test.beforeEach(async ({ page }) => {
        // Avvia server locale prima dei test
        // (assicurati che `npm run dev` sia attivo in un altro terminale)
        await page.goto(BASE_URL);
    });

    // Test 1: Caricamento base dell'applicazione
    test('L\'applicazione si carica correttamente', async ({ page }) => {
        await expect(page).toHaveTitle(/Conto Termico/);
        
        // Verifica presenza elementi chiave
        await expect(page.locator('h1')).toContainText('Simulatore');
        await expect(page.locator('#step1')).toBeVisible();
        await expect(page.locator('#calculate-btn')).toBeVisible();
    });

    // Test 2: Flusso utente PA - Isolamento termico
    test('PA può calcolare incentivo per isolamento termico', async ({ page }) => {
        // Step 1: Seleziona PA
        await page.check('input[value="pa"]');
        await page.waitForTimeout(500); // Attendi rendering dinamico
        
        // Step 2: Seleziona categoria edificio E1
        await page.selectOption('#building-category', 'E1');
        
        // Step 3: Procedi a Step 2
        await page.click('button:has-text("Continua")');
        await page.waitForTimeout(500);
        
        // Step 4: Seleziona intervento isolamento
        await page.check('input[value="isolamento-opache"]');
        await page.waitForTimeout(1000); // Attendi rendering campi dinamici
        
        // Step 5: Compila form (con nuova struttura tabella)
        // Nota: questo deve essere adattato alla UI reale con tabella
        const addRowBtn = page.locator('button:has-text("Aggiungi tipologia")');
        await expect(addRowBtn).toBeVisible();
        
        // Seleziona tipologia
        await page.selectOption('select[data-column-id="tipologia_struttura"]', 'parete_esterno');
        
        // Inserisci superficie
        await page.fill('input[data-column-id="superficie"]', '100');
        
        // Inserisci costo totale
        await page.fill('input[data-column-id="costo_totale"]', '20000');
        
        // Seleziona zona climatica
        await page.selectOption('select[id*="zona_climatica"]', 'E');
        
        // Step 6: Calcola
        await page.click('#calculate-btn');
        await page.waitForTimeout(1000);
        
        // Step 7: Verifica risultato
        const resultSection = page.locator('#results');
        await expect(resultSection).toBeVisible();
        
        const totalText = await resultSection.locator('.total-amount').textContent();
        expect(totalText).toContain('€');
        
        // PA in zona E dovrebbe avere incentivo sostanzioso
        const value = parseFloat(totalText.replace(/[€.,\s]/g, ''));
        expect(value).toBeGreaterThan(10000);
    });

    // Test 3: Flusso utente Privato Terziario - Pompa di calore
    test('Privato terziario può calcolare incentivo pompa di calore', async ({ page }) => {
        // Step 1: Seleziona privato terziario
        await page.check('input[value="private_tertiary_person"]');
        await page.waitForTimeout(500);
        
        // Step 2: Seleziona categoria edificio
        await page.selectOption('#building-category', 'C1');
        
        // Step 3: Continua
        await page.click('button:has-text("Continua")');
        await page.waitForTimeout(500);
        
        // Step 4: Seleziona pompa di calore
        await page.check('input[value="pompa-calore"]');
        await page.waitForTimeout(1000);
        
        // Step 5: Compila parametri
        await page.selectOption('select[id*="tipo_pompa"]', 'aria/acqua (≤35kW)');
        await page.fill('input[id*="potenza_nominale"]', '20');
        await page.fill('input[id*="scop"]', '4.5');
        await page.fill('input[id*="scop_minimo"]', '4.0');
        await page.selectOption('select[id*="zona_climatica"]', 'E');
        
        // Step 6: Calcola
        await page.click('#calculate-btn');
        await page.waitForTimeout(1000);
        
        // Step 7: Verifica risultato
        const resultSection = page.locator('#results');
        await expect(resultSection).toBeVisible();
        
        const totalText = await resultSection.locator('.total-amount').textContent();
        const value = parseFloat(totalText.replace(/[€.,\s]/g, ''));
        
        // Privato dovrebbe avere incentivo minore di PA
        expect(value).toBeGreaterThan(5000);
        expect(value).toBeLessThan(15000);
    });

    // Test 4: Multi-intervento (1.A + 2.A)
    test('Multi-intervento applica maggiorazione automatica', async ({ page }) => {
        // Step 1: Seleziona privato terziario
        await page.check('input[value="private_tertiary_person"]');
        await page.waitForTimeout(500);
        
        // Step 2: Categoria edificio
        await page.selectOption('#building-category', 'E1');
        await page.click('button:has-text("Continua")');
        await page.waitForTimeout(500);
        
        // Step 3: Seleziona ENTRAMBI gli interventi (1.A + 2.A)
        await page.check('input[value="isolamento-opache"]');
        await page.waitForTimeout(500);
        await page.check('input[value="pompa-calore"]');
        await page.waitForTimeout(1000);
        
        // Step 4: Compila isolamento
        await page.selectOption('select[data-column-id="tipologia_struttura"]', 'parete_esterno');
        await page.fill('input[data-column-id="superficie"]', '50');
        await page.fill('input[data-column-id="costo_totale"]', '10000');
        
        // Zona climatica isolamento
        const zonaCli1 = page.locator('select[id*="isolamento"][id*="zona_climatica"]');
        await zonaCli1.selectOption('E');
        
        // Step 5: Compila pompa di calore
        await page.selectOption('select[id*="pompa-calore"][id*="tipo_pompa"]', 'aria/acqua (≤35kW)');
        await page.fill('input[id*="pompa-calore"][id*="potenza_nominale"]', '15');
        await page.fill('input[id*="pompa-calore"][id*="scop"]', '4.2');
        await page.fill('input[id*="pompa-calore"][id*="scop_minimo"]', '4.0');
        
        const zonaCli2 = page.locator('select[id*="pompa-calore"][id*="zona_climatica"]');
        await zonaCli2.selectOption('E');
        
        // Step 6: Calcola
        await page.click('#calculate-btn');
        await page.waitForTimeout(1000);
        
        // Step 7: Verifica premio multi-intervento
        const resultSection = page.locator('#results');
        const detailsText = await resultSection.textContent();
        
        // Deve contenere riferimento a multi-intervento
        expect(detailsText.toLowerCase()).toContain('multi-intervento');
        
        // Incentivo combinato deve essere > somma singoli incentivi base
        const totalText = await resultSection.locator('.total-amount').textContent();
        const total = parseFloat(totalText.replace(/[€.,\s]/g, ''));
        
        expect(total).toBeGreaterThan(10000); // Soglia minima ragionevole
    });

    // Test 5: Visibilità dinamica campi 1.G (Infrastrutture ricarica)
    test('Campi 1.G si mostrano/nascondono in base a tipologia', async ({ page }) => {
        // Step 1-2: Setup base
        await page.check('input[value="pa"]');
        await page.waitForTimeout(500);
        await page.selectOption('#building-category', 'E1');
        await page.click('button:has-text("Continua")');
        await page.waitForTimeout(500);
        
        // Step 3: Seleziona 1.G
        await page.check('input[value="infrastrutture-ricarica"]');
        await page.waitForTimeout(1000);
        
        // Step 4: Verifica stato iniziale (default = primo valore)
        const tipoSelect = page.locator('select[id*="tipo_infrastruttura"]');
        await tipoSelect.selectOption('Standard monofase (7.4-22kW)');
        await page.waitForTimeout(500);
        
        // numero_punti DEVE essere visibile
        const numeroPuntiField = page.locator('input[id*="numero_punti"]');
        await expect(numeroPuntiField).toBeVisible();
        
        // potenza NON deve essere visibile
        const potenzaField = page.locator('input[id*="potenza"]');
        await expect(potenzaField).not.toBeVisible();
        
        // Step 5: Cambia a "Media (22-50kW)"
        await tipoSelect.selectOption('Media (22-50kW)');
        await page.waitForTimeout(500);
        
        // Ora potenza DEVE essere visibile
        await expect(potenzaField).toBeVisible();
        
        // numero_punti NON deve essere visibile
        await expect(numeroPuntiField).not.toBeVisible();
        
        // Step 6: Verifica limiti su potenza
        await potenzaField.fill('30'); // Valore valido
        const borderColor1 = await potenzaField.evaluate(el => getComputedStyle(el).borderColor);
        // Dovrebbe essere normale (non rosso)
        
        await potenzaField.fill('60'); // Valore NON valido (> 50)
        await page.waitForTimeout(200);
        const borderColor2 = await potenzaField.evaluate(el => getComputedStyle(el).borderColor);
        // Dovrebbe essere rosso o avere classe errore
        expect(borderColor2).not.toBe(borderColor1);
    });

    // Test 6: Art. 48-ter (100% incentivo)
    test('PA con Art. 48-ter riceve 100% incentivo', async ({ page }) => {
        // Step 1: Seleziona PA
        await page.check('input[value="pa"]');
        await page.waitForTimeout(500);
        
        // Step 2: Seleziona piccolo comune
        await page.check('input[id*="piccolo_comune"]');
        await page.waitForTimeout(500);
        
        // Oppure seleziona Art. 48-ter
        await page.selectOption('select[id*="implementation-mode"]', 'art_48ter');
        await page.waitForTimeout(500);
        
        // Step 3: Categoria edificio
        await page.selectOption('#building-category', 'E1');
        await page.click('button:has-text("Continua")');
        await page.waitForTimeout(500);
        
        // Step 4: Isolamento
        await page.check('input[value="isolamento-opache"]');
        await page.waitForTimeout(1000);
        
        await page.selectOption('select[data-column-id="tipologia_struttura"]', 'parete_esterno');
        await page.fill('input[data-column-id="superficie"]', '100');
        await page.fill('input[data-column-id="costo_totale"]', '20000');
        
        const zonaCli = page.locator('select[id*="zona_climatica"]').first();
        await zonaCli.selectOption('E');
        
        // Step 5: Calcola
        await page.click('#calculate-btn');
        await page.waitForTimeout(1000);
        
        // Step 6: Verifica 100% (o molto vicino)
        const totalText = await page.locator('#results .total-amount').textContent();
        const incentivo = parseFloat(totalText.replace(/[€.,\s]/g, ''));
        
        // Con Art. 48-ter, incentivo dovrebbe essere ~100% di 20000 (fino a Imas)
        expect(incentivo).toBeGreaterThan(18000); // Almeno 90%
    });

    // Test 7: Validazione campi obbligatori
    test('Pulsante Calcola disabilitato se campi obbligatori vuoti', async ({ page }) => {
        // Setup
        await page.check('input[value="pa"]');
        await page.waitForTimeout(500);
        await page.selectOption('#building-category', 'E1');
        await page.click('button:has-text("Continua")');
        await page.waitForTimeout(500);
        
        // Seleziona intervento
        await page.check('input[value="sostituzione-infissi"]');
        await page.waitForTimeout(1000);
        
        // NON compilare i campi
        const calculateBtn = page.locator('#calculate-btn');
        
        // Il pulsante dovrebbe essere disabilitato o mostrare errori
        const isDisabled = await calculateBtn.isDisabled();
        if (!isDisabled) {
            // Se non è disabilitato, cliccando dovrebbe mostrare errore
            await calculateBtn.click();
            await page.waitForTimeout(500);
            
            // Verifica presenza messaggio errore o campi evidenziati
            const errorFields = page.locator('input.invalid, input[style*="border-color: rgb(211, 47, 47)"]');
            const count = await errorFields.count();
            expect(count).toBeGreaterThan(0);
        } else {
            expect(isDisabled).toBeTruthy();
        }
    });

    // Test 8: Responsività mobile
    test('Layout responsive su mobile', async ({ page }) => {
        // Imposta viewport mobile
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        
        await page.goto(BASE_URL);
        
        // Verifica elementi visibili
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#step1')).toBeVisible();
        
        // Verifica che non ci sia scroll orizzontale
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 per arrotondamento
    });

});

// Test di performance (opzionale)
test.describe('Performance', () => {
    test('Pagina si carica in < 3 secondi', async ({ page }) => {
        const startTime = Date.now();
        await page.goto(BASE_URL);
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(3000);
        console.log(`⏱️  Tempo di caricamento: ${loadTime}ms`);
    });
    
    test('Calcolo incentivo completa in < 1 secondo', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Setup rapido
        await page.check('input[value="pa"]');
        await page.selectOption('#building-category', 'E1');
        await page.click('button:has-text("Continua")');
        await page.check('input[value="sostituzione-infissi"]');
        await page.waitForTimeout(500);
        
        // Compila
        await page.fill('input[id*="superficie"]', '50');
        await page.fill('input[id*="costo_specifico"]', '600');
        await page.selectOption('select[id*="zona_climatica"]', 'E');
        
        // Misura tempo calcolo
        const startTime = Date.now();
        await page.click('#calculate-btn');
        await page.waitForSelector('#results', { state: 'visible' });
        const calcTime = Date.now() - startTime;
        
        expect(calcTime).toBeLessThan(1000);
        console.log(`⚡ Tempo di calcolo: ${calcTime}ms`);
    });
});
