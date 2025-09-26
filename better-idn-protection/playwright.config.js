const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for Better IDN Protection extension E2E tests
 */
module.exports = defineConfig({
  // Test directory
  testDir: './test/e2e/tests',

  // Global test timeout
  timeout: 30000,

  // Expect timeout for assertions
  expect: {
    timeout: 5000
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: process.env.CI ? [
    ['github'],
    ['html', { outputFolder: 'test-results/e2e-report' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }]
  ] : [
    ['list'],
    ['html', { outputFolder: 'test-results/e2e-report' }]
  ],

  // Global test setup
  use: {
    // Browser action timeout
    actionTimeout: 10000,

    // Browser navigation timeout
    navigationTimeout: 30000,

    // Base URL for tests (not used for extension testing)
    // baseURL: 'http://localhost:3000',

    // Collect trace on failure
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',

    // Take screenshots on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Browser context options
    contextOptions: {
      // Ignore HTTPS errors for testing
      ignoreHTTPSErrors: true,

      // Set permissions for extension testing
      permissions: ['notifications', 'storage']
    }
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Extension-specific launch options
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-background-timer-throttling',
            '--disable-background-networking',
            '--disable-dev-shm-usage',
            '--no-sandbox'
          ]
        }
      }
    }

    // Uncomment to test on other browsers (limited extension support)
    // {
    //   name: 'firefox-extension',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     // Firefox extension testing requires different setup
    //   },
    // },
  ],

  // Output directory for test artifacts
  outputDir: 'test-results/e2e-artifacts',

  // Global setup/teardown
  // globalSetup: require.resolve('./e2e/global-setup'),
  // globalTeardown: require.resolve('./e2e/global-teardown'),

  // Test match patterns
  testMatch: [
    '**/*.test.js',
    '**/*.spec.js'
  ],

  // Files to ignore
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ]

  // Web server configuration (not needed for extension testing)
  // webServer: {
  //   command: 'npm run dev',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
