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
  workers: 5,
  reporter: 'html',
  
  // Global timeout for each test
  timeout: 60000,
  
  // Global test setup
  globalSetup: './global-setup.js',
  
  use: {
    // Base URL for navigation
    baseURL: 'https://dev.livesharenow.com',

    // Browser configurations
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Artifacts
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Timeouts
    navigationTimeout: 30000,
    actionTimeout: 15000,
    
    // Retry options
    retryOnNetworkError: true,
    maxRetries: 3,
    
    // Test isolation
    isolatePages: true
  },

  projects: [
    {
      name: 'authenticated-tests',
      testMatch: '**/!(register.spec.js)', // Tất cả test trừ register.spec.js
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'auth/user-auth.json', // Có authentication cho các test khác
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
      testMatch: '**/register.spec.js', // Chỉ register.spec.js
      use: { 
        ...devices['Desktop Chrome'],
        // Không có storageState - clean state cho guest tests
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--incognito' // Thêm incognito mode để đảm bảo clean state
          ]
        }
      },
    }
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

  // Directory for storing global test data
  globalSetupDir: path.join(__dirname, 'global-setup'),

  // Custom reporter options
  reporterOptions: {
    html: {
      open: process.env.CI ? 'never' : 'on-failure'
    }
  }
}); 