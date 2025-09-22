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

test.describe('TC-APP-SUB-001: Complete Subscription Flow Test', () => {
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

  test('Complete subscription flow: Register -> Subscribe -> Create Event -> Verify Premium Plus', async ({ page, context }) => {
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
      await page.screenshot({ path: path.join(screenshotsDir, '01-app-loaded.png') });

      // Step 2: Start registration process
      console.log('📍 Step 2: Starting registration process...');
      const createAccountLink = page.locator('text=New to LiveShare? Create Free').first();
      await expect(createAccountLink).toBeVisible();
      await createAccountLink.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, '02-create-account-clicked.png') });

      // Step 3: Choose email signup
      console.log('📍 Step 3: Choosing email signup...');
      const emailSignupButton = page.locator('button:has-text("Sign up with Email")').first();
      await expect(emailSignupButton).toBeVisible();
      await emailSignupButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, '03-email-signup-selected.png') });

      // Step 4: Handle terms and conditions
      console.log('📍 Step 4: Handling terms and conditions...');
      const continueButton = page.locator('button:has-text("Continue")').first();
      await expect(continueButton).toBeVisible();
      await continueButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, '04-terms-accepted.png') });

      // Step 5: Fill registration form
      console.log('📍 Step 5: Filling registration form...');
      const testName = 'Test User';
      const testPassword = 't123';

      // Fill name
      const nameInput = page.locator('input[placeholder="Enter Name"]').first();
      await expect(nameInput).toBeVisible();
      await nameInput.click();
      await nameInput.fill(testName);
      await page.waitForTimeout(500);

      // Fill email
      const emailInput = page.locator('input[placeholder="Enter Email"]').first();
      await expect(emailInput).toBeVisible();
      await emailInput.click();
      await emailInput.fill(testEmail);
      await page.waitForTimeout(500);

      // Fill password
      const passwordInput = page.locator('input[placeholder="Enter Password"]').first();
      await expect(passwordInput).toBeVisible();
      await passwordInput.click();
      await passwordInput.fill(testPassword);
      await page.waitForTimeout(500);

      // Fill confirm password
      const confirmPasswordInput = page.locator('input[placeholder="Confirm Password"]').first();
      await expect(confirmPasswordInput).toBeVisible();
      await confirmPasswordInput.click();
      await confirmPasswordInput.fill(testPassword);
      await page.waitForTimeout(500);

      await page.screenshot({ path: path.join(screenshotsDir, '05-registration-form-filled.png') });

      // Step 6: Create account
      console.log('📍 Step 6: Creating account...');
      const createAccountButton = page.locator('button:has-text("Create Account")').first();
      await expect(createAccountButton).toBeVisible();
      await createAccountButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '06-account-creation-submitted.png') });

      // Step 7: Handle OTP verification
      console.log('📍 Step 7: Handling OTP verification...');
      
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
      
      await page.screenshot({ path: path.join(screenshotsDir, '07-otp-filled.png') });

      // Click Continue to complete registration
      const continueToEventButton = page.locator('button:has-text("Continue to the Event")').first();
      await expect(continueToEventButton).toBeVisible();
      await continueToEventButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotsDir, '08-registration-completed.png') });

      // Step 8: Navigate to subscription
      console.log('📍 Step 8: Navigating to subscription...');
      const profileImage = page.locator('img').first();
      await expect(profileImage).toBeVisible();
      await profileImage.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '09-profile-menu-opened.png') });

      const subscriptionMenuItem = page.locator('div[role="menuitem"]:has-text("Subscription")').first();
      await expect(subscriptionMenuItem).toBeVisible();
      await subscriptionMenuItem.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '10-subscription-page.png') });

      // Step 9: Start subscription process
      console.log('📍 Step 9: Starting subscription process...');
      const selectButton = page.locator('text=Select').first();
      await expect(selectButton).toBeVisible();
      await selectButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '11-select-subscription-clicked.png') });

      // Step 10: Handle payment popup
      console.log('📍 Step 10: Handling payment popup...');
      const page1Promise = page.waitForEvent('popup');
      const page1 = await page1Promise;
      
      // Wait for payment popup to load
      await page1.waitForLoadState('domcontentloaded');
      await page1.waitForTimeout(2000);
      await page1.screenshot({ path: path.join(screenshotsDir, '12-payment-popup-loaded.png') });

      // Fill payment form
      const paymentDetails = {
        cardNumber: '4242 4242 4242 4242',
        expiration: '02 / 30',
        cvc: '123',
        cardholderName: 'Test User'
      };

      // Fill card number
      const cardNumberInput = page1.locator('input[placeholder="Card number"]').first();
      await expect(cardNumberInput).toBeVisible();
      await cardNumberInput.click();
      await cardNumberInput.fill(paymentDetails.cardNumber);
      await page1.waitForTimeout(500);

      // Fill expiration
      const expirationInput = page1.locator('input[placeholder="Expiration"]').first();
      await expect(expirationInput).toBeVisible();
      await expirationInput.click();
      await expirationInput.fill(paymentDetails.expiration);
      await page1.waitForTimeout(500);

      // Fill CVC
      const cvcInput = page1.locator('input[placeholder="CVC"]').first();
      await expect(cvcInput).toBeVisible();
      await cvcInput.click();
      await cvcInput.fill(paymentDetails.cvc);
      await page1.waitForTimeout(500);

      // Fill cardholder name
      const cardholderNameInput = page1.locator('input[placeholder="Cardholder name"]').first();
      await expect(cardholderNameInput).toBeVisible();
      await cardholderNameInput.click();
      await cardholderNameInput.fill(paymentDetails.cardholderName);
      await page1.waitForTimeout(500);

      await page1.screenshot({ path: path.join(screenshotsDir, '13-payment-form-filled.png') });

      // Submit payment
      const submitButton = page1.locator('[data-testid="hosted-payment-submit-button"]').first();
      await expect(submitButton).toBeVisible();
      await submitButton.click();
      await page1.waitForTimeout(3000);
      await page1.screenshot({ path: path.join(screenshotsDir, '14-payment-submitted.png') });

      // Navigate to success page
      await page1.goto('https://dev.livesharenow.com/events/account/success');
      await page1.waitForLoadState('networkidle');
      await page1.screenshot({ path: path.join(screenshotsDir, '15-payment-success.png') });

      // Step 11: Verify subscription success
      console.log('📍 Step 11: Verifying subscription success...');
      const subscriptionSuccessMessage = page.locator('text=closeCongratulationsSubscription ActiveEvery event you create willnow be').first();
      await expect(subscriptionSuccessMessage).toBeVisible();
      
      const subscriptionSuccessContainer = page.locator('app-video-purchase').first();
      await expect(subscriptionSuccessContainer).toContainText('Congratulations');
      
      await page.screenshot({ path: path.join(screenshotsDir, '16-subscription-success-verified.png') });

      // Close success dialog
      const closeButton = page.locator('text=close').first();
      await expect(closeButton).toBeVisible();
      await closeButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '17-success-dialog-closed.png') });

      // Step 12: Create new event
      console.log('📍 Step 12: Creating new event...');
      const addEventButton = page.locator('button:has-text("add")').first();
      await expect(addEventButton).toBeVisible();
      await addEventButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '18-add-event-clicked.png') });

      // Click overlay
      const overlay = page.locator('.overlay').first();
      await expect(overlay).toBeVisible();
      await overlay.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '19-overlay-clicked.png') });

      // Select event type
      const eventDropdown = page.locator('select[role="combobox"]').first();
      await expect(eventDropdown).toBeVisible();
      await eventDropdown.selectOption('63aac88c5a3b994dcb8602fd');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '20-event-type-selected.png') });

      // Fill event name
      const eventNameInput = page.locator('input[placeholder="Event Name"]').first();
      await expect(eventNameInput).toBeVisible();
      await eventNameInput.click();
      await eventNameInput.fill('Test Event');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '21-event-name-filled.png') });

      // Set event date
      const calendarIcon = page.locator('text=calendar_today').first();
      await expect(calendarIcon).toBeVisible();
      await calendarIcon.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '22-calendar-opened.png') });

      const dateButton = page.locator('button:has-text("September 23,")').first();
      await expect(dateButton).toBeVisible();
      await dateButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '23-date-selected.png') });

      // Proceed to next step
      const nextButton = page.locator('button:has-text("Next")').first();
      await expect(nextButton).toBeVisible();
      await nextButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '24-next-clicked.png') });

      // Launch event
      const launchEventButton = page.locator('button:has-text("Launch Event")').first();
      await expect(launchEventButton).toBeVisible();
      await launchEventButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotsDir, '25-event-launched.png') });

      // Step 13: Navigate back and verify Premium Plus
      console.log('📍 Step 13: Verifying Premium Plus subscription...');
      const backButton = page.locator('button:has-text("arrow_back_ios_new")').first();
      await expect(backButton).toBeVisible();
      await backButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '26-back-to-events.png') });

      // Verify Premium Plus subscription is active
      const myEventsLabel = page.locator('label:has-text("My Events")').first();
      await expect(myEventsLabel).toBeVisible();
      await expect(myEventsLabel).toContainText('PremiumPlus');
      
      await page.screenshot({ path: path.join(screenshotsDir, '27-premium-plus-verified.png') });

      console.log('✅ Complete subscription flow test completed successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'error-final-state.png') });
      throw error;
    }
  });
});

