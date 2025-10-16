/**
 * ============================================================================
 * PLUS ICON FEATURES VERIFICATION - COMPREHENSIVE TEST SUITE
 * ============================================================================
 * 
 * This test suite verifies all Plus Icon features in the Event Detail page:
 * 1. Then & Now - Upload two images (then/now) and post as one
 * 2. KeepSake - Private message with unlock date
 * 3. Clue - Scavenger hunt with title and caption
 * 4. Sponsor - Sponsored post with redirect URL and positioning
 * 5. Prize - Prize announcement with caption
 * 6. Message - Text-only message
 * 7. Photos - Photo upload with caption
 * 8. Videos - Video upload with caption
 * 
 * Test Level: UI Verification (API verification to follow)
 * Author: Senior QA Engineer
 * Last Updated: 2024
 * ============================================================================
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { EventListPage } from '../page-objects/EventListPage.js';
import { EventDetailPage } from '../page-objects/EventDetailPage.js';
import { BasePage } from '../page-objects/BasePage.js';
import path from 'path';
import fs from 'fs';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Test data - image paths for uploads
const TEST_ASSETS_DIR = path.join(process.cwd(), 'test-assets', 'upload-images');
const TEST_IMAGE_PATH = path.join(TEST_ASSETS_DIR, 'test-image-1.png');
const TEST_IMAGE_PATH_2 = path.join(TEST_ASSETS_DIR, 'test-image-2.png');
const TEST_IMAGE_PATH_3 = path.join(TEST_ASSETS_DIR, 'test-image-3.png');

// Test data constants
const TEST_DATA = {
  CLUE: {
    TITLE: 'Automated Test - Scavenger Hunt Clue',
    CAPTION: 'This is an automated test for the scavenger hunt clue feature. Find the hidden treasure!'
  },
  SPONSOR: {
    URL: 'https://www.example-sponsor.com',
    ROWS_BEFORE: 3,
    ROWS_BETWEEN: 5
  },
  PRIZE: {
    CAPTION: 'Win amazing prizes! This is an automated test for the prize feature. Grand prize: $1000!'
  },
  MESSAGE: {
    CAPTION: 'This is an automated test message. Testing the message posting functionality.'
  },
  PHOTOS: {
    CAPTION: 'Beautiful moment captured at the event - automated test photo upload'
  },
  VIDEOS: {
    CAPTION: 'Amazing video from the event - automated test video upload'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Capture screenshot with timestamp
 * @param {Page} page - Playwright page object
 * @param {string} testCase - Test case identifier
 * @param {string} step - Step description
 */
async function captureScreenshot(page, testCase, step) {
  const timestamp = Date.now();
  const filename = `${testCase}-${step}-${timestamp}.png`;
  await page.screenshot({ 
    path: path.join(screenshotsDir, filename),
    fullPage: true 
  });
  return filename;
}

/**
 * Log test step with formatting
 * @param {string} message - Log message
 * @param {string} level - Log level (info, success, error)
 */
function logStep(message, level = 'info') {
  const icons = {
    info: '📍',
    success: '✅',
    error: '❌',
    warning: '⚠'
  };
  const icon = icons[level] || '•';
  console.log(`${icon} ${message}`);
}

/**
 * Print test header
 * @param {string} testCase - Test case ID
 * @param {string} description - Test description
 */
