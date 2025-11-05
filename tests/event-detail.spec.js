import { test, expect } from '@playwright/test';
import { EventListPage } from '../page-objects/EventListPage.js';
import { EventDetailPage } from '../page-objects/EventDetailPage.js';
import { BasePage } from '../page-objects/BasePage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Increase test timeout
test.setTimeout(120000); // 2 minutes (optimized)

test.describe('Event Detail UI', () => {
  let eventListPage;
  let eventDetailPage;

  test.beforeEach(async ({ page }) => {
    eventListPage = new EventListPage(page);
    eventDetailPage = new EventDetailPage(page);
  });

  test('TC-APP-DEEV-01-07: Verify Detail Event UI', async ({ page }) => {
    try {
      // Navigate and open event
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      
      // Find and click event (prefer "tuanhay" if exists)
      await eventListPage.clickEventByNameOrFirst('tuanhay');
      
      // Verify complete event detail UI
      await eventDetailPage.verifyCompleteEventDetailUI();
      
      console.log('✅ All Detail Event UI checks completed');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-event-detail');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-08: Verify Comprehensive Grid Layout Testing', async ({ page }) => {
    try {
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);

      console.log('TC-APP-DEEV-08: Testing all grid layouts (2x2, 3x3, Timeline)');
      await eventDetailPage.testAllGridLayouts();
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-grid-layouts');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-09: Verify Share Functionality', async ({ page }) => {
    try {
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();

      console.log('TC-APP-DEEV-9: Testing share functionality');
      await eventDetailPage.verifyShareFunctionality();
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-share');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-10: Movie Editor UI Verification', async ({ page }) => {
    try {
      console.log('🎬 TC-APP-DEEV-10: Movie Editor UI Verification');
      
      // Navigate and open event
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Execute complete movie editor verification workflow
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const processId = process.pid || Math.floor(Math.random() * 10000);
      const testMovieName = `UI Test Movie ${timestamp}_${processId}_${randomId}`;
      await eventDetailPage.verifyCompleteMovieEditorWorkflow(testMovieName);
      
      console.log('🎉 TC-APP-DEEV-10 PASSED: All Movie Editor UI components verified!');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-movie-editor');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-11: Verify View Keepsakes Functionality', async ({ page }) => {
    try {
      console.log('💎 TC-APP-DEEV-13: Verify View Keepsakes Functionality');
      
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Open More Options menu and click View Keepsakes
      await eventDetailPage.clickMoreOptionsMenu();
      await eventDetailPage.clickViewKeepsakes();
      
      // Verify keepsakes view is displayed
      await eventDetailPage.verifyViewKeepsakesDisplayed();
      
      console.log('✅ TC-APP-DEEV-11 PASSED: View Keepsakes functionality verified');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-view-keepsakes');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-12: Verify Download All Photos Functionality', async ({ page }) => {
    try {
      console.log('📥 TC-APP-DEEV-12: Verify Download All Photos Functionality');
      
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Open More Options menu and click Download All Photos
      await eventDetailPage.clickMoreOptionsMenu();
      await eventDetailPage.clickDownloadAllPhotos();
      
      // Verify download page is displayed
      await eventDetailPage.verifyDownloadAllPhotosPage();
      
      // Navigate back to event detail
      await eventDetailPage.clickBackToEventFromDownload();
      
      console.log('✅ TC-APP-DEEV-12 PASSED: Download All Photos functionality verified');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-download-photos');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-13: Verify LiveView Functionality', async ({ page, context }) => {
    try {
      console.log('👁️ TC-APP-DEEV-13: Verify LiveView Functionality');
      
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Open More Options menu and click LiveView
      await eventDetailPage.clickMoreOptionsMenu();
      
      // Wait for new page/tab to open
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        eventDetailPage.clickLiveView()
      ]);
      
      // Verify LiveView page is opened
      await eventDetailPage.verifyLiveViewPage(newPage);
      
      // Close the LiveView tab
      await newPage.close();
      
      console.log('✅ TC-APP-DEEV-13 PASSED: LiveView functionality verified');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-liveview');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-14 4: Verify Redeem Gift Code Functionality', async ({ page }) => {
    try {
      console.log('🎁 TC-APP-DEEV-14: Verify Redeem Gift Code Functionality');
      
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Open More Options menu and click Redeem Gift Code
      await eventDetailPage.clickMoreOptionsMenu();
      await eventDetailPage.clickRedeemGiftCode();
      
      // Verify redeem gift code dialog
      await eventDetailPage.verifyRedeemGiftCodeDialog();
      
      // Test cancel functionality
      await eventDetailPage.cancelRedeemGiftCode();
      
      console.log('✅ TC-APP-DEEV-14 PASSED: Redeem Gift Code functionality verified');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-redeem-gift-code');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-15: Verify Live Help Functionality', async ({ page }) => {
    try {
      console.log('💬 TC-APP-DEEV-15: Verify Live Help Functionality');
      
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Open More Options menu and click Live Help
      await eventDetailPage.clickMoreOptionsMenu();
      await eventDetailPage.clickLiveHelp();
      
      // Verify live help interface is displayed
      await eventDetailPage.verifyLiveHelpDisplayed();
      
      console.log('✅ TC-APP-DEEV-15 PASSED: Live Help functionality verified');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-live-help');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-16: Verify FAQs Link', async ({ page, context }) => {
    try {
      console.log('❓ TC-APP-DEEV-16: Verify FAQs Link');
      
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Open More Options menu and click FAQs
      await eventDetailPage.clickMoreOptionsMenu();
      
      // Wait for new page to open
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        eventDetailPage.clickFAQs()
      ]);
      
      // Verify FAQs page is opened
      await eventDetailPage.verifyFAQsPage(newPage);
      
      // Close the FAQs tab
      await newPage.close();
      
      console.log('✅ TC-APP-DEEV-16 PASSED: FAQs link verified');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-faqs');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-17: Verify Event Details Dialog Comprehensive', async ({ page }) => {
    try {
      console.log('📋 TC-APP-DEEV-17: Verify Event Details Dialog Comprehensive');
      
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Open More Options menu and click Details
      await eventDetailPage.clickMoreOptionsMenu();
      await eventDetailPage.clickDetailsFromMenu();
      
      // Verify Event Details Dialog with all fields
      await eventDetailPage.verifyEventDetailsDialog();
      
      // Close the dialog
      await eventDetailPage.closeEventDetailsDialog();
      
      console.log('✅ TC-APP-DEEV-17 PASSED: Event Details Dialog verified comprehensively');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-event-details-dialog');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-18: Verify Logout Functionality', async ({ page }) => {
    try {
      console.log('🚪 TC-APP-DEEV-18: Verify Logout Functionality');
      
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Open More Options menu
      await eventDetailPage.clickMoreOptionsMenu();
      
      // Verify logout button is visible
      await eventDetailPage.verifyLogoutButtonVisible();
      
      // Note: We don't actually logout to avoid breaking other tests
      // Just verify the button exists
      
      console.log('✅ TC-APP-DEEV-18 PASSED: Logout button verified');
    } catch (error) {
      const uniqueFilename = BasePage.generateUniqueFilename('error-logout');
      await page.screenshot({ path: path.join(screenshotsDir, `${uniqueFilename}.png`) });
      throw error;
    }
  });
});