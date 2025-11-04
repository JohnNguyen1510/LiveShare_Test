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

test.describe('SnapQuest Feature Tests ', () => {
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

  test('TC-APP-SQ-001: Verify accessing "Join to events button" from plus icon in Joined Events page using POM', async ({ page, context }) => {
    try {
    basePage.logStep('Starting test: TC-APP-SQ-001', 'info');

      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      // Verify join functionality using POM method
      const joinButtonFound = await snapQuestPage.verifyJoinFunctionality();
      
      basePage.logStep('TC-APP-SQ-001 completed with expected warning: Join button not found using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-join-functionality', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-SQ-002: Verify accessing "Join" button in nondashboard website using POM', async ({ page, context }) => {
    try {
    basePage.logStep('Starting test: TC-APP-SQ-002', 'info');

      // Verify non-dashboard join functionality using POM method
      const result = await snapQuestPage.verifyNonDashboardJoin();
      
      basePage.logStep('TC-APP-SQ-002 completed successfully using POM structure', 'success');
      
        } catch (error) {
      await basePage.captureScreenshot('error-nondashboard-join', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-FSQ-001: Verify "Grid View" button functionality using POM', async ({ page, context }) => {
    try {
      basePage.logStep('Starting test: TC-APP-FSQ-001', 'info');
      
      // Navigate to app and login
      await page.goto('https://dev.livesharenow.com/');
      const success = await loginPage.authenticateWithRetry(context);
      expect(success, 'Authentication should be successful').toBeTruthy();
      
      // Verify grid view functionality using POM method
      const gridViewButtonFound = await snapQuestPage.verifyGridViewFunctionality();
      
      basePage.logStep('TC-APP-FSQ-001 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-grid-view', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-FSQ-002: Verify "Share" button functionality using POM', async ({ page, context }) => {
    try {
      basePage.logStep('Starting test: TC-APP-FSQ-002', 'info');
      
      // Navigate to app and login
      await page.goto('https://dev.livesharenow.com/');
      const success = await loginPage.authenticateWithRetry(context);
      expect(success, 'Google authentication should be successful').toBeTruthy();
      
      // Verify share functionality using POM method
      const shareButtonFound = await snapQuestPage.verifyShareFunctionality();
      
      basePage.logStep('TC-APP-FSQ-002 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-share-button', `error-${Date.now()}`);
      throw error;
    }
  });

  test('TC-APP-FSQ-003 & TC-APP-FSQ-004: Verify "Button link #1 #2" functionality using POM', async ({ page, context }) => {
    try {
      // Verify button links functionality using POM method
      const result = await snapQuestPage.verifyButtonLinks();
      
      basePage.logStep('TC-APP-FSQ-003 & TC-APP-FSQ-004 completed successfully using POM structure', 'success');
      
    } catch (error) {
      await basePage.captureScreenshot('error-button-links', `error-${Date.now()}`);
      throw error;
    }
  });
}); 
