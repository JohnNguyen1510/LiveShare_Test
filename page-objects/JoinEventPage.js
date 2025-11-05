import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import path from 'path';
import fs from 'fs';

/**
 * @fileoverview Page object to handle Join Event by code and Guest posting flows
 */
export class JoinEventPage extends BasePage {
  constructor(page) {
    super(page);

    // Home/non-dashboard join controls
    this.joinButton = this.page.locator('button.color-blue, span.btn-text:has-text("Join"), div.bottom-div button, button:has-text("Join")').first();
    this.codeInput = this.page.locator('input.inputLogin, input[placeholder*="Unique ID"], input[placeholder*="code" i], input[placeholder*="ID" i], input.input-bordered').first();
    this.joinConfirmButton = this.page.locator('button:has-text("Join An Event"), button.inputLogin, button:has-text("Join Event")').first();

    // Event detail verification
    this.eventDetailRoot = this.page.locator('app-event-detail, .event-detail');
    this.eventName = this.page.locator('.event-name-event, .event-name').first();
    this.detailsHeader = this.page.locator('mat-panel-title:has-text("Details"), .eventdetailHeader').first();

    // Topbar and action buttons
    this.gridViewButton = this.page.locator('button:has(mat-icon:text("window")), button:has(mat-icon:text("grid_view")), button:has(mat-icon:text("grid_on"))').first();
    this.shareButton = this.page.locator('button:has(mat-icon:text("share")), button.btn-circle:has(mat-icon:text("share"))').first();
    this.moreMenuButton = this.page.locator('button:has(mat-icon:text("more_vert")), button.mat-menu-trigger:has(mat-icon:text("more_vert"))').first();
    
    // More menu items
    this.liveViewMenuItem = this.page.locator('button:has-text("LiveView"), button:has(mat-icon:text("visibility"))').first();
    this.redeemGiftMenuItem = this.page.locator('button:has-text("Redeem Gift Code"), button:has(mat-icon:text("redeem"))').first();
    this.moreLoginItem = this.page.locator('div.mat-menu-content button:has-text("Login"), button:has-text("Login")').first();
    this.moreLogoutItem = this.page.locator('div.mat-menu-content button:has-text("Logout"), button:has-text("Logout")').first();

    // Guest login dialog
    this.yesConfirmButton = this.page.locator('button:has-text("Yes")').first();
    this.guestDialog = this.page.locator('#guest-login-dialog');
    this.nicknameInput = this.page.locator('#guest-login-dialog input[placeholder="Enter a Nickname"], input[placeholder*="Nickname"]').first();
    this.postAsGuestButton = this.page.locator('#guest-login-dialog button:has-text("Post as Guest")').first();

    // Plus/compose menu in event detail
    this.plusMenuButton = this.page.locator('button.menu-button:has(mat-icon:text("add")), button.menu-button, button:has(mat-icon:text("add"))').first();
    this.thenAndNowButton = this.page.locator('button:has-text("Then & Now"), button:has(span:text("Then & Now"))').first();
    this.keepSakeButton = this.page.locator('button:has(span:text("KeepSake")), button:has-text("KeepSake")').first();
    this.messageButton = this.page.locator('button:has-text("Message")').first();
    this.photosButton = this.page.locator('button:has(mat-icon:text("insert_photo")), button:has-text("Photos")').first();
    this.videosButton = this.page.locator('button:has(mat-icon:text("videocam")), button:has-text("Videos")').first();

    // Common inputs for uploads
    this.imageFileInput = this.page.locator('input#file-input[accept*="image"], input[type="file"][accept*="image"]').first();
    this.videoFileInput = this.page.locator('input[type="file"][accept*="video"]').first();

    // Then & Now dialog
    this.thenNowDialog = this.page.locator('app-then-and-now');
    this.thenBox = this.page.locator('app-then-and-now .selection-box.then').first();
    this.nowBox = this.page.locator('app-then-and-now .selection-box.now').first();
    this.thenNowPostButton = this.page.locator('app-then-and-now button:has-text("POST")').first();
    this.thenNowImageInput = this.page.locator('app-then-and-now input#file-input[accept*="image"], app-then-and-now input[type="file"][accept*="image"]').first();

    // Keepsake dialog
    this.keepSakeDialog = this.page.locator('app-keepsake-thankyou');
    this.keepSakePhotos = this.page.locator('app-keepsake-thankyou button:has-text("Photos")').first();
    this.keepSakeVideos = this.page.locator('app-keepsake-thankyou button:has-text("Videos")').first();

    // Message dialog
    this.postMessageDialog = this.page.locator('app-post-message');
    this.captionInput = this.page.locator('app-post-message input[placeholder*="caption" i], app-post-message textarea').first();
    this.postSubmitButton = this.page.locator('app-post-message button:has-text("POST"), app-post-message .mat-button:has-text("POST")').first();
    this.messageDialogFileInput = this.page.locator('app-post-message input[type="file"][accept*="image"]');
    
    // Redeem gift code dialog
    this.redeemCodeInput = this.page.locator('input[placeholder*="gift code" i], input[placeholder*="code" i], input.input-bordered').first();
    this.redeemSubmitButton = this.page.locator('button:has-text("Submit"), button:has-text("Redeem"), button.btn-primary').first();
    
    // Grid view popup options
    this.gridViewOptions = {
      twoByTwo: this.page.locator('text=2x2').first(),
      threeByThree: this.page.locator('text=3x3').first(),
      timeline: this.page.locator('text=TimeLine View').first()
    };
    
    // Share dialog
    this.shareDialog = this.page.locator('div[role="dialog"], .share-dialog, .share-options').first();
  }

