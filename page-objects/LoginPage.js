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

    // Locators (DMS-style: define in constructor)
    this.signInButton = this.page.locator('button:has-text("Sign In"), button:has-text("Login"), .login-button').first();
    this.googleButton = this.page.locator('[aria-label*="Google"], [class*="google"], button:has-text("Google")').first();
    this.emailInput = this.page.locator('input[type="email"]').first();
    this.passwordInput = this.page.locator('input[type="password"]').first();
    this.nextButton = this.page.locator('button:has-text("Next")').first();
    this.submitButton = this.page.locator('button[type="submit"]').first();
    
    // Email login specific selectors
    this.emailSignInButton = this.page.locator('button:has-text("Sign in with Email"), .btn-hover-email').first();
    this.emailLoginInput = this.page.locator('input[placeholder="Enter Email"], input[type="email"]').first();
    this.emailPasswordInput = this.page.locator('input[placeholder="Enter Password"], input[type="password"]').first();
    this.continueButton = this.page.locator('button:has-text("Continue")').first();
    this.backToLoginButton = this.page.locator('button:has-text("Back to Login")').first();
    // Account selection screen
    this.accountSelectionHeader = this.page.locator('h1:has-text("Chọn tài khoản"), h1:has-text("Choose an account")').first();
    this.accountItems = this.page.locator('li[class*="aZvCDf"] div[role="link"]');
    this.accountEmail = this.page.locator('div[class*="yAlK0b"]').first();
    this.useAnotherAccount = this.page.locator('div:has-text("Sử dụng một tài khoản khác"), div:has-text("Use another account")').first();
    // Dashboard indicators (union)
    this.dashboardIndicators = this.page.locator('.flex.pt-8, div.event-card, div.mat-card, [data-testid="dashboard"], .event-card-event').first();
  }

  /**
   * Robust authentication with retries - use this method in test files instead of completeGoogleAuth
   * @param {import('@playwright/test').BrowserContext} context Browser context
   * @param {string} [targetEmail] Optional email to select from account list
   * @param {number} [maxRetries=3] Maximum number of retry attempts
   * @returns {Promise<boolean>} Success status
   */
  async authenticateWithRetry(context, targetEmail = '', maxRetries = 3) {
    console.log(`🔐 Starting authentication with ${maxRetries} retry attempts`);
    
    // Check if already logged in before attempting login
    const isAlreadyLoggedIn = await this.checkIfAlreadyLoggedIn();
    if (isAlreadyLoggedIn) {
      console.log('✅ Already logged in - authentication successful');
      return true;
    }
    
    let success = false;
    let attempt = 0;
    let lastError = null;
    
    while (attempt < maxRetries && !success) {
      attempt++;
      console.log(`🔄 Authentication attempt ${attempt}/${maxRetries}`);
      
      try {
        // Try standard authentication
        success = await this.completeGoogleAuth(context, targetEmail);
        
        if (success) {
          console.log(`✅ Authentication successful on attempt ${attempt}`);
          break;
        } else {
          console.log(`❌ Authentication failed on attempt ${attempt} without throwing an error`);
          
          // Check if we're already logged in despite the auth flow indicating failure
          // This can happen if the auth popup closed unexpectedly but the user is logged in
          success = await this.checkIfAlreadyLoggedIn();
          if (success) {
            console.log('✅ User appears to be logged in despite auth flow failure');
            break;
          }
          
          // Reset the page state on failure
          await this.resetPageState();
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ Authentication error on attempt ${attempt}: ${error.message}`);
        await this.takeScreenshot(`auth-failure-attempt-${attempt}`);
        
        // Check if we're already logged in despite the error
        success = await this.checkIfAlreadyLoggedIn();
        if (success) {
          console.log('✅ User appears to be logged in despite auth error');
          break;
        }
        
        // Reset the page state on error
        await this.resetPageState();
      }
      
      // Wait before retry
      if (!success && attempt < maxRetries) {
        const delayMs = 3000 * attempt; // Increasing backoff delay
        console.log(`⏳ Waiting ${delayMs}ms before retry attempt ${attempt + 1}`);
        await this.page.waitForTimeout(delayMs);
      }
    }
    
    if (!success && lastError) {
      console.error(`❌ All ${maxRetries} authentication attempts failed. Last error: ${lastError.message}`);
    } else if (!success) {
      console.error(`❌ All ${maxRetries} authentication attempts failed without errors.`);
    }
    
    return success;
  }
  
  /**
   * Check if already logged in by looking for dashboard content and ACCESSTOKEN
   * @returns {Promise<boolean>}
   */
  async checkIfAlreadyLoggedIn() {
    console.log('🔍 Checking if already logged in...');
    
    try {
      // First, check for ACCESSTOKEN in localStorage (most reliable indicator)
      const hasAccessToken = await this.page.evaluate(() => {
        return localStorage.getItem('ACCESSTOKEN') !== null;
      });
      
      if (hasAccessToken) {
        console.log('✅ ACCESSTOKEN found in localStorage - user is logged in');
        await this.takeScreenshot('access-token-found');
        return true;
      }
      
      // Try multiple indicators of logged-in state
      const isDashboardVisible = await this.dashboardIndicators.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isDashboardVisible) {
        console.log('✅ Dashboard content visible - user is logged in');
        await this.takeScreenshot('already-logged-in');
        return true;
      }
      
      // Check for sign-in button absence as another indicator
      const isSignInButtonVisible = await this.signInButton.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (!isSignInButtonVisible) {
        // If sign-in button is not visible, check for other logged-in indicators
        const profileIndicators = [
          'div.mat-menu-trigger.avatar',
          'div.profile-image',
          'img.profile-image',
          '.profile div.avatar',
          'div.navbar-end .avatar'
        ];
        
        for (const selector of profileIndicators) {
          const isProfileVisible = await this.page.locator(selector).first().isVisible({ timeout: 1000 }).catch(() => false);
          if (isProfileVisible) {
            console.log(`✅ Profile indicator found (${selector}) - user is logged in`);
            await this.takeScreenshot('profile-indicator-visible');
            return true;
          }
        }
      }
      
      console.log('❌ No logged-in indicators found');
      return false;
    } catch (error) {
      console.log(`Error checking logged-in state: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Get test event data from localStorage
   * @returns {Promise<object|null>} Event data or null if not found
   */
  async getTestEventData() {
    try {
      const eventData = await this.page.evaluate(() => {
        const data = localStorage.getItem('TEST_EVENT_DATA');
        return data ? JSON.parse(data) : null;
      });
      
      if (eventData) {
        console.log(`📊 Found test event data: ${eventData.name} (${eventData.eventCode})`);
      } else {
        console.log('⚠️ No test event data found in localStorage');
      }
      
      return eventData;
    } catch (error) {
      console.log(`Error getting test event data: ${error.message}`);
      return null;
    }
  }

  /**
   * Reset page state for retry
   * @returns {Promise<void>}
   */
  async resetPageState() {
    try {
      console.log('🔄 Resetting page state for retry...');
      
      // Try to navigate to the homepage to reset state
      await this.page.goto('https://dev.livesharenow.com/');
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.page.waitForTimeout(1000);
      
      // Clear cookies and local storage for fresh login
      // Only clear cookies if we're going to retry login, otherwise it might log out a successful session
      await this.page.evaluate(() => {
        try {
          localStorage.removeItem('hasCompletedTour');
          localStorage.removeItem('hasSeenWelcome');
          sessionStorage.clear();
        } catch (e) {
          // Ignore errors from localStorage access
        }
      }).catch(() => {});
      
      await this.takeScreenshot('page-state-reset');
    } catch (error) {
      console.log(`Error resetting page state: ${error.message}`);
    }
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
    const signInButton = this.signInButton;
    await signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.takeScreenshot('before-signin');
    await signInButton.click();
    await this.page.waitForTimeout(3000);
    await this.takeScreenshot('auth-modal');
  }

  /**
   * Complete Email Login flow - similar to DMS save-complete-auth approach
   * @param {string} email Email address to login with
   * @param {string} [password] Password (if required by the flow)
   * @returns {Promise<boolean>} Success status
   */
  async completeEmailLogin(email, password = '') {
    try {
      console.log(`🔐 Starting email login for: ${email}`);
      
      // Step 1: Wait for and click sign in button if present
      if (await this.signInButton.isVisible({ timeout: 5000 })) {
        console.log('Clicking Sign In button...');
        await this.signInButton.click();
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('after-signin-click');
      }

      // Step 2: Wait for and click "Sign in with Email" button
      console.log('Looking for "Sign in with Email" button...');
      await this.emailSignInButton.waitFor({ state: 'visible', timeout: 10000 });
      await this.takeScreenshot('before-email-signin-click');
      await this.emailSignInButton.click();
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('after-email-signin-click');

      // Step 3: Fill email input
      console.log('Filling email input...');
      await this.emailLoginInput.waitFor({ state: 'visible', timeout: 10000 });
      await this.emailLoginInput.fill(email);
      await this.takeScreenshot('email-filled');

      // Step 4: Click Continue button
      console.log('Clicking Continue button...');
      await this.continueButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.continueButton.click();
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('after-continue-click');
      // Step 5: Fill password input
      console.log('Filling password input...');
      await this.emailPasswordInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.emailPasswordInput.fill(password);
      await this.takeScreenshot('password-filled');
      // Step 6: Click Submit button
      await this.continueButton.click();
      await this.page.waitForTimeout(3000);
      await this.takeScreenshot('after-submit-click');

      // Step 5: Wait for authentication success indicators
      console.log('Waiting for authentication success...');
      
      // Wait for either dashboard content or redirect
      try {
        // Wait for dashboard indicators or successful navigation
        await this.page.waitForSelector('.flex.pt-8, div.event-card, div.mat-card, [data-testid="dashboard"], .event-card-event', { 
          timeout: 30000 
        });
        console.log('✅ Dashboard content detected - email login successful');
        await this.takeScreenshot('email-login-success');
        return true;
      } catch (dashboardError) {
        // Alternative: check for absence of login elements
        const isSignInVisible = await this.signInButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (!isSignInVisible) {
          console.log('✅ Login elements not visible - assuming login successful');
          await this.takeScreenshot('email-login-success-alt');
          return true;
        }
        
        console.log('❌ Dashboard not detected and login elements still visible');
        await this.takeScreenshot('email-login-failed');
        return false;
      }

    } catch (error) {
      console.error('❌ Email login error:', error);
      await this.takeScreenshot('email-login-error');
      throw error;
    }
  }

  /**
   * Email login with retry mechanism - main method for email authentication
   * @param {string} email Email address to login with
   * @param {string} [password] Password (if required)
   * @param {number} [maxRetries=3] Maximum number of retry attempts
   * @returns {Promise<boolean>} Success status
   */
  async authenticateWithEmailRetry(email, password = '', maxRetries = 3) {
    console.log(`🔐 Starting email authentication with ${maxRetries} retry attempts for: ${email}`);
    
    // Check if already logged in before attempting login
    const isAlreadyLoggedIn = await this.checkIfAlreadyLoggedIn();
    if (isAlreadyLoggedIn) {
      console.log('✅ Already logged in - authentication successful');
      return true;
    }
    
    let success = false;
    let attempt = 0;
    let lastError = null;
    
    while (attempt < maxRetries && !success) {
      attempt++;
      console.log(`🔄 Email authentication attempt ${attempt}/${maxRetries}`);
      
      try {
        // Try email authentication
        success = await this.completeEmailLogin(email, password);
        
        if (success) {
          console.log(`✅ Email authentication successful on attempt ${attempt}`);
          break;
        } else {
          console.log(`❌ Email authentication failed on attempt ${attempt} without throwing an error`);
          
          // Check if we're already logged in despite the auth flow indicating failure
          success = await this.checkIfAlreadyLoggedIn();
          if (success) {
            console.log('✅ User appears to be logged in despite auth flow failure');
            break;
          }
          
          // Reset the page state on failure
          await this.resetPageState();
        }
      } catch (error) {
        lastError = error;
        console.log(`❌ Email authentication error on attempt ${attempt}: ${error.message}`);
        await this.takeScreenshot(`email-auth-failure-attempt-${attempt}`);
        
        // Check if we're already logged in despite the error
        success = await this.checkIfAlreadyLoggedIn();
        if (success) {
          console.log('✅ User appears to be logged in despite auth error');
          break;
        }
        
        // Reset the page state on error
        await this.resetPageState();
      }
      
      // Wait before retry
      if (!success && attempt < maxRetries) {
        const delayMs = 3000 * attempt; // Increasing backoff delay
        console.log(`⏳ Waiting ${delayMs}ms before retry attempt ${attempt + 1}`);
        await this.page.waitForTimeout(delayMs);
      }
    }
    
    if (!success && lastError) {
      console.error(`❌ All ${maxRetries} email authentication attempts failed. Last error: ${lastError.message}`);
    } else if (!success) {
      console.error(`❌ All ${maxRetries} email authentication attempts failed without errors.`);
    }
    
    return success;
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
      if (await this.signInButton.isVisible({ timeout: 5000 })) {
        await this.signInButton.click();
        await this.page.waitForTimeout(2000);
      }

      // Look for Google button and wait for it to be ready
      const googleButton = this.googleButton;
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
      const isAccountSelectionVisible = await popup.locator('h1:has-text("Chọn tài khoản"), h1:has-text("Choose an account")').isVisible({ timeout: 5000 })
        .catch(() => false);
      
      if (isAccountSelectionVisible) {
        console.log('Account selection screen detected');
        await popup.screenshot({ path: './screenshots/account-selection.png' });
        
        // Get all available accounts
        const accounts = popup.locator('li[class*="aZvCDf"] div[role="link"]');
        const accountCount = await accounts.count();
        
        let accountFound = false;
        
        // If we have a target email, find and click that account
        if (targetEmail && targetEmail.length > 0) {
          for (let i = 0; i < accountCount; i++) {
            const accountItem = accounts.nth(i);
            const emailElement = accountItem.locator('div[class*="yAlK0b"]');
            
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
          const isPasswordInputVisible = await popup.locator('input[type="password"]').isVisible({ timeout: 3000 })
            .catch(() => false);
            
          if (isPasswordInputVisible) {
            console.log('Password input detected after account selection');
            await popup.fill('input[type="password"]', process.env.GOOGLE_PASSWORD || '');
            const submitButton = popup.locator('button:has-text("Next")').first();
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
        try {
          await popup.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
          await popup.fill('input[type="email"]', process.env.GOOGLE_EMAIL || '');
          await popup.screenshot({ path: './screenshots/email-filled.png' });
          console.log('Email filled, clicking next...');

          // Click next after email
          const nextButton = popup.locator('button:has-text("Next")').first();
          await nextButton.waitFor({ state: 'visible' });
          await nextButton.click();
          await popup.waitForTimeout(2000);

          // Wait for and fill password
          await popup.waitForSelector('input[type="password"]', { state: 'visible', timeout: 10000 });
          await popup.fill('input[type="password"]', process.env.GOOGLE_PASSWORD || '');
          await popup.screenshot({ path: './screenshots/password-filled.png' });
          console.log('Password filled, clicking next...');

          // Click next after password
          const submitButton = popup.locator('button:has-text("Next")').first();
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
        } catch (error) {
          console.log(`Error in standard login flow: ${error.message}`);
          // Try to close popup if it's still open
          await popup.close().catch(() => {});
          throw error;
        }
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
          // Try to close popup if it's still open
          await popup.close().catch(() => {});
        }
      } catch (e) {
        console.error('Could not capture popup state:', e);
      }
      
      throw error; // Re-throw so the retry mechanism knows there was an error
    }
  }
}