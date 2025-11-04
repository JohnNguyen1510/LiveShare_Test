import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { RegisterPage } from './RegisterPage.js';
import { EventCreationPage } from './EventCreationPage.js';
import Mailosaur from 'mailosaur';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * @fileoverview Page object for handling subscription functionality
 */
export class SubscriptionPage extends BasePage {
  constructor(page) {
    super(page);

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

    // Event detail page
    this.upgradeButton = this.page.locator('div.d-flex:has-text("Upgrade")');
    this.gridButton = this.page.locator('button:has(mat-icon:text("window"))');
    this.settingsButton = this.page.locator('button:has(mat-icon:text("settings"))');
    this.moreOptionsButton = this.page.locator('button:has(mat-icon:text("more_vert"))');
    
    // OTP input locators
    this.otpInputs = this.page.locator('.otp-box');
    this.continueToEventButton = this.page.locator('button:has-text("Continue to the Event")').first();
  }

  /**
   * Setup fresh account and event for testing
   * @param {string} testName - Name of the test for unique identification
   * @param {import('@playwright/test').BrowserContext} context - Browser context
   * @returns {Promise<{success: boolean, testData: Object}>} Setup result with test data
   */
  async setupFreshAccountAndEvent(testName, context) {
    console.log(`🚀 Starting fresh account and event setup for: ${testName}`);
    
    try {
      // Check Mailosaur configuration
      if (!process.env.MAILOSAUR_API_KEY || !process.env.MAILOSAUR_SERVER_ID) {
        console.warn('⚠️ Mailosaur environment variables not set, skipping setup');
        return { success: false, testData: null };
      }

      // Initialize dependencies
      const registerPage = new RegisterPage(this.page);
      const eventCreationPage = new EventCreationPage(this.page);
      const mailosaurClient = new Mailosaur(process.env.MAILOSAUR_API_KEY);
      const serverId = process.env.MAILOSAUR_SERVER_ID;
      const timestamp = Date.now();
      const testEmail = `auto_${testName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}@${serverId}.mailosaur.net`;
      
      const testData = {
        email: testEmail,
        name: `Auto User ${testName}`,
        password: 't123',
        eventName: `Auto Event ${testName} ${timestamp}`,
        timestamp: timestamp
      };

      console.log(`📧 Using test email: ${testEmail}`);

      // Navigate to application
      console.log('📍 Navigating to application...');
      await this.page.goto('https://dev.livesharenow.com/');
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);

      // Complete registration flow
      console.log('📍 Starting registration process...');
      await registerPage.clickCreateAccount();
      
      const emailSignupSuccess = await registerPage.clickEmailSignup();
      if (!emailSignupSuccess) {
        throw new Error('Failed to click email signup');
      }

      await registerPage.handleTermsAndConditions();
      await registerPage.fillAndSubmitRegistrationForm(testData.name, testData.email, testData.password);
      
      // Handle OTP verification
      console.log('📍 Handling OTP verification...');
      console.log('⏳ Waiting for verification email...');
      const signUpEmail = await mailosaurClient.messages.get(serverId, {
        sentTo: testEmail
      });
      const verifyEmail = signUpEmail.html.codes[0].value;
      console.log(`📧 Received OTP code: ${verifyEmail}`);
      
      // Fill OTP inputs
      await this.otpInputs.first().waitFor({ state: 'visible', timeout: 10000 });
      const otpCode = verifyEmail.toString();
      for (let i = 0; i < otpCode.length && i < 6; i++) {
        const input = this.otpInputs.nth(i);
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.fill(otpCode[i]);
        await this.page.waitForTimeout(200);
      }

      // Complete registration
      await expect(this.continueToEventButton).toBeVisible();
      await this.continueToEventButton.click();
      await this.page.waitForTimeout(3000);

      // Create event
      console.log('📍 Creating new event...');
      const eventCreationStarted = await eventCreationPage.startEventCreation();
      if (!eventCreationStarted) {
        throw new Error('Failed to start event creation');
      }
      await this.page.waitForTimeout(4000);

      console.log(`✅ Fresh account and event setup completed successfully for: ${testName}`);
      return { success: true, testData };
      
    } catch (error) {
      console.error(`❌ Setup failed for ${testName}:`, error.message);
      await this.takeScreenshot(`error-setup-${testName}`);
      return { success: false, testData: null };
    }
  }

  async verifyUILoaded() {
    await this.page.waitForTimeout(3000);
    await expect(this.upgradeButton).toBeVisible();
    await expect(this.gridButton).toBeVisible();
    await expect(this.settingsButton).toBeVisible();
    await expect(this.moreOptionsButton).toBeVisible();
  }

  /**
   * Choose a specific plan card by name and click its Select button
   * @param {"Trial"|"Standard Plan"|"Premium Plan"|"Premium+ Plan"|"Premium+ subscription"} planName
   * @returns {Promise<{success: boolean, navigationType?: string, newPage?: import('@playwright/test').Page}>}
   */
  async choosePlanAndClickSelect(planName) {
    try {
      console.log(`💳 Choosing subscription plan: ${planName}`);

      // Wait for plans grid to be visible
      await this.page.waitForSelector('.options .plan-name', { state: 'visible', timeout: 15000 });

      // Find the plan card container by plan name text
      const planCard = this.page.locator(`.options:has(.plan-name:has-text("${planName}"))`).first();
      const cardVisible = await planCard.isVisible({ timeout: 5000 }).catch(() => false);
      if (!cardVisible) {
        throw new Error(`Plan card not visible for: ${planName}`);
      }

      // Within that card, click its Select button
      const selectInCard = planCard.locator('div.d-flex:has-text("Select")').first();
      await selectInCard.waitFor({ state: 'visible', timeout: 10000 });
      
      // Set up listeners for navigation detection
      const currentUrl = this.page.url();
      let navigationResult = { success: true, navigationType: 'same' };

      // Listen for new page/popup
      const newPagePromise = this.page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);
      
      // Wait for payment session creation API
      console.log('Clicking Select and waiting for payment session API...');
      
      const paymentSessionPromise = this.waitApiResponse('/api/payment/create-session', 200, 'POST', 15000).catch(() => null);
      
      // Click the select button
      await selectInCard.click();
      await this.page.waitForTimeout(1500);

      // Try to get payment session response
      const paymentResponse = await paymentSessionPromise;
      if (paymentResponse) {
        try {
          const sessionData = await paymentResponse.json();
          
          if (sessionData && sessionData.url) {
            console.log('✅ Payment session API responded');
            console.log(`Stripe Checkout URL: ${sessionData.url.substring(0, 80)}...`);
            
            // Verify request payload by checking the request
            const request = paymentResponse.request();
            const postData = request.postData();
            
            if (postData) {
              const payload = JSON.parse(postData);
              console.log(`Payment Request Payload:`);
              console.log(`  - Plan Name: ${payload.name || planName}`);
              console.log(`  - Type: ${payload.type || 'Upgrade'}`);
              console.log(`  - Event ID: ${payload.eventId || 'N/A'}`);
              
              expect(payload).toHaveProperty('name');
              expect(payload).toHaveProperty('type');
              
              // Map plan name to expected code
              const planCodeMap = {
                'Standard Plan': 'Personalized',
                'Premium Plan': 'Premium',
                'Premium+ Plan': 'PremiumPlus',
                'Premium+ subscription': 'PremiumPlusSubscription'
              };
              
              const expectedCode = planCodeMap[planName];
              if (expectedCode) {
                console.log(`  - Expected plan code: ${expectedCode}`);
              }
            }
            
            expect(sessionData).toHaveProperty('url');
            expect(sessionData.url).toContain('checkout.stripe.com');
            console.log('✅ Stripe checkout URL verified');
          }
        } catch (error) {
          console.log('⚠️ Could not parse payment session response:', error.message);
        }
      } else {
        console.log('⚠️ Payment session API not captured (may have redirected immediately)');
      }

      // Check if a new page was opened
      const newPage = await newPagePromise;
      if (newPage) {
        console.log('✅ New page/window detected for payment');
        navigationResult.navigationType = 'newPage';
        navigationResult.newPage = newPage;
      } else {
        // Check if URL changed (redirect)
        await this.page.waitForTimeout(2000);
        const newUrl = this.page.url();
        if (newUrl !== currentUrl) {
          console.log('✅ Page redirect detected for payment');
          navigationResult.navigationType = 'redirect';
        } else {
          console.log('✅ Same page payment (modal/dialog)');
          navigationResult.navigationType = 'same';
        }
      }

      await this.takeScreenshot(`plan-selected-${planName.replace(/\s+/g,'-').toLowerCase()}`);
      return navigationResult;

    } catch (error) {
      console.error('Error choosing plan and clicking Select:', error.message);
      await this.takeScreenshot('error-choose-plan-select');
      return { success: false };
    }
  }

  /**
   * Navigate to subscription page via profile menu
   * Verifies GET /api/plan API response
   */
  async navigateToSubscription() {
    try {
      console.log('💳 Navigating to subscription page and verifying plans API...');
      
      await this.verifyUILoaded();
      
      // Wait for plans API and verify response
      const response = await this.performActionAndWaitForResponse({
        actionPromise: this.upgradeButton.click(),
        apiUrl: '/api/plan',
        statusCode: 200,
        requestMethod: 'GET'
      });
      
      if (Array.isArray(response) && response.length > 0) {
        console.log(`✅ Plans API responded with ${response.length} plans`);
        
        // Verify plan structure
        const firstPlan = response[0];
        expect(firstPlan).toHaveProperty('_id');
        expect(firstPlan).toHaveProperty('code');
        expect(firstPlan).toHaveProperty('name');
        expect(firstPlan).toHaveProperty('amount');
        expect(firstPlan).toHaveProperty('features');
        console.log(`✅ Plan data structure verified`);
      }
      
      await this.page.waitForTimeout(2000);
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
      await this.page.waitForTimeout(3000);
      await this.closeButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.closeButton.click();
      await this.page.waitForTimeout(2000);
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
      await this.addEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.addEventButton.click();
      await this.page.waitForTimeout(1000);
      
      await this.overlay.waitFor({ state: 'visible', timeout: 5000 });
      await this.overlay.click();
      await this.page.waitForTimeout(1000);
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
      
      await this.eventDropdown.waitFor({ state: 'visible', timeout: 10000 });
      await this.eventDropdown.selectOption(eventTypeId);
      await this.page.waitForTimeout(1000);
      
      await this.eventNameInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.eventNameInput.click();
      await this.eventNameInput.fill(eventName);
      await this.page.waitForTimeout(1000);
      
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
      
      await this.calendarIcon.waitFor({ state: 'visible', timeout: 10000 });
      await this.calendarIcon.click();
      await this.page.waitForTimeout(1000);
      
      await this.dateButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.dateButton.click();
      await this.page.waitForTimeout(1000);
      
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
      
      await this.nextButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.nextButton.click();
      await this.page.waitForTimeout(2000);
      
      await this.launchEventButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.launchEventButton.click();
      await this.page.waitForTimeout(3000);
      
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
      return true;
    } catch (error) {
      console.error('Error verifying Premium Plus subscription:', error.message);
      await this.takeScreenshot('error-verify-premium-plus');
      return false;
    }
  }

  /**
   * Subscribe to a plan and handle payment (after account and event are created)
   * @param {string} planName - Plan name (Standard Plan, Premium Plan, Premium+ Plan)
   * @param {string} tierName - Tier name for screenshot naming (optional)
   * @returns {Promise<boolean>} Success status
   */
  async subscribeAndPayForPlan(planName, tierName = 'test') {
    console.log(`💳 Subscribing to ${planName} for ${tierName} Tier...`);
    
    try {
      const PaymentPageClass = (await import('./PaymentPage.js')).PaymentPage;
      const paymentPage = new PaymentPageClass(this.page);

      // Navigate to subscription
      console.log('📍 Navigating to subscription...');
      const subscriptionNavigationSuccess = await this.navigateToSubscription();
      if (!subscriptionNavigationSuccess) {
        throw new Error('Failed to navigate to subscription');
      }
      
      await this.page.waitForTimeout(2000);
      
      // Select plan
      console.log(`📍 Selecting ${planName}...`);
      const selectResult = await this.choosePlanAndClickSelect(planName);
      if (!selectResult.success) {
        throw new Error(`Failed to select ${planName}`);
      }
      
      // Handle payment based on navigation type
      console.log(`📍 Handling payment flow (${selectResult.navigationType})...`);
      
      let paymentSuccess = false;
      
      if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
        // New page/window opened
        console.log('✅ Processing payment in new window...');
        const stripePage = selectResult.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        await stripePage.waitForTimeout(2000);
        
        const stripePayment = new PaymentPageClass(stripePage);
        await stripePayment.verifyOnStripeCheckoutPage();
        await stripePayment.waitForStripeCheckoutReady();
        
        const paymentDetails = stripePayment.getDefaultPaymentDetails();
        paymentSuccess = await stripePayment.completePaymentFlow(paymentDetails);
        
        await stripePage.close();
        console.log('✅ Payment completed in new window and closed');
        
      } else if (selectResult.navigationType === 'redirect') {
        // Page redirected
        console.log('✅ Processing payment on redirected page...');
        await paymentPage.verifyOnStripeCheckoutPage();
        await paymentPage.waitForStripeCheckoutReady();
        
        const paymentDetails = paymentPage.getDefaultPaymentDetails();
        paymentSuccess = await paymentPage.completePaymentFlow(paymentDetails);
        console.log('✅ Payment completed on redirected page');
        
      } else {
        // Same page (modal/dialog)
        console.log('✅ Processing payment on same page (modal)...');
        await paymentPage.verifyOnStripeCheckoutPage();
        await paymentPage.waitForStripeCheckoutReady();
        
        const paymentDetails = paymentPage.getDefaultPaymentDetails();
        paymentSuccess = await paymentPage.completePaymentFlow(paymentDetails);
        console.log('✅ Payment completed on same page');
      }
      
      if (!paymentSuccess) {
        throw new Error('Payment flow did not complete successfully');
      }
      
      console.log(`✅ Successfully subscribed to ${planName}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Subscription failed for ${planName}:`, error.message);
      await this.takeScreenshot(`error-subscription-${tierName}`);
      return false;
    }
  }
}


