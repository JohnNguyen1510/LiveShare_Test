// @ts-check
/**
 * Script to perform authentication and save cookies/local storage for test reuse
 * 
 * Usage:
 *   node e2e-tests/save-complete-auth.js
 */

import { chromium } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { saveAuthState } from '../utils/auth-utils.js';
import fs from 'fs';
import path from 'path';

// Create videos directory if it doesn't exist
const videosDir = path.join(process.cwd(), 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Main function to run the auth script
async function saveCompleteAuth() {
  console.log('Starting authentication script...');
  
  // Launch browser with longer timeout
  const browser = await chromium.launch({ 
    headless: false, // Run headed for easier debugging
    slowMo: 100,     // Slow down execution a bit for visibility
    timeout: 60000   // 60 second timeout for browser launch
  });

  try {
    // Create a new browser context
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: videosDir },
      ignoreHTTPSErrors: true
    });

    // Create a page and login page object
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    console.log('Starting authentication flow...');
    
    // Run the complete auth flow
    const success = await loginPage.completeGoogleAuth(context);
    
    if (!success) {
      throw new Error('Authentication failed');
    }
    
    // Wait to ensure everything is loaded
    console.log('Authentication successful, waiting 5 seconds before saving state...');
    await page.waitForTimeout(5000);
    
    // Save the authentication state
    await saveAuthState(context, 'liveshare');
    
    console.log('✅ Authentication completed and state saved!');
    
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    process.exit(1);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the auth script
saveCompleteAuth().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 