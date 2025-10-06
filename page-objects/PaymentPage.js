import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * @fileoverview Page object for handling payment functionality in new window/tab
 */
export class PaymentPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Stripe checkout page locators based on actual HTML structure
    this.cardNumberInput = this.page.locator('input[id="cardNumber"]').first();
    this.expirationInput = this.page.locator('input[id="cardExpiry"]').first();
    this.cvcInput = this.page.locator('input[id="cardCvc"]').first();
    this.cardholderNameInput = this.page.locator('input[id="billingName"]').first();
    this.countrySelect = this.page.locator('select[id="billingCountry"]').first();
    this.submitButton = this.page.locator('[data-testid="hosted-payment-submit-button"]').first();
    
    // Success indicators
    this.successUrl = 'https://dev.livesharenow.com/events/account/success';
  }

  /**
   * Fill payment form with test card details
   * @param {Object} paymentDetails - Payment information
   * @param {string} paymentDetails.cardNumber - Card number
   * @param {string} paymentDetails.expiration - Expiration date
   * @param {string} paymentDetails.cvc - CVC code
   * @param {string} paymentDetails.cardholderName - Cardholder name
   * @param {string} paymentDetails.country - Country code (optional, defaults to US)
   */
  async fillPaymentForm(paymentDetails) {
    try {
      console.log('Filling Stripe payment form in new window...');
      
      // Wait for form to be ready
      await this.page.waitForSelector('input[id="cardNumber"]', { state: 'visible', timeout: 15000 });
      await this.page.waitForTimeout(2000);
      
      // Fill card number
      await this.cardNumberInput.click();
      await this.cardNumberInput.fill(paymentDetails.cardNumber);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('stripe-card-number-filled');
      
      // Fill expiration date
      await this.expirationInput.click();
      await this.expirationInput.fill(paymentDetails.expiration);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('stripe-expiration-filled');
      
      // Fill CVC
      await this.cvcInput.click();
      await this.cvcInput.fill(paymentDetails.cvc);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('stripe-cvc-filled');
      
      // Fill cardholder name
      await this.cardholderNameInput.click();
      await this.cardholderNameInput.fill(paymentDetails.cardholderName);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('stripe-cardholder-name-filled');
      
      return true;
    } catch (error) {
      console.error('Error filling Stripe payment form:', error.message);
      await this.takeScreenshot('error-fill-stripe-payment-form');
      return false;
    }
  }

  /**
   * Submit payment form
   */
  async submitPayment() {
    try {
      console.log('Submitting Stripe payment...');
      
      // Wait for submit button to be enabled
      await this.submitButton.waitFor({ state: 'visible', timeout: 10000 });
      
      // Check if button is enabled (not disabled)
      const isDisabled = await this.submitButton.isDisabled();
      if (isDisabled) {
        console.log('Submit button is disabled, waiting for form validation...');
        await this.page.waitForTimeout(2000);
      }
      
      await this.submitButton.click();
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('stripe-payment-submitted');
      
      return true;
    } catch (error) {
      console.error('Error submitting Stripe payment:', error.message);
      await this.takeScreenshot('error-submit-stripe-payment');
      return false;
    }
  }

  /**
   * Complete full payment flow on Stripe checkout page (in new window)
   * @param {Object} paymentDetails - Payment information
   */
  async completePaymentFlow(paymentDetails) {
    try {
      console.log('Starting complete Stripe payment flow in new window...');
      
      // Verify we're on Stripe checkout page
      const currentUrl = this.page.url();
      if (!currentUrl.includes('checkout.stripe.com')) {
        throw new Error(`Not on Stripe checkout page. Current URL: ${currentUrl}`);
      }
      
      // Fill payment form
      const formFilled = await this.fillPaymentForm(paymentDetails);
      if (!formFilled) {
        throw new Error('Failed to fill payment form');
      }
      
      // Submit payment
      const paymentSubmitted = await this.submitPayment();
      if (!paymentSubmitted) {
        throw new Error('Failed to submit payment');
      }
      
      console.log('Stripe payment flow completed successfully in new window');
      return true;
    } catch (error) {
      console.error('Error in complete Stripe payment flow:', error.message);
      await this.takeScreenshot('error-complete-stripe-payment-flow');
      return false;
    }
  }

  /**
   * Get default test payment details for Stripe
   * @returns {Object} Default payment details for testing
   */
  getDefaultPaymentDetails() {
    return {
      cardNumber: '4242 4242 4242 4242',
      expiration: '12 / 25',
      cvc: '123',
      cardholderName: 'Test User',
      country: 'US'
    };
  }

  /**
   * Wait for Stripe checkout page to be ready
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForStripeCheckoutReady(timeout = 15000) {
    try {
      console.log('Waiting for Stripe checkout page to be ready...');
      
      // Wait for Stripe checkout page to load
      await this.page.waitForSelector('input[id="cardNumber"]', { 
        state: 'visible', 
        timeout 
      });
      
      // Wait for form to be fully loaded
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('stripe-checkout-ready');
      
      return true;
    } catch (error) {
      console.error('Error waiting for Stripe checkout page:', error.message);
      await this.takeScreenshot('error-stripe-checkout-wait');
      return false;
    }
  }

  /**
   * Verify Stripe payment form is visible and ready
   */
  async verifyStripePaymentFormReady() {
    try {
      console.log('Verifying Stripe payment form is ready...');
      
      const cardNumberVisible = await this.cardNumberInput.isVisible({ timeout: 5000 }).catch(() => false);
      const expirationVisible = await this.expirationInput.isVisible({ timeout: 5000 }).catch(() => false);
      const cvcVisible = await this.cvcInput.isVisible({ timeout: 5000 }).catch(() => false);
      const cardholderVisible = await this.cardholderNameInput.isVisible({ timeout: 5000 }).catch(() => false);
      const submitVisible = await this.submitButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      const allVisible = cardNumberVisible && expirationVisible && cvcVisible && cardholderVisible && submitVisible;
      
      if (allVisible) {
        console.log('Stripe payment form is ready');
        await this.takeScreenshot('stripe-payment-form-verified');
        return true;
      } else {
        console.error('Stripe payment form not ready - some elements not visible');
        await this.takeScreenshot('stripe-payment-form-not-ready');
        return false;
      }
    } catch (error) {
      console.error('Error verifying Stripe payment form:', error.message);
      await this.takeScreenshot('error-verify-stripe-payment-form');
      return false;
    }
  }

  /**
   * Verify we're on Stripe checkout page
   */
  async verifyOnStripeCheckoutPage() {
    try {
      const currentUrl = this.page.url();
      const isStripeCheckout = currentUrl.includes('checkout.stripe.com');
      
      if (isStripeCheckout) {
        console.log('✅ Confirmed on Stripe checkout page');
        await this.takeScreenshot('confirmed-stripe-checkout');
        return true;
      } else {
        console.error(`❌ Not on Stripe checkout page. Current URL: ${currentUrl}`);
        await this.takeScreenshot('not-on-stripe-checkout');
        return false;
      }
    } catch (error) {
      console.error('Error verifying Stripe checkout page:', error.message);
      await this.takeScreenshot('error-verify-stripe-checkout');
      return false;
    }
  }
}






