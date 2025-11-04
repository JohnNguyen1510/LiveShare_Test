import { test, expect } from '@playwright/test';
import { EventListPage } from '../page-objects/EventListPage.js';
import { EventDetailPage } from '../page-objects/EventDetailPage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Increase test timeout
test.setTimeout(5 * 60 * 1000); // 5 minutes

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
      await page.screenshot({ path: path.join(screenshotsDir, `error-event-detail-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-08: Verify Share Event UI', async ({ page }) => {
    try {
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);

      console.log('TC-APP-DEEV-08: Checking grid view');
      await eventDetailPage.verifyGridView();
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-grid-view-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-09: Verify Comprehensive Grid Layout Testing', async ({ page }) => {
    try {
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);

      console.log('TC-APP-DEEV-09: Testing all grid layouts (2x2, 3x3, Timeline)');
      await eventDetailPage.testAllGridLayouts();
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-grid-layouts-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-DEEV-10: Verify Share Functionality', async ({ page }) => {
    try {
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();

      console.log('TC-APP-DEEV-10: Testing share functionality');
      await eventDetailPage.verifyShareFunctionality();
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-share-${Date.now()}.png`) });
      throw error;
    }
  });







  test('TC-APP-DEEV-11: Movie Editor UI Verification', async ({ page }) => {
    try {
      console.log('🎬 TC-APP-DEEV-11: Movie Editor UI Verification');
      
      // Navigate and open event
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      await eventListPage.clickEventByIndex(0);
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      
      // Execute complete movie editor verification workflow
      const testMovieName = `UI Test Movie ${Date.now()}`;
      await eventDetailPage.verifyCompleteMovieEditorWorkflow(testMovieName);
      
      console.log('🎉 TC-APP-DEEV-11 PASSED: All Movie Editor UI components verified!');
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-movie-editor-${Date.now()}.png`) });
      throw error;
    }
  });
});