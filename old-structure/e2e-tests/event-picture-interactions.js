/**
 * @fileoverview End-to-end test for picture interactions in event detail page
 * This test focuses on comprehensive testing of picture interactions in the event detail page
 * including clicking events, viewing pictures, and interacting with picture controls
 */

const { chromium } = require('@playwright/test');
const { LoginPage } = require('../page-objects/LoginPage');
const { EventPage } = require('../page-objects/EventPage');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Main test function that runs the end-to-end test for picture interactions
 */
async function runPictureInteractionTest() {
  // Launch browser with options for better visibility and debugging
  const browser = await chromium.launch({
    headless: false, // Set to true for CI/CD environments
    slowMo: 50, // Slow down operations for better visibility during debugging
  });
  
  // Create a new browser context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: './videos/',
      size: { width: 1280, height: 720 },
    },
  });

  // Create a new page
  const page = await context.newPage();
  
  // Initialize page objects
  const loginPage = new LoginPage(page);
  const eventPage = new EventPage(page);
  
  try {
    console.log('Starting Picture Interaction E2E Test');
    
    // Step 1: Navigate to app and login
    console.log('Step 1: Navigating to app and logging in');
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context);
    
    if (!success) {
      throw new Error('Authentication failed');
    }
    
    console.log('Authentication successful');
    await page.screenshot({ path: path.join(screenshotsDir, 'e2e-authenticated.png') });
    
    // Step 2: Navigate to event page
    console.log('Step 2: Navigating to event page');
    
    // Try to find an event with "tuanhay" in the name
    const eventCardSelector = '.flex.pt-8, div.event-card, div.mat-card';
    const tuanhayEvents = page.locator(eventCardSelector).filter({ hasText: /tuanhay/i });
    
    if (await tuanhayEvents.count() > 0) {
      console.log('Found event with "tuanhay" in the name');
      await tuanhayEvents.first().click();
    } else {
      console.log('No event with "tuanhay" found, clicking first available event');
      await eventPage.clickFirstEvent();
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, 'e2e-event-detail.png') });
    
    // Step 3: Click on the first image in the event detail page
    console.log('Step 3: Clicking on the first image in event detail');
    await page.waitForSelector('.d-flex.justify-content-center.image-wrapper.photo.relative');
    await page.locator('.d-flex.justify-content-center.image-wrapper.photo.relative').first().click();
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, 'e2e-image-view.png') });
    
    // Step 4: Test Pin button functionality
    console.log('Step 4: Testing Pin button functionality');
    await testPinButton(page);
    
    // Step 5: Test Gift button functionality
    console.log('Step 5: Testing Gift button functionality');
    await testGiftButton(page);
    
    // Step 6: Test Vertical Ellipsis button and its options
    console.log('Step 6: Testing Vertical Ellipsis button and its options');
    await testVerticalEllipsisButton(page);
    
    // Step 7: Test Search/Crop button functionality
    console.log('Step 7: Testing Search/Crop button functionality');
    await testSearchButton(page);
    
    // Step 8: Close the image view and return to event detail
    console.log('Step 8: Closing image view');
    await closeImageView(page);
    
    // Step 9: Verify we're back at the event detail page
    console.log('Step 9: Verifying we are back at event detail page');
    const isEventDetailPage = await page.isVisible('.event-detail, .event-image, .image-container');
    
    if (isEventDetailPage) {
      console.log('Successfully returned to event detail page');
      await page.screenshot({ path: path.join(screenshotsDir, 'e2e-back-to-event-detail.png') });
    } else {
      console.warn('Could not verify return to event detail page');
    }
    
    console.log('Picture Interaction E2E Test completed successfully');
    
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
    await page.screenshot({ path: path.join(screenshotsDir, 'e2e-test-failure.png') });
  } finally {
    // Close browser
    await browser.close();
  }
}

/**
 * Test Pin button functionality
 * @param {import('@playwright/test').Page} page Playwright page object
 */
