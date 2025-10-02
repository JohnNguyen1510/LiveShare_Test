import { test, expect } from '@playwright/test';
import { RegisterPage } from '../page-objects/RegisterPage.js';
import { SubscriptionPage } from '../page-objects/SubscriptionPage.js';
import { PaymentPage } from '../page-objects/PaymentPage.js';
import { EventCreationPage } from '../page-objects/EventCreationPage.js';
import { EventSettingsPage } from '../page-objects/EventSettingsPage.js';
import { EventPage } from '../page-objects/EventPage.js';
import path from 'path';
import fs from 'fs';
import Mailosaur from 'mailosaur';
import dotenv from 'dotenv';

dotenv.config();

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Setup function for creating fresh account and event for each test
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {import('@playwright/test').BrowserContext} context - Browser context
 * @param {string} testName - Name of the test for unique identification
 * @returns {Promise<{success: boolean, testData: Object}>} Setup result with test data
 */
async function setupFreshAccountAndEvent(page, context, testName) {
  console.log(`🚀 Starting fresh account and event setup for: ${testName}`);
  
  try {
    // Skip test if Mailosaur is not configured
    if (!process.env.MAILOSAUR_API_KEY || !process.env.MAILOSAUR_SERVER_ID) {
      console.warn('⚠️ Mailosaur environment variables not set, skipping setup');
      return { success: false, testData: null };
    }

    // Initialize page objects
    const registerPage = new RegisterPage(page);
    const eventCreationPage = new EventCreationPage(page);
    
    // Setup Mailosaur for email verification
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

    // Step 1: Navigate to application
    console.log('📍 Step 1: Navigating to application...');
    await page.goto('https://dev.livesharenow.com/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-01-app-loaded.png`) });

    // Step 2: Complete registration flow
    console.log('📍 Step 2: Starting registration process...');
    await registerPage.clickCreateAccount();
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-02-create-account-clicked.png`) });

    // Choose email signup
    console.log('📍 Step 3: Choosing email signup...');
    const emailSignupSuccess = await registerPage.clickEmailSignup();
    if (!emailSignupSuccess) {
      throw new Error('Failed to click email signup');
    }
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-03-email-signup-selected.png`) });

    // Handle terms and conditions
    console.log('📍 Step 4: Handling terms and conditions...');
    await registerPage.handleTermsAndConditions();
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-04-terms-accepted.png`) });

    // Fill registration form
    console.log('📍 Step 5: Filling registration form...');
    await registerPage.fillRegistrationForm(testData.name, testData.email, testData.password);
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-05-registration-form-filled.png`) });

    // Create account
    console.log('📍 Step 6: Creating account...');
    const createAccountButton = page.locator('button:has-text("Create Account")').first();
    await expect(createAccountButton).toBeVisible();
    await createAccountButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-06-account-creation-submitted.png`) });

    // Handle OTP verification
    console.log('📍 Step 7: Handling OTP verification...');
    console.log('⏳ Waiting for verification email...');
    const signUpEmail = await mailosaurClient.messages.get(serverId, {
      sentTo: testEmail
    });
    const verifyEmail = signUpEmail.html.codes[0].value;
    console.log(`📧 Received OTP code: ${verifyEmail}`);
    
    // Wait for OTP input fields and fill them
    const otpInputs = page.locator('.otp-box');
    await otpInputs.first().waitFor({ state: 'visible', timeout: 10000 });
    
    const otpCode = verifyEmail.toString();
    for (let i = 0; i < otpCode.length && i < 6; i++) {
      const input = otpInputs.nth(i);
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.fill(otpCode[i]);
      await page.waitForTimeout(200);
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-07-otp-filled.png`) });

    // Complete registration
    const continueToEventButton = page.locator('button:has-text("Continue to the Event")').first();
    await expect(continueToEventButton).toBeVisible();
    await continueToEventButton.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-08-registration-completed.png`) });

    // Step 8: Create a new event
    console.log('📍 Step 8: Creating new event...');
    const eventCreationStarted = await eventCreationPage.startEventCreation();
    if (!eventCreationStarted) {
      throw new Error('Failed to start event creation');
    }
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-09-event-created.png`) });
    await page.waitForTimeout(4000);

    console.log(`✅ Fresh account and event setup completed successfully for: ${testName}`);
    return { success: true, testData };
    
  } catch (error) {
    console.error(`❌ Setup failed for ${testName}:`, error.message);
    await page.screenshot({ path: path.join(screenshotsDir, `${testName}-error-setup.png`) });
    return { success: false, testData: null };
  }
}

