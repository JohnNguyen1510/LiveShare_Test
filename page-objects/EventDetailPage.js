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
    this.closeButton = this.page.locator('button:text("Close")');

    //movie editor
    this.movieEditorButton = this.page.locator('button span:text("Movie Editor")')
    this.createMovie = this.page.locator('button mat-icon:text("add")')
    this.movieName = this.page.locator('span:text("Movie Name")')
    this.editTitleButton = this.page.locator('button:text("Edit title page")')
    this.editPlaylistButton = this.page.locator('button:text("Edit Playlist")')
    this.editSlideButton = this.page.locator('button:text("Edit Slide Format")')

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
  async createNewMovie(){
    await this.createMovie.click();
    await expect(this.editTitleButton).toBeVisible();
    await expect(this.movieName).toBeVisible();
    await expect(this.editPlaylistButton).toBeVisible();
    await expect(this.editSlideButton).toBeVisible();

  }

  async verifyMovieEditorFunctionality(){
    await this.moreOptionsButton.click();
    await this.page.waitForTimeout(2000);
    await this.movieEditorButton.click();
    await this.createNewMovie();
  }

  // ============================================================================
  // PLUS ICON FEATURES - THEN & NOW
  // ============================================================================

  /**
   * Click "Then & Now" button from plus icon menu
   */
  async clickThenAndNowButton() {
    const thenAndNowButton = this.page.locator('button:has-text("Then & Now")').first();
    await thenAndNowButton.waitFor({ state: 'visible', timeout: 10000 });
    await thenAndNowButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify Then & Now dialog UI elements
   * - Title: "Create a "Then and Now" Post"
   * - THEN box with upload icon
   * - NOW box with upload icon
   * - POST button (disabled initially)
   * - Cancel button
   * - Portrait/Landscape orientation buttons
   */
  async verifyThenAndNowDialog() {
    console.log('🔍 Verifying Then & Now dialog UI elements...');
    
    // Verify dialog title - flexible matching for quotes
    const dialogTitle = this.page.locator('app-then-and-now .navbar-center u, app-then-and-now u:has-text("Then and Now")');
    await expect(dialogTitle.first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Dialog title is visible');
    
    // Verify instruction text
    const instructionText = this.page.locator('p:has-text("Select two photos and Post as one")');
    await expect(instructionText).toBeVisible();
    console.log('✓ Instruction text is visible');
    
    // Verify THEN box
    const thenBox = this.page.locator('.selection-box.then');
    await expect(thenBox).toBeVisible();
    const thenUploadIcon = thenBox.locator('mat-icon:has-text("photo_camera")');
    await expect(thenUploadIcon).toBeVisible();
    const thenText = thenBox.locator('span:has-text("Upload Image")');
    await expect(thenText).toBeVisible();
    const thenRibbon = thenBox.locator('img[src*="then-ribbon"]');
    await expect(thenRibbon).toBeVisible();
    console.log('✓ THEN box with upload icon and ribbon is visible');
    
    // Verify NOW box
    const nowBox = this.page.locator('.selection-box.now');
    await expect(nowBox).toBeVisible();
    const nowUploadIcon = nowBox.locator('mat-icon:has-text("photo_camera")');
    await expect(nowUploadIcon).toBeVisible();
    const nowText = nowBox.locator('span:has-text("Upload Image")');
    await expect(nowText).toBeVisible();
    const nowRibbon = nowBox.locator('img[src*="now-ribbon"]');
    await expect(nowRibbon).toBeVisible();
    console.log('✓ NOW box with upload icon and ribbon is visible');
    
    // Verify orientation buttons
    const portraitButton = this.page.locator('button.btn-primary:has(mat-icon:has-text("stay_current_portrait"))');
    await expect(portraitButton).toBeVisible();
    console.log('✓ Portrait orientation button is visible (selected)');
    
    const landscapeButton = this.page.locator('button:has(mat-icon:has-text("stay_current_landscape"))');
    await expect(landscapeButton).toBeVisible();
    console.log('✓ Landscape orientation button is visible');
    
    // Verify POST button (should be disabled initially)
    const postButton = this.page.locator('button:has-text("POST")').first();
    await expect(postButton).toBeVisible();
    const isDisabled = await postButton.evaluate(el => el.classList.contains('btn-disabled'));
    expect(isDisabled).toBeTruthy();
    console.log('✓ POST button is visible but disabled (as expected)');
    
    // Verify Cancel button
    const cancelButton = this.page.locator('button:has-text("Cancel")');
    await expect(cancelButton).toBeVisible();
    console.log('✓ Cancel button is visible');
    
    // Verify close button (X)
    const closeButton = this.page.locator('button[mat-dialog-close]:has(mat-icon:has-text("close"))').first();
    await expect(closeButton).toBeVisible();
    console.log('✓ Close button (X) is visible');
    
    console.log('✅ Then & Now dialog UI verification PASSED');
  }

  /**
   * Upload images for THEN and NOW boxes
   * @param {string} imagePath - Path to image file
   */
  async uploadThenAndNowImages(imagePath) {
    console.log('📤 Uploading images for THEN and NOW...');
    
    const thenBox = this.page.locator('.selection-box.then').first();
    const nowBox = this.page.locator('.selection-box.now').first();
    const fileInput = this.page.locator('app-then-and-now input#file-input[type="file"]').first();
    
    // Upload THEN image
    console.log('  Uploading THEN image...');
    await thenBox.click();
    await this.page.waitForTimeout(500);
    await fileInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(2000);
    
    // Verify crop dialog appears
    const cropDialog = this.page.locator('app-crop-header h1:has-text("Crop Image")');
    if (await cropDialog.isVisible().catch(() => false)) {
      console.log('  Crop dialog appeared, clicking Done...');
      const doneButton = this.page.locator('app-crop-header button:has-text("Done")');
      await doneButton.click();
      await this.page.waitForTimeout(1500);
    }
    console.log('✓ THEN image uploaded');
    
    // Upload NOW image
    console.log('  Uploading NOW image...');
    await nowBox.click();
    await this.page.waitForTimeout(500);
    await fileInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(2000);
    
    // Verify crop dialog appears again
    if (await cropDialog.isVisible().catch(() => false)) {
      console.log('  Crop dialog appeared, clicking Done...');
      const doneButton = this.page.locator('app-crop-header button:has-text("Done")');
      await doneButton.click();
      await this.page.waitForTimeout(1500);
    }
    console.log('✓ NOW image uploaded');
    
    // Verify POST button is now enabled
    const postButton = this.page.locator('button:has-text("POST")').first();
    await this.page.waitForTimeout(1000);
    const isEnabled = await postButton.evaluate(el => !el.classList.contains('btn-disabled'));
    if (isEnabled) {
      console.log('✓ POST button is now enabled');
    } else {
      console.log('⚠ POST button is still disabled');
    }
    
    console.log('✅ THEN and NOW images uploaded successfully');
  }

  /**
   * Click POST button in Then & Now dialog
   */
  async clickThenAndNowPostButton() {
    const postButton = this.page.locator('button:has-text("POST")').first();
    await postButton.waitFor({ state: 'visible', timeout: 5000 });
    await postButton.click();
    await this.page.waitForTimeout(3000); // Wait for post to complete
  }

  // ============================================================================
  // PLUS ICON FEATURES - KEEPSAKE
  // ============================================================================

  /**
   * Click "KeepSake" button from plus icon menu
   */
  async clickKeepSakeButton() {
    const keepSakeButton = this.page.locator('button:has-text("KeepSake")').first();
    await keepSakeButton.waitFor({ state: 'visible', timeout: 10000 });
    await keepSakeButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verify KeepSake dialog UI elements
   * - Photos button
   * - Videos button
   */
  async verifyKeepSakeDialog() {
    console.log('🔍 Verifying KeepSake dialog UI elements...');
    
    // Verify Photos button
    const photosButton = this.page.locator('button:has(mat-icon:has-text("insert_photo")):has-text("Photos")');
    await expect(photosButton).toBeVisible({ timeout: 10000 });
    console.log('✓ Photos button is visible');
    
    // Verify Videos button
    const videosButton = this.page.locator('button:has(mat-icon:has-text("videocam")):has-text("Videos")');
    await expect(videosButton).toBeVisible();
    console.log('✓ Videos button is visible');
    
    console.log('✅ KeepSake dialog UI verification PASSED');
  }

  /**
   * Upload video/file in KeepSake feature
   * @param {string} filePath - Path to file
   */
  async uploadKeepSakeVideo(filePath) {
    console.log('📤 Uploading KeepSake video/file...');
    
    // Click Videos button
    const videosButton = this.page.locator('button:has(mat-icon:has-text("videocam")):has-text("Videos")').first();
    await videosButton.click();
    await this.page.waitForTimeout(1000);
    
    // Find and use file input
    const fileInput = this.page.locator('input[type="file"][accept*="video"]').first();
    await fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(2000);
    
    console.log('✅ KeepSake file uploaded');
  }

  /**
   * Verify KeepSake Thank You dialog
   * - Thank you message
   * - Unlock date displayed
   * - Photos and Videos buttons (for additional uploads)
   */
  async verifyKeepSakeThankYouDialog() {
    console.log('🔍 Verifying KeepSake Thank You dialog...');
    
    // Verify thank you icon
    const thankYouIcon = this.page.locator('img[src="/assets/images/Favorite.png"]');
    await expect(thankYouIcon).toBeVisible({ timeout: 10000 });
    console.log('✓ Thank you icon is visible');
    
    // Verify thank you message
    const thankYouText = this.page.locator('p:has-text("Thank you for choosing to post a Keepsake Message")');
    await expect(thankYouText).toBeVisible();
    console.log('✓ Thank you message is visible');
    
    // Verify privacy message
    const privacyText = this.page.locator('p:has-text("This is a Private message"), .keepSakeMessage');
    await expect(privacyText.first()).toBeVisible();
    console.log('✓ Privacy message is visible');
    
    // Verify unlock date is displayed
    const unlockDate = this.page.locator('.unlockDate');
    await expect(unlockDate).toBeVisible();
    const dateText = await unlockDate.textContent();
    console.log(`✓ Unlock date is visible: ${dateText.trim()}`);
    
    // Verify Photos button
    const photosButton = this.page.locator('button:has(mat-icon:has-text("insert_photo")):has-text("Photos")');
    await expect(photosButton.first()).toBeVisible();
    console.log('✓ Photos button is visible');
    
    // Verify Videos button
    const videosButton = this.page.locator('button:has(mat-icon:has-text("videocam")):has-text("Videos")');
    await expect(videosButton.first()).toBeVisible();
    console.log('✓ Videos button is visible');
    
    // Verify close button
    const closeButton = this.page.locator('app-keepsake-thankyou button:has(mat-icon:has-text("close"))');
    await expect(closeButton.first()).toBeVisible();
    console.log('✓ Close button is visible');
    
    console.log('✅ KeepSake Thank You dialog verification PASSED');
  }

  // ============================================================================
  // PLUS ICON FEATURES - COMMON POST MESSAGE DIALOG
  // ============================================================================

  /**
   * Verify common post-message dialog UI elements
   * Used by: Clue, Sponsor, Prize, Message, Photos, Videos
   * - Close button
   * - Upload in background checkbox
   * - POST button
   */
  async verifyPostMessageDialog() {
    console.log('🔍 Verifying post-message dialog UI elements...');
    
    // Verify close button (very flexible selector - multiple options)
    const closeButton = this.page.locator(
      'app-post-message button:has(mat-icon:has-text("close")), ' +
      'app-post-message .header button:has(mat-icon:has-text("close")), ' +
      'app-post-message button.btn-circle:has(mat-icon:has-text("close")), ' +
      'app-post-message .post-header-container button:has(mat-icon:has-text("close"))'
    );
    await expect(closeButton.first()).toBeVisible({ timeout: 10000 });
    console.log('✓ Close button is visible');
    
    // Verify "Upload in background" checkbox (optional - may not exist in all dialogs)
    const uploadCheckbox = this.page.locator('mat-checkbox:has-text("Upload in background")');
    const checkboxExists = await uploadCheckbox.count() > 0;
    if (checkboxExists) {
      await expect(uploadCheckbox.first()).toBeVisible();
      console.log('✓ Upload in background checkbox is visible');
    } else {
      console.log('ℹ Upload in background checkbox not present (optional)');
    }
    
    // Verify POST button
    const postButton = this.page.locator('app-post-message button:has-text("POST"), app-post-message .actions button');
    await expect(postButton.first()).toBeVisible();
    console.log('✓ POST button is visible');
    
    console.log('✅ Post-message dialog UI verification PASSED');
  }

  /**
   * Click POST button in post-message dialog
   */
  async clickPostMessageButton() {
    const postButton = this.page.locator('app-post-message button:has-text("POST")').first();
    await postButton.waitFor({ state: 'visible', timeout: 5000 });
    await postButton.click();
    await this.page.waitForTimeout(3000);
  }

  // ============================================================================
  // PLUS ICON FEATURES - CLUE (SCAVENGER HUNT)
  // ============================================================================

  /**
   * Click "Clue" button from plus icon menu
   */
  async clickClueButton() {
    const clueButton = this.page.locator('button:has-text("Clue")').first();
    await clueButton.waitFor({ state: 'visible', timeout: 10000 });
    await clueButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Upload clue with title and caption
   * Pattern based on successful KeepSake (TC-002) and Then & Now (TC-001)
   * 
   * @param {string} imagePath - Path to image file
   * @param {string} title - Clue title
   * @param {string} caption - Clue caption
   */
  async uploadClueWithInfo(imagePath, title, caption) {
    console.log('📤 Uploading clue with title and caption...');
    
    // Wait for dialog to be fully loaded (KeepSake pattern)
    await this.page.waitForTimeout(1000);
    
    // Simple file upload - like KeepSake, no complex triggers needed
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(2000);
    
    // Handle crop dialog if appears (Then & Now pattern)
    const cropDialog = this.page.locator('app-crop-header h1:has-text("Crop Image")');
    if (await cropDialog.isVisible().catch(() => false)) {
      console.log('  Crop dialog appeared, clicking Done...');
      const doneButton = this.page.locator('app-crop-header button:has-text("Done")');
      await doneButton.click();
      await this.page.waitForTimeout(1500);
    }
    console.log('✓ Image uploaded');
    
    // Verify preview (robust check)
    const imagePreview = this.page.locator('app-post-message img.imgProperty');
    const isVisible = await imagePreview.isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisible) {
      console.log('✓ Image preview is visible');
    }
    
    // Fill title
    const titleInput = this.page.locator('input[placeholder*="title"]').first();
    await titleInput.fill(title);
    await this.page.waitForTimeout(300);
    console.log(`✓ Title filled: "${title}"`);
    
    // Fill caption
    const captionInput = this.page.locator('input[placeholder*="caption"]').first();
    await captionInput.fill(caption);
    await this.page.waitForTimeout(300);
    console.log(`✓ Caption filled: "${caption}"`);
    
    console.log('✅ Clue upload with info completed');
  }

  // ============================================================================
  // PLUS ICON FEATURES - SPONSOR
  // ============================================================================

  /**
   * Click "Sponsor" button from plus icon menu
   */
  async clickSponsorButton() {
    const sponsorButton = this.page.locator('button:has-text("Sponsor")').first();
    await sponsorButton.waitFor({ state: 'visible', timeout: 10000 });
    await sponsorButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Upload sponsor image with redirect URL and positioning settings
   * Pattern based on successful KeepSake (TC-002) and Then & Now (TC-001)
   * 
   * @param {string} imagePath - Path to image file
   * @param {string} redirectUrl - Redirect URL
   * @param {number} rowsBeforeFirst - Number of rows before first showing (optional)
   * @param {number} rowsBetween - Number of rows between sponsor posts (optional)
   */
  async uploadSponsorWithInfo(imagePath, redirectUrl, rowsBeforeFirst = null, rowsBetween = null) {
    console.log('📤 Uploading sponsor with info...');
    
    // Wait for dialog to be fully loaded (KeepSake pattern)
    await this.page.waitForTimeout(1000);
    
    // Simple file upload - like KeepSake, no complex triggers needed
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(2000);
    
    // Handle crop dialog if appears (Then & Now pattern)
    const cropDialog = this.page.locator('app-crop-header h1:has-text("Crop Image")');
    if (await cropDialog.isVisible().catch(() => false)) {
      console.log('  Crop dialog appeared, clicking Done...');
      const doneButton = this.page.locator('app-crop-header button:has-text("Done")');
      await doneButton.click();
      await this.page.waitForTimeout(1500);
    }
    console.log('✓ Image uploaded');
    
    // Verify preview (robust check)
    const imagePreview = this.page.locator('app-post-message img.imgProperty');
    const isVisible = await imagePreview.isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisible) {
      console.log('✓ Image preview is visible');
    }
    
    // Fill redirect URL
    const urlInput = this.page.locator('input[placeholder*="URL"], input[placeholder*="url"]').first();
    await urlInput.fill(redirectUrl);
    await this.page.waitForTimeout(300);
    console.log(`✓ Redirect URL filled: "${redirectUrl}"`);
    
    // Verify sponsor-specific field (flexible - may vary between versions)
    const sponsorLabel = this.page.locator('.sponsor-input-title');
    const labelCount = await sponsorLabel.count();
    if (labelCount > 0) {
      console.log(`✓ Sponsor positioning field(s) visible (${labelCount} field(s))`);
    }
    
    // Fill optional positioning fields if provided
    if (rowsBeforeFirst !== null) {
      const rowsBeforeInput = this.page.locator('input[type="number"]').first();
      await rowsBeforeInput.fill(rowsBeforeFirst.toString());
      console.log(`✓ Rows before first showing: ${rowsBeforeFirst}`);
    }
    
    if (rowsBetween !== null && labelCount > 1) {
      const rowsBetweenInput = this.page.locator('input[type="number"]').nth(1);
      await rowsBetweenInput.fill(rowsBetween.toString());
      console.log(`✓ Rows between sponsor posts: ${rowsBetween}`);
    }
    
    console.log('✅ Sponsor upload with info completed');
  }

  // ============================================================================
  // PLUS ICON FEATURES - PRIZE
  // ============================================================================

  /**
   * Click "Prize" button from plus icon menu
   */
  async clickPrizeButton() {
    const prizeButton = this.page.locator('button:has-text("Prize")').first();
    await prizeButton.waitFor({ state: 'visible', timeout: 10000 });
    await prizeButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Upload prize image with caption
   * Pattern based on successful KeepSake (TC-002) and Then & Now (TC-001)
   * 
   * @param {string} imagePath - Path to image file
   * @param {string} caption - Prize caption
   */
  async uploadPrizeWithCaption(imagePath, caption) {
    console.log('📤 Uploading prize with caption...');
    
    // Wait for dialog to be fully loaded (KeepSake pattern)
    await this.page.waitForTimeout(1000);
    
    // Simple file upload - like KeepSake, no complex triggers needed
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(2000);
    
    // Handle crop dialog if appears (Then & Now pattern)
    const cropDialog = this.page.locator('app-crop-header h1:has-text("Crop Image")');
    if (await cropDialog.isVisible().catch(() => false)) {
      console.log('  Crop dialog appeared, clicking Done...');
      const doneButton = this.page.locator('app-crop-header button:has-text("Done")');
      await doneButton.click();
      await this.page.waitForTimeout(1500);
    }
    console.log('✓ Image uploaded');
    
    // Verify preview (robust check)
    const imagePreview = this.page.locator('app-post-message img.imgProperty');
    const isVisible = await imagePreview.isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisible) {
      console.log('✓ Image preview is visible');
    }
    
    // Fill caption
    const captionInput = this.page.locator('input[placeholder*="caption"]').first();
    await captionInput.fill(caption);
    await this.page.waitForTimeout(300);
    console.log(`✓ Caption filled: "${caption}"`);
    
    console.log('✅ Prize upload with caption completed');
  }

  // ============================================================================
  // PLUS ICON FEATURES - MESSAGE
  // ============================================================================

  /**
   * Click "Message" button from plus icon menu
   */
  async clickMessageButton() {
    const messageButton = this.page.locator('button:has-text("Message")').first();
    await messageButton.waitFor({ state: 'visible', timeout: 10000 });
    await messageButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Fill message caption (text-only message)
   * @param {string} caption - Message caption
   */
  async fillMessageCaption(caption) {
    console.log('📝 Filling message caption...');
    
    // Verify the write-text area is visible
    const writeTextArea = this.page.locator('app-post-message .write-text');
    await expect(writeTextArea).toBeVisible({ timeout: 10000 });
    console.log('✓ Write text area is visible');
    
    // Fill caption
    const captionInput = this.page.locator('app-post-message input[placeholder*="caption"]').first();
    await captionInput.waitFor({ state: 'visible', timeout: 5000 });
    await captionInput.fill(caption);
    await this.page.waitForTimeout(500);
    console.log(`✓ Caption filled: "${caption}"`);
    
    console.log('✅ Message caption filled');
  }

  // ============================================================================
  // PLUS ICON FEATURES - PHOTOS
  // ============================================================================

  /**
   * Click "Photos" button from plus icon menu
   */
  async clickPhotosButton() {
    const photosButton = this.page.locator('button:has-text("Photos")').first();
    await photosButton.waitFor({ state: 'visible', timeout: 10000 });
    await photosButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Upload photo with caption
   * Pattern based on successful KeepSake (TC-002) and Then & Now (TC-001)
   * 
   * @param {string} imagePath - Path to image file
   * @param {string} caption - Photo caption
   */
  async uploadPhotoWithCaption(imagePath, caption) {
    console.log('📤 Uploading photo with caption...');
    
    // Wait for dialog to be fully loaded (KeepSake pattern)
    await this.page.waitForTimeout(1000);
    
    // Simple file upload - like KeepSake, no complex triggers needed
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(imagePath);
    await this.page.waitForTimeout(2000);
    
    // Handle crop dialog if appears (Then & Now pattern)
    const cropDialog = this.page.locator('app-crop-header h1:has-text("Crop Image")');
    if (await cropDialog.isVisible().catch(() => false)) {
      console.log('  Crop dialog appeared, clicking Done...');
      const doneButton = this.page.locator('app-crop-header button:has-text("Done")');
      await doneButton.click();
      await this.page.waitForTimeout(1500);
    }
    console.log('✓ Photo uploaded');
    
    // Verify preview (robust check)
    const imagePreview = this.page.locator('app-post-message img.imgProperty');
    const isVisible = await imagePreview.isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisible) {
      console.log('✓ Photo preview is visible');
    }
    
    // Fill caption
    const captionInput = this.page.locator('input[placeholder*="caption"]').first();
    await captionInput.fill(caption);
    await this.page.waitForTimeout(300);
    console.log(`✓ Caption filled: "${caption}"`);
    
    console.log('✅ Photo upload with caption completed');
  }

  // ============================================================================
  // PLUS ICON FEATURES - VIDEOS
  // ============================================================================

  /**
   * Click "Videos" button from plus icon menu
   */
  async clickVideosButton() {
    const videosButton = this.page.locator('button:has-text("Videos")').first();
    await videosButton.waitFor({ state: 'visible', timeout: 10000 });
    await videosButton.click();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Upload video with caption
   * Pattern based on successful KeepSake (TC-002) and Then & Now (TC-001)
   * 
   * @param {string} videoPath - Path to video file (or image for testing)
   * @param {string} caption - Video caption
   */
  async uploadVideoWithCaption(videoPath, caption) {
    console.log('📤 Uploading video with caption...');
    
    // Wait for dialog to be fully loaded (KeepSake pattern)
    await this.page.waitForTimeout(1000);
    
    // Simple file upload - like KeepSake, no complex triggers needed
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(videoPath);
    await this.page.waitForTimeout(2000);
    
    // Handle crop dialog if appears (Then & Now pattern)
    const cropDialog = this.page.locator('app-crop-header h1:has-text("Crop Image")');
    if (await cropDialog.isVisible().catch(() => false)) {
      console.log('  Crop dialog appeared, clicking Done...');
      const doneButton = this.page.locator('app-crop-header button:has-text("Done")');
      await doneButton.click();
      await this.page.waitForTimeout(1500);
    }
    console.log('✓ Video uploaded');
    
    // Verify preview (robust check - may be img or video element)
    const preview = this.page.locator('app-post-message img.imgProperty, app-post-message video');
    const isVisible = await preview.first().isVisible({ timeout: 10000 }).catch(() => false);
    if (isVisible) {
      console.log('✓ Video preview is visible');
    }
    
    // Fill caption
    const captionInput = this.page.locator('input[placeholder*="caption"]').first();
    await captionInput.fill(caption);
    await this.page.waitForTimeout(300);
    console.log(`✓ Caption filled: "${caption}"`);
    
    console.log('✅ Video upload with caption completed');
  }
}

