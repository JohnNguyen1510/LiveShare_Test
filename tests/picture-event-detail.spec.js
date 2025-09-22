import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { ImageDetailPage } from '../page-objects/ImageDetailPage.js';
import { BasePage } from '../page-objects/BasePage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Increase test timeout for reliability
test.setTimeout(5 * 60 * 1000); // 5 minutes

test.describe('Picture In Event Detail Tests - POM Structure', () => {
  let loginPage;
  let imageDetailPage;
  let basePage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    imageDetailPage = new ImageDetailPage(page);
    basePage = new BasePage(page);
  });


  test('TC-APP-PIDe-001: Verify "Pin" button functionality using POM', async ({ page, context }) => {
    try {
      console.log('Starting test: TC-APP-PIDe-001');
      
    // Navigate to app and login
    await page.goto('https://app.livesharenow.com/');
      const success = await loginPage.authenticateWithRetry(context);
    expect(success, 'Authentication should be successful').toBeTruthy();

      // Navigate to event and click on first image using POM
      await imageDetailPage.navigateToEventAndImage('tuanhay_test_event');

      // Verify pin button functionality using POM method
      const buttonChanged = await imageDetailPage.verifyPinButtonFunctionality();
      
      console.log('✅ TC-APP-PIDe-001 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-pin-button-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-PIDe-002: Verify "Gift" button functionality using POM', async ({ page, context }) => {
    try {
      console.log('Starting test: TC-APP-PIDe-002');
      
      // Navigate to app and login
      await page.goto('https://app.livesharenow.com/');
      const success = await loginPage.authenticateWithRetry(context);
      expect(success, 'Authentication should be successful').toBeTruthy();

      // Navigate to event and click on first image using POM
      await imageDetailPage.navigateToEventAndImage('tuanhay_test_event');

      // Verify gift button functionality using POM method
      const buttonChanged = await imageDetailPage.verifyGiftButtonFunctionality();
      
      console.log('✅ TC-APP-PIDe-002 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-gift-button-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-PIDe-003: Verify "Vertical Ellipsis" button functionality using POM', async ({ page, context }) => {
    try {
      console.log('Starting test: TC-APP-PIDe-003');
      
      // Navigate to app and login
      await page.goto('https://app.livesharenow.com/');
      const success = await loginPage.authenticateWithRetry(context);
      expect(success, 'Authentication should be successful').toBeTruthy();

      // Navigate to event and click on first image using POM
      await imageDetailPage.navigateToEventAndImage('tuanhay_test_event');

      // Verify ellipsis button functionality using POM method
      const menuVisible = await imageDetailPage.verifyEllipsisButtonFunctionality();
      
      console.log('✅ TC-APP-PIDe-003 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-ellipsis-button-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-PIDe-003A: Check "edit" function in vertical ellipsis button using POM', async ({ page, context }) => {
    try {
      console.log('Starting test: TC-APP-PIDe-003A');
      
      // Navigate to app and login
      await page.goto('https://app.livesharenow.com/');
      const success = await loginPage.authenticateWithRetry(context);
      expect(success, 'Authentication should be successful').toBeTruthy();

      // Navigate to event and click on first image using POM
      await imageDetailPage.navigateToEventAndImage('tuanhay_test_event');

      // Click ellipsis button first
      await imageDetailPage.clickEllipsisButton();

      // Verify edit functionality using POM method
      const result = await imageDetailPage.verifyEditFunctionality();
      
      console.log('✅ TC-APP-PIDe-003A completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-edit-function-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-PIDe-003B: Check "delete" function in vertical ellipsis button using POM', async ({ page, context }) => {
    try {
      console.log('Starting test: TC-APP-PIDe-003B');
      
      // Navigate to app and login
      await page.goto('https://app.livesharenow.com/');
      const success = await loginPage.authenticateWithRetry(context);
      expect(success, 'Authentication should be successful').toBeTruthy();

      // Navigate to event and click on first image using POM
      await imageDetailPage.navigateToEventAndImage('tuanhay_test_event');

      // Click ellipsis button first
      await imageDetailPage.clickEllipsisButton();

      // Verify delete functionality using POM method
      const confirmDialogVisible = await imageDetailPage.verifyDeleteFunctionality();
      
      console.log('✅ TC-APP-PIDe-003B completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-delete-function-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-PIDe-004: Verify "Search" button functionality using POM', async ({ page, context }) => {
    try {
      console.log('Starting test: TC-APP-PIDe-004');
      
      // Navigate to app and login
      await page.goto('https://app.livesharenow.com/');
      const success = await loginPage.authenticateWithRetry(context);
      expect(success, 'Authentication should be successful').toBeTruthy();

      // Navigate to event and click on first image using POM
      await imageDetailPage.navigateToEventAndImage('tuanhay_test_event');

      // Verify search button functionality using POM method
      const result = await imageDetailPage.verifySearchButtonFunctionality();
      
      if (!result.found) {
        console.log('Search/crop button not found - skipping test');
        return;
      }
      
      console.log('✅ TC-APP-PIDe-004 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-search-button-${Date.now()}.png`) });
      throw error;
    }
  });
}); 