  async goHome() {
    await this.page.goto(`${this.baseUrl}/`);
    await this.waitForPageLoad();
  }

  async openJoinDialogFromHome() {
    await this.joinButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.joinButton.click();
    await this.page.waitForTimeout(1000);
  }

  async joinByCode(eventCode) {
    console.log(`🔗 Joining event by code: ${eventCode}`);
    
    await this.codeInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.codeInput.fill(eventCode);
    await this.joinConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Wait for event details API response when joining
    // Note: performActionAndWaitForResponse already returns parsed JSON, not Response object
    const eventData = await this.performActionAndWaitForResponse({
      actionPromise: this.joinConfirmButton.click(),
      apiUrl: `/api/events`,
      statusCode: 200,
      requestMethod: 'GET'
    });
    
    // Verify event details from API (eventData is already parsed JSON)
    expect(eventData).toHaveProperty('_id');
    expect(eventData).toHaveProperty('name');
    expect(eventData).toHaveProperty('linkName');
    
    await this.page.waitForLoadState('networkidle');
  }

  async verifyEventUI(expectedNameLike = '') {
    await expect(this.gridViewButton).toBeVisible();
    await expect(this.shareButton).toBeVisible();
    await expect(this.moreMenuButton).toBeVisible();
    if (expectedNameLike && expectedNameLike.length > 0) {
      const nameText = (await this.eventName.textContent()) || '';
      expect(nameText.toLowerCase()).toContain(expectedNameLike.toLowerCase());
    }
    await expect(this.detailsHeader).toBeVisible();
  }


  async openGuestLoginAndPostAsGuest(nickname , eventCode) {
    console.log(`👤 Logging in as guest: ${nickname}`);
    
    await this.moreMenuButton.click();
    await this.page.waitForTimeout(500);
    if (await this.moreLogoutItem.isVisible().catch(() => false)) {
      await this.moreLogoutItem.click();
      await this.yesConfirmButton.click();
      await this.page.waitForTimeout(2000);
      await this.goHome();
      await this.openJoinDialogFromHome();
      console.log('EVENT_CODE:', eventCode)
      await this.joinByCode(eventCode);
      await this.page.waitForTimeout(2000);
      await this.moreMenuButton.click();
      
    }


    
    if (await this.moreLoginItem.isVisible().catch(() => false)) {
      await this.moreLoginItem.click();
      await this.page.waitForTimeout(500);
    }
    await this.guestDialog.waitFor({ state: 'visible', timeout: 15000 });
    await this.nicknameInput.fill(nickname);
    // Wait for button to enable
    await this.page.waitForFunction(() => {
      const btn = document.querySelector('#guest-login-dialog button');
      return btn && !btn.hasAttribute('disabled');
    }, { timeout: 5000 }).catch(() => {});
    
    // Wait for guest login API response
    const guestLoginResponse = await this.performActionAndWaitForResponse({
      actionPromise: this.postAsGuestButton.click(),
      apiUrl: '/api/users/guest-register-login',
      statusCode: 200,
      requestMethod: 'POST'
    });
    
    expect(guestLoginResponse).toHaveProperty('message', 'success');
    
    // Guest login closes dialog and returns to event detail
    await this.page.waitForTimeout(1000);
  }

  async openPlusMenu() {
    await this.plusMenuButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.plusMenuButton.click();
    await this.page.waitForTimeout(500);
  }

  async openThenAndNow() {
    await this.thenAndNowButton.click();
    await this.thenNowDialog.waitFor({ state: 'visible', timeout: 10000 });
  }

  async uploadThenAndNowImages(imagePath) {
    // Click THEN box and upload
    await this.thenBox.click();
    await this.thenNowImageInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(1000);
    
    // Click NOW box and upload
    await this.nowBox.click();
    await this.thenNowImageInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Then & Now images uploaded');
  }

