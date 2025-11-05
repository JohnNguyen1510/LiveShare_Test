import { test, expect } from '@playwright/test';
import { SubscriptionPage } from '../page-objects/SubscriptionPage.js';
import { EventSettingsPage } from '../page-objects/EventSettingsPage.js';
import { BasePage } from '../page-objects/BasePage.js';

/**
 * ============================================================================
 * SHARED SETUP FUNCTIONS
 * ============================================================================
 */

/**
 * Setup function for creating fresh account and event for each tier test
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {import('@playwright/test').BrowserContext} context - Browser context
 * @param {string} tierName - Name of the tier (Free, Standard, Premium, Premium+)
 * @returns {Promise<{success: boolean, testData: Object}>} Setup result with test data
 */
async function setupFreshAccountAndEvent(page, context, tierName) {
  const subscriptionPage = new SubscriptionPage(page);
  const result = await subscriptionPage.setupFreshAccountAndEvent(tierName, context);
  
  if (result.success && result.testData) {
    result.testData.tier = tierName;
  }
  
  return result;
}

/**
 * Subscribe to a plan and handle payment
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {string} planName - Plan name (Standard Event, Premium Event, Premium+ Event)
 * @param {string} tierName - Tier name for logging
 * @returns {Promise<boolean>} Success status
 */
async function subscribeAndPayForPlan(page, planName, tierName) {
  const subscriptionPage = new SubscriptionPage(page);
  return await subscriptionPage.subscribeAndPayForPlan(planName, tierName);
}

/**
 * ============================================================================
 * TEST SUITES - ORGANIZED BY SUBSCRIPTION TIER
 * ============================================================================
 */

