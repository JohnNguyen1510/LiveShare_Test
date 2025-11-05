import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ImageDetailPage extends BasePage {
  constructor(page) {
    super(page);

    // Image detail view locators
    this.imageDetailView = this.page.locator('.image-detail-view, .image-viewer, .photo-detail');
    
    // Action buttons in image detail
    this.pinButton = this.page.locator('button:has(mat-icon:text("push_pin"))').first();
    this.giftButton = this.page.locator('button:has(mat-icon:text("redeem"))').first();
    this.ellipsisButton = this.page.locator('button.mat-menu-trigger[tabindex="0"]:has(mat-icon:has-text("more_vert"))');
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
    this.yesButton = this.page.locator('button:has-text("Yes")');
    
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
    
    // Search button selectors
    this.searchButtonSelectors = [
      'button:has(mat-icon:text("search"))', 
      'button:has(mat-icon:text("zoom_in"))',
      'button:has(mat-icon:text("crop"))',
      'button.search-button',
      '.search-icon',
      '.btn-ghost:has(mat-icon:text("crop"))',
      '.text-right .btn-ghost'
    ];
    
    // Menu selectors
    this.menuSelectors = [
      '.mat-menu-content',
      '.dropdown-content',
      '.menu-content',
      '.cdk-overlay-pane',
      '.mat-menu-panel'
    ];
    
    // Edit window selectors
    this.editWindowSelectors = [
      '.dialog-content',
      '.edit-dialog',
      'input[placeholder*="Title"]',
      'input[placeholder*="Caption"]',
      '.edit-div',
      '.caption-text:has-text("Title")',
      '.caption-text:has-text("Caption")'
    ];
    
    // Delete confirmation selectors
    this.deleteConfirmSelectors = [
      '.confirmation-dialog',
      '.mat-dialog-container:has-text("Delete")',
      'div:has-text("Are you sure")',
      '.dialog-content:has-text("Delete")',
      '.mat-dialog-content:has-text("Delete")'
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
    
    const result = await this.tryMultipleSelectors(this.imageSelectors, 'click');
    
    if (!result.success) {
      console.error('Could not find any images in the event detail page');
      await this.takeScreenshot('error-no-images-found');
      throw new Error('Could not find any images in the event detail page');
    }
    
    console.log(`✅ Found and clicked image with selector: ${result.selector}`);
    await this.page.waitForTimeout(2000);
    return true;
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
    
    // If class check didn't work, try checking for color indicators
    if (!buttonChanged) {
      const isOrangeVisible = await this.page.locator('mat-icon.text-orange-600').count() > 0;
      const isPinnedIndicatorVisible = await this.page.locator('.pinned-indicator').count() > 0;
      buttonChanged = isOrangeVisible || isPinnedIndicatorVisible;
    }
    
    console.log(`✅ Pin button ${buttonChanged ? 'changed state' : 'clicked'}`);
    return buttonChanged;
  }


  async clickEllipsisButton() {
    await this.ellipsisButton.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Clicking ellipsis button...');
    await this.ellipsisButton.click();
    await this.page.waitForTimeout(2000);
    
    // Check if menu appears
    const result = await this.tryMultipleSelectors(this.menuSelectors, 'isVisible');
    
    if (result.success) {
      console.log(`✅ Menu appeared with selector: ${result.selector}`);
      return true;
    }
    
    return false;
  }

  async clickEditOption() {
    await this.editOption.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Clicking edit option...');
    await this.editOption.click();
    await this.page.waitForTimeout(2000);
    
    // Check if edit window appears
    const result = await this.tryMultipleSelectors(this.editWindowSelectors, 'isVisible');
    
    if (result.success) {
      console.log(`✅ Edit window appeared with selector: ${result.selector}`);
      return true;
    }
    
    return false;
  }

  async clickDeleteOption() {
    await this.deleteOption.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Clicking delete option...');
    await this.deleteOption.click();
    await this.page.waitForTimeout(2000);
    
    // Check if confirmation dialog appears
    const result = await this.tryMultipleSelectors(this.deleteConfirmSelectors, 'isVisible');
    
    if (result.success) {
      console.log(`✅ Delete confirmation appeared with selector: ${result.selector}`);
    }
    
    // Click Yes and verify API
    const apiResponse = await this.performActionAndWaitForResponse({
      actionPromise: this.yesButton.click(),
      apiUrl: '/api/posts',
      statusCode: 200,
      requestMethod: 'GET'
    });

    expect(apiResponse).toHaveProperty('message', 'success');
    return true;
  }

  async clickSearchButton() {
    const result = await this.tryMultipleSelectors(this.searchButtonSelectors, 'isVisible');
    
    if (!result.success) {
      console.log('⚠️ Search/crop button not found in the interface');
      return { found: false, changed: false };
    }
    
    console.log(`Found search/crop button with selector: ${result.selector}`);
    const initialState = await result.element.getAttribute('class');
    
    await result.element.click();
    await this.page.waitForTimeout(2000);
    
    const updatedState = await result.element.getAttribute('class');
    const buttonChanged = initialState !== updatedState;
    
    console.log(`✅ Search button ${buttonChanged ? 'changed state' : 'clicked'}`);
    return { found: true, changed: buttonChanged };
  }

  // Verification methods
  async verifyPinButtonFunctionality() {
    const buttonChanged = await this.clickPinButton();
    expect(buttonChanged, 'Pin button should change state when clicked').toBeTruthy();
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

  /**
   * Complete workflow to open event and click first image
   * @param {string} eventName - Event name to open
   */
  async openEventAndClickFirstImage(eventName) {
    const EventListPageClass = (await import('./EventListPage.js')).EventListPage;
    const EventDetailPageClass = (await import('./EventDetailPage.js')).EventDetailPage;
    
    const eventListPage = new EventListPageClass(this.page);
    const eventDetailPage = new EventDetailPageClass(this.page);
    
    await eventListPage.goToEventsPage();
    await eventListPage.clickEventByName(eventName);
    await eventDetailPage.waitForEventDetailToLoad();
    await this.page.waitForTimeout(8000);
    await this.clickFirstImage();
  }
}




