import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * @fileoverview Page object for handling event creation functionality
 */
export class EventCreationPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Event creation form locators
    this.addEventButton = this.page.locator('button:has-text("add")').first();
    this.overlay = this.page.locator('.overlay').first();
    this.eventTypeDropdown = this.page.locator('select[role="combobox"]').first();
    this.eventNameInput = this.page.locator('input[placeholder="Event Name"]').first();
    
    // Date selection locators
    this.calendarIcon = this.page.locator('text=calendar_today').first();
    this.dateButton = this.page.locator('button:has-text("September 23,")').first();
    this.nextButton = this.page.locator('button:has-text("Next")').first();
    
    // Event launch locators
    this.launchEventButton = this.page.locator('button:has-text("Launch Event")').first();
    this.backButton = this.page.locator('button:has-text("arrow_back_ios_new")').first();
    
    // Event list verification
    this.myEventsLabel = this.page.locator('label:has-text("My Events")').first();

    // Event creation form locators
    this.eventTypeSelect = this.page.locator('select.select-bordered');
    this.eventNameInput = this.page.locator('input[placeholder="Event Name"]');
    this.dateInput = this.page.locator('input[placeholder="Choose Event Date"]');
    this.calendarHeader = this.page.locator('.mat-calendar-period-button');
    this.yearButton = this.page.locator('.mat-calendar-body-cell-content:text("2025")');
    this.monthButton = this.page.locator('.mat-calendar-body-cell-content:text("MAY")');
    this.dayButton = this.page.locator('.mat-calendar-body-cell-content:text("18")');
    this.nextButton = this.page.locator('button.event-btn:text("Next")');
    this.btn = this.page.locator('button.event-btn');
    this.themeOption = this.page.locator('.theme-card, .container input[type="radio"], .theme-section .theme-card').first();
    this.launchEventButton = this.page.locator('button.launch-button, button.event-btn:text("Launch Event")');
    
    this.myEventsLabel = this.page.locator('div.mat-tab-label-content:has-text("My Events")').first();
    this.premiumPlusButton = this.page.locator('button.btn.btn-xs.btn-info:has-text("PremiumPlus")').first();

    // Default event data
    this.defaultEventData = {
      typeId: '63aac88c5a3b994dcb8602fd',
      name: 'Test Event',
      date: 'September 23,'
    };
  }

  /**
   * Start event creation process
   */
  async startEventCreation() {
    try {
      console.log('Starting event creation process...');
      
      // Click add event button
      await this.addEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.addEventButton.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('add-event-clicked');
      
      await this.eventTypeSelect.selectOption({ label: 'Anniversary' });
      await this.eventNameInput.fill('ttt');

      await this.dateInput.click();
      await this.calendarHeader.click();

      await this.yearButton.click();
      await this.monthButton.click();
      await this.dayButton.click();

      await this.nextButton.click();

      await this.themeOption.click();
      await this.launchEventButton.click();
 
      return true;
    } catch (error) {
      console.error('Error starting event creation:', error.message);
      await this.takeScreenshot('error-start-event-creation');
      return false;
    }
  }

  /**
   * Select event type from dropdown
   * @param {string} eventTypeId - Event type ID to select
   */
  async selectEventType(eventTypeId) {
    try {
      console.log(`Selecting event type: ${eventTypeId}`);
      
      await this.eventTypeDropdown.waitFor({ state: 'visible', timeout: 10000 });
      await this.eventTypeDropdown.selectOption(eventTypeId);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('event-type-selected');
      
      return true;
    } catch (error) {
      console.error('Error selecting event type:', error.message);
      await this.takeScreenshot('error-select-event-type');
      return false;
    }
  }

  /**
   * Fill event name
   * @param {string} eventName - Name for the event
   */
  async fillEventName(eventName) {
    try {
      console.log(`Filling event name: ${eventName}`);
      
      await this.eventNameInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.eventNameInput.click();
      await this.eventNameInput.fill(eventName);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('event-name-filled');
      
      return true;
    } catch (error) {
      console.error('Error filling event name:', error.message);
      await this.takeScreenshot('error-fill-event-name');
      return false;
    }
  }

  /**
   * Set event date using calendar
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
      await this.takeScreenshot('error-set-event-date');
      return false;
    }
  }

  /**
   * Proceed to next step
   */
  async proceedToNext() {
    try {
      console.log('Proceeding to next step...');
      
      await this.nextButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.nextButton.click();
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('next-step-clicked');
      
      return true;
    } catch (error) {
      console.error('Error proceeding to next step:', error.message);
      await this.takeScreenshot('error-proceed-next');
      return false;
    }
  }

  /**
   * Launch the event
   */
  async launchEvent() {
    try {
      console.log('Launching event...');
      
      await this.launchEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.launchEventButton.click();
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('event-launched');
      
      return true;
    } catch (error) {
      console.error('Error launching event:', error.message);
      await this.takeScreenshot('error-launch-event');
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
   * Complete full event creation flow
   * @param {Object} eventData - Event data object
   * @param {string} eventData.typeId - Event type ID
   * @param {string} eventData.name - Event name
   * @param {string} eventData.date - Event date
   * @param {string} eventData.location - Event location
   * @param {string} eventData.description - Event description
   * @returns {Promise<boolean>} Success status
   */
  async createEvent(eventData = {}) {
    try {
      console.log('🎯 Starting complete event creation flow...');
      
      // Use provided data or defaults
      const data = {
        typeId: eventData.typeId || this.defaultEventData.typeId,
        name: eventData.name || this.defaultEventData.name,
        date: eventData.date || this.defaultEventData.date,
        location: eventData.location || 'Test Location',
        description: eventData.description || 'Test event created by automation'
      };
      
      console.log(`Creating event: ${data.name}`);
      
      // Click add event button
      await this.addEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.addEventButton.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('add-event-clicked');
      
      // Select event type
      await this.eventTypeSelect.waitFor({ state: 'visible', timeout: 10000 });
      await this.eventTypeSelect.selectOption({ label: 'Anniversary' });
      await this.page.waitForTimeout(500);
      
      // Fill event name
      await this.eventNameInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.eventNameInput.fill(data.name);
      await this.page.waitForTimeout(500);
      
      // Select date
      await this.dateInput.click();
      await this.calendarHeader.click();
      await this.yearButton.click();
      await this.monthButton.click();
      await this.dayButton.click();
      await this.page.waitForTimeout(500);
      
      // Click Next
      await this.nextButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.nextButton.click();
      await this.page.waitForTimeout(1000);
      
      // Select theme
      await this.themeOption.waitFor({ state: 'visible', timeout: 10000 });
      await this.themeOption.click();
      await this.page.waitForTimeout(500);
      
      // Launch event
      await this.launchEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.launchEventButton.click();
      await this.page.waitForTimeout(3000);
      
      console.log('✅ Event creation completed successfully');
      await this.takeScreenshot('event-creation-completed');
      return true;
      
    } catch (error) {
      console.error('❌ Error in event creation:', error.message);
      await this.takeScreenshot('error-event-creation');
      return false;
    }
  }

    /**
   * Verify Premium Plus subscription is active in events list
   */
  async verifyPremiumPlusSubscription() {
    try {
      console.log('Verifying Premium Plus subscription...');
      
      // SỬA METHOD NÀY - sử dụng PremiumPlus button thay vì My Events label
      await this.premiumPlusButton.waitFor({ state: 'visible', timeout: 10000 });
      await expect(this.premiumPlusButton).toBeVisible();
      
      await this.takeScreenshot('premium-plus-verified');
      return true;
    } catch (error) {
      console.error('Error verifying Premium Plus subscription:', error.message);
      await this.takeScreenshot('error-verify-premium-plus');
      return false;
    }
  }

  /**
   * Get default event data for testing
   * @returns {Object} Default event data
   */
  getDefaultEventData() {
    return {
      typeId: '63aac88c5a3b994dcb8602fd',
      name: 'Test Event',
      date: 'September 23,'
    };
  }

  /**
   * Verify event creation form is ready
   */
  async verifyEventFormReady() {
    try {
      console.log('Verifying event creation form is ready...');
      
      const dropdownVisible = await this.eventTypeDropdown.isVisible({ timeout: 5000 }).catch(() => false);
      const nameInputVisible = await this.eventNameInput.isVisible({ timeout: 5000 }).catch(() => false);
      const calendarVisible = await this.calendarIcon.isVisible({ timeout: 5000 }).catch(() => false);
      
      const formReady = dropdownVisible && nameInputVisible && calendarVisible;
      
      if (formReady) {
        console.log('Event creation form is ready');
        await this.takeScreenshot('event-form-verified');
        return true;
      } else {
        console.error('Event creation form not ready');
        await this.takeScreenshot('event-form-not-ready');
        return false;
      }
    } catch (error) {
      console.error('Error verifying event form:', error.message);
      await this.takeScreenshot('error-verify-event-form');
      return false;
    }
  }

  /**
   * Wait for event creation form to be ready
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForEventFormReady(timeout = 15000) {
    try {
      console.log('Waiting for event creation form to be ready...');
      
      await this.page.waitForSelector('input[placeholder="Event Name"], select[role="combobox"]', { 
        state: 'visible', 
        timeout 
      });
      
      await this.page.waitForTimeout(2000); // Additional wait for form to stabilize
      await this.takeScreenshot('event-form-ready');
      
      return true;
    } catch (error) {
      console.error('Error waiting for event form:', error.message);
      await this.takeScreenshot('error-event-form-wait');
      return false;
    }
  }
}


