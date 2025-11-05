import { test, expect } from '@playwright/test';
import { SubscriptionPage } from '../page-objects/SubscriptionPage.js';
import { PaymentPage } from '../page-objects/PaymentPage.js';
import { EventCreationPage } from '../page-objects/EventCreationPage.js';
import { BasePage } from '../page-objects/BasePage.js';

/**
 * Setup function for creating fresh account and event for each test
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {import('@playwright/test').BrowserContext} context - Browser context
 * @param {string} testName - Name of the test for unique identification
 * @returns {Promise<{success: boolean, testData: Object}>} Setup result with test data
 */
async function setupFreshAccountAndEvent(page, context, testName) {
  const subscriptionPage = new SubscriptionPage(page);
  return await subscriptionPage.setupFreshAccountAndEvent(testName, context);
}

test.describe('App-SubscriptionEvent', () => {
  test.setTimeout(400000);

  let subscriptionPage;
  let paymentPage;
  let eventCreationPage;
  let basePage;
  let testData;

  test('Combined Subscription Tests: SE-001 to SE-004', async ({ page, context }) => {
    basePage = new BasePage(page);
    subscriptionPage = new SubscriptionPage(page);
    paymentPage = new PaymentPage(page);
    eventCreationPage = new EventCreationPage(page);

    // =====================================================
    // SE-001: Standard Plan subscription test (Base Setup)
    // =====================================================
    basePage.logStep('SE-001: Standard Plan subscription test', 'info');

    const setupResult = await setupFreshAccountAndEvent(page, context, 'Standard Event');
    if (!setupResult.success) {
      test.skip('Failed to setup fresh account and event');
      return;
    }
    testData = setupResult.testData;
    basePage.logStep(`Setup completed with email: ${testData.email}`, 'success');

    const subscriptionNavigationSuccess = await subscriptionPage.navigateToSubscription();
    expect(subscriptionNavigationSuccess).toBeTruthy();

    const selectResult = await subscriptionPage.choosePlanAndClickSelect('Standard Event');
    expect(selectResult.success).toBeTruthy();

    let paymentSuccess = false;
    if (selectResult.navigationType === 'newPage' && selectResult.newPage) {
      const newPage = selectResult.newPage;
      await newPage.waitForLoadState('domcontentloaded');
      await newPage.waitForTimeout(2000);

      const stripePayment = new PaymentPage(newPage);
      expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
      expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
      
      const paymentDetails = stripePayment.getDefaultPaymentDetails();
      paymentSuccess = await stripePayment.completePaymentFlow(paymentDetails);
      expect(paymentSuccess).toBeTruthy();
      
      await newPage.close();
    } else if (selectResult.navigationType === 'redirect') {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      const stripePayment = new PaymentPage(page);
      expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
      expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
      
      const paymentDetails = stripePayment.getDefaultPaymentDetails();
      paymentSuccess = await stripePayment.completePaymentFlow(paymentDetails);
      expect(paymentSuccess).toBeTruthy();
    } else {
      await page.waitForTimeout(3000);
      await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });

      const stripePayment = new PaymentPage(page);
      const paymentDetails = stripePayment.getDefaultPaymentDetails();
      paymentSuccess = await stripePayment.completePaymentFlow(paymentDetails);
      expect(paymentSuccess).toBeTruthy();
    }

    await page.waitForTimeout(5000);
    const navigateBackSuccess = await eventCreationPage.navigateBackToEvents();
    expect(navigateBackSuccess).toBeTruthy();
    await page.waitForTimeout(4000);
    
    const standardVerified = await eventCreationPage.verifySubscriptionLabel('PERSONALIZED');
    expect(standardVerified).toBeTruthy();
    basePage.logStep('SE-001 Standard Plan subscription completed', 'success');

    // =====================================================
    // SE-002: Premium Plan test
    // =====================================================
    basePage.logStep('SE-002: Premium Plan subscription test', 'info');

    await page.goto('https://dev.livesharenow.com/events');
    const eventCreated = await eventCreationPage.startEventCreation();
    expect(eventCreated).toBeTruthy();
    await page.waitForTimeout(4000);

    const subscriptionNavigationSuccess2 = await subscriptionPage.navigateToSubscription();
    expect(subscriptionNavigationSuccess2).toBeTruthy();
    await page.waitForTimeout(4000);

    const selectResult2 = await subscriptionPage.choosePlanAndClickSelect('Premium Event');
    await page.waitForTimeout(4000);
    expect(selectResult2.success).toBeTruthy();

    let paymentSuccess2 = false;
    if (selectResult2.navigationType === 'newPage' && selectResult2.newPage) {
      const stripePage = selectResult2.newPage;
      await stripePage.waitForLoadState('domcontentloaded');

      const stripePayment = new PaymentPage(stripePage);
      expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
      expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
      paymentSuccess2 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      expect(paymentSuccess2).toBeTruthy();
      await stripePage.close();
    } else {
      await page.waitForTimeout(2000);
      const stripePayment = new PaymentPage(page);
      await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
      paymentSuccess2 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      expect(paymentSuccess2).toBeTruthy();
    }

    await page.waitForTimeout(3000);
    const navigateBackSuccess2 = await eventCreationPage.navigateBackToEvents();
    expect(navigateBackSuccess2).toBeTruthy();
    await page.waitForTimeout(4000);
    
    const premiumVerified = await eventCreationPage.verifySubscriptionLabel('PREMIUM');
    expect(premiumVerified).toBeTruthy();
    basePage.logStep('SE-002 Premium Plan subscription completed', 'success');

    // =====================================================
    // SE-003: Premium+ Plan test
    // =====================================================
    basePage.logStep('SE-003: Premium+ Plan subscription test', 'info');

    await page.goto('https://dev.livesharenow.com/events');
    const eventCreated3 = await eventCreationPage.startEventCreation();
    expect(eventCreated3).toBeTruthy();

    const subscriptionNavigationSuccess3 = await subscriptionPage.navigateToSubscription();
    expect(subscriptionNavigationSuccess3).toBeTruthy();

    const selectResult3 = await subscriptionPage.choosePlanAndClickSelect('Premium+ Event');
    expect(selectResult3.success).toBeTruthy();

    let paymentSuccess3 = false;
    if (selectResult3.navigationType === 'newPage' && selectResult3.newPage) {
      const stripePage = selectResult3.newPage;
      await stripePage.waitForLoadState('domcontentloaded');

      const stripePayment = new PaymentPage(stripePage);
      expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
      expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
      paymentSuccess3 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      expect(paymentSuccess3).toBeTruthy();
      await stripePage.close();
    } else {
      await page.waitForTimeout(2000);
      const stripePayment = new PaymentPage(page);
      await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
      paymentSuccess3 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      expect(paymentSuccess3).toBeTruthy();
    }

    await page.waitForTimeout(3000);
    const navigateBackSuccess3 = await eventCreationPage.navigateBackToEvents();
    expect(navigateBackSuccess3).toBeTruthy();
    await page.waitForTimeout(4000);
    
    const premiumPlusVerified = await eventCreationPage.verifySubscriptionLabel('PREMIUMPLUS');
    expect(premiumPlusVerified).toBeTruthy();
    basePage.logStep('SE-003 Premium+ Plan subscription completed', 'success');

    // =====================================================
    // SE-004: Premium+ Subscription (annual) test
    // =====================================================
    basePage.logStep('SE-004: Premium+ Annual Subscription test', 'info');

    await page.goto('https://dev.livesharenow.com/events');
    const eventCreated4 = await eventCreationPage.startEventCreation();
    expect(eventCreated4).toBeTruthy();

    const subscriptionNavigationSuccess4 = await subscriptionPage.navigateToSubscription();
    expect(subscriptionNavigationSuccess4).toBeTruthy();

    const selectResult4 = await subscriptionPage.choosePlanAndClickSelect('Premium+ subscription');
    expect(selectResult4.success).toBeTruthy();

    let paymentSuccess4 = false;
    if (selectResult4.navigationType === 'newPage' && selectResult4.newPage) {
      const stripePage = selectResult4.newPage;
      await stripePage.waitForLoadState('domcontentloaded');

      const stripePayment = new PaymentPage(stripePage);
      expect(await stripePayment.verifyOnStripeCheckoutPage()).toBeTruthy();
      expect(await stripePayment.waitForStripeCheckoutReady()).toBeTruthy();
      paymentSuccess4 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      expect(paymentSuccess4).toBeTruthy();
      await stripePage.close();
    } else {
      await page.waitForTimeout(2000);
      const stripePayment = new PaymentPage(page);
      await page.waitForSelector('input[id="cardNumber"], input[placeholder*="card"], .payment-form', { timeout: 10000 });
      paymentSuccess4 = await stripePayment.completePaymentFlow(stripePayment.getDefaultPaymentDetails());
      expect(paymentSuccess4).toBeTruthy();
    }

    await page.waitForTimeout(3000);
    const navigateBackSuccess4 = await eventCreationPage.navigateBackToEvents();
    expect(navigateBackSuccess4).toBeTruthy();
    await page.waitForTimeout(4000);
    
    const premiumPlusSubscriptionVerified = await eventCreationPage.verifyAllEventsPremiumPlusLabel();
    expect(premiumPlusSubscriptionVerified).toBeTruthy();
    basePage.logStep('SE-004 Premium+ Annual Subscription completed', 'success');
  });
});