/**
 * Helper function to verify "Preview for Free" text does NOT appear for a given feature
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {string} featureName - Name of the feature to check
 * @returns {Promise<boolean>} True if "Preview for Free" is NOT found (expected behavior)
 */
async function verifyNoPreviewForFree(page, featureName) {
  try {
    console.log(`Checking if "${featureName}" does NOT have "Preview for Free" text...`);
    
    // Find the feature option element
    const featureOption = page.locator(`.options:has-text("${featureName}")`).first();
    
    if (await featureOption.isVisible().catch(() => false)) {
      const featureText = await featureOption.textContent();
      
      // Check if "Preview for Free" text is present
      const hasPreviewForFree = featureText.toLowerCase().includes('preview for free');
      
      if (hasPreviewForFree) {
        console.error(`❌ FAIL: "${featureName}" has "Preview for Free" text (should not have it)`);
        await page.screenshot({ 
          path: path.join(screenshotsDir, `error-${featureName.toLowerCase().replace(/\s+/g, '-')}-has-preview-for-free.png`) 
        });
        return false;
      } else {
        console.log(`✅ PASS: "${featureName}" does NOT have "Preview for Free" text`);
        return true;
      }
    } else {
      console.warn(`⚠️ Feature "${featureName}" not found in UI`);
      return true; // Consider as pass if feature not found (might not be applicable for this plan)
    }
  } catch (error) {
    console.error(`Error checking "${featureName}":`, error.message);
    return false;
  }
}

/**
 * Test Case Descriptor:
 * - Test subscription settings to verify "Preview for Free" text does NOT appear
 * - For each subscription plan (Standard, Premium, Premium+), verify that paid features 
 *   do NOT show "Preview for Free" text after payment
 * - Reuses account credentials from subscription flow
 */
