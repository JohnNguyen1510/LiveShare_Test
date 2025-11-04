import { test, expect } from '@playwright/test';
import { JoinEventPage } from '../page-objects/JoinEventPage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('App-JoinEvent', () => {
  test.setTimeout(240000);

  let joinEventPage;
  const EVENT_CODE = process.env.JOIN_EVENT_CODE || '53IG60';

  test.beforeEach(async ({ page }) => {
    joinEventPage = new JoinEventPage(page);
  });

  test('TC-APP-JE-001: Verify join by code shows correct Event UI', async ({ page }) => {
    try {
      await joinEventPage.completeJoinEventWorkflow(EVENT_CODE);
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-001-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-002: Then & Now works as Post as Guest', async ({ page }) => {
    try {
      const { img } = joinEventPage.ensureTestFiles();
      await joinEventPage.completeGuestPostSetup(EVENT_CODE, 'Auto Guest JE002');
      await joinEventPage.openPlusMenu();
      await joinEventPage.openThenAndNow();
      await joinEventPage.uploadThenAndNowImages(img);
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-002-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-003/004: KeepSake flow as Post as Guest', async ({ page }) => {
    try {
      const { img } = joinEventPage.ensureTestFiles();
      await joinEventPage.completeGuestPostSetup(EVENT_CODE, 'Auto Guest JE003');
      await joinEventPage.openPlusMenu();
      await joinEventPage.openKeepSake();
      await joinEventPage.keepSakePhotos.click();
      await joinEventPage.imageFileInput.first().setInputFiles(img);
      await page.waitForTimeout(2000);
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-003-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-005: Message flow as Post as Guest (with image + caption)', async ({ page }) => {
    try {
      const { img } = joinEventPage.ensureTestFiles();
      await joinEventPage.completeGuestPostSetup(EVENT_CODE, 'Auto Guest JE005');
      await joinEventPage.uploadMessageWithImage(img, 'Auto caption from JE-005');
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-005-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-006: Image upload as Post as Guest', async ({ page }) => {
    try {
      const { img } = joinEventPage.ensureTestFiles();
      await joinEventPage.completeGuestPostSetup(EVENT_CODE, 'Auto Guest JE006');
      await joinEventPage.openPlusMenu();
      await joinEventPage.uploadPhotoFromPlus(img);
      await page.waitForTimeout(3000);
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-006-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-007: Video upload as Post as Guest', async ({ page }) => {
    try {
      const { vid } = joinEventPage.ensureTestFiles();
      await joinEventPage.completeGuestPostSetup(EVENT_CODE, 'Auto Guest JE007');
      await joinEventPage.openPlusMenu();
      await joinEventPage.uploadVideoFromPlus(vid);
      await page.waitForTimeout(3000);
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-007-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-008: Grid View popup options', async ({ page }) => {
    try {
      await joinEventPage.completeJoinEventWorkflow(EVENT_CODE);
      await joinEventPage.verifyGridViewOptions();
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-008-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-009: Share dialog/options visible', async ({ page }) => {
    try {
      await joinEventPage.completeJoinEventWorkflow(EVENT_CODE);
      await joinEventPage.verifyShareFunctionality();
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-009-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-010: LiveView navigation from More menu', async ({ page }) => {
    try {
      await joinEventPage.completeJoinEventWorkflow(EVENT_CODE);
      await joinEventPage.moreMenuButton.click();
      
      const popupPromise = page.context().waitForEvent('page', { timeout: 10000 }).catch(() => null);
      await joinEventPage.liveViewMenuItem.click();
      const popup = await popupPromise;
      await page.waitForTimeout(2000);
      
      const urlNow = page.url();
      const liveViewOpened = (popup !== null) || urlNow.includes('liveview') || urlNow.includes('slideshow');
      expect(liveViewOpened, 'LiveView should open or navigate').toBeTruthy();
      
      if (popup) await popup.close().catch(() => {});
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-010-${Date.now()}.png`) });
      throw error;
    }
  });

  test('TC-APP-JE-011: Redeem Gift Code flow', async ({ page }) => {
    try {
      await joinEventPage.completeJoinEventWorkflow(EVENT_CODE);
      await joinEventPage.redeemGiftCode('TEST123');
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-je-011-${Date.now()}.png`) });
      throw error;
    }
  });
});


