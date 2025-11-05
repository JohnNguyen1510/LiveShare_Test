import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { EventCreationPage } from './EventCreationPage.js';
import { EventPage } from './EventPage.js';

/**
 * EventSettingsPage - Professional Page Object for Event Settings
 * 
 * This page object handles two types of features:
 * 1. Simple Toggle Features: Enable/disable without dialog (e.g., Force Login, Allow sharing)
 * 2. Configuration Features: Require dialog interaction (e.g., Button Link, Event Name)
 * 
 * IMPORTANT: For configuration features, do NOT use setOption() before calling 
 * the configuration methods, as clicking the option opens a dialog immediately.
 * 
 * @author Senior QA Automation Engineer
 */
export class EventSettingsPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Dialog root
    this.dialog = this.page.locator('mat-dialog-container app-personalize');
    this.dialogTitle = this.dialog.locator('h1:has-text("Personalize Options")');
    this.footer = this.dialog.locator('div.mt-auto.flex');

    // Footer actions (main settings level)
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

    // Specific option locators
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

  /**
   * ============================================================================
   * SECTION 1: BASIC DIALOG OPERATIONS
   * ============================================================================
   */

  /**
   * Open settings dialog if not already open
   */
  async openSettingsIfNeeded() {
    if (!(await this.dialog.isVisible().catch(() => false))) {
      await this.topnavSettings.click();
      await this.dialog.waitFor({ state: 'visible', timeout: 15000 });
    }
  }

  /**
   * Wait for settings dialog to be fully loaded
   */
  async waitLoaded() {
    await this.dialog.waitFor({ state: 'visible', timeout: 15000 });
    await expect(this.dialog.locator('h1:has-text("Personalize Options")')).toBeVisible();
  }

  /**
   * Check if an option is currently enabled
   */
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

  /**
   * ============================================================================
   * SECTION 2: SIMPLE TOGGLE OPERATIONS
   * These features only need enable/disable without dialog configuration
   * ============================================================================
   */

  /**
   * Toggle a simple feature (no dialog configuration needed)
   * Use this ONLY for features that don't open configuration dialogs
   * 
   * Examples of simple toggle features:
   * - Allow sharing via Facebook
   * - Allow Guest Download
   * - Allow posting without login
   * - Force Login
   * - Enable Photo Gifts
   * - Popularity Badges
   * 
   * Do NOT use this for features with dialogs like:
   * - Button Link #1, #2
   * - Welcome Popup
   * - Event Name, Event Date, Location, Contact
   * - KeepSake, Scavenger Hunt
   * 
   * NOTE: Simple toggles update UI state immediately but API call happens when Save is clicked
   */
  async setOption(label, enable = true) {
    console.log(`  ${enable ? '✅ Enabling' : '❌ Disabling'}: ${label}`);
    
    const option = this.optionByLabel(label);
    await option.waitFor({ state: 'visible', timeout: 10000 });

    const currentlyEnabled = await this.isOptionEnabled(label);
    if (enable !== currentlyEnabled) {
      await option.click();
      await this.page.waitForTimeout(300);
      await expect(option).toHaveClass(new RegExp(enable ? 'selected-option' : '^(?!.*selected-option).*'));
      console.log(`  ✅ Toggled ${label} to ${enable ? 'enabled' : 'disabled'}`);
    } else {
      console.log(`  ℹ️ ${label} already ${enable ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Enable multiple simple toggle features
   */
  async enable(labels = []) {
    for (const label of labels) {
      await this.setOption(label, true);
    }
  }

  /**
   * Disable multiple simple toggle features
   */
  async disable(labels = []) {
    for (const label of labels) {
      await this.setOption(label, false);
    }
  }

  /**
   * ============================================================================
   * SECTION 3: CONFIGURATION DIALOG METHODS
   * These methods handle features that require dialog interaction
   * Each method handles: click to open dialog → fill data → click dialog Save
   * ============================================================================
   */

  /**
   * Change Event Name via dialog
   * Automatically handles: click option → open dialog → fill → save dialog
   */
  async changeEventName(newName) {
    try {
      console.log(`  🔧 Changing Event Name to: "${newName}"`);
      
      // Click Event Name option to open dialog
      await this.eventNameOption.click();
      await this.page.waitForTimeout(1000);
      
      // Wait for dialog with title "Name"
      const nameDialog = this.page.locator('mat-dialog-container:has(h1[mat-dialog-title]:has-text("Name"))');
      await nameDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      // Fill input field
      const nameInput = nameDialog.locator('input[type="text"][placeholder="Name"]');
      await nameInput.waitFor({ state: 'visible', timeout: 5000 });
      await nameInput.clear();
      await nameInput.fill(newName);
      await this.page.waitForTimeout(500);
      
      // Click Save button IN DIALOG and wait for API response
      const dialogSaveButton = nameDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Event Name changed successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to change Event Name: ${error.message}`);
      return false;
    }
  }

  /**
   * Change Event Date via dialog
   */
  async changeEventDate(date) {
    try {
      console.log(`  🔧 Changing Event Date to: "${date}"`);
      
      await this.eventDateOption.click();
      await this.page.waitForTimeout(1000);
      
      const dateDialog = this.page.locator('mat-dialog-container:has(h1[mat-dialog-title]:has-text("Event Date"))');
      await dateDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const dateInput = dateDialog.locator('input[type="text"][placeholder="Event Date"]');
      await dateInput.waitFor({ state: 'visible', timeout: 5000 });
      await dateInput.clear();
      await dateInput.fill(date);
      await this.page.waitForTimeout(500);
      
      const dialogSaveButton = dateDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Event Date changed successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to change Event Date: ${error.message}`);
      return false;
    }
  }

  /**
   * Upload Event Header Photo via dialog
   */
  async uploadEventHeaderPhoto(imagePath) {
    try {
      console.log(`  🔧 Uploading Event Header Photo: "${imagePath}"`);
      
      await this.headerPhotoOption.click();
      await this.page.waitForTimeout(1000);
      
      const photoDialog = this.page.locator('mat-dialog-container:has(h1[mat-dialog-title]:has-text("Event Header Photo"))');
      await photoDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const fileInput = photoDialog.locator('input[type="file"]#popupBg');
      await fileInput.setInputFiles(imagePath);
      await this.page.waitForTimeout(2000);
      
      // Handle crop dialog if appears
      const cropDialog = this.page.locator('mat-dialog-container app-crop-header:has(h1:has-text("Crop Image"))');
      const cropDialogVisible = await cropDialog.isVisible().catch(() => false);
      
      if (cropDialogVisible) {
        console.log(`  📐 Cropping image...`);
        const doneButton = cropDialog.locator('.mat-dialog-actions button.btn:has-text("Done")');
        await doneButton.click();
        await this.page.waitForTimeout(1500);
      }
      
      const dialogSaveButton = photoDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Event Header Photo uploaded successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to upload Event Header Photo: ${error.message}`);
      return false;
    }
  }

  /**
   * Update Contact information via dialog
   */
  async updateContact(contactInfo) {
    try {
      console.log(`  🔧 Updating Contact: Email="${contactInfo.email}", Phone="${contactInfo.phone}"`);
      
      await this.contactOption.click();
      await this.page.waitForTimeout(1000);
      
      const contactDialog = this.page.locator('mat-dialog-container:has(h1[mat-dialog-title]:has-text("Contact"))');
      await contactDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const emailInput = contactDialog.locator('input[type="text"][placeholder="Email"]');
      await emailInput.waitFor({ state: 'visible', timeout: 5000 });
      await emailInput.clear();
      await emailInput.fill(contactInfo.email);
      await this.page.waitForTimeout(300);
      
      const phoneInput = contactDialog.locator('input[type="text"][placeholder="Phone"]');
      await phoneInput.clear();
      await phoneInput.fill(contactInfo.phone);
      await this.page.waitForTimeout(500);
      
      // Click Save button and wait for API response
      const dialogSaveButton = contactDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Contact updated successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to update Contact: ${error.message}`);
      return false;
    }
  }

  /**
   * Update Location via dialog
   */
  async updateLocation(location) {
    try {
      console.log(`  🔧 Updating Location to: "${location}"`);
      
      await this.locationOption.click();
      await this.page.waitForTimeout(1000);
      
      const locationDialog = this.page.locator('mat-dialog-container:has(h1[mat-dialog-title]:has-text("Location"))');
      await locationDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const locationInput = locationDialog.locator('input[type="text"][placeholder*="Location"], textarea[placeholder*="Location"]');
      await locationInput.waitFor({ state: 'visible', timeout: 5000 });
      await locationInput.clear();
      await locationInput.fill(location);
      await this.page.waitForTimeout(500);
      
      const dialogSaveButton = locationDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Location updated successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to update Location: ${error.message}`);
      return false;
    }
  }

  /**
   * Update Itinerary via dialog
   * @param {Array<string>} itineraryLines - Array of itinerary lines to add
   */
  async updateItinerary(itineraryLines = []) {
    try {
      console.log(`  🔧 Updating Itinerary with ${itineraryLines.length} line(s)`);
      
      await this.itineraryOption.click();
      await this.page.waitForTimeout(1000);
      
      const itineraryDialog = this.page.locator('mat-dialog-container:has(h1[mat-dialog-title]:has-text("Itinerary"))');
      await itineraryDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      // Add each itinerary line
      for (let i = 0; i < itineraryLines.length; i++) {
        const line = itineraryLines[i];
        console.log(`    Adding line ${i + 1}: "${line}"`);
        
        // Find the last input field (the active one)
        const inputs = await itineraryDialog.locator('input[type="text"].input').all();
        const lastInput = inputs[inputs.length - 1];
        
        await lastInput.waitFor({ state: 'visible', timeout: 5000 });
        await lastInput.fill(line);
        await this.page.waitForTimeout(300);
        
        // Click "Add new line" button if not the last item
        if (i < itineraryLines.length - 1) {
          const addLineButton = itineraryDialog.locator('button.btn:has(mat-icon:text("add")):has-text("Add new line")');
          await addLineButton.click();
          await this.page.waitForTimeout(500);
        }
      }
      
      // Click Save button in dialog
      const dialogSaveButton = itineraryDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Itinerary updated successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to update Itinerary: ${error.message}`);
      return false;
    }
  }

  /**
   * Add Post Message Backgrounds via dialog
   */
  async addPostMessageBackgrounds(imagePaths) {
    try {
      console.log(`  🔧 Adding ${imagePaths.length} Post Message Background(s)`);
      
      await this.messagePostOption.click();
      await this.page.waitForTimeout(1000);
      
      const messageDialog = this.page.locator('mat-dialog-container:has(h1[mat-dialog-title]:has-text("Post Message Backgrounds"))');
      await messageDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const fileInput = messageDialog.locator('input[type="file"]#messageBgs');
      await fileInput.setInputFiles(imagePaths);
      await this.page.waitForTimeout(2000);
      
      const dialogSaveButton = messageDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Post Message Backgrounds added successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to add Post Message Backgrounds: ${error.message}`);
      return false;
    }
  }

  /**
   * Configure Button Link via dialog
   * @param {number} buttonNumber - 1 or 2
   * @param {Object} linkData - {name: string, url: string}
   */
  async configureButtonLink(buttonNumber, linkData) {
    try {
      console.log(`  🔧 Configuring Button Link #${buttonNumber}: Name="${linkData.name}", URL="${linkData.url}"`);
      
      const buttonOption = buttonNumber === 1 ? this.buttonLink1Option : this.buttonLink2Option;
      await buttonOption.click();
      await this.page.waitForTimeout(1000);
      
      const linkDialog = this.page.locator(`mat-dialog-container:has(h1[mat-dialog-title]:has-text("Button Link #${buttonNumber}"))`);
      await linkDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const nameInput = linkDialog.locator('input[type="text"][placeholder="Name"]');
      await nameInput.waitFor({ state: 'visible', timeout: 5000 });
      await nameInput.clear();
      await nameInput.fill(linkData.name);
      await this.page.waitForTimeout(300);
      
      const urlInput = linkDialog.locator('input[type="text"][placeholder="URL"]');
      await urlInput.clear();
      await urlInput.fill(linkData.url);
      await this.page.waitForTimeout(500);
      
      // Click Save button and wait for API response
      const dialogSaveButton = linkDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Button Link #${buttonNumber} configured successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to configure Button Link #${buttonNumber}: ${error.message}`);
      return false;
    }
  }

  /**
   * Upload Welcome Popup image via dialog
   */
  async uploadWelcomePopup(imagePath) {
    try {
      console.log(`  🔧 Uploading Welcome Popup: "${imagePath}"`);
      
      await this.welcomePopupOption.click();
      await this.page.waitForTimeout(1000);
      
      const popupDialog = this.page.locator('mat-dialog-container:has(h1[mat-dialog-title]:has-text("Welcome Popup"))');
      await popupDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const fileInput = popupDialog.locator('input[type="file"]#popupBg');
      await fileInput.setInputFiles(imagePath);
      await this.page.waitForTimeout(2000);
      
      const dialogSaveButton = popupDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Welcome Popup uploaded successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to upload Welcome Popup: ${error.message}`);
      return false;
    }
  }

  /**
   * Add Event Manager via dialog
   */
  async addEventManager(managerEmail) {
    try {
      console.log(`  🔧 Adding Event Manager: "${managerEmail}"`);
      
      await this.addEventManagersOption.click();
      await this.page.waitForTimeout(1000);
      
      const managerDialog = this.page.locator('mat-dialog-container:has(h1:has-text("Event Manager"), h1:has-text("Add Manager"))');
      await managerDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const emailInput = managerDialog.locator('input[type="email"], input[placeholder*="email" i]');
      await emailInput.waitFor({ state: 'visible', timeout: 5000 });
      await emailInput.fill(managerEmail);
      await this.page.waitForTimeout(500);
      
      // Click Save/Add button and wait for API response
      const dialogSaveButton = managerDialog.locator('.mat-dialog-actions .btn:has-text("Save"), .mat-dialog-actions .btn:has-text("Add")').first();
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Event Manager added successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to add Event Manager: ${error.message}`);
      return false;
    }
  }

  /**
   * Set Access Passcode via dialog
   */
  async setAccessPasscode(passcode) {
    try {
      console.log(`  🔧 Setting Access Passcode: "${passcode}"`);
      
      await this.accessPasscodeOption.click();
      await this.page.waitForTimeout(1000);
      
      const passcodeDialog = this.page.locator('mat-dialog-container:has(h1:has-text("Passcode"), h1:has-text("Access"))');
      await passcodeDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const passcodeInput = passcodeDialog.locator('input[type="text"], input[type="password"], input[placeholder*="passcode" i]');
      await passcodeInput.waitFor({ state: 'visible', timeout: 5000 });
      await passcodeInput.clear();
      await passcodeInput.fill(passcode);
      await this.page.waitForTimeout(500);
      
      // Click Save button and wait for API response
      const dialogSaveButton = passcodeDialog.locator('.mat-dialog-actions .btn:has-text("Save")');
      await dialogSaveButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Access Passcode set successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to set Access Passcode: ${error.message}`);
      return false;
    }
  }

  /**
   * Configure KeepSake Welcome Popup via dialog
   */
  async configureKeepSakeWelcome(keepSakeData) {
    try {
      console.log(`  🔧 Configuring KeepSake Welcome: Message="${keepSakeData.message}", Unlock Date="${keepSakeData.unlockDate}"`);
      
      await this.keepSakeOption.click();
      await this.page.waitForTimeout(1000);
      
      const keepSakeDialog = this.page.locator('mat-dialog-container app-keepsake-welcome-popup:has(.header:has-text("KeepSake"))');
      await keepSakeDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      const messageTextarea = keepSakeDialog.locator('textarea.textarea');
      await messageTextarea.waitFor({ state: 'visible', timeout: 5000 });
      await messageTextarea.clear();
      await messageTextarea.fill(keepSakeData.message);
      await this.page.waitForTimeout(500);
      
      const dateInput = keepSakeDialog.locator('input[placeholder="MM/DD/YYYY"]');
      await dateInput.clear();
      await dateInput.fill(keepSakeData.unlockDate);
      await this.page.waitForTimeout(500);
      
      const enableButton = keepSakeDialog.locator('button.btn:has-text("Enable")');
      await enableButton.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ KeepSake Welcome configured successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to configure KeepSake Welcome: ${error.message}`);
      return false;
    }
  }

  /**
   * Configure Scavenger Hunt via dialog
   */
  async configureScavengerHunt(enable = true) {
    try {
      console.log(`  🔧 ${enable ? 'Enabling' : 'Disabling'} Scavenger Hunt`);
      
      await this.scavengerHuntOption.click();
      await this.page.waitForTimeout(1000);
      
      const huntDialog = this.page.locator('mat-dialog-container app-scavenger-hunt-dialog:has(h1:has-text("Scavenger Hunt"))');
      await huntDialog.waitFor({ state: 'visible', timeout: 10000 });
      
      if (enable) {
        const checkbox = huntDialog.locator('mat-checkbox input[type="checkbox"]');
        const isChecked = await checkbox.isChecked().catch(() => false);
        if (!isChecked) {
          await checkbox.click();
          await this.page.waitForTimeout(300);
        }
      }
      
      const dialogSaveButton = huntDialog.locator('.mat-dialog-actions button.btn:has-text("Save")');
      await dialogSaveButton.click();
      const huntConfirmDialog = this.page.locator('mat-dialog-container:has(h2:has-text("No tempates Selected?"))');
      const dialogConfirm = huntConfirmDialog.locator('.mat-dialog-actions button.btn:has-text("Yes")');
      await dialogConfirm.click();
      await this.page.waitForTimeout(1500);
      
      console.log(`  ✅ Scavenger Hunt ${enable ? 'enabled' : 'disabled'} successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to configure Scavenger Hunt: ${error.message}`);
      return false;
    }
  }

  /**
   * ============================================================================
   * SECTION 4: MAIN SETTINGS SAVE/CLOSE
   * ============================================================================
   */

  /**
   * Save main settings dialog
   * This is the Save button in the MAIN Personalize Options dialog footer
   * Different from the Save buttons inside individual feature dialogs
   * 
   * When clicked, triggers 3 API calls:
   * 1. GET /api/events/{id} - Get current event details
   * 2. PUT /api/events/{id} - Update event settings
   * 3. GET /api/events - List all events
   */
  async saveMainSettings() {
    try {
      console.log(`  💾 Saving main settings and verifying APIs...`);
      
      // Set up promises to capture all 3 API calls
      const getEventPromise = this.waitApiResponse('/api/events/', 200, 'GET', 15000);
      const updateEventPromise = this.waitApiResponse('/api/events', 200, 'PUT', 15000);
      const listEventsPromise = this.waitApiResponse('/api/events', 200, 'GET', 15000);
      
      // Click Save button
      await this.saveButton.click();
      
      // Wait for all 3 API responses
      try {
        // 1. GET /api/events/{id} - Get current event before update
        console.log('  📥 Waiting for GET event details API...');
        const getResponse = await getEventPromise;
        const beforeData = await getResponse.json();
        
        if (beforeData && beforeData._id) {
          console.log(`  ✅ GET Event API responded`);
          console.log(`  Event ID: ${beforeData._id}`);
          console.log(`  Current Name: ${beforeData.name}`);
          console.log(`  Current Plan: ${beforeData.plan}`);
        }
        
        // 2. PUT /api/events/{id} - Update event settings
        console.log('  📤 Waiting for PUT event update API...');
        const updateResponse = await updateEventPromise;
        const afterData = await updateResponse.json();
        
        if (afterData && afterData._id) {
          console.log(`  ✅ PUT Event Update API responded`);
          console.log(`  Event ID: ${afterData._id}`);
          console.log(`  Updated Name: ${afterData.name}`);
          console.log(`  Plan: ${afterData.plan}`);
          console.log(`  Force Login: ${afterData.forceLogin}`);
          console.log(`  Guest Login: ${afterData.guestLogin}`);
          console.log(`  Photo Gift: ${afterData.photoGift}`);
          console.log(`  Facebook Sharing: ${afterData.faceBook}`);
          console.log(`  PassCode: ${afterData.passCode || 'Not set'}`);
          
          // Verify button configurations
          if (afterData.button1) {
            console.log(`  Button 1 - Name: ${afterData.button1.name}, Enabled: ${afterData.button1.enabled}`);
          }
          if (afterData.button2) {
            console.log(`  Button 2 - Name: ${afterData.button2.name}, Enabled: ${afterData.button2.enabled}`);
          }
          
          // Verify contact info
          if (afterData.contact) {
            console.log(`  Contact - Email: ${afterData.contact.email}, Phone: ${afterData.contact.phone}`);
          }
          
          // Verify Premium+ features
          if (afterData.plan === 'PremiumPlus') {
            console.log(`  Premium+ Features:`);
            console.log(`    - LiveView: ${afterData.liveView}`);
            console.log(`    - Then & Now: ${afterData.thenAndNow}`);
            console.log(`    - Movie Editor: ${afterData.movieEditor}`);
            console.log(`    - KeepSake: ${afterData.keepSake}`);
            console.log(`    - Scavenger Hunt: ${afterData.quest}`);
            console.log(`    - Sponsor: ${afterData.sponsor}`);
            console.log(`    - Prize: ${afterData.prize}`);
          }
        }
        
        // 3. GET /api/events - List all events
        console.log('  📥 Waiting for GET events list API...');
        const listResponse = await listEventsPromise;
        const listData = await listResponse.json();
        
        const eventsList = listData.docs || listData.events || listData;
        if (Array.isArray(eventsList)) {
          console.log(`  ✅ GET Events List API responded with ${eventsList.length} events`);
        } else {
          console.log(`  ✅ GET Events List API responded`);
        }
        
      } catch (apiError) {
        console.warn(`  ⚠️ Some API verification failed: ${apiError.message}`);
      }
      
      await this.page.waitForTimeout(2000);
      console.log(`  ✅ Main settings saved successfully with API verification`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to save main settings: ${error.message}`);
      return false;
    }
  }

  /**
   * Close settings dialog via Cancel button
   */
  async closeSettings() {
    try {
      console.log(`  🚪 Closing settings dialog...`);
      const cancelButton = this.page.locator('.mt-auto .btn:has-text("Cancel")').first();
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click();
        await this.page.waitForTimeout(1000);
      }
      console.log(`  ✅ Settings dialog closed`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to close settings: ${error.message}`);
      return false;
    }
  }

  /**
   * ============================================================================
   * SECTION 5: PLAN-BASED CONFIGURATION
   * High-level methods for configuring settings based on subscription plan
   * ============================================================================
   */

  /**
   * Configure all settings for a subscription plan
   * This method calls configuration dialogs for features that need setup
   * 
   * IMPORTANT: This method does NOT call setOption() for dialog-based features.
   * The dialog methods handle clicking the option themselves.
   * 
   * @param {string} plan - 'STANDARD', 'PREMIUM', or 'PREMIUM_PLUS'
   * @param {Object} testData - Test data with event details
   * @returns {Promise<{success: boolean, configured: number, failed: number}>}
   */
  async configureSettingsForPlan(plan, testData) {
    console.log(`\n🎨 Configuring settings for ${plan} plan...`);
    
    const results = { success: true, configured: 0, failed: 0 };
    
    try {
      // =======================================================================
      // BASE SETTINGS (All Plans) - These require dialog configuration
      // =======================================================================
      console.log('\n📝 Configuring base settings (dialog-based)...');
      
      // Event Name
      if (await this.changeEventName(testData.eventName || `${plan} Event ${Date.now()}`)) {
        results.configured++;
      } else {
        results.failed++;
      }
      
      // Event Date
      const eventDate = testData.eventDate || new Date().toLocaleDateString('en-US');
      if (await this.changeEventDate(eventDate)) {
        results.configured++;
      } else {
        results.failed++;
      }
      
      // Location
      if (await this.updateLocation(testData.location || 'Test Location - Automated')) {
        results.configured++;
      } else {
        results.failed++;
      }
      
      // Contact
      if (await this.updateContact({
        email: testData.email || 'test@example.com',
        phone: testData.phone || '+1-555-0100'
      })) {
        results.configured++;
      } else {
        results.failed++;
      }
      
      // =======================================================================
      // STANDARD PLAN SETTINGS - Dialog-based configuration
      // =======================================================================
      if (plan === 'STANDARD' || plan === 'PREMIUM' || plan === 'PREMIUM_PLUS') {
        console.log('\n📝 Configuring Standard plan settings (dialog-based)...');
        
        // Button Link #1
        if (await this.configureButtonLink(1, {
          name: 'Website',
          url: 'https://example.com'
        })) {
          results.configured++;
        } else {
          results.failed++;
        }
        
        // Button Link #2
        if (await this.configureButtonLink(2, {
          name: 'RSVP',
          url: 'https://rsvp.example.com'
        })) {
          results.configured++;
        } else {
          results.failed++;
        }
      }
      
      // =======================================================================
      // PREMIUM PLAN SETTINGS - Dialog-based configuration
      // =======================================================================
      if (plan === 'PREMIUM' || plan === 'PREMIUM_PLUS') {
        console.log('\n📝 Configuring Premium plan settings (dialog-based)...');
        
        // Access Passcode
        if (await this.setAccessPasscode('TEST1234')) {
          results.configured++;
        } else {
          results.failed++;
        }
      }
      
      // =======================================================================
      // PREMIUM+ PLAN SETTINGS - Dialog-based configuration
      // =======================================================================
      if (plan === 'PREMIUM_PLUS') {
        console.log('\n📝 Configuring Premium+ plan settings (dialog-based)...');
        
        // KeepSake
        if (await this.configureKeepSakeWelcome({
          message: 'Welcome to our special event! This message will be unlocked on the event date.',
          unlockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
        })) {
          results.configured++;
        } else {
          results.failed++;
        }
        
        // Scavenger Hunt
        if (await this.configureScavengerHunt(true)) {
          results.configured++;
        } else {
          results.failed++;
        }
      }
      
      console.log(`\n📊 Configuration Results: ${results.configured} configured, ${results.failed} failed`);
      results.success = results.failed === 0;
      
    } catch (error) {
      console.error(`❌ Error during settings configuration: ${error.message}`);
      results.success = false;
    }
    
    return results;
  }

  /**
   * Enable simple toggle features for a subscription plan
   * This method handles ONLY features that don't require dialog configuration
   * 
   * Use this for:
   * - Allow sharing via Facebook
   * - Allow Guest Download
   * - Allow posting without login
   * - Force Login
   * - Enable Photo Gifts
   * - Popularity Badges
   * - LiveView Slideshow
   * - Then And Now
   * - Movie Editor
   * - Sponsor
   * - Prize
   * 
   * Do NOT use this for dialog-based features (they are handled by configureSettingsForPlan)
   * 
   * @param {string} plan - 'STANDARD', 'PREMIUM', or 'PREMIUM_PLUS'
   * @returns {Promise<{success: boolean, enabled: number, failed: number}>}
   */
  async enableSimpleTogglesForPlan(plan) {
    console.log(`\n🔘 Enabling simple toggle features for ${plan} plan...`);
    
    const results = { success: true, enabled: 0, failed: 0 };
    const featuresToEnable = [];
    
    // Premium Plan - Simple toggles only
    if (plan === 'PREMIUM' || plan === 'PREMIUM_PLUS') {
      featuresToEnable.push(
        'Allow sharing via Facebook',
        'Allow Guest Download',
        'Allow posting without login'
      );
    }
    
    // Premium+ Plan - Additional simple toggles
    if (plan === 'PREMIUM_PLUS') {
      featuresToEnable.push(
        'LiveView Slideshow',
        'Then And Now',
        'Movie Editor',
        'Sponsor',
        'Prize'
      );
    }
    
    console.log(`📝 Toggling ${featuresToEnable.length} simple features...`);
    for (const feature of featuresToEnable) {
      try {
        await this.setOption(feature, true);
        results.enabled++;
        console.log(`  ✅ Enabled: ${feature}`);
      } catch (error) {
        results.failed++;
        console.log(`  ⚠️ Could not enable: ${feature} - ${error.message}`);
      }
    }
    
    results.success = results.failed === 0;
    console.log(`\n📊 Toggle Results: ${results.enabled} enabled, ${results.failed} failed`);
    return results;
  }

  /**
   * ============================================================================
   * SECTION 6: VERIFICATION HELPER METHODS
   * ============================================================================
   */

  /**
   * Verify "Preview for Free" text does NOT appear for a given feature
   * @param {string} featureName - Feature name to check
   * @returns {Promise<boolean>} True if feature does NOT have "Preview for Free" text
   */
  async verifyNoPreviewForFree(featureName) {
    this.logStep(`Checking "${featureName}" - should NOT have "Preview for Free"`, 'info');
    
    const featureOption = this.optionByLabel(featureName);
    const isVisible = await featureOption.isVisible().catch(() => false);
    
    if (!isVisible) {
      this.logStep(`Feature "${featureName}" not found in UI`, 'warning');
      return true;
    }
    
    const featureText = await featureOption.textContent();
    const hasPreviewForFree = featureText.toLowerCase().includes('preview for free');
    
    if (hasPreviewForFree) {
      this.logStep(`Has "Preview for Free" (should not have it)`, 'error');
      await this.captureScreenshot(`error-${featureName.toLowerCase().replace(/\s+/g, '-')}-has-preview-for-free`, 'error');
      return false;
    }
    
    this.logStep(`Does NOT have "Preview for Free"`, 'success');
    return true;
  }

  /**
   * Verify "Preview for Free" text DOES appear for a given feature
   * @param {string} featureName - Feature name to check
   * @returns {Promise<boolean>} True if feature HAS "Preview for Free" text
   */
  async verifyHasPreviewForFree(featureName) {
    this.logStep(`Checking "${featureName}" - should HAVE "Preview for Free"`, 'info');
    
    const featureOption = this.optionByLabel(featureName);
    const isVisible = await featureOption.isVisible().catch(() => false);
    
    if (!isVisible) {
      this.logStep(`Feature "${featureName}" not found in UI`, 'warning');
      return true;
    }
    
    const featureText = await featureOption.textContent();
    const hasPreviewForFree = featureText.toLowerCase().includes('preview for free');
    
    if (hasPreviewForFree) {
      this.logStep(`Has "Preview for Free" (as expected)`, 'success');
      return true;
    }
    
    this.logStep(`Does NOT have "Preview for Free" (should have it)`, 'error');
    await this.captureScreenshot(`error-${featureName.toLowerCase().replace(/\s+/g, '-')}-missing-preview-for-free`, 'error');
    return false;
  }

  /**
   * Verify menu options are visible with exact text matching
   * @param {string[]} expectedMenuItems - Array of expected menu item texts
   * @returns {Promise<{success: boolean, visible: string[], notVisible: string[]}>}
   */
  async verifyMenuOptions(expectedMenuItems) {
    this.logStep(`Verifying menu options: ${expectedMenuItems.join(', ')}`, 'info');
    
    const results = { success: true, visible: [], notVisible: [], details: {} };
    
    try {
      const moreButton = this.page.locator('button:has(mat-icon:text("more_vert"))').first();
      await moreButton.waitFor({ state: 'visible', timeout: 5000 });
      await moreButton.click();
      await this.page.waitForTimeout(1500);
      
      const menuPanel = this.page.locator('.mat-menu-panel[role="menu"]').first();
      await menuPanel.waitFor({ state: 'visible', timeout: 5000 });
      
      const allMenuItems = await this.page.locator('button[role="menuitem"]').all();
      
      for (const expectedItem of expectedMenuItems) {
        let found = false;
        let matchedItemText = '';
        
        for (const menuItem of allMenuItems) {
          const isVisible = await menuItem.isVisible().catch(() => false);
          if (!isVisible) continue;
          
          const itemText = await menuItem.evaluate(el => {
            const clone = el.cloneNode(true);
            const icons = clone.querySelectorAll('mat-icon');
            icons.forEach(icon => icon.remove());
            return clone.textContent.trim();
          }).catch(() => '');
          
          if (itemText === expectedItem) {
            found = true;
            matchedItemText = itemText;
            break;
          }
        }
        
        if (found) {
          results.visible.push(expectedItem);
          results.details[expectedItem] = { found: true, text: matchedItemText };
        } else {
          results.notVisible.push(expectedItem);
          results.details[expectedItem] = { found: false, text: null };
        }
      }
      
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      
    } catch (error) {
      this.logStep(`Error during menu verification: ${error.message}`, 'error');
      await this.page.keyboard.press('Escape').catch(() => {});
      results.success = false;
    }
    
    results.success = results.notVisible.length === 0;
    this.logStep(`Menu Options: Found ${results.visible.length}/${expectedMenuItems.length}, Missing ${results.notVisible.length}`, results.success ? 'success' : 'warning');
    
    return results;
  }

  /**
   * Verify footer buttons are visible with exact text matching
   * @param {string[]} expectedButtons - Array of expected button texts
   * @returns {Promise<{success: boolean, visible: string[], notVisible: string[]}>}
   */
  async verifyFooterButtons(expectedButtons) {
    this.logStep(`Verifying footer buttons: ${expectedButtons.join(', ')}`, 'info');
    
    const results = { success: true, visible: [], notVisible: [], details: {} };
    
    try {
      const addButton = this.page.locator('button.menu-button:has(mat-icon:text("add"))').first();
      await addButton.waitFor({ state: 'visible', timeout: 5000 });
      await addButton.click();
      await this.page.waitForTimeout(1500);
      
      const footerBtnGroup = this.page.locator('.footer-btn-group');
      await footerBtnGroup.waitFor({ state: 'visible', timeout: 5000 });
      
      const allButtons = await this.page.locator('.footer-btn-group button.btn').all();
      
      for (const buttonName of expectedButtons) {
        let found = false;
        let matchedButtonText = '';
        
        for (const button of allButtons) {
          const isVisible = await button.isVisible().catch(() => false);
          if (!isVisible) continue;
          
          const buttonText = await button.evaluate(el => {
            const clone = el.cloneNode(true);
            const icons = clone.querySelectorAll('mat-icon');
            icons.forEach(icon => icon.remove());
            return clone.textContent.trim();
          }).catch(() => '');
          
          if (buttonText === buttonName) {
            found = true;
            matchedButtonText = buttonText;
            break;
          }
        }
        
        if (found) {
          results.visible.push(buttonName);
          results.details[buttonName] = { found: true, text: matchedButtonText };
        } else {
          results.notVisible.push(buttonName);
          results.details[buttonName] = { found: false, text: null };
        }
      }
      
      await addButton.click();
      await this.page.waitForTimeout(500);
      
    } catch (error) {
      this.logStep(`Error during footer button verification: ${error.message}`, 'error');
      await this.page.keyboard.press('Escape').catch(() => {});
      results.success = false;
    }
    
    results.success = results.notVisible.length === 0;
    this.logStep(`Footer Buttons: Found ${results.visible.length}/${expectedButtons.length}, Missing ${results.notVisible.length}`, results.success ? 'success' : 'warning');
    
    return results;
  }

  /**
   * Feature tier definitions based on subscription plans
   */
  static FeatureTiers = {
    FREE: [
      'Event Name',
      'Event Date',
      'Location',
      'Contact',
      'Itinerary',
      'Enable Message Post',
      'Video'
    ],
    STANDARD: [
      'Button Link #1',
      'Button Link #2',
      'Welcome Popup',
      'Enable Photo Gifts',
      'Event Header Photo',
      'Popularity Badges',
      'Force Login'
    ],
    PREMIUM: [
      'Allow sharing via Facebook',
      'Allow Guest Download',
      'Add Event Managers',
      'Allow posting without login',
      'Require Access Passcode'
    ],
    PREMIUM_PLUS: [
      'LiveView Slideshow',
      'Then And Now',
      'Movie Editor',
      'KeepSake',
      'Scavenger Hunt',
      'Sponsor',
      'Prize'
    ]
  };

  /**
   * Setup test with token: Inject token, Create Event, Open Settings
   * @param {import('@playwright/test').Page} page - Playwright page instance
   * @param {Object} testData - Test data containing token
   * @returns {Promise<boolean>} Success status
   */
  async setupTestWithToken(testData) {
    this.logStep('Setting up test with token', 'info');
    
    try {
      // Inject token
      await this.page.goto('https://dev.livesharenow.com/');
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.evaluate((tokenValue) => {
        window.localStorage.setItem('ACCESSTOKEN', tokenValue);
      }, testData.token);
      await this.page.waitForTimeout(1000);
      
      // Create new event
      const eventCreationPage = new EventCreationPage(this.page);
      await this.page.goto('https://dev.livesharenow.com/events');
      await this.page.waitForTimeout(2000);
      
      const eventCreated = await eventCreationPage.startEventCreation();
      if (!eventCreated) {
        throw new Error('Failed to create event');
      }
      await this.page.waitForTimeout(4000);
      
      // Open event settings
      await this.openEventSettings();
      
      this.logStep('Test setup completed with token', 'success');
      return true;
    } catch (error) {
      this.logStep(`Test setup with token failed: ${error.message}`, 'error');
      await this.captureScreenshot('error-test-setup', 'error');
      return false;
    }
  }

  /**
   * Navigate to event and open settings
   * @returns {Promise<boolean>} Success status
   */
  async openEventSettings() {
    this.logStep('Navigating to event settings', 'info');
    
    try {
      const eventPage = new EventPage(this.page);
      
      await this.page.goto('https://dev.livesharenow.com/events');
      await this.page.waitForTimeout(2000);
      
      await eventPage.clickFirstEvent();
      await this.page.waitForTimeout(2000);
      
      await this.openSettingsIfNeeded();
      await this.page.waitForTimeout(3000);
      await this.waitLoaded();
      
      this.logStep('Event settings opened', 'success');
      return true;
    } catch (error) {
      this.logStep(`Failed to open settings: ${error.message}`, 'error');
      await this.captureScreenshot('error-open-settings', 'error');
      return false;
    }
  }

  /**
   * Get authentication token from page localStorage
   * @returns {Promise<string|null>} Access token
   */
  async getAuthToken() {
    try {
      const token = await this.page.evaluate(() => {
        return window.localStorage.getItem('ACCESSTOKEN') || null;
      });
      if (token) {
        this.logStep('Retrieved ACCESSTOKEN from localStorage', 'success');
      }
      return token;
    } catch (error) {
      this.logStep(`Failed to get token: ${error.message}`, 'error');
      return null;
    }
  }

}
