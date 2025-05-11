/**
 * @fileoverview Base page object that all other page objects extend from
 */

export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page Playwright page object
   */
  constructor(page) {
    this.page = page;
    this.baseUrl = 'https://app.livesharenow.com';
  }

  /**
   * Navigate to a specific path from base URL
   * @param {string} path Path to navigate to
   */
  async goto(path = '') {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  /**
   * Wait for page load state
   * @param {number} timeout Timeout in milliseconds
   */
  async waitForPageLoad(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Take screenshot with descriptive name
   * @param {string} name Screenshot name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `./screenshots/${name}.png`,
      fullPage: true
    });
  }

  /**
   * Wait for selector to be visible
   * @param {string} selector CSS selector
   * @param {number} timeout Timeout in ms
   * @returns {Promise<boolean>} Whether the selector is visible
   */
  async waitForSelector(selector, timeout = 30000) {
    try {
      // Handle multiple matches by using first() to avoid strict mode violations
      const element = this.page.locator(selector).first();
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch (error) {
      console.error(`Error waiting for selector "${selector}": ${error.message}`);
      return false;
    }
  }

  /**
   * Safely click an element with retries
   * @param {string} selector CSS selector
   * @param {Object} options Click options
   * @param {number} retries Number of retries
   * @returns {Promise<boolean>} Whether the click was successful
   */
  async safeClick(selector, options = {}, retries = 3) {
    let currentTry = 0;
    while (currentTry < retries) {
      try {
        // Handle multiple matches by using first() to avoid strict mode violations
        const element = this.page.locator(selector).first();
        
        // First check if element is visible
        const isVisible = await element.isVisible({ timeout: 5000 }).catch(() => false);
        if (!isVisible) {
          console.log(`Element "${selector}" not visible, retrying...`);
          await this.page.waitForTimeout(1000);
          currentTry++;
          continue;
        }
        
        // Try to scroll element into view if possible
        await element.scrollIntoViewIfNeeded().catch(() => {});
        
        // Wait a moment to ensure element is ready for interaction
        await this.page.waitForTimeout(500);
        
        // Try to click with force option to handle overlay issues
        await element.click({ force: true, ...options });
        return true;
      } catch (error) {
        console.error(`Error clicking "${selector}" (try ${currentTry + 1}/${retries}): ${error.message}`);
        await this.page.waitForTimeout(1000);
        currentTry++;
        
        if (currentTry >= retries) {
          console.error(`Failed to click "${selector}" after ${retries} retries`);
          await this.takeScreenshot(`click-failure-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
          return false;
        }
      }
    }
    return false;
  }

  /**
   * Try multiple selectors until one works
   * @param {string[]} selectors Array of selectors to try
   * @param {string} action Action to perform ('click', 'waitFor', 'isVisible')
   * @param {Object} options Options for the action
   * @returns {Promise<{success: boolean, selector: string|null, element: any|null}>}
   */
  async tryMultipleSelectors(selectors, action = 'isVisible', options = {}) {
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector).first();
        
        switch (action) {
          case 'click':
            const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
              await element.scrollIntoViewIfNeeded().catch(() => {});
              await this.page.waitForTimeout(500);
              await element.click({ force: true, ...options });
              return { success: true, selector, element };
            }
            break;
            
          case 'waitFor':
            await element.waitFor({ state: 'visible', timeout: 5000, ...options });
            return { success: true, selector, element };
            
          case 'isVisible':
          default:
            if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
              return { success: true, selector, element };
            }
            break;
        }
      } catch (error) {
        console.log(`Selector "${selector}" failed for action "${action}": ${error.message}`);
        // Continue with next selector
      }
    }
    
    return { success: false, selector: null, element: null };
  }

  /**
   * Fill input field
   * @param {string} selector Element selector
   * @param {string} value Value to fill
   * @returns {Promise<boolean>} Whether the fill was successful
   */
  async fill(selector, value) {
    try {
      await this.waitForSelector(selector);
      const element = this.page.locator(selector).first();
      await element.fill(value);
      return true;
    } catch (error) {
      console.error(`Error filling "${selector}" with "${value}": ${error.message}`);
      return false;
    }
  }

  /**
   * Get element text
   * @param {string} selector Element selector
   * @returns {Promise<string>} Element text
   */
  async getText(selector) {
    try {
      await this.waitForSelector(selector);
      return await this.page.locator(selector).first().textContent();
    } catch (error) {
      console.error(`Error getting text from "${selector}": ${error.message}`);
      return '';
    }
  }

  /**
   * Check if element exists
   * @param {string} selector Element selector
   * @returns {Promise<boolean>} Whether element exists
   */
  async exists(selector) {
    try {
      return await this.page.locator(selector).count() > 0;
    } catch (error) {
      console.error(`Error checking if "${selector}" exists: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute JavaScript in page context
   * @param {string} expression JavaScript expression to execute
   * @param {...any} args Arguments to pass to function
   * @returns {Promise<any>} Result of function execution
   */
  async evaluate(expression, ...args) {
    return await this.page.evaluate(expression, ...args);
  }
} 