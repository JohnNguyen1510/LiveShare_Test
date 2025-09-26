import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * @fileoverview Page object for handling subscription functionality
 */
export class SubscriptionPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Navigation locators
    this.profileMenu = this.page.locator('img').first();
    this.subscriptionMenuItem = this.page.locator('button[role="menuitem"]:has-text("Subscription")').first();
    
    // Subscription page locators
    this.selectButton = this.page.locator('text=Select').first();
    this.subscriptionSuccessMessage = this.page.locator('text=closeCongratulationsSubscription ActiveEvery event you create willnow be').first();
    this.subscriptionSuccessContainer = this.page.locator('app-video-purchase').first();
    this.closeButton = this.page.locator('text=close').first();
    
    // Event creation locators
    this.addEventButton = this.page.locator('button:has-text("add")').first();
    this.overlay = this.page.locator('.overlay').first();
    this.eventDropdown = this.page.locator('select[role="combobox"]').first();
    this.eventNameInput = this.page.locator('input[placeholder="Event Name"]').first();
    this.calendarIcon = this.page.locator('text=calendar_today').first();
    this.dateButton = this.page.locator('button:has-text("September 23,")').first();
    this.nextButton = this.page.locator('button:has-text("Next")').first();
    this.launchEventButton = this.page.locator('button:has-text("Launch Event")').first();
    this.backButton = this.page.locator('button:has-text("arrow_back_ios_new")').first();
    
    // Event list verification
    this.myEventsLabel = this.page.locator('label:has-text("My Events")').first();
  }

  /**
   * Navigate to subscription page via profile menu
   */
  async navigateToSubscription() {
    try {
      console.log('Navigating to subscription page...');
      
      // Click on profile image/menu
      await this.profileMenu.waitFor({ state: 'visible', timeout: 10000 });
      await this.profileMenu.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('profile-menu-opened');
      
      // Click on Subscription menu item
      await this.subscriptionMenuItem.waitFor({ state: 'visible', timeout: 10000 });
      await this.subscriptionMenuItem.click();
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('subscription-page');
     
      return true;
    } catch (error) {
      console.error('Error navigating to subscription page:', error.message);
      await this.takeScreenshot('error-navigation-subscription');
      return false;
    }
  }

  /**
   * Click the Select button to start subscription process
   */
  async clickSelectSubscription() {
    try {
      console.log('Clicking Select button for subscription...');
      
      await this.selectButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.selectButton.click();
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('select-button-clicked');
      
      return true;
    } catch (error) {
      console.error('Error clicking Select button:', error.message);
      await this.takeScreenshot('error-select-button');
      return false;
    }
  }

  /**
   * Close subscription success dialog
   */
  async closeSubscriptionDialog() {
    try {
      console.log('Closing subscription success dialog...');
      
      await this.closeButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.closeButton.click();
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('subscription-dialog-closed');
      
      return true;
    } catch (error) {
      console.error('Error closing subscription dialog:', error.message);
      await this.takeScreenshot('error-close-dialog');
      return false;
    }
  }

  /**
   * Start creating a new event
   */
  async startEventCreation() {
    try {
      console.log('Starting event creation...');
      
      // Click add event button
      await this.addEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.addEventButton.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('add-event-clicked');
      
      // Click overlay to proceed
      await this.overlay.waitFor({ state: 'visible', timeout: 5000 });
      await this.overlay.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('overlay-clicked');
      
      return true;
    } catch (error) {
      console.error('Error starting event creation:', error.message);
      await this.takeScreenshot('error-start-event-creation');
      return false;
    }
  }

  /**
   * Fill event creation form
   * @param {string} eventTypeId - Event type ID to select
   * @param {string} eventName - Name for the event
   */
  async fillEventForm(eventTypeId, eventName) {
    try {
      console.log(`Filling event form with type: ${eventTypeId}, name: ${eventName}`);
      
      // Select event type from dropdown
      await this.eventDropdown.waitFor({ state: 'visible', timeout: 10000 });
      await this.eventDropdown.selectOption(eventTypeId);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('event-type-selected');
      
      // Fill event name
      await this.eventNameInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.eventNameInput.click();
      await this.eventNameInput.fill(eventName);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('event-name-filled');
      
      return true;
    } catch (error) {
      console.error('Error filling event form:', error.message);
      await this.takeScreenshot('error-fill-event-form');
      return false;
    }
  }

  /**
   * Set event date
   */
  async setEventDate() {
    try {
      console.log('Setting event date...');
      
      // Click calendar icon
      await this.calendarIcon.waitFor({ state: 'visible', timeout: 10000 });
      await this.calendarIcon.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('calendar-opened');
      
      // Select date
      await this.dateButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.dateButton.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('date-selected');
      
      return true;
    } catch (error) {
      console.error('Error setting event date:', error.message);
      await this.takeScreenshot('error-set-date');
      return false;
    }
  }

  /**
   * Complete event creation flow
   */
  async completeEventCreation() {
    try {
      console.log('Completing event creation...');
      
      // Click Next button
      await this.nextButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.nextButton.click();
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('next-button-clicked');
      
      // Click Launch Event button
      await this.launchEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.launchEventButton.click();
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('event-launched');
      
      return true;
    } catch (error) {
      console.error('Error completing event creation:', error.message);
      await this.takeScreenshot('error-complete-event-creation');
      return false;
    }
  }

  /**
   * Navigate back to events list
   */
  async navigateBackToEvents() {
    try {
      console.log('Navigating back to events list...');
      
      await this.backButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.backButton.click();
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('back-to-events');
      
      return true;
    } catch (error) {
      console.error('Error navigating back to events:', error.message);
      await this.takeScreenshot('error-navigate-back');
      return false;
    }
  }

  /**
   * Verify Premium Plus subscription is active
   */
  async verifyPremiumPlusSubscription() {
    try {
      console.log('Verifying Premium Plus subscription...');
      
      await this.myEventsLabel.waitFor({ state: 'visible', timeout: 10000 });
      await expect(this.myEventsLabel).toContainText('PremiumPlus');
      
      await this.takeScreenshot('premium-plus-verified');
      return true;
    } catch (error) {
      console.error('Error verifying Premium Plus subscription:', error.message);
      await this.takeScreenshot('error-verify-premium-plus');
      return false;
    }
  }
}


