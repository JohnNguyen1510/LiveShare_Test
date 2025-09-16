const BasePage = require('./base-page');
const path = require('path');
const fs = require('fs').promises;

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        
        // Authentication state file path
        this.authFile = path.join(__dirname, '../auth/user-auth.json');
        this.tokenFile = path.join(__dirname, '../auth/auth-token.json');
        
        // Selectors
        this.selectors = {
            signInButton: 'button:has-text("Sign In"), button:has-text("Login"), .login-button',
            googleButton: '[aria-label*="Google"], [class*="google"], button:has-text("Google")',
            emailInput: 'input[type="email"]',
            passwordInput: 'input[type="password"]',
            nextButton: 'button:has-text("Next")',
            submitButton: 'button[type="submit"]',
            
            // Account selection screen
            accountSelectionHeader: 'h1:has-text("Chọn tài khoản"), h1:has-text("Choose an account")',
            accountItems: 'li[class*="aZvCDf"] div[role="link"]',
            accountEmail: 'div[class*="yAlK0b"]',
            useAnotherAccount: 'div:has-text("Sử dụng một tài khoản khác"), div:has-text("Use another account")',
            
            // Dashboard indicators
            dashboardIndicators: '.flex.pt-8, div.event-card, div.mat-card, [data-testid="dashboard"], .event-card-event',
            
            // Profile indicators
            profileIndicators: [
                'div.mat-menu-trigger.avatar',
                'div.profile-image',
                'img.profile-image',
                '.profile div.avatar',
                'div.navbar-end .avatar'
            ]
        };
    }

    /**
     * Set up token interception to capture OAuth tokens
     */
    async setupTokenInterception() {
        await this.page.route('**/oauth/token', async (route, request) => {
            const response = await route.fetch();
            
            try {
                const responseBody = await response.text();
                const tokenResponse = JSON.parse(responseBody);
                
                if (tokenResponse.access_token) {
                    console.log('Access token captured from OAuth response');
                    await this.saveAccessToken(tokenResponse);
                }
            } catch (error) {
                console.error('Error parsing OAuth token response:', error);
            }
            
            await route.fulfill({ response });
        });
    }

    /**
     * Save the access token to a file
     * @param {Object} tokenResponse - The complete token response from OAuth
     */
    async saveAccessToken(tokenResponse) {
        try {
            const tokenData = {
                access_token: tokenResponse.access_token,
                id_token: tokenResponse.id_token,
                token_type: tokenResponse.token_type,
                expires_in: tokenResponse.expires_in,
                scope: tokenResponse.scope,
                timestamp: Date.now(),
                expires_at: Date.now() + (tokenResponse.expires_in * 1000)
            };
            
            // Ensure auth directory exists
            const authDir = path.dirname(this.tokenFile);
            await fs.mkdir(authDir, { recursive: true });
            
            await fs.writeFile(this.tokenFile, JSON.stringify(tokenData, null, 2));
            console.log(`Access token saved to ${this.tokenFile}`);
        } catch (error) {
            console.error('Error saving access token:', error);
        }
    }

    /**
     * Get the saved access token
     * @returns {Promise<string|null>} The access token or null if not found/expired
     */
    async getSavedAccessToken() {
        try {
            const tokenData = JSON.parse(await fs.readFile(this.tokenFile, 'utf8'));
            
            // Check if token is expired
            if (Date.now() > tokenData.expires_at) {
                console.log('Saved access token has expired');
                return null;
            }
            
            return tokenData.access_token;
        } catch (error) {
            console.error('Error reading saved access token:', error);
            return null;
        }
    }

    /**
     * Navigate to the login page
     */
    async goToPage() {
        await this.goto('/');
        await this.waitForPageLoad();
        await this.takeScreenshot('login-page');
    }

    /**
     * Wait for the page to be ready
     */
    async waitForPageReady() {
        await this.waitForSelector(this.selectors.signInButton);
    }

    /**
     * Check if already logged in by looking for dashboard content
     * @returns {Promise<boolean>}
     */
    async checkIfAlreadyLoggedIn() {
        console.log('🔍 Checking if already logged in...');
        
        try {
            // Try multiple indicators of logged-in state
            const dashboardElement = this.page.locator(this.selectors.dashboardIndicators).first();
            const isDashboardVisible = await dashboardElement.isVisible({ timeout: 3000 }).catch(() => false);
            
            if (isDashboardVisible) {
                console.log('✅ Dashboard content visible - user is logged in');
                await this.takeScreenshot('already-logged-in');
                return true;
            }
            
            // Check for sign-in button absence as another indicator
            const signInButton = this.page.locator(this.selectors.signInButton);
            const isSignInButtonVisible = await signInButton.isVisible({ timeout: 1000 }).catch(() => false);
            
            if (!isSignInButtonVisible) {
                // Check for profile indicators
                for (const selector of this.selectors.profileIndicators) {
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
     * Reset page state for retry
     * @returns {Promise<void>}
     */
    async resetPageState() {
        try {
            console.log('🔄 Resetting page state for retry...');
            
            // Navigate to homepage to reset state
            await this.page.goto(this.config.baseURL);
            await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
            await this.page.waitForTimeout(1000);
            
            // Clear local storage for fresh login
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
     * Robust authentication with retries
     * @param {import('@playwright/test').BrowserContext} context Browser context
     * @param {string} [targetEmail] Optional email to select from account list
     * @param {number} [maxRetries=3] Maximum number of retry attempts
     * @returns {Promise<boolean>} Success status
     */
    async authenticateWithRetry(context, targetEmail = '', maxRetries = 3) {
        console.log(`🔐 Starting authentication with ${maxRetries} retry attempts`);
        
        // Check if already logged in
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
                // Set up token interception before starting login
                await this.setupTokenInterception();
                
                success = await this.completeGoogleAuth(context, targetEmail);
                
                if (success) {
                    console.log(`✅ Authentication successful on attempt ${attempt}`);
                    break;
                } else {
                    console.log(`❌ Authentication failed on attempt ${attempt} without throwing an error`);
                    
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
                    // Check if we need to do additional confirmation
                    const isPasswordInputVisible = await popup.locator(this.selectors.passwordInput).isVisible({ timeout: 3000 })
                        .catch(() => false);
                        
                    if (isPasswordInputVisible) {
                        console.log('Password input detected after account selection');
                        await popup.fill(this.selectors.passwordInput, this.config.credentials.googlePassword);
                        const submitButton = popup.locator(this.selectors.nextButton).first();
                        await submitButton.click();
                    }
                    
                    // Wait for popup to close or redirect
                    await popup.waitForEvent('close', { timeout: 30000 }).catch(() => {
                        console.log('Popup did not close as expected, continuing...');
                    });
                    
                    // Wait for main page to stabilize
                    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
                    
                    // Wait for page content to be visible
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
                    await popup.waitForSelector(this.selectors.emailInput, { state: 'visible', timeout: 10000 });
                    await popup.fill(this.selectors.emailInput, this.config.credentials.googleEmail);
                    await popup.screenshot({ path: './screenshots/email-filled.png' });
                    console.log('Email filled, clicking next...');

                    // Click next after email
                    const nextButton = popup.locator(this.selectors.nextButton).first();
                    await nextButton.waitFor({ state: 'visible' });
                    await nextButton.click();
                    await popup.waitForTimeout(2000);

                    // Wait for and fill password
                    await popup.waitForSelector(this.selectors.passwordInput, { state: 'visible', timeout: 10000 });
                    await popup.fill(this.selectors.passwordInput, this.config.credentials.googlePassword);
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

    /**
     * Save authentication state
     * @returns {Promise<void>}
     */
    async saveAuthState() {
        try {
            // Ensure auth directory exists
            const authDir = path.dirname(this.authFile);
            await fs.mkdir(authDir, { recursive: true });
            
            await this.page.context().storageState({ path: this.authFile });
            console.log(`Authentication state saved to ${this.authFile}`);
        } catch (error) {
            console.error('Error saving authentication state:', error);
        }
    }

    /**
     * Check if authentication state exists
     * @returns {Promise<boolean>}
     */
    async hasAuthState() {
        try {
            await fs.access(this.authFile);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Load authentication state
     * @returns {Promise<Object>}
     */
    async loadAuthState() {
        try {
            const authData = JSON.parse(await fs.readFile(this.authFile, 'utf8'));
            return { storageState: this.authFile };
        } catch (error) {
            console.error('Error loading authentication state:', error);
            return {};
        }
    }
}

module.exports = LoginPage;