test.describe('Event Settings - Comprehensive Testing Suite', () => {
  test.setTimeout(300000);

  /**
   * ============================================================================
   * FREE TIER TESTS - TC-APP-CUST-001 to TC-APP-CUST-007
   * ============================================================================
   */
  test.describe('Free Tier Settings Tests', () => {
    let testData = null;
    
    test.beforeAll(async ({ browser }) => {
      test.setTimeout(120000);
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const setupResult = await setupFreshAccountAndEvent(page, context, 'Free');
      if (!setupResult.success) {
        console.error('❌ Free Tier setup failed');
        await context.close();
        return;
      }
      
      testData = setupResult.testData;
      console.log(`✅ Free Tier account created with email: ${testData.email}`);
      
      await page.waitForTimeout(3000);
      const eventSettingsPage = new EventSettingsPage(page);
      const token = await eventSettingsPage.getAuthToken();
      if (token) {
        testData.token = token;
        console.log(`✅ Free Tier token saved for reuse`);
      }
      
      await context.close();
    });
    
    test('TC-APP-CUST-001: Verify "Event Name" toggle and edit', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-001: Event Name toggle and edit', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await eventSettingsPage.expectOptionVisible('Event Name');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Event Name');
      expect(noPreview).toBeTruthy();
      
      const newEventName = `Test Event Name ${Date.now()}`;
      const changeSuccess = await eventSettingsPage.changeEventName(newEventName);
      expect(changeSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-001 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-002: Verify "Event Date" picker', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-002: Event Date picker', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await eventSettingsPage.expectOptionVisible('Event Date');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Event Date');
      expect(noPreview).toBeTruthy();
      
      const newDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US');
      const changeSuccess = await eventSettingsPage.changeEventDate(newDate);
      expect(changeSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-002 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-003: Verify "Location" field', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-003: Location field', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await eventSettingsPage.expectOptionVisible('Location');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Location');
      expect(noPreview).toBeTruthy();
      
      const location = `Test Location - ${Date.now()}`;
      const updateSuccess = await eventSettingsPage.updateLocation(location);
      expect(updateSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-003 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-004: Verify "Contact" field', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-004: Contact field', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await eventSettingsPage.expectOptionVisible('Contact');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Contact');
      expect(noPreview).toBeTruthy();
      
      const contactInfo = {
        email: testData.email,
        phone: '+1-555-0100'
      };
      const updateSuccess = await eventSettingsPage.updateContact(contactInfo);
      expect(updateSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-004 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-005: Verify "Itinerary" field', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-005: Itinerary field', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await eventSettingsPage.expectOptionVisible('Itinerary');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Itinerary');
      expect(noPreview).toBeTruthy();
      
      const itineraryLines = [
        '9:00 AM - Registration & Welcome Coffee',
        '10:00 AM - Opening Ceremony',
        '11:30 AM - Lunch Break',
        '1:00 PM - Afternoon Activities'
      ];
      const updateSuccess = await eventSettingsPage.updateItinerary(itineraryLines);
      expect(updateSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-005 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-006: Verify "Enable Message Post" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-006: Enable Message Post toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await eventSettingsPage.expectOptionVisible('Enable Message Post');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Enable Message Post');
      expect(noPreview).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-006 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-007: Verify "Video" option', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-007: Video option', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await eventSettingsPage.expectOptionVisible('Video');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Video');
      expect(noPreview).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-007 completed successfully', 'success');
    });
  });

  /**
   * ============================================================================
   * STANDARD TIER TESTS - TC-APP-CUST-008 to TC-APP-CUST-015
   * ============================================================================
   */
  test.describe('Standard Tier Settings Tests', () => {
    let testData = null;
    
    test.beforeAll(async ({ browser }) => {
      test.setTimeout(180000);
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const setupResult = await setupFreshAccountAndEvent(page, context, 'Standard');
      if (!setupResult.success) {
        console.error('❌ Standard Tier setup failed');
        await context.close();
        return;
      }
      
      testData = setupResult.testData;
      console.log(`✅ Standard Tier account created with email: ${testData.email}`);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(3000);
      
      const eventSettingsPage = new EventSettingsPage(page);
      const token = await eventSettingsPage.getAuthToken();
      if (token) {
        testData.token = token;
        console.log(`✅ Standard Tier token saved for reuse`);
      }
      
      await context.close();
    });
    
    test('TC-APP-CUST-008: Verify "Button Link #1" setup', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-008: Button Link #1 setup', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
      if (!subscribed) {
        test.skip('Standard Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Button Link #1');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Button Link #1');
      expect(noPreview).toBeTruthy();
      
      const linkData = { name: 'Test Button', url: 'https://test.com' };
      const configSuccess = await eventSettingsPage.configureButtonLink(1, linkData);
      expect(configSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-008 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-009: Verify "Button Link #2" setup', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-009: Button Link #2 setup', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
      if (!subscribed) {
        test.skip('Standard Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Button Link #2');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Button Link #2');
      expect(noPreview).toBeTruthy();
      
      const linkData = { name: 'RSVP', url: 'https://rsvp.example.com' };
      const configSuccess = await eventSettingsPage.configureButtonLink(2, linkData);
      expect(configSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-009 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-010: Verify "Welcome Popup" setup', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-010: Welcome Popup setup', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
      if (!subscribed) {
        test.skip('Standard Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Welcome Popup');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Welcome Popup');
      expect(noPreview).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-010 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-011: Verify "Enable Photo Gifts" toggle functionality', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-011: Enable Photo Gifts toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
      if (!subscribed) {
        test.skip('Standard Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Enable Photo Gifts');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Enable Photo Gifts');
      expect(noPreview).toBeTruthy();
      
      const initialState = await eventSettingsPage.isOptionEnabled('Enable Photo Gifts');
      basePage.logStep(`Initial state: ${initialState ? 'Enabled' : 'Disabled'}`, 'info');
      
      await eventSettingsPage.setOption('Enable Photo Gifts', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Enable Photo Gifts');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openEventSettings();
      await eventSettingsPage.expectOptionSelected('Enable Photo Gifts');
      
      basePage.logStep('TC-APP-CUST-011 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-012: Verify "Event Header Photo" upload', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-012: Event Header Photo upload', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
      if (!subscribed) {
        test.skip('Standard Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Event Header Photo');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Event Header Photo');
      expect(noPreview).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-012 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-013: Verify "Popularity Badges" toggle functionality', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-013: Popularity Badges toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
      if (!subscribed) {
        test.skip('Standard Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Popularity Badges');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Popularity Badges');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Popularity Badges', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Popularity Badges');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openEventSettings();
      await eventSettingsPage.expectOptionSelected('Popularity Badges');
      
      basePage.logStep('TC-APP-CUST-013 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-014: Verify "Force Login" toggle functionality', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-014: Force Login toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
      if (!subscribed) {
        test.skip('Standard Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Force Login');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Force Login');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Force Login', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Force Login');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openEventSettings();
      await eventSettingsPage.expectOptionSelected('Force Login');
      
      basePage.logStep('TC-APP-CUST-014 completed successfully', 'success');
    });
  });

  /**
   * ============================================================================
   * PREMIUM TIER TESTS - TC-APP-CUST-016 to TC-APP-CUST-022
   * ============================================================================
   */
  test.describe('Premium Tier Settings Tests', () => {
    let testData = null;
    
    test.beforeAll(async ({ browser }) => {
      test.setTimeout(180000);
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const setupResult = await setupFreshAccountAndEvent(page, context, 'Premium');
      if (!setupResult.success) {
        console.error('❌ Premium Tier setup failed');
        await context.close();
        return;
      }
      
      testData = setupResult.testData;
      console.log(`✅ Premium Tier account created with email: ${testData.email}`);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(3000);
      
      const eventSettingsPage = new EventSettingsPage(page);
      const token = await eventSettingsPage.getAuthToken();
      if (token) {
        testData.token = token;
        console.log(`✅ Premium Tier token saved for reuse`);
      }
      
      await context.close();
    });
    
    test('TC-APP-CUST-016: Verify "Allow sharing via Facebook" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-016: Facebook sharing toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
      if (!subscribed) {
        test.skip('Premium Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Allow sharing via Facebook');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Allow sharing via Facebook');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Allow sharing via Facebook', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Allow sharing via Facebook');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openEventSettings();
      await eventSettingsPage.expectOptionSelected('Allow sharing via Facebook');
      
      basePage.logStep('TC-APP-CUST-016 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-017: Verify "Allow Guest Download" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-017: Guest Download toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
      if (!subscribed) {
        test.skip('Premium Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Allow Guest Download');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Allow Guest Download');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Allow Guest Download', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Allow Guest Download');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openEventSettings();
      await eventSettingsPage.expectOptionSelected('Allow Guest Download');
      
      basePage.logStep('TC-APP-CUST-017 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-018: Verify "Add Event Managers" functional', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-018: Add Event Managers', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
      if (!subscribed) {
        test.skip('Premium Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Add Event Managers');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Add Event Managers');
      expect(noPreview).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-018 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-019: Verify "Allow posting without login" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-019: Posting without login toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
      if (!subscribed) {
        test.skip('Premium Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Allow posting without login');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Allow posting without login');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Allow posting without login', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Allow posting without login');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openEventSettings();
      await eventSettingsPage.expectOptionSelected('Allow posting without login');
      
      basePage.logStep('TC-APP-CUST-019 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-020: Verify "Require Access Passcode"', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-020: Require Access Passcode', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
      if (!subscribed) {
        test.skip('Premium Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Require Access Passcode');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Require Access Passcode');
      expect(noPreview).toBeTruthy();
      
      const passcode = '1234';
      const setSuccess = await eventSettingsPage.setAccessPasscode(passcode);
      expect(setSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-020 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-021: Verify Standard features remain unlocked', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-021: Standard features backward compatibility', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
      if (!subscribed) {
        test.skip('Premium Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      const standardFeatures = EventSettingsPage.FeatureTiers.STANDARD;
      let allPass = true;
      
      for (const feature of standardFeatures) {
        const noPreview = await eventSettingsPage.verifyNoPreviewForFree(feature);
        if (!noPreview) {
          allPass = false;
        }
      }
      
      expect(allPass).toBeTruthy();
      basePage.logStep('TC-APP-CUST-021 completed successfully', 'success');
    });
  });

  /**
   * ============================================================================
   * PREMIUM+ TIER TESTS - TC-APP-CUST-023 to TC-APP-CUST-030
   * ============================================================================
   */
  test.describe('Premium+ Tier Settings Tests', () => {
    let testData = null;
    
    test.beforeAll(async ({ browser }) => {
      test.setTimeout(180000);
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const setupResult = await setupFreshAccountAndEvent(page, context, 'Premiumplus');
      if (!setupResult.success) {
        console.error('❌ Premium+ Tier setup failed');
        await context.close();
        return;
      }
      
      testData = setupResult.testData;
      console.log(`✅ Premium+ Tier account created with email: ${testData.email}`);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(3000);
      
      const eventSettingsPage = new EventSettingsPage(page);
      const token = await eventSettingsPage.getAuthToken();
      if (token) {
        testData.token = token;
        console.log(`✅ Premium+ Tier token saved for reuse`);
      }
      
      await context.close();
    });
    
    test('TC-APP-CUST-023: Verify "LiveView Slideshow" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-023: LiveView Slideshow toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
      if (!subscribed) {
        test.skip('Premium+ Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('LiveView Slideshow');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('LiveView Slideshow');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('LiveView Slideshow', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('LiveView Slideshow');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openEventSettings();
      await eventSettingsPage.expectOptionSelected('LiveView Slideshow');
      
      basePage.logStep('TC-APP-CUST-023 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-024: Verify "Then And Now" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-024: Then And Now toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
      if (!subscribed) {
        test.skip('Premium+ Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Then And Now');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Then And Now');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Then And Now', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Then And Now');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openEventSettings();
      await eventSettingsPage.expectOptionSelected('Then And Now');
      
      basePage.logStep('TC-APP-CUST-024 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-025: Verify "Movie Editor" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-025: Movie Editor toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
      if (!subscribed) {
        test.skip('Premium+ Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Movie Editor');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Movie Editor');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Movie Editor', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Movie Editor');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await page.reload();
      await page.waitForTimeout(2000);
      const menuResult = await eventSettingsPage.verifyMenuOptions(['Movie Editor']);
      expect(menuResult.success).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-025 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-026: Verify "KeepSake" configuration', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-026: KeepSake configuration', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
      if (!subscribed) {
        test.skip('Premium+ Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('KeepSake');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('KeepSake');
      expect(noPreview).toBeTruthy();
      
      const keepSakeData = {
        message: 'Welcome to our special event!',
        unlockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
      };
      const configSuccess = await eventSettingsPage.configureKeepSakeWelcome(keepSakeData);
      expect(configSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await page.reload();
      await page.waitForTimeout(2000);
      const menuResult = await eventSettingsPage.verifyMenuOptions(['View Keepsakes']);
      expect(menuResult.success).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-026 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-027: Verify "Scavenger Hunt" setup', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-027: Scavenger Hunt setup', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
      if (!subscribed) {
        test.skip('Premium+ Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Scavenger Hunt');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Scavenger Hunt');
      expect(noPreview).toBeTruthy();
      
      const configSuccess = await eventSettingsPage.configureScavengerHunt(true);
      expect(configSuccess).toBeTruthy();
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      basePage.logStep('TC-APP-CUST-027 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-028: Verify "Sponsor" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-028: Sponsor toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
      if (!subscribed) {
        test.skip('Premium+ Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Sponsor');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Sponsor');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Sponsor', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Sponsor');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await page.reload();
      await page.waitForTimeout(2000);
      const footerResult = await eventSettingsPage.verifyFooterButtons(['Sponsor']);
      expect(footerResult.success).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-028 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-029: Verify "Prize" toggle', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-029: Prize toggle', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
      if (!subscribed) {
        test.skip('Premium+ Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      await eventSettingsPage.expectOptionVisible('Prize');
      const noPreview = await eventSettingsPage.verifyNoPreviewForFree('Prize');
      expect(noPreview).toBeTruthy();
      
      await eventSettingsPage.setOption('Prize', true);
      await page.waitForTimeout(500);
      await eventSettingsPage.expectOptionSelected('Prize');
      
      await eventSettingsPage.saveMainSettings();
      await page.waitForTimeout(2000);
      
      await page.reload();
      await page.waitForTimeout(2000);
      const footerResult = await eventSettingsPage.verifyFooterButtons(['Prize']);
      expect(footerResult.success).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-029 completed successfully', 'success');
    });
    
    test('TC-APP-CUST-030: Verify all lower tiers unlocked', async ({ page }) => {
      if (!testData?.token) {
        test.skip('Setup failed - no test data or token available');
        return;
      }
      
      const eventSettingsPage = new EventSettingsPage(page);
      const basePage = new BasePage(page);
      
      basePage.logStep('TC-APP-CUST-030: Verify all tiers unlocked', 'info');
      await eventSettingsPage.setupTestWithToken(testData);
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.locator('mat-tab-body[role="tabpanel"] .event-card-event').first().click();
      
      const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
      if (!subscribed) {
        test.skip('Premium+ Tier subscription failed');
        return;
      }
      
      await eventSettingsPage.openEventSettings();
      
      const allFeatures = [
        ...EventSettingsPage.FeatureTiers.FREE,
        ...EventSettingsPage.FeatureTiers.STANDARD,
        ...EventSettingsPage.FeatureTiers.PREMIUM,
        ...EventSettingsPage.FeatureTiers.PREMIUM_PLUS
      ];
      
      let allPass = true;
      for (const feature of allFeatures) {
        const noPreview = await eventSettingsPage.verifyNoPreviewForFree(feature);
        if (!noPreview) {
          allPass = false;
        }
      }
      
      expect(allPass).toBeTruthy();
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      const premiumPlusMenuItems = [
        'View Keepsakes',
        'Download All Photos',
        'Movie Editor',
        'LiveView',
        'Redeem Gift Code',
        'Live Help',
        'FAQs',
        'Details',
        'Logout'
      ];
      const menuResult = await eventSettingsPage.verifyMenuOptions(premiumPlusMenuItems);
      expect(menuResult.success).toBeTruthy();
      
      const premiumPlusFooterButtons = [
        'Then & Now',
        'KeepSake',
        'Sponsor',
        'Prize',
        'Message',
        'Photos',
        'Videos'
      ];
      const footerResult = await eventSettingsPage.verifyFooterButtons(premiumPlusFooterButtons);
      expect(footerResult.success).toBeTruthy();
      
      basePage.logStep('TC-APP-CUST-030 completed successfully', 'success');
    });
  });
});
