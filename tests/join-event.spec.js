import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { JoinEventPage } from '../page-objects/JoinEventPage.js';
import { EventDetailPage } from '../page-objects/EventDetailPage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Utility to create tiny test files
function ensureTestFiles() {
  const img = path.join(screenshotsDir, 'je-test.jpg');
  const vid = path.join(screenshotsDir, 'je-test.mp4');
  if (!fs.existsSync(img)) {
    fs.writeFileSync(img, Buffer.from([0xFF, 0xD8, 0xFF, 0xD9])); // minimal jpeg
  }
  if (!fs.existsSync(vid)) {
    fs.writeFileSync(vid, Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70])); // mp4 ftyp header start
  }
  return { img, vid };
}

test.describe('App-JoinEvent', () => {
  test.setTimeout(240000);

  let loginPage;
  let joinEventPage;
  let eventDetailPage;
  const EVENT_CODE = process.env.JOIN_EVENT_CODE || '53IG60';

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    joinEventPage = new JoinEventPage(page);
    eventDetailPage = new EventDetailPage(page);
  });

  test('TC-APP-JE-001: Verify join by code shows correct Event UI', async ({ page }) => {
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.verifyEventUI();
    await page.screenshot({ path: path.join(screenshotsDir, 'je-001-joined.png') });
  });

  test('TC-APP-JE-002: Then & Now works as Post as Guest', async ({ page }) => {
    const { img } = ensureTestFiles();
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.openGuestLoginAndPostAsGuest('Auto Guest JE002');
    await joinEventPage.openPlusMenu();
    await joinEventPage.openThenAndNow();
    await joinEventPage.uploadThenAndNowImages(img);
    await page.screenshot({ path: path.join(screenshotsDir, 'je-002-then-now-uploaded.png') });
  });

  test('TC-APP-JE-003/004: KeepSake flow as Post as Guest', async ({ page }) => {
    const { img } = ensureTestFiles();
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.openGuestLoginAndPostAsGuest('Auto Guest JE003');
    await joinEventPage.openPlusMenu();
    await joinEventPage.openKeepSake();
    // Choose Photos path in keepsake
    await joinEventPage.keepSakePhotos.click();
    await joinEventPage.imageFileInput.first().setInputFiles(img);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, 'je-003-keepsake-photo.png') });
  });

  test('TC-APP-JE-005: Message flow as Post as Guest (with image + caption)', async ({ page }) => {
    const { img } = ensureTestFiles();
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.openGuestLoginAndPostAsGuest('Auto Guest JE005');
    await joinEventPage.openPlusMenu();
    await joinEventPage.openMessageComposer();
    await joinEventPage.captionInput.fill('Auto caption from JE-005');
    // In message dialog, image selection is via selectable image area; fallback to hidden input if present
    const dialogFileInput = page.locator('app-post-message input[type="file"][accept*="image"]');
    if (await dialogFileInput.count() > 0) {
      await dialogFileInput.first().setInputFiles(img);
    } else {
      // fallback: global input
      await joinEventPage.imageFileInput.first().setInputFiles(img);
    }
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotsDir, 'je-005-message-ready.png') });
  });

  test('TC-APP-JE-006: Image upload as Post as Guest', async ({ page }) => {
    const { img } = ensureTestFiles();
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.openGuestLoginAndPostAsGuest('Auto Guest JE006');
    await joinEventPage.openPlusMenu();
    await joinEventPage.uploadPhotoFromPlus(img);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, 'je-006-photo-upload.png') });
  });

  test('TC-APP-JE-007: Video upload as Post as Guest', async ({ page }) => {
    const { vid } = ensureTestFiles();
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.openGuestLoginAndPostAsGuest('Auto Guest JE007');
    await joinEventPage.openPlusMenu();
    await joinEventPage.uploadVideoFromPlus(vid);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, 'je-007-video-upload.png') });
  });

  test('TC-APP-JE-008: Grid View popup options', async ({ page }) => {
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.verifyEventUI();
    await joinEventPage.gridViewButton.click();
    await page.waitForTimeout(1000);
    // Verify popup options by text presence
    const options = ['2x2', '3x3', 'TimeLine View'];
    for (const opt of options) {
      const found = await page.locator(`text=${opt}`).first().isVisible().catch(() => false);
      expect(found, `${opt} should appear in Grid View popup`).toBeTruthy();
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'je-008-grid-dialog.png') });
  });

  test('TC-APP-JE-009: Share dialog/options visible', async ({ page }) => {
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    // Mock navigator.share if needed
    await page.evaluate(() => {
      window['_shareAPICalled'] = false;
      const orig = navigator.share;
      navigator.share = function(data) {
        window['_shareAPICalled'] = true;
        return orig ? orig.call(this, data) : Promise.resolve();
      };
    });
    await joinEventPage.shareButton.click();
    await page.waitForTimeout(1000);
    const apiCalled = await page.evaluate(() => window['_shareAPICalled'] === true);
    const dialogVisible = await page.locator('div[role="dialog"], .share-dialog, .share-options').first().isVisible().catch(() => false);
    expect(apiCalled || dialogVisible, 'Share triggered').toBeTruthy();
    await page.screenshot({ path: path.join(screenshotsDir, 'je-009-share.png') });
  });

  test('TC-APP-JE-010: LiveView navigation from More menu', async ({ page }) => {
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.moreMenuButton.click();
    const popupPromise = page.context().waitForEvent('page', { timeout: 10000 }).catch(() => null);
    await joinEventPage.liveViewMenuItem.click();
    const popup = await popupPromise;
    await page.waitForTimeout(2000);
    const urlNow = page.url();
    const ok = (popup !== null) || urlNow.includes('liveview') || urlNow.includes('slideshow');
    expect(ok, 'LiveView should open or navigate').toBeTruthy();
    await page.screenshot({ path: path.join(screenshotsDir, 'je-010-liveview.png') });
    if (popup) await popup.close().catch(() => {});
  });

  test('TC-APP-JE-011: Redeem Gift Code flow', async ({ page }) => {
    await joinEventPage.goHome();
    await joinEventPage.openJoinDialogFromHome();
    await joinEventPage.joinByCode(EVENT_CODE);
    await joinEventPage.moreMenuButton.click();
    await joinEventPage.redeemGiftMenuItem.click();
    const codeInput = page.locator('input[placeholder*="gift code" i], input[placeholder*="code" i], input.input-bordered').first();
    await codeInput.waitFor({ state: 'visible', timeout: 10000 });
    await codeInput.fill('TEST123');
    const submit = page.locator('button:has-text("Submit"), button:has-text("Redeem"), button.btn-primary').first();
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'je-011-redeem.png') });
  });
});


