import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class EventSettingsPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Dialog root
    this.dialog = this.page.locator('mat-dialog-container app-personalize');
    this.dialogTitle = this.dialog.locator('h1:has-text("Personalize Options")');
    this.footer = this.dialog.locator('div.mt-auto.flex');

    // Footer actions
    this.saveButton = this.footer.getByText('Save', { exact: true });
    this.previewButton = this.footer.getByText('Preview', { exact: true });
    this.cancelButton = this.footer.getByText('Cancel', { exact: true });

    // TopNav settings button on Event Detail
    this.topnavSettings = this.page.locator('app-event-detail .navbar-end button:has(mat-icon:text("settings"))');

    // Plan sections
    this.premiumPlanSection = this.dialog.locator('div.wrap:has(h3:has-text("Premium Plan"))');
    this.standardPlanSection = this.dialog.locator('div.wrap:has(h3:has-text("Standard Plan"))');
    this.premiumPlusPlanSection = this.dialog.locator('div.wrap:has(h3:has-text("Premium+ Plan"))');

    // Generic option item within Personalize dialog
    this.optionByLabel = (label) => this.dialog.locator('div.options', { has: this.page.locator('span', { hasText: label }) });
    this.optionSelectionIcon = (label) => this.optionByLabel(label).locator('img.selection');

    // Specific option locators for better reliability
    this.facebookSharingOption = this.optionByLabel('Allow sharing via Facebook');
    this.guestDownloadOption = this.optionByLabel('Allow Guest Download');
    this.addEventManagersOption = this.optionByLabel('Add Event Managers');
    this.postingWithoutLoginOption = this.optionByLabel('Allow posting without login');
    this.accessPasscodeOption = this.optionByLabel('Require Access Passcode');
    this.eventNameOption = this.optionByLabel('Event Name');
    this.eventDateOption = this.optionByLabel('Event Date');
    this.photoGiftsOption = this.optionByLabel('Enable Photo Gifts');
    this.headerPhotoOption = this.optionByLabel('Event Header Photo');
    this.locationOption = this.optionByLabel('Location');
    this.contactOption = this.optionByLabel('Contact');
    this.itineraryOption = this.optionByLabel('Itinerary');
    this.messagePostOption = this.optionByLabel('Enable Message Post');
    this.popularityBadgesOption = this.optionByLabel('Popularity Badges');
    this.videoOption = this.optionByLabel('Video');
    this.buttonLink1Option = this.optionByLabel('Button Link #1');
    this.buttonLink2Option = this.optionByLabel('Button Link #2');
    this.welcomePopupOption = this.optionByLabel('Welcome Popup');
    this.liveViewOption = this.optionByLabel('LiveView Slideshow');
    this.thenAndNowOption = this.optionByLabel('Then And Now');
    this.movieEditorOption = this.optionByLabel('Movie Editor');
    this.keepSakeOption = this.optionByLabel('KeepSake');
    this.scavengerHuntOption = this.optionByLabel('Scavenger Hunt');
    this.sponsorOption = this.optionByLabel('Sponsor');
    this.prizeOption = this.optionByLabel('Prize');
    this.forceLoginOption = this.optionByLabel('Force Login');
  }

  async openSettingsIfNeeded() {
    if (!(await this.dialog.isVisible().catch(() => false))) {
      await this.topnavSettings.click();
      await this.dialog.waitFor({ state: 'visible', timeout: 15000 });
    }
  }

  async waitLoaded() {
    await this.dialog.waitFor({ state: 'visible', timeout: 15000 });
    await expect(this.dialog.locator('h1:has-text("Personalize Options")')).toBeVisible();
  }

  async isOptionEnabled(label) {
    const option = this.optionByLabel(label);
    await option.waitFor({ state: 'visible', timeout: 10000 });
    return await option.evaluate((el) => el.classList.contains('selected-option'));
  }

  async expectOptionVisible(label) {
    const option = this.optionByLabel(label);
    await expect(option).toBeVisible();
  }

  async expectOptionSelected(label) {
    const option = this.optionByLabel(label);
    await expect(option).toHaveClass(/selected-option/);
    await expect(this.optionSelectionIcon(label)).toBeVisible();
  }

  async expectOptionNotSelected(label) {
    const option = this.optionByLabel(label);
    await expect(option).not.toHaveClass(/selected-option/);
  }

  async setOption(label, enable = true) {
    const option = this.optionByLabel(label);
    await option.waitFor({ state: 'visible', timeout: 10000 });

    const currentlyEnabled = await this.isOptionEnabled(label);
    if (enable !== currentlyEnabled) {
      await option.click();
      await this.page.waitForTimeout(300);
      await expect(option).toHaveClass(new RegExp(enable ? 'selected-option' : '^(?!.*selected-option).*'));
    }
  }

  async enable(labels = []) {
    for (const label of labels) {
      await this.setOption(label, true);
    }
  }

  async disable(labels = []) {
    for (const label of labels) {
      await this.setOption(label, false);
    }
  }

  async save() {
    await this.saveButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.saveButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 15000 });
  }

  // Convenience wrappers for commonly used options
  async enableFacebookSharing() { await this.setOption('Allow sharing via Facebook', true); }
  async enableGuestDownload() { await this.setOption('Allow Guest Download', true); }
  async enablePostingWithoutLogin() { await this.setOption('Allow posting without login', true); }
  async enableWelcomePopup() { await this.setOption('Welcome Popup', true); }
  async enableVideo() { await this.setOption('Video', true); }
  async enablePopularityBadges() { await this.setOption('Popularity Badges', true); }
  async enableLiveView() { await this.setOption('LiveView Slideshow', true); }
  async enableThenAndNow() { await this.setOption('Then And Now', true); }
  async enableMovieEditor() { await this.setOption('Movie Editor', true); }
  async enableKeepSake() { await this.setOption('KeepSake', true); }
  async enableScavengerHunt() { await this.setOption('Scavenger Hunt', true); }
}