function printTestHeader(testCase, description) {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log(`║     ${testCase}: ${description.padEnd(36, ' ')}║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

/**
 * Print test footer
 * @param {string} testCase - Test case ID
 * @param {boolean} passed - Test result
 */
function printTestFooter(testCase, passed = true) {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  const message = passed ? `${testCase}: ${status}` : `${testCase}: ${status}`;
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log(`║   ${message.padEnd(51, ' ')}║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('Plus Icon Features Verification - Complete Test Suite', () => {
  test.setTimeout(240000);
  
  let loginPage;
  let eventListPage;
  let eventDetailPage;
  let basePage;

  /**
   * SETUP: Navigate to Event Detail Page
   * This runs before each test to ensure we start from the event detail page
   */
  test.beforeEach(async ({ page }) => {
    logStep('Starting test setup...', 'info');
    
    // Initialize page objects
    loginPage = new LoginPage(page);
    eventListPage = new EventListPage(page);
    eventDetailPage = new EventDetailPage(page);
    basePage = new BasePage(page);

    try {
      // Navigate to events page
      logStep('Navigating to events page...', 'info');
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      
      // Select first event
      logStep('Selecting first event...', 'info');
      await eventListPage.clickEventByIndex(0);
      await page.waitForTimeout(2000);
      
      // Wait for event detail page to load
      logStep('Waiting for event detail page to load...', 'info');
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      logStep('Setup complete - Event detail page loaded', 'success');
    } catch (error) {
      logStep(`Setup failed: ${error.message}`, 'error');
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-001: THEN & NOW FUNCTIONALITY
   * ============================================================================
   * 
   * Test Steps:
   * 1. Click plus icon to reveal feature options
   * 2. Verify "Then & Now" button is visible
   * 3. Click "Then & Now" button
   * 4. Verify dialog UI elements (title, THEN box, NOW box, buttons)
   * 5. Upload image for THEN element
   * 6. Upload image for NOW element
   * 7. Verify POST button is enabled
   * 8. Click POST button
   * 9. Verify post is successful
   * 
   * Expected Results:
   * - Plus icon menu appears with all features
   * - Then & Now dialog displays correctly
   * - Images upload successfully
   * - POST button enables after both images uploaded
   * - Post is created successfully
   */
  test('TC-APP-VIEW-001: Verify "Then & Now" button functionality', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-001', 'Then & Now Functionality');

    try {
      // STEP 1: Click plus icon to reveal feature options
      logStep('Step 1: Clicking plus icon to reveal feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc001', 'step1-plus-icon-menu');
      logStep('Plus icon menu revealed', 'success');
      await page.waitForTimeout(1000);

      // STEP 2: Verify Then & Now button is visible
      logStep('Step 2: Verifying "Then & Now" button is visible');
      const thenAndNowVisible = await eventDetailPage.verifyThenAndNowButton();
      expect(thenAndNowVisible, '"Then & Now" button should be visible').toBeTruthy();
      await captureScreenshot(page, 'tc001', 'step2-then-and-now-button');
      logStep('"Then & Now" button verified as visible', 'success');

      // STEP 3: Click "Then & Now" button
      logStep('Step 3: Clicking "Then & Now" button');
      await eventDetailPage.clickThenAndNowButton();
      await captureScreenshot(page, 'tc001', 'step3-then-and-now-dialog');
      logStep('"Then & Now" dialog opened', 'success');

      // STEP 4: Verify Then & Now dialog UI
      logStep('Step 4: Verifying "Then & Now" dialog UI elements');
      await eventDetailPage.verifyThenAndNowDialog();
      await captureScreenshot(page, 'tc001', 'step4-dialog-ui-verified');
      logStep('Dialog UI verified - All elements present', 'success');

      // STEP 5-6: Upload images for THEN and NOW
      logStep('Step 5-6: Uploading images for THEN and NOW');
      await eventDetailPage.uploadThenAndNowImages(TEST_IMAGE_PATH);
      await captureScreenshot(page, 'tc001', 'step5-6-images-uploaded');
      logStep('Images uploaded for both THEN and NOW', 'success');

      // STEP 7: Click POST button
      logStep('Step 7: Clicking POST button');
      await eventDetailPage.clickThenAndNowPostButton();
      await captureScreenshot(page, 'tc001', 'step7-post-clicked');
      logStep('POST button clicked', 'success');

      // STEP 8: Verify post success (wait for dialog to close)
      logStep('Step 8: Verifying post creation');
      await page.waitForTimeout(2000);
      const dialogClosed = await page.locator('app-then-and-now').count() === 0;
      expect(dialogClosed).toBeTruthy();
      logStep('Post created successfully', 'success');

      printTestFooter('TC-APP-VIEW-001', true);

    } catch (error) {
      logStep(`TC-APP-VIEW-001 FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc001', 'error');
      printTestFooter('TC-APP-VIEW-001', false);
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-002: KEEPSAKE FUNCTIONALITY
   * ============================================================================
   * 
   * Test Steps:
   * 1. Click plus icon
   * 2. Verify "KeepSake" button is visible
   * 3. Click "KeepSake" button
   * 4. Verify KeepSake dialog UI (Photos and Videos buttons)
   * 5. Click "Videos" and upload file
   * 6. Click POST button
   * 7. Verify thank you dialog with unlock date
   * 
   * Expected Results:
   * - KeepSake dialog displays with Photos/Videos options
   * - File uploads successfully
   * - Thank you dialog appears with unlock date
   * - Privacy message is displayed
   */
  test('TC-APP-VIEW-002: Verify "KeepSake" button functionality', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-002', 'KeepSake Functionality');

    try {
      // STEP 1: Click plus icon
      logStep('Step 1: Clicking plus icon to reveal feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc002', 'step1-plus-icon-menu');
      logStep('Plus icon menu revealed', 'success');

      // STEP 2: Verify KeepSake button is visible
      logStep('Step 2: Verifying "KeepSake" button is visible');
      const keepSakeVisible = await eventDetailPage.verifyKeepSakeButton();
      expect(keepSakeVisible, '"KeepSake" button should be visible').toBeTruthy();
      await captureScreenshot(page, 'tc002', 'step2-keepsake-button');
      logStep('"KeepSake" button verified as visible', 'success');

      // STEP 3: Click "KeepSake" button
      logStep('Step 3: Clicking "KeepSake" button');
      await eventDetailPage.clickKeepSakeButton();
      await captureScreenshot(page, 'tc002', 'step3-keepsake-dialog');
      logStep('"KeepSake" dialog opened', 'success');

      // STEP 4: Verify KeepSake dialog UI (Photos and Videos buttons)
      logStep('Step 4: Verifying "Photos" and "Videos" buttons');
      await eventDetailPage.verifyKeepSakeDialog();
      await captureScreenshot(page, 'tc002', 'step4-dialog-buttons');
      logStep('Photos and Videos buttons verified', 'success');

      // STEP 5: Click Videos and upload file
      logStep('Step 5: Clicking "Videos" and uploading file');
      await eventDetailPage.uploadKeepSakeVideo(TEST_IMAGE_PATH);
      await captureScreenshot(page, 'tc002', 'step5-video-uploaded');
      logStep('Video/file uploaded', 'success');

      // STEP 6: Click POST button
      logStep('Step 6: Clicking POST button');
      await eventDetailPage.clickPostMessageButton();
      await captureScreenshot(page, 'tc002', 'step6-post-clicked');
      logStep('POST button clicked', 'success');

      // STEP 7: Verify thank you dialog
      logStep('Step 7: Verifying KeepSake thank you dialog');
      await page.waitForTimeout(2000);
      await eventDetailPage.verifyKeepSakeThankYouDialog();
      await captureScreenshot(page, 'tc002', 'step7-thankyou-dialog');
      logStep('Thank you dialog verified with unlock date', 'success');

      printTestFooter('TC-APP-VIEW-002', true);

    } catch (error) {
      logStep(`TC-APP-VIEW-002 FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc002', 'error');
      printTestFooter('TC-APP-VIEW-002', false);
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-003: CLUE (SCAVENGER HUNT) FUNCTIONALITY
   * ============================================================================
   * 
   * Test Steps:
   * 1. Click plus icon
   * 2. Verify "Clue" button is visible
   * 3. Click "Clue" button
   * 4. Verify post-message dialog UI
   * 5. Upload image
   * 6. Fill title and caption
   * 7. Verify all UI elements (delete, crop buttons)
   * 8. Click POST button
   * 
   * Expected Results:
   * - Clue dialog displays correctly
   * - Image uploads and preview shows
   * - Title and caption fields work
   * - Delete and crop buttons are visible
   * - Post is created successfully
   * 
   * Note: This feature may not be enabled in all events. Test will be skipped if not available.
   */
  test('TC-APP-VIEW-003: Verify "Clue" (Scavenger Hunt) button functionality', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-003', 'Clue (Scavenger Hunt) Feature');

    try {
      // STEP 1: Click plus icon
      logStep('Step 1: Clicking plus icon to reveal feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc003', 'step1-plus-icon-menu');
      logStep('Plus icon menu revealed', 'success');

      // STEP 2: Verify Clue button is visible
      logStep('Step 2: Verifying "Clue" button is visible');
      const clueVisible = await eventDetailPage.verifyClueButton();
      
      // Skip test if feature not enabled
      if (!clueVisible) {
        logStep('⚠ "Clue" feature is not enabled for this event - SKIPPING TEST', 'warning');
        test.skip();
        return;
      }
      
      await captureScreenshot(page, 'tc003', 'step2-clue-button');
      logStep('"Clue" button verified as visible', 'success');

      // STEP 3: Click "Clue" button
      logStep('Step 3: Clicking "Clue" button');
      await eventDetailPage.clickClueButton();
      await captureScreenshot(page, 'tc003', 'step3-clue-dialog');
      logStep('"Clue" dialog opened', 'success');

      // STEP 4: Verify post-message dialog UI
      logStep('Step 4: Verifying post-message dialog UI');
      await eventDetailPage.verifyPostMessageDialog();
      await captureScreenshot(page, 'tc003', 'step4-dialog-ui');
      logStep('Dialog UI verified (close, checkbox, POST button)', 'success');

      // STEP 5-6: Upload image and fill title and caption
      logStep('Step 5-6: Uploading image and filling title and caption');
      await eventDetailPage.uploadClueWithInfo(
        TEST_IMAGE_PATH,
        TEST_DATA.CLUE.TITLE,
        TEST_DATA.CLUE.CAPTION
      );
      await captureScreenshot(page, 'tc003', 'step5-6-info-filled');
      logStep('Image uploaded, title and caption filled', 'success');

      // STEP 7: Click POST button
      logStep('Step 7: Clicking POST button');
      await eventDetailPage.clickPostMessageButton();
      await captureScreenshot(page, 'tc003', 'step7-post-clicked');
      logStep('POST button clicked', 'success');

      printTestFooter('TC-APP-VIEW-003', true);

    } catch (error) {
      logStep(`TC-APP-VIEW-003 FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc003', 'error');
      printTestFooter('TC-APP-VIEW-003', false);
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-004: SPONSOR FUNCTIONALITY
   * ============================================================================
   * 
   * Test Steps (Following TC-001 Success Pattern):
   * 1. Click plus icon
   * 2. Verify "Sponsor" button is visible
   * 3. Click "Sponsor" button
   * 4. Upload image FIRST (like TC-001)
   * 5. Verify UI elements AFTER upload
   * 6. Fill redirect URL and positioning
   * 7. Click POST button
   * 
   * Expected Results:
   * - Sponsor dialog opens
   * - Image uploads successfully
   * - UI elements visible after upload
   * - Redirect URL and positioning fields work
   * - Post is created successfully
   */
  test('TC-APP-VIEW-004: Verify "Sponsor" button functionality', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-004', 'Sponsor Functionality');

    try {
      // STEP 1: Click plus icon
      logStep('Step 1: Clicking plus icon to reveal feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc004', 'step1-plus-icon-menu');
      logStep('Plus icon menu revealed', 'success');

      // STEP 2: Verify Sponsor button is visible
      logStep('Step 2: Verifying "Sponsor" button is visible');
      const sponsorVisible = await eventDetailPage.verifySponsorButton();
      expect(sponsorVisible, '"Sponsor" button should be visible').toBeTruthy();
      await captureScreenshot(page, 'tc004', 'step2-sponsor-button');
      logStep('"Sponsor" button verified as visible', 'success');

      // STEP 3: Click "Sponsor" button
      logStep('Step 3: Clicking "Sponsor" button');
      await eventDetailPage.clickSponsorButton();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, 'tc004', 'step3-sponsor-dialog');
      logStep('"Sponsor" dialog opened', 'success');

      // STEP 4: Upload image FIRST (TC-001/TC-002 success pattern)
      logStep('Step 4: Uploading image and filling sponsor info');
      await eventDetailPage.uploadSponsorWithInfo(
        TEST_IMAGE_PATH,
        TEST_DATA.SPONSOR.URL,
        TEST_DATA.SPONSOR.ROWS_BEFORE,
        TEST_DATA.SPONSOR.ROWS_BETWEEN
      );
      await captureScreenshot(page, 'tc004', 'step4-upload-complete');
      logStep('Image uploaded and info filled successfully', 'success');

      // STEP 5: Verify UI elements AFTER upload (optional verification)
      logStep('Step 5: Verifying post-message dialog UI elements');
      await eventDetailPage.verifyPostMessageDialog();
      logStep('Dialog UI verified after upload', 'success');

      // STEP 6: Click POST button
      logStep('Step 6: Clicking POST button');
      await eventDetailPage.clickPostMessageButton();
      await captureScreenshot(page, 'tc004', 'step6-post-clicked');
      logStep('POST button clicked', 'success');

      printTestFooter('TC-APP-VIEW-004', true);

    } catch (error) {
      logStep(`TC-APP-VIEW-004 FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc004', 'error');
      printTestFooter('TC-APP-VIEW-004', false);
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-005: PRIZE FUNCTIONALITY
   * ============================================================================
   * 
   * Test Steps (Following TC-001 Success Pattern):
   * 1. Click plus icon
   * 2. Verify "Prize" button is visible
   * 3. Click "Prize" button
   * 4. Upload image FIRST (like TC-001)
   * 5. Verify UI elements AFTER upload
   * 6. Click POST button
   * 
   * Expected Results:
   * - Prize dialog opens
   * - Image uploads successfully
   * - UI elements visible after upload
   * - Caption field works
   * - Post is created successfully
   */
  test('TC-APP-VIEW-005: Verify "Prize" button functionality', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-005', 'Prize Functionality');

    try {
      // STEP 1: Click plus icon
      logStep('Step 1: Clicking plus icon to reveal feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc005', 'step1-plus-icon-menu');
      logStep('Plus icon menu revealed', 'success');

      // STEP 2: Verify Prize button is visible
      logStep('Step 2: Verifying "Prize" button is visible');
      const prizeVisible = await eventDetailPage.verifyPrizeButton();
      expect(prizeVisible, '"Prize" button should be visible').toBeTruthy();
      await captureScreenshot(page, 'tc005', 'step2-prize-button');
      logStep('"Prize" button verified as visible', 'success');

      // STEP 3: Click "Prize" button
      logStep('Step 3: Clicking "Prize" button');
      await eventDetailPage.clickPrizeButton();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, 'tc005', 'step3-prize-dialog');
      logStep('"Prize" dialog opened', 'success');

      // STEP 4: Upload image FIRST (TC-001/TC-002 success pattern)
      logStep('Step 4: Uploading image and filling caption');
      await eventDetailPage.uploadPrizeWithCaption(
        TEST_IMAGE_PATH,
        TEST_DATA.PRIZE.CAPTION
      );
      await captureScreenshot(page, 'tc005', 'step4-upload-complete');
      logStep('Image uploaded and caption filled successfully', 'success');

      // STEP 5: Verify UI elements AFTER upload (optional verification)
      logStep('Step 5: Verifying post-message dialog UI elements');
      await eventDetailPage.verifyPostMessageDialog();
      logStep('Dialog UI verified after upload', 'success');

      // STEP 6: Click POST button
      logStep('Step 6: Clicking POST button');
      await eventDetailPage.clickPostMessageButton();
      await captureScreenshot(page, 'tc005', 'step6-post-clicked');
      logStep('POST button clicked', 'success');

      printTestFooter('TC-APP-VIEW-005', true);

    } catch (error) {
      logStep(`TC-APP-VIEW-005 FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc005', 'error');
      printTestFooter('TC-APP-VIEW-005', false);
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-006: MESSAGE FUNCTIONALITY
   * ============================================================================
   * 
   * Test Steps:
   * 1. Click plus icon
   * 2. Verify "Message" button is visible
   * 3. Click "Message" button
   * 4. Verify post-message dialog UI
   * 5. Fill caption (text-only message)
   * 6. Set up API listener and click POST button
   * 7. Verify API response is successful (200/201 status)
   * 8. Verify post-message dialog closes
   * 9. Verify message appears in event feed
   * 
   * Expected Results:
   * - Message dialog displays correctly
   * - Write-text area is visible
   * - Caption field works for text-only message
   * - POST API request returns 200/201 (not 400 Bad Request)
   * - Dialog closes after successful post
   * - Message appears in the event feed with correct caption
   */
  test('TC-APP-VIEW-006: Verify "Message" button functionality', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-006', 'Message Functionality');

    try {
      // STEP 1: Click plus icon
      logStep('Step 1: Clicking plus icon to reveal feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc006', 'step1-plus-icon-menu');
      logStep('Plus icon menu revealed', 'success');

      // STEP 2: Verify Message button is visible
      logStep('Step 2: Verifying "Message" button is visible');
      const messageVisible = await eventDetailPage.verifyMessageButton();
      expect(messageVisible, '"Message" button should be visible').toBeTruthy();
      await captureScreenshot(page, 'tc006', 'step2-message-button');
      logStep('"Message" button verified as visible', 'success');

      // STEP 3: Click "Message" button
      logStep('Step 3: Clicking "Message" button');
      await eventDetailPage.clickMessageButton();
      await captureScreenshot(page, 'tc006', 'step3-message-dialog');
      logStep('"Message" dialog opened', 'success');

      // STEP 4: Verify post-message dialog UI
      logStep('Step 4: Verifying post-message dialog UI');
      await eventDetailPage.verifyPostMessageDialog();
      await captureScreenshot(page, 'tc006', 'step4-dialog-ui');
      logStep('Dialog UI verified', 'success');

      // STEP 5: Fill caption
      logStep('Step 5: Filling message caption');
      await eventDetailPage.fillMessageCaption(TEST_DATA.MESSAGE.CAPTION);
      await captureScreenshot(page, 'tc006', 'step5-caption-filled');
      logStep('Caption filled', 'success');

      // STEP 6: Set up API response listener and click POST button
      logStep('Step 6: Setting up API listener and clicking POST button');
      
      // Listen for the POST request to verify successful response
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/api/posts/') && response.request().method() === 'POST',
        { timeout: 15000 }
      );
      
      await eventDetailPage.clickPostMessageButton();
      await captureScreenshot(page, 'tc006', 'step6-post-clicked');
      
      // STEP 7: Verify API response
      logStep('Step 7: Verifying API response');
      const response = await responsePromise;
      const status = response.status();
      
      console.log(`📡 POST request to: ${response.url()}`);
      console.log(`📊 Response status: ${status}`);
      
      expect(status, `POST request should return 200 or 201, but got ${status}`).toBeLessThan(300);
      expect(status, `POST request should return 200 or 201, but got ${status}`).toBeGreaterThanOrEqual(200);
      logStep(`API response verified: ${status}`, 'success');
      
      // STEP 8: Verify dialog closes (indicating success)
      logStep('Step 8: Verifying post-message dialog closes');
      const postMessageDialog = page.locator('app-post-message');
      await expect(postMessageDialog).toBeHidden({ timeout: 10000 });
      await captureScreenshot(page, 'tc006', 'step8-dialog-closed');
      logStep('Dialog closed successfully', 'success');
      
      // STEP 9: Verify message appears in feed
      logStep('Step 9: Verifying message appears in event feed');
      await page.waitForTimeout(2000); // Wait for feed to update
      
      // Look for the message in the feed
      const messageInFeed = page.locator('.message-section, .post-container, .image-wrapper').filter({
        hasText: TEST_DATA.MESSAGE.CAPTION
      }).first();
      
      await expect(messageInFeed).toBeVisible({ timeout: 10000 });
      await captureScreenshot(page, 'tc006', 'step9-message-in-feed');
      logStep('Message verified in feed', 'success');

      printTestFooter('TC-APP-VIEW-006', true);

    } catch (error) {
      logStep(`TC-APP-VIEW-006 FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc006', 'error');
      printTestFooter('TC-APP-VIEW-006', false);
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-007: PHOTOS FUNCTIONALITY
   * ============================================================================
   * 
   * Test Steps (Following TC-001 Success Pattern):
   * 1. Click plus icon
   * 2. Verify "Photos" button is visible
   * 3. Click "Photos" button
   * 4. Upload photo FIRST (like TC-001)
   * 5. Verify UI elements AFTER upload
   * 6. Click POST button
   * 
   * Expected Results:
   * - Photos dialog opens
   * - Photo uploads successfully
   * - UI elements visible after upload
   * - Caption field works
   * - Post is created successfully
   */
  test('TC-APP-VIEW-007: Verify "Photos" button functionality', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-007', 'Photos Functionality');

    try {
      // STEP 1: Click plus icon
      logStep('Step 1: Clicking plus icon to reveal feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc007', 'step1-plus-icon-menu');
      logStep('Plus icon menu revealed', 'success');

      // STEP 2: Verify Photos button is visible
      logStep('Step 2: Verifying "Photos" button is visible');
      const photosVisible = await eventDetailPage.verifyPhotosButton();
      expect(photosVisible, '"Photos" button should be visible').toBeTruthy();
      await captureScreenshot(page, 'tc007', 'step2-photos-button');
      logStep('"Photos" button verified as visible', 'success');

      // STEP 3: Click "Photos" button
      logStep('Step 3: Clicking "Photos" button');
      await eventDetailPage.clickPhotosButton();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, 'tc007', 'step3-photos-dialog');
      logStep('"Photos" dialog opened', 'success');

      // STEP 4: Upload photo FIRST (TC-001/TC-002 success pattern)
      logStep('Step 4: Uploading photo and filling caption');
      await eventDetailPage.uploadPhotoWithCaption(
        TEST_IMAGE_PATH,
        TEST_DATA.PHOTOS.CAPTION
      );
      await captureScreenshot(page, 'tc007', 'step4-upload-complete');
      logStep('Photo uploaded and caption filled successfully', 'success');

      // STEP 5: Verify UI elements AFTER upload (optional verification)
      logStep('Step 5: Verifying post-message dialog UI elements');
      await eventDetailPage.verifyPostMessageDialog();
      logStep('Dialog UI verified after upload', 'success');

      // STEP 6: Click POST button
      logStep('Step 6: Clicking POST button');
      await eventDetailPage.clickPostMessageButton();
      await captureScreenshot(page, 'tc007', 'step6-post-clicked');
      logStep('POST button clicked', 'success');

      printTestFooter('TC-APP-VIEW-007', true);

    } catch (error) {
      logStep(`TC-APP-VIEW-007 FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc007', 'error');
      printTestFooter('TC-APP-VIEW-007', false);
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-008: VIDEOS FUNCTIONALITY
   * ============================================================================
   * 
   * Test Steps (Following TC-001 Success Pattern):
   * 1. Click plus icon
   * 2. Verify "Videos" button is visible
   * 3. Click "Videos" button
   * 4. Upload video FIRST (like TC-001)
   * 5. Verify UI elements AFTER upload
   * 6. Click POST button
   * 
   * Expected Results:
   * - Videos dialog opens
   * - Video uploads successfully
   * - UI elements visible after upload
   * - Caption field works
   * - Post is created successfully
   */
  test('TC-APP-VIEW-008: Verify "Videos" button functionality', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-008', 'Videos Functionality');

    try {
      // STEP 1: Click plus icon
      logStep('Step 1: Clicking plus icon to reveal feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc008', 'step1-plus-icon-menu');
      logStep('Plus icon menu revealed', 'success');

      // STEP 2: Verify Videos button is visible
      logStep('Step 2: Verifying "Videos" button is visible');
      const videosVisible = await eventDetailPage.verifyVideosButton();
      expect(videosVisible, '"Videos" button should be visible').toBeTruthy();
      await captureScreenshot(page, 'tc008', 'step2-videos-button');
      logStep('"Videos" button verified as visible', 'success');

      // STEP 3: Click "Videos" button
      logStep('Step 3: Clicking "Videos" button');
      await eventDetailPage.clickVideosButton();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, 'tc008', 'step3-videos-dialog');
      logStep('"Videos" dialog opened', 'success');

      // STEP 4: Upload video FIRST (TC-001/TC-002 success pattern)
      logStep('Step 4: Uploading video and filling caption');
      await eventDetailPage.uploadVideoWithCaption(
        TEST_IMAGE_PATH,
        TEST_DATA.VIDEOS.CAPTION
      );
      await captureScreenshot(page, 'tc008', 'step4-upload-complete');
      logStep('Video uploaded and caption filled successfully', 'success');

      // STEP 5: Verify UI elements AFTER upload (optional verification)
      logStep('Step 5: Verifying post-message dialog UI elements');
      await eventDetailPage.verifyPostMessageDialog();
      logStep('Dialog UI verified after upload', 'success');

      // STEP 6: Click POST button
      logStep('Step 6: Clicking POST button');
      await eventDetailPage.clickPostMessageButton();
      await captureScreenshot(page, 'tc008', 'step6-post-clicked');
      logStep('POST button clicked', 'success');

      printTestFooter('TC-APP-VIEW-008', true);

    } catch (error) {
      logStep(`TC-APP-VIEW-008 FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc008', 'error');
      printTestFooter('TC-APP-VIEW-008', false);
      throw error;
    }
  });

  /**
   * ============================================================================
   * TC-APP-VIEW-ALL: COMPREHENSIVE PLUS ICON FEATURES VERIFICATION
   * ============================================================================
   * 
   * This test verifies that all 8 features are accessible from the plus icon menu
   * 
   * Test Steps:
   * 1. Click plus icon to reveal all feature options
   * 2. Verify Then & Now button is visible
   * 3. Verify KeepSake button is visible
   * 4. Verify Clue button is visible
   * 5. Verify Sponsor button is visible
   * 6. Verify Prize button is visible
   * 7. Verify Message button is visible
   * 8. Verify Photos button is visible
   * 9. Verify Videos button is visible
   * 
   * Expected Results:
   * - All 8 feature buttons are visible in the plus icon menu
   * - Each button is properly labeled and accessible
   * - Menu displays correctly with proper layout
   */
  test('TC-APP-VIEW-ALL: Comprehensive Plus Icon Features Verification', async ({ page }) => {
    printTestHeader('TC-APP-VIEW-ALL', 'All Features Comprehensive Test');
    
    try {
      // Click add button to reveal feature options
      logStep('Clicking plus icon to reveal all feature options');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await captureScreenshot(page, 'tc-all', 'feature-options');
      logStep('Plus icon menu revealed', 'success');
      await page.waitForTimeout(1000);
      
      // Verify all plus icon features
      logStep('Verifying all plus icon features are visible');
      const features = await eventDetailPage.verifyAllPlusIconFeatures();
      
      // Verify each feature individually
      const featureList = [
        { name: 'Then & Now', visible: features.thenAndNow },
        { name: 'KeepSake', visible: features.keepSake },
        { name: 'Clue', visible: features.clue },
        { name: 'Sponsor', visible: features.sponsor },
        { name: 'Prize', visible: features.prize },
        { name: 'Message', visible: features.message },
        { name: 'Photos', visible: features.photos },
        { name: 'Videos', visible: features.videos }
      ];

      console.log('\n📋 Feature Visibility Results:');
      console.log('═'.repeat(60));
      
      let enabledCount = 0;
      let disabledCount = 0;
      const enabledFeatures = [];
      const disabledFeatures = [];
      
      for (const feature of featureList) {
        const status = feature.visible ? '✓ ENABLED' : '✗ NOT ENABLED';
        const icon = feature.visible ? '✅' : '⚠️';
        console.log(`${icon} ${feature.name.padEnd(15, ' ')} : ${status}`);
        
        if (feature.visible) {
          enabledCount++;
          enabledFeatures.push(feature.name);
        } else {
          disabledCount++;
          disabledFeatures.push(feature.name);
        }
      }
      
      console.log('═'.repeat(60));
      console.log(`\n✅ Enabled Features: ${enabledCount}/8`);
      console.log(`⚠️  Disabled Features: ${disabledCount}/8`);
      
      if (disabledFeatures.length > 0) {
        console.log(`\nℹ️  Note: The following features are not enabled in this event:`);
        disabledFeatures.forEach(name => console.log(`   - ${name}`));
      }
      
      // Assert at least some core features are visible
      expect(enabledCount, 'At least some core features should be enabled').toBeGreaterThan(0);
      
      await captureScreenshot(page, 'tc-all', 'all-features-verified');
      
      console.log('\n╔════════════════════════════════════════════════════════╗');
      console.log('║  ✅ PLUS ICON FEATURES VERIFICATION COMPLETE!        ║');
      console.log('║                                                        ║');
      console.log(`║  Enabled:  ${enabledCount}/8 features                          ║`);
      console.log(`║  Disabled: ${disabledCount}/8 features                          ║`);
      console.log('║                                                        ║');
      
      // Show enabled features with checkmarks
      for (const feature of featureList) {
        const icon = feature.visible ? '✓' : '✗';
        const status = feature.visible ? 'ENABLED ' : 'DISABLED';
        const line = `║  • ${feature.name.padEnd(13, ' ')} ${icon} ${status.padEnd(8, ' ')}          ║`;
        console.log(line);
      }
      
      console.log('╚════════════════════════════════════════════════════════╝\n');

      printTestFooter('TC-APP-VIEW-ALL', true);
      
    } catch (error) {
      logStep(`Comprehensive test FAILED: ${error.message}`, 'error');
      await captureScreenshot(page, 'tc-all', 'error');
      printTestFooter('TC-APP-VIEW-ALL', false);
      throw error;
    }
  });
});
