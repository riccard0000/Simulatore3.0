// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  
  // Timeout per ogni test (30 secondi)
  timeout: 30 * 1000,
  
  // Aspetta che il server sia pronto
  expect: {
    timeout: 5000
  },

  // Configurazione reporter
  reporter: [
    ['html', { outputFolder: 'tests/e2e/playwright-report' }],
    ['list'],
    ['json', { outputFile: 'tests/e2e/test-results.json' }]
  ],

  // Opzioni globali per tutti i test
  use: {
    // URL base dell'applicazione
  baseURL: 'http://localhost:8085',

    // Screenshot solo in caso di fallimento
    screenshot: 'only-on-failure',

    // Video solo in caso di fallimento
    video: 'retain-on-failure',

    // Traccia completa in caso di fallimento
    trace: 'on-first-retry',

    // Timeout per azioni (click, fill, etc.)
    actionTimeout: 10 * 1000,

    // User agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },

  // Progetti (browser da testare)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Opzionale: test su Safari (solo su macOS)
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Test mobile
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
    },
  ],

  // Web server locale (opzionale - avvia automaticamente http-server)
  webServer: {
    command: 'npx http-server src -p 8085',
    port: 8085,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI, // Riusa server esistente in sviluppo
  },

  // Configurazione per CI
  ...(process.env.CI && {
    retries: 2, // Riprova 2 volte in CI
    workers: 2, // Max 2 worker in parallelo
  }),
});
