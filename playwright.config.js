// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const config = require('./src/config/config-loader');

// Path to the authentication state file
const authFile = path.resolve(__dirname, 'src/auth/user-auth.json');
console.log(`Auth file path: ${authFile}`);

// Determine if tests should run headless or with browser visible
const headless = process.env.HEADLESS !== '0';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: './src/tests',
    timeout: config.testConfig?.timeout || 60000,
    expect: {
        timeout: 10000
    },
    
    /* Run tests in files in parallel */
    fullyParallel: false,
    
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    
    /* Retry on CI only */
    retries: process.env.CI ? (config.testConfig?.retries || 2) : 1,
    
    /* Opt out of parallel tests to prevent auth/UI race conditions. */
    workers: 1,
    
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['list'],
        ['html', { 
            open: process.env.CI ? 'never' : 'on-failure',
            outputFolder: 'playwright-report'
        }]
    ],
    
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        // Base URL for navigation
        baseURL: config.baseURL,
        
        // Browser configurations
        headless: headless,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        
        // Artifacts
        screenshot: config.testConfig?.screenshotOnFailure ? 'only-on-failure' : 'off',
        video: config.testConfig?.videoOnFailure ? 'retain-on-failure' : 'off',
        trace: 'retain-on-failure',
        
        // Timeouts
        navigationTimeout: 30000,
        actionTimeout: 15000,
        
        // Retry options
        retryOnNetworkError: true,
        maxRetries: 3,
        
        // Test isolation
        isolatePages: true,
        
        // Storage state for auth
        storageState: fs.existsSync(authFile) ? authFile : undefined,
        
        // Launch options
        launchOptions: {
            slowMo: 100,
            args: [
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        }
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                // Use stored auth state explicitly
                storageState: authFile,
            },
        },
        {
            name: 'firefox',
            use: { 
                ...devices['Desktop Firefox'],
                storageState: fs.existsSync(authFile) ? authFile : undefined,
            },
        },
        {
            name: 'webkit',
            use: { 
                ...devices['Desktop Safari'],
                storageState: fs.existsSync(authFile) ? authFile : undefined,
            },
        },
        {
            name: 'api-tests',
            testDir: './src/tests/api',
            use: {
                // API tests don't need a browser
                baseURL: config.apiBaseURL,
                extraHTTPHeaders: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        },
    ],

    /* Output directory for test artifacts */
    outputDir: 'test-results',

    /* Global setup */
    globalSetup: './global-setup.js',

    /* Test file pattern */
    testMatch: '**/*.spec.js',

    /* Custom reporter options */
    reporterOptions: {
        html: {
            open: process.env.CI ? 'never' : 'on-failure'
        }
    }
});