import { BasePage } from './BasePage.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * @fileoverview Page object for managing event functionality
 */
export class EventPage extends BasePage {
  constructor(page) {
    super(page);
    // Locators (DMS-style)
    this.settingsButton = this.page.locator('button.btn.btn-circle.btn-ghost:has(mat-icon:text("settings"))').first();
    this.eventNameInput = this.page.locator('input[placeholder*="name" i]').first();
    this.accessCodeInput = this.page.locator('input.input-bordered').first();
    this.eventManagerInput = this.page.locator('input[placeholder*="email" i]').first();
    this.toggleSwitch = this.page.locator('.toggle, .switch, input[type="checkbox"], .mat-slide-toggle').first();
    this.saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save")').first();
    this.eventName = this.page.locator('.event-name-event, .event-name').first();
    this.fileInput = this.page.locator('input[type="file"][accept*="image"]').first();
    this.addButton = this.page.locator('label.btn:has-text("Add"), label[for="popupBg"]').first();
    this.doneButton = this.page.locator('button:has-text("Done"), div.btn:has-text("Done"), .mat-dialog-actions .btn:has-text("Done")').first();
    this.urlInput = this.page.locator('input[placeholder*="url" i]').first();

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
    await this.takeScreenshot('events-page');
  }

  /**
   * Click the first event on the events page
   */
  async clickFirstEvent() {
    try {
      console.log('Selecting first event...');
      // Wait for events page to load
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
      await this.page.waitForTimeout(2000);
      
      // Try different possible selectors for event cards
      const selectors = [
        '.event-card-event', 
        '.event-card', 
        '.flex.pt-8',
        'mat-card',
        '.card',
        '.event-list-item'
      ];
      
      for (const selector of selectors) {
        const elements = await this.page.locator(selector).all();
        if (elements.length > 0) {
          console.log(`Found ${elements.length} events with selector ${selector}`);
          await this.page.locator(selector).nth(1).click();
          await this.page.waitForTimeout(2000); // Wait for navigation
          return true;
        }
      }
      
      // If traditional selectors failed, try to find by event image or container
      const alternativeSelectors = [
        '.event-image-container', 
        '.event-card-container', 
        'img.event-thumbnail',
        'div:has-text("Event Name")'
      ];
      
      for (const selector of alternativeSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible().catch(() => false)) {
          console.log(`Using alternative selector ${selector}`);
          await element.click();
          await this.page.waitForTimeout(2000); // Wait for navigation
          return true;
        }
      }

      console.error('Could not find any events to click');
      return false;
    } catch (error) {
      console.error('Error clicking first event:', error.message);
      return false;
    }
  }

  /**
   * Open event settings
   */
  async openSettings() {
    await this.settingsButton.waitFor({ state: 'visible', timeout: 50000 });
    await this.takeScreenshot('before-settings');
    await this.settingsButton.click({ force: true });
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('after-settings-click');
  }

  /**
   * Update event name
   * @param {string} name New event name
   */
  async updateEventName(name) {
    try {
      console.log(`Updating event name to "${name}"...`);
      
      // First click on Event Name in the options list
      await this.clickFeature(this.features.eventName);
      await this.takeScreenshot('event-name-dialog');
      
      // Look for the event name input field
      const eventNameSelectors = [
        'input[formcontrolname="name"]',
        'input[placeholder="Name"]',
        'input[placeholder="Event Name"]',
        'input.event-name-input',
        'input#eventName',
        'input.input-bordered',
        'input[type="text"]'
      ];
      
      let inputFound = false;
      for (const selector of eventNameSelectors) {
        const input = this.page.locator(selector).first();
        if (await input.isVisible().catch(() => false)) {
          console.log(`Found event name input with selector: ${selector}`);
          
          // Clear the field first
          await input.fill('');
          await this.page.waitForTimeout(500);
          
          // Now enter the new name
          await input.fill(name);
          inputFound = true;
          break;
        }
      }
      
      if (!inputFound) {
        console.error('Could not find event name input field');
        return false;
      }
      
      await this.page.waitForTimeout(1000);
      
      // Click Save button to save the event name
      const saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save"), button:has-text("Save")').first();
      if (await saveButton.isVisible().catch(() => false)) {
        console.log('Clicking Save button for Event Name');
        await saveButton.click();
        await this.page.waitForTimeout(2000);
      } else {
        console.error('Could not find Save button for Event Name');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating event name to "${name}":`, error.message);
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
      await this.takeScreenshot('event-header-photo-dialog');

      // Enable if toggle exists
      const toggle = this.toggleSwitch;
      if (await toggle.isVisible()) {
        const isChecked = await toggle.isChecked().catch(() => null);
        if (isChecked === false) {
          await toggle.click({ force: true });
          await this.page.waitForTimeout(1000);
        }
      }

      // Create screenshots directory if it doesn't exist
      const screenshotsDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      // Create test image if needed
      const testImagePath = path.join(screenshotsDir, 'test.jpg');
      
      // Check if test image already exists
      if (!fs.existsSync(testImagePath)) {
        // Create a simple test image (a minimal valid JPEG)
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

      // Step 1: Find and click the "Add" button
      console.log('Looking for Add button for header photo...');
      const addButton = this.addButton;
      
      if (await addButton.isVisible().catch(() => false)) {
        console.log('Found Add button, clicking it');
        
        try {
          // Try to click the Add button and handle file upload
          const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser', { timeout: 5000 }),
            addButton.click({ force: true })
          ]);
          
          // Set the test image file
          await fileChooser.setFiles(testImagePath);
          console.log('File chooser successfully set test image');
        } catch (error) {
          console.error('Error with file chooser:', error);
          
          // Fallback: Try clicking the Add button and then find the file input
          await addButton.click({ force: true });
          await this.page.waitForTimeout(1000);
          
          // Find any file input and set the files directly
          const fileInput = this.page.locator('input[type="file"], input#popupBg');
          if (await fileInput.count() > 0) {
            await fileInput.setInputFiles(testImagePath);
            console.log('Set test image directly on file input');
          } else {
            throw new Error('Could not find file input after clicking Add button');
          }
        }
      } else {
        // If Add button not found, try to find file input directly
        console.log('Add button not visible, trying to find file input directly');
        const fileInput = this.page.locator('input[type="file"], input#popupBg');
        
        if (await fileInput.count() > 0) {
          await fileInput.setInputFiles(testImagePath);
          console.log('Set test image directly on file input');
        } else {
          throw new Error('Could not find Add button or file input');
        }
      }
      
      // Wait for upload to complete
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('after-photo-upload');
      
      // Step 2: After upload, click the "Done" button
      console.log('Looking for Done button after upload...');
      const doneButton = this.doneButton;
      
      if (await doneButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('Found Done button, clicking it');
        await doneButton.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-done-click');
      } else {
        console.warn('Done button not found after upload');
      }
      
      // Step 3: Finally, click the "Save" button in the mini window
      console.log('Looking for Save button in mini window...');
      const miniWindowSaveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save"), app-get-values .btn:has-text("Save"), button.btn:has-text("Save")').first();
      
      if (await miniWindowSaveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('Found Save button in mini window, clicking it');
        await miniWindowSaveButton.click({ force: true });
        await this.page.waitForTimeout(3000);
        await this.takeScreenshot('after-mini-window-save');
      } else {
        console.warn('Save button in mini window not found');
      }
      
      // Take a final screenshot
      await this.takeScreenshot('event-header-photo-completed');
      return true;
    } catch (error) {
      console.error('Error updating header photo:', error);
      await this.takeScreenshot('error-header-photo');
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
      await this.takeScreenshot(`${buttonName.toLowerCase().replace(/\s+/g, '-')}-dialog`);

      // Enable if toggle exists
      const toggle = this.toggleSwitch;
      if (await toggle.isVisible({ timeout: 1000 }).catch(() => false)) {
        const isChecked = await toggle.isChecked().catch(() => null);
        if (isChecked === false) {
          await toggle.click({ force: true });
          await this.page.waitForTimeout(1000);
        }
      }

      // Try multiple selector patterns for name input
      const nameInputSelectors = [
        'input[placeholder*="name" i]',
        'input[placeholder*="text" i]',
        'input[placeholder*="label" i]',
        'input[type="text"]:nth-of-type(1)',
        'input.input-bordered:nth-of-type(1)',
        'mat-form-field:nth-of-type(1) input'
      ];

      // Try to find and fill the name input
      let nameFieldFilled = false;
      for (const selector of nameInputSelectors) {
        const nameInput = this.page.locator(selector).first();
        if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await nameInput.clear();
          await nameInput.fill(name);
          nameFieldFilled = true;
          break;
        }
      }

      if (!nameFieldFilled) {
        console.warn(`Could not find name input field for ${buttonName}, trying to find any input field`);
        
        // Try to find any input field as fallback
        const inputsLocator = this.page.locator('input[type="text"], input.input-bordered');
        const inputs = await inputsLocator.all();
        
        if (inputs.length > 0) {
          const firstInput = inputs[0];
          await firstInput.clear();
          await firstInput.fill(name);
          nameFieldFilled = true;
        }
      }

      // Try multiple selector patterns for URL input
      const urlInputSelectors = [
        'input[placeholder*="url" i]',
        'input[placeholder*="http" i]',
        'input[type="url"]',
        'input[type="text"]:nth-of-type(2)',
        'input.input-bordered:nth-of-type(2)',
        'mat-form-field:nth-of-type(2) input'
      ];

      // Try to find and fill the URL input
      let urlFieldFilled = false;
      for (const selector of urlInputSelectors) {
        const urlInput = this.page.locator(selector).first();
        if (await urlInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await urlInput.clear();
          await urlInput.fill(url);
          urlFieldFilled = true;
          break;
        }
      }

      if (!urlFieldFilled && nameFieldFilled) {
        console.warn(`Could not find URL input field for ${buttonName}, trying to find second input field`);
        
        // Try to find any input field as fallback
        const inputsLocator = this.page.locator('input[type="text"], input.input-bordered');
        const inputs = await inputsLocator.all();
        
        if (inputs.length > 1) {
          const secondInput = inputs[1];
          await secondInput.clear();
          await secondInput.fill(url);
          urlFieldFilled = true;
        }
      }

      // If we couldn't fill either field, log a warning but continue
      if (!nameFieldFilled || !urlFieldFilled) {
        console.warn(`Could not fill all fields for ${buttonName}: name=${nameFieldFilled}, url=${urlFieldFilled}`);
      }

      await this.takeScreenshot(`${buttonName.toLowerCase().replace(/\s+/g, '-')}-after-fill`);
      await this.clickSave();
      return true;
    } catch (error) {
      console.error(`Error updating ${buttonName}:`, error);
      await this.takeScreenshot(`error-${buttonName.toLowerCase().replace(/\s+/g, '-')}`);
      return false;
    }
  }

  /**
   * Click feature option
   * @param {string} featureName Feature name
   * @private
   */
  async clickFeature(featureName) {
    try {
      console.log(`Looking for ${featureName} feature...`);
      
      // Look for options in the Personalize dialog
      const optionsSelectors = [
        `.options:has-text("${featureName}")`,
        `.options span:text-is("${featureName}")`,
        `.options:has(span:text-is("${featureName}"))`,
        `.wrap .options:has-text("${featureName}")`
      ];
      
      // Try each options selector
      for (const selector of optionsSelectors) {
        const option = this.page.locator(selector).first();
        if (await option.isVisible().catch(() => false)) {
          console.log(`Found ${featureName} using personalize options selector: ${selector}`);
          await option.click();
          await this.page.waitForTimeout(1000); // Wait for click to register
          return true;
        }
      }
      
      // If personalize options not found, try more general selectors
      const featureSelectors = [
        `button:has-text("${featureName}")`,
        `button:has(span:text("${featureName}"))`,
        `button.btn:has-text("${featureName}")`,
        `.btn:has(mat-icon):has-text("${featureName}")`,
        `button.mat-menu-item:has-text("${featureName}")`,
        `div:has-text("${featureName}")`,
      ];
      
      // Try each selector
      for (const selector of featureSelectors) {
        const feature = this.page.locator(selector).first();
        if (await feature.isVisible().catch(() => false)) {
          console.log(`Found ${featureName} using selector: ${selector}`);
          await feature.click();
          await this.page.waitForTimeout(1000); // Wait for click to register
          return true;
        }
      }
      
      // Try a more precise approach with case-insensitive search first within the options
      const options = this.page.locator('.options');
      const optionsCount = await options.count();
      
      for (let i = 0; i < optionsCount; i++) {
        const option = options.nth(i);
        const text = await option.textContent();
        if (text && text.toLowerCase().includes(featureName.toLowerCase())) {
          console.log(`Found ${featureName} via options text search`);
          await option.click();
          await this.page.waitForTimeout(1000);
          return true;
        }
      }
      
      // If still not found, try all buttons and elements
      // If regular selectors fail, try case-insensitive search
      const lowerFeatureName = featureName.toLowerCase();
      const allButtons = this.page.locator('button, .options');
      const count = await allButtons.count();
      
      for (let i = 0; i < count; i++) {
        const button = allButtons.nth(i);
        const text = await button.textContent();
        if (text && text.toLowerCase().includes(lowerFeatureName)) {
          console.log(`Found ${featureName} via general text content search`);
          await button.click();
          await this.page.waitForTimeout(1000);
          return true;
        }
      }
      
      console.error(`Feature "${featureName}" not found`);
      return false;
    } catch (error) {
      console.error(`Error clicking feature "${featureName}":`, error.message);
      return false;
    }
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
      await this.takeScreenshot(`feature-${featureName.toLowerCase().replace(/\s+/g, '-')}-dialog`);

      // Try to find input element - could be regular input or textarea
      let inputFound = false;
      
      // First try textarea for fields like Location
      const textarea = this.page.locator('textarea.textarea-bordered, textarea[placeholder*="Location"]').first();
      if (await textarea.isVisible().catch(() => false)) {
        console.log(`Found textarea for ${featureName}`);
        await textarea.clear();
        await textarea.fill(value);
        inputFound = true;
      }
      
      // If no textarea found, try regular input fields
      if (!inputFound) {
        const input = this.page.locator('input.input-bordered, mat-form-field input, input[type="text"]').first();
        if (await input.isVisible().catch(() => false)) {
          console.log(`Found input for ${featureName}`);
          await input.clear();
          await input.fill(value);
          inputFound = true;
        }
      }

      if (inputFound) {
        if (shouldEnable) {
          const toggle = this.toggleSwitch;
          if (await toggle.isVisible().catch(() => false)) {
            const isChecked = await toggle.isChecked().catch(() => false);
            if (isChecked === false) {
              await toggle.click({ force: true });
              await this.page.waitForTimeout(1000);
            }
          }
        }

        await this.clickSave();
        return true;
      }

      console.warn(`Could not find input or textarea for ${featureName}`);
      return false;
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
      await this.takeScreenshot(`feature-${featureName.toLowerCase().replace(/\s+/g, '-')}-before-toggle`);

      const toggle = this.toggleSwitch;
      if (await toggle.isVisible()) {
        const isChecked = await toggle.isChecked().catch(() => null);
        const needsToggle = (enable && !isChecked) || (!enable && isChecked);

        if (needsToggle) {
          await toggle.click({ force: true });
          await this.page.waitForTimeout(1000);
        }

        await this.clickSave();
        await this.takeScreenshot(`feature-${featureName.toLowerCase().replace(/\s+/g, '-')}-after-toggle`);
        return true;
      }

      return false;
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
    try {
      console.log(`Verifying event name is "${expectedName}"...`);
      
      // Try multiple selectors to find the event name
      const nameSelectors = [
        '.event-name-event',
        '.event-name',
        'span.text-lg',
        '.bottom-section-event span',
        'div.event-detail span:not(.date-event)',
        'h1.event-title',
        'text=' + expectedName
      ];
      
      // First, try all the specific selectors
      for (const selector of nameSelectors) {
        try {
          const elements = await this.page.locator(selector).all();
          for (const element of elements) {
            const nameText = await element.textContent();
            if (nameText && nameText.trim().includes(expectedName)) {
              console.log(`Found matching event name "${nameText}" with selector: ${selector}`);
              return true;
            }
          }
        } catch (error) {
          // Continue to next selector if this one fails
          console.log(`Error with selector ${selector}: ${error.message}`);
        }
      }
      
      // If all specific selectors fail, try a more general text search
      const anyText = await this.page.locator(`text="${expectedName}"`).first().isVisible().catch(() => false);
      if (anyText) {
        console.log(`Found event name using general text search for "${expectedName}"`);
        return true;
      }
      
      // Last resort - check if any element on the page contains the text
      const hasText = await this.page.evaluate((name) => {
        return document.body.innerText.includes(name);
      }, expectedName);
      
      if (hasText) {
        console.log(`Found event name "${expectedName}" in page text`);
        return true;
      }
      
      console.error(`Could not find event name "${expectedName}" on the page`);
      return false;
    } catch (error) {
      console.error(`Error verifying event name "${expectedName}":`, error.message);
      return false;
    }
  }

  /**
   * Click the final save button in event settings
   * @returns {Promise<boolean>} Whether the click was successful
   */
  async clickFinalSave() {
    try {
      console.log('Clicking final save button...');
      console.log('Looking for final save button...');
      
      // First try to find Save button specifically in the personalize dialog
      const personalizeSelectors = [
        'app-personalize .btn:has-text("Save")',
        'app-personalize div.btn:first-child:has-text("Save")',
        'app-personalize .mt-auto .btn:has-text("Save")',
        'div.mt-auto .btn:has-text("Save")'
      ];
      
      for (const selector of personalizeSelectors) {
        const saveButton = this.page.locator(selector).first();
        if (await saveButton.isVisible().catch(() => false)) {
          console.log(`Found final save button in personalize dialog using selector: ${selector}`);
          await saveButton.click();
          
          // Wait longer for save operation to complete
          await this.page.waitForTimeout(3000);
          await this.takeScreenshot('after-final-save-click');
          
          // Check if the personalize dialog is still open
          const dialogStillOpen = await this.page.locator('app-personalize, mat-dialog-container').isVisible().catch(() => false);
          if (dialogStillOpen) {
            console.log('Dialog still open after save click, trying again with force option');
            await saveButton.click({ force: true });
            await this.page.waitForTimeout(3000);
          }
          
          return true;
        }
      }
      
      // Try more general selectors for the save button
      const saveButtonSelectors = [
        'button:has-text("Save")',
        'button.save-button',
        'button.btn-primary:has-text("Save")',
        '.mat-dialog-actions .btn:has-text("Save")',
        'button[type="submit"]',
        '.mat-dialog-actions button:first-child',
        '.btn:first-child:has-text("Save")'
      ];
      
      for (const selector of saveButtonSelectors) {
        const saveButton = this.page.locator(selector).first();
        if (await saveButton.isVisible().catch(() => false)) {
          console.log(`Found final save button using selector: ${selector}`);
          await saveButton.click();
          await this.page.waitForTimeout(3000); // Wait longer for save operation
          
          await this.takeScreenshot('after-general-save-click');
          return true;
        }
      }
      
      // If specific selectors fail, try to find any button with Save text
      const anyButtonWithSave = this.page.locator('button, .btn').filter({ hasText: /Save/i }).first();
      if (await anyButtonWithSave.isVisible().catch(() => false)) {
        console.log('Found save button via text filter');
        await anyButtonWithSave.click();
        await this.page.waitForTimeout(3000);
        
        await this.takeScreenshot('after-text-filter-save-click');
        return true;
      }
      
      // Last resort: click the first button that might look like a save button
      const firstButton = this.page.locator('.mat-dialog-actions .btn, .mat-dialog-actions button').first();
      if (await firstButton.isVisible().catch(() => false)) {
        console.log('Clicking first button in dialog actions as last resort');
        await firstButton.click();
        await this.page.waitForTimeout(3000);
        return true;
      }
      
      console.error('Could not find final save button');
      return false;
    } catch (error) {
      console.error('Error clicking final save button:', error.message);
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
      
      // Click on Location feature
      await this.clickFeature('Location');
      await this.takeScreenshot('location-dialog');
      
      // Look for textarea since Location uses a textarea element
      const locationTextarea = this.page.locator('textarea[placeholder="Location"], textarea.textarea-bordered').first();
      
      if (await locationTextarea.isVisible().catch(() => false)) {
        console.log('Found location textarea');
        
        // Clear and fill the textarea
        await locationTextarea.clear();
        await locationTextarea.fill(location);
        await this.page.waitForTimeout(500);
        
        // Click Save button
        const saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save")').first();
        if (await saveButton.isVisible().catch(() => false)) {
          console.log('Clicking Save button for Location');
          await saveButton.click();
          await this.page.waitForTimeout(2000);
          await this.takeScreenshot('after-location-save');
          return true;
        } else {
          console.error('Could not find Save button for Location');
        }
      } else {
        console.error('Could not find location textarea');
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating location to "${location}":`, error.message);
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
      
      // Click on Contact feature
      await this.clickFeature('Contact');
      await this.takeScreenshot('contact-dialog');
      
      // Look for email input
      const emailInput = this.page.locator('input[placeholder="Email"], input[type="email"]').first();
      if (await emailInput.isVisible().catch(() => false)) {
        console.log('Found email input field');
        await emailInput.clear();
        await emailInput.fill(email);
        await this.page.waitForTimeout(500);
      } else {
        console.warn('Could not find email input field');
      }
      
      // Look for phone input
      const phoneInput = this.page.locator('input[placeholder="Phone"], input[type="tel"]').nth(0);
      if (await phoneInput.isVisible().catch(() => false)) {
        console.log('Found phone input field');
        await phoneInput.clear();
        await phoneInput.fill(phone);
        await this.page.waitForTimeout(500);
      } else {
        // Try to find the second input if explicit phone field not found
        const inputs = this.page.locator('input.input-bordered').all();
        const inputsCount = await this.page.locator('input.input-bordered').count();
        if (inputsCount > 1) {
          const secondInput = this.page.locator('input.input-bordered').nth(1);
          console.log('Using second input field for phone');
          await secondInput.clear();
          await secondInput.fill(phone);
        } else {
          console.warn('Could not find phone input field');
        }
      }
      
      // Click Save button
      const saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save")').first();
      if (await saveButton.isVisible().catch(() => false)) {
        console.log('Clicking Save button for Contact');
        await saveButton.click();
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-contact-save');
        return true;
      } else {
        console.error('Could not find Save button for Contact');
        return false;
      }
    } catch (error) {
      console.error(`Error updating contact information:`, error.message);
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
      
      // Click on Itinerary feature
      await this.clickFeature('Itinerary');
      await this.takeScreenshot('itinerary-dialog');
      
      // Look for input or textarea for Itinerary
      const itineraryInput = this.page.locator('textarea[placeholder*="Itinerary"], textarea.textarea-bordered, input[placeholder*="Itinerary"], input.input-bordered').first();
      
      if (await itineraryInput.isVisible().catch(() => false)) {
        console.log('Found itinerary input field');
        
        // Clear and fill the input
        await itineraryInput.clear();
        await itineraryInput.fill(itinerary);
        await this.page.waitForTimeout(500);
        
        // Click Save button
        const saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save")').first();
        if (await saveButton.isVisible().catch(() => false)) {
          console.log('Clicking Save button for Itinerary');
          await saveButton.click();
          await this.page.waitForTimeout(2000);
          await this.takeScreenshot('after-itinerary-save');
          return true;
        } else {
          console.error('Could not find Save button for Itinerary');
        }
      } else {
        console.error('Could not find itinerary input field');
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating itinerary to "${itinerary}":`, error.message);
      return false;
    }
  }

  /**
   * Handle Post Message Backgrounds - just click Save without adding new backgrounds
   */
  async handlePostMessageBackgrounds() {
    try {
      console.log('Handling Post Message Backgrounds...');
      
      // Click on Post Message Backgrounds feature
      await this.clickFeature('Enable Message Post');
      await this.takeScreenshot('post-message-backgrounds-dialog');
      
      // Wait for the dialog to appear
      await this.page.waitForTimeout(1000);
      
      // Look for the Save button in the dialog
      const saveButton = this.page.locator('app-get-values .btn:has-text("Save"), div.mat-dialog-actions .btn:has-text("Save")').first();
      
      if (await saveButton.isVisible().catch(() => false)) {
        console.log('Found Save button for Post Message Backgrounds, clicking it');
        await saveButton.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-post-message-backgrounds-save');
        return true;
      } else {
        console.error('Could not find Save button for Post Message Backgrounds');
        return false;
      }
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
      
      // Click on KeepSake feature
      await this.clickFeature('KeepSake');
      await this.takeScreenshot('keepsake-dialog');
      
      // Wait for the dialog to appear
      await this.page.waitForTimeout(1000);
      
      // Fill welcome message
      const welcomeTextarea = this.page.locator('app-keepsake-welcome-popup textarea').first();
      if (await welcomeTextarea.isVisible().catch(() => false)) {
        console.log('Found welcome message textarea');
        await welcomeTextarea.clear();
        await welcomeTextarea.fill(welcomeMessage);
      } else {
        console.warn('Could not find welcome message textarea');
      }
      
      // Set unlock date
      const dateInput = this.page.locator('app-keepsake-welcome-popup input.mat-datepicker-input').first();
      if (await dateInput.isVisible().catch(() => false)) {
        console.log('Found date input');
        await dateInput.clear();
        await dateInput.fill(unlockDate);
      } else {
        console.warn('Could not find date input');
      }
      
      // Click Enable button
      const enableButton = this.page.locator('app-keepsake-welcome-popup button:has-text("Enable")').first();
      if (await enableButton.isVisible().catch(() => false)) {
        console.log('Clicking Enable button for KeepSake');
        await enableButton.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-keepsake-enable');
        return true;
      } else {
        console.error('Could not find Enable button for KeepSake');
        return false;
      }
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
      
      // Click on Welcome Popup feature
      await this.clickFeature('Welcome Popup');
      await this.takeScreenshot('welcome-popup-dialog');
      
      // Wait for the dialog to appear
      await this.page.waitForTimeout(1000);
      
      // Look for the Save button in the dialog
      const saveButton = this.page.locator('app-get-values .btn:has-text("Save"), div.mat-dialog-actions .btn:has-text("Save")').first();
      
      if (await saveButton.isVisible().catch(() => false)) {
        console.log('Found Save button for Welcome Popup, clicking it');
        await saveButton.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-welcome-popup-save');
        return true;
      } else {
        console.error('Could not find Save button for Welcome Popup');
        return false;
      }
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
      
      // Click on Scavenger Hunt feature
      await this.clickFeature('Scavenger Hunt');
      await this.takeScreenshot('scavenger-hunt-dialog');
      
      // Wait for the dialog to appear
      await this.page.waitForTimeout(1000);
      
      // Click on Wedding Template checkbox
      const weddingTemplateCheckbox = this.page.locator('mat-checkbox:has-text("Wedding Template")').first();
      if (await weddingTemplateCheckbox.isVisible().catch(() => false)) {
        console.log('Found Wedding Template checkbox, clicking it');
        await weddingTemplateCheckbox.click({ force: true });
        await this.page.waitForTimeout(1000);
      } else {
        console.warn('Could not find Wedding Template checkbox');
      }
      
      // Click Save button
      const saveButton = this.page.locator('app-scavenger-hunt-dialog button:has-text("Save")').first();
      if (await saveButton.isVisible().catch(() => false)) {
        console.log('Found Save button for Scavenger Hunt, clicking it');
        await saveButton.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-scavenger-hunt-save');
        
        // Wait for confirmation dialog and click Yes
        const confirmYesButton = this.page.locator('app-confirmation-dialog button:has-text("Yes")').first();
        if (await confirmYesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('Found confirmation Yes button, clicking it');
          await confirmYesButton.click({ force: true });
          await this.page.waitForTimeout(2000);
          await this.takeScreenshot('after-scavenger-hunt-confirm');
        } else {
          console.warn('Could not find confirmation Yes button');
        }
        
        return true;
      } else {
        console.error('Could not find Save button for Scavenger Hunt');
        return false;
      }
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
      
      // Click on Require Access Passcode feature
      await this.clickFeature(this.features.accessCode);
      await this.takeScreenshot('access-passcode-dialog');
      
      // Wait for the dialog to appear
      await this.page.waitForTimeout(1000);
      
      // Fill passcode if provided
      if (passcode) {
        const passcodeInput = this.page.locator('input.input-bordered').first();
        if (await passcodeInput.isVisible().catch(() => false)) {
          console.log('Found passcode input, filling it');
          await passcodeInput.clear();
          await passcodeInput.fill(passcode);
          await this.page.waitForTimeout(500);
        }
      }
      
      // Enable toggle if it exists
      const toggle = this.page.locator(this.selectors.toggleSwitch).first();
      if (await toggle.isVisible().catch(() => false)) {
        const isChecked = await toggle.isChecked().catch(() => false);
        if (isChecked === false) {
          console.log('Enabling passcode toggle');
          await toggle.click({ force: true });
          await this.page.waitForTimeout(1000);
        }
      }
      
      // Click Save button
      const saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save")').first();
      if (await saveButton.isVisible().catch(() => false)) {
        console.log('Found Save button for Access Passcode, clicking it');
        await saveButton.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-access-passcode-save');
        return true;
      } else {
        console.error('Could not find Save button for Access Passcode');
        return false;
      }
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
      
      // Click on Allow sharing via Facebook feature
      await this.clickFeature('Allow sharing via Facebook');
      await this.takeScreenshot('facebook-sharing-dialog');
      
      // Wait for the dialog to appear
      await this.page.waitForTimeout(1000);
      
      // Enable toggle if it exists and is not already enabled
      const toggle = this.page.locator(this.selectors.toggleSwitch).first();
      if (await toggle.isVisible().catch(() => false)) {
        const isChecked = await toggle.isChecked().catch(() => false);
        if (isChecked === false) {
          console.log('Enabling Facebook sharing toggle');
          await toggle.click({ force: true });
          await this.page.waitForTimeout(1000);
        } else {
          console.log('Facebook sharing toggle is already enabled');
        }
      }
      
      // Click Save button
      const saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save")').first();
      if (await saveButton.isVisible().catch(() => false)) {
        console.log('Found Save button for Facebook sharing, clicking it');
        await saveButton.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-facebook-sharing-save');
        return true;
      } else {
        console.error('Could not find Save button for Facebook sharing');
        return false;
      }
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
      
      // Take screenshot of current state
      await this.takeScreenshot('before-verify-features');
      
      // Look for any feature options that are not selected (white background)
      const unselectedOptions = this.page.locator('.options:not(.selected-option)').all();
      const count = await this.page.locator('.options:not(.selected-option)').count();
      
      if (count > 0) {
        console.log(`Found ${count} unselected features, checking each one...`);
        
        // Get all unselected options
        const options = await this.page.locator('.options:not(.selected-option)').all();
        
        for (const option of options) {
          // Get the text of the option to know which feature it is
          const text = await option.textContent();
          const featureName = text.trim();
          
          console.log(`Found unselected feature: ${featureName}`);
          
          // Click on the feature to enable it
          await option.click();
          await this.page.waitForTimeout(1000);
          
          // Try to enable toggle if it exists
          const toggle = this.page.locator(this.selectors.toggleSwitch).first();
          if (await toggle.isVisible().catch(() => false)) {
            const isChecked = await toggle.isChecked().catch(() => false);
            if (isChecked === false) {
              console.log(`Enabling toggle for ${featureName}`);
              await toggle.click({ force: true });
              await this.page.waitForTimeout(1000);
            }
          }
          
          // Click Save button
          const saveButton = this.page.locator('.mat-dialog-actions .btn:has-text("Save")').first();
          if (await saveButton.isVisible().catch(() => false)) {
            console.log(`Clicking Save button for ${featureName}`);
            await saveButton.click({ force: true });
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
      
      // Take screenshot before saving
      await this.takeScreenshot('before-save-settings');
      
      // Click the Save button in the personalize options
      const saveButton = this.page.locator('.mt-auto .btn:has-text("Save")').first();
      
      if (await saveButton.isVisible().catch(() => false)) {
        console.log('Found Save button on settings page, clicking it');
        await saveButton.click({ force: true });
        await this.page.waitForTimeout(3000);
        await this.takeScreenshot('after-save-settings');
        return true;
      } else {
        console.error('Could not find Save button on settings page');
        return false;
      }
    } catch (error) {
      console.error('Error saving settings page:', error.message);
      await this.takeScreenshot('error-save-settings');
      return false;
    }
  }
} 