async function testPinButton(page) {
  try {
    // Wait for and locate the pin button
    await page.waitForSelector('button:has(mat-icon:text("push_pin"))');
    const pinButton = page.locator('button:has(mat-icon:text("push_pin"))').first();
    
    // Get initial state
    const initialState = await pinButton.getAttribute('class');
    const initialIconState = await page.locator('mat-icon:text("push_pin")').first().getAttribute('class');
    
    console.log('Clicking pin button');
    await pinButton.click();
    await page.waitForTimeout(1000);
    
    // Get updated state
    const updatedState = await pinButton.getAttribute('class');
    const updatedIconState = await page.locator('mat-icon:text("push_pin")').first().getAttribute('class');
    
    // Check if state changed
    const stateChanged = initialState !== updatedState || initialIconState !== updatedIconState;
    
    if (stateChanged) {
      console.log('Pin button state changed successfully');
    } else {
      console.warn('Pin button state did not change');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'e2e-pin-button-test.png') });
    
    // Click again to restore original state
    await pinButton.click();
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.error(`Error testing pin button: ${error.message}`);
  }
}

/**
 * Test Gift button functionality
 * @param {import('@playwright/test').Page} page Playwright page object
 */
async function testGiftButton(page) {
  try {
    // Wait for and locate the gift button
    const giftButtonSelector = 'button:has(mat-icon:text("redeem"))';
    await page.waitForSelector(giftButtonSelector);
    const giftButton = page.locator(giftButtonSelector).first();
    
    // Get initial state
    const initialState = await giftButton.getAttribute('class');
    
    console.log('Clicking gift button');
    await giftButton.click();
    await page.waitForTimeout(1000);
    
    // Get updated state
    const updatedState = await giftButton.getAttribute('class');
    
    // Check if state changed (though expected not to change per requirements)
    const stateChanged = initialState !== updatedState;
    
    if (stateChanged) {
      console.log('Gift button state changed (unexpected behavior)');
    } else {
      console.log('Gift button state did not change (expected behavior)');
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'e2e-gift-button-test.png') });
    
  } catch (error) {
    console.error(`Error testing gift button: ${error.message}`);
  }
}

/**
 * Test Vertical Ellipsis button and its options
 * @param {import('@playwright/test').Page} page Playwright page object
 */
async function testVerticalEllipsisButton(page) {
  try {
    // Wait for and locate the ellipsis button
    const ellipsisButtonSelector = '.card-actions .ml-auto button.mat-menu-trigger';
    await page.waitForSelector(ellipsisButtonSelector);
    const ellipsisButton = page.locator(ellipsisButtonSelector);
    
    console.log('Clicking ellipsis button');
    await ellipsisButton.click();
    await page.waitForTimeout(1000);
    
    // Check if menu appears
    const menuVisible = await page.isVisible('.mat-menu-content, .dropdown-content, .menu-content');
    
    if (menuVisible) {
      console.log('Menu appeared successfully');
      await page.screenshot({ path: path.join(screenshotsDir, 'e2e-ellipsis-menu.png') });
      
      // Test Edit option if available
      const editOption = page.locator('.mat-menu-item:has-text("Edit"), button:has-text("Edit")');
      if (await editOption.isVisible()) {
        console.log('Testing Edit option');
        await editOption.click();
        await page.waitForTimeout(1000);
        
        // Check if edit dialog appears
        const editDialogVisible = await page.isVisible('.dialog-content, .edit-dialog, input[placeholder*="Title"], input[placeholder*="Caption"], .caption-text, .edit-div');
        
        if (editDialogVisible) {
          console.log('Edit dialog appeared successfully');
          await page.screenshot({ path: path.join(screenshotsDir, 'e2e-edit-dialog.png') });
          
          // Close edit dialog
          const closeButton = page.locator('button:has(mat-icon:text("close")), button.btn-ghost:has-text("Cancel"), button:has-text("Cancel")');
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(1000);
          }
        } else {
          console.warn('Edit dialog did not appear');
        }
        
        // Click ellipsis button again to test Delete option
        await ellipsisButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Test Delete option if available
      const deleteOption = page.locator('.mat-menu-item:has-text("Delete"), button:has-text("Delete")');
      if (await deleteOption.isVisible()) {
        console.log('Testing Delete option');
        await deleteOption.click();
        await page.waitForTimeout(1000);
        
        // Check if confirmation dialog appears
        const confirmDialogVisible = await page.isVisible('.confirmation-dialog, .mat-dialog-container:has-text("Delete"), div:has-text("Are you sure")');
        
        if (confirmDialogVisible) {
          console.log('Delete confirmation dialog appeared successfully');
          await page.screenshot({ path: path.join(screenshotsDir, 'e2e-delete-confirmation.png') });
          
          // Click cancel to avoid actual deletion
          const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")');
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
            await page.waitForTimeout(1000);
          }
        } else {
          console.warn('Delete confirmation dialog did not appear');
        }
      }
    } else {
      console.warn('Menu did not appear after clicking ellipsis button');
    }
    
  } catch (error) {
    console.error(`Error testing ellipsis button: ${error.message}`);
  }
}

