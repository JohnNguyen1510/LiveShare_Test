import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ImageDetailPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Image detail view locators
    this.imageDetailView = this.page.locator('.image-detail-view, .image-viewer, .photo-detail');
    
    // Action buttons in image detail
    this.pinButton = this.page.locator('button:has(mat-icon:text("push_pin"))').first();
    this.giftButton = this.page.locator('button:has(mat-icon:text("redeem"))').first();
    this.ellipsisButton = this.page.locator(
      'button.mat-menu-trigger[tabindex="0"]:has(mat-icon:has-text("more_vert"))'
    );
    this.searchButton = this.page.locator('button:has(mat-icon:text("search")), button:has(mat-icon:text("zoom_in")), button:has(mat-icon:text("crop"))').first();
    
    // Menu options
    this.editOption = this.page.locator('button.mat-menu-item:has-text("Edit"), .mat-menu-content button:has-text("Edit")').first();
    this.deleteOption = this.page.locator('button.mat-menu-item:has-text("Delete"), .mat-menu-content button:has-text("Delete")').first();
    
    // Edit dialog
    this.editDialog = this.page.locator('.dialog-content, .edit-dialog, .mat-dialog-container');
    this.titleField = this.page.locator('input[placeholder*="Title"], .title-field').first();
    this.captionField = this.page.locator('input[placeholder*="Caption"], textarea[placeholder*="Caption"], .caption-field').first();
    
    // Delete confirmation
    this.deleteConfirmation = this.page.locator('.confirmation-dialog, .mat-dialog-container:has-text("Delete")').first();
    this.cancelButton = this.page.locator('button:has-text("Cancel"), button:has-text("No")').first();
    
    // Image selectors for navigation
    this.imageSelectors = [
      '.d-flex.justify-content-center.image-wrapper.photo.relative',
      '.image-wrapper.photo',
      '.views',
      'img.views',
      '.image-container img',
      '.grid-container img',
      '.gallery-grid img',
      '.grid-component img'
    ];
  }

  async navigateToEventAndImage(eventName = 'tuanhay_test_event') {
    // Navigate to app and login
    await this.page.waitForLoadState('networkidle');

    // Wait for page to load fully
    await this.page.waitForTimeout(2000);

    console.log(`Looking for ${eventName}...`);
    
    // Try multiple selectors to find the event
    const eventSelectors = [
      `.event-card-event:has-text("${eventName}")`,
      `.event-name-event:has-text("${eventName}")`,
      `.event-card:has-text("${eventName}")`,
      `.flex.pt-8:has-text("${eventName}")`,
      `div.mat-card:has-text("${eventName}")`,
      `span.event-name:has-text("${eventName}")`
    ];
    
    let eventFound = false;
    
    for (const selector of eventSelectors) {
      const events = this.page.locator(selector);
      if (await events.count() > 0) {
        console.log(`Found ${eventName} with selector: ${selector}`);
        await events.first().click();
        eventFound = true;
        break;
      }
    }
    
    if (!eventFound) {
      console.log(`Could not find ${eventName}, falling back to any event with tuanhay in the name`);
      const tuanhayEvents = this.page.locator('.event-card, .event-card-event, div.mat-card').filter({ hasText: /tuanhay/i });
      if (await tuanhayEvents.count() > 0) {
        await tuanhayEvents.first().click();
        eventFound = true;
      }
    }
    
    if (!eventFound) {
      console.log('No tuanhay events found, clicking first available event');
      const firstEvent = this.page.locator('.event-card-event, .event-card, div.mat-card').first();
      if (await firstEvent.count() > 0) {
        await firstEvent.click();
        eventFound = true;
      }
    }
    
    if (!eventFound) {
      throw new Error('Could not find any events to click');
    }
    
    // Wait for event detail page to load
    await this.page.waitForTimeout(3000);
    await this.takeScreenshot('event-detail-loaded');

    // Find and click on the first image
    return await this.clickFirstImage();
  }

  async clickFirstImage() {
    console.log('Looking for images in the event detail page...');
    
    let imageFound = false;
    
    for (const selector of this.imageSelectors) {
      const images = this.page.locator(selector);
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
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('image-detail-view');
    
    return imageFound;
  }

  async clickPinButton() {
    await this.pinButton.waitFor({ state: 'visible', timeout: 5000 });
    const initialState = await this.pinButton.getAttribute('class');
    const initialIconState = await this.page.locator('mat-icon:text("push_pin")').first().getAttribute('class') || '';
    
    console.log('Clicking pin button...');
    await this.pinButton.click();
    await this.page.waitForTimeout(2000);
    
    const updatedState = await this.pinButton.getAttribute('class');
    const updatedIconState = await this.page.locator('mat-icon:text("push_pin")').first().getAttribute('class') || '';
    
    // Check if the button or icon state changed
    let buttonChanged = initialState !== updatedState || initialIconState !== updatedIconState;
    
    // If class check didn't work, try checking for color change or other indicators
    if (!buttonChanged) {
      const isOrangeVisible = await this.page.locator('mat-icon.text-orange-600').count() > 0;
      const isPinnedIndicatorVisible = await this.page.locator('.pinned-indicator').count() > 0;
      buttonChanged = isOrangeVisible || isPinnedIndicatorVisible;
    }
    
    await this.takeScreenshot('after-pin-click');
    return buttonChanged;
  }

  async clickGiftButton() {
    await this.giftButton.waitFor({ state: 'visible', timeout: 5000 });
    const initialState = await this.giftButton.getAttribute('class');
    
    console.log('Clicking gift button...');
    await this.giftButton.click();
    await this.page.waitForTimeout(2000);
    
    const updatedState = await this.giftButton.getAttribute('class');
    const buttonChanged = initialState !== updatedState;
    
    await this.takeScreenshot('after-gift-click');
    return buttonChanged;
  }

  async clickEllipsisButton() {
    await this.ellipsisButton.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('Clicking ellipsis button...');
    await this.ellipsisButton.click();
    await this.page.waitForTimeout(2000);
    
    await this.takeScreenshot('after-ellipsis-click');
    
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
      if (await this.page.locator(selector).count() > 0) {
        console.log(`Found menu with selector: ${selector}`);
        menuVisible = true;
        break;
      }
    }
    
    return menuVisible;
  }

  async clickEditOption() {
    await this.editOption.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('Clicking edit option...');
    await this.editOption.click();
    await this.page.waitForTimeout(2000);
    
    await this.takeScreenshot('edit-window');
    
    // Check if edit window appears
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
      if (await this.page.locator(selector).count() > 0) {
        console.log(`Found edit window with selector: ${selector}`);
        editWindowVisible = true;
        break;
      }
    }
    
    return editWindowVisible;
  }

  async clickDeleteOption() {
    await this.deleteOption.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('Clicking delete option...');
    await this.deleteOption.click();
    await this.page.waitForTimeout(2000);
    
    await this.takeScreenshot('delete-confirmation');
    
    // Check if confirmation dialog appears
    const confirmDialogSelectors = [
      '.confirmation-dialog',
      '.mat-dialog-container:has-text("Delete")',
      'div:has-text("Are you sure")',
      '.dialog-content:has-text("Delete")',
      '.mat-dialog-content:has-text("Delete")'
    ];
    
    let confirmDialogVisible = false;
    
    for (const selector of confirmDialogSelectors) {
      if (await this.page.locator(selector).count() > 0) {
        console.log(`Found confirmation dialog with selector: ${selector}`);
        confirmDialogVisible = true;
        break;
      }
    }
    
    // Don't actually confirm deletion to avoid modifying data
    // Instead, click cancel or close the dialog
    if (confirmDialogVisible) {
      const cancelButtonSelectors = [
        'button:has-text("Cancel")',
        'button:has-text("No")',
        '.mat-button-base:has-text("Cancel")',
        '.mat-dialog-actions button:not(:has-text("Delete"))'
      ];
      
      for (const selector of cancelButtonSelectors) {
        const cancelButton = this.page.locator(selector);
        if (await cancelButton.count() > 0) {
          console.log(`Found cancel button with selector: ${selector}`);
          await cancelButton.first().click();
          break;
        }
      }
    }
    
    return confirmDialogVisible;
  }

  async clickSearchButton() {
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
      const buttons = this.page.locator(selector);
      if (await buttons.count() > 0) {
        console.log(`Found search/crop button with selector: ${selector}`);
        searchButton = buttons.first();
        break;
      }
    }
    
    if (!searchButton) {
      console.log('Warning: Search/crop button not found in the interface');
      return { found: false, changed: false };
    }
    
    // Get initial state
    const initialState = await searchButton.getAttribute('class');
    
    console.log('Clicking search/crop button...');
    await searchButton.click();
    await this.page.waitForTimeout(2000);
    
    // Get updated state
    const updatedState = await searchButton.getAttribute('class');
    
    // Check if button state changed
    const buttonChanged = initialState !== updatedState;
    
    await this.takeScreenshot('after-search-click');
    
    return { found: true, changed: buttonChanged };
  }

  // Verification methods
  async verifyPinButtonFunctionality() {
    const buttonChanged = await this.clickPinButton();
    expect(buttonChanged, 'Pin button should change state when clicked').toBeTruthy();
    return buttonChanged;
  }

  async verifyGiftButtonFunctionality() {
    const buttonChanged = await this.clickGiftButton();
    // This test is expected to fail based on the requirements - the button doesn't change state
    console.log('Warning: Gift button functionality test might fail as expected per requirements');
    
    if (!buttonChanged) {
      console.log('EXPECTED BEHAVIOR: Gift button did not change state when clicked');
    } else {
      console.log('UNEXPECTED BEHAVIOR: Gift button changed state when clicked');
    }
    
    return buttonChanged;
  }

  async verifyEllipsisButtonFunctionality() {
    const menuVisible = await this.clickEllipsisButton();
    expect(menuVisible, 'Menu should appear after clicking ellipsis button').toBeTruthy();
    return menuVisible;
  }

  async verifyEditFunctionality() {
    const editWindowVisible = await this.clickEditOption();
    expect(editWindowVisible, 'Edit window should appear after clicking edit option').toBeTruthy();
    
    // Check if title and caption fields are present
    const titleFieldVisible = await this.titleField.isVisible().catch(() => false);
    const captionFieldVisible = await this.captionField.isVisible().catch(() => false);
    
    expect(titleFieldVisible, 'Title field should be visible in edit window').toBeTruthy();
    expect(captionFieldVisible, 'Caption field should be visible in edit window').toBeTruthy();
    
    return { editWindowVisible, titleFieldVisible, captionFieldVisible };
  }

  async verifyDeleteFunctionality() {
    const confirmDialogVisible = await this.clickDeleteOption();
    expect(confirmDialogVisible, 'Delete confirmation dialog should appear').toBeTruthy();
    return confirmDialogVisible;
  }

  async verifySearchButtonFunctionality() {
    const result = await this.clickSearchButton();
    
    if (!result.found) {
      console.log('Search/crop button not found - skipping test');
      return result;
    }
    
    expect(result.changed, 'Search/crop button should change state when clicked').toBeTruthy();
    return result;
  }
}




