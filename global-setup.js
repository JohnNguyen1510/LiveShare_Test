import { chromium } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage.js';
import fs from 'fs';
import path from 'path';

/**
 * Global setup for tests
 */
async function globalSetup() {
  // Create auth directory if it doesn't exist
  const authDir = path.join(process.cwd(), 'auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir);
  }

  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Create login page instance
    const loginPage = new LoginPage(page);

    // Navigate to app and complete auth
    await page.goto('https://app.livesharenow.com');
    const success = await loginPage.completeGoogleAuth(context);

    if (!success) {
      throw new Error('Authentication failed during global setup');
    }

    // Save authentication state
    await context.storageState({
      path: path.join(authDir, 'user-auth.json')
    });

  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    // Close browser
    await browser.close();
  }
}

export default globalSetup; 