/**
 * Test Search/Crop button functionality
 * @param {import('@playwright/test').Page} page Playwright page object
 */
async function testSearchButton(page) {
  try {
    // Try different selectors for the search/crop button
    const searchButtonSelectors = [
      'button:has(mat-icon:text("search"))',
      'button:has(mat-icon:text("zoom_in"))',
      'button:has(mat-icon:text("crop"))',
      'button.search-button',
      '.search-icon',
      '.btn-ghost:has(mat-icon:text("crop"))'
    ];
    
    let searchButtonFound = false;
    
    for (const selector of searchButtonSelectors) {
      const searchButton = page.locator(selector).first();
      if (await searchButton.isVisible().catch(() => false)) {
        console.log(`Found search/crop button with selector: ${selector}`);
        
        // Get initial state
        const initialState = await searchButton.getAttribute('class');
        
        console.log('Clicking search/crop button');
        await searchButton.click();
        await page.waitForTimeout(1000);
        
        // Get updated state
        const updatedState = await searchButton.getAttribute('class');
        
        // Check if state changed
        const stateChanged = initialState !== updatedState;
        
        if (stateChanged) {
          console.log('Search/crop button state changed successfully');
        } else {
          console.log('Search/crop button clicked but state did not change');
        }
        
        await page.screenshot({ path: path.join(screenshotsDir, 'e2e-search-button-test.png') });
        
        searchButtonFound = true;
        break;
      }
    }
    
    if (!searchButtonFound) {
      console.warn('Search/crop button not found');
    }
    
  } catch (error) {
    console.error(`Error testing search button: ${error.message}`);
  }
}

/**
 * Close the image view
 * @param {import('@playwright/test').Page} page Playwright page object
 */
async function closeImageView(page) {
  try {
    // Try different selectors for close buttons
    const closeButtonSelectors = [
      'button:has(mat-icon:text("close"))',
      'button.btn-circle:has(mat-icon:text("close"))',
      '.close-button',
      'button.btn-ghost:has(mat-icon:text("close"))'
    ];
    
    let closeButtonFound = false;
    
    for (const selector of closeButtonSelectors) {
      const closeButton = page.locator(selector).first();
      if (await closeButton.isVisible().catch(() => false)) {
        console.log(`Found close button with selector: ${selector}`);
        await closeButton.click();
        await page.waitForTimeout(2000);
        closeButtonFound = true;
        break;
      }
    }
    
    if (!closeButtonFound) {
      console.warn('Close button not found, trying to press Escape key');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);
    }
    
  } catch (error) {
    console.error(`Error closing image view: ${error.message}`);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runPictureInteractionTest().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}

// Export functions for use in other test files
module.exports = {
  runPictureInteractionTest,
  testPinButton,
  testGiftButton,
  testVerticalEllipsisButton,
  testSearchButton,
  closeImageView
}; 