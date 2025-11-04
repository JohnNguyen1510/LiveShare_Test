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

test.describe('SnapQuest Additional Feature Tests', () => {
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
      // Verify details panel functionality using POM method
      const detailsPanelFound = await snapQuestPage.verifyDetailsPanel();
      
      basePage.logStep('TC-APP-FSQ-006 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-details-panel', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-FSQ-007: Verify "Airshow Home" Button Functionality using POM', async ({ page, context }) => {
    try {
    basePage.logStep('Starting test: TC-APP-FSQ-007', 'info');
    
      // Navigate to app and login
    await page.goto('https://dev.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify button links functionality using POM method
      const result = await snapQuestPage.verifyButtonLinks();
      
      basePage.logStep('TC-APP-FSQ-007 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-airshow-home', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-FSQ-008: Verify "Map" Button Functionality using POM', async ({ page, context }) => {
    try {
    basePage.logStep('Starting test: TC-APP-FSQ-008', 'info');
    
      // Navigate to app and login
    await page.goto('https://dev.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify button links functionality using POM method (includes Map button)
      const result = await snapQuestPage.verifyButtonLinks();
      
      basePage.logStep('TC-APP-FSQ-008 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-map-button', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-FSQ-009: Verify "LiveView" Option in More Menu using POM', async ({ page, context }) => {
    try {
    basePage.logStep('Starting test: TC-APP-FSQ-009', 'info');
    
      // Navigate to app and login
    await page.goto('https://dev.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify LiveView functionality using POM method
      const moreButtonFound = await snapQuestPage.verifyLiveViewFunctionality();
      
      basePage.logStep('TC-APP-FSQ-009 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-liveview', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-FSQ-0010: Verify "Redeem Gift Code" Option in More Menu using POM', async ({ page, context }) => {
    try {
    basePage.logStep('Starting test: TC-APP-FSQ-0010', 'info');
    
      // Navigate to app and login
    await page.goto('https://dev.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify redeem gift code functionality using POM method
      const moreButtonFound = await snapQuestPage.verifyRedeemGiftCode();
      
      basePage.logStep('TC-APP-FSQ-0010 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-redeem-gift', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-FSQ-0011: Verify Image Upload Functionality using POM', async ({ page, context }) => {
    try {
    basePage.logStep('Starting test: TC-APP-FSQ-0011', 'info');
    
      // Navigate to app and login
    await page.goto('https://dev.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Google authentication should be successful').toBeTruthy();
    
      // Verify image upload functionality using POM method
      const addButtonFound = await snapQuestPage.verifyImageUploadFunctionality();
      
      basePage.logStep('TC-APP-FSQ-0011 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-image-upload', `error-${Date.now()}`);
      throw error;
    }
  });
}); 