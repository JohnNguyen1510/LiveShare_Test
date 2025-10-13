import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { EventListPage } from '../page-objects/EventListPage.js';
import { EventDetailPage } from '../page-objects/EventDetailPage.js';
import { BasePage } from '../page-objects/BasePage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Increase test timeout
test.setTimeout(5 * 60 * 1000); // 5 minutes

test.describe('Event Detail UI', () => {
  let loginPage;
  let eventListPage;
  let eventDetailPage;
  let basePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    eventListPage = new EventListPage(page);
    eventDetailPage = new EventDetailPage(page);
    basePage = new BasePage(page);
  });

  test('TC-APP-DEEV-01-07: Verify Detail Event UI using POM', async ({ page, context }) => {

    // Navigate to events page and verify it loads
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();
    
    // Try to find and click event with "tuanhay" in name
    console.log('Looking for event with name containing "tuanhay"...');
    
    const eventCount = await eventListPage.getEventCount();
    let eventClicked = false;
    
    // Check each event for "tuanhay" in name
    for (let i = 0; i < eventCount; i++) {
      try {
        const eventInfo = await eventListPage.getEventInfo(i);
        if (eventInfo.name && eventInfo.name.toLowerCase().includes('tuanhay')) {
          console.log(`Found event with "tuanhay": ${eventInfo.name}`);
          await eventListPage.clickEventByIndex(i);
          eventClicked = true;
          break;
        }
      } catch (error) {
        console.log(`Error checking event ${i}: ${error.message}`);
      }
    }
    
    // If no "tuanhay" event found, click first available event
    if (!eventClicked) {
      console.log('No "tuanhay" event found, clicking first available event');
      await eventListPage.clickEventByIndex(0);
    }
        
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();
    await page.screenshot({ path: path.join(screenshotsDir, 'detail-event-loaded.png') });
    
    // TC-APP-DEEV-01: Verify event name
    console.log('TC-APP-DEEV-01: Checking event name');
    const eventInfo = await eventDetailPage.getEventInfo();
    expect(eventInfo.name, 'Event name should be visible').toBeTruthy();
    
        
    // TC-APP-DEEV-02: Verify event date
    console.log('TC-APP-DEEV-02: Checking event date');
    expect(eventInfo.date, 'Event date should be visible').toBeTruthy();
    expect(eventInfo.date.length > 0, 'Event date should not be empty').toBeTruthy();
        
    // TC-APP-DEEV-03: Verify event header photo
    console.log('TC-APP-DEEV-03: Checking event header photo');
    expect(eventInfo.hasImage, 'Event header photo should be visible').toBeTruthy();
        
    // TC-APP-DEEV-04: Verify details section
    console.log('TC-APP-DEEV-04: Checking details section');
    await eventDetailPage.verifyDetailsSection();
    
    // Get location, contact, and itinerary info
    const locationInfo = await eventDetailPage.getLocationInfo();
    const contactInfo = await eventDetailPage.getContactInfo();
    const itineraryInfo = await eventDetailPage.getItineraryInfo();
    
    // Verify location section
    expect(locationInfo.isVisible, 'Location section should be visible').toBeTruthy()
    
    // Verify contact section
    expect(contactInfo.isVisible, 'Contact section should be visible').toBeTruthy();
    
    // Verify itinerary section
    expect(itineraryInfo.isVisible, 'Itinerary section should be visible').toBeTruthy();
        
    // TC-APP-DEEV-06: Verify navigation buttons
    console.log('TC-APP-DEEV-06: Checking navigation buttons');
    await eventDetailPage.verifyNavigationButtons();
        
    // TC-APP-DEEV-07: Verify action buttons
    console.log('TC-APP-DEEV-07: Checking action buttons');
    await eventDetailPage.verifyActionButtons();
    
    // Summary
    console.log('✅ All Detail Event UI checks completed using POM structure');
  });

  test('TC-APP-DEEV-08: Verify Share Event UI', async ({ page, context }) => {
    // Navigate to events page and verify it loads
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();
    await eventListPage.clickEventByIndex(0);


    //TC-APP-DEEV-08: Grid View
    console.log('TC-APP-DEEV-08: Checking grid view');
    await eventDetailPage.verifyGridView();
    
  });

  test('TC-APP-DEEV-09: Verify Comprehensive Grid Layout Testing', async ({ page, context }) => {
    // Navigate to events page and verify it loads
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();
    await eventListPage.clickEventByIndex(0);


    //TC-APP-DEEV-09: Comprehensive Grid Layout Testing
    console.log('TC-APP-DEEV-09: Testing all grid layouts (2x2, 3x3, Timeline)');
    await eventDetailPage.testAllGridLayouts();
  });
  test('TC-APP-DEEV-10: Verify Share Functionality', async ({ page, context }) => {
    // Navigate to events page and verify it loads
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // If no "tuanhay" event found, click first available event
    await eventListPage.clickEventByIndex(0);
  
        
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();
    await page.screenshot({ path: path.join(screenshotsDir, 'detail-event-loaded.png') });

    //TC-APP-DEEV-10: Share Functionality
    console.log('TC-APP-DEEV-10: Testing share functionality');
    await eventDetailPage.verifyShareFunctionality();
  });

  test('TC-APP-DEEV-11: Verify movie editor work correctly' , async({page,context})=>{
        // Navigate to events page and verify it loads
        await eventListPage.goToEventsPage();
        await eventListPage.waitForEventsToLoad();
        await eventListPage.verifyEventsPageLoaded();
    
        // If no "tuanhay" event found, click first available event
        await eventListPage.clickEventByIndex(0);
      
            
        // Wait for event detail page to load
        await eventDetailPage.waitForEventDetailToLoad();
        await eventDetailPage.verifyEventDetailLoaded();
        await page.screenshot({ path: path.join(screenshotsDir, 'detail-event-loaded.png') });

        await eventDetailPage.verifyMovieEditorFunctionality()
  })
});