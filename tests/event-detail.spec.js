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

  test('TC-APP-DEEV-01-07: Verify Detail Event UI ', async ({ page, context }) => {

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



  test('TC-APP-DEEV-11: Movie Editor UI Verification', async ({ page }) => {
    console.log('\n🎬 TC-APP-DEEV-11: Movie Editor UI Verification');
    console.log('═'.repeat(70));

    // Navigate to events page and enter event
    await eventListPage.goToEventsPage();
    await eventListPage.waitForEventsToLoad();
    await eventListPage.verifyEventsPageLoaded();
    await eventListPage.clickEventByIndex(0);
    await eventDetailPage.waitForEventDetailToLoad();
    await eventDetailPage.verifyEventDetailLoaded();
    
    // PART 1: Navigate to Movie Editor and verify empty state
    console.log('\n📋 Part 1: Movie Editor Navigation & Empty State');
    console.log('-'.repeat(60));
    const navigationSuccess = await eventDetailPage.navigateToMovieEditor();
    expect(navigationSuccess, 'Should successfully navigate to Movie Editor').toBeTruthy();
    await eventDetailPage.verifyMovieEditorEmptyState();
    await page.screenshot({ path: path.join(screenshotsDir, 'movie-editor-empty-state.png') });
    console.log('✅ Part 1 Passed: Navigation and empty state verified');
    
    // PART 2: Create new movie and verify main dialog UI
    console.log('\n📋 Part 2: Movie Editor Main Dialog');
    console.log('-'.repeat(60));
    const movieCreated = await eventDetailPage.clickCreateNewMovie();
    expect(movieCreated, 'Movie editor dialog should open').toBeTruthy();
    await eventDetailPage.verifyMovieEditorDialog();
    await page.screenshot({ path: path.join(screenshotsDir, 'movie-editor-main-dialog.png') });
    console.log('✅ Part 2 Passed: Main dialog UI verified');
    
    // PART 3: Test movie name update
    console.log('\n📋 Part 3: Movie Name Update');
    console.log('-'.repeat(60));
    const testMovieName = `UI Test Movie ${Date.now()}`;
    const updateSuccess = await eventDetailPage.updateMovieName(testMovieName);
    expect(updateSuccess, 'Movie name should be updated successfully').toBeTruthy();
    await page.screenshot({ path: path.join(screenshotsDir, 'movie-name-updated.png') });
    console.log('✅ Part 3 Passed: Movie name update verified');
    
    // PART 4: Verify Edit Title Page UI
    console.log('\n📋 Part 4: Edit Title Page UI');
    console.log('-'.repeat(60));
    const titlePageOpened = await eventDetailPage.clickEditTitlePage();
    expect(titlePageOpened, 'Edit Title Page dialog should open').toBeTruthy();
    await eventDetailPage.verifyEditTitlePageDialog();
    await page.screenshot({ path: path.join(screenshotsDir, 'edit-title-page-dialog.png') });
    
    // Test toggles
    await eventDetailPage.toggleShowEventName(false);
    await page.waitForTimeout(300);
    await eventDetailPage.toggleShowEventName(true);
    await eventDetailPage.toggleShowEventDate(false);
    await page.waitForTimeout(300);
    await eventDetailPage.toggleShowEventDate(true);
    
    // Test Our Collection
    const collectionOpened = await eventDetailPage.clickOurCollection();
    expect(collectionOpened, 'Our Collection should open').toBeTruthy();
    await eventDetailPage.verifyOurCollectionUI();
    await page.screenshot({ path: path.join(screenshotsDir, 'our-collection-backgrounds.png') });
    
    // Close "Our Collection" dialog (layer 1)
    await eventDetailPage.cancelMovieEditorChanges();
    await page.waitForTimeout(800);
    
    // Close "Edit Title Page" dialog (layer 2) to return to main editor
    await eventDetailPage.cancelMovieEditorChanges();
    await page.waitForTimeout(800);
    
    console.log('✅ Part 4 Passed: Edit Title Page UI verified');
    
    // PART 5: Verify Edit Playlist UI
    console.log('\n📋 Part 5: Edit Playlist UI');
    console.log('-'.repeat(60));
    const playlistOpened = await eventDetailPage.clickEditPlaylist();
    expect(playlistOpened, 'Edit Playlist dialog should open').toBeTruthy();
    await eventDetailPage.verifyEditPlaylistDialog();
    await eventDetailPage.clickCheckAllInPlaylist();
    await page.screenshot({ path: path.join(screenshotsDir, 'edit-playlist-dialog.png') });
    await eventDetailPage.cancelMovieEditorChanges();
    console.log('✅ Part 5 Passed: Edit Playlist UI verified');
    
    // PART 6: Verify Edit Slide Format UI
    console.log('\n📋 Part 6: Edit Slide Format UI');
    console.log('-'.repeat(60));
    const slideFormatOpened = await eventDetailPage.clickEditSlideFormat();
    expect(slideFormatOpened, 'Edit Slide Format dialog should open').toBeTruthy();
    await eventDetailPage.verifyEditSlideFormatDialog();
    
    // Test toggles
    await eventDetailPage.toggleSlideFormatOption('Event QR Code', true);
    await eventDetailPage.toggleSlideFormatOption('Event QR Code', false);
    await eventDetailPage.toggleSlideFormatOption('Comments', false);
    await eventDetailPage.toggleSlideFormatOption('Comments', true);
    
    // Test pause durations
    await eventDetailPage.selectPauseDuration(3);
    await eventDetailPage.selectPauseDuration(5);
    await eventDetailPage.selectPauseDuration(7);
    
    await page.screenshot({ path: path.join(screenshotsDir, 'edit-slide-format-complete.png') });
    await eventDetailPage.cancelMovieEditorChanges();
    console.log('✅ Part 6 Passed: Edit Slide Format UI verified');
    
    console.log('\n' + '═'.repeat(70));
    console.log('🎉 TC-APP-DEEV-12 PASSED: All Movie Editor UI components verified successfully!');
    console.log('═'.repeat(70));
  });
});