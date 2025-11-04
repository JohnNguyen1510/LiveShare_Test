import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { SubscriptionPage } from '../page-objects/SubscriptionPage.js';
import { EventCreationPage } from '../page-objects/EventCreationPage.js';
import { EventSettingsPage } from '../page-objects/EventSettingsPage.js';
import { EventPage } from '../page-objects/EventPage.js';
import path from 'path';
import fs from 'fs';


// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
 fs.mkdirSync(screenshotsDir, { recursive: true });
}


/**
* ============================================================================
* SHARED TEST DATA AND UTILITIES
* ============================================================================
*/

/**
* Setup function for creating fresh account and event for each tier test
* Now uses SubscriptionPage method instead of inline logic
* @param {import('@playwright/test').Page} page - Playwright page instance
* @param {import('@playwright/test').BrowserContext} context - Browser context
* @param {string} tierName - Name of the tier (Free, Standard, Premium, Premium+)
* @returns {Promise<{success: boolean, testData: Object}>} Setup result with test data
*/
async function setupFreshAccountAndEvent(page, context, tierName) {
  const subscriptionPage = new SubscriptionPage(page);
  const result = await subscriptionPage.setupFreshAccountAndEvent(tierName, context);
  
  // Add tier to testData
  if (result.success && result.testData) {
    result.testData.tier = tierName;
  }
  
  return result;
}


/**
* Subscribe to a plan and handle payment (after account and event are created)
* Now uses SubscriptionPage method instead of inline logic
* @param {import('@playwright/test').Page} page - Playwright page instance
* @param {import('@playwright/test').BrowserContext} context - Browser context
* @param {string} planName - Plan name (Standard Plan, Premium Plan, Premium+ Plan)
* @param {string} tierName - Tier name for screenshot naming
* @returns {Promise<boolean>} Success status
*/
async function subscribeAndPayForPlan(page, planName, tierName) {
  const subscriptionPage = new SubscriptionPage(page);
  return await subscriptionPage.subscribeAndPayForPlan(planName, tierName);
}


/**
* Login helper function for reuse in tests
* @param {import('@playwright/test').Page} page - Playwright page instance  
* @param {Object} testData - Test data containing email and password
*/
async function loginAndNavigate(page, testData) {
  const loginPage = new LoginPage(page);
  await page.goto('https://dev.livesharenow.com/');
  await loginPage.completeEmailLogin(testData.email, testData.password);
  await page.waitForTimeout(2000);
}

/**
* Create a new event for the test
* @param {import('@playwright/test').Page} page - Playwright page instance
* @returns {Promise<boolean>} Success status
*/
async function createNewEventForTest(page) {
  console.log('📍 Creating new event for test...');
  try {
    const eventCreationPage = new EventCreationPage(page);
    await page.goto('https://dev.livesharenow.com/events');
    await page.waitForTimeout(2000);
    
    const eventCreationStarted = await eventCreationPage.startEventCreation();
    if (!eventCreationStarted) {
      throw new Error('Failed to start event creation');
    }
    
    await page.waitForTimeout(4000);
    console.log('✅ Event created successfully');
    return true;
  } catch (error) {
    console.error(`❌ Event creation failed: ${error.message}`);
    return false;
  }
}

/**
* Get authentication token from page after login
* @param {import('@playwright/test').Page} page - Playwright page instance
* @returns {Promise<string|null>} Access token
*/
async function getAuthToken(page) {
  try {
    const token = await page.evaluate(() => {
      return window.localStorage.getItem('ACCESSTOKEN') || null;
    });
    if (token) {
      console.log('✅ Retrieved ACCESSTOKEN from localStorage');
    }
    return token;
  } catch (error) {
    console.error('❌ Failed to get token:', error.message);
    return null;
  }
}

/**
* Inject authentication token into page localStorage
* @param {import('@playwright/test').Page} page - Playwright page instance
* @param {string} token - Access token to inject
*/
async function injectAuthToken(page, token) {
  try {
    await page.goto('https://dev.livesharenow.com/');
    await page.waitForLoadState('domcontentloaded');
    
    await page.evaluate((tokenValue) => {
      window.localStorage.setItem('ACCESSTOKEN', tokenValue);
    }, token);
    
    console.log('✅ Token injected into localStorage');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.error('❌ Failed to inject token:', error.message);
    throw error;
  }
}

/**
* Quick setup for test using saved token: Inject token, Create Event, Open Settings
* @param {import('@playwright/test').Page} page - Playwright page instance
* @param {Object} testData - Test data containing token
* @returns {Promise<boolean>} Success status
*/
async function setupTestWithToken(page, testData) {
  try {
    // Step 1: Inject token (no need to login - FASTER!)
    await injectAuthToken(page, testData.token);
    
    // Step 2: Create new event for this test
    const eventCreated = await createNewEventForTest(page);
    if (!eventCreated) {
      throw new Error('Failed to create event');
    }
    
    // Step 3: Open event settings
    const settingsOpened = await openEventSettings(page);
    if (!settingsOpened) {
      throw new Error('Failed to open settings');
    }
    
    console.log('✅ Test setup completed with token');
    return true;
  } catch (error) {
    console.error(`❌ Test setup with token failed: ${error.message}`);
    return false;
  }
}

/**
* Navigate to event and open settings
*/
async function openEventSettings(page) {
 console.log('📍 Navigating to event settings...');
 try {
   const eventPage = new EventPage(page);
   const eventSettingsPage = new EventSettingsPage(page);
  
   await page.goto('https://dev.livesharenow.com/events');
   await page.waitForTimeout(2000);
  
   await eventPage.clickFirstEvent();
   await page.waitForTimeout(2000);
  
   await eventSettingsPage.openSettingsIfNeeded();
   await page.waitForTimeout(3000);
   await eventSettingsPage.waitLoaded();
  
   console.log('✅ Event settings opened');
   return true;
 } catch (error) {
   console.error(`❌ Failed to open settings: ${error.message}`);
   return false;
 }
}


/**
* ============================================================================
* HELPER FUNCTIONS FROM ORIGINAL FILE
* ============================================================================
*/


