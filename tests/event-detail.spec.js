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

    //TC-APP-DEEV-08: Grid View
    console.log('TC-APP-DEEV-08: Checking grid view');
    await eventDetailPage.verifyGridView();
    
  });

  test('TC-APP-DEEV-09: Verify Comprehensive Grid Layout Testing', async ({ page, context }) => {
    // Navigate to events page and verify it loads
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

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

  test('TC-APP-DEEV-11: Verify movie editor basic functionality' , async({page,context})=>{
        // Navigate to events page and verify it loads
        await eventListPage.goToEventsPage();
        await eventListPage.waitForEventsToLoad();
        await eventListPage.verifyEventsPageLoaded();
    
    // Click first available event
        await eventListPage.clickEventByIndex(0);
            
        // Wait for event detail page to load
        await eventDetailPage.waitForEventDetailToLoad();
        await eventDetailPage.verifyEventDetailLoaded();
        await page.screenshot({ path: path.join(screenshotsDir, 'detail-event-loaded.png') });

    // Verify basic movie editor functionality
    await eventDetailPage.verifyMovieEditorFunctionality();
  });

  test('TC-APP-DEEV-12: Create new movie with name', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Open Movie Editor
    await eventDetailPage.openMovieEditor();
    await eventDetailPage.verifyMovieEditorPageLoaded();

    // Create new movie
    await eventDetailPage.clickCreateMovie();
    await eventDetailPage.verifyEditorLandingPage();

    // Enter movie name
    const movieName = `Test Movie ${Date.now()}`;
    await eventDetailPage.enterMovieName(movieName);

    // Verify preview
    await eventDetailPage.verifyMoviePreview();

    // Save movie
    await eventDetailPage.saveMovie();

    await page.screenshot({ path: path.join(screenshotsDir, 'movie-created.png') });
    console.log('✅ TC-APP-DEEV-12: Movie created successfully');
  });

  test('TC-APP-DEEV-13: Edit Title Page settings', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Open Movie Editor and create movie
    await eventDetailPage.openMovieEditor();
    await eventDetailPage.clickCreateMovie();
    await eventDetailPage.verifyEditorLandingPage();

    // Navigate to Edit Title Page
    await eventDetailPage.navigateToEditTitlePage();
    await eventDetailPage.verifyEditTitlePage();

    // Verify preview
    await eventDetailPage.verifyTitlePreview();

    // Toggle Show Event Name
    await eventDetailPage.toggleShowEventName(false);
    await page.waitForTimeout(1000);
    
    // Toggle it back
    await eventDetailPage.toggleShowEventName(true);
    await page.waitForTimeout(1000);

    // Toggle Show Event Date
    await eventDetailPage.toggleShowEventDate(false);
    await page.waitForTimeout(1000);
    
    // Toggle it back
    await eventDetailPage.toggleShowEventDate(true);

    await page.screenshot({ path: path.join(screenshotsDir, 'title-page-settings.png') });

    // Save title page
    await eventDetailPage.saveTitlePage();

    console.log('✅ TC-APP-DEEV-13: Title Page settings configured successfully');
  });

  test('TC-APP-DEEV-14: Configure Slide Format settings', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Open Movie Editor and create movie
    await eventDetailPage.openMovieEditor();
    await eventDetailPage.clickCreateMovie();
    await eventDetailPage.verifyEditorLandingPage();

    // Navigate to Edit Slide Format
    await eventDetailPage.navigateToEditSlideFormat();
    await eventDetailPage.verifyEditSlideFormatPage();

    // Verify initial checkbox states
    const initialMovieNameState = await eventDetailPage.getSlideFormatCheckboxState('movieName');
    const initialQRCodeState = await eventDetailPage.getSlideFormatCheckboxState('qrCode');
    const initialPosterNameState = await eventDetailPage.getSlideFormatCheckboxState('posterName');
    const initialCaptionsState = await eventDetailPage.getSlideFormatCheckboxState('captions');
    const initialCommentsState = await eventDetailPage.getSlideFormatCheckboxState('comments');
    
    console.log('Initial checkbox states:');
    console.log(`  Movie Name: ${initialMovieNameState}`);
    console.log(`  QR Code: ${initialQRCodeState}`);
    console.log(`  Poster Name: ${initialPosterNameState}`);
    console.log(`  Captions: ${initialCaptionsState}`);
    console.log(`  Comments: ${initialCommentsState}`);

    // Toggle QR Code (if initially unchecked, check it)
    if (!initialQRCodeState) {
      await eventDetailPage.toggleSlideFormatCheckbox('qrCode', true);
      
      // Verify it's now checked
      const newQRCodeState = await eventDetailPage.getSlideFormatCheckboxState('qrCode');
      expect(newQRCodeState).toBeTruthy();
      console.log('✅ QR Code checkbox toggled successfully');
    }

    // Select pause duration
    await eventDetailPage.selectPauseDuration(7);
    
    // Verify pause duration selection
    const selectedDuration = await eventDetailPage.getSelectedPauseDuration();
    console.log(`Selected pause duration: ${selectedDuration} seconds`);

    await page.screenshot({ path: path.join(screenshotsDir, 'slide-format-settings.png') });

    // Save slide format
    await eventDetailPage.saveSlideFormat();

      console.log('✅ TC-APP-DEEV-14: Slide Format settings configured successfully');
  });

  test('TC-APP-DEEV-19: Check LiveView in menu work correctly', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Test LiveView functionality
    await eventDetailPage.verifyLiveViewFunctionality();

    await page.screenshot({ path: path.join(screenshotsDir, 'liveview-tested.png') });
    console.log('✅ TC-APP-DEEV-19: LiveView functionality verified successfully');
  });

  test('TC-APP-DEEV-20: Check Redeem Gift Code in menu work correctly', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Test Redeem Gift Code functionality with mock code
    const mockRedeemCode = `GIFT${Date.now()}`;
    const apiResponse = await eventDetailPage.verifyRedeemGiftCodeFunctionality(mockRedeemCode);

    // Verify API response if available
    if (apiResponse) {
      console.log('API Response received:');
      console.log(`  Status: ${apiResponse.status}`);
      console.log(`  URL: ${apiResponse.url}`);
      console.log(`  Success: ${apiResponse.ok}`);
    }

    await page.screenshot({ path: path.join(screenshotsDir, 'redeem-gift-code-tested.png') });
    console.log('✅ TC-APP-DEEV-20: Redeem Gift Code functionality verified successfully');
  });

  test('TC-APP-DEEV-21: Check Live Help in menu work correctly', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Test Live Help functionality
    const apiResponse = await eventDetailPage.verifyLiveHelpFunctionality();

    // Verify API response if available
    if (apiResponse) {
      console.log('API Response received:');
      console.log(`  Status: ${apiResponse.status}`);
      console.log(`  URL: ${apiResponse.url}`);
      console.log(`  Success: ${apiResponse.ok}`);
    }

    await page.screenshot({ path: path.join(screenshotsDir, 'live-help-tested.png') });
    console.log('✅ TC-APP-DEEV-21: Live Help functionality verified successfully');
  });

  test('TC-APP-DEEV-22: Check Detail in menu work correctly', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Test Event Details functionality
    const result = await eventDetailPage.verifyEventDetailsFunctionality();

    // Verify event details data
    console.log('\n📊 Event Details Summary:');
    console.log('═'.repeat(60));
    console.log(`Plan: ${result.details.plan}`);
    console.log(`Created Date: ${result.details.createdDate}`);
    console.log(`Event Date: ${result.details.eventDate}`);
    console.log(`Last Viewed Date: ${result.details.lastViewedDate}`);
    console.log(`Number of Posts: ${result.details.numberOfPosts}`);
    console.log(`Number of Guests: ${result.details.numberOfGuests}`);
    console.log(`Number of Viewers: ${result.details.numberOfViewers}`);
    console.log(`Active Until: ${result.details.activeUntil}`);
    console.log(`Daily Backup Limit: ${result.details.dailyBackupLimit}`);
    console.log('═'.repeat(60));

    // Verify critical fields have data
    expect(result.details.plan).not.toBe('---');
    expect(result.details.createdDate).not.toBe('---');
    expect(result.details.eventDate).not.toBe('---');

    // Verify action buttons
    console.log('\n🔘 Action Buttons Status:');
    console.log(`  Upgrade Button: ${result.buttons.upgrade ? 'Visible' : 'Not Visible'}`);
    console.log(`  View Guests Button: ${result.buttons.viewGuests ? 'Visible' : 'Not Visible'}`);
    console.log(`  Extend Button: ${result.buttons.extend ? 'Visible' : 'Not Visible'}`);

    await page.screenshot({ path: path.join(screenshotsDir, 'event-details-tested.png') });
    console.log('\n✅ TC-APP-DEEV-22: Event Details functionality verified successfully');
  });

  test('TC-APP-DEEV-24: Check View Keepsakes in menu work correctly', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Test View Keepsakes functionality
    await eventDetailPage.verifyViewKeepsakesFunction();

    await page.screenshot({ path: path.join(screenshotsDir, 'view-keepsakes-tested.png') });
    console.log('✅ TC-APP-DEEV-24: View Keepsakes functionality verified successfully');
  });

  test('TC-APP-DEEV-25: Check Download All Photos in menu work correctly', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Test Download All Photos functionality
    await eventDetailPage.verifyDownloadAllPhotosFunction();

    await page.screenshot({ path: path.join(screenshotsDir, 'download-all-photos-tested.png') });
    console.log('✅ TC-APP-DEEV-25: Download All Photos functionality verified successfully');
  });

  test('TC-APP-DEEV-26: Check FAQs in menu work correctly', async ({ page, context }) => {
    // Navigate to events page
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();

    // Click first available event
    await eventListPage.clickEventByIndex(0);
    
    // Wait for event detail page to load
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();

    // Test FAQs functionality (opens in new tab)
    await eventDetailPage.verifyFAQsFunctionality();

    await page.screenshot({ path: path.join(screenshotsDir, 'faqs-tested.png') });
    console.log('✅ TC-APP-DEEV-26: FAQs functionality verified successfully');
  });
});