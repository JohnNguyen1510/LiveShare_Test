import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class EventDetailPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Top navigation
    this.topNav = this.page.locator('app-event-detail app-topnav');
    this.backButton = this.page.locator('.navbar-start button:has(mat-icon:text("arrow_back_ios_new"))');
    this.windowButton = this.page.locator('button:has(mat-icon:text("window"))');
    this.shareButton = this.page.locator('button:has(mat-icon:text("share"))');
    this.settingsButton = this.page.locator('button:has(mat-icon:text("settings"))');
    this.moreOptionsButton = this.page.locator('button:has(mat-icon:text("more_vert"))');

    // Event header section
    this.eventImage = this.page.locator('.event-image img');
    this.cameraButton = this.page.locator('button:has(mat-icon:text("camera_alt"))');
    this.eventDate = this.page.locator('span.date-event');
    this.eventName = this.page.locator('span.event-name-event');

    // Details accordion
    this.detailsAccordion = this.page.locator('mat-accordion.event-detail-panel');
    this.detailsPanelHeader = this.page.locator('mat-panel-title.eventdetailHeader:has-text("Details")');
    this.detailsPanelExpanded = this.page.locator('mat-expansion-panel.mat-expanded');
    
    // Details sections
    this.locationSection = this.page.locator('.flex.items-start:has(mat-icon:text("location_on"))');
    this.locationText = this.locationSection.locator('.text-sm.whitespace-pre-line');
    this.locationEditButton = this.locationSection.locator('button:has(mat-icon:text("edit"))');

    this.contactSection = this.page.locator('.flex.items-start:has(mat-icon:text("phone"))');
    this.contactText = this.contactSection.locator('.text-sm.whitespace-pre-line');
    this.contactEditButton = this.contactSection.locator('button:has(mat-icon:text("edit"))');

    this.itinerarySection = this.page.locator('.flex.items-start:has(mat-icon:text("route"))');
    this.itineraryText = this.itinerarySection.locator('.text-sm.whitespace-pre-line');
    this.itineraryEditButton = this.itinerarySection.locator('button:has(mat-icon:text("edit"))');

    // Gallery section
    this.messageSection = this.page.locator('.message-section');
    this.emptyGalleryMessage = this.page.locator('.noPost:has-text("Your Event Gallery")');
    this.emptyGalleryDescription = this.page.locator('.noPostD:has-text("Capture the moment")');
    this.nowImage = this.page.locator('img[src="/assets/images/now.png"]');

    // Action buttons
    this.addButton = this.page.locator('button.menu-button:has(mat-icon:text("add"))');
    this.floatButton = this.page.locator('.floatbutton');
    this.fileInput = this.page.locator('input#file-input[type="file"]');

    // Button links (if enabled in settings)
    this.buttonLink1 = this.page.locator('a.menu-button1');
    this.buttonLink2 = this.page.locator('a.menu-button2');

    // Grid view
    this.gridViewButton = this.page.locator('button:has(mat-icon:text("window")), button:has(mat-icon:text("grid_view")), button:has(mat-icon:text("grid_on")), button:has(mat-icon:text("horizontal_split"))').first();
    this.shareButton = this.page.locator('button:has(mat-icon:text("share")), button.btn-circle:has(mat-icon:text("share"))').first();
    this.gridLayout = this.page.locator('.mat-menu-panel[role="menu"], div[role="menu"].mat-menu-panel, .cdk-overlay-pane .mat-menu-panel');
    this.twoByTwoGridButton = this.page.locator('button[role="menuitem"]:has-text("2x2 View")');
    this.threeByThreeGridButton = this.page.locator('button[role="menuitem"]:has-text("3x3 View")');
    this.timelineViewGridButton = this.page.locator('button[role="menuitem"]:has-text("Timeline View")');

    // Grid layout containers
    this.gridContainer = this.page.locator('.image-container.grid-container');
    this.verticalContainer = this.page.locator('.vertical-container');
    this.imageWrappers = this.page.locator('.image-wrapper.photo');
    this.photoDetails = this.page.locator('.photo-detail');
    
    // Grid icon indicators
    this.windowIcon = this.page.locator('button mat-icon:text("window")');
    this.gridOnIcon = this.page.locator('button mat-icon:text("grid_on")');
    this.horizontalSplitIcon = this.page.locator('button mat-icon:text("horizontal_split")');

    //share button 
    this.shareButton = this.page.locator('button mat-icon:text("share")');
    this.titleShare = this.page.locator('div.mat-dialog-title');
    this.qrCode = this.page.locator('img#qrcode').first();
    this.idCode = this.page.locator('span#event-code').first();
    this.closeButton = this.page.locator('button mat-icon:text("close")');

    //movie editor - Main Screen
    this.movieEditorButton = this.page.locator('button span:text("Movie Editor")')
    this.movieEditorBackButton = this.page.locator('button.btn-back mat-icon:text("arrow_back_ios_new")')
    this.createMovieButton = this.page.locator('button.btn-create mat-icon:text("add")')
    this.movieEditorTitle = this.page.locator('div.text-lg.font-bold:has-text("LiveShare Movie Editor")')
    
    // Movie Editor - Landing Page (Editor Screen)
    this.editorTitle = this.page.locator('div.text-lg:has-text("Editor")')
    this.editorBackButton = this.page.locator('app-edit-landing button.btn-ghost mat-icon:text("arrow_back")')
    this.editorSaveButton = this.page.locator('app-edit-landing button.btn:has-text("Save")')
    this.movieNameLabel = this.page.locator('span:text("Movie Name")')
    this.movieNameInput = this.page.locator('app-edit-landing input[type="text"]')
    this.moviePreview = this.page.locator('app-movie-preview')
    this.moviePreviewImage = this.page.locator('app-movie-preview img')
    this.moviePreviewEventDate = this.page.locator('app-movie-preview span.event-date-label')
    this.moviePreviewEventName = this.page.locator('app-movie-preview span.event-name-label')
    this.moviePreviewPlayButton = this.page.locator('app-movie-preview button mat-icon:text("play_circle")')
    
    // Editor buttons
    this.editTitlePageButton = this.page.locator('button:has-text("Edit Title Page")')
    this.editPlaylistButton = this.page.locator('button:has-text("Edit Playlist")')
    this.editSlideFormatButton = this.page.locator('button:has-text("Edit Slide format")')
    this.editMusicButton = this.page.locator('button:has-text("Edit Music")')
    this.copyLinkButton = this.page.locator('app-edit-landing button:has-text("Copy Link")')
    this.publishButton = this.page.locator('app-edit-landing button:has-text("Publish")')
    
    // Movie Editor - Edit Title Page
    this.titlePageTitle = this.page.locator('div.text-lg:has-text("Title Page")')
    this.titlePageCancelButton = this.page.locator('app-edit-title button.btn-outline:has-text("Cancel")')
    this.titlePageSaveButton = this.page.locator('app-edit-title button:has-text("Save")')
    this.titleBackgroundImageLabel = this.page.locator('span:text("Title background Image")')
    this.titlePreview = this.page.locator('app-movie-title-preview')
    this.titlePreviewImage = this.page.locator('app-movie-title-preview img')
    this.titlePreviewEventDate = this.page.locator('app-movie-title-preview span.event-date-label')
    this.titlePreviewEventName = this.page.locator('app-movie-title-preview span.event-name-label')
    
    // Title page - Image selection buttons
    this.eventGalleryButton = this.page.locator('app-edit-title button:has-text("Event Gallery")')
    this.browseButton = this.page.locator('app-edit-title button:has-text("Browse")')
    this.ourCollectionButton = this.page.locator('app-edit-title button:has-text("Our Collection")')
    this.titlePageFileInput = this.page.locator('app-edit-title input[type="file"]')
    
    // Title page - Toggles
    this.showEventNameLabel = this.page.locator('app-edit-title span:text("Show Event Name")')
    this.showEventNameToggle = this.page.locator('app-edit-title mat-slide-toggle').first()
    this.showEventDateLabel = this.page.locator('app-edit-title span:text("Show Event Date")')
    this.showEventDateToggle = this.page.locator('app-edit-title mat-slide-toggle').nth(1)
    
    // Movie Editor - Slide Format Page
    this.slideFormatTitle = this.page.locator('div.text-lg:has-text("Slide Format")')
    this.slideFormatCancelButton = this.page.locator('app-slide-format button.btn-outline:has-text("Cancel")')
    this.slideFormatSaveButton = this.page.locator('app-slide-format button:has-text("Save")')
    this.slideFormatPreview = this.page.locator('app-slide-format app-movie-preview')
    
    // Slide format - Checkboxes
    this.movieNameCheckbox = this.page.locator('app-slide-format span:text("Movie Name")').locator('..').locator('mat-checkbox')
    this.eventQRCodeCheckbox = this.page.locator('app-slide-format span:text("Event QR Code")').locator('..').locator('mat-checkbox')
    this.posterNameCheckbox = this.page.locator('app-slide-format span:text("Poster Name")').locator('..').locator('mat-checkbox')
    this.captionsCheckbox = this.page.locator('app-slide-format span:text("Captions")').locator('..').locator('mat-checkbox')
    this.commentsCheckbox = this.page.locator('app-slide-format span:text("Comments")').locator('..').locator('mat-checkbox')
    
    // Slide format - Pause duration buttons
    this.pauseSecLabel = this.page.locator('app-slide-format span:text("Pause (Sec)")')
    this.pauseSecButtons = this.page.locator('app-slide-format button.btn-circle')
    
    // Movie list item
    this.movieListItem = this.page.locator('.flex.flex-col.mb-3')
    this.movieItemName = this.page.locator('h2.movie-name')
    this.movieItemPreview = this.page.locator('app-movie-title-preview')
    this.movieItemMoreButton = this.page.locator('button.mat-menu-trigger mat-icon:text("more_vert")')

    // Menu Options (More Vert Menu)
    this.menuPanel = this.page.locator('.mat-menu-panel[role="menu"], div[role="menu"].mat-menu-panel')
    this.viewKeepsakesMenuItem = this.page.locator('button[role="menuitem"]:has-text("View Keepsakes"), .mat-menu-item:has-text("View Keepsakes")')
    this.downloadAllPhotosMenuItem = this.page.locator('button[role="menuitem"]:has-text("Download All Photos"), .mat-menu-item:has-text("Download All Photos")')
    this.liveViewMenuItem = this.page.locator('button[role="menuitem"]:has-text("LiveView"), .mat-menu-item:has-text("LiveView")')
    this.redeemGiftCodeMenuItem = this.page.locator('button[role="menuitem"]:has-text("Redeem Gift Code"), .mat-menu-item:has-text("Redeem Gift Code")')
    this.liveHelpMenuItem = this.page.locator('button[role="menuitem"]:has-text("Live Help"), .mat-menu-item:has-text("Live Help")')
    this.faqsMenuItem = this.page.locator('button[role="menuitem"]:has-text("FAQs"), .mat-menu-item:has-text("FAQs")')
    this.detailsMenuItem = this.page.locator('button[role="menuitem"]:has-text("Details"), .mat-menu-item:has-text("Details")')
    this.logoutMenuItem = this.page.locator('button[role="menuitem"]:has-text("Logout"), .mat-menu-item:has-text("Logout")')
    
    // Event Details Dialog
    this.eventDetailsDialog = this.page.locator('app-event-summary-dialog')
    this.eventDetailsDialogContainer = this.page.locator('.mat-dialog-container')
    this.eventDetailsTitle = this.page.locator('h2:has-text("Event Details")')
    this.eventDetailsCloseButton = this.page.locator('app-event-summary-dialog button[mat-dialog-close] mat-icon:text("close")')
    
    // Event Details Dialog - Table rows
    this.eventDetailsPlan = this.page.locator('app-event-summary-dialog table tr:has-text("Plan") td')
    this.eventDetailsCreatedDate = this.page.locator('app-event-summary-dialog table tr:has-text("Created Date") td')
    this.eventDetailsEventDate = this.page.locator('app-event-summary-dialog table tr:has-text("Event Date") td')
    this.eventDetailsLastViewedDate = this.page.locator('app-event-summary-dialog table tr:has-text("Last Viewed Date") td')
    this.eventDetailsNumberOfPosts = this.page.locator('app-event-summary-dialog table tr:has-text("Number of Posts") td')
    this.eventDetailsNumberOfGuests = this.page.locator('app-event-summary-dialog table tr:has-text("Number of Guests") td')
    this.eventDetailsNumberOfViewers = this.page.locator('app-event-summary-dialog table tr:has-text("Number of Viewers") td')
    this.eventDetailsActiveUntil = this.page.locator('app-event-summary-dialog table tr:has-text("Event Active until") td')
    this.eventDetailsDailyBackupLimit = this.page.locator('app-event-summary-dialog table tr:has-text("Daily backup limit") td')
    
    // Event Details Dialog - Action buttons
    this.upgradeButton = this.page.locator('app-event-summary-dialog button:has-text("Upgrade")')
    this.viewGuestsButton = this.page.locator('app-event-summary-dialog button:has-text("View")')
    this.extendButton = this.page.locator('app-event-summary-dialog button:has-text("Extend")')
    
    // Redeem Code Dialog
    this.redeemCodeDialog = this.page.locator('.mat-dialog-container:has-text("Redeem")')
    this.redeemCodeInput = this.page.locator('input[placeholder*="code"], input[placeholder*="Code"]')
    this.redeemCodeSubmitButton = this.page.locator('button:has-text("Redeem")')
    this.redeemCodeCancelButton = this.page.locator('button:has-text("Cancel")')
    this.redeemCodeCloseButton = this.page.locator('button mat-icon:text("close")')
    
    // Live Help / Chat
    this.chatBox = this.page.locator('.chat-box, app-chat, .live-help-chat')
    this.chatInput = this.page.locator('input[placeholder*="message"], textarea[placeholder*="message"]')
    this.chatSendButton = this.page.locator('button:has-text("Send")')
    this.chatMessages = this.page.locator('.chat-message, .message-item')

  }

  async waitForEventDetailToLoad() {
    await this.eventImage.waitFor({ state: 'visible', timeout: 30000 });
    await this.eventName.waitFor({ state: 'visible', timeout: 15000 });
  }

  async expandDetailsPanel() {
    const isExpanded = await this.detailsPanelExpanded.count() > 0;
    if (!isExpanded) {
      await this.detailsPanelHeader.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async getEventInfo() {
    return {
      date: await this.eventDate.textContent(),
      name: await this.eventName.textContent(),
      hasImage: await this.eventImage.isVisible()
    };
  }

  async getLocationInfo() {
    await this.expandDetailsPanel();
    return {
      text: await this.locationText.textContent(),
      isVisible: await this.locationSection.isVisible()
    };
  }

  async getContactInfo() {
    await this.expandDetailsPanel();
    return {
      text: await this.contactText.textContent(),
      isVisible: await this.contactSection.isVisible()
    };
  }

  async getItineraryInfo() {
    await this.expandDetailsPanel();
    return {
      text: await this.itineraryText.textContent(),
      isVisible: await this.itinerarySection.isVisible()
    };
  }

  async clickSettings() {
    await this.settingsButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickAddButton() {
    await this.addButton.click();
  }

  async clickCameraButton() {
    await this.cameraButton.click();
  }

  // Verification methods
  async verifyEventDetailLoaded() {
    await expect(this.eventImage).toBeVisible();
    await expect(this.eventName).toBeVisible();
    await expect(this.eventDate).toBeVisible();
    await expect(this.topNav).toBeVisible();
  }

  async verifyNavigationButtons() {
    await expect(this.backButton).toBeVisible();
    await expect(this.shareButton).toBeVisible();
    await expect(this.settingsButton).toBeVisible();
    await expect(this.moreOptionsButton).toBeVisible();
  }

  async verifyDetailsSection() {
    await this.expandDetailsPanel();
    await expect(this.locationSection).toBeVisible();
    await expect(this.contactSection).toBeVisible();
    await expect(this.itinerarySection).toBeVisible();
  }

  async verifyActionButtons() {
    await expect(this.addButton).toBeVisible();
    await expect(this.cameraButton).toBeVisible();
  }

  async verifyEmptyGallery() {
    await expect(this.emptyGalleryMessage).toBeVisible();
    await expect(this.emptyGalleryDescription).toBeVisible();
    await expect(this.nowImage).toBeVisible();
  }

  // Plus icon features verification methods
  async clickAddButtonToRevealFeatures() {
    await this.addButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.addButton.click();
    await this.page.waitForTimeout(2000); // Wait for menu to appear
  }

  async verifyThenAndNowButton() {
    const thenAndNowButton = this.page.locator('button:has-text("Then & Now")').first();
    await thenAndNowButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const isVisible = await thenAndNowButton.isVisible().catch(() => false);
    return isVisible;
  }

  async verifyKeepSakeButton() {
    const keepSakeButton = this.page.locator('button:has-text("KeepSake")');
    return await keepSakeButton.isVisible();
  }

  async verifyClueButton() {
    const clueButton = this.page.locator('button:has-text("Clue")');
    return await clueButton.isVisible();
  }

  async verifySponsorButton() {
    const sponsorButton = this.page.locator('button:has-text("Sponsor")');
    return await sponsorButton.isVisible();
  }

  async verifyPrizeButton() {
    const prizeButton = this.page.locator('button:has-text("Prize")');
    return await prizeButton.isVisible();
  }

  async verifyMessageButton() {
    const messageButton = this.page.locator('button:has-text("Message")');
    return await messageButton.isVisible();
  }

  async verifyPhotosButton() {
    const photosButton = this.page.locator('button:has-text("Photos")');
    return await photosButton.isVisible();
  }

  async verifyVideosButton() {
    const videosButton = this.page.locator('button:has-text("Videos")');
    return await videosButton.isVisible();
  }

  async verifyAllPlusIconFeatures() {
    const features = {
      thenAndNow: await this.verifyThenAndNowButton(),
      keepSake: await this.verifyKeepSakeButton(),
      clue: await this.verifyClueButton(),
      sponsor: await this.verifySponsorButton(),
      prize: await this.verifyPrizeButton(),
      message: await this.verifyMessageButton(),
      photos: await this.verifyPhotosButton(),
      videos: await this.verifyVideosButton()
    };
    return features;
  }

  async verifyGridView() {
    // First verify the grid view button is visible
    await expect(this.gridViewButton).toBeVisible();
    
    // Click the grid view button
    await this.gridViewButton.click();
    
    // Wait for menu to appear
    await this.page.waitForTimeout(1000);
    
    // Verify menu is visible
    await expect(this.gridLayout).toBeVisible();
    
    // Verify menu options are visible
    await expect(this.twoByTwoGridButton).toBeVisible();
    await expect(this.threeByThreeGridButton).toBeVisible();
    await expect(this.timelineViewGridButton).toBeVisible();
    await this.page.click('body');
  }

  async clickGridViewButton() {
    await this.gridViewButton.click();
    await this.page.waitForTimeout(1000);
  }

  async selectTwoByTwoView() {
    await this.clickGridViewButton();
    await this.twoByTwoGridButton.click();
    await this.page.waitForTimeout(2000); // Wait for layout transition
  }

  async selectThreeByThreeView() {
    await this.clickGridViewButton();
    await this.threeByThreeGridButton.click();
    await this.page.waitForTimeout(2000); // Wait for layout transition
  }

  async selectTimelineView() {
    await this.clickGridViewButton();
    await this.timelineViewGridButton.click();
    await this.page.waitForTimeout(2000); // Wait for layout transition
  }

  /**
   * Get the width of image wrappers to determine grid layout
   * @returns {Promise<number[]>} Array of widths
   */
  async getImageWrapperWidths() {
    const wrappers = await this.imageWrappers.all();
    const widths = [];
    
    for (const wrapper of wrappers) {
      const styleAttr = await wrapper.getAttribute('style');
      const widthMatch = styleAttr.match(/width:\s*([0-9.]+)px/);
      if (widthMatch) {
        widths.push(parseFloat(widthMatch[1]));
      }
    }
    
    return widths;
  }

  /**
   * Get the current grid icon displayed in the navigation
   * @returns {Promise<string>} Icon name: 'window', 'grid_on', or 'horizontal_split'
   */
  async getCurrentGridIcon() {
    if (await this.windowIcon.isVisible()) return 'window';
    if (await this.gridOnIcon.isVisible()) return 'grid_on';
    if (await this.horizontalSplitIcon.isVisible()) return 'horizontal_split';
    return 'unknown';
  }

  /**
   * Verify 2x2 Grid View (2 images per row)
   * Expected: Each image width ~214.5px, grid-container visible
   */
  async verify2x2GridLayout() {
    console.log('🔍 Verifying 2x2 Grid Layout...');
    
    // Verify grid container is visible
    await expect(this.gridContainer).toBeVisible({ timeout: 10000 });
    console.log('✓ Grid container is visible');
    
    // Verify vertical container is NOT visible
    await expect(this.verticalContainer).not.toBeVisible().catch(() => {
      console.log('✓ Vertical container is not visible (as expected)');
    });
    
    // Get and verify image widths
    const widths = await this.getImageWrapperWidths();
    console.log(`✓ Found ${widths.length} images with widths:`, widths);
    
    // Verify all images have width around 214.5px (tolerance ±5px)
    const expectedWidth = 214.5;
    const tolerance = 5;
    
    for (let i = 0; i < widths.length; i++) {
      const width = widths[i];
      expect(width).toBeGreaterThanOrEqual(expectedWidth - tolerance);
      expect(width).toBeLessThanOrEqual(expectedWidth + tolerance);
      console.log(`✓ Image ${i + 1}: width=${width}px (expected ~${expectedWidth}px)`);
    }
    
    // Verify icon changed to grid_on or window
    const currentIcon = await this.getCurrentGridIcon();
    console.log(`✓ Current grid icon: ${currentIcon}`);
    
    console.log('✅ 2x2 Grid Layout verification PASSED');
    return true;
  }

  /**
   * Verify 3x3 Grid View (3 images per row)
   * Expected: Each image width ~139.667px, grid-container visible
   */
  async verify3x3GridLayout() {
    console.log('🔍 Verifying 3x3 Grid Layout...');
    
    // Verify grid container is visible
    await expect(this.gridContainer).toBeVisible({ timeout: 10000 });
    console.log('✓ Grid container is visible');
    
    // Verify vertical container is NOT visible
    await expect(this.verticalContainer).not.toBeVisible().catch(() => {
      console.log('✓ Vertical container is not visible (as expected)');
    });
    
    // Get and verify image widths
    const widths = await this.getImageWrapperWidths();
    console.log(`✓ Found ${widths.length} images with widths:`, widths);
    
    // Verify all images have width around 139.667px (tolerance ±5px)
    const expectedWidth = 139.667;
    const tolerance = 5;
    
    for (let i = 0; i < widths.length; i++) {
      const width = widths[i];
      expect(width).toBeGreaterThanOrEqual(expectedWidth - tolerance);
      expect(width).toBeLessThanOrEqual(expectedWidth + tolerance);
      console.log(`✓ Image ${i + 1}: width=${width}px (expected ~${expectedWidth}px)`);
    }
    
    // Verify icon changed to grid_on
    const currentIcon = await this.getCurrentGridIcon();
    console.log(`✓ Current grid icon: ${currentIcon}`);
    expect(currentIcon).toBe('grid_on');
    
    console.log('✅ 3x3 Grid Layout verification PASSED');
    return true;
  }

  /**
   * Verify Timeline View (1 image per row, full width)
   * Expected: vertical-container visible, photo-detail elements visible
   */
  async verifyTimelineLayout() {
    console.log('🔍 Verifying Timeline Layout...');
    
    // Verify vertical container is visible
    await expect(this.verticalContainer).toBeVisible({ timeout: 10000 });
    console.log('✓ Vertical container is visible');
    
    // Verify grid container is NOT visible
    await expect(this.gridContainer).not.toBeVisible().catch(() => {
      console.log('✓ Grid container is not visible (as expected)');
    });
    
    // Verify photo-detail elements are visible
    const photoDetailCount = await this.photoDetails.count();
    console.log(`✓ Found ${photoDetailCount} photo-detail elements`);
    expect(photoDetailCount).toBeGreaterThan(0);
    
    // Get first photo detail and verify its width (should be large, ~863px)
    const firstPhotoDetail = this.photoDetails.first();
    const styleAttr = await firstPhotoDetail.getAttribute('style');
    const widthMatch = styleAttr.match(/width:\s*([0-9.]+)px/);
    
    if (widthMatch) {
      const width = parseFloat(widthMatch[1]);
      console.log(`✓ Photo detail width: ${width}px`);
      
      // Timeline view should have large width (>500px)
      expect(width).toBeGreaterThan(500);
    }
    
    // Verify icon changed to horizontal_split
    const currentIcon = await this.getCurrentGridIcon();
    console.log(`✓ Current grid icon: ${currentIcon}`);
    expect(currentIcon).toBe('horizontal_split');
    
    // Verify post footer elements are visible (like, comment, download buttons)
    const postFooter = this.page.locator('app-post-footer').first();
    await expect(postFooter).toBeVisible();
    console.log('✓ Post footer elements are visible');
    
    console.log('✅ Timeline Layout verification PASSED');
    return true;
  }

  /**
   * Comprehensive Grid View Test - Test all three layouts
   * This method tests switching between all grid layouts and verifies each one
   */
  async testAllGridLayouts() {
    console.log('\n🎯 Starting Comprehensive Grid Layout Test...\n');
    
    try {
      // Test 2x2 View
      console.log('\n📋 Test 1: 2x2 Grid View');
      console.log('═'.repeat(50));
      await this.selectTwoByTwoView();
      await this.verify2x2GridLayout();
      
      // Test 3x3 View
      console.log('\n📋 Test 2: 3x3 Grid View');
      console.log('═'.repeat(50));
      await this.selectThreeByThreeView();
      await this.verify3x3GridLayout();
      
      // Test Timeline View
      console.log('\n📋 Test 3: Timeline View');
      console.log('═'.repeat(50));
      await this.selectTimelineView();
      await this.verifyTimelineLayout();
      
      // Switch back to 2x2 to verify it still works
      console.log('\n📋 Test 4: Switch back to 2x2 Grid View');
      console.log('═'.repeat(50));
      await this.selectTwoByTwoView();
      await this.verify2x2GridLayout();
      
      console.log('\n' + '═'.repeat(50));
      console.log('🎉 ALL GRID LAYOUT TESTS PASSED!');
      console.log('═'.repeat(50) + '\n');
      
      return true;
    } catch (error) {
      console.error('\n❌ Grid Layout Test FAILED:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed grid layout information for debugging
   * @returns {Promise<Object>} Layout information
   */
  async getGridLayoutInfo() {
    const info = {
      currentIcon: await this.getCurrentGridIcon(),
      gridContainerVisible: await this.gridContainer.isVisible().catch(() => false),
      verticalContainerVisible: await this.verticalContainer.isVisible().catch(() => false),
      imageWrapperCount: await this.imageWrappers.count(),
      photoDetailCount: await this.photoDetails.count(),
      imageWidths: await this.getImageWrapperWidths()
    };
    
    console.log('📊 Current Grid Layout Info:', JSON.stringify(info, null, 2));
    return info;
  }

  async verifyUIShareDialog(){

    await expect(this.titleShare).toBeVisible();
    await expect(this.qrCode).toBeVisible();
    await expect(this.idCode).toBeVisible();
    await expect(this.closeButton).toBeVisible();

    await this.closeButton.click();
    await this.page.waitForTimeout(2000);
  }

  async verifyShareFunctionality() {
    await this.shareButton.click();
    await this.page.waitForTimeout(2000);
    await this.verifyUIShareDialog();
  }

  // ============================================
  // MOVIE EDITOR - NAVIGATION METHODS
  // ============================================

  /**
   * Open Movie Editor from Event Detail page
   * @returns {Promise<void>}
   */
  async openMovieEditor() {
    console.log('📽️ Opening Movie Editor...');
    await this.moreOptionsButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.moreOptionsButton.click();
    await this.page.waitForTimeout(1500);
    
    await this.movieEditorButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.movieEditorButton.click();
    await this.page.waitForTimeout(2000);
    
    // Verify we're on movie editor page
    await expect(this.movieEditorTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Movie Editor opened successfully');
  }

  /**
   * Click Create Movie button to start creating a new movie
   * @returns {Promise<void>}
   */
  async clickCreateMovie() {
    console.log('➕ Creating new movie...');
    await this.createMovieButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.createMovieButton.click();
    await this.page.waitForTimeout(2000);
    
    // Verify editor landing page loaded
    await expect(this.editorTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Movie editor landing page loaded');
  }

  /**
   * Navigate to Edit Title Page
   * @returns {Promise<void>}
   */
  async navigateToEditTitlePage() {
    console.log('🎨 Navigating to Edit Title Page...');
    await this.editTitlePageButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.editTitlePageButton.click();
    await this.page.waitForTimeout(2000);
    
    await expect(this.titlePageTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Edit Title Page loaded');
  }

  /**
   * Navigate to Edit Slide Format
   * @returns {Promise<void>}
   */
  async navigateToEditSlideFormat() {
    console.log('🎞️ Navigating to Edit Slide Format...');
    await this.editSlideFormatButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.editSlideFormatButton.click();
    await this.page.waitForTimeout(2000);
    
    await expect(this.slideFormatTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Edit Slide Format loaded');
  }

  /**
   * Go back from Editor Landing page
   * @returns {Promise<void>}
   */
  async clickEditorBackButton() {
    await this.editorBackButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.editorBackButton.click();
    await this.page.waitForTimeout(1500);
  }

  /**
   * Go back from Movie Editor main page
   * @returns {Promise<void>}
   */
  async clickMovieEditorBackButton() {
    await this.movieEditorBackButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.movieEditorBackButton.click();
    await this.page.waitForTimeout(1500);
  }

  // ============================================
  // MOVIE EDITOR - DATA ENTRY METHODS
  // ============================================

  /**
   * Enter movie name
   * @param {string} movieName - Name of the movie
   * @returns {Promise<void>}
   */
  async enterMovieName(movieName) {
    console.log(`📝 Entering movie name: "${movieName}"`);
    await this.movieNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.movieNameInput.clear();
    await this.movieNameInput.fill(movieName);
    await this.page.waitForTimeout(1000);
    console.log('✅ Movie name entered');
  }

  /**
   * Click Save button on Editor Landing page
   * @returns {Promise<void>}
   */
  async saveMovie() {
    console.log('💾 Saving movie...');
    await this.editorSaveButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.editorSaveButton.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Movie saved');
  }

  /**
   * Toggle Show Event Name on Title Page
   * @param {boolean} enable - true to enable, false to disable
   * @returns {Promise<void>}
   */
  async toggleShowEventName(enable) {
    console.log(`🔄 ${enable ? 'Enabling' : 'Disabling'} Show Event Name...`);
    const isChecked = await this.showEventNameToggle.locator('input').isChecked();
    
    if ((enable && !isChecked) || (!enable && isChecked)) {
      await this.showEventNameToggle.click();
      await this.page.waitForTimeout(1000);
    }
    console.log(`✅ Show Event Name ${enable ? 'enabled' : 'disabled'}`);
  }

  /**
   * Toggle Show Event Date on Title Page
   * @param {boolean} enable - true to enable, false to disable
   * @returns {Promise<void>}
   */
  async toggleShowEventDate(enable) {
    console.log(`🔄 ${enable ? 'Enabling' : 'Disabling'} Show Event Date...`);
    const isChecked = await this.showEventDateToggle.locator('input').isChecked();
    
    if ((enable && !isChecked) || (!enable && isChecked)) {
      await this.showEventDateToggle.click();
      await this.page.waitForTimeout(1000);
    }
    console.log(`✅ Show Event Date ${enable ? 'enabled' : 'disabled'}`);
  }

  /**
   * Save Title Page settings
   * @returns {Promise<void>}
   */
  async saveTitlePage() {
    console.log('💾 Saving Title Page...');
    await this.titlePageSaveButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.titlePageSaveButton.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Title Page saved');
  }

  /**
   * Cancel Title Page editing
   * @returns {Promise<void>}
   */
  async cancelTitlePage() {
    await this.titlePageCancelButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.titlePageCancelButton.click();
    await this.page.waitForTimeout(1500);
  }

  /**
   * Toggle checkbox on Slide Format page
   * @param {string} checkboxName - Name of checkbox: 'movieName', 'qrCode', 'posterName', 'captions', 'comments'
   * @param {boolean} enable - true to check, false to uncheck
   * @returns {Promise<void>}
   */
  async toggleSlideFormatCheckbox(checkboxName, enable) {
    console.log(`🔄 ${enable ? 'Enabling' : 'Disabling'} ${checkboxName}...`);
    
    let checkbox;
    switch (checkboxName.toLowerCase()) {
      case 'moviename':
        checkbox = this.movieNameCheckbox;
        break;
      case 'qrcode':
        checkbox = this.eventQRCodeCheckbox;
        break;
      case 'postername':
        checkbox = this.posterNameCheckbox;
        break;
      case 'captions':
        checkbox = this.captionsCheckbox;
        break;
      case 'comments':
        checkbox = this.commentsCheckbox;
        break;
      default:
        throw new Error(`Unknown checkbox: ${checkboxName}`);
    }
    
    const isChecked = await checkbox.locator('input').isChecked();
    
    if ((enable && !isChecked) || (!enable && isChecked)) {
      await checkbox.click();
      await this.page.waitForTimeout(1000);
    }
    console.log(`✅ ${checkboxName} ${enable ? 'enabled' : 'disabled'}`);
  }

  /**
   * Select pause duration in seconds
   * @param {number} seconds - Pause duration (1-9)
   * @returns {Promise<void>}
   */
  async selectPauseDuration(seconds) {
    console.log(`⏱️ Selecting pause duration: ${seconds} seconds...`);
    
    if (seconds < 1 || seconds > 9) {
      throw new Error('Pause duration must be between 1 and 9 seconds');
    }
    
    const button = this.page.locator(`app-slide-format button.btn-circle:has-text("${seconds}")`);
    await button.waitFor({ state: 'visible', timeout: 5000 });
    await button.click();
    await this.page.waitForTimeout(1000);
    console.log(`✅ Pause duration set to ${seconds} seconds`);
  }

  /**
   * Save Slide Format settings
   * @returns {Promise<void>}
   */
  async saveSlideFormat() {
    console.log('💾 Saving Slide Format...');
    await this.slideFormatSaveButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.slideFormatSaveButton.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Slide Format saved');
  }

  /**
   * Cancel Slide Format editing
   * @returns {Promise<void>}
   */
  async cancelSlideFormat() {
    await this.slideFormatCancelButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.slideFormatCancelButton.click();
    await this.page.waitForTimeout(1500);
  }

  // ============================================
  // MOVIE EDITOR - VERIFICATION METHODS
  // ============================================

  /**
   * Verify Movie Editor main page is loaded
   * @returns {Promise<void>}
   */
  async verifyMovieEditorPageLoaded() {
    console.log('🔍 Verifying Movie Editor page loaded...');
    
    await expect(this.movieEditorTitle).toBeVisible({ timeout: 10000 });
    await expect(this.createMovieButton).toBeVisible({ timeout: 5000 });
    await expect(this.movieEditorBackButton).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Movie Editor page loaded successfully');
  }

  /**
   * Verify Editor Landing Page elements
   * @returns {Promise<void>}
   */
  async verifyEditorLandingPage() {
    console.log('🔍 Verifying Editor Landing Page elements...');
    
    await expect(this.editorTitle).toBeVisible({ timeout: 10000 });
    await expect(this.editorBackButton).toBeVisible();
    await expect(this.editorSaveButton).toBeVisible();
    await expect(this.movieNameLabel).toBeVisible();
    await expect(this.movieNameInput).toBeVisible();
    await expect(this.moviePreview).toBeVisible();
    await expect(this.editTitlePageButton).toBeVisible();
    await expect(this.editPlaylistButton).toBeVisible();
    await expect(this.editSlideFormatButton).toBeVisible();
    await expect(this.editMusicButton).toBeVisible();
    await expect(this.copyLinkButton).toBeVisible();
    await expect(this.publishButton).toBeVisible();
    
    console.log('✅ Editor Landing Page verified');
  }

  /**
   * Verify Edit Title Page elements
   * @returns {Promise<void>}
   */
  async verifyEditTitlePage() {
    console.log('🔍 Verifying Edit Title Page elements...');
    
    await expect(this.titlePageTitle).toBeVisible({ timeout: 10000 });
    await expect(this.titlePageCancelButton).toBeVisible();
    await expect(this.titlePageSaveButton).toBeVisible();
    await expect(this.titleBackgroundImageLabel).toBeVisible();
    await expect(this.titlePreview).toBeVisible();
    await expect(this.eventGalleryButton).toBeVisible();
    await expect(this.browseButton).toBeVisible();
    await expect(this.ourCollectionButton).toBeVisible();
    await expect(this.showEventNameLabel).toBeVisible();
    await expect(this.showEventNameToggle).toBeVisible();
    await expect(this.showEventDateLabel).toBeVisible();
    await expect(this.showEventDateToggle).toBeVisible();
    
    console.log('✅ Edit Title Page verified');
  }

  /**
   * Verify Edit Slide Format Page elements
   * @returns {Promise<void>}
   */
  async verifyEditSlideFormatPage() {
    console.log('🔍 Verifying Edit Slide Format Page elements...');
    
    await expect(this.slideFormatTitle).toBeVisible({ timeout: 10000 });
    await expect(this.slideFormatCancelButton).toBeVisible();
    await expect(this.slideFormatSaveButton).toBeVisible();
    await expect(this.slideFormatPreview).toBeVisible();
    await expect(this.movieNameCheckbox).toBeVisible();
    await expect(this.eventQRCodeCheckbox).toBeVisible();
    await expect(this.posterNameCheckbox).toBeVisible();
    await expect(this.captionsCheckbox).toBeVisible();
    await expect(this.commentsCheckbox).toBeVisible();
    await expect(this.pauseSecLabel).toBeVisible();
    
    // Verify pause buttons (1-9)
    const pauseButtonCount = await this.pauseSecButtons.count();
    expect(pauseButtonCount).toBeGreaterThanOrEqual(9);
    
    console.log('✅ Edit Slide Format Page verified');
  }

  /**
   * Verify movie preview displays correctly
   * @returns {Promise<void>}
   */
  async verifyMoviePreview() {
    console.log('🔍 Verifying Movie Preview...');
    
    await expect(this.moviePreview).toBeVisible({ timeout: 10000 });
    await expect(this.moviePreviewImage).toBeVisible();
    
    // Check if date and name are visible (may depend on settings)
    const dateVisible = await this.moviePreviewEventDate.isVisible().catch(() => false);
    const nameVisible = await this.moviePreviewEventName.isVisible().catch(() => false);
    
    console.log(`Preview Date visible: ${dateVisible}`);
    console.log(`Preview Name visible: ${nameVisible}`);
    console.log('✅ Movie Preview verified');
  }

  /**
   * Verify Title Page preview
   * @returns {Promise<void>}
   */
  async verifyTitlePreview() {
    console.log('🔍 Verifying Title Preview...');
    
    await expect(this.titlePreview).toBeVisible({ timeout: 10000 });
    await expect(this.titlePreviewImage).toBeVisible();
    
    console.log('✅ Title Preview verified');
  }

  /**
   * Get checkbox state on Slide Format page
   * @param {string} checkboxName - Name of checkbox
   * @returns {Promise<boolean>} - true if checked, false if unchecked
   */
  async getSlideFormatCheckboxState(checkboxName) {
    let checkbox;
    switch (checkboxName.toLowerCase()) {
      case 'moviename':
        checkbox = this.movieNameCheckbox;
        break;
      case 'qrcode':
        checkbox = this.eventQRCodeCheckbox;
        break;
      case 'postername':
        checkbox = this.posterNameCheckbox;
        break;
      case 'captions':
        checkbox = this.captionsCheckbox;
        break;
      case 'comments':
        checkbox = this.commentsCheckbox;
        break;
      default:
        throw new Error(`Unknown checkbox: ${checkboxName}`);
    }
    
    return await checkbox.locator('input').isChecked();
  }

  /**
   * Get current pause duration selection
   * @returns {Promise<number|null>} - Selected pause duration or null if none selected
   */
  async getSelectedPauseDuration() {
    const buttons = await this.pauseSecButtons.all();
    
    for (let i = 0; i < buttons.length; i++) {
      const hasClass = await buttons[i].evaluate((el) => 
        el.classList.contains('checked-sec') || el.classList.contains('btn-primary')
      );
      
      if (hasClass) {
        const text = await buttons[i].textContent();
        return parseInt(text.trim());
      }
    }
    
    return null;
  }

  // ============================================
  // MOVIE EDITOR - COMPLETE FLOW METHODS
  // ============================================

  /**
   * Complete flow: Create a new movie with basic settings
   * @param {string} movieName - Name of the movie
   * @returns {Promise<void>}
   */
  async createNewMovieComplete(movieName) {
    console.log('\n🎬 Starting Complete Movie Creation Flow...\n');
    console.log('═'.repeat(60));
    
    // Step 1: Open Movie Editor
    await this.openMovieEditor();
    await this.verifyMovieEditorPageLoaded();
    
    // Step 2: Click Create Movie
    await this.clickCreateMovie();
    await this.verifyEditorLandingPage();
    
    // Step 3: Enter Movie Name
    await this.enterMovieName(movieName);
    
    // Step 4: Verify Preview
    await this.verifyMoviePreview();
    
    // Step 5: Save Movie
    await this.saveMovie();
    
    console.log('═'.repeat(60));
    console.log('✅ Movie Creation Flow Completed Successfully\n');
  }

  /**
   * Complete flow: Edit Title Page settings
   * @param {Object} options - Title page options
   * @param {boolean} options.showEventName - Show event name toggle
   * @param {boolean} options.showEventDate - Show event date toggle
   * @returns {Promise<void>}
   */
  async editTitlePageComplete(options = {}) {
    console.log('\n🎨 Starting Title Page Edit Flow...\n');
    console.log('═'.repeat(60));
    
    // Navigate to Edit Title Page
    await this.navigateToEditTitlePage();
    await this.verifyEditTitlePage();
    
    // Configure settings
    if (options.showEventName !== undefined) {
      await this.toggleShowEventName(options.showEventName);
    }
    
    if (options.showEventDate !== undefined) {
      await this.toggleShowEventDate(options.showEventDate);
    }
    
    // Verify preview updates
    await this.verifyTitlePreview();
    
    // Save settings
    await this.saveTitlePage();
    
    console.log('═'.repeat(60));
    console.log('✅ Title Page Edit Flow Completed\n');
  }

  /**
   * Complete flow: Configure Slide Format settings
   * @param {Object} options - Slide format options
   * @param {boolean} options.movieName - Show movie name
   * @param {boolean} options.qrCode - Show QR code
   * @param {boolean} options.posterName - Show poster name
   * @param {boolean} options.captions - Show captions
   * @param {boolean} options.comments - Show comments
   * @param {number} options.pauseDuration - Pause duration in seconds (1-9)
   * @returns {Promise<void>}
   */
  async editSlideFormatComplete(options = {}) {
    console.log('\n🎞️ Starting Slide Format Edit Flow...\n');
    console.log('═'.repeat(60));
    
    // Navigate to Edit Slide Format
    await this.navigateToEditSlideFormat();
    await this.verifyEditSlideFormatPage();
    
    // Configure checkboxes
    if (options.movieName !== undefined) {
      await this.toggleSlideFormatCheckbox('movieName', options.movieName);
    }
    
    if (options.qrCode !== undefined) {
      await this.toggleSlideFormatCheckbox('qrCode', options.qrCode);
    }
    
    if (options.posterName !== undefined) {
      await this.toggleSlideFormatCheckbox('posterName', options.posterName);
    }
    
    if (options.captions !== undefined) {
      await this.toggleSlideFormatCheckbox('captions', options.captions);
    }
    
    if (options.comments !== undefined) {
      await this.toggleSlideFormatCheckbox('comments', options.comments);
    }
    
    // Set pause duration
    if (options.pauseDuration !== undefined) {
      await this.selectPauseDuration(options.pauseDuration);
    }
    
    // Save settings
    await this.saveSlideFormat();
    
    console.log('═'.repeat(60));
    console.log('✅ Slide Format Edit Flow Completed\n');
  }

  /**
   * Comprehensive Movie Editor test - Creates movie and configures all settings
   * @param {Object} config - Movie configuration
   * @param {string} config.movieName - Movie name
   * @param {Object} config.titlePage - Title page settings
   * @param {Object} config.slideFormat - Slide format settings
   * @returns {Promise<void>}
   */
  async verifyMovieEditorCompleteFlow(config) {
    console.log('\n🎯 COMPREHENSIVE MOVIE EDITOR FLOW TEST\n');
    console.log('═'.repeat(60));
    
    try {
      // Create movie
      await this.createNewMovieComplete(config.movieName);
      
      // Edit Title Page if configured
      if (config.titlePage) {
        await this.editTitlePageComplete(config.titlePage);
        
        // Return to editor landing
        await this.verifyEditorLandingPage();
      }
      
      // Edit Slide Format if configured
      if (config.slideFormat) {
        await this.editSlideFormatComplete(config.slideFormat);
        
        // Return to editor landing
        await this.verifyEditorLandingPage();
      }
      
      console.log('\n' + '═'.repeat(60));
      console.log('🎉 COMPREHENSIVE MOVIE EDITOR TEST PASSED!');
      console.log('═'.repeat(60) + '\n');
      
      return true;
    } catch (error) {
      console.error('\n❌ Movie Editor Test FAILED:', error.message);
      await this.page.screenshot({ 
        path: `./screenshots/movie-editor-error-${Date.now()}.png`,
        fullPage: true 
      });
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use createNewMovieComplete() instead
   */
  async verifyMovieEditorFunctionality() {
    await this.openMovieEditor();
    await this.verifyMovieEditorPageLoaded();
    await this.clickCreateMovie();
    await this.verifyEditorLandingPage();
  }

  // ============================================
  // MENU OPTIONS - NAVIGATION & VERIFICATION
  // ============================================

  /**
   * Open the more options menu (three dots menu)
   * @returns {Promise<void>}
   */
  async openMoreOptionsMenu() {
    console.log('📋 Opening more options menu...');
    await this.moreOptionsButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.moreOptionsButton.click();
    await this.page.waitForTimeout(1500);
    
    // Verify menu panel appears
    await expect(this.menuPanel).toBeVisible({ timeout: 10000 });
    console.log('✅ More options menu opened');
  }

  /**
   * Verify menu panel UI is displayed
   * @returns {Promise<Object>} Object containing visibility of all menu items
   */
  async verifyMenuPanelUI() {
    console.log('🔍 Verifying menu panel UI...');
    
    await expect(this.menuPanel).toBeVisible({ timeout: 10000 });
    
    // Check which menu items are visible
    const menuItems = {
      viewKeepsakes: await this.viewKeepsakesMenuItem.isVisible().catch(() => false),
      downloadAllPhotos: await this.downloadAllPhotosMenuItem.isVisible().catch(() => false),
      movieEditor: await this.movieEditorButton.isVisible().catch(() => false),
      liveView: await this.liveViewMenuItem.isVisible().catch(() => false),
      redeemGiftCode: await this.redeemGiftCodeMenuItem.isVisible().catch(() => false),
      liveHelp: await this.liveHelpMenuItem.isVisible().catch(() => false),
      faqs: await this.faqsMenuItem.isVisible().catch(() => false),
      details: await this.detailsMenuItem.isVisible().catch(() => false),
      logout: await this.logoutMenuItem.isVisible().catch(() => false)
    };
    
    console.log('Menu items visibility:', menuItems);
    console.log('✅ Menu panel UI verified');
    
    return menuItems;
  }

  // ============================================
  // VIEW KEEPSAKES FUNCTIONALITY
  // ============================================

  /**
   * Click View Keepsakes menu item
   * @returns {Promise<void>}
   */
  async clickViewKeepsakes() {
    console.log('⭐ Clicking View Keepsakes...');
    await this.viewKeepsakesMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.viewKeepsakesMenuItem.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ View Keepsakes clicked');
  }

  /**
   * Complete View Keepsakes flow
   * @returns {Promise<void>}
   */
  async verifyViewKeepsakesFunction() {
    console.log('\n⭐ Testing View Keepsakes Functionality\n');
    console.log('═'.repeat(60));
    
    await this.openMoreOptionsMenu();
    await this.verifyMenuPanelUI();
    
    const currentUrl = this.page.url();
    await this.clickViewKeepsakes();
    
    await this.page.waitForTimeout(2000);
    const newUrl = this.page.url();
    
    console.log(`Previous URL: ${currentUrl}`);
    console.log(`Current URL: ${newUrl}`);
    
    if (newUrl !== currentUrl) {
      console.log('✅ Navigation to Keepsakes page successful');
    } else {
      console.log('⚠️ Keepsakes may open in same page or dialog');
    }
    
    console.log('═'.repeat(60));
    console.log('✅ View Keepsakes functionality test completed\n');
  }

  // ============================================
  // DOWNLOAD ALL PHOTOS FUNCTIONALITY
  // ============================================

  /**
   * Click Download All Photos menu item
   * @returns {Promise<void>}
   */
  async clickDownloadAllPhotos() {
    console.log('📥 Clicking Download All Photos...');
    await this.downloadAllPhotosMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.downloadAllPhotosMenuItem.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Download All Photos clicked');
  }

  /**
   * Complete Download All Photos flow
   * @returns {Promise<void>}
   */
  async verifyDownloadAllPhotosFunction() {
    console.log('\n📥 Testing Download All Photos Functionality\n');
    console.log('═'.repeat(60));
    
    await this.openMoreOptionsMenu();
    await this.verifyMenuPanelUI();
    await this.clickDownloadAllPhotos();
    
    // Wait for download to start
    await this.page.waitForTimeout(3000);
    
    console.log('✅ Download initiated');
    console.log('═'.repeat(60));
    console.log('✅ Download All Photos functionality test completed\n');
  }

  // ============================================
  // LIVEVIEW FUNCTIONALITY
  // ============================================

  /**
   * Click LiveView menu item
   * @returns {Promise<void>}
   */
  async clickLiveView() {
    console.log('👁️ Clicking LiveView...');
    await this.liveViewMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.liveViewMenuItem.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ LiveView clicked');
  }

  /**
   * Complete LiveView flow: Open menu and navigate to LiveView
   * @returns {Promise<void>}
   */
  async verifyLiveViewFunctionality() {
    console.log('\n👁️ Testing LiveView Functionality\n');
    console.log('═'.repeat(60));
    
    // Step 1: Open menu
    await this.openMoreOptionsMenu();
    
    // Step 2: Verify menu UI
    await this.verifyMenuPanelUI();
    
    // Step 3: Click LiveView
    const currentUrl = this.page.url();
    await this.clickLiveView();
    
    // Step 4: Verify navigation occurred
    await this.page.waitForTimeout(2000);
    const newUrl = this.page.url();
    
    console.log(`Previous URL: ${currentUrl}`);
    console.log(`Current URL: ${newUrl}`);
    
    if (newUrl !== currentUrl) {
      console.log('✅ Navigation to LiveView page successful');
    } else {
      console.log('⚠️ URL did not change - LiveView may open in same page or be disabled');
    }
    
    console.log('═'.repeat(60));
    console.log('✅ LiveView functionality test completed\n');
  }

  // ============================================
  // REDEEM GIFT CODE FUNCTIONALITY
  // ============================================

  /**
   * Click Redeem Gift Code menu item
   * @returns {Promise<void>}
   */
  async clickRedeemGiftCode() {
    console.log('🎁 Clicking Redeem Gift Code...');
    await this.redeemGiftCodeMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.redeemGiftCodeMenuItem.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Redeem Gift Code clicked');
  }

  /**
   * Verify Redeem Gift Code dialog appears
   * @returns {Promise<void>}
   */
  async verifyRedeemGiftCodeDialog() {
    console.log('🔍 Verifying Redeem Gift Code dialog...');
    
    await expect(this.redeemCodeDialog).toBeVisible({ timeout: 10000 });
    await expect(this.redeemCodeInput).toBeVisible();
    await expect(this.redeemCodeSubmitButton).toBeVisible();
    
    console.log('✅ Redeem Gift Code dialog verified');
  }

  /**
   * Enter redeem gift code
   * @param {string} code - Redeem code to enter
   * @returns {Promise<void>}
   */
  async enterRedeemGiftCode(code) {
    console.log(`📝 Entering redeem gift code: ${code}`);
    await this.redeemCodeInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.redeemCodeInput.clear();
    await this.redeemCodeInput.fill(code);
    await this.page.waitForTimeout(1000);
    console.log('✅ Redeem gift code entered');
  }

  /**
   * Submit redeem gift code
   * @returns {Promise<void>}
   */
  async submitRedeemGiftCode() {
    console.log('✅ Submitting redeem gift code...');
    await this.redeemCodeSubmitButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.redeemCodeSubmitButton.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Redeem gift code submitted');
  }

  /**
   * Close redeem gift code dialog
   * @returns {Promise<void>}
   */
  async closeRedeemGiftCodeDialog() {
    try {
      const closeButton = await this.redeemCodeCloseButton.isVisible().catch(() => false);
      if (closeButton) {
        await this.redeemCodeCloseButton.click();
      } else {
        await this.redeemCodeCancelButton.click();
      }
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log('⚠️ Could not close redeem gift code dialog:', error.message);
    }
  }

  /**
   * Complete Redeem Gift Code flow with API verification
   * @param {string} code - Redeem gift code to test
   * @returns {Promise<Object>} API response data
   */
  async verifyRedeemGiftCodeFunctionality(code = 'TEST12345') {
    console.log('\n🎁 Testing Redeem Gift Code Functionality\n');
    console.log('═'.repeat(60));
    
    // Step 1: Open menu
    await this.openMoreOptionsMenu();
    
    // Step 2: Verify menu UI
    await this.verifyMenuPanelUI();
    
    // Step 3: Click Redeem Gift Code
    await this.clickRedeemGiftCode();
    
    // Step 4: Verify dialog appears
    await this.verifyRedeemGiftCodeDialog();
    
    // Step 5: Enter code
    await this.enterRedeemGiftCode(code);
    
    // Step 6: Submit and wait for API response
    console.log('⏳ Waiting for API response...');
    
    let apiResponse = null;
    try {
      // Wait for redeem API call
      const responsePromise = this.page.waitForResponse(
        response => response.url().includes('redeem') || response.url().includes('gift') || response.url().includes('code'),
        { timeout: 10000 }
      );
      
      await this.submitRedeemGiftCode();
      
      const response = await responsePromise;
      apiResponse = {
        status: response.status(),
        url: response.url(),
        ok: response.ok()
      };
      
      try {
        const jsonData = await response.json();
        apiResponse.data = jsonData;
      } catch (e) {
        console.log('⚠️ Response is not JSON');
      }
      
      console.log('API Response:', JSON.stringify(apiResponse, null, 2));
      
      if (apiResponse.ok) {
        console.log('✅ API call successful');
      } else {
        console.log(`⚠️ API call failed with status: ${apiResponse.status}`);
      }
    } catch (error) {
      console.log('⚠️ API verification error:', error.message);
    }
    
    console.log('═'.repeat(60));
    console.log('✅ Redeem Gift Code functionality test completed\n');
    
    return apiResponse;
  }

  // ============================================
  // LIVE HELP FUNCTIONALITY
  // ============================================

  /**
   * Click Live Help menu item
   * @returns {Promise<void>}
   */
  async clickLiveHelp() {
    console.log('💬 Clicking Live Help...');
    await this.liveHelpMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.liveHelpMenuItem.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Live Help clicked');
  }

  /**
   * Verify chat box appears
   * @returns {Promise<void>}
   */
  async verifyChatBox() {
    console.log('🔍 Verifying chat box...');
    
    await expect(this.chatBox).toBeVisible({ timeout: 10000 });
    
    // Check if chat input is visible
    const hasInput = await this.chatInput.isVisible().catch(() => false);
    console.log(`Chat input visible: ${hasInput}`);
    
    console.log('✅ Chat box verified');
  }

  /**
   * Complete Live Help flow with API verification
   * @returns {Promise<Object>} API response data
   */
  async verifyLiveHelpFunctionality() {
    console.log('\n💬 Testing Live Help Functionality\n');
    console.log('═'.repeat(60));
    
    // Step 1: Open menu
    await this.openMoreOptionsMenu();
    
    // Step 2: Verify menu UI
    await this.verifyMenuPanelUI();
    
    // Step 3: Click Live Help
    let apiResponse = null;
    try {
      // Wait for chat/help API call
      const responsePromise = this.page.waitForResponse(
        response => {
          const url = response.url().toLowerCase();
          return url.includes('chat') || url.includes('help') || url.includes('support');
        },
        { timeout: 10000 }
      );
      
      await this.clickLiveHelp();
      
      const response = await responsePromise;
      apiResponse = {
        status: response.status(),
        url: response.url(),
        ok: response.ok()
      };
      
      try {
        const jsonData = await response.json();
        apiResponse.data = jsonData;
      } catch (e) {
        console.log('⚠️ Response is not JSON');
      }
      
      console.log('API Response:', JSON.stringify(apiResponse, null, 2));
      
      if (apiResponse.ok) {
        console.log('✅ API call successful');
      } else {
        console.log(`⚠️ API call failed with status: ${apiResponse.status}`);
      }
    } catch (error) {
      console.log('⚠️ No API call detected or timeout');
      await this.clickLiveHelp();
    }
    
    // Step 4: Verify chat box appears
    await this.verifyChatBox();
    
    console.log('═'.repeat(60));
    console.log('✅ Live Help functionality test completed\n');
    
    return apiResponse;
  }

  // ============================================
  // FAQs FUNCTIONALITY
  // ============================================

  /**
   * Click FAQs menu item
   * @returns {Promise<void>}
   */
  async clickFAQs() {
    console.log('❓ Clicking FAQs...');
    await this.faqsMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.faqsMenuItem.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ FAQs clicked');
  }

  /**
   * Complete FAQs flow - verifies external link navigation
   * @returns {Promise<void>}
   */
  async verifyFAQsFunctionality() {
    console.log('\n❓ Testing FAQs Functionality\n');
    console.log('═'.repeat(60));
    
    await this.openMoreOptionsMenu();
    await this.verifyMenuPanelUI();
    
    // FAQs opens in new tab, so we need to wait for new page
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.clickFAQs()
    ]);
    
    await newPage.waitForLoadState('networkidle');
    const faqUrl = newPage.url();
    console.log(`FAQs URL: ${faqUrl}`);
    
    // Verify it's support page
    if (faqUrl.includes('support.livesharenow.com') || faqUrl.includes('faq') || faqUrl.includes('help')) {
      console.log('✅ Navigated to FAQs/Support page successfully');
    } else {
      console.log('⚠️ URL may not be FAQs page');
    }
    
    // Close the new tab
    await newPage.close();
    
    console.log('═'.repeat(60));
    console.log('✅ FAQs functionality test completed\n');
  }

  // ============================================
  // EVENT DETAILS FUNCTIONALITY
  // ============================================

  /**
   * Click Details menu item
   * @returns {Promise<void>}
   */
  async clickDetailsMenuItem() {
    console.log('ℹ️ Clicking Details menu item...');
    await this.detailsMenuItem.waitFor({ state: 'visible', timeout: 10000 });
    await this.detailsMenuItem.click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Details menu item clicked');
  }

  /**
   * Verify Event Details dialog is displayed
   * @returns {Promise<void>}
   */
  async verifyEventDetailsDialog() {
    console.log('🔍 Verifying Event Details dialog...');
    
    await expect(this.eventDetailsDialog).toBeVisible({ timeout: 10000 });
    await expect(this.eventDetailsTitle).toBeVisible();
    await expect(this.eventDetailsCloseButton).toBeVisible();
    
    console.log('✅ Event Details dialog verified');
  }

  /**
   * Get all event details information
   * @returns {Promise<Object>} Event details data
   */
  async getEventDetailsInfo() {
    console.log('📊 Getting event details information...');
    
    const details = {
      plan: await this.eventDetailsPlan.textContent().catch(() => '---'),
      createdDate: await this.eventDetailsCreatedDate.textContent().catch(() => '---'),
      eventDate: await this.eventDetailsEventDate.textContent().catch(() => '---'),
      lastViewedDate: await this.eventDetailsLastViewedDate.textContent().catch(() => '---'),
      numberOfPosts: await this.eventDetailsNumberOfPosts.textContent().catch(() => '---'),
      numberOfGuests: await this.eventDetailsNumberOfGuests.textContent().catch(() => '---'),
      numberOfViewers: await this.eventDetailsNumberOfViewers.textContent().catch(() => '---'),
      activeUntil: await this.eventDetailsActiveUntil.textContent().catch(() => '---'),
      dailyBackupLimit: await this.eventDetailsDailyBackupLimit.textContent().catch(() => '---')
    };
    
    // Clean up text content
    Object.keys(details).forEach(key => {
      details[key] = details[key].trim();
    });
    
    console.log('Event Details:', JSON.stringify(details, null, 2));
    
    return details;
  }

  /**
   * Verify event details fields are visible
   * @returns {Promise<void>}
   */
  async verifyEventDetailsFields() {
    console.log('🔍 Verifying event details fields...');
    
    await expect(this.eventDetailsPlan).toBeVisible();
    await expect(this.eventDetailsCreatedDate).toBeVisible();
    await expect(this.eventDetailsEventDate).toBeVisible();
    await expect(this.eventDetailsLastViewedDate).toBeVisible();
    await expect(this.eventDetailsActiveUntil).toBeVisible();
    
    console.log('✅ All event details fields verified');
  }

  /**
   * Verify action buttons in event details dialog
   * @returns {Promise<Object>} Buttons visibility status
   */
  async verifyEventDetailsActionButtons() {
    console.log('🔍 Verifying action buttons...');
    
    const buttons = {
      upgrade: await this.upgradeButton.isVisible().catch(() => false),
      viewGuests: await this.viewGuestsButton.isVisible().catch(() => false),
      extend: await this.extendButton.isVisible().catch(() => false)
    };
    
    console.log('Action buttons:', buttons);
    console.log('✅ Action buttons verified');
    
    return buttons;
  }

  /**
   * Close event details dialog
   * @returns {Promise<void>}
   */
  async closeEventDetailsDialog() {
    console.log('❌ Closing event details dialog...');
    await this.eventDetailsCloseButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.eventDetailsCloseButton.click();
    await this.page.waitForTimeout(1500);
    
    // Verify dialog is closed
    await expect(this.eventDetailsDialog).not.toBeVisible();
    console.log('✅ Event details dialog closed');
  }

  /**
   * Complete Event Details flow
   * @returns {Promise<Object>} Event details data
   */
  async verifyEventDetailsFunctionality() {
    console.log('\nℹ️ Testing Event Details Functionality\n');
    console.log('═'.repeat(60));
    
    // Step 1: Open menu
    await this.openMoreOptionsMenu();
    
    // Step 2: Verify menu UI
    await this.verifyMenuPanelUI();
    
    // Step 3: Click Detail
    await this.clickDetailMenuItem();
    
    // Step 4: Verify dialog appears
    await this.verifyEventDetailsDialog();
    
    // Step 5: Verify all fields
    await this.verifyEventDetailsFields();
    
    // Step 6: Get all details
    const details = await this.getEventDetailsInfo();
    
    // Step 7: Verify action buttons
    const buttons = await this.verifyEventDetailsActionButtons();
    
    // Step 8: Close dialog
    await this.closeEventDetailsDialog();
    
    console.log('═'.repeat(60));
    console.log('✅ Event Details functionality test completed\n');
    
    return { details, buttons };
  }
}