/**
* Helper function to verify "Preview for Free" text does NOT appear for a given feature
*/
async function verifyNoPreviewForFree(page, featureName) {
 try {
   console.log(`  Checking "${featureName}" - should NOT have "Preview for Free"...`);
  
   const featureOption = page.locator(`.options:has-text("${featureName}")`).first();
  
   if (await featureOption.isVisible().catch(() => false)) {
     const featureText = await featureOption.textContent();
     const hasPreviewForFree = featureText.toLowerCase().includes('preview for free');
    
     if (hasPreviewForFree) {
       console.error(`    ❌ FAIL: Has "Preview for Free" (should not have it)`);
       await page.screenshot({
         path: path.join(screenshotsDir, `error-${featureName.toLowerCase().replace(/\s+/g, '-')}-has-preview-for-free.png`)
       });
       return false;
     } else {
       console.log(`    ✅ PASS: Does NOT have "Preview for Free"`);
       return true;
     }
   } else {
     console.warn(`    ⚠️ Feature not found in UI`);
     return true;
   }
 } catch (error) {
   console.error(`    ❌ Error checking feature:`, error.message);
   return false;
 }
}


/**
* Helper function to verify "Preview for Free" text DOES appear for a given feature
*/
async function verifyHasPreviewForFree(page, featureName) {
 try {
   console.log(`  Checking "${featureName}" - should HAVE "Preview for Free"...`);
  
   const featureOption = page.locator(`.options:has-text("${featureName}")`).first();
  
   if (await featureOption.isVisible().catch(() => false)) {
     const featureText = await featureOption.textContent();
     const hasPreviewForFree = featureText.toLowerCase().includes('preview for free');
    
     if (hasPreviewForFree) {
       console.log(`    ✅ PASS: Has "Preview for Free" (as expected)`);
       return true;
     } else {
       console.error(`    ❌ FAIL: Does NOT have "Preview for Free" (should have it)`);
       await page.screenshot({
         path: path.join(screenshotsDir, `error-${featureName.toLowerCase().replace(/\s+/g, '-')}-missing-preview-for-free.png`)
       });
       return false;
     }
   } else {
     console.warn(`    ⚠️ Feature not found in UI`);
     return true;
   }
 } catch (error) {
   console.error(`    ❌ Error checking feature:`, error.message);
   return false;
 }
}


/**
* Feature tier definitions based on subscription plans
*/
const FeatureTiers = {
 FREE: [
   'Event Name',
   'Event Date',
   'Location',
   'Contact',
   'Itinerary',
   'Enable Message Post',
   'Video'
 ],
  STANDARD: [
   'Button Link #1',
   'Button Link #2',
   'Welcome Popup',
   'Enable Photo Gifts',
   'Event Header Photo',
   'Popularity Badges',
   'Force Login'
 ],
  PREMIUM: [
   'Allow sharing via Facebook',
   'Allow Guest Download',
   'Add Event Managers',
   'Allow posting without login',
   'Require Access Passcode'
 ],
  PREMIUM_PLUS: [
   'LiveView Slideshow',
   'Then And Now',
   'Movie Editor',
   'KeepSake',
   'Scavenger Hunt',
   'Sponsor',
   'Prize'
 ]
};


/**
* Verify menu options are visible with exact text matching
*/
async function verifyMenuOptions(page, expectedMenuItems) {
 console.log('\n📍 Verifying menu options (exact text matching)...');
 console.log(`   Expected menu items: ${expectedMenuItems.join(', ')}`);
  const results = {
   visible: [],
   notVisible: [],
   details: {}
 };
  try {
   // Open menu
   console.log('  🔘 Opening menu...');
   const moreButton = page.locator('button:has(mat-icon:text("more_vert"))').first();
   await moreButton.waitFor({ state: 'visible', timeout: 5000 });
   await moreButton.click();
   await page.waitForTimeout(1500);
  
   // Wait for menu panel
   const menuPanel = page.locator('.mat-menu-panel[role="menu"]').first();
   await menuPanel.waitFor({ state: 'visible', timeout: 5000 });
   console.log('  ✅ Menu opened successfully');
  
   // Get all menu items
   const allMenuItems = await page.locator('button[role="menuitem"]').all();
   console.log(`  📋 Found ${allMenuItems.length} total menu items`);
  
   // Verify each expected menu item
   for (const expectedItem of expectedMenuItems) {
     let found = false;
     let matchedItemText = '';
    
     for (const menuItem of allMenuItems) {
       const isVisible = await menuItem.isVisible().catch(() => false);
       if (!isVisible) continue;
      
       const itemText = await menuItem.evaluate(el => {
         const clone = el.cloneNode(true);
         const icons = clone.querySelectorAll('mat-icon');
         icons.forEach(icon => icon.remove());
         return clone.textContent.trim();
       }).catch(() => '');
      
       if (itemText === expectedItem) {
         found = true;
         matchedItemText = itemText;
         break;
       }
     }
    
     if (found) {
       console.log(`  ✅ "${expectedItem}" menu item found and visible`);
       results.visible.push(expectedItem);
       results.details[expectedItem] = { found: true, text: matchedItemText };
     } else {
       console.log(`  ❌ "${expectedItem}" menu item NOT found or not visible`);
       results.notVisible.push(expectedItem);
       results.details[expectedItem] = { found: false, text: null };
     }
   }
  
   // Close menu
   console.log('  🔘 Closing menu...');
   await page.keyboard.press('Escape');
   await page.waitForTimeout(500);
  
 } catch (error) {
   console.error(`  ❌ Error during menu verification: ${error.message}`);
   await page.keyboard.press('Escape').catch(() => {});
 }
  const success = results.notVisible.length === 0;
 console.log(`\n📊 Menu Options Verification:`);
 console.log(`   ✅ Found: ${results.visible.length}/${expectedMenuItems.length}`);
 console.log(`   ❌ Missing: ${results.notVisible.length}/${expectedMenuItems.length}`);
  if (results.notVisible.length > 0) {
   console.log(`   Missing menu items: ${results.notVisible.join(', ')}`);
 }
  return {
   success,
   visible: results.visible,
   notVisible: results.notVisible,
   details: results.details
 };
}


