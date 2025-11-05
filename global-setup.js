import { chromium } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global setup for tests - EMAIL authentication approach
 */
async function globalSetup() {
  // Create auth directory if it doesn't exist
  const authDir = path.join(__dirname, 'auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir);
  }

  // Reuse existing storage state to avoid re-login (similar to DMS approach)
  const authFile = path.join(authDir, 'user-auth.json');
  if (fs.existsSync(authFile)) {
    console.log(`✅ Using existing auth state at: ${authFile}. Skipping email login.`);
    return;
  }

  // Get email credentials from environment
  const testEmail = process.env.LIVESHARE_EMAIL || 'your-test-email@example.com';
  const testPassword = process.env.LIVESHARE_PASSWORD || '';
  
  console.log(`🔐 Starting EMAIL authentication for: ${testEmail}`);

  // Launch browser
  const browser = await chromium.launch({ 
    headless: process.env.HEADED ? false : true,
    slowMo: 0 // Optimized for speed
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  try {
    // Create login page instance
    const loginPage = new LoginPage(page);

    // Navigate to app and complete EMAIL auth with retry mechanism
    await page.goto('https://dev.livesharenow.com');
    const success = await loginPage.authenticateWithEmailRetry(testEmail, testPassword);

    if (!success) {
      throw new Error('EMAIL authentication failed during global setup');
    }

    // Save authentication state (similar to DMS approach)
    await context.storageState({
      path: path.join(authDir, 'user-auth.json')
    });

    console.log(`✅ EMAIL authentication completed and state saved to: ${authFile}`);

  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    // Close browser
    await browser.close();
  }
}

export default globalSetup; 