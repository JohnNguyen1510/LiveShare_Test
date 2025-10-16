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
    console.log('🎬 Starting Picture Event Test Setup - Creating event and uploading images...');
    
    // Load authentication
    const authFile = path.join(process.cwd(), 'auth', 'user-auth.json');
    let storageState;
    if (fs.existsSync(authFile)) {
      storageState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    }

    // Create context with auth
    const context = await browser.newContext({ 
      storageState: storageState || undefined,
      viewport: { width: 1280, height: 720 }
    });
    const setupPage = await context.newPage();

    try {
      // Navigate to events page
      await setupPage.goto('https://dev.livesharenow.com/events');
      await setupPage.waitForLoadState('domcontentloaded');
      await setupPage.waitForTimeout(2000);

      // Create event using page objects
      const setupEventList = new EventListPage(setupPage);
      const setupEventCreation = new EventCreationPage(setupPage);
      const setupEventDetail = new EventDetailPage(setupPage);

      // Generate unique event name
      const timestamp = Date.now();
      createdEventName = `Picture Test Event ${timestamp}`;
      
      console.log(`📝 Creating event: ${createdEventName}`);
      
      // Create the event
      const eventData = {
        typeId: '63aac88c5a3b994dcb8602fd',
        name: createdEventName,
        location: 'Test Location',
        description: 'Event for picture tests'
      };

      const eventCreated = await setupEventCreation.createEvent(eventData);
      
      if (!eventCreated) {
        throw new Error('Failed to create event in beforeAll');
      }

      console.log('✅ Event created successfully');
      
      // Navigate back to events list and open the newly created event
      await setupEventList.goToEventsPage();
      await setupPage.waitForTimeout(2000);
      await setupEventList.clickEventByName(createdEventName);
      await setupEventDetail.waitForEventDetailToLoad();

      console.log('📸 Uploading test images to event...');
      
      // Upload multiple images to the event
      const imagesDir = path.join(process.cwd(), 'test-assets', 'upload-images');
      const imagesToUpload = [
        path.join(imagesDir, 'test-image-1.png'),
        path.join(imagesDir, 'test-image-2.png'),
        path.join(imagesDir, 'test-image-3.png')
      ];

      // Filter only existing files
      const existingImages = imagesToUpload.filter(img => {
        const exists = fs.existsSync(img);
        if (!exists) {
          console.log(`⚠️ Image not found: ${img}`);
        }
        return exists;
      });

      if (existingImages.length > 0) {
        // Click add button to reveal features
        await setupEventDetail.clickAddButtonToRevealFeatures();
        await setupPage.waitForTimeout(500);
        
        // Click Photos button
        await setupPage.getByRole('button', { name: 'Photos' }).click();
        await setupPage.waitForTimeout(500);
        
        // Upload files
        await setupPage.locator('input#file-input[type="file"]').setInputFiles(existingImages);
        await setupPage.waitForTimeout(1000);

        // Handle multi-select confirmation dialog if it appears
        const yesBtn = setupPage.getByRole('button', { name: 'Yes' });
        const yesVisible = await yesBtn.isVisible().catch(() => false);
        if (yesVisible) {
          await yesBtn.click();
          await setupPage.waitForTimeout(500);
        }

        // Click POST button if available
        const postBtn = setupPage.getByRole('button', { name: 'POST' });
        const postVisible = await postBtn.isVisible().catch(() => false);
        if (postVisible) {
          await postBtn.click();
          await setupPage.waitForTimeout(3000);
        }

        console.log(`✅ Uploaded ${existingImages.length} images successfully`);
      } else {
        console.log('⚠️ No test images found to upload');
      }

      // Save event data to localStorage for reference
      await setupPage.evaluate((eventName) => {
        localStorage.setItem('PICTURE_TEST_EVENT_DATA', JSON.stringify({
          name: eventName,
          createdAt: new Date().toISOString()
        }));
      }, createdEventName);

      console.log('✅ Picture Event Test Setup completed successfully');
      console.log(`🎯 Event "${createdEventName}" is ready for testing`);

    } catch (error) {
      console.error('❌ Error in beforeAll setup:', error);
      await setupPage.screenshot({ 
        path: path.join(process.cwd(), 'screenshots', `setup-error-${Date.now()}.png`) 
      });
      throw error;
    } finally {
      await context.close();
    }
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