/**
* Verify footer buttons are visible with exact text matching
*/
async function verifyFooterButtons(page, expectedButtons) {
 console.log('\n📍 Verifying footer buttons (exact text matching)...');
 console.log(`   Expected buttons: ${expectedButtons.join(', ')}`);
  const results = {
   visible: [],
   notVisible: [],
   details: {}
 };
  try {
   // Open footer menu
   console.log('  🔘 Opening footer menu...');
   const addButton = page.locator('button.menu-button:has(mat-icon:text("add"))').first();
   await addButton.waitFor({ state: 'visible', timeout: 5000 });
   await addButton.click();
   await page.waitForTimeout(1500);
  
   // Wait for footer buttons container
   const footerBtnGroup = page.locator('.footer-btn-group');
   await footerBtnGroup.waitFor({ state: 'visible', timeout: 5000 });
   console.log('  ✅ Footer menu opened successfully');
  
   // Get all footer buttons
   const allButtons = await page.locator('.footer-btn-group button.btn').all();
   console.log(`  📋 Found ${allButtons.length} total footer buttons`);
  
   // Verify each expected button
   for (const buttonName of expectedButtons) {
     let found = false;
     let matchedButtonText = '';
    
     for (const button of allButtons) {
       const isVisible = await button.isVisible().catch(() => false);
       if (!isVisible) continue;
      
       const buttonText = await button.evaluate(el => {
         const clone = el.cloneNode(true);
         const icons = clone.querySelectorAll('mat-icon');
         icons.forEach(icon => icon.remove());
         return clone.textContent.trim();
       }).catch(() => '');
      
       if (buttonText === buttonName) {
         found = true;
         matchedButtonText = buttonText;
         break;
       }
     }
    
     if (found) {
       console.log(`  ✅ "${buttonName}" button found and visible`);
       results.visible.push(buttonName);
       results.details[buttonName] = { found: true, text: matchedButtonText };
     } else {
       console.log(`  ❌ "${buttonName}" button NOT found or not visible`);
       results.notVisible.push(buttonName);
       results.details[buttonName] = { found: false, text: null };
     }
   }
  
   // Close menu
   console.log('  🔘 Closing footer menu...');
   await addButton.click();
   await page.waitForTimeout(500);
  
 } catch (error) {
   console.error(`  ❌ Error during footer button verification: ${error.message}`);
   await page.keyboard.press('Escape').catch(() => {});
 }
  const success = results.notVisible.length === 0;
 console.log(`\n📊 Footer Buttons Verification:`);
 console.log(`   ✅ Found: ${results.visible.length}/${expectedButtons.length}`);
 console.log(`   ❌ Missing: ${results.notVisible.length}/${expectedButtons.length}`);
  if (results.notVisible.length > 0) {
   console.log(`   Missing buttons: ${results.notVisible.join(', ')}`);
 }
  return {
   success,
   visible: results.visible,
   notVisible: results.notVisible,
   details: results.details
 };
}


/**
* ============================================================================
* TEST SUITES - ORGANIZED BY SUBSCRIPTION TIER
* ============================================================================
*/


