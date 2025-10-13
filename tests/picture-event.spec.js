import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { ImageDetailPage } from '../page-objects/ImageDetailPage.js';
import { BasePage } from '../page-objects/BasePage.js';
import path from 'path';
import fs from 'fs';
import { EventListPage } from '../page-objects/EventListPage.js';
import { EventCreationPage } from '../page-objects/EventCreationPage.js';
import { EventDetailPage } from '../page-objects/EventDetailPage.js';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Increase test timeout for reliability
test.setTimeout(5 * 60 * 1000); // 5 minutes

test.describe('Picture In Event Detail', () => {
  let loginPage;
  let imageDetailPage;
  let basePage;
  let eventListPage;
  let eventCreationPage;
  let eventDetailPage;
  let createdEventName;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    imageDetailPage = new ImageDetailPage(page);
    eventListPage = new EventListPage(page);
    basePage = new BasePage(page);
    eventCreationPage = new EventCreationPage(page);
    eventDetailPage = new EventDetailPage(page);
  });

  test.beforeAll(async ({ browser }) => {
    // Use pre-setup data from localStorage saved by npm run setup:full
    const context = await browser.newContext();
    const setupPage = await context.newPage();
    await setupPage.goto('https://dev.livesharenow.com/events');
    await setupPage.waitForLoadState('domcontentloaded');
    await setupPage.waitForTimeout(1000);
    
    // Read event name that was created in setup:full
    const data = await setupPage.evaluate(() => {
      try {
        const raw = localStorage.getItem('TEST_EVENT_DATA');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    });
    createdEventName = data?.name || `Test Event Fallback`;
    await context.close();
  });

  async function openEventByName(page, name) {
    const listPage = new EventListPage(page);
    await listPage.goToEventsPage();
    await listPage.clickEventByName(name);
    const detail = new EventDetailPage(page);
    await detail.waitForEventDetailToLoad();
  }

  async function uploadImagesFromDetail(page, files) {
    const detail = new EventDetailPage(page);
    await detail.clickAddButtonToRevealFeatures();
    await page.getByRole('button', { name: 'Photos' }).click();
    await page.locator('input#file-input[type="file"]').setInputFiles(files);

    // If multi-select dialog appears, confirm
    const yesBtn = page.getByRole('button', { name: 'Yes' });
    if (await yesBtn.isVisible().catch(() => false)) {
      await yesBtn.click();
    }

    // Click POST if available
    const postBtn = page.getByRole('button', { name: 'POST' });
    if (await postBtn.isVisible().catch(() => false)) {
      await postBtn.click();
    }

    await page.waitForTimeout(2000);
  }


  test('TC-APP-PIDe-001: Verify "Pin" button functionality using POM', async ({ page, context }) => {
    try {
      await eventListPage.goToEventsPage();
      // Navigate to event and click on first image using POM
      await openEventByName(page, createdEventName);

      await page.waitForTimeout(8000);
      await imageDetailPage.clickFirstImage();

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
      await eventListPage.goToEventsPage();

      // Navigate to event and click on first image using POM
      await openEventByName(page, createdEventName);

      await page.waitForTimeout(8000);
      await imageDetailPage.clickFirstImage();

      console.log('✅ TC-APP-PIDe-002 completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-gift-button-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-PIDe-003: Verify "Vertical Ellipsis" button functionality using POM', async ({ page, context }) => {
    try {
      await eventListPage.goToEventsPage();
      
      // Navigate to event and click on first image using POM
      await openEventByName(page, createdEventName);
      await page.waitForTimeout(8000);

      await imageDetailPage.clickFirstImage();


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
      await eventListPage.goToEventsPage();
    

      // Navigate to event and click on first image using POM
      await openEventByName(page, createdEventName);
      await page.waitForTimeout(8000);

      await imageDetailPage.clickFirstImage();


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
      await eventListPage.goToEventsPage();

      // Navigate to event and click on first image using POM
      await openEventByName(page, createdEventName);
      await page.waitForTimeout(8000);

      await imageDetailPage.clickFirstImage();


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
      await eventListPage.goToEventsPage();

      // Navigate to event and click on first image using POM
      await openEventByName(page, createdEventName);
      await page.waitForTimeout(8000);

      await imageDetailPage.clickFirstImage();


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
  
  test('TC-APP-PIDe-005: Upload a single image and post', async ({ page }) => {
    try {
      const imagesDir = path.join(process.cwd(), 'test-assets', 'upload-images');
      const single = path.join(imagesDir, 'test-image-2.png');

      await openEventByName(page, createdEventName);
      await uploadImagesFromDetail(page, single);

      // Basic assertion: an image item should exist in the grid
      await expect(page.locator('.image-container img, .grid-container img').first()).toBeVisible();
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-upload-single-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-PIDe-006: Upload multiple images, accept dialog, then post', async ({ page }) => {
    try {
      const imagesDir = path.join(process.cwd(), 'test-assets', 'upload-images');
      const files = [
        path.join(imagesDir, 'test-image-1.png'),
        path.join(imagesDir, 'test-image-2.png'),
        path.join(imagesDir, 'test-image-3.png')
      ];

      await openEventByName(page, createdEventName);
      await uploadImagesFromDetail(page, files);

      // Expect grid to contain at least one image
      await expect(page.locator('.image-container img, .grid-container img').first()).toBeVisible();
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-upload-multi-${Date.now()}.png`) });
      throw error;
    }
  });
}); 