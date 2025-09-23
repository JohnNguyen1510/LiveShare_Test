// @ts-check
/**
 * Script to perform EMAIL authentication and save cookies/local storage for test reuse
 * Similar to DMS save-complete-auth.js but for email login instead of Google OAuth
 * 
 * Usage:
 *   node e2e-tests/save-email-auth.js
 */

import { chromium } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { EventListPage } from '../page-objects/EventListPage.js';
import { EventCreationPage } from '../page-objects/EventCreationPage.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create videos directory if it doesn't exist
const videosDir = path.join(process.cwd(), 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Ensure auth directory exists
const authDir = path.join(process.cwd(), 'auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}
const authFile = path.join(authDir, 'user-auth.json');

// Get email from environment variables
const testEmail = process.env.LIVESHARE_EMAIL || 'your-test-email@example.com';
const testPassword = process.env.LIVESHARE_PASSWORD || ''; // Password if required

// Main function to run the email auth script
async function saveEmailAuth() {
  console.log('Starting EMAIL authentication script...');
  console.log(`Using email: ${testEmail}`);
  
  // Launch browser with longer timeout - similar to DMS persistent context approach
  const browser = await chromium.launch({ 
    headless: false, // Run headed for easier debugging
    slowMo: 100,     // Slow down execution a bit for visibility
    timeout: 60000   // 60 second timeout for browser launch
  });

  try {
    // Create a new browser context - similar to DMS persistent context
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: videosDir },
      ignoreHTTPSErrors: true
    });

    // Create a page and login page object
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    console.log('Navigating to LiveShare app...');
    await page.goto('https://dev.livesharenow.com/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    console.log('Starting EMAIL authentication flow...');
    
    // Run the complete EMAIL auth flow
    const success = await loginPage.authenticateWithEmailRetry(testEmail, testPassword);
    
    if (!success) {
      throw new Error('Email authentication failed');
    }
    
    // Wait to ensure everything is loaded - similar to DMS approach
    console.log('Email authentication successful, waiting 5 seconds before saving state...');
    await page.waitForTimeout(5000);
    
    // Save the authentication state aligned with playwright.config.js - similar to DMS
    await context.storageState({ path: authFile });
    console.log(`✅ EMAIL Authentication completed and state saved to: ${authFile}`);
    
    // Capture token for later API/UI use
    const token = await page.evaluate(() => {
      try {
        return window.localStorage.getItem('ACCESSTOKEN') || '';
      } catch {
        return '';
      }
    });
    if (token) {
      console.log('✅ Retrieved ACCESSTOKEN from localStorage');
    } else {
      console.log('⚠️ Could not find ACCESSTOKEN in localStorage');
    }

    // Create a test event and seed one image for testing purposes
    console.log('🎯 Creating test event and seeding an image...');
    try {
      const eventListPage = new EventListPage(page);
      const eventCreationPage = new EventCreationPage(page);
      
      // Navigate to events page
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      
      // Create a test event
      const testEventData = {
        typeId: '63aac88c5a3b994dcb8602fd',
        name: `Test Event ${Date.now()}`,
        date: new Date().toLocaleDateString(),
        location: 'Test Location',
        description: 'Test event created by automation'
      };
      
      const eventCreated = await eventCreationPage.createEvent(testEventData);
      if (eventCreated) {
        console.log('✅ Test event created successfully');

        // Attempt to open the newly created event detail by clicking the first card
        try {
          await eventListPage.clickEventByIndex(0);
        } catch {}

        // Seed one image inside the event detail
        try {
          // Open add menu → Photos and upload via filechooser, then POST
          await page.locator('button.menu-button:has(mat-icon:text("add"))').first().click();
          const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.getByRole('button', { name: 'Photos' }).click()
          ]);

          const imagesDir = path.join(process.cwd(), 'test-assets', 'upload-images');
          const seedImagePath = path.join(imagesDir, 'test-image-1.png');
          await fileChooser.setFiles(seedImagePath);
          await page.waitForTimeout(300);

          const yesButton = page.getByRole('button', { name: 'Yes' });
          if (await yesButton.isVisible().catch(() => false)) {
            await yesButton.click();
          }

          const postButton = page.getByRole('button', { name: 'POST' });
          await postButton.click();
          
          await page.waitForTimeout(5000);
        } catch (e) {
          console.log('⚠️ Image seeding failed:', e.message);
        }

        // Get event details for later use (best-effort from the first card on return to list)
        try {
          await page.goto('https://dev.livesharenow.com/events');
          await eventListPage.waitForEventsToLoad();
        } catch {}

        let eventName = testEventData.name;
        try {
          const info = await eventListPage.getEventInfo(0);
          if (info?.name) eventName = info.name;
        } catch {}
        console.log(`📊 Using event name: ${eventName}`);

        // Save event data to localStorage for tests to use
        const eventData = {
          name: eventName,
          createdAt: new Date().toISOString()
        };
        await page.evaluate((data) => {
          localStorage.setItem('TEST_EVENT_DATA', JSON.stringify(data));
        }, eventData);
        console.log('💾 Event data saved to localStorage for test reuse');
      } else {
        console.log('⚠️ Event creation failed, but continuing...');
      }
    } catch (error) {
      console.log('⚠️ Event creation error:', error.message);
      console.log('Continuing without event creation...');
    }
    
    // Log the saved tokens for verification (similar to DMS approach)
    console.log('📋 Saved authentication state contains:');
    
    // Check localStorage for ACCESSTOKEN (from your cookies data)
    const localStorage = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        storage[key] = window.localStorage.getItem(key);
      }
      return storage;
    });
    
    if (localStorage.ACCESSTOKEN) {
      console.log('✅ ACCESSTOKEN found in localStorage');
    } else {
      console.log('⚠️ ACCESSTOKEN not found in localStorage');
    }
    
    // Check for important cookies
    const cookies = await context.cookies();
    const importantCookies = cookies.filter(cookie => 
      cookie.name.includes('liveshare') || 
      cookie.name.includes('auth') || 
      cookie.name.includes('session') ||
      cookie.name === 'ACCESSTOKEN'
    );
    
    console.log(`📋 Found ${importantCookies.length} authentication-related cookies`);
    importantCookies.forEach(cookie => {
      console.log(`   - ${cookie.name}: ${cookie.value.substring(0, 50)}...`);
    });
    
    // Save the final state with event data
    await context.storageState({ path: authFile });
    console.log(`💾 Final authentication state with event data saved to: ${authFile}`);
    
  } catch (error) {
    console.error('❌ Email authentication failed:', error);
    process.exit(1);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the email auth script
saveEmailAuth().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
