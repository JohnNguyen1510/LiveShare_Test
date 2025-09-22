import { test, expect } from '@playwright/test';
import { RegisterPage } from '../page-objects/RegisterPage.js';
import { SubscriptionPage } from '../page-objects/SubscriptionPage.js';
import { PaymentPage } from '../page-objects/PaymentPage.js';
import { EventCreationPage } from '../page-objects/EventCreationPage.js';
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

test.describe('TC-APP-SUB-002: Complete Subscription Flow (Page Object Model)', () => {
  test.setTimeout(300000); // 5 minutes timeout for complete flow

  let registerPage;
  let subscriptionPage;
  let paymentPage;
  let eventCreationPage;
  let mailosaurClient;
  let serverId;
  let testEmail;

  test.beforeEach(async ({ page, context }) => {
    // Initialize page objects
    registerPage = new RegisterPage(page);
    subscriptionPage = new SubscriptionPage(page);
    paymentPage = new PaymentPage(page);
    eventCreationPage = new EventCreationPage(page);

    // Setup Mailosaur for email verification
    if (process.env.MAILOSAUR_API_KEY && process.env.MAILOSAUR_SERVER_ID) {
      mailosaurClient = new Mailosaur(process.env.MAILOSAUR_API_KEY);
      serverId = process.env.MAILOSAUR_SERVER_ID;
      testEmail = `auto_${Date.now()}@${serverId}.mailosaur.net`;
    }
  });

  test('Complete subscription flow using Page Object Model', async ({ page, context }) => {
    // Skip test if Mailosaur is not configured
    if (!process.env.MAILOSAUR_API_KEY || !process.env.MAILOSAUR_SERVER_ID) {
      test.skip('Mailosaur environment variables not set');
      return;
    }

    console.log(`🚀 Starting complete subscription flow test with email: ${testEmail}`);

    try {
      // Step 1: Navigate to application
      console.log('📍 Step 1: Navigating to application...');
      await page.goto('https://dev.livesharenow.com/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-01-app-loaded.png') });

      // Step 2: Start registration process
      console.log('📍 Step 2: Starting registration process...');
      await registerPage.clickCreateAccount();
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-02-create-account-clicked.png') });

      // Step 3: Choose email signup
      console.log('📍 Step 3: Choosing email signup...');
      const emailSignupSuccess = await registerPage.clickEmailSignup();
      expect(emailSignupSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-03-email-signup-selected.png') });

      // Step 4: Handle terms and conditions
      console.log('📍 Step 4: Handling terms and conditions...');
      await registerPage.handleTermsAndConditions();
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-04-terms-accepted.png') });

      // Step 5: Fill registration form
      console.log('�� Step 5: Filling registration form...');
      const testName = 'Test User';
      const testPassword = 't123';
      
      await registerPage.fillRegistrationForm(testName, testEmail, testPassword);
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-05-registration-form-filled.png') });

      // Step 6: Create account
      console.log('📍 Step 6: Creating account...');
      const createAccountButton = page.locator('button:has-text("Create Account")').first();
      await expect(createAccountButton).toBeVisible();
      await createAccountButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-06-account-creation-submitted.png') });

      // Step 7: Handle OTP verification
      console.log('�� Step 7: Handling OTP verification...');
      
      // Wait for email to arrive
      console.log('⏳ Waiting for verification email...');
      const signUpEmail = await mailosaurClient.messages.get(serverId, {
        sentTo: testEmail
      });
      const verifyEmail = signUpEmail.html.codes[0].value;
      console.log(`📧 Received OTP code: ${verifyEmail}`);
      
      // Wait for OTP input fields to be visible
      const otpInputs = page.locator('.otp-box');
      await otpInputs.first().waitFor({ state: 'visible', timeout: 10000 });
      
      // Fill OTP code
      const otpCode = verifyEmail.toString();
      for (let i = 0; i < otpCode.length && i < 6; i++) {
        const input = otpInputs.nth(i);
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.fill(otpCode[i]);
        await page.waitForTimeout(200);
      }
      
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-07-otp-filled.png') });

      // Click Continue to complete registration
      const continueToEventButton = page.locator('button:has-text("Continue to the Event")').first();
      await expect(continueToEventButton).toBeVisible();
      await continueToEventButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-08-registration-completed.png') });

      // Step 8: Navigate to subscription
      console.log('📍 Step 8: Navigating to subscription...');
      const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-09-subscription-page.png') });

      // Step 9: Start subscription process - this will open new window
      console.log('📍 Step 9: Starting subscription process (will open new window)...');
      
      // Set up promise to wait for new page/window
      const newPagePromise = context.waitForEvent('page');
      
      // Click Select button - this should open new window
      const selectSubscriptionSuccess = await subscriptionPage.clickSelectSubscription();
      expect(selectSubscriptionSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-10-select-subscription-clicked.png') });

      // Step 10: Handle new Stripe checkout window
      console.log('📍 Step 10: Handling new Stripe checkout window...');
      
      // Wait for new page to be created
      const newPage = await newPagePromise;
      console.log('✅ New window opened for Stripe checkout');
      
      // Wait for new page to load
      await newPage.waitForLoadState('domcontentloaded');
      await newPage.waitForTimeout(2000);
      await newPage.screenshot({ path: path.join(screenshotsDir, 'pom-11-stripe-checkout-window.png') });

      // Create PaymentPage instance for the new window
      const stripePaymentPage = new PaymentPage(newPage);
      
      // Verify we're on Stripe checkout page
      const isOnStripeCheckout = await stripePaymentPage.verifyOnStripeCheckoutPage();
      expect(isOnStripeCheckout).toBeTruthy();

      // Wait for Stripe checkout form to be ready
      const stripeReady = await stripePaymentPage.waitForStripeCheckoutReady();
      expect(stripeReady).toBeTruthy();

      // Get default payment details
      const paymentDetails = stripePaymentPage.getDefaultPaymentDetails();
      
      // Complete payment flow in new window
      const paymentSuccess = await stripePaymentPage.completePaymentFlow(paymentDetails);
      expect(paymentSuccess).toBeTruthy();
      await newPage.screenshot({ path: path.join(screenshotsDir, 'pom-12-payment-completed.png') });

      // Close the Stripe checkout window after payment
      await newPage.close();
      console.log('✅ Stripe checkout window closed');

      // Step 11: Verify subscription success on original page
      console.log('📍 Step 11: Verifying subscription success on original page...');
      
      // Wait a bit for the original page to update
      await page.waitForTimeout(3000);
      
      // Close success dialog
      const closeSuccess = await subscriptionPage.closeSubscriptionDialog();
      expect(closeSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-14-success-dialog-closed.png') });

      // Step 12: Create new event
      console.log('📍 Step 12: Creating new event...');
      const eventCreationStarted = await eventCreationPage.startEventCreation();
      expect(eventCreationStarted).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-15-event-creation-started.png') });

     // Step 13: Navigate back and verify Premium Plus
      console.log('📍 Step 13: Verifying Premium Plus subscription...');
      const navigateBackSuccess = await eventCreationPage.navigateBackToEvents();
      expect(navigateBackSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-17-back-to-events.png') });

      // THÊM WAIT TIME NÀY
      await page.waitForTimeout(5000); // Wait for page to fully load

      // Verify Premium Plus subscription is active
      const premiumPlusVerified = await eventCreationPage.verifyPremiumPlusSubscription();
      expect(premiumPlusVerified).toBeTruthy();

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'pom-error-final-state.png') });
      throw error;
    }
  });

  test('Subscription flow with custom test data', async ({ page, context }) => {
    // Skip test if Mailosaur is not configured
    if (!process.env.MAILOSAUR_API_KEY || !process.env.MAILOSAUR_SERVER_ID) {
      test.skip('Mailosaur environment variables not set');
      return;
    }

    console.log(`🚀 Starting subscription flow test with custom data: ${testEmail}`);

    try {
      // Navigate to application
      await page.goto('https://dev.livesharenow.com/');
      await page.waitForLoadState('domcontentloaded');

      // Complete registration using RegisterPage
      await registerPage.clickCreateAccount();
      await registerPage.clickEmailSignup();
      await registerPage.handleTermsAndConditions();
      
      const testName = 'Custom Test User';
      const testPassword = 'CustomPass123!';
      await registerPage.fillRegistrationForm(testName, testEmail, testPassword);
      
      const createAccountButton = page.locator('button:has-text("Create Account")').first();
      await createAccountButton.click();
      await page.waitForTimeout(2000);

      // Handle OTP verification
      const signUpEmail = await mailosaurClient.messages.get(serverId, {
        sentTo: testEmail
      });
      const verifyEmail = signUpEmail.html.codes[0].value;
      
      const otpInputs = page.locator('.otp-box');
      const otpCode = verifyEmail.toString();
      for (let i = 0; i < otpCode.length && i < 6; i++) {
        const input = otpInputs.nth(i);
        await input.fill(otpCode[i]);
        await page.waitForTimeout(200);
      }
      
      const continueToEventButton = page.locator('button:has-text("Continue to the Event")').first();
      await continueToEventButton.click();
      await page.waitForTimeout(3000);

      // Navigate to subscription
      await subscriptionPage.navigateToSubscription();
      
      // Set up promise to wait for new page/window
      const newPagePromise = context.waitForEvent('page');
      
      // Click Select button - this should open new window
      await subscriptionPage.clickSelectSubscription();

      // Handle new Stripe checkout window
      const newPage = await newPagePromise;
      console.log('✅ New window opened for Stripe checkout');
      
      // Wait for new page to load
      await newPage.waitForLoadState('domcontentloaded');
      await newPage.waitForTimeout(2000);
      
      // Create PaymentPage instance for the new window
      const stripePaymentPage = new PaymentPage(newPage);
      
      // Verify we're on Stripe checkout page
      const isOnStripeCheckout = await stripePaymentPage.verifyOnStripeCheckoutPage();
      expect(isOnStripeCheckout).toBeTruthy();

      // Wait for Stripe checkout form to be ready
      const stripeReady = await stripePaymentPage.waitForStripeCheckoutReady();
      expect(stripeReady).toBeTruthy();
      
      const customPaymentDetails = {
        cardNumber: '4242 4242 4242 4242',
        expiration: '12 / 25',
        cvc: '456',
        cardholderName: 'Custom Test User',
        country: 'US'
      };
      
      const paymentSuccess = await stripePaymentPage.completePaymentFlow(customPaymentDetails);
      expect(paymentSuccess).toBeTruthy();

      // Close the Stripe checkout window after payment
      await newPage.close();
      console.log('✅ Stripe checkout window closed');

      // Wait for original page to update
      await page.waitForTimeout(3000);
      
      await subscriptionPage.closeSubscriptionDialog();

      // Create event with custom data
      await eventCreationPage.startEventCreation();
      
      const customEventData = {
        typeId: '63aac88c5a3b994dcb8602fd',
        name: 'Custom Test Event',
        date: 'September 23,'
      };
      
      const eventCreationSuccess = await eventCreationPage.completeEventCreation(customEventData);
      expect(eventCreationSuccess).toBeTruthy();

      // Verify Premium Plus
      await eventCreationPage.navigateBackToEvents();
      const premiumPlusVerified = await eventCreationPage.verifyPremiumPlusSubscription();
      expect(premiumPlusVerified).toBeTruthy();

      console.log('✅ Custom subscription flow test completed successfully!');

    } catch (error) {
      console.error('❌ Custom test failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'custom-error-final-state.png') });
      throw error;
    }
  });
});