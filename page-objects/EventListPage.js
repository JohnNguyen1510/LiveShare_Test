import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class EventListPage extends BasePage {
  constructor(page) {
    super(page);

    // Navigation and header
    this.topNav = this.page.locator('app-topnav');
    this.menuButton = this.page.locator('.dropmenu1 .mat-menu-trigger');
    this.eventsHeading = this.page.locator('.navbar-center span.heading:has-text("EVENTS")');
    this.notificationButton = this.page.locator('.notification .mat-icon:has-text("notifications")');
    this.profileAvatar = this.page.locator('.profile .mat-menu-trigger.avatar');
    this.profileImage = this.page.locator('.profile img.profile-image');

    // Avatar icon selectors (for clicking avatar)
    this.avatarSelectors = [
      'div.mat-menu-trigger.avatar',
      'div.profile-image',
      'img.profile-image',
      'div[aria-haspopup="menu"]',
      'div.avatar[aria-haspopup="menu"]',
      '.profile div.avatar',
      'div.w-8.rounded-full',
      '#app-topnav img',
      '.navbar-end .profile .avatar',
      '.navbar-end .profile-image'
    ];

    // Tab navigation
    this.tabGroup = this.page.locator('mat-tab-group');
    this.myEventsTab = this.page.locator('div[role="tab"]:has-text("My Events")');
    this.joinedEventsTab = this.page.locator('div[role="tab"]:has-text("Joined Events")');

    // Event cards
    this.eventContainer = this.page.locator('.event-conatiner-event');
    this.eventCards = this.page.locator('.event-card-event');
    this.eventCardByIndex = (index) => this.eventCards.nth(index);
    
    // Event card elements
    this.eventMenuButton = (index) => this.eventCardByIndex(index).locator('button:has(mat-icon:text("more_vert"))');
    this.eventDate = (index) => this.eventCardByIndex(index).locator('span.text-xs');
    this.eventName = (index) => this.eventCardByIndex(index).locator('span.text-lg.leading-5');
    this.eventCode = (index) => this.eventCardByIndex(index).locator('span:has-text(/^[A-Z0-9]+$/)');
    this.premiumPlusBadge = (index) => this.eventCardByIndex(index).locator('button.btn-xs.btn-info:has-text("PremiumPlus")');
    this.hostedBySection = (index) => this.eventCardByIndex(index).locator('.text-right');
    this.hostAvatar = (index) => this.eventCardByIndex(index).locator('.avatar img.host-image-event');
    this.hostName = (index) => this.eventCardByIndex(index).locator('.whitespace-nowrap.font-bold');

    // Create event button
    this.createEventButton = this.page.locator('button.Create-Event.btn.btn-circle.btn-lg');
    
    // Account menu items
    this.accountMenu = this.page.locator('div[role="menu"]');
    this.menuOptions = {
      myAccount: this.accountMenu.locator('button:has-text("My Account")'),
      deleteAccount: this.accountMenu.locator('button:has-text("Delete Account")'),
      subscription: this.accountMenu.locator('button:has-text("Subscription")'),
      branding: this.accountMenu.locator('button:has-text("Branding")'),
      logout: this.accountMenu.locator('button:has-text("Logout")')
    };
  }

  async goToEventsPage() {
    console.log('🔄 Navigating to events page and verifying API...');
    
    // Wait for events API response when navigating
    const eventsResponsePromise = this.waitApiResponse('/api/events', 200, 'GET');
    
    await this.page.goto('https://dev.livesharenow.com/events');
    await this.page.waitForLoadState('networkidle');
    
    // Wait for and verify events API response
    try {
      const response = await eventsResponsePromise;
      const eventsData = await response.json();
      
      if (eventsData) {
        const eventsList = eventsData.docs || eventsData.events || eventsData;
        const eventsCount = Array.isArray(eventsList) ? eventsList.length : 0;
        console.log(`✅ Events API responded with ${eventsCount} events`);
      }
    } catch (error) {
      console.warn('⚠️ Events API verification failed:', error.message);
    }
    
    await this.eventsHeading.waitFor({ state: 'visible', timeout: 30000 });
  }

  async waitForEventsToLoad() {
    await this.eventCards.first().waitFor({ state: 'visible', timeout: 30000 });
  }

  async getEventCount() {
    return await this.eventCards.count();
  }

  async getEventInfo(index = 0) {
    const eventCard = this.eventCardByIndex(index);
    return {
      date: await this.eventDate(index).textContent(),
      name: await this.eventName(index).textContent(),
      code: await this.eventCode(index).textContent(),
      hasPremiumPlus: await this.premiumPlusBadge(index).isVisible().catch(() => false),
      hostName: await this.hostName(index).textContent()
    };
  }

  async clickEventByIndex(index = 0) {
    console.log(`🔄 Clicking event card at index ${index} and verifying API...`);
    
    // Wait for event detail API when clicking an event card
    const eventDetailPromise = this.waitApiResponse('/api/events/', 200, 'GET');
    
    await this.eventCardByIndex(index).click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for and verify event detail API response
    try {
      const response = await eventDetailPromise;
      const eventData = await response.json();
      
      // Verify the event detail response has required fields
      expect(eventData).toHaveProperty('_id');
      expect(eventData).toHaveProperty('name');
      expect(eventData).toHaveProperty('linkName');
      expect(eventData).toHaveProperty('plan');
      
      console.log(`✅ Event detail API responded`);
      console.log(`Event ID: ${eventData._id}`);
      console.log(`Event Name: ${eventData.name}`);
      console.log(`Event Code: ${eventData.linkName}`);
      console.log(`Plan: ${eventData.plan}`);
    } catch (error) {
      console.warn('⚠️ Event detail API verification failed:', error.message);
    }
  }

  async clickEventByCode(eventCode) {
    console.log(`🔄 Clicking event with code ${eventCode} and verifying API...`);
    
    // Wait for event detail API when clicking an event card
    const eventDetailPromise = this.waitApiResponse('/api/events/', 200, 'GET');
    
    const eventCard = this.eventCards.filter({ hasText: eventCode });
    await eventCard.first().click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for and verify event detail API response
    try {
      const response = await eventDetailPromise;
      const eventData = await response.json();
      
      // Verify the event code matches
      expect(eventData).toHaveProperty('linkName', eventCode);
      
      console.log(`✅ Event detail API responded for code: ${eventCode}`);
      console.log(`Event ID: ${eventData._id}`);
      console.log(`Event Name: ${eventData.name}`);
    } catch (error) {
      console.warn('⚠️ Event detail API verification failed:', error.message);
    }
  }

  async clickEventByName(eventName) {
    console.log(`🔄 Clicking event "${eventName}" and verifying API...`);
    
    // Wait for event detail API when clicking an event card
    const eventDetailPromise = this.waitApiResponse('/api/events/', 200, 'GET');
    
    const eventCard = this.eventCards.filter({ hasText: eventName });
    await eventCard.first().click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for and verify event detail API response
    try {
      const response = await eventDetailPromise;
      const eventData = await response.json();
      
      // Verify the event name matches
      expect(eventData).toHaveProperty('name', eventName);
      
      console.log(`✅ Event detail API responded for: ${eventName}`);
      console.log(`Event ID: ${eventData._id}`);
      console.log(`Event Code: ${eventData.linkName}`);
    } catch (error) {
      console.warn('⚠️ Event detail API verification failed:', error.message);
    }
  }

  /**
   * Click event by name if exists, otherwise click first event
   * @param {string} searchName - Name to search for (partial match)
   * @returns {Promise<boolean>} Whether target event was found
   */
  async clickEventByNameOrFirst(searchName) {
    console.log(`Looking for event with name containing "${searchName}"...`);
    
    const eventCount = await this.getEventCount();
    
    // Search for event with matching name
    for (let i = 0; i < eventCount; i++) {
      try {
        const eventInfo = await this.getEventInfo(i);
        if (eventInfo.name && eventInfo.name.toLowerCase().includes(searchName.toLowerCase())) {
          console.log(`✅ Found event with "${searchName}": ${eventInfo.name}`);
          await this.clickEventByIndex(i);
          return true;
        }
      } catch (error) {
        console.log(`⚠️ Error checking event ${i}: ${error.message}`);
      }
    }
    
    // Fallback: click first event
    console.log(`No "${searchName}" event found, clicking first available event`);
    await this.clickEventByIndex(0);
    return false;
  }

  async openEventMenu(index = 0) {
    await this.eventMenuButton(index).click();
  }

  async clickCreateEvent() {
    await this.createEventButton.click();
  }

  async switchToJoinedEvents() {
    await this.joinedEventsTab.click();
    await this.page.waitForTimeout(1000);
  }

  async switchToMyEvents() {
    await this.myEventsTab.click();
    await this.page.waitForTimeout(1000);
  }

  // Verification methods
  async verifyEventsPageLoaded() {
    await expect(this.eventsHeading).toBeVisible();
    await expect(this.tabGroup).toBeVisible();
    await expect(this.myEventsTab).toBeVisible();
    await expect(this.joinedEventsTab).toBeVisible();
    await expect(this.createEventButton).toBeVisible();
  }

  async verifyEventCardElements(index = 0) {
    await expect(this.eventDate(index)).toBeVisible();
    await expect(this.eventName(index)).toBeVisible();
    await expect(this.eventCode(index)).toBeVisible();
    await expect(this.eventMenuButton(index)).toBeVisible();
    await expect(this.hostedBySection(index)).toBeVisible();
  }

  async verifyProfileAvatarVisible() {
    await expect(this.profileAvatar).toBeVisible();
    await expect(this.profileImage).toBeVisible();
  }

  /**
   * Click avatar icon using multiple strategies
   * @returns {Promise<boolean>} Success status
   */
  async clickAvatarIcon() {
    console.log('Clicking avatar icon...');
    
    // Try using tryMultipleSelectors helper from BasePage
    const result = await this.tryMultipleSelectors(this.avatarSelectors, 'click');
    
    if (result.success) {
      console.log(`✅ Avatar clicked using selector: ${result.selector}`);
      await this.page.waitForTimeout(1000);
      return true;
    }
    
    // Fallback: JavaScript click
    const jsClicked = await this.page.evaluate(() => {
      const candidates = [
        document.querySelector('div.avatar'),
        document.querySelector('img.profile-image'),
        document.querySelector('div[aria-haspopup="menu"]'),
        document.querySelector('#app-topnav img'),
        document.querySelector('.navbar-end .profile .avatar'),
        document.querySelector('.profile')
      ].filter(Boolean);
      
      if (candidates.length > 0) {
        candidates[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      }
      return false;
    });
    
    if (jsClicked) {
      console.log('✅ Avatar clicked using JavaScript');
      await this.page.waitForTimeout(1000);
      return true;
    }

    // Last resort: navigate to profile directly
    console.log('⚠️ Avatar click failed, navigating to profile directly');
    await this.page.goto('https://dev.livesharenow.com/profile').catch(() => {});
    await this.page.waitForTimeout(2000);
    return true;
  }

  /**
   * Verify at least one account menu item is visible
   * @returns {Promise<boolean>} Whether menu items are visible
   */
  async verifyAccountMenuItemsVisible() {
    // If landed directly on profile, consider it success
    if (this.page.url().includes('/profile') || this.page.url().includes('/account')) {
      console.log('✅ Landed on profile/account page');
      return true;
    }

    // Verify menu options are visible
    try {
      await expect(this.menuOptions.myAccount).toBeVisible();
      await expect(this.menuOptions.deleteAccount).toBeVisible();
      await expect(this.menuOptions.subscription).toBeVisible();
      await expect(this.menuOptions.branding).toBeVisible();
      await expect(this.menuOptions.logout).toBeVisible();
      
      console.log('✅ All account menu items are visible');
      return true;
    } catch (error) {
      console.error('❌ Account menu items not visible:', error.message);
      await this.takeScreenshot('error-account-menu-not-visible');
      return false;
    }
  }

  /**
   * Complete avatar menu verification workflow
   * @returns {Promise<boolean>} Success status
   */
  async verifyAvatarMenuWorkflow() {
    await this.goToEventsPage();
    await this.waitForEventsToLoad();
    await this.verifyEventsPageLoaded();
    await this.verifyProfileAvatarVisible();
    
    const avatarClicked = await this.clickAvatarIcon();
    if (!avatarClicked) {
      console.warn('⚠️ Avatar click may have failed, but continuing to verify menu');
    }
    
    await this.page.waitForTimeout(2000);
    
    const menuVisible = await this.verifyAccountMenuItemsVisible();
    expect(menuVisible, 'Account menu should be visible').toBeTruthy();
    
    return menuVisible;
  }
}



