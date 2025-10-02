import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { EventListPage } from '../page-objects/EventListPage.js';
import { EventDetailPage } from '../page-objects/EventDetailPage.js';
import { BasePage } from '../page-objects/BasePage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

test.describe('Plus Icon Features Verification - POM Structure', () => {
  test.setTimeout(240000);
  
  let loginPage;
  let eventListPage;
  let eventDetailPage;
  let basePage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    eventListPage = new EventListPage(page);
    eventDetailPage = new EventDetailPage(page);
    basePage = new BasePage(page);
  });
  test('TC-APP-VIEW-001-008: Verify Plus Features in View Detail using POM', async ({ page, context }) => {
    try {

      // Navigate to events page and verify it loads
      console.log('Navigating to events page...');
      await eventListPage.goToEventsPage();
      await eventListPage.waitForEventsToLoad();
      await eventListPage.verifyEventsPageLoaded();
      
      // Select first event
      console.log('Selecting first event...');
      await eventListPage.clickEventByIndex(0);
      await page.waitForTimeout(2000); // Give page time to fully load
      
      // Wait for event detail page to load
      await eventDetailPage.waitForEventDetailToLoad();
      await eventDetailPage.verifyEventDetailLoaded();
      await page.screenshot({ path: path.join(screenshotsDir, 'event-detail-loaded.png') });
      
      // Click add button to reveal feature options
      console.log('Clicking add button to reveal feature options...');
      await eventDetailPage.clickAddButtonToRevealFeatures();
      await page.screenshot({ path: path.join(screenshotsDir, 'feature-options.png') });
      
      // Verify all plus icon features using POM methods
      console.log('Verifying all plus icon features...');
      const features = await eventDetailPage.verifyAllPlusIconFeatures();
      
      // TC-APP-VIEW-001: Verify Then & Now button
      console.log('TC-APP-VIEW-001: Verifying Then & Now button');
      expect(features.thenAndNow, 'Then & Now button should be visible').toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'then-and-now-button.png') });
      
      // TC-APP-VIEW-002: Verify KeepSake button
      console.log('TC-APP-VIEW-002: Verifying KeepSake button');
      expect(features.keepSake, 'KeepSake button should be visible').toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'keepsake-button.png') });
      
      // TC-APP-VIEW-003: Verify Clue button
      console.log('TC-APP-VIEW-003: Verifying Clue button');
      expect(features.clue, 'Clue button should be visible').toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'clue-button.png') });
      
      // TC-APP-VIEW-004: Verify Sponsor button
      console.log('TC-APP-VIEW-004: Verifying Sponsor button');
      expect(features.sponsor, 'Sponsor button should be visible').toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'sponsor-button.png') });
      
      // TC-APP-VIEW-005: Verify Prize button
      console.log('TC-APP-VIEW-005: Verifying Prize button');
      expect(features.prize, 'Prize button should be visible').toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'prize-button.png') });
      
      // TC-APP-VIEW-006: Verify Message button
      console.log('TC-APP-VIEW-006: Verifying Message button');
      expect(features.message, 'Message button should be visible').toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'message-button.png') });
      
      // TC-APP-VIEW-007: Verify Photos button
      console.log('TC-APP-VIEW-007: Verifying Photos button');
      expect(features.photos, 'Photos button should be visible').toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'photos-button.png') });
      
      // TC-APP-VIEW-008: Verify Videos button
      console.log('TC-APP-VIEW-008: Verifying Videos button');
      expect(features.videos, 'Videos button should be visible').toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'videos-button.png') });
      
      console.log('✅ All Plus Icon Features verification completed successfully using POM structure');
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-plus-icon-${Date.now()}.png`) });
      throw error;
    }
  });
});
