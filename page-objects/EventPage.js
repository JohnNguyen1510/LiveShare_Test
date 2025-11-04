import { BasePage } from './BasePage.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * @fileoverview Page object for managing event functionality
 */
export class EventPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Navigation and action button locators
    this.settingsButton = this.page.locator('button.btn.btn-circle.btn-ghost:has(mat-icon:text("settings"))').first();
    this.saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save")').first();
    this.doneButton = this.page.locator('button:has-text("Done"), div.btn:has-text("Done"), .mat-dialog-actions .btn:has-text("Done")').first();
    
    // Event card selectors (for clicking first event)
    this.eventCardSelectors = [
      '.event-card-event', 
      '.event-card', 
      '.flex.pt-8',
      'mat-card',
      '.card',
      '.event-list-item',
      '.event-image-container', 
      '.event-card-container', 
      'img.event-thumbnail',
      'div:has-text("Event Name")'
    ];
    
    // Form input locators
    this.eventNameInput = this.page.locator('input[placeholder*="name" i]').first();
    this.accessCodeInput = this.page.locator('input.input-bordered').first();
    this.eventManagerInput = this.page.locator('input[placeholder*="email" i]').first();
    this.toggleSwitch = this.page.locator('.toggle, .switch, input[type="checkbox"], .mat-slide-toggle').first();
    this.urlInput = this.page.locator('input[placeholder*="url" i]').first();
    
    // File upload locators
    this.fileInput = this.page.locator('input[type="file"][accept*="image"]').first();
    this.addButton = this.page.locator('label.btn:has-text("Add"), label[for="popupBg"]').first();
    
    // Display element locators
    this.eventName = this.page.locator('.event-name-event, .event-name').first();
    
    // Event name input field selectors (used in updateEventName)
    this.eventNameInputSelectors = [
      'input[formcontrolname="name"]',
      'input[placeholder="Name"]',
      'input[placeholder="Event Name"]',
      'input.event-name-input',
      'input#eventName',
      'input.input-bordered',
      'input[type="text"]'
    ];
    
    // Button link input selectors
    this.buttonNameInputSelectors = [
      'input[placeholder*="name" i]',
      'input[placeholder*="text" i]',
      'input[placeholder*="label" i]',
      'input[type="text"]:nth-of-type(1)',
      'input.input-bordered:nth-of-type(1)',
      'mat-form-field:nth-of-type(1) input'
    ];
    
    this.buttonUrlInputSelectors = [
      'input[placeholder*="url" i]',
      'input[placeholder*="http" i]',
      'input[type="url"]',
      'input[type="text"]:nth-of-type(2)',
      'input.input-bordered:nth-of-type(2)',
      'mat-form-field:nth-of-type(2) input'
    ];
    
    // Feature option selectors (for clickFeature method)
    this.featureOptionSelectors = (featureName) => [
      `.options:has-text("${featureName}")`,
      `.options span:text-is("${featureName}")`,
      `.options:has(span:text-is("${featureName}"))`,
      `.wrap .options:has-text("${featureName}")`,
      `button:has-text("${featureName}")`,
      `button:has(span:text("${featureName}"))`,
      `button.btn:has-text("${featureName}")`,
      `.btn:has(mat-icon):has-text("${featureName}")`,
      `button.mat-menu-item:has-text("${featureName}")`,
      `div:has-text("${featureName}")`
    ];
    
    // Event name verification selectors
    this.eventNameVerificationSelectors = [
      '.event-name-event',
      '.event-name',
      'span.text-lg',
      '.bottom-section-event span',
      'div.event-detail span:not(.date-event)',
      'h1.event-title'
    ];
    
    // Final save button selectors
    this.finalSaveButtonSelectors = [
      'app-personalize .btn:has-text("Save")',
      'app-personalize div.btn:first-child:has-text("Save")',
      'app-personalize .mt-auto .btn:has-text("Save")',
      'div.mt-auto .btn:has-text("Save")',
      'button:has-text("Save")',
      'button.save-button',
      'button.btn-primary:has-text("Save")',
      '.mat-dialog-actions .btn:has-text("Save")',
      'button[type="submit"]',
      '.mat-dialog-actions button:first-child',
      '.btn:first-child:has-text("Save")'
    ];

    this.features = {
      eventName: 'Event Name',
      accessCode: 'Require Access Passcode',
      eventManagers: 'Add Event Managers',
      headerPhoto: 'Event Header Photo',
      buttonLink1: 'Button Link #1',
      buttonLink2: 'Button Link #2',
      analytics: 'Connect Google Analytics',
      formResponses: 'Collect Form Responses',
      requireName: 'Require Name',
      requireEmail: 'Require Email',
      photoGift: 'Photo Gift',
      popularity: 'Popularity',
      budget: 'Budget',
      zoom: 'Connect Zoom',
      liveVideo: 'Live Video',
      photoGallery: 'Photo Gallery',
      survey: 'Survey',
      schedule: 'Schedule',
      calendar: 'Add to Calendar'
    };
  }

  /**
   * Navigate to events page
   */
  async navigateToEvents() {
    await this.goto('/events');
    await this.waitForPageLoad();
  }

  /**
   * Click the first event on the events page
   */
  async clickFirstEvent() {
    console.log('Selecting first event...');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    await this.page.waitForTimeout(2000);
    
    const result = await this.tryMultipleSelectors(this.eventCardSelectors, 'click');
    
    if (!result.success) {
      console.error('Could not find any events to click');
      await this.takeScreenshot('error-no-events-found');
      return false;
    }
    
    console.log(`Found event with selector: ${result.selector}`);
    await this.page.waitForTimeout(2000);
    return true;
  }

  /**
   * Open event settings
   */
  async openSettings() {
    await this.settingsButton.waitFor({ state: 'visible', timeout: 50000 });
    await this.settingsButton.click({ force: true });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Update event name
   * @param {string} name New event name
   */
  async updateEventName(name) {
    try {
      console.log(`Updating event name to "${name}"...`);
      
      await this.clickFeature(this.features.eventName);
      
      // Find input using tryMultipleSelectors
      const inputResult = await this.tryMultipleSelectors(this.eventNameInputSelectors, 'isVisible');
      
      if (!inputResult.success) {
        console.error('Could not find event name input field');
        await this.takeScreenshot('error-event-name-input-not-found');
        return false;
      }
      
      const input = inputResult.element;
      await input.fill('');
      await this.page.waitForTimeout(500);
      await input.fill(name);
      await this.page.waitForTimeout(1000);
      
      // Wait for event settings update API response
      const settingsResponse = await this.performActionAndWaitForResponse({
        actionPromise: this.saveButton.click(),
        apiUrl: '/api/events',
        statusCode: 200,
        requestMethod: 'PUT'
      });
      
      if (settingsResponse?._id) {
        console.log('✅ Event settings updated via API');
        console.log(`Event Name: ${settingsResponse.name || name}`);
      }
      
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error(`Error updating event name to "${name}":`, error.message);
      await this.takeScreenshot('error-update-event-name');
      return false;
    }
  }

  /**
   * Update access passcode
   * @param {string} code New access code
   */
  async updateAccessCode(code) {
    await this.updateFeature(this.features.accessCode, code, true);
  }

  /**
   * Update event managers
   * @param {string} email Manager email
   */
  async updateEventManagers(email) {
    await this.updateFeature(this.features.eventManagers, email);
  }

  /**
   * Enable a feature
   * @param {string} featureName Feature to enable
   */
  async enableFeature(featureName) {
    await this.toggleFeature(featureName, true);
  }

  /**
   * Update event header photo
   */
  async updateHeaderPhoto() {
    try {
      await this.clickFeature(this.features.headerPhoto);
      await this.enableToggleIfUnchecked();

      // Get test image path
      const testImagePath = this.getTestImagePath();

      // Upload file
      const uploaded = await this.uploadFile(this.addButton, testImagePath);
      if (!uploaded) {
        throw new Error('Could not upload header photo');
      }
      
      await this.page.waitForTimeout(2000);
      
      // Click Done button if visible
      if (await this.doneButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.doneButton.click({ force: true });
        await this.page.waitForTimeout(2000);
      }
      
      // Click Save in mini window
      const miniWindowSaveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save"), app-get-values .btn:has-text("Save"), button.btn:has-text("Save")').first();
      if (await miniWindowSaveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await miniWindowSaveButton.click({ force: true });
        await this.page.waitForTimeout(3000);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating header photo:', error);
      await this.takeScreenshot('error-header-photo');
      return false;
    }
  }
  
  /**
   * Get test image path, create if not exists
   * @returns {string} Path to test image
   * @private
   */
  getTestImagePath() {
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const testImagePath = path.join(screenshotsDir, 'test.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      const imageBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
        0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
        0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
        0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
        0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
        0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0xff, 0xc4, 0x00, 0x14,
        0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 0xff, 0xd9
      ]);
      fs.writeFileSync(testImagePath, imageBuffer);
    }
    
    return testImagePath;
  }
  
  /**
   * Upload file via button or direct input
   * @param {import('@playwright/test').Locator} addButton Add button locator
   * @param {string} filePath Path to file
   * @returns {Promise<boolean>} Success status
   * @private
   */
  async uploadFile(addButton, filePath) {
    try {
      if (await addButton.isVisible().catch(() => false)) {
        try {
          const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser', { timeout: 5000 }),
            addButton.click({ force: true })
          ]);
          await fileChooser.setFiles(filePath);
          return true;
        } catch {
          // Fallback: click and find file input
          await addButton.click({ force: true });
          await this.page.waitForTimeout(1000);
        }
      }
      
      // Direct file input fallback
      const fileInput = this.page.locator('input[type="file"], input#popupBg');
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error uploading file:', error);
      return false;
    }
  }

  /**
   * Update button link
   * @param {string} buttonName Button feature name
   * @param {string} name Button name
   * @param {string} url Button URL
   */
  async updateButtonLink(buttonName, name, url) {
    try {
      await this.clickFeature(buttonName);

      // Enable toggle if needed
      await this.enableToggleIfUnchecked();

      // Fill name input
      const nameResult = await this.tryMultipleSelectors(this.buttonNameInputSelectors, 'isVisible');
      if (nameResult.success) {
        await nameResult.element.clear();
        await nameResult.element.fill(name);
      } else {
        // Fallback: try first input
        const inputs = await this.page.locator('input[type="text"], input.input-bordered').all();
        if (inputs.length > 0) {
          await inputs[0].clear();
          await inputs[0].fill(name);
        } else {
          console.warn(`Could not find name input field for ${buttonName}`);
        }
      }

      // Fill URL input
      const urlResult = await this.tryMultipleSelectors(this.buttonUrlInputSelectors, 'isVisible');
      if (urlResult.success) {
        await urlResult.element.clear();
        await urlResult.element.fill(url);
      } else {
        // Fallback: try second input
        const inputs = await this.page.locator('input[type="text"], input.input-bordered').all();
        if (inputs.length > 1) {
          await inputs[1].clear();
          await inputs[1].fill(url);
        } else {
          console.warn(`Could not find URL input field for ${buttonName}`);
        }
      }

      await this.clickSave();
      return true;
    } catch (error) {
      console.error(`Error updating ${buttonName}:`, error);
      await this.takeScreenshot(`error-${buttonName.toLowerCase().replace(/\s+/g, '-')}`);
      return false;
    }
  }
  
  /**
   * Enable toggle if it exists and is unchecked
   * @private
   */
  async enableToggleIfUnchecked() {
    const toggle = this.toggleSwitch;
    if (await toggle.isVisible({ timeout: 1000 }).catch(() => false)) {
      const isChecked = await toggle.isChecked().catch(() => false);
      if (!isChecked) {
        await toggle.click({ force: true });
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Click feature option
   * @param {string} featureName Feature name
   * @private
   */
  async clickFeature(featureName) {
    console.log(`Looking for ${featureName} feature...`);
    
    // Try predefined selectors
    const selectors = this.featureOptionSelectors(featureName);
    const result = await this.tryMultipleSelectors(selectors, 'click');
    
    if (result.success) {
      console.log(`Found ${featureName} using selector: ${result.selector}`);
      await this.page.waitForTimeout(1000);
      return true;
    }
    
    // Fallback: case-insensitive text search
    const found = await this.findByTextContent(featureName, ['.options', 'button']);
    if (found) {
      console.log(`Found ${featureName} via text content search`);
      await this.page.waitForTimeout(1000);
      return true;
    }
    
    console.error(`Feature "${featureName}" not found`);
    await this.takeScreenshot(`error-feature-not-found-${featureName.toLowerCase().replace(/\s+/g, '-')}`);
    return false;
  }
  
  /**
   * Find and click element by text content (case-insensitive)
   * @param {string} text Text to search for
   * @param {string[]} containerSelectors Container selectors to search within
   * @returns {Promise<boolean>} Whether element was found and clicked
   * @private
   */
  async findByTextContent(text, containerSelectors = ['body']) {
    const lowerText = text.toLowerCase();
    
    for (const containerSelector of containerSelectors) {
      const elements = this.page.locator(containerSelector);
      const count = await elements.count();
      
      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        const elementText = await element.textContent();
        
        if (elementText && elementText.toLowerCase().includes(lowerText)) {
          await element.click();
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Update a feature with value
   * @param {string} featureName Feature name
   * @param {string} value New value
   * @param {boolean} shouldEnable Whether to enable toggle
   * @private
   */
  async updateFeature(featureName, value, shouldEnable = false) {
    try {
      await this.clickFeature(featureName);

      // Try textarea first, then input
      const textareaSelectors = ['textarea.textarea-bordered', 'textarea[placeholder*="Location"]'];
      const inputSelectors = ['input.input-bordered', 'mat-form-field input', 'input[type="text"]'];
      
      const textareaResult = await this.tryMultipleSelectors(textareaSelectors, 'isVisible');
      const inputResult = textareaResult.success ? null : await this.tryMultipleSelectors(inputSelectors, 'isVisible');
      
      const element = textareaResult.success ? textareaResult.element : inputResult?.element;
      
      if (!element) {
        console.warn(`Could not find input or textarea for ${featureName}`);
        await this.takeScreenshot(`error-input-not-found-${featureName.toLowerCase().replace(/\s+/g, '-')}`);
        return false;
      }

      await element.clear();
      await element.fill(value);

      if (shouldEnable) {
        await this.enableToggleIfUnchecked();
      }

      await this.clickSave();
      return true;
    } catch (error) {
      console.error(`Error updating feature ${featureName}:`, error);
      await this.takeScreenshot(`error-feature-${featureName.toLowerCase().replace(/\s+/g, '-')}`);
      return false;
    }
  }

  /**
   * Toggle a feature
   * @param {string} featureName Feature name
   * @param {boolean} enable Whether to enable
   * @private
   */
  async toggleFeature(featureName, enable = true) {
    try {
      await this.clickFeature(featureName);

      if (!await this.toggleSwitch.isVisible()) {
        console.warn(`Toggle switch not found for ${featureName}`);
        return false;
      }

      const isChecked = await this.toggleSwitch.isChecked().catch(() => null);
      const needsToggle = (enable && !isChecked) || (!enable && isChecked);

      if (needsToggle) {
        await this.toggleSwitch.click({ force: true });
        await this.page.waitForTimeout(1000);
      }

      await this.clickSave();
      return true;
    } catch (error) {
      console.error(`Error toggling feature ${featureName}:`, error);
      await this.takeScreenshot(`error-toggle-${featureName.toLowerCase().replace(/\s+/g, '-')}`);
      return false;
    }
  }

  /**
   * Click save button
   * @private
   */
  async clickSave() {
    const saveButton = this.saveButton;
    if (await saveButton.isVisible()) {
      await saveButton.click({ force: true });
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * Verify event name matches expected value
   * @param {string} expectedName Expected event name
   * @returns {Promise<boolean>} Whether the name matches
   */
  async verifyEventName(expectedName) {
    console.log(`Verifying event name is "${expectedName}"...`);
    
    // Try specific selectors
    for (const selector of this.eventNameVerificationSelectors) {
      const elements = await this.page.locator(selector).all();
      for (const element of elements) {
        const nameText = await element.textContent().catch(() => '');
        if (nameText && nameText.trim().includes(expectedName)) {
          console.log(`✅ Found matching event name with selector: ${selector}`);
          return true;
        }
      }
    }
    
    // Fallback: general text search
    if (await this.page.locator(`text="${expectedName}"`).first().isVisible().catch(() => false)) {
      console.log(`✅ Found event name using general text search`);
      return true;
    }
    
    // Last resort: page text evaluation
    const hasText = await this.page.evaluate((name) => document.body.innerText.includes(name), expectedName);
    if (hasText) {
      console.log(`✅ Found event name in page text`);
      return true;
    }
    
    console.error(`❌ Could not find event name "${expectedName}"`);
    await this.takeScreenshot('error-event-name-not-found');
    return false;
  }

  /**
   * Click the final save button in event settings
   * @returns {Promise<boolean>} Whether the click was successful
   */
  async clickFinalSave() {
    try {
      console.log('💾 Clicking final save button and waiting for API...');
      
      // Try to find save button
      const result = await this.tryMultipleSelectors(this.finalSaveButtonSelectors, 'isVisible');
      
      if (!result.success) {
        // Fallback: try any button with "Save" text
        const anyButtonWithSave = this.page.locator('button, .btn').filter({ hasText: /Save/i }).first();
        if (await anyButtonWithSave.isVisible().catch(() => false)) {
          await anyButtonWithSave.click();
          await this.page.waitForTimeout(3000);
          return true;
        }
        
        console.error('Could not find final save button');
        await this.takeScreenshot('error-final-save-not-found');
        return false;
      }
      
      console.log(`Found final save button using selector: ${result.selector}`);
      
      // Wait for settings update API response
      const settingsResponse = await this.performActionAndWaitForResponse({
        actionPromise: result.element.click(),
        apiUrl: '/api/events',
        statusCode: 200,
        requestMethod: 'PUT'
      });
      
      if (settingsResponse?._id) {
        console.log('✅ All event settings saved via API');
        console.log(`Event ID: ${settingsResponse._id}`);
        console.log(`Event Name: ${settingsResponse.name || 'Unknown'}`);
        console.log(`Plan: ${settingsResponse.plan || 'Unknown'}`);
      }
      
      await this.page.waitForTimeout(3000);
      
      // Check if dialog still open and retry if needed
      const dialogStillOpen = await this.page.locator('app-personalize, mat-dialog-container').isVisible().catch(() => false);
      if (dialogStillOpen) {
        console.log('Dialog still open, clicking save again');
        await result.element.click({ force: true });
        await this.page.waitForTimeout(3000);
      }
      
      return true;
    } catch (error) {
      console.error('Error clicking final save button:', error.message);
      await this.takeScreenshot('error-final-save');
      return false;
    }
  }

  /**
   * Update location
   * @param {string} location Location text
   */
  async updateLocation(location) {
    try {
      console.log(`Updating location to "${location}"...`);
      await this.clickFeature('Location');
      
      const locationTextarea = this.page.locator('textarea[placeholder="Location"], textarea.textarea-bordered').first();
      
      if (!await locationTextarea.isVisible().catch(() => false)) {
        console.error('Could not find location textarea');
        await this.takeScreenshot('error-location-textarea-not-found');
        return false;
      }

      await locationTextarea.clear();
      await locationTextarea.fill(location);
      await this.page.waitForTimeout(500);
      
      await this.saveButton.click();
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error(`Error updating location to "${location}":`, error.message);
      await this.takeScreenshot('error-update-location');
      return false;
    }
  }

  /**
   * Update contact
   * @param {string} email Contact email
   * @param {string} phone Contact phone
   */
  async updateContact(email, phone) {
    try {
      console.log(`Updating contact with email: "${email}" and phone: "${phone}"...`);
      await this.clickFeature('Contact');
      
      // Fill email
      const emailInput = this.page.locator('input[placeholder="Email"], input[type="email"]').first();
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.clear();
        await emailInput.fill(email);
        await this.page.waitForTimeout(500);
      }
      
      // Fill phone
      const phoneInput = this.page.locator('input[placeholder="Phone"], input[type="tel"]').nth(0);
      if (await phoneInput.isVisible().catch(() => false)) {
        await phoneInput.clear();
        await phoneInput.fill(phone);
        await this.page.waitForTimeout(500);
      } else {
        // Fallback to second input
        const inputsCount = await this.page.locator('input.input-bordered').count();
        if (inputsCount > 1) {
          await this.page.locator('input.input-bordered').nth(1).clear();
          await this.page.locator('input.input-bordered').nth(1).fill(phone);
        }
      }
      
      await this.saveButton.click();
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error(`Error updating contact information:`, error.message);
      await this.takeScreenshot('error-update-contact');
      return false;
    }
  }

  /**
   * Update itinerary
   * @param {string} itinerary Itinerary information
   */
  async updateItinerary(itinerary) {
    try {
      console.log(`Updating itinerary to "${itinerary}"...`);
      await this.clickFeature('Itinerary');
      
      const itineraryInput = this.page.locator('textarea[placeholder*="Itinerary"], textarea.textarea-bordered, input[placeholder*="Itinerary"], input.input-bordered').first();
      
      if (!await itineraryInput.isVisible().catch(() => false)) {
        console.error('Could not find itinerary input field');
        await this.takeScreenshot('error-itinerary-input-not-found');
        return false;
      }

      await itineraryInput.clear();
      await itineraryInput.fill(itinerary);
      await this.page.waitForTimeout(500);
      
      await this.saveButton.click();
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error(`Error updating itinerary to "${itinerary}":`, error.message);
      await this.takeScreenshot('error-update-itinerary');
      return false;
    }
  }

  /**
   * Handle Post Message Backgrounds - just click Save without adding new backgrounds
   */
  async handlePostMessageBackgrounds() {
    try {
      console.log('Handling Post Message Backgrounds...');
      await this.clickFeature('Enable Message Post');
      await this.page.waitForTimeout(1000);
      
      const saveButton = this.page.locator('app-get-values .btn:has-text("Save"), div.mat-dialog-actions .btn:has-text("Save")').first();
      
      if (!await saveButton.isVisible().catch(() => false)) {
        console.error('Could not find Save button for Post Message Backgrounds');
        await this.takeScreenshot('error-post-message-save-not-found');
        return false;
      }

      await saveButton.click({ force: true });
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error('Error handling Post Message Backgrounds:', error.message);
      await this.takeScreenshot('error-post-message-backgrounds');
      return false;
    }
  }

  /**
   * Handle KeepSake feature
   * @param {string} welcomeMessage Welcome message to set
   * @param {string} unlockDate Unlock date in MM/DD/YYYY format
   */
  async handleKeepSake(welcomeMessage, unlockDate) {
    try {
      console.log(`Handling KeepSake with message: "${welcomeMessage}" and date: "${unlockDate}"...`);
      await this.clickFeature('KeepSake');
      await this.page.waitForTimeout(1000);
      
      // Fill welcome message
      const welcomeTextarea = this.page.locator('app-keepsake-welcome-popup textarea').first();
      if (await welcomeTextarea.isVisible().catch(() => false)) {
        await welcomeTextarea.clear();
        await welcomeTextarea.fill(welcomeMessage);
      }
      
      // Set unlock date
      const dateInput = this.page.locator('app-keepsake-welcome-popup input.mat-datepicker-input').first();
      if (await dateInput.isVisible().catch(() => false)) {
        await dateInput.clear();
        await dateInput.fill(unlockDate);
      }
      
      // Click Enable button
      const enableButton = this.page.locator('app-keepsake-welcome-popup button:has-text("Enable")').first();
      if (!await enableButton.isVisible().catch(() => false)) {
        console.error('Could not find Enable button for KeepSake');
        await this.takeScreenshot('error-keepsake-enable-not-found');
        return false;
      }

      await enableButton.click({ force: true });
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error('Error handling KeepSake:', error.message);
      await this.takeScreenshot('error-keepsake');
      return false;
    }
  }

  /**
   * Handle Welcome Popup feature - just click Save button
   */
  async handleWelcomePopup() {
    try {
      console.log('Handling Welcome Popup...');
      await this.clickFeature('Welcome Popup');
      await this.page.waitForTimeout(1000);
      
      const saveButton = this.page.locator('app-get-values .btn:has-text("Save"), div.mat-dialog-actions .btn:has-text("Save")').first();
      
      if (!await saveButton.isVisible().catch(() => false)) {
        console.error('Could not find Save button for Welcome Popup');
        await this.takeScreenshot('error-welcome-popup-save-not-found');
        return false;
      }

      await saveButton.click({ force: true });
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error('Error handling Welcome Popup:', error.message);
      await this.takeScreenshot('error-welcome-popup');
      return false;
    }
  }

  /**
   * Handle Scavenger Hunt feature - select Wedding Template and save
   */
  async handleScavengerHunt() {
    try {
      console.log('Handling Scavenger Hunt...');
      await this.clickFeature('Scavenger Hunt');
      await this.page.waitForTimeout(1000);
      
      // Click Wedding Template checkbox if visible
      const weddingTemplateCheckbox = this.page.locator('mat-checkbox:has-text("Wedding Template")').first();
      if (await weddingTemplateCheckbox.isVisible().catch(() => false)) {
        await weddingTemplateCheckbox.click({ force: true });
        await this.page.waitForTimeout(1000);
      }
      
      // Click Save button
      const saveButton = this.page.locator('app-scavenger-hunt-dialog button:has-text("Save")').first();
      if (!await saveButton.isVisible().catch(() => false)) {
        console.error('Could not find Save button for Scavenger Hunt');
        await this.takeScreenshot('error-scavenger-hunt-save-not-found');
        return false;
      }

      await saveButton.click({ force: true });
      await this.page.waitForTimeout(2000);
      
      // Click confirmation Yes button if appears
      const confirmYesButton = this.page.locator('app-confirmation-dialog button:has-text("Yes")').first();
      if (await confirmYesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmYesButton.click({ force: true });
        await this.page.waitForTimeout(2000);
      }
      
      return true;
    } catch (error) {
      console.error('Error handling Scavenger Hunt:', error.message);
      await this.takeScreenshot('error-scavenger-hunt');
      return false;
    }
  }

  /**
   * Handle Require Access Passcode feature - just click Save button
   * @param {string} passcode Optional passcode to set
   */
  async handleAccessPasscode(passcode = '') {
    try {
      console.log('Handling Require Access Passcode...');
      await this.clickFeature(this.features.accessCode);
      await this.page.waitForTimeout(1000);
      
      // Fill passcode if provided
      if (passcode) {
        const passcodeInput = this.page.locator('input.input-bordered').first();
        if (await passcodeInput.isVisible().catch(() => false)) {
          await passcodeInput.clear();
          await passcodeInput.fill(passcode);
          await this.page.waitForTimeout(500);
        }
      }
      
      // Enable toggle if needed
      await this.enableToggleIfUnchecked();
      
      await this.saveButton.click({ force: true });
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error('Error handling Access Passcode:', error.message);
      await this.takeScreenshot('error-access-passcode');
      return false;
    }
  }

  /**
   * Handle Allow sharing via Facebook feature
   */
  async handleFacebookSharing() {
    try {
      console.log('Handling Allow sharing via Facebook...');
      await this.clickFeature('Allow sharing via Facebook');
      await this.page.waitForTimeout(1000);
      
      // Enable toggle if needed
      const toggle = this.toggleSwitch;
      if (await toggle.isVisible().catch(() => false)) {
        const isChecked = await toggle.isChecked().catch(() => false);
        if (!isChecked) {
          await toggle.click({ force: true });
          await this.page.waitForTimeout(1000);
        }
      }
      
      await this.saveButton.click({ force: true });
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      console.error('Error handling Facebook sharing:', error.message);
      await this.takeScreenshot('error-facebook-sharing');
      return false;
    }
  }

  /**
   * Verify all features are enabled before final save
   */
  async verifyAllFeaturesEnabled() {
    try {
      console.log('Verifying all features are enabled...');
      
      const count = await this.page.locator('.options:not(.selected-option)').count();
      
      if (count > 0) {
        console.log(`Found ${count} unselected features, enabling each one...`);
        const options = await this.page.locator('.options:not(.selected-option)').all();
        
        for (const option of options) {
          const featureName = (await option.textContent()).trim();
          console.log(`Enabling unselected feature: ${featureName}`);
          
          await option.click();
          await this.page.waitForTimeout(1000);
          
          // Enable toggle if exists
          await this.enableToggleIfUnchecked();
          
          // Click Save button
          if (await this.saveButton.isVisible().catch(() => false)) {
            await this.saveButton.click({ force: true });
            await this.page.waitForTimeout(2000);
          }
        }
      } else {
        console.log('All features appear to be already enabled');
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying features:', error.message);
      await this.takeScreenshot('error-verify-features');
      return false;
    }
  }

  /**
   * Save settings page after all features are enabled
   */
  async saveSettingsPage() {
    try {
      console.log('Saving settings page...');
      
      const saveButton = this.page.locator('.mt-auto .btn:has-text("Save")').first();
      
      if (!await saveButton.isVisible().catch(() => false)) {
        console.error('Could not find Save button on settings page');
        await this.takeScreenshot('error-save-button-not-found');
        return false;
      }

      await saveButton.click({ force: true });
      await this.page.waitForTimeout(3000);
      return true;
    } catch (error) {
      console.error('Error saving settings page:', error.message);
      await this.takeScreenshot('error-save-settings');
      return false;
    }
  }
}