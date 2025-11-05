import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * @fileoverview Page object for handling event creation functionality
 */
export class EventCreationPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // ============================================================================
    // NAVIGATION LOCATORS
    // ============================================================================
    this.addEventButton = this.page.locator('button:has-text("add")').first();
    this.backButton = this.page.locator('button:has-text("arrow_back_ios_new")').first();
    this.nextButton = this.page.locator('button.event-btn:text("Next")');
    
    // ============================================================================
    // EVENT FORM LOCATORS
    // ============================================================================
    this.eventTypeSelect = this.page.locator('select.select-bordered');
    this.eventTypeDropdown = this.page.locator('select[role="combobox"]').first();
    this.eventNameInput = this.page.locator('input[placeholder="Event Name"]');
    this.overlay = this.page.locator('.overlay').first();
    
    // ============================================================================
    // DATE SELECTION LOCATORS
    // ============================================================================
    this.dateInput = this.page.locator('input[placeholder="Choose Event Date"]');
    this.calendarIcon = this.page.locator('text=calendar_today').first();
    this.calendarHeader = this.page.locator('.mat-calendar-period-button');
    this.yearButton = this.page.locator('.mat-calendar-body-cell-content:text("2025")');
    this.monthButton = this.page.locator('.mat-calendar-body-cell-content:text("MAY")');
    this.dayButton = this.page.locator('.mat-calendar-body-cell-content:text("18")');
    this.dateButton = this.page.locator('button:has-text("September 23,")').first();
    
    // ============================================================================
    // THEME SELECTION LOCATORS
    // ============================================================================
    this.themeOption = this.page.locator('.theme-card, .container input[type="radio"], .theme-section .theme-card').first();
    
    // ============================================================================
    // ACTION BUTTON LOCATORS
    // ============================================================================
    this.launchEventButton = this.page.locator('button.launch-button, button.event-btn:text("Launch Event")');
    this.btn = this.page.locator('button.event-btn');
    
    // ============================================================================
    // EVENT LIST LOCATORS
    // ============================================================================
    this.myEventsLabel = this.page.locator('div.mat-tab-label-content:has-text("My Events")').first();
    this.eventCards = this.page.locator('div.event-card-event');
    
    // ============================================================================
    // SUBSCRIPTION LABEL LOCATORS
    // ============================================================================
    this.premiumLabel = this.page.locator('button.btn.btn-xs.btn-info:has-text("Premium")').first();
    this.standardLabel = this.page.locator('button.btn.btn-xs.btn-info:has-text("Personalized")').first();
    this.premiumPlusLabel = this.page.locator('button.btn.btn-xs.btn-info:has-text("PremiumPlus")').first();
    
    this.subscriptionLabels = {
      'PERSONALIZED': this.page.locator('button.btn.btn-xs.btn-info:has-text("Personalized")').first(),
      'PREMIUM': this.page.locator('button.btn.btn-xs.btn-info:has-text("Premium")').first(),
      'PREMIUMPLUS': this.page.locator('button.btn.btn-xs.btn-info:has-text("PremiumPlus")').first()
    };

    // ============================================================================
    // DEFAULT TEST DATA
    // ============================================================================
    this.defaultEventData = {
      typeId: '63aac88c5a3b994dcb8602fd',
      name: 'Test Event',
      date: 'September 23,'
    };
  }

  // ============================================================================
  // SUBSCRIPTION VERIFICATION METHODS
  // ============================================================================

  /**
   * Verify all events have PremiumPlus subscription label
   * @returns {Promise<boolean>} Success status
   */
  async verifyAllEventsPremiumPlusLabel() {
    try {
      console.log('🔍 Verifying all events have PremiumPlus label...');
      
      const eventCount = await this.eventCards.count();
      console.log(`Found ${eventCount} events to verify`);
      
      // Early return if no events
      if (eventCount === 0) {
        console.log('⚠️ No events found to verify');
        return false;
      }
      
      let allHavePremiumPlus = true;
      
      for (let i = 0; i < eventCount; i++) {
        const eventCard = this.eventCards.nth(i);
        const subscriptionLabel = eventCard.locator('button.btn.btn-xs.btn-info, button.btn-xs.btn-info');
        
        // Early continue if label doesn't exist
        const labelExists = await subscriptionLabel.count() > 0;
        if (!labelExists) {
          console.log(`❌ Event ${i + 1}: No subscription label found`);
          allHavePremiumPlus = false;
          continue;
        }
        
        const labelText = (await subscriptionLabel.textContent())?.trim() || '';
        console.log(`Event ${i + 1}: Label = "${labelText}"`);
        
        // Check if PremiumPlus
        if (!labelText.includes('PremiumPlus') && !labelText.includes('Premium+')) {
          console.log(`❌ Event ${i + 1}: Label is "${labelText}", not PremiumPlus`);
          allHavePremiumPlus = false;
        } else {
          console.log(`✅ Event ${i + 1}: Has PremiumPlus label`);
        }
      }
      
      if (allHavePremiumPlus) {
        console.log(`✅ All ${eventCount} events have PremiumPlus subscription`);
        return true;
      }
      
      console.log('❌ Not all events have PremiumPlus subscription');
      await this.takeScreenshot('error-premiumplus-verification-failed');
      return false;
      
    } catch (error) {
      console.error('❌ Error verifying PremiumPlus subscription:', error.message);
      await this.takeScreenshot('error-verify-premiumplus');
      throw error;
    }
  }

  // ============================================================================
  // EVENT CREATION METHODS
  // ============================================================================

  /**
   * Start event creation process
   */
  async startEventCreation() {
    try {
      console.log('🎯 Starting event creation process...');
      
      // Click add event button
      await this.addEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.addEventButton.click();
      await this.page.waitForTimeout(1000);
      
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
      
      console.log('✅ Event creation process completed');
      return true;
    } catch (error) {
      console.error('❌ Error starting event creation:', error.message);
      await this.takeScreenshot('error-start-event-creation');
      throw error;
    }
  }

  /**
   * Select event type from dropdown
   * @param {string} eventTypeId - Event type ID to select
   */
  async selectEventType(eventTypeId) {
    console.log(`📝 Selecting event type: ${eventTypeId}`);
    
    await this.eventTypeDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.eventTypeDropdown.selectOption(eventTypeId);
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Event type selected');
  }

  /**
   * Fill event name
   * @param {string} eventName - Name for the event
   */
  async fillEventName(eventName) {
    console.log(`📝 Filling event name: ${eventName}`);
    
    await this.eventNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.eventNameInput.click();
    await this.eventNameInput.fill(eventName);
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Event name filled');
  }

  /**
   * Set event date using calendar
   */
  async setEventDate() {
    console.log('📅 Setting event date...');
    
    // Click calendar icon
    await this.calendarIcon.waitFor({ state: 'visible', timeout: 10000 });
    await this.calendarIcon.click();
    await this.page.waitForTimeout(1000);
    
    // Select date
    await this.dateButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.dateButton.click();
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Event date set');
  }

  /**
   * Proceed to next step
   */
  async proceedToNext() {
    console.log('➡️ Proceeding to next step...');
    
    await this.nextButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.nextButton.click();
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Proceeded to next step');
  }

  /**
   * Launch the event and wait for API response
   * @returns {Promise<Object>} Event creation response
   */
  async launchEvent() {
    console.log('🚀 Launching event and waiting for API response...');
    
    await this.launchEventButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Wait for event creation API response using BasePage helper
    const createEventResponse = await this.performActionAndWaitForResponse({
      actionPromise: this.launchEventButton.click(),
      apiUrl: '/api/events',
      statusCode: 200,
      requestMethod: 'POST'
    });
    
    // Early return if no valid response
    if (!createEventResponse || !createEventResponse._id) {
      console.warn('⚠️ Unexpected event creation response:', createEventResponse);
      return createEventResponse;
    }
    
    console.log('✅ Event created successfully');
    console.log(`Event ID: ${createEventResponse._id}`);
    console.log(`Event Name: ${createEventResponse.name || 'Unknown'}`);
    console.log(`Event Code: ${createEventResponse.linkName || 'Unknown'}`);
    
    // Store event data in localStorage for other tests
    await this.page.evaluate((eventData) => {
      localStorage.setItem('LAST_CREATED_EVENT', JSON.stringify({
        id: eventData._id,
        name: eventData.name,
        eventCode: eventData.linkName,
        createdAt: eventData.createdAt
      }));
    }, createEventResponse);
    
    console.log('✅ Event data stored in localStorage');
    await this.page.waitForTimeout(3000);
    
    return createEventResponse;
  }

  /**
   * Navigate back to events list
   */
  async navigateBackToEvents() {
    console.log('🔙 Navigating back to events list...');
    
    await this.goto('/events');
    await this.waitForPageLoad();
    
    console.log('✅ Navigated to events list');
  }

  /**
   * Complete full event creation flow
   * @param {Object} eventData - Event data object
   * @param {string} eventData.typeId - Event type ID
   * @param {string} eventData.name - Event name
   * @param {string} eventData.date - Event date
   * @param {string} eventData.location - Event location
   * @param {string} eventData.description - Event description
   * @returns {Promise<Object>} Event creation response
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
      
      // Launch event and get API response
      const eventResponse = await this.launchEvent();
      
      console.log('✅ Event creation completed successfully');
      return eventResponse;
      
    } catch (error) {
      console.error('❌ Error in event creation:', error.message);
      await this.takeScreenshot('error-event-creation');
      throw error;
    }
  }

  // ============================================================================
  // SUBSCRIPTION LABEL VERIFICATION METHODS  
  // ============================================================================

  /**
   * Verify subscription label is active in events list
   * @param {'PERSONALIZED'|'PREMIUM'|'PREMIUMPLUS'} expectedLabel - Expected subscription label
   * @returns {Promise<boolean>} Whether label is visible
   */
  async verifySubscriptionLabel(expectedLabel = 'PERSONALIZED') {
    console.log(`🔍 Verifying subscription label: ${expectedLabel}`);
    
    const labelLocator = this.subscriptionLabels[expectedLabel];
    if (!labelLocator) {
      throw new Error(`Unknown subscription label: ${expectedLabel}`);
    }
    
    await labelLocator.waitFor({ state: 'visible', timeout: 10000 });
    await expect(labelLocator).toBeVisible();
    
    console.log(`✅ ${expectedLabel} subscription label verified`);
    return true;
  }

  /**
   * Verify Premium Plus subscription is active in events list
   * @param {string} label - Subscription label to verify
   * @returns {Promise<boolean>} Whether label is visible
   */
  async verifyPremiumSubscription(label) {
    console.log(`🔍 Verifying ${label} subscription...`);
    
    const labelLocator = this.subscriptionLabels[label];
    if (!labelLocator) {
      console.error(`❌ Unknown subscription label: ${label}`);
      return false;
    }
    
    const isVisible = await labelLocator.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      console.log(`✅ Found subscription label: ${label}`);
      return true;
    }
    
    console.error(`❌ Subscription label ${label} not found`);
    return false;
  }

  // ============================================================================
  // HELPER AND UTILITY METHODS
  // ============================================================================

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
   * @returns {Promise<boolean>} Whether form is ready
   */
  async verifyEventFormReady() {
    console.log('🔍 Verifying event creation form is ready...');
    
    const dropdownVisible = await this.eventTypeDropdown.isVisible({ timeout: 5000 }).catch(() => false);
    const nameInputVisible = await this.eventNameInput.isVisible({ timeout: 5000 }).catch(() => false);
    const calendarVisible = await this.calendarIcon.isVisible({ timeout: 5000 }).catch(() => false);
    
    const formReady = dropdownVisible && nameInputVisible && calendarVisible;
    
    if (!formReady) {
      console.error('❌ Event creation form not ready');
      await this.takeScreenshot('event-form-not-ready');
      return false;
    }
    
    console.log('✅ Event creation form is ready');
    return true;
  }

  /**
   * Wait for event creation form to be ready
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} Whether form is ready
   */
  async waitForEventFormReady(timeout = 15000) {
    console.log('⏳ Waiting for event creation form to be ready...');
    
    await this.page.waitForSelector('input[placeholder="Event Name"], select[role="combobox"]', { 
      state: 'visible', 
      timeout 
    });
    
    await this.page.waitForTimeout(2000);
    console.log('✅ Event creation form is ready');
    return true;
  }
}