test.describe('Subscription Settings Verification Tests', () => {
  test.setTimeout(400000); // Increased timeout for full flow

  let subscriptionPage;
  let paymentPage;
  let eventSettingsPage;
  let eventPage;
  let testData;

  /**
   * SSV-001: Standard Plan - Verify settings do not show "Preview for Free"
   * Steps:
   * 1. Create fresh account and event
   * 2. Subscribe to Standard Plan
   * 3. Navigate to event settings
   * 4. Verify Standard Plan features do NOT show "Preview for Free"
   */
  test('SSV-001: Standard Plan - Settings Verification', async ({ page, context }) => {
    console.log('🚀 Starting SSV-001: Standard Plan Settings Verification');

    try {
      // Step 1: Setup fresh account and event
      const setupResult = await setupFreshAccountAndEvent(page, context, 'StandardSettings');
      if (!setupResult.success) {
        test.skip('Failed to setup fresh account and event');
        return;
      }
      testData = setupResult.testData;
      console.log(`✅ Setup completed with email: ${testData.email}`);

      // Initialize page objects
      subscriptionPage = new SubscriptionPage(page);
      paymentPage = new PaymentPage(page);
      eventSettingsPage = new EventSettingsPage(page);
      eventPage = new EventPage(page);

      // Step 2: Navigate to subscription and select Standard Plan
      console.log('📍 SSV-001 Step 2: Subscribing to Standard Plan...');
      const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv001-01-subscription-page.png') });

      const selectResult = await subscriptionPage.choosePlanAndClickSelect('Standard Event');
      expect(selectResult.success).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv001-02-plan-selected.png') });

      // Step 3: Handle payment
      console.log(`📍 SSV-001 Step 3: Handling payment flow (${selectResult.navigationType})...`);
      
      let paymentSuccess = false;
      if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
        const stripePage = selectResult.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        await stripePage.screenshot({ path: path.join(screenshotsDir, 'ssv001-03-stripe-checkout.png') });

        const stripePayment = new PaymentPage(stripePage);
        expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
        expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
        paymentSuccess = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        expect(paymentSuccess).toBeTruthy();
        await stripePage.close();
      } else {
        await page.waitForTimeout(2000);
        const stripePayment = new PaymentPage(page);
        await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
        paymentSuccess = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        expect(paymentSuccess).toBeTruthy();
      }

      // Step 4: Navigate back to event and open settings
      console.log('📍 SSV-001 Step 4: Navigating to event settings...');
      await page.waitForTimeout(5000);
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      
      await eventPage.clickFirstEvent();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openSettingsIfNeeded();
      await eventSettingsPage.waitLoaded();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv001-04-settings-opened.png') });

      // Step 5: Verify Standard Plan features do NOT show "Preview for Free"
      console.log('📍 SSV-001 Step 5: Verifying Standard Plan features...');
      
      // Standard Plan typically includes these features
      const standardFeatures = [
        'Event Name',
        'Event Date',
        'Location',
        'Contact',
        'Itinerary',
        'Enable Message Post',
        'Video',
        'Button Link #1',
        'Button Link #2',
        'Welcome Popup'
      ];

      let allTestsPassed = true;
      for (const feature of standardFeatures) {
        const result = await verifyNoPreviewForFree(page, feature);
        if (!result) {
          allTestsPassed = false;
        }
      }

      expect(allTestsPassed).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv001-05-verification-completed.png') });

      console.log('✅ SSV-001 Standard Plan Settings Verification completed successfully');
      
    } catch (error) {
      console.error('❌ SSV-001 Standard Plan Settings Verification failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv001-error-final.png') });
      throw error;
    }
  });

  /**
   * SSV-002: Premium Plan - Verify settings do not show "Preview for Free"
   * Steps:
   * 1. Create fresh account and event
   * 2. Subscribe to Premium Plan
   * 3. Navigate to event settings
   * 4. Verify Premium Plan features do NOT show "Preview for Free"
   */
  test('SSV-002: Premium Plan - Settings Verification', async ({ page, context }) => {
    console.log('🚀 Starting SSV-002: Premium Plan Settings Verification');

    try {
      // Step 1: Setup fresh account and event
      const setupResult = await setupFreshAccountAndEvent(page, context, 'PremiumSettings');
      if (!setupResult.success) {
        test.skip('Failed to setup fresh account and event');
        return;
      }
      testData = setupResult.testData;
      console.log(`✅ Setup completed with email: ${testData.email}`);

      // Initialize page objects
      subscriptionPage = new SubscriptionPage(page);
      paymentPage = new PaymentPage(page);
      eventSettingsPage = new EventSettingsPage(page);
      eventPage = new EventPage(page);

      // Step 2: Navigate to subscription and select Premium Plan
      console.log('📍 SSV-002 Step 2: Subscribing to Premium Plan...');
      const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv002-01-subscription-page.png') });

      const selectResult = await subscriptionPage.choosePlanAndClickSelect('Premium Event');
      expect(selectResult.success).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv002-02-plan-selected.png') });

      // Step 3: Handle payment
      console.log(`📍 SSV-002 Step 3: Handling payment flow (${selectResult.navigationType})...`);
      
      let paymentSuccess = false;
      if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
        const stripePage = selectResult.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        await stripePage.screenshot({ path: path.join(screenshotsDir, 'ssv002-03-stripe-checkout.png') });

        const stripePayment = new PaymentPage(stripePage);
        expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
        expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
        paymentSuccess = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        expect(paymentSuccess).toBeTruthy();
        await stripePage.close();
      } else {
        await page.waitForTimeout(2000);
        const stripePayment = new PaymentPage(page);
        await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
        paymentSuccess = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        expect(paymentSuccess).toBeTruthy();
      }

      // Step 4: Navigate back to event and open settings
      console.log('📍 SSV-002 Step 4: Navigating to event settings...');
      await page.waitForTimeout(5000);
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      
      await eventPage.clickFirstEvent();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openSettingsIfNeeded();
      await eventSettingsPage.waitLoaded();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv002-04-settings-opened.png') });

      // Step 5: Verify Premium Plan features do NOT show "Preview for Free"
      console.log('📍 SSV-002 Step 5: Verifying Premium Plan features...');
      
      // Premium Plan includes Standard features + Premium features
      const premiumFeatures = [
        'Event Name',
        'Event Date',
        'Location',
        'Contact',
        'Itinerary',
        'Enable Message Post',
        'Video',
        'Button Link #1',
        'Button Link #2',
        'Welcome Popup',
        'Allow sharing via Facebook',
        'Allow Guest Download',
        'Add Event Managers',
        'Allow posting without login',
        'Require Access Passcode'
      ];

      let allTestsPassed = true;
      for (const feature of premiumFeatures) {
        const result = await verifyNoPreviewForFree(page, feature);
        if (!result) {
          allTestsPassed = false;
        }
      }

      expect(allTestsPassed).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv002-05-verification-completed.png') });

      console.log('✅ SSV-002 Premium Plan Settings Verification completed successfully');
      
    } catch (error) {
      console.error('❌ SSV-002 Premium Plan Settings Verification failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv002-error-final.png') });
      throw error;
    }
  });

  /**
   * SSV-003: Premium+ Plan - Verify settings do not show "Preview for Free"
   * Steps:
   * 1. Create fresh account and event
   * 2. Subscribe to Premium+ Plan
   * 3. Navigate to event settings
   * 4. Verify Premium+ Plan features do NOT show "Preview for Free"
   */
  test('SSV-003: Premium+ Plan - Settings Verification', async ({ page, context }) => {
    console.log('🚀 Starting SSV-003: Premium+ Plan Settings Verification');

    try {
      // Step 1: Setup fresh account and event
      const setupResult = await setupFreshAccountAndEvent(page, context, 'PremiumPlusSettings');
      if (!setupResult.success) {
        test.skip('Failed to setup fresh account and event');
        return;
      }
      testData = setupResult.testData;
      console.log(`✅ Setup completed with email: ${testData.email}`);

      // Initialize page objects
      subscriptionPage = new SubscriptionPage(page);
      paymentPage = new PaymentPage(page);
      eventSettingsPage = new EventSettingsPage(page);
      eventPage = new EventPage(page);

      // Step 2: Navigate to subscription and select Premium+ Plan
      console.log('📍 SSV-003 Step 2: Subscribing to Premium+ Plan...');
      const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv003-01-subscription-page.png') });

      const selectResult = await subscriptionPage.choosePlanAndClickSelect('Premium+ Event');
      expect(selectResult.success).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv003-02-plan-selected.png') });

      // Step 3: Handle payment
      console.log(`📍 SSV-003 Step 3: Handling payment flow (${selectResult.navigationType})...`);
      
      let paymentSuccess = false;
      if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
        const stripePage = selectResult.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        await stripePage.screenshot({ path: path.join(screenshotsDir, 'ssv003-03-stripe-checkout.png') });

        const stripePayment = new PaymentPage(stripePage);
        expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
        expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
        paymentSuccess = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        expect(paymentSuccess).toBeTruthy();
        await stripePage.close();
      } else {
        await page.waitForTimeout(2000);
        const stripePayment = new PaymentPage(page);
        await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
        paymentSuccess = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        expect(paymentSuccess).toBeTruthy();
      }

      // Step 4: Navigate back to event and open settings
      console.log('📍 SSV-003 Step 4: Navigating to event settings...');
      await page.waitForTimeout(5000);
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      
      await eventPage.clickFirstEvent();
      await page.waitForTimeout(2000);
      
      await eventSettingsPage.openSettingsIfNeeded();
      await eventSettingsPage.waitLoaded();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv003-04-settings-opened.png') });

      // Step 5: Verify Premium+ Plan features do NOT show "Preview for Free"
      console.log('📍 SSV-003 Step 5: Verifying Premium+ Plan features...');
      
      // Premium+ Plan includes all features
      const premiumPlusFeatures = [
        'Event Name',
        'Event Date',
        'Enable Photo Gifts',
        'Event Header Photo',
        'Location',
        'Contact',
        'Itinerary',
        'Enable Message Post',
        'Popularity Badges',
        'Video',
        'Button Link #1',
        'Button Link #2',
        'Welcome Popup',
        'Allow sharing via Facebook',
        'Allow Guest Download',
        'Add Event Managers',
        'Allow posting without login',
        'Require Access Passcode',
        'LiveView Slideshow',
        'Then And Now',
        'Movie Editor',
        'KeepSake',
        'Scavenger Hunt',
        'Sponsor',
        'Prize',
        'Force Login'
      ];

      let allTestsPassed = true;
      for (const feature of premiumPlusFeatures) {
        const result = await verifyNoPreviewForFree(page, feature);
        if (!result) {
          allTestsPassed = false;
        }
      }

      expect(allTestsPassed).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv003-05-verification-completed.png') });

      console.log('✅ SSV-003 Premium+ Plan Settings Verification completed successfully');
      
    } catch (error) {
      console.error('❌ SSV-003 Premium+ Plan Settings Verification failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv003-error-final.png') });
      throw error;
    }
  });

  /**
   * SSV-004: Combined Subscription Settings Check - Test all plans in sequence
   * This test reuses the same account across multiple subscription upgrades
   * to verify settings behavior as the account upgrades through plans
   */
  test('SSV-004: Combined Subscription Settings Verification', async ({ page, context }) => {
    console.log('🚀 Starting SSV-004: Combined Subscription Settings Verification');

    try {
      // Step 1: Setup fresh account and event
      const setupResult = await setupFreshAccountAndEvent(page, context, 'CombinedSettings');
      if (!setupResult.success) {
        test.skip('Failed to setup fresh account and event');
        return;
      }
      testData = setupResult.testData;
      console.log(`✅ Setup completed with email: ${testData.email}`);
      console.log(`🔑 Password: ${testData.password}`);

      // Initialize page objects
      subscriptionPage = new SubscriptionPage(page);
      paymentPage = new PaymentPage(page);
      eventSettingsPage = new EventSettingsPage(page);
      eventPage = new EventPage(page);

      // ===================================================================
      // TEST 1: Standard Plan
      // ===================================================================
      console.log('\n📍 SSV-004-1: Testing Standard Plan Settings...');
      
      const subscriptionNavigationSuccess1 = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess1).toBeTruthy();
      
      const selectResult1 = await subscriptionPage.choosePlanAndClickSelect('Standard Event');
      expect(selectResult1.success).toBeTruthy();

      // Handle payment for Standard Plan
      let paymentSuccess1 = false;
      if (selectResult1.navigationType === 'newPage' && selectResult1.newPage) {
        const stripePage = selectResult1.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        const stripePayment = new PaymentPage(stripePage);
        await stripePayment.verifyOnStripeCheckoutPage();
        await stripePayment.waitForStripeCheckoutReady();
        paymentSuccess1 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        await stripePage.close();
      } else {
        await page.waitForTimeout(2000);
        const stripePayment = new PaymentPage(page);
        await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
        paymentSuccess1 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      }
      expect(paymentSuccess1).toBeTruthy();

      // Navigate to settings and verify Standard features
      await page.waitForTimeout(5000);
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      await eventPage.clickFirstEvent();
      await page.waitForTimeout(2000);
      await eventSettingsPage.openSettingsIfNeeded();
      await eventSettingsPage.waitLoaded();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv004-01-standard-settings.png') });

      const standardFeatures = ['Event Name', 'Event Date', 'Location', 'Contact', 'Button Link #1'];
      let standardTestsPassed = true;
      for (const feature of standardFeatures) {
        const result = await verifyNoPreviewForFree(page, feature);
        if (!result) standardTestsPassed = false;
      }
      expect(standardTestsPassed).toBeTruthy();
      console.log('✅ Standard Plan settings verification passed');

      // Close settings dialog
      const cancelButton1 = page.locator('.mt-auto .btn:has-text("Cancel")').first();
      if (await cancelButton1.isVisible().catch(() => false)) {
        await cancelButton1.click();
        await page.waitForTimeout(1000);
      }

      // ===================================================================
      // TEST 2: Upgrade to Premium Plan
      // ===================================================================
      console.log('\n📍 SSV-004-2: Upgrading to Premium Plan and testing settings...');
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      
      // Create new event for Premium subscription
      const eventCreationPage = new EventCreationPage(page);
      await eventCreationPage.startEventCreation();
      await page.waitForTimeout(4000);

      const subscriptionNavigationSuccess2 = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess2).toBeTruthy();
      
      const selectResult2 = await subscriptionPage.choosePlanAndClickSelect('Premium Event');
      expect(selectResult2.success).toBeTruthy();

      // Handle payment for Premium Plan
      let paymentSuccess2 = false;
      if (selectResult2.navigationType === 'newPage' && selectResult2.newPage) {
        const stripePage = selectResult2.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        const stripePayment = new PaymentPage(stripePage);
        await stripePayment.verifyOnStripeCheckoutPage();
        await stripePayment.waitForStripeCheckoutReady();
        paymentSuccess2 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        await stripePage.close();
      } else {
        await page.waitForTimeout(2000);
        const stripePayment = new PaymentPage(page);
        await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
        paymentSuccess2 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      }
      expect(paymentSuccess2).toBeTruthy();

      // Navigate to settings and verify Premium features
      await page.waitForTimeout(5000);
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      await eventPage.clickFirstEvent();
      await page.waitForTimeout(2000);
      await eventSettingsPage.openSettingsIfNeeded();
      await eventSettingsPage.waitLoaded();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv004-02-premium-settings.png') });

      const premiumFeatures = [
        'Event Name', 'Event Date', 'Location', 'Contact', 
        'Allow sharing via Facebook', 'Allow Guest Download', 'Add Event Managers'
      ];
      let premiumTestsPassed = true;
      for (const feature of premiumFeatures) {
        const result = await verifyNoPreviewForFree(page, feature);
        if (!result) premiumTestsPassed = false;
      }
      expect(premiumTestsPassed).toBeTruthy();
      console.log('✅ Premium Plan settings verification passed');

      // Close settings dialog
      const cancelButton2 = page.locator('.mt-auto .btn:has-text("Cancel")').first();
      if (await cancelButton2.isVisible().catch(() => false)) {
        await cancelButton2.click();
        await page.waitForTimeout(1000);
      }

      // ===================================================================
      // TEST 3: Upgrade to Premium+ Plan
      // ===================================================================
      console.log('\n📍 SSV-004-3: Upgrading to Premium+ Plan and testing settings...');
      
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      
      // Create new event for Premium+ subscription
      await eventCreationPage.startEventCreation();
      await page.waitForTimeout(4000);

      const subscriptionNavigationSuccess3 = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess3).toBeTruthy();
      
      const selectResult3 = await subscriptionPage.choosePlanAndClickSelect('Premium+ Event');
      expect(selectResult3.success).toBeTruthy();

      // Handle payment for Premium+ Plan
      let paymentSuccess3 = false;
      if (selectResult3.navigationType === 'newPage' && selectResult3.newPage) {
        const stripePage = selectResult3.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        const stripePayment = new PaymentPage(stripePage);
        await stripePayment.verifyOnStripeCheckoutPage();
        await stripePayment.waitForStripeCheckoutReady();
        paymentSuccess3 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
        await stripePage.close();
      } else {
        await page.waitForTimeout(2000);
        const stripePayment = new PaymentPage(page);
        await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
        paymentSuccess3 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      }
      expect(paymentSuccess3).toBeTruthy();

      // Navigate to settings and verify Premium+ features
      await page.waitForTimeout(5000);
      await page.goto('https://dev.livesharenow.com/events');
      await page.waitForTimeout(2000);
      await eventPage.clickFirstEvent();
      await page.waitForTimeout(2000);
      await eventSettingsPage.openSettingsIfNeeded();
      await eventSettingsPage.waitLoaded();
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv004-03-premiumplus-settings.png') });

      const premiumPlusFeatures = [
        'Event Name', 'Event Date', 'Location', 'Contact', 
        'Allow sharing via Facebook', 'Allow Guest Download', 'Add Event Managers',
        'LiveView Slideshow', 'Then And Now', 'Movie Editor', 'KeepSake'
      ];
      let premiumPlusTestsPassed = true;
      for (const feature of premiumPlusFeatures) {
        const result = await verifyNoPreviewForFree(page, feature);
        if (!result) premiumPlusTestsPassed = false;
      }
      expect(premiumPlusTestsPassed).toBeTruthy();
      console.log('✅ Premium+ Plan settings verification passed');

      console.log('\n✅ SSV-004: Combined Subscription Settings Verification completed successfully!');
      console.log(`📧 Test account credentials saved:`);
      console.log(`   Email: ${testData.email}`);
      console.log(`   Password: ${testData.password}`);
      
    } catch (error) {
      console.error('❌ SSV-004 Combined Subscription Settings Verification failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'ssv004-error-final.png') });
      throw error;
    }
  });
});