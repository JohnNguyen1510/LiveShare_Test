import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { SnapQuestPage } from '../page-objects/SnapQuestPage.js';
import { BasePage } from '../page-objects/BasePage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('SnapQuest Additional Feature Tests - POM Structure', () => {
  // Increase timeout for the entire test suite
  test.setTimeout(240000);
  
  let loginPage;
  let snapQuestPage;
  let basePage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    snapQuestPage = new SnapQuestPage(page);
    basePage = new BasePage(page);
  });


  test('TC-APP-FSQ-006: Verify "Details" button functionality using POM', async ({ page, context }) => {
    try {
    console.log('Starting test: TC-APP-FSQ-006');
    
      // Navigate to app and login
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify details panel functionality using POM method
      const detailsPanelFound = await snapQuestPage.verifyDetailsPanel();
      
      console.log('✅ TC-APP-FSQ-006 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-details-panel-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-FSQ-007: Verify "Airshow Home" Button Functionality using POM', async ({ page, context }) => {
    try {
    console.log('Starting test: TC-APP-FSQ-007');
    
      // Navigate to app and login
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify button links functionality using POM method
      const result = await snapQuestPage.verifyButtonLinks();
      
      console.log('✅ TC-APP-FSQ-007 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-airshow-home-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-FSQ-008: Verify "Map" Button Functionality using POM', async ({ page, context }) => {
    try {
    console.log('Starting test: TC-APP-FSQ-008');
    
      // Navigate to app and login
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify button links functionality using POM method (includes Map button)
      const result = await snapQuestPage.verifyButtonLinks();
      
      console.log('✅ TC-APP-FSQ-008 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-map-button-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-FSQ-009: Verify "LiveView" Option in More Menu using POM', async ({ page, context }) => {
    try {
    console.log('Starting test: TC-APP-FSQ-009');
    
      // Navigate to app and login
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify LiveView functionality using POM method
      const moreButtonFound = await snapQuestPage.verifyLiveViewFunctionality();
      
      console.log('✅ TC-APP-FSQ-009 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-liveview-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-FSQ-0010: Verify "Redeem Gift Code" Option in More Menu using POM', async ({ page, context }) => {
    try {
    console.log('Starting test: TC-APP-FSQ-0010');
    
      // Navigate to app and login
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify redeem gift code functionality using POM method
      const moreButtonFound = await snapQuestPage.verifyRedeemGiftCode();
      
      console.log('✅ TC-APP-FSQ-0010 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-redeem-gift-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-FSQ-0011: Verify Image Upload Functionality using POM', async ({ page, context }) => {
    try {
    console.log('Starting test: TC-APP-FSQ-0011');
    
      // Navigate to app and login
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify image upload functionality using POM method
      const addButtonFound = await snapQuestPage.verifyImageUploadFunctionality();
      
      console.log('✅ TC-APP-FSQ-0011 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-image-upload-${Date.now()}.png`) });
      throw error;
    }
  });
}); 