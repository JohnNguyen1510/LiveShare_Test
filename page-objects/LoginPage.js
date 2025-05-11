// @ts-check
import { BasePage } from './BasePage.js';
import * as fs from 'fs';
import * as path from 'path';

// Create screenshots directory using process.cwd()
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * @fileoverview Page object for handling login functionality
 */
export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      signInButton: 'button:has-text("Sign In"), button:has-text("Login"), .login-button',
      googleButton: '[aria-label*="Google"], [class*="google"], button:has-text("Google")',
      emailInput: 'input[type="email"]',
      passwordInput: 'input[type="password"]',
      nextButton: 'button:has-text("Next")',
      submitButton: 'button[type="submit"]',
      manageUrl: '**/manage',
      // New selectors for the account selection screen
      accountSelectionHeader: 'h1:has-text("Chọn tài khoản"), h1:has-text("Choose an account")',
      accountItems: 'li[class*="aZvCDf"] div[role="link"]',
      accountEmail: 'div[class*="yAlK0b"]',
      useAnotherAccount: 'div:has-text("Sử dụng một tài khoản khác"), div:has-text("Use another account")'
    };
  }

  /**
   * Navigate to the login page
   * @returns {Promise<void>}
   */
  async navigate() {
    await this.goto();
    await this.waitForPageLoad();
    await this.takeScreenshot('login-page');
  }

  /**
   * Click the Sign In button
   * @returns {Promise<void>}
   */
  async clickSignIn() {
    const signInButton = this.page.locator(this.selectors.signInButton);
    await signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.takeScreenshot('before-signin');
    await signInButton.click();
    await this.page.waitForTimeout(3000);
    await this.takeScreenshot('auth-modal');
  }

  /**
   * Complete Google OAuth flow
   * @param {import('@playwright/test').BrowserContext} context Browser context
   * @param {string} [targetEmail] Optional email to select from account list
   * @returns {Promise<boolean>} Success status
   */
  async completeGoogleAuth(context, targetEmail = '') {
    try {
      // Wait for and click sign in button if present
      const signInButton = this.page.locator(this.selectors.signInButton);
      if (await signInButton.isVisible({ timeout: 5000 })) {
        await signInButton.click();
        await this.page.waitForTimeout(2000);
      }

      // Look for Google button and wait for it to be ready
      const googleButton = this.page.locator(this.selectors.googleButton).first();
      await googleButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.takeScreenshot('before-google-click');

      // Create a promise for the new page before clicking
      const pagePromise = context.waitForEvent('page', { timeout: 60000 });
      
      // Click the Google button
      await googleButton.click();
      console.log('Clicked Google button, waiting for popup...');

      // Wait for the new page/popup
      const popup = await pagePromise;
      console.log('Popup appeared, waiting for load...');
      
      // Wait for the popup to be ready
      await popup.waitForLoadState('domcontentloaded');
      await popup.waitForTimeout(2000);
      
      // Take screenshot of popup state
      await popup.screenshot({ path: './screenshots/google-popup.png' });
      
      // Check if we're on the account selection screen
      const isAccountSelectionVisible = await popup.locator(this.selectors.accountSelectionHeader).isVisible({ timeout: 5000 })
        .catch(() => false);
      
      if (isAccountSelectionVisible) {
        console.log('Account selection screen detected');
        await popup.screenshot({ path: './screenshots/account-selection.png' });
        
        // Get all available accounts
        const accounts = popup.locator(this.selectors.accountItems);
        const accountCount = await accounts.count();
        
        let accountFound = false;
        
        // If we have a target email, find and click that account
        if (targetEmail && targetEmail.length > 0) {
          for (let i = 0; i < accountCount; i++) {
            const accountItem = accounts.nth(i);
            const emailElement = accountItem.locator(this.selectors.accountEmail);
            
            if (await emailElement.isVisible()) {
              const email = await emailElement.textContent();
              if (email && email.includes(targetEmail)) {
                console.log(`Found target account: ${email}`);
                await accountItem.click();
                accountFound = true;
                break;
              }
            }
          }
        }
        
        // If no target email or target not found, just click the first account
        if (!accountFound && accountCount > 0) {
          console.log('Selecting first available account');
          await accounts.first().click();
          accountFound = true;
        }
        
        // If account selection was successful
        if (accountFound) {
          // Wait for redirect or confirmation
          
          // Check if we need to do additional confirmation
          const isPasswordInputVisible = await popup.locator(this.selectors.passwordInput).isVisible({ timeout: 3000 })
            .catch(() => false);
            
          if (isPasswordInputVisible) {
            console.log('Password input detected after account selection');
            await popup.fill(this.selectors.passwordInput, process.env.GOOGLE_PASSWORD || '');
            const submitButton = popup.locator(this.selectors.nextButton).first();
            await submitButton.click();
          }
          
          // Wait for popup to close or redirect
          await popup.waitForEvent('close', { timeout: 30000 }).catch(() => {
            console.log('Popup did not close as expected, continuing...');
          });
          
          // Wait for main page to stabilize
          await this.page.waitForLoadState('networkidle', { timeout: 30000 });
          
          // Wait for page content to be visible using specific selector patterns
          try {
            await this.waitForSelector('.flex.pt-8, div.event-card, div.mat-card, [data-testid="dashboard"]');
            console.log('Dashboard/content successfully loaded after authentication');
          } catch (e) {
            console.log('Could not detect specific content selectors, but continuing flow');
          }
          
          await this.takeScreenshot('after-account-selection-auth');
          console.log('Authentication completed via account selection');
          
          return true;
        }
      } else {
        // Standard email/password flow if account selection not detected
        console.log('Standard login flow, looking for email input...');

      // Wait for and fill email
      await popup.waitForSelector(this.selectors.emailInput, { state: 'visible', timeout: 10000 });
      await popup.fill(this.selectors.emailInput, process.env.GOOGLE_EMAIL || '');
      await popup.screenshot({ path: './screenshots/email-filled.png' });
      console.log('Email filled, clicking next...');

      // Click next after email
      const nextButton = popup.locator(this.selectors.nextButton).first();
      await nextButton.waitFor({ state: 'visible' });
      await nextButton.click();
      await popup.waitForTimeout(2000);

      // Wait for and fill password
      await popup.waitForSelector(this.selectors.passwordInput, { state: 'visible', timeout: 10000 });
      await popup.fill(this.selectors.passwordInput, process.env.GOOGLE_PASSWORD || '');
      await popup.screenshot({ path: './screenshots/password-filled.png' });
      console.log('Password filled, clicking next...');

      // Click next after password
      const submitButton = popup.locator(this.selectors.nextButton).first();
      await submitButton.waitFor({ state: 'visible' });
      await submitButton.click();

      // Wait for popup to close or redirect
      await popup.waitForEvent('close', { timeout: 30000 }).catch(() => {
        console.log('Popup did not close as expected, continuing...');
      });

      // Wait for main page to stabilize
      await this.page.waitForLoadState('networkidle', { timeout: 30000 });
      await this.takeScreenshot('after-google-auth');
        console.log('Authentication completed via standard flow');

      return true;
      }
      
      return false;
    } catch (error) {
      console.error('Google sign-in error:', error);
      await this.takeScreenshot('google-auth-error');
      
      // Try to take screenshot of popup if it exists
      try {
        const pages = context.pages();
        const popup = pages[pages.length - 1];
        if (popup !== this.page) {
          await popup.screenshot({ path: './screenshots/popup-error-state.png' });
        }
      } catch (e) {
        console.error('Could not capture popup state:', e);
      }
      
      return false;
    }
  }
} 