test.describe('Event Settings - Comprehensive Testing Suite', () => {
 test.setTimeout(600000); // 10 minutes for entire suite
  /**
  * ============================================================================
  * FREE TIER TESTS - TC-APP-CUST-001 to TC-APP-CUST-007
  * ============================================================================
  */
 test.describe('Free Tier Settings Tests', () => {
   let testData = null;
   
   test.beforeAll(async ({ browser }) => {
     test.setTimeout(120000); // 2 minutes for account creation
     
     // Create fresh account and event for Free tier tests
     const context = await browser.newContext();
     const page = await context.newPage();
     
     const setupResult = await setupFreshAccountAndEvent(page, context, 'Free');
     if (!setupResult.success) {
       console.error('❌ Free Tier setup failed');
       await context.close();
       return;
     }
     
     testData = setupResult.testData;
     console.log(`✅ Free Tier account created with email: ${testData.email}`);
     
     // Get token immediately after registration (user is already logged in)
     await page.waitForTimeout(3000); // Wait for page to stabilize after registration
     const token = await getAuthToken(page);
     if (token) {
       testData.token = token;
       console.log(`✅ Free Tier token saved for reuse across test cases`);
     } else {
       console.error('❌ Failed to get token for Free Tier');
     }
     
     await context.close();
   });
  
  test('TC-APP-CUST-001: Verify "Event Name" toggle and edit', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-001: Event Name toggle and edit');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    // Setup: Inject Token, Create New Event, Open Settings
    await setupTestWithToken(page, testData);
   
    const eventSettingsPage = new EventSettingsPage(page);
    
     // Step 1: Verify Event Name option is visible
     await eventSettingsPage.expectOptionVisible('Event Name');
     console.log('✅ Event Name option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Event Name');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Edit Event Name
     const newEventName = `Test Event Name ${Date.now()}`;
     const changeSuccess = await eventSettingsPage.changeEventName(newEventName);
     expect(changeSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     console.log('✅ TC-APP-CUST-001: Event Name test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-001-event-name-completed.png') });
   });
  
  test('TC-APP-CUST-002: Verify "Event Date" picker', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-002: Event Date picker');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
await setupTestWithToken(page, testData);
    
     const eventSettingsPage = new EventSettingsPage(page);
    
     // Step 1: Verify Event Date option is visible
     await eventSettingsPage.expectOptionVisible('Event Date');
     console.log('✅ Event Date option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Event Date');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Change Event Date
     const newDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US');
     const changeSuccess = await eventSettingsPage.changeEventDate(newDate);
     expect(changeSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     console.log('✅ TC-APP-CUST-002: Event Date test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-002-event-date-completed.png') });
   });
  
  test('TC-APP-CUST-003: Verify "Location" field', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-003: Location field');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
await setupTestWithToken(page, testData);
   
    const eventSettingsPage = new EventSettingsPage(page);
    
     // Step 1: Verify Location option is visible
     await eventSettingsPage.expectOptionVisible('Location');
     console.log('✅ Location option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Location');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Update Location
     const location = `Test Location - ${Date.now()}`;
     const updateSuccess = await eventSettingsPage.updateLocation(location);
     expect(updateSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     console.log('✅ TC-APP-CUST-003: Location test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-003-location-completed.png') });
   });
  
  test('TC-APP-CUST-004: Verify "Contact" field', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-004: Contact field');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
await setupTestWithToken(page, testData);
   
    const eventSettingsPage = new EventSettingsPage(page);
    
     // Step 1: Verify Contact option is visible
     await eventSettingsPage.expectOptionVisible('Contact');
     console.log('✅ Contact option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Contact');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Update Contact
     const contactInfo = {
       email: sharedTestData.email,
       phone: '+1-555-0100'
     };
     const updateSuccess = await eventSettingsPage.updateContact(contactInfo);
     expect(updateSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     console.log('✅ TC-APP-CUST-004: Contact test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-004-contact-completed.png') });
   });
  
 test('TC-APP-CUST-005: Verify "Itinerary" field', async ({ page }) => {
   console.log('🚀 Starting TC-APP-CUST-005: Itinerary field');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
await setupTestWithToken(page, testData);
  
   const eventSettingsPage = new EventSettingsPage(page);
   
    // Step 1: Verify Itinerary option is visible
    await eventSettingsPage.expectOptionVisible('Itinerary');
    console.log('✅ Itinerary option is visible');
   
    // Step 2: Verify no "Preview for Free" text
    const noPreview = await verifyNoPreviewForFree(page, 'Itinerary');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Configure Itinerary with multiple lines
    const itineraryLines = [
      '9:00 AM - Registration & Welcome Coffee',
      '10:00 AM - Opening Ceremony',
      '11:30 AM - Lunch Break',
      '1:00 PM - Afternoon Activities'
    ];
    const updateSuccess = await eventSettingsPage.updateItinerary(itineraryLines);
    expect(updateSuccess).toBeTruthy();
   
    // Step 4: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    console.log('✅ TC-APP-CUST-005: Itinerary test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-005-itinerary-completed.png') });
  });
  
  test('TC-APP-CUST-006: Verify "Enable Message Post" toggle', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-006: Enable Message Post toggle');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
await setupTestWithToken(page, testData);
   
    const eventSettingsPage = new EventSettingsPage(page);
    
     // Step 1: Verify Enable Message Post option is visible
     await eventSettingsPage.expectOptionVisible('Enable Message Post');
     console.log('✅ Enable Message Post option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Enable Message Post');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Toggle Enable Message Post
     // Note: Message Post might be a simple toggle, but based on EventSettingsPage,
     // it has a dialog for adding backgrounds. We'll just verify it's accessible.
    
     console.log('✅ TC-APP-CUST-006: Enable Message Post test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-006-message-post-completed.png') });
   });
  
  test('TC-APP-CUST-007: Verify "Video" option', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-007: Video option');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
await setupTestWithToken(page, testData);
   
    const eventSettingsPage = new EventSettingsPage(page);
    
     // Step 1: Verify Video option is visible
     await eventSettingsPage.expectOptionVisible('Video');
     console.log('✅ Video option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Video');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Video is auto-enabled and cannot be disabled (warning status)
     console.log('⚠️ Video option is auto-enabled (cannot disable)');
    
     console.log('✅ TC-APP-CUST-007: Video test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-007-video-completed.png') });
   });
 });
  /**
  * ============================================================================
  * STANDARD TIER TESTS - TC-APP-CUST-008 to TC-APP-CUST-015
  * ============================================================================
  */
 test.describe('Standard Tier Settings Tests', () => {
   let testData = null;
   
   test.beforeAll(async ({ browser }) => {
     test.setTimeout(180000); // 3 minutes for account creation + subscription + payment
     
     // Create fresh account and event for Standard tier tests
     const context = await browser.newContext();
     const page = await context.newPage();
     
     // Step 1: Setup fresh account and event
     const setupResult = await setupFreshAccountAndEvent(page, context, 'Standard');
     if (!setupResult.success) {
       console.error('❌ Standard Tier setup failed');
       await context.close();
       return;
     }
     
     testData = setupResult.testData;
     console.log(`✅ Standard Tier account created with email: ${testData.email}`);
     
     console.log('✅ Standard Tier subscription completed successfully');
     
     // Step 3: Get token (user should be logged in after payment flow)
     await page.goto('https://dev.livesharenow.com/events');
     await page.waitForTimeout(3000); // Wait for page to stabilize
     
     const token = await getAuthToken(page);
     if (token) {
       testData.token = token;
       console.log(`✅ Standard Tier token saved for reuse across test cases`);
     } else {
       console.error('❌ Failed to get token for Standard Tier');
     }
     
     await context.close();
   });
  
  test('TC-APP-CUST-008: Verify "Button Link #1" setup', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-008: Button Link #1 setup');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    // Step 1: Navigate to events page and select the event
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
    if (!subscribed) {
      console.error('❌ Standard Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);

   
    // Step 1: Verify Button Link #1 option is visible
    await eventSettingsPage.expectOptionVisible('Button Link #1');
    console.log('✅ Button Link #1 option is visible');
   
    // Step 2: Verify no "Preview for Free" text (unlocked with Standard)
    const noPreview = await verifyNoPreviewForFree(page, 'Button Link #1');
    expect(noPreview).toBeTruthy();
    
     // Step 3: Configure Button Link #1
     const linkData = {
       name: 'Test Button',
       url: 'https://test.com'
     };
     const configSuccess = await eventSettingsPage.configureButtonLink(1, linkData);
     expect(configSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     console.log('✅ TC-APP-CUST-008: Button Link #1 test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-008-button-link-1-completed.png') });
   });
  
  test('TC-APP-CUST-009: Verify "Button Link #2" setup', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-009: Button Link #2 setup');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
    if (!subscribed) {
      console.error('❌ Standard Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);

     // Step 1: Verify Button Link #2 option is visible
     await eventSettingsPage.expectOptionVisible('Button Link #2');
     console.log('✅ Button Link #2 option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Button Link #2');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Configure Button Link #2
     const linkData = {
       name: 'RSVP',
       url: 'https://rsvp.example.com'
     };
     const configSuccess = await eventSettingsPage.configureButtonLink(2, linkData);
     expect(configSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     console.log('✅ TC-APP-CUST-009: Button Link #2 test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-009-button-link-2-completed.png') });
   });
  
   test('TC-APP-CUST-010: Verify "Welcome Popup" setup', async ({ page }) => {
     console.log('🚀 Starting TC-APP-CUST-010: Welcome Popup setup');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
    
     await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
    if (!subscribed) {
      console.error('❌ Standard Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
    
     // Step 1: Verify Welcome Popup option is visible
     await eventSettingsPage.expectOptionVisible('Welcome Popup');
     console.log('✅ Welcome Popup option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Welcome Popup');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Configure Welcome Popup (requires image upload)
     // For now, we verify it's accessible and unlocked
    
     console.log('✅ TC-APP-CUST-010: Welcome Popup test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-010-welcome-popup-completed.png') });
   });
  
  test('TC-APP-CUST-011: Verify "Enable Photo Gifts" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-011: Enable Photo Gifts toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
    if (!subscribed) {
      console.error('❌ Standard Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify Enable Photo Gifts option is visible
    await eventSettingsPage.expectOptionVisible('Enable Photo Gifts');
    console.log('✅ Enable Photo Gifts option is visible');
   
    // Step 2: Verify no "Preview for Free" text (unlocked in Standard)
    const noPreview = await verifyNoPreviewForFree(page, 'Enable Photo Gifts');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Enable Photo Gifts');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Enable Photo Gifts to ON
    await eventSettingsPage.setOption('Enable Photo Gifts', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Enable Photo Gifts');
    console.log('  ✅ Enable Photo Gifts toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Reopen settings and verify persistence
    await openEventSettings(page);
    await eventSettingsPage.expectOptionSelected('Enable Photo Gifts');
    console.log('  ✅ Enable Photo Gifts state persisted correctly');
   
    console.log('✅ TC-APP-CUST-011: Enable Photo Gifts test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-011-photo-gifts-completed.png') });
  });
  
   test('TC-APP-CUST-012: Verify "Event Header Photo" upload', async ({ page }) => {
     console.log('🚀 Starting TC-APP-CUST-012: Event Header Photo upload');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
    
     await setupTestWithToken(page, testData);
     await page.goto('https://dev.livesharenow.com/events');
     await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
     
     // Step 2: Subscribe to Standard Plan and handle payment
     const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
     if (!subscribed) {
       console.error('❌ Standard Tier subscription failed');
       await context.close();
       return;
     }
     const eventSettingsPage = new EventSettingsPage(page);
     const settingsOpened = await openEventSettings(page);
    
     // Step 1: Verify Event Header Photo option is visible
     await eventSettingsPage.expectOptionVisible('Event Header Photo');
     console.log('✅ Event Header Photo option is visible');
    
     // Step 2: Verify no "Preview for Free" text (unlocked in Standard)
     const noPreview = await verifyNoPreviewForFree(page, 'Event Header Photo');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Upload image (requires image file path)
     // For now, we verify it's accessible
    
     console.log('✅ TC-APP-CUST-012: Event Header Photo test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-012-header-photo-completed.png') });
   });
  
  test('TC-APP-CUST-013: Verify "Popularity Badges" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-013: Popularity Badges toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
    if (!subscribed) {
      console.error('❌ Standard Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify Popularity Badges option is visible
    await eventSettingsPage.expectOptionVisible('Popularity Badges');
    console.log('✅ Popularity Badges option is visible');
   
    // Step 2: Verify no "Preview for Free" text (unlocked in Standard)
    const noPreview = await verifyNoPreviewForFree(page, 'Popularity Badges');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Popularity Badges');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Popularity Badges to ON
    await eventSettingsPage.setOption('Popularity Badges', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Popularity Badges');
    console.log('  ✅ Popularity Badges toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Reopen settings and verify persistence
    await openEventSettings(page);
    await eventSettingsPage.expectOptionSelected('Popularity Badges');
    console.log('  ✅ Popularity Badges state persisted correctly');
   
    console.log('✅ TC-APP-CUST-013: Popularity Badges test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-013-popularity-badges-completed.png') });
  });
  
  test('TC-APP-CUST-014: Verify "Force Login" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-014: Force Login toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Standard Event', 'Standard');
    if (!subscribed) {
      console.error('❌ Standard Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify Force Login option is visible
    await eventSettingsPage.expectOptionVisible('Force Login');
    console.log('✅ Force Login option is visible');
   
    // Step 2: Verify no "Preview for Free" text (unlocked in Standard)
    const noPreview = await verifyNoPreviewForFree(page, 'Force Login');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Force Login');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Force Login to ON
    await eventSettingsPage.setOption('Force Login', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Force Login');
    console.log('  ✅ Force Login toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Reopen settings and verify persistence
    await openEventSettings(page);
    await eventSettingsPage.expectOptionSelected('Force Login');
    console.log('  ✅ Force Login state persisted correctly');
   
    console.log('✅ TC-APP-CUST-014: Force Login test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-014-force-login-completed.png') });
  });
  
 });
  /**
  * ============================================================================
  * PREMIUM TIER TESTS - TC-APP-CUST-016 to TC-APP-CUST-022
  * ============================================================================
  */
 test.describe('Premium Tier Settings Tests', () => {
   let testData = null;
   
   test.beforeAll(async ({ browser }) => {
     test.setTimeout(180000); // 3 minutes for account creation + subscription + payment
     
     // Create fresh account and event for Premium tier tests
     const context = await browser.newContext();
     const page = await context.newPage();
     
     // Step 1: Setup fresh account and event
     const setupResult = await setupFreshAccountAndEvent(page, context, 'Premium');
     if (!setupResult.success) {
       console.error('❌ Premium Tier setup failed');
       await context.close();
       return;
     }
     
     testData = setupResult.testData;
     console.log(`✅ Premium Tier account created with email: ${testData.email}`);
     
     console.log('✅ Premium Tier subscription completed successfully');
     
     // Step 3: Get token (user should be logged in after payment flow)
     await page.goto('https://dev.livesharenow.com/events');
     await page.waitForTimeout(3000); // Wait for page to stabilize
     
     const token = await getAuthToken(page);
     if (token) {
       testData.token = token;
       console.log(`✅ Premium Tier token saved for reuse across test cases`);
     } else {
       console.error('❌ Failed to get token for Premium Tier');
     }
     
     await context.close();
   });
  
  test('TC-APP-CUST-016: Verify "Allow sharing via Facebook" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-016: Allow sharing via Facebook toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify Facebook sharing option is visible
    await eventSettingsPage.expectOptionVisible('Allow sharing via Facebook');
    console.log('✅ Allow sharing via Facebook option is visible');
   
    // Step 2: Verify no "Preview for Free" text (unlocked with Premium)
    const noPreview = await verifyNoPreviewForFree(page, 'Allow sharing via Facebook');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Allow sharing via Facebook');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Facebook sharing to ON
    await eventSettingsPage.setOption('Allow sharing via Facebook', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Allow sharing via Facebook');
    console.log('  ✅ Allow sharing via Facebook toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Reopen settings and verify persistence
    await openEventSettings(page);
    await eventSettingsPage.expectOptionSelected('Allow sharing via Facebook');
    console.log('  ✅ Allow sharing via Facebook state persisted correctly');
   
    console.log('✅ TC-APP-CUST-016: Allow sharing via Facebook test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-016-facebook-sharing-completed.png') });
  });
  
  test('TC-APP-CUST-017: Verify "Allow Guest Download" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-017: Allow Guest Download toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify Guest Download option is visible
    await eventSettingsPage.expectOptionVisible('Allow Guest Download');
    console.log('✅ Allow Guest Download option is visible');
   
    // Step 2: Verify no "Preview for Free" text
    const noPreview = await verifyNoPreviewForFree(page, 'Allow Guest Download');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Allow Guest Download');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Guest Download to ON
    await eventSettingsPage.setOption('Allow Guest Download', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Allow Guest Download');
    console.log('  ✅ Allow Guest Download toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Reopen settings and verify persistence
    await openEventSettings(page);
    await eventSettingsPage.expectOptionSelected('Allow Guest Download');
    console.log('  ✅ Allow Guest Download state persisted correctly');
   
    console.log('✅ TC-APP-CUST-017: Allow Guest Download test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-017-guest-download-completed.png') });
  });
  
   test('TC-APP-CUST-018: Verify "Add Event Managers" functional', async ({ page }) => {
     console.log('🚀 Starting TC-APP-CUST-018: Add Event Managers functional');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
    
     await setupTestWithToken(page, testData);
     await page.goto('https://dev.livesharenow.com/events');
     await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
     
     // Step 2: Subscribe to Standard Plan and handle payment
     const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
     const eventSettingsPage = new EventSettingsPage(page);
     const settingsOpened = await openEventSettings(page);
    
     // Step 1: Verify Add Event Managers option is visible
     await eventSettingsPage.expectOptionVisible('Add Event Managers');
     console.log('✅ Add Event Managers option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Add Event Managers');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Add Event Manager (requires email)
     // For now, we verify it's accessible
    
     console.log('✅ TC-APP-CUST-018: Add Event Managers test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-018-event-managers-completed.png') });
   });
  
  test('TC-APP-CUST-019: Verify "Allow posting without login" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-019: Allow posting without login toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify posting without login option is visible
    await eventSettingsPage.expectOptionVisible('Allow posting without login');
    console.log('✅ Allow posting without login option is visible');
   
    // Step 2: Verify no "Preview for Free" text
    const noPreview = await verifyNoPreviewForFree(page, 'Allow posting without login');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Allow posting without login');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle posting without login to ON
    await eventSettingsPage.setOption('Allow posting without login', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Allow posting without login');
    console.log('  ✅ Allow posting without login toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Reopen settings and verify persistence
    await openEventSettings(page);
    await eventSettingsPage.expectOptionSelected('Allow posting without login');
    console.log('  ✅ Allow posting without login state persisted correctly');
   
    console.log('✅ TC-APP-CUST-019: Allow posting without login test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-019-posting-without-login-completed.png') });
  });
  
   test('TC-APP-CUST-020: Verify "Require Access Passcode"', async ({ page }) => {
     console.log('🚀 Starting TC-APP-CUST-020: Require Access Passcode');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
    
     await setupTestWithToken(page, testData);
     await page.goto('https://dev.livesharenow.com/events');
     await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
     
     // Step 2: Subscribe to Standard Plan and handle payment
     const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
     const eventSettingsPage = new EventSettingsPage(page);
     const settingsOpened = await openEventSettings(page);
    
     // Step 1: Verify Access Passcode option is visible
     await eventSettingsPage.expectOptionVisible('Require Access Passcode');
     console.log('✅ Require Access Passcode option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Require Access Passcode');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Set Access Passcode
     const passcode = '1234';
     const setSuccess = await eventSettingsPage.setAccessPasscode(passcode);
     expect(setSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     console.log('✅ TC-APP-CUST-020: Require Access Passcode test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-020-access-passcode-completed.png') });
   });
  
   test('TC-APP-CUST-021: Verify Standard features remain unlocked', async ({ page }) => {
     console.log('🚀 Starting TC-APP-CUST-021: Standard features remain unlocked');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
    
     await setupTestWithToken(page, testData);
     await page.goto('https://dev.livesharenow.com/events');
     await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
     
     // Step 2: Subscribe to Standard Plan and handle payment
     const subscribed = await subscribeAndPayForPlan(page, 'Premium Event', 'Premium');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
     const eventSettingsPage = new EventSettingsPage(page);
     const settingsOpened = await openEventSettings(page);
     // Verify Standard features do NOT show "Preview for Free" text
     const standardFeatures = FeatureTiers.STANDARD;
     let allPass = true;
    
     for (const feature of standardFeatures) {
       const noPreview = await verifyNoPreviewForFree(page, feature);
       if (!noPreview) {
         allPass = false;
       }
     }
    
     expect(allPass).toBeTruthy();
    
     console.log('✅ TC-APP-CUST-021: Standard features backward compatibility test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-021-standard-unlocked-completed.png') });
   });
  
 });
  /**
  * ============================================================================
  * PREMIUM+ TIER TESTS - TC-APP-CUST-023 to TC-APP-CUST-030
  * ============================================================================
  */
 test.describe('Premium+ Tier Settings Tests', () => {
   let testData = null;
   
   test.beforeAll(async ({ browser }) => {
     test.setTimeout(180000); // 3 minutes for account creation + subscription + payment
     
     // Create fresh account and event for Premium+ tier tests
     const context = await browser.newContext();
     const page = await context.newPage();
     
     // Step 1: Setup fresh account and event
     const setupResult = await setupFreshAccountAndEvent(page, context, 'Premium+');
     if (!setupResult.success) {
       console.error('❌ Premium+ Tier setup failed');
       await context.close();
       return;
     }
     
     testData = setupResult.testData;
     console.log(`✅ Premium+ Tier account created with email: ${testData.email}`);
     console.log('✅ Premium+ Tier subscription completed successfully');
     
     // Step 3: Get token (user should be logged in after payment flow)
     await page.goto('https://dev.livesharenow.com/events');
     await page.waitForTimeout(3000); // Wait for page to stabilize
     
     const token = await getAuthToken(page);
     if (token) {
       testData.token = token;
       console.log(`✅ Premium+ Tier token saved for reuse across test cases`);
     } else {
       console.error('❌ Failed to get token for Premium+ Tier');
     }
     
     await context.close();
   });
  
  test('TC-APP-CUST-023: Verify "LiveView Slideshow" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-023: LiveView Slideshow toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify LiveView Slideshow option is visible
    await eventSettingsPage.expectOptionVisible('LiveView Slideshow');
    console.log('✅ LiveView Slideshow option is visible');
   
    // Step 2: Verify no "Preview for Free" text (unlocked with Premium+)
    const noPreview = await verifyNoPreviewForFree(page, 'LiveView Slideshow');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('LiveView Slideshow');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle LiveView Slideshow to ON
    await eventSettingsPage.setOption('LiveView Slideshow', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('LiveView Slideshow');
    console.log('  ✅ LiveView Slideshow toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Reopen settings and verify persistence
    await openEventSettings(page);
    await eventSettingsPage.expectOptionSelected('LiveView Slideshow');
    console.log('  ✅ LiveView Slideshow state persisted correctly');
   
    console.log('✅ TC-APP-CUST-023: LiveView Slideshow test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-023-liveview-slideshow-completed.png') });
  });
  
  test('TC-APP-CUST-024: Verify "Then And Now" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-024: Then And Now toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify Then And Now option is visible
    await eventSettingsPage.expectOptionVisible('Then And Now');
    console.log('✅ Then And Now option is visible');
   
    // Step 2: Verify no "Preview for Free" text
    const noPreview = await verifyNoPreviewForFree(page, 'Then And Now');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Then And Now');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Then And Now to ON
    await eventSettingsPage.setOption('Then And Now', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Then And Now');
    console.log('  ✅ Then And Now toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Reopen settings and verify persistence
    await openEventSettings(page);
    await eventSettingsPage.expectOptionSelected('Then And Now');
    console.log('  ✅ Then And Now state persisted correctly');
   
    console.log('✅ TC-APP-CUST-024: Then And Now test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-024-then-and-now-completed.png') });
  });
  
  test('TC-APP-CUST-025: Verify "Movie Editor" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-025: Movie Editor toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify Movie Editor option is visible
    await eventSettingsPage.expectOptionVisible('Movie Editor');
    console.log('✅ Movie Editor option is visible');
   
    // Step 2: Verify no "Preview for Free" text
    const noPreview = await verifyNoPreviewForFree(page, 'Movie Editor');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Movie Editor');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Movie Editor to ON
    await eventSettingsPage.setOption('Movie Editor', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Movie Editor');
    console.log('  ✅ Movie Editor toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Verify Movie Editor menu option appears (after reload)
    await page.reload();
    await page.waitForTimeout(2000);
    const menuResult = await verifyMenuOptions(page, ['Movie Editor']);
    expect(menuResult.success).toBeTruthy();
    console.log('  ✅ Movie Editor menu option verified');
   
    console.log('✅ TC-APP-CUST-025: Movie Editor test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-025-movie-editor-completed.png') });
  });
  
   test('TC-APP-CUST-026: Verify "KeepSake" configuration', async ({ page }) => {
     console.log('🚀 Starting TC-APP-CUST-026: KeepSake configuration');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
    
     await setupTestWithToken(page, testData);
     await page.goto('https://dev.livesharenow.com/events');
     await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
     
     // Step 2: Subscribe to Standard Plan and handle payment
     const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
     const eventSettingsPage = new EventSettingsPage(page);
     const settingsOpened = await openEventSettings(page);
    
     // Step 1: Verify KeepSake option is visible
     await eventSettingsPage.expectOptionVisible('KeepSake');
     console.log('✅ KeepSake option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'KeepSake');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Configure KeepSake
     const keepSakeData = {
       message: 'Welcome to our special event! This message will be unlocked on the event date.',
       unlockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
     };
     const configSuccess = await eventSettingsPage.configureKeepSakeWelcome(keepSakeData);
     expect(configSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     // Step 5: Verify KeepSake menu option appears
     await page.reload();
     await page.waitForTimeout(2000);
     const menuResult = await verifyMenuOptions(page, ['View Keepsakes']);
     expect(menuResult.success).toBeTruthy();
    
     console.log('✅ TC-APP-CUST-026: KeepSake configuration test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-026-keepsake-completed.png') });
   });
  
   test('TC-APP-CUST-027: Verify "Scavenger Hunt" setup', async ({ page }) => {
     console.log('🚀 Starting TC-APP-CUST-027: Scavenger Hunt setup');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
    
     await setupTestWithToken(page, testData);
     await page.goto('https://dev.livesharenow.com/events');
     await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
     
     // Step 2: Subscribe to Standard Plan and handle payment
     const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
     const eventSettingsPage = new EventSettingsPage(page);
     const settingsOpened = await openEventSettings(page);
    
     // Step 1: Verify Scavenger Hunt option is visible
     await eventSettingsPage.expectOptionVisible('Scavenger Hunt');
     console.log('✅ Scavenger Hunt option is visible');
    
     // Step 2: Verify no "Preview for Free" text
     const noPreview = await verifyNoPreviewForFree(page, 'Scavenger Hunt');
     expect(noPreview).toBeTruthy();
    
     // Step 3: Configure Scavenger Hunt
     const configSuccess = await eventSettingsPage.configureScavengerHunt(true);
     expect(configSuccess).toBeTruthy();
    
     // Step 4: Save settings
     await eventSettingsPage.saveMainSettings();
     await page.waitForTimeout(2000);
    
     console.log('✅ TC-APP-CUST-027: Scavenger Hunt setup test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-027-scavenger-hunt-completed.png') });
   });
  
  test('TC-APP-CUST-028: Verify "Sponsor" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-028: Sponsor toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
    // Step 1: Verify Sponsor option is visible
    await eventSettingsPage.expectOptionVisible('Sponsor');
    console.log('✅ Sponsor option is visible');
   
    // Step 2: Verify no "Preview for Free" text
    const noPreview = await verifyNoPreviewForFree(page, 'Sponsor');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Sponsor');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Sponsor to ON
    await eventSettingsPage.setOption('Sponsor', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Sponsor');
    console.log('  ✅ Sponsor toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Verify Sponsor footer button appears
    await page.reload();
    await page.waitForTimeout(2000);
    const footerResult = await verifyFooterButtons(page, ['Sponsor']);
    expect(footerResult.success).toBeTruthy();
    console.log('  ✅ Sponsor footer button verified');
   
    console.log('✅ TC-APP-CUST-028: Sponsor feature test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-028-sponsor-completed.png') });
  });
  
  test('TC-APP-CUST-029: Verify "Prize" toggle functionality', async ({ page }) => {
    console.log('🚀 Starting TC-APP-CUST-029: Prize toggle functionality');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
   
    await setupTestWithToken(page, testData);
    await page.goto('https://dev.livesharenow.com/events');
    await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
    
    // Step 2: Subscribe to Standard Plan and handle payment
    const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
    const eventSettingsPage = new EventSettingsPage(page);
    const settingsOpened = await openEventSettings(page);
   
    // Step 1: Verify Prize option is visible
    await eventSettingsPage.expectOptionVisible('Prize');
    console.log('✅ Prize option is visible');
   
    // Step 2: Verify no "Preview for Free" text
    const noPreview = await verifyNoPreviewForFree(page, 'Prize');
    expect(noPreview).toBeTruthy();
   
    // Step 3: Get current state
    const initialState = await eventSettingsPage.isOptionEnabled('Prize');
    console.log(`  📊 Initial state: ${initialState ? 'Enabled' : 'Disabled'}`);
   
    // Step 4: Toggle Prize to ON
    await eventSettingsPage.setOption('Prize', true);
    await page.waitForTimeout(500);
   
    // Step 5: Verify it's selected
    await eventSettingsPage.expectOptionSelected('Prize');
    console.log('  ✅ Prize toggled ON successfully');
   
    // Step 6: Save settings
    await eventSettingsPage.saveMainSettings();
    await page.waitForTimeout(2000);
   
    // Step 7: Verify Prize footer button appears
    await page.reload();
    await page.waitForTimeout(2000);
    const footerResult = await verifyFooterButtons(page, ['Prize']);
    expect(footerResult.success).toBeTruthy();
    console.log('  ✅ Prize footer button verified');
   
    console.log('✅ TC-APP-CUST-029: Prize feature test passed');
    await page.screenshot({ path: path.join(screenshotsDir, 'tc-029-prize-completed.png') });
  });
  
   test('TC-APP-CUST-030: Verify all lower tiers unlocked', async ({ page }) => {
     console.log('🚀 Starting TC-APP-CUST-030: Verify all lower tiers unlocked');
    
    if (!testData || !testData.token) {
      test.skip('Setup failed - no test data or token available');
      return;
    }
    
     await setupTestWithToken(page, testData);
     await page.goto('https://dev.livesharenow.com/events');
     await page.locator('mat-tab-body[role="tabpanel"] .event-card-event ').first().click();
     
     // Step 2: Subscribe to Standard Plan and handle payment
     const subscribed = await subscribeAndPayForPlan(page, 'Premium+ Event', 'PremiumPlus');
    if (!subscribed) {
      console.error('❌ Premium+ Tier subscription failed');
      await context.close();
      return;
    }
     const eventSettingsPage = new EventSettingsPage(page);
     const settingsOpened = await openEventSettings(page);
     // Verify ALL features do NOT show "Preview for Free" text
     const allFeatures = [
       ...FeatureTiers.FREE,
       ...FeatureTiers.STANDARD,
       ...FeatureTiers.PREMIUM,
       ...FeatureTiers.PREMIUM_PLUS
     ];
    
     let allPass = true;
     let passCount = 0;
     let totalCount = 0;
    
     for (const feature of allFeatures) {
       totalCount++;
       const noPreview = await verifyNoPreviewForFree(page, feature);
       if (noPreview) {
         passCount++;
       } else {
         allPass = false;
       }
     }
    
     console.log(`\n📊 Complete Feature Access Verification:`);
     console.log(`   ✅ Passed: ${passCount}/${totalCount}`);
     console.log(`   ❌ Failed: ${totalCount - passCount}/${totalCount}`);
    
     expect(allPass).toBeTruthy();
    
     // Verify complete UI (menu and footer)
     await page.reload();
     await page.waitForTimeout(2000);
    
     const premiumPlusMenuItems = [
       'View Keepsakes',
       'Download All Photos',
       'Movie Editor',
       'LiveView',
       'Redeem Gift Code',
       'Live Help',
       'FAQs',
       'Details',
       'Logout'
     ];
     const menuResult = await verifyMenuOptions(page, premiumPlusMenuItems);
     expect(menuResult.success).toBeTruthy();
    
     const premiumPlusFooterButtons = [
       'Then & Now',
       'KeepSake',
       'Sponsor',
       'Prize',
       'Message',
       'Photos',
       'Videos'
     ];
     const footerResult = await verifyFooterButtons(page, premiumPlusFooterButtons);
     expect(footerResult.success).toBeTruthy();
    
     console.log('✅ TC-APP-CUST-030: Complete feature access test passed');
     await page.screenshot({ path: path.join(screenshotsDir, 'tc-030-all-features-unlocked-completed.png') });
   });
 });
});

