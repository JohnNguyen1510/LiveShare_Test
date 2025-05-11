import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { EventPage } from '../page-objects/EventPage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
    }

test.describe('Event Settings & UI Verification Tests', () => {
    test.setTimeout(240000);
    
    let loginPage;
    let eventPage;

    test.beforeEach(async ({ page }) => {
        // Initialize page objects
        loginPage = new LoginPage(page);
        eventPage = new EventPage(page);
    });
    test('TC-APP-DEEV-01-07: Verify Detail Event UI', async ({ page, context }) => {
        console.log('Starting test: TC-APP-DEEV-01-07');
        
        // Navigate to app and login
        console.log('Navigating to app and logging in...');
        await page.goto('https://app.livesharenow.com/');
        const success = await loginPage.completeGoogleAuth(context);
        expect(success, 'Google authentication should be successful').toBeTruthy();
    
        // Skip Google auth for this test as requested by user
        // Just wait for the app to load after login
        await page.waitForTimeout(3000);
        
        // Try to find the event with name "tuanhay" on the events page
        console.log('Looking for event with name "tuanhay"...');
        
        // First try the events page with tuanhay event
        // We're looking directly for the event card with the right text
        const eventCards = page.locator('.flex.pt-8, div.event-card, div.mat-card').filter({ hasText: 'tuanhay' });
        if (await eventCards.count() > 0) {
        console.log(`Found event with name "tuanhay"`);
        await eventCards.first().click();
        } else {
        // If not found, try to navigate to events page first
        console.log('Navigating to events page...');
        
        // Try various menu/navigation options to get to events
        const menuButton = page.locator('mat-icon:text("menu")').first();
        if (await menuButton.isVisible().catch(() => false)) {
            await menuButton.click();
            await page.waitForTimeout(1000);
            
            const eventsOption = page.locator('a:has-text("Events"), a:has-text("My Events")').first();
            if (await eventsOption.isVisible().catch(() => false)) {
            await eventsOption.click();
            await page.waitForTimeout(2000);
            }
        }
        
        // Now try to find and click the tuanhay event
        const updatedEventCards = page.locator('.event-card, .flex.pt-8, div.mat-card').filter({ hasText: 'tuanhay' });
        if (await updatedEventCards.count() > 0) {
            await updatedEventCards.first().click();
        } else {
            // Just click the first event if we can't find tuanhay
            console.log('Clicking the first available event');
            await page.locator('.event-card, .flex.pt-8, div.mat-card').first().click();
        }
        }
        
        // Wait for event details page to fully load
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(screenshotsDir, 'detail-event-loaded.png') });
        
        // TC-APP-DEEV-01: Check name of event
        console.log('TC-APP-DEEV-01: Checking name of event');
        
        // Based on the HTML provided, look specifically for the event-name-event class
        const eventName = page.locator('span.event-name-event').first();
        expect(await eventName.isVisible(), 'Event name should be visible').toBeTruthy();
        
        const nameText = await eventName.textContent();
        console.log(`Found event name: "${nameText}"`);
        expect(nameText.includes('tuanhay'), 'Event name should be "tuanhay"').toBeTruthy();
        
        // TC-APP-DEEV-02: Check Day of event
        console.log('TC-APP-DEEV-02: Checking day of event');
        const eventDate = page.locator('span.date-event').first();
        expect(await eventDate.isVisible(), 'Event date should be visible').toBeTruthy();
        
        const dateText = await eventDate.textContent();
        console.log(`Found event date: "${dateText}"`);
        expect(dateText.length > 0, 'Event date should not be empty').toBeTruthy();
        
        // TC-APP-DEEV-03: Check event header photo
        console.log('TC-APP-DEEV-03: Checking event header photo');
        // The header photo is inside the event-image div as shown in the HTML
        const headerPhoto = page.locator('.event-image .absolute img').first();
        expect(await headerPhoto.isVisible(), 'Event header photo should be visible').toBeTruthy();
        
        // Verify the photo has a src attribute
        const photoSrc = await headerPhoto.getAttribute('src');
        expect(photoSrc && photoSrc.length > 0, 'Event header photo should have a src').toBeTruthy();
        
        // TC-APP-DEEV-04: Check Location info
        console.log('TC-APP-DEEV-04: Checking location section');
        
        // First make sure the details panel is expanded
        const detailsPanel = page.locator('mat-panel-title:has-text("Details")').first();
        const isPanelExpanded = await page.locator('mat-expansion-panel.mat-expanded').count() > 0;
        
        if (!isPanelExpanded) {
        await detailsPanel.click();
        await page.waitForTimeout(1000);
        }
        
        // Look for the location section with the location_on icon
        const locationSection = page.locator('.flex.items-start:has(mat-icon:text("location_on"))').first();
        expect(await locationSection.isVisible(), 'Location section should be visible').toBeTruthy();
        
        // TC-APP-DEEV-05: Check Contact info
        console.log('TC-APP-DEEV-05: Checking contact section');
        const contactSection = page.locator('.flex.items-start:has(mat-icon:text("phone"))').first();
        expect(await contactSection.isVisible(), 'Contact section should be visible').toBeTruthy();
        
        // Also check for the itinerary section
        const itinerarySection = page.locator('.flex.items-start:has(mat-icon:text("route"))').first();
        expect(await itinerarySection.isVisible(), 'Itinerary section should be visible').toBeTruthy();
        
        // TC-APP-DEEV-06: Check functions/buttons in the UI
        console.log('TC-APP-DEEV-06: Checking UI buttons and functions');
        
        // Check for the camera button in the event header
        const cameraButton = page.locator('button:has(mat-icon:text("camera_alt"))').first();
        expect(await cameraButton.isVisible(), 'Camera button should be visible').toBeTruthy();
        
        // Check for navigation buttons in the top bar
        const backButton = page.locator('button:has(mat-icon:text("arrow_back_ios_new"))').first();
        expect(await backButton.isVisible(), 'Back button should be visible').toBeTruthy();
        
        const shareButton = page.locator('button:has(mat-icon:text("share"))').first();
        expect(await shareButton.isVisible(), 'Share button should be visible').toBeTruthy();
        
        const settingsButton = page.locator('button:has(mat-icon:text("settings"))').first();
        expect(await settingsButton.isVisible(), 'Settings button should be visible').toBeTruthy();
        
        const menuOptionsButton = page.locator('button:has(mat-icon:text("more_vert"))').first();
        expect(await menuOptionsButton.isVisible(), 'Menu options button should be visible').toBeTruthy();
        
        // TC-APP-DEEV-07: Check for button links
        console.log('TC-APP-DEEV-07: Checking button links');
        
        // Check for button link #1 and button link #2
        const buttonLink1 = page.locator('a.menu-button1').first();
        const buttonLink2 = page.locator('a.menu-button2').first();
        
        expect(await buttonLink1.isVisible(), 'Button link #1 should be visible').toBeTruthy();
        expect(await buttonLink2.isVisible(), 'Button link #2 should be visible').toBeTruthy();
        
        // Verify they have the right text and href
        const link1Text = await buttonLink1.textContent();
        const link1Href = await buttonLink1.getAttribute('href');
        
        const link2Text = await buttonLink2.textContent();
        const link2Href = await buttonLink2.getAttribute('href');
        
        console.log(`Button Link #1: "${link1Text}" -> ${link1Href}`);
        console.log(`Button Link #2: "${link2Text}" -> ${link2Href}`);
        
        expect(link1Text.includes('tuanhay'), 'Button link #1 should contain "tuanhay"').toBeTruthy();
        expect(link2Text.includes('tuanhay'), 'Button link #2 should contain "tuanhay"').toBeTruthy();
        
        // Check the main add button
        const addButton = page.locator('button.menu-button:has(mat-icon:text("add"))').first();
        expect(await addButton.isVisible(), 'Add button should be visible').toBeTruthy();
        
        // Summary of tests
        console.log('All Detail Event UI checks completed');
    });
});