  async openKeepSake() {
    await this.keepSakeButton.click();
    await this.keepSakeDialog.waitFor({ state: 'visible', timeout: 10000 });
  }

  async openMessageComposer() {
    await this.messageButton.click();
    await this.postMessageDialog.waitFor({ state: 'visible', timeout: 10000 });
  }

  async uploadPhotoFromPlus(imagePath) {
    // Photos can trigger hidden input directly
    if (await this.photosButton.isVisible().catch(() => false)) {
      await this.photosButton.click().catch(() => {});
    }
    await this.imageFileInput.first().setInputFiles(imagePath);
  }

  async uploadVideoFromPlus(videoPath) {
    if (await this.videosButton.isVisible().catch(() => false)) {
      await this.videosButton.click().catch(() => {});
    }
    await this.videoFileInput.first().setInputFiles(videoPath);
  }

  /**
   * Ensure test files exist (image and video)
   * @returns {{img: string, vid: string}} Paths to test files
   */
  ensureTestFiles() {
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const img = path.join(screenshotsDir, 'je-test.jpg');
    const vid = path.join(screenshotsDir, 'je-test.mp4');
    
    if (!fs.existsSync(img)) {
      fs.writeFileSync(img, Buffer.from([0xFF, 0xD8, 0xFF, 0xD9])); // minimal jpeg
    }
    if (!fs.existsSync(vid)) {
      fs.writeFileSync(vid, Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70])); // mp4 ftyp header
    }
    
    return { img, vid };
  }

  /**
   * Complete join event workflow
   * @param {string} eventCode - Event code to join
   */
  async completeJoinEventWorkflow(eventCode) {
    await this.goHome();
    await this.openJoinDialogFromHome();
    await this.joinByCode(eventCode);
    await this.verifyEventUI();
  }

  /**
   * Complete guest post workflow
   * @param {string} eventCode - Event code
   * @param {string} nickname - Guest nickname
   */
  async completeGuestPostSetup(eventCode, nickname) {
    await this.goHome();
    await this.openJoinDialogFromHome();
    await this.joinByCode(eventCode);
    await this.openGuestLoginAndPostAsGuest(nickname, eventCode);
  }

  /**
   * Verify grid view options are available
   */
  async verifyGridViewOptions() {
    await this.gridViewButton.click();
    await this.page.waitForTimeout(1000);
    
    await expect(this.gridViewOptions.twoByTwo).toBeVisible();
    await expect(this.gridViewOptions.threeByThree).toBeVisible();
    await expect(this.gridViewOptions.timeline).toBeVisible();
    
    console.log('✅ All grid view options verified');
  }

  /**
   * Verify share functionality
   * @returns {Promise<boolean>} Whether share was triggered
   */
  async verifyShareFunctionality() {
    // Mock navigator.share
    await this.page.evaluate(() => {
      window['_shareAPICalled'] = false;
      const orig = navigator.share;
      navigator.share = function(data) {
        window['_shareAPICalled'] = true;
        return orig ? orig.call(this, data) : Promise.resolve();
      };
    });
    
    await this.shareButton.click();
    await this.page.waitForTimeout(1000);
    
    const apiCalled = await this.page.evaluate(() => window['_shareAPICalled'] === true);
    const dialogVisible = await this.shareDialog.isVisible().catch(() => false);
    
    const shareTriggered = apiCalled || dialogVisible;
    expect(shareTriggered, 'Share should be triggered').toBeTruthy();
    
    console.log('✅ Share functionality verified');
    return shareTriggered;
  }

  /**
   * Complete redeem gift code workflow
   * @param {string} giftCode - Gift code to redeem
   */
  async redeemGiftCode(giftCode) {
    await this.moreMenuButton.click();
    await this.redeemGiftMenuItem.click();
    await this.redeemCodeInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.redeemCodeInput.fill(giftCode);
    
    if (await this.redeemSubmitButton.isVisible().catch(() => false)) {
      await this.redeemSubmitButton.click();
      await this.page.waitForTimeout(1500);
    }
    
    console.log('✅ Gift code redemption attempted');
  }

  /**
   * Upload message with image and caption
   * @param {string} imagePath - Path to image
   * @param {string} caption - Message caption
   */
  async uploadMessageWithImage(imagePath, caption) {
    await this.openPlusMenu();
    await this.openMessageComposer();
    await this.captionInput.fill(caption);
    
    // Try message dialog file input first
    if (await this.messageDialogFileInput.count() > 0) {
      await this.messageDialogFileInput.first().setInputFiles(imagePath);
    } else {
      // Fallback to global input
      await this.imageFileInput.first().setInputFiles(imagePath);
    }
    
    await this.page.waitForTimeout(1500);
    console.log('✅ Message with image prepared');
  }
}

