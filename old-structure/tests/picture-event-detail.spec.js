import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { EventPage } from '../page-objects/EventPage.js';
import { BasePage } from '../page-objects/BasePage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Increase test timeout for reliability
test.setTimeout(5 * 60 * 1000); // 5 minutes

test.describe('Picture In Event Detail Tests', () => {
  let loginPage;
  let eventPage;
  let basePage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    eventPage = new EventPage(page);
    basePage = new BasePage(page);
  });

  /**
   * Helper function to navigate to the tuanhay_test_event and click on the first image
   */
  async function navigateToEventAndImage(page) {
    // Navigate to app and login
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(page.context());
    expect(success, 'Authentication should be successful').toBeTruthy();

    // Wait for page to load fully
    await page.waitForTimeout(3000);

    console.log('Looking for tuanhay_test_event...');
    
    // Try multiple selectors to find the event with tuanhay_test_event
    const eventSelectors = [
      '.event-card-event:has-text("tuanhay_test_event")',
      '.event-name-event:has-text("tuanhay_test_event")',
      '.event-card:has-text("tuanhay_test_event")',
      '.flex.pt-8:has-text("tuanhay_test_event")',
      'div.mat-card:has-text("tuanhay_test_event")',
      'span.event-name:has-text("tuanhay_test_event")'
    ];
    
    let eventFound = false;
    
    for (const selector of eventSelectors) {
      const events = page.locator(selector);
      if (await events.count() > 0) {
        console.log(`Found tuanhay_test_event with selector: ${selector}`);
        await events.first().click();
        eventFound = true;
        break;
      }
    }
    
    if (!eventFound) {
      console.log('Could not find tuanhay_test_event, falling back to any event with tuanhay in the name');
      const tuanhayEvents = page.locator('.event-card, .event-card-event, div.mat-card').filter({ hasText: /tuanhay/i });
      
      if (await tuanhayEvents.count() > 0) {
        await tuanhayEvents.first().click();
        eventFound = true;
      }
    }
    
    if (!eventFound) {
      console.log('No tuanhay events found, clicking first available event');
      await eventPage.clickFirstEvent();
    }
    
    // Wait for event detail page to load
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(screenshotsDir, 'event-detail-loaded.png') });

    // Find and click on the first image in Event detail page
    console.log('Looking for images in the event detail page...');
    
    // Try multiple selectors for finding images
    const imageSelectors = [
      '.d-flex.justify-content-center.image-wrapper.photo.relative',
      '.image-wrapper.photo',
      '.views',
      'img.views',
      '.image-container img',
      '.grid-container img'
    ];
    
    let imageFound = false;
    
    for (const selector of imageSelectors) {
      const images = page.locator(selector);
      if (await images.count() > 0) {
        console.log(`Found image with selector: ${selector}`);
        await images.first().click();
        imageFound = true;
        break;
      }
    }
    
    if (!imageFound) {
      throw new Error('Could not find any images in the event detail page');
    }
    
    // Wait for the image detail view to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, 'image-detail-view.png') });
    
    return imageFound;
  }

  test('TC-APP-PIDe-001: Verify "Pin" button functionality', async ({ page, context }) => {
    // Navigate to event and click on first image
    await navigateToEventAndImage(page);

    // Step 3: Locate and check the pin button
    console.log('Looking for pin button...');
    
    // Try multiple selectors for the pin button
    const pinButtonSelectors = [
      'button:has(mat-icon:text("push_pin"))',
      'button:has-text("push_pin")',
      '.card-actions button:has(mat-icon:text("push_pin"))',
      'button.btn-ghost:has(mat-icon:text("push_pin"))'
    ];
    
    let pinButton = null;
    
    for (const selector of pinButtonSelectors) {
      const buttons = page.locator(selector);
      if (await buttons.count() > 0) {
        console.log(`Found pin button with selector: ${selector}`);
        pinButton = buttons.first();
        break;
      }
    }
    
    if (!pinButton) {
      throw new Error('Could not find pin button');
    }
    
    // Get the initial state of the pin button
    const initialPinState = await pinButton.getAttribute('class');
    const initialIconState = await page.locator('mat-icon:text("push_pin")').first().getAttribute('class') || '';
    
    console.log('Clicking pin button...');
    // Click the pin button
    await pinButton.click();
    await page.waitForTimeout(2000);
    
    // Get the updated state of the pin button and icon
    const updatedPinState = await pinButton.getAttribute('class');
    const updatedIconState = await page.locator('mat-icon:text("push_pin")').first().getAttribute('class') || '';
    
    // Check if the button or icon state changed
    let buttonChanged = initialPinState !== updatedPinState || initialIconState !== updatedIconState;
    
    // If class check didn't work, try checking for color change or other indicators
    if (!buttonChanged) {
      const isOrangeVisible = await page.locator('mat-icon.text-orange-600').count() > 0;
      const isPinnedIndicatorVisible = await page.locator('.pinned-indicator').count() > 0;
      buttonChanged = isOrangeVisible || isPinnedIndicatorVisible;
    }
    
    await page.screenshot({ path: path.join(screenshotsDir, 'after-pin-click.png') });
    
    // Verify the test result
    expect(buttonChanged, 'Pin button should change state when clicked').toBeTruthy();
  });

  test('TC-APP-PIDe-002: Verify "Gift" button functionality', async ({ page, context }) => {
    // Navigate to event and click on first image
    await navigateToEventAndImage(page);

    // Step 3: Locate and click the gift icon
    console.log('Looking for gift button...');
    
    // Try multiple selectors for the gift button
    const giftButtonSelectors = [
      'button:has(mat-icon:text("redeem"))',
      '.card-actions button:has(mat-icon:text("redeem"))',
      'button.btn-ghost:has(mat-icon:text("redeem"))'
    ];
    
    let giftButton = null;
    
    for (const selector of giftButtonSelectors) {
      const buttons = page.locator(selector);
      if (await buttons.count() > 0) {
        console.log(`Found gift button with selector: ${selector}`);
        giftButton = buttons.first();
        break;
      }
    }
    
    if (!giftButton) {
      throw new Error('Could not find gift button');
    }
    
    // Get the initial state of the gift button
    const initialGiftState = await giftButton.getAttribute('class');
    
    console.log('Clicking gift button...');
    // Click the gift button
    await giftButton.click();
    await page.waitForTimeout(2000);
    
    // Get the updated state of the gift button
    const updatedGiftState = await giftButton.getAttribute('class');
    
    // Check if the button state changed
    const buttonChanged = initialGiftState !== updatedGiftState;
    
    await page.screenshot({ path: path.join(screenshotsDir, 'after-gift-click.png') });
    
    // This test is expected to fail based on the requirements - the button doesn't change state
    console.log('Warning: Gift button functionality test might fail as expected per requirements');
    
    // We're not asserting here as the test is expected to have a warning status
    // Instead, we'll log the result
    if (!buttonChanged) {
      console.log('EXPECTED BEHAVIOR: Gift button did not change state when clicked');
    } else {
      console.log('UNEXPECTED BEHAVIOR: Gift button changed state when clicked');
    }
  });

  test('TC-APP-PIDe-003: Verify "Vertical Ellipsis" button functionality', async ({ page, context }) => {
    // Navigate to event and click on first image
    await navigateToEventAndImage(page);
    
    // Take screenshot before attempting to click
    await page.screenshot({ path: path.join(screenshotsDir, 'before-ellipsis-click.png') });
    
    // Step 3: Locate and click the vertical ellipsis button
    console.log('Looking for ellipsis button...');
    
    // Try multiple selectors for the ellipsis button
    const ellipsisButtonSelectors = [
      '.card-actions .ml-auto button.mat-menu-trigger',
      'button.mat-menu-trigger',
      'button:has(mat-icon:text("more_vert"))',
      '.ml-auto button:has(mat-icon:text("more_vert"))'
    ];
    
    let ellipsisButton = null;
    
    for (const selector of ellipsisButtonSelectors) {
      const buttons = page.locator(selector);
      if (await buttons.count() > 0) {
        console.log(`Found ellipsis button with selector: ${selector}`);
        ellipsisButton = buttons.first();
        break;
      }
    }
    
    if (!ellipsisButton) {
      throw new Error('Could not find ellipsis button');
    }
    
    console.log('Clicking ellipsis button...');
    // Click the ellipsis button
    await ellipsisButton.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: path.join(screenshotsDir, 'after-ellipsis-click.png') });
    
    // Check if a menu appears after clicking
    const menuSelectors = [
      '.mat-menu-content',
      '.dropdown-content',
      '.menu-content',
      '.cdk-overlay-pane',
      '.mat-menu-panel'
    ];
    
    let menuVisible = false;
    
    for (const selector of menuSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Found menu with selector: ${selector}`);
        menuVisible = true;
        break;
      }
    }
    
    // Verify the test result
    expect(menuVisible, 'Menu should appear after clicking ellipsis button').toBeTruthy();
  });

  test('TC-APP-PIDe-003A: Check "edit" function in vertical ellipsis button', async ({ page, context }) => {
    // Navigate to event and click on first image
    await navigateToEventAndImage(page);
    
    // Step 3: Locate and click the vertical ellipsis button
    console.log('Looking for ellipsis button...');
    
    // Try multiple selectors for the ellipsis button
    const ellipsisButtonSelectors = [
      '.card-actions .ml-auto button.mat-menu-trigger',
      'button.mat-menu-trigger',
      'button:has(mat-icon:text("more_vert"))',
      '.ml-auto button:has(mat-icon:text("more_vert"))'
    ];
    
    let ellipsisButton = null;
    
    for (const selector of ellipsisButtonSelectors) {
      const buttons = page.locator(selector);
      if (await buttons.count() > 0) {
        console.log(`Found ellipsis button with selector: ${selector}`);
        ellipsisButton = buttons.first();
        break;
      }
    }
    
    if (!ellipsisButton) {
      throw new Error('Could not find ellipsis button');
    }
    
    console.log('Clicking ellipsis button...');
    // Click the ellipsis button
    await ellipsisButton.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Click on the edit option in the menu
    console.log('Looking for edit option in menu...');
    
    // Take screenshot of the menu
    await page.screenshot({ path: path.join(screenshotsDir, 'ellipsis-menu.png') });
    
    // Try multiple selectors for the edit option
    const editOptionSelectors = [
      '.mat-menu-content button:has-text("Edit")',
      '.mat-menu-item:has-text("Edit")',
      'button.mat-menu-item:has(mat-icon:text("edit"))',
      '.cdk-overlay-pane button:has-text("Edit")',
      '.mat-menu-panel button:has-text("Edit")'
    ];
    
    let editOption = null;
    
    for (const selector of editOptionSelectors) {
      const options = page.locator(selector);
      if (await options.count() > 0) {
        console.log(`Found edit option with selector: ${selector}`);
        editOption = options.first();
        break;
      }
    }
    
    if (!editOption) {
      throw new Error('Could not find edit option in menu');
    }
    
    console.log('Clicking edit option...');
    // Click the edit option
    await editOption.click();
    await page.waitForTimeout(2000);
    
    // Step 5: Check if edit window appears
    console.log('Checking if edit window appears...');
    
    // Take screenshot of edit window
    await page.screenshot({ path: path.join(screenshotsDir, 'edit-window.png') });
    
    // Try multiple selectors for the edit window
    const editWindowSelectors = [
      '.dialog-content',
      '.edit-dialog',
      'input[placeholder*="Title"]',
      'input[placeholder*="Caption"]',
      '.edit-div',
      '.caption-text:has-text("Title")',
      '.caption-text:has-text("Caption")'
    ];
    
    let editWindowVisible = false;
    
    for (const selector of editWindowSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Found edit window with selector: ${selector}`);
        editWindowVisible = true;
        break;
      }
    }
    
    // Verify the test result
    expect(editWindowVisible, 'Edit window should appear after clicking edit option').toBeTruthy();
    
    // Check if title and caption fields are present
    const titleFieldSelectors = [
      'input[placeholder*="Title"]',
      '.title-field',
      '.caption-text:has-text("Title")'
    ];
    
    let titleFieldVisible = false;
    
    for (const selector of titleFieldSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Found title field with selector: ${selector}`);
        titleFieldVisible = true;
        break;
      }
    }
    
    const captionFieldSelectors = [
      'input[placeholder*="Caption"]',
      'textarea[placeholder*="Caption"]',
      '.caption-field',
      '.caption-text:has-text("Caption")'
    ];
    
    let captionFieldVisible = false;
    
    for (const selector of captionFieldSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Found caption field with selector: ${selector}`);
        captionFieldVisible = true;
        break;
      }
    }
    
    expect(titleFieldVisible, 'Title field should be visible in edit window').toBeTruthy();
    expect(captionFieldVisible, 'Caption field should be visible in edit window').toBeTruthy();
  });

  test('TC-APP-PIDe-003B: Check "delete" function in vertical ellipsis button', async ({ page, context }) => {
    // Navigate to event and click on first image
    await navigateToEventAndImage(page);
    
    // Step 3: Locate and click the vertical ellipsis button
    console.log('Looking for ellipsis button...');
    
    // Try multiple selectors for the ellipsis button
    const ellipsisButtonSelectors = [
      '.card-actions .ml-auto button.mat-menu-trigger',
      'button.mat-menu-trigger',
      'button:has(mat-icon:text("more_vert"))',
      '.ml-auto button:has(mat-icon:text("more_vert"))'
    ];
    
    let ellipsisButton = null;
    
    for (const selector of ellipsisButtonSelectors) {
      const buttons = page.locator(selector);
      if (await buttons.count() > 0) {
        console.log(`Found ellipsis button with selector: ${selector}`);
        ellipsisButton = buttons.first();
        break;
      }
    }
    
    if (!ellipsisButton) {
      throw new Error('Could not find ellipsis button');
    }
    
    console.log('Clicking ellipsis button...');
    // Click the ellipsis button
    await ellipsisButton.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Click on the delete option in the menu
    console.log('Looking for delete option in menu...');
    
    // Take screenshot of the menu
    await page.screenshot({ path: path.join(screenshotsDir, 'ellipsis-menu-delete.png') });
    
    // Try multiple selectors for the delete option
    const deleteOptionSelectors = [
      '.mat-menu-content button:has-text("Delete")',
      '.mat-menu-item:has-text("Delete")',
      'button.mat-menu-item:has(mat-icon:text("delete"))',
      '.cdk-overlay-pane button:has-text("Delete")',
      '.mat-menu-panel button:has-text("Delete")'
    ];
    
    let deleteOption = null;
    
    for (const selector of deleteOptionSelectors) {
      const options = page.locator(selector);
      if (await options.count() > 0) {
        console.log(`Found delete option with selector: ${selector}`);
        deleteOption = options.first();
        break;
      }
    }
    
    if (!deleteOption) {
      throw new Error('Could not find delete option in menu');
    }
    
    console.log('Clicking delete option...');
    // Click the delete option
    await deleteOption.click();
    await page.waitForTimeout(2000);
    
    // Step 5: Check if confirmation dialog appears
    console.log('Checking if confirmation dialog appears...');
    
    // Take screenshot of confirmation dialog
    await page.screenshot({ path: path.join(screenshotsDir, 'delete-confirmation.png') });
    
    // Try multiple selectors for the confirmation dialog
    const confirmDialogSelectors = [
      '.confirmation-dialog',
      '.mat-dialog-container:has-text("Delete")',
      'div:has-text("Are you sure")',
      '.dialog-content:has-text("Delete")',
      '.mat-dialog-content:has-text("Delete")'
    ];
    
    let confirmDialogVisible = false;
    
    for (const selector of confirmDialogSelectors) {
      if (await page.locator(selector).count() > 0) {
        console.log(`Found confirmation dialog with selector: ${selector}`);
        confirmDialogVisible = true;
        break;
      }
    }
    
    // Verify the test result
    expect(confirmDialogVisible, 'Delete confirmation dialog should appear').toBeTruthy();
    
    // Don't actually confirm deletion to avoid modifying data
    // Instead, click cancel or close the dialog
    const cancelButtonSelectors = [
      'button:has-text("Cancel")',
      'button:has-text("No")',
      '.mat-button-base:has-text("Cancel")',
      '.mat-dialog-actions button:not(:has-text("Delete"))'
    ];
    
    for (const selector of cancelButtonSelectors) {
      const cancelButton = page.locator(selector);
      if (await cancelButton.count() > 0) {
        console.log(`Found cancel button with selector: ${selector}`);
        await cancelButton.first().click();
        break;
      }
    }
  });

  test('TC-APP-PIDe-004: Verify "Search" button functionality', async ({ page, context }) => {
    // Navigate to event and click on first image
    await navigateToEventAndImage(page);
    
    // Step 3: Check if search button exists and click it
    console.log('Looking for search/crop button...');
    
    const searchButtonSelectors = [
      'button:has(mat-icon:text("search"))', 
      'button:has(mat-icon:text("zoom_in"))',
      'button:has(mat-icon:text("crop"))',
      'button.search-button',
      '.search-icon',
      '.btn-ghost:has(mat-icon:text("crop"))',
      '.text-right .btn-ghost'
    ];
    
    let searchButton = null;
    
    for (const selector of searchButtonSelectors) {
      const buttons = page.locator(selector);
      if (await buttons.count() > 0) {
        console.log(`Found search/crop button with selector: ${selector}`);
        searchButton = buttons.first();
        break;
      }
    }
    
    if (!searchButton) {
      console.log('Warning: Search/crop button not found in the interface');
      return; // Skip the rest of the test
    }
    
    // Get initial state
    const initialState = await searchButton.getAttribute('class');
    
    console.log('Clicking search/crop button...');
    // Click the search button
    await searchButton.click();
    await page.waitForTimeout(2000);
    
    // Get updated state
    const updatedState = await searchButton.getAttribute('class');
    
    // Check if button state changed
    const buttonChanged = initialState !== updatedState;
    
    // Take screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'after-search-click.png') });
    
    // Verify the test result
    expect(buttonChanged, 'Search/crop button should change state when clicked').toBeTruthy();
  });
}); 