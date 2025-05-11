import { BasePage } from './BasePage.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * @fileoverview Page object for managing event functionality
 */
export class EventPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      settingsButton: 'button.btn.btn-circle.btn-ghost:has(mat-icon:text("settings"))',
      eventNameInput: 'input[placeholder*="name" i]',
      accessCodeInput: 'input.input-bordered',
      eventManagerInput: 'input[placeholder*="email" i]',
      toggleSwitch: '.toggle, .switch, input[type="checkbox"], .mat-slide-toggle',
      saveButton: '.mat-dialog-actions .btn:has-text("Save")',
      eventName: '.event-name-event, .event-name',
      fileInput: 'input[type="file"][accept*="image"]',
      addButton: 'label.btn:has-text("Add")',
      doneButton: 'button:has-text("Done")',
      urlInput: 'input[placeholder*="url" i]'
    };

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
          await this.page.locator(selector).first().click();
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
    await this.waitForSelector(this.selectors.settingsButton);
    await this.takeScreenshot('before-settings');
    await this.safeClick(this.selectors.settingsButton);
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
      
      // Look for the event name input field
      const eventNameSelectors = [
        'input[formcontrolname="name"]',
        'input[placeholder="Event Name"]',
        'input.event-name-input',
        'input#eventName'
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
      const toggle = this.page.locator(this.selectors.toggleSwitch).first();
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

      // Handle file upload
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 10000 }),
        this.safeClick(this.selectors.addButton)
      ]).catch(async (error) => {
        console.error('File chooser error:', error);
        
        // Fallback: Try to set the file input directly if finding the add button fails
        const fileInput = this.page.locator(this.selectors.fileInput);
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles(testImagePath);
          return [null]; // Return array with null to match expected structure
        }
        throw error;
      });

      // If fileChooser was found, set the file
      if (fileChooser) {
        await fileChooser.setFiles(testImagePath);
      }
      
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('event-header-photo-after-upload');

      // Click Done if available
      const doneButton = this.page.locator(this.selectors.doneButton);
      if (await doneButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await doneButton.click({ force: true });
        await this.page.waitForTimeout(2000);
      }

      await this.clickSave();
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
      const toggle = this.page.locator(this.selectors.toggleSwitch).first();
      if (await toggle.isVisible({ timeout: 1000 }).catch(() => false)) {
        const isChecked = await toggle.isChecked().catch(() => null);
        if (isChecked === false) {
          await toggle.click({ force: true });
          await this.page.waitForTimeout(1000);
        }
      }

      // Try multiple selector patterns for name input
      const nameInputSelectors = [
        this.selectors.eventNameInput,
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
        this.selectors.urlInput,
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
      
      // First make sure the add menu is open
      const addButton = this.page.locator('button.menu-button, button:has(mat-icon:text("add"))').first();
      
      // Check if the add button is visible
      const isAddVisible = await addButton.isVisible().catch(() => false);
      if (isAddVisible) {
        console.log('Add button found, clicking to reveal features');
        await addButton.click();
        await this.page.waitForTimeout(1000); // Wait for animation
      }
      
      // Look for various possible selectors for the feature
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
      
      // If regular selectors fail, try case-insensitive search
      const lowerFeatureName = featureName.toLowerCase();
      const allButtons = this.page.locator('button');
      const count = await allButtons.count();
      
      for (let i = 0; i < count; i++) {
        const button = allButtons.nth(i);
        const text = await button.textContent();
        if (text && text.toLowerCase().includes(lowerFeatureName)) {
          console.log(`Found ${featureName} via text content search`);
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

      const input = this.page.locator('input.input-bordered, mat-form-field input, input[type="text"]').first();
      if (await input.isVisible()) {
        await input.clear();
        await input.fill(value);

        if (shouldEnable) {
          const toggle = this.page.locator(this.selectors.toggleSwitch).first();
          if (await toggle.isVisible()) {
            const isChecked = await toggle.isChecked();
            if (!isChecked) {
              await toggle.click({ force: true });
            }
          }
        }

        await this.clickSave();
        return true;
      }

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

      const toggle = this.page.locator(this.selectors.toggleSwitch).first();
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
    const saveButton = this.page.locator(this.selectors.saveButton);
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
      
      // Try multiple selectors for the save button
      const saveButtonSelectors = [
        'button:has-text("Save")',
        'button.save-button',
        'button.btn-primary:has-text("Save")',
        'app-personalize .btn:has-text("Save")',
        'button[type="submit"]',
        '.mat-dialog-actions button:nth-child(2)'
      ];
      
      for (const selector of saveButtonSelectors) {
        const saveButton = this.page.locator(selector).first();
        if (await saveButton.isVisible().catch(() => false)) {
          console.log(`Found final save button using selector: ${selector}`);
          await saveButton.click();
          await this.page.waitForTimeout(2000); // Wait for save operation
          return true;
        }
      }
      
      // If specific selectors fail, try to find any button with Save text
      const anyButtonWithSave = this.page.locator('button').filter({ hasText: /Save/i }).first();
      if (await anyButtonWithSave.isVisible().catch(() => false)) {
        console.log('Found save button via text filter');
        await anyButtonWithSave.click();
        await this.page.waitForTimeout(2000);
        return true;
      }
      
      console.error('Could not find final save button');
      return false;
    } catch (error) {
      console.error('Error clicking final save button:', error.message);
      return false;
    }
  }
} 