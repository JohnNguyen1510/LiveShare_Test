// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Read environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  reporter: 'html',
  
  // Global timeout for each test
  timeout: 60000,
  
  // Global test setup
  globalSetup: './global-setup.js',
  
  use: {
    // Base URL for navigation
    baseURL: 'https://dev.livesharenow.com',

    // Browser configurations
    headless: process.env.HEADED ? false : true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Artifacts
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Timeouts
    navigationTimeout: 30000,
    actionTimeout: 10000,
    
    // Retry options
    retryOnNetworkError: true,
    maxRetries: 1,
    
    // Test isolation
    isolatePages: true
  },

  projects: [
    {
      name: 'authenticated-tests',
      testMatch: '**/!(register.spec.js)',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'auth/user-auth.json', 
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        }
      },
    },
    {
      name: 'guest-tests',
      testMatch: '**/register.spec.js',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--incognito' 
          ]
        }
      },
    },
    // // Mobile devices - iPhone
    // {
    //   name: 'mobile-iphone-authenticated',
    //   testMatch: '**/!(register.spec.js)',
    //   use: { 
    //     ...devices['iPhone 13 Pro'],
    //     storageState: 'auth/user-auth.json',
    //   },
    // },
    // {
    //   name: 'mobile-iphone-guest',
    //   testMatch: '**/register.spec.js',
    //   use: { 
    //     ...devices['iPhone 13 Pro'],
    //   },
    // },
    // // Mobile devices - Android
    // {
    //   name: 'mobile-android-authenticated',
    //   testMatch: '**/!(register.spec.js)',
    //   use: { 
    //     ...devices['Pixel 5'],
    //     storageState: 'auth/user-auth.json',
    //   },
    // },
    // {
    //   name: 'mobile-android-guest',
    //   testMatch: '**/register.spec.js',
    //   use: { 
    //     ...devices['Pixel 5'],
    //   },
    // },
    // // Mobile devices - iPad
    // {
    //   name: 'mobile-ipad-authenticated',
    //   testMatch: '**/!(register.spec.js)',
    //   use: { 
    //     ...devices['iPad Pro'],
    //     storageState: 'auth/user-auth.json',
    //   },
    // },
    // {
    //   name: 'mobile-ipad-guest',
    //   testMatch: '**/register.spec.js',
    //   use: { 
    //     ...devices['iPad Pro'],
    //   },
    // },
  ],

  // Output directory for test artifacts
  outputDir: 'test-results',

  // Web server configuration (if needed)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },

  // Test file pattern
  testMatch: '**/*.spec.js',
}); 