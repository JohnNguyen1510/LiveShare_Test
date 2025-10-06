import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * @fileoverview Page object to handle Join Event by code and Guest posting flows
 */
export class JoinEventPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Home/non-dashboard join controls
    this.joinButton = this.page.locator('button.color-blue, span.btn-text:has-text("Join"), div.bottom-div button, button:has-text("Join")').first();
    this.codeInput = this.page.locator('input.inputLogin, input[placeholder*="Unique ID"], input[placeholder*="code" i], input[placeholder*="ID" i], input.input-bordered').first();
    this.joinConfirmButton = this.page.locator('button:has-text("Join An Event"), button.inputLogin, button:has-text("Join Event")').first();

    // Event detail verification
    this.eventDetailRoot = this.page.locator('app-event-detail, .event-detail');
    this.eventName = this.page.locator('.event-name-event, .event-name').first();
    this.detailsHeader = this.page.locator('mat-panel-title:has-text("Details"), .eventdetailHeader').first();

    // Topbar and menus
    this.gridViewButton = this.page.locator('button:has(mat-icon:text("window")), button:has(mat-icon:text("grid_view")), button:has(mat-icon:text("grid_on"))').first();
    this.shareButton = this.page.locator('button:has(mat-icon:text("share")), button.btn-circle:has(mat-icon:text("share"))').first();
    this.moreMenuButton = this.page.locator('button:has(mat-icon:text("more_vert")), button.mat-menu-trigger:has(mat-icon:text("more_vert"))').first();
    this.liveViewMenuItem = this.page.locator('button:has-text("LiveView"), button:has(mat-icon:text("visibility"))').first();
    this.redeemGiftMenuItem = this.page.locator('button:has-text("Redeem Gift Code"), button:has(mat-icon:text("redeem"))').first();

    // Guest login dialog
    this.moreLoginItem = this.page.locator('div.mat-menu-content button:has-text("Login"), button:has-text("Login")').first();
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

    // Keepsake dialog
    this.keepSakeDialog = this.page.locator('app-keepsake-thankyou');
    this.keepSakePhotos = this.page.locator('app-keepsake-thankyou button:has-text("Photos")').first();
    this.keepSakeVideos = this.page.locator('app-keepsake-thankyou button:has-text("Videos")').first();

    // Message dialog
    this.postMessageDialog = this.page.locator('app-post-message');
    this.captionInput = this.page.locator('app-post-message input[placeholder*="caption" i], app-post-message textarea').first();
    this.postSubmitButton = this.page.locator('app-post-message button:has-text("POST"), app-post-message .mat-button:has-text("POST")').first();
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
    await this.codeInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.codeInput.fill(eventCode);
    await this.joinConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.joinConfirmButton.click();
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

  async openGuestLoginAndPostAsGuest(nickname = 'Auto Guest') {
    await this.moreMenuButton.click();
    await this.page.waitForTimeout(500);
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
    await this.postAsGuestButton.click();
    // Guest login closes dialog and returns to event detail
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
    // Use any visible image input
    const imgInput = this.page.locator('app-then-and-now input#file-input[accept*="image"], app-then-and-now input[type="file"][accept*="image"]').first();
    await imgInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(1000);
    // Click NOW box and upload
    await this.nowBox.click();
    await imgInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(1000);
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
}

