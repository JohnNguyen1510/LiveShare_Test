import { test, expect } from '@playwright/test';
import { SubscriptionPage } from '../page-objects/SubscriptionPage.js';
import { PaymentPage } from '../page-objects/PaymentPage.js';
import { EventCreationPage } from '../page-objects/EventCreationPage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Setup function for creating fresh account and event for each test
 * Now uses SubscriptionPage method instead of inline logic
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {import('@playwright/test').BrowserContext} context - Browser context
 * @param {string} testName - Name of the test for unique identification
 * @returns {Promise<{success: boolean, testData: Object}>} Setup result with test data
 */
async function setupFreshAccountAndEvent(page, context, testName) {
  const subscriptionPage = new SubscriptionPage(page);
  return await subscriptionPage.setupFreshAccountAndEvent(testName, context);
}

// Shared test state để lưu trữ browser context và page từ SE-001
let sharedTestState = {
  page: null,
  context: null,
  testData: null,
  isSetupCompleted: false
};

test.describe('App-SubscriptionEvent', () => {
  test.setTimeout(400000); // Increased timeout for full flow

  let subscriptionPage;
  let paymentPage;
  let testData;

  // Combined test để duy trì browser context giữa các test cases
  test('Combined Subscription Tests: SE-001 to SE-005', async ({ page, context }) => {
    
    // =====================================================
    // SE-001: Standard Plan subscription test (Base Setup)
    // =====================================================
    console.log('🚀 Starting SE-001: Standard Plan subscription test (Base Setup)');

    try {
      // Step 1: Setup fresh account and event
      const setupResult = await setupFreshAccountAndEvent(page, context, 'Standard Event');
      if (!setupResult.success) {
        test.skip('Failed to setup fresh account and event');
        return;
      }
      testData = setupResult.testData;
      console.log(`✅ Setup completed with email: ${testData.email}`);

      // Initialize page objects
      subscriptionPage = new SubscriptionPage(page);
      paymentPage = new PaymentPage(page);

      // Step 2: Navigate to subscription
      console.log('📍 SE-001 Step 2: Navigating to subscription...');
      const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se001-01-subscription-page.png') });

      // Step 3: Select Standard plan and handle navigation
      console.log('📍 SE-001 Step 3: Selecting Standard plan...');
      const selectResult = await subscriptionPage.choosePlanAndClickSelect('Standard Event');
      expect(selectResult.success).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se001-02-plan-selected.png') });

      // Step 4: Handle payment based on navigation type
      console.log(`📍 SE-001 Step 4: Handling payment flow (${selectResult.navigationType})...`);
      
      let paymentSuccess = false;

      if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
        // New page/window opened
        console.log('✅ Processing payment in new window...');
        const newPage = selectResult.newPage;
        await newPage.waitForLoadState('domcontentloaded');
        await newPage.waitForTimeout(2000);
        await newPage.screenshot({ path: path.join(screenshotsDir, 'se001-03-stripe-checkout-window.png') });

        const stripePayment = new PaymentPage(newPage);
        expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
        expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
        
        const paymentDetails = stripePayment.getDefaultPaymentDetails();
        paymentSuccess = await stripePayment.completePaymentFlow(paymentDetails);
        expect(paymentSuccess).toBeTruthy();
        await newPage.screenshot({ path: path.join(screenshotsDir, 'se001-04-payment-completed.png') });
        
        await newPage.close();
        console.log('✅ Payment completed in new window and closed');
        
      } else if (selectResult.navigationType === 'redirect') {
        // Page redirected to payment
        console.log('✅ Processing payment after redirect...');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotsDir, 'se001-03-payment-redirect.png') });

        const stripePayment = new PaymentPage(page);
        expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
        expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
        
        const paymentDetails = stripePayment.getDefaultPaymentDetails();
        paymentSuccess = await stripePayment.completePaymentFlow(paymentDetails);
        expect(paymentSuccess).toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'se001-04-payment-completed.png') });
        
        console.log('✅ Payment completed after redirect');
        
      } else {
        // Same page payment (modal/dialog)
        console.log('✅ Processing payment on same page...');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(screenshotsDir, 'se001-03-same-page-payment.png') });

        const stripePayment = new PaymentPage(page);
        
        // Wait for payment form to appear
        await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
        
        const paymentDetails = stripePayment.getDefaultPaymentDetails();
        paymentSuccess = await stripePayment.completePaymentFlow(paymentDetails);
        expect(paymentSuccess).toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'se001-04-payment-completed.png') });
        
        console.log('✅ Payment completed on same page');
      }

      // Step 5: Verify subscription success and navigate back to events
      console.log('📍 SE-001 Step 5: Verifying Standard subscription success...');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: path.join(screenshotsDir, 'se001-05-subscription-confirmed.png') });

      const eventCreationPage = new EventCreationPage(page);
      const navigateBackSuccess = await eventCreationPage.navigateBackToEvents();
      expect(navigateBackSuccess).toBeTruthy();
      await page.waitForTimeout(4000);
      
      // Verify PERSONALIZED label for Standard plan
      const standardVerified = await eventCreationPage.verifySubscriptionLabel('PERSONALIZED'); // Sẽ verify PERSONALIZED label
      expect(standardVerified).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se001-06-standard-features-verified.png') });

      console.log('✅ SE-001 Standard Plan subscription test completed successfully');

    } catch (error) {
      console.error('❌ SE-001 Standard Plan test failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'se001-error-final.png') });
      throw error;
    }

    // =====================================================
    // SE-002: Premium Plan test sử dụng cùng browser context
    // =====================================================
    console.log('\n🚀 Starting SE-002: Premium Plan subscription test');

    try {
      console.log('🔗 Tiếp tục từ cùng browser và page');
      console.log(`📧 Sử dụng account: ${testData.email}`);

      // Step 1: Tạo event mới và navigate to subscription
      console.log('📍 SE-002 Step 1: Tạo event mới và navigate to subscription...');
      await page.goto('https://dev.livesharenow.com/events');
      const eventCreationPage = new EventCreationPage(page);
      const eventCreated = await eventCreationPage.startEventCreation();
      expect(eventCreated).toBeTruthy();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(screenshotsDir, 'se002-01-new-event-created.png') });

      const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess).toBeTruthy();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(screenshotsDir, 'se002-02-subscription-page.png') });

      // Step 2: Select Premium plan
      console.log('📍 SE-002 Step 2: Selecting Premium Plan...');
      const selectResult = await subscriptionPage.choosePlanAndClickSelect('Premium Event');
      await page.waitForTimeout(4000);
      expect(selectResult.success).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se002-03-premium-plan-selected.png') });

      // Step 3: Handle payment
      console.log(`📍 SE-002 Step 3: Handling payment flow (${selectResult.navigationType})...`);
      
      let paymentSuccess = false;
      if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
        const stripePage = selectResult.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        await stripePage.screenshot({ path: path.join(screenshotsDir, 'se002-04-stripe-checkout.png') });

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

      // Step 4: Verify Premium subscription
      console.log('📍 SE-002 Step 4: Verifying Premium Plan features...');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotsDir, 'se002-05-payment-completed.png') });
      
      const navigateBackSuccess = await eventCreationPage.navigateBackToEvents();
      expect(navigateBackSuccess).toBeTruthy();
      await page.waitForTimeout(4000);
      
      // Verify PREMIUM label
      const premiumVerified = await eventCreationPage.verifySubscriptionLabel('PREMIUM'); // Sẽ verify PREMIUM label
      expect(premiumVerified).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se002-06-premium-features-verified.png') });

      console.log('✅ SE-002 Premium Plan subscription test completed successfully');
      
    } catch (error) {
      console.error('❌ SE-002 Premium Plan test failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'se002-error-final.png') });
      throw error;
    }

    // =====================================================
    // SE-003: Premium+ Plan test 
    // =====================================================
    console.log('\n🚀 Starting SE-003: Premium+ Plan subscription test');

    try {
      console.log('🔗 Tiếp tục từ cùng browser và page');
      console.log(`📧 Sử dụng account: ${testData.email}`);

      // Step 1: Tạo event mới và navigate to subscription
      console.log('📍 SE-003 Step 1: Tạo event mới và navigate to subscription...');
      await page.goto('https://dev.livesharenow.com/events');
      const eventCreationPage = new EventCreationPage(page);
      const eventCreated = await eventCreationPage.startEventCreation();
      expect(eventCreated).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se003-01-new-event-created.png') });

      const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se003-02-subscription-page.png') });

      // Step 2: Select Premium+ plan
      console.log('📍 SE-003 Step 2: Selecting Premium+ Plan...');
      const selectResult = await subscriptionPage.choosePlanAndClickSelect('Premium+ Event');
      expect(selectResult.success).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se003-03-premiumplus-plan-selected.png') });

      // Step 3: Handle payment
      console.log(`📍 SE-003 Step 3: Handling payment flow (${selectResult.navigationType})...`);
      
      let paymentSuccess = false;
      if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
        const stripePage = selectResult.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        await stripePage.screenshot({ path: path.join(screenshotsDir, 'se003-04-stripe-checkout.png') });

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

      // Step 4: Verify Premium+ subscription
      console.log('📍 SE-003 Step 4: Verifying Premium+ Plan features...');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotsDir, 'se003-05-payment-completed.png') });

      const navigateBackSuccess = await eventCreationPage.navigateBackToEvents();
      expect(navigateBackSuccess).toBeTruthy();
      await page.waitForTimeout(4000);
      
      // Verify PREMIUMPLUS label
      const premiumPlusVerified = await eventCreationPage.verifySubscriptionLabel('PREMIUMPLUS'); // Sẽ verify PREMIUMPLUS label
      expect(premiumPlusVerified).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se003-06-premiumplus-features-verified.png') });

      console.log('✅ SE-003 Premium+ Plan subscription test completed successfully');
      
    } catch (error) {
      console.error('❌ SE-003 Premium+ Plan test failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'se003-error-final.png') });
      throw error;
    }

    // =====================================================
    // SE-004: Premium+ Subscription (annual) test
    // =====================================================
    console.log('\n🚀 Starting SE-004: Premium+ Annual Subscription test');

    try {
      await page.goto('https://dev.livesharenow.com/events');
      const newEventCreationPage = new EventCreationPage(page);
      const eventCreated = await newEventCreationPage.startEventCreation();
      expect(eventCreated).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se004-01-new-event-created.png') });
      console.log('📍 SE-004 Step 1: Navigate to subscription...');
      const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
      expect(subscriptionNavigationSuccess).toBeTruthy();

      // Step 2: Select Premium+ subscription
      console.log('📍 SE-004 Step 2: Selecting Premium+ Subscription...');
      const selectResult = await subscriptionPage.choosePlanAndClickSelect('Premium+ subscription');
      expect(selectResult.success).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se004-02-premiumplus-subscription-selected.png') });

      // Step 3: Handle payment
      console.log(`📍 SE-004 Step 3: Handling payment flow (${selectResult.navigationType})...`);
      
      let paymentSuccess = false;
      if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
        const stripePage = selectResult.newPage;
        await stripePage.waitForLoadState('domcontentloaded');
        await stripePage.screenshot({ path: path.join(screenshotsDir, 'se004-03-stripe-checkout.png') });

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

      // Step 4: Verify Premium+ subscription (tất cả events sẽ có PREMIUMPLUS label)
      console.log('📍 SE-004 Step 4: Verifying Premium+ Subscription features...');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(screenshotsDir, 'se004-04-payment-completed.png') });

      const eventCreationPage = new EventCreationPage(page);
      const navigateBackSuccess = await eventCreationPage.navigateBackToEvents();
      expect(navigateBackSuccess).toBeTruthy();
      await page.waitForTimeout(4000);
      
      // Verify tất cả events có PREMIUMPLUS label
      console.log('Verifying all events have PremiumPlus subscription label...');
      const premiumPlusSubscriptionVerified = await eventCreationPage.verifyAllEventsPremiumPlusLabel();
      expect(premiumPlusSubscriptionVerified).toBeTruthy();
      await page.screenshot({ path: path.join(screenshotsDir, 'se004-05-subscription-features-verified.png') });

      console.log('✅ SE-004 Premium+ Annual Subscription test completed successfully');
      
    } catch (error) {
      console.error('❌ SE-004 Premium+ Annual Subscription test failed:', error.message);
      await page.screenshot({ path: path.join(screenshotsDir, 'se004-error-final.png') });
      throw error;
    }



  });
});