import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

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
   */
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
      
      // Click Save button IN DIALOG (not main settings Save)
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
   */
  async saveMainSettings() {
    try {
      console.log(`  💾 Saving main settings...`);
      await this.saveButton.click();
      await this.page.waitForTimeout(2000);
      console.log(`  ✅ Main settings saved successfully`);
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

}
