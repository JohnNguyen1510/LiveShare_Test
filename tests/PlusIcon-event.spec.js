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
    test('TC-APP-VIEW-001-008: Verify Plus Features in View Detail', async ({ page, context }) => {
        console.log('Starting test: TC-APP-VIEW-001-008');
        
        // Navigate to app and login
        console.log('Navigating to app and logging in...');
        await page.goto('https://app.livesharenow.com/');
        const success = await loginPage.completeGoogleAuth(context);
        expect(success, 'Google authentication should be successful').toBeTruthy();
        
        // Navigate to events and select first event
        console.log('Navigating to events page...');
        await eventPage.navigateToEvents();
        
        console.log('Selecting first event...');
        await eventPage.clickFirstEvent();
        await page.waitForTimeout(2000); // Give page time to fully load
        
        console.log('Clicking add button to reveal feature options...');
        const addButton = page.locator('button.menu-button, button:has(mat-icon:text("add"))').first();
        await addButton.waitFor({ state: 'visible', timeout: 5000 });
        await addButton.click();
        await page.waitForTimeout(2000); // Wait for menu to appear
        await page.screenshot({ path: path.join(screenshotsDir, 'feature-options.png') });
        
        // TC-APP-VIEW-001: Verify Then & Now button
        console.log('TC-APP-VIEW-001: Verifying Then & Now button');
        const thenAndNowButton = page.locator('button:has-text("Then & Now")').first();
        await thenAndNowButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        const thenAndNowVisible = await thenAndNowButton.isVisible().catch(() => false);
        expect(thenAndNowVisible, 'Then & Now button should be visible').toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'then-and-now-button.png') });
        
        // TC-APP-VIEW-002: Verify KeepSake button
        console.log('TC-APP-VIEW-002: Verifying KeepSake button');
        const keepSakeButton = page.locator('button:has-text("KeepSake")');
        expect(await keepSakeButton.isVisible(), 'KeepSake button should be visible').toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'keepsake-button.png') });
        
        // TC-APP-VIEW-003: Verify Clue button
        console.log('TC-APP-VIEW-003: Verifying Clue button');
        const clueButton = page.locator('button:has-text("Clue")');
        expect(await clueButton.isVisible(), 'Clue button should be visible').toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'clue-button.png') });
        
        // TC-APP-VIEW-004: Verify Sponsor button
        console.log('TC-APP-VIEW-004: Verifying Sponsor button');
        const sponsorButton = page.locator('button:has-text("Sponsor")');
        expect(await sponsorButton.isVisible(), 'Sponsor button should be visible').toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'sponsor-button.png') });
        
        // TC-APP-VIEW-005: Verify Prize button
        console.log('TC-APP-VIEW-005: Verifying Prize button');
        const prizeButton = page.locator('button:has-text("Prize")');
        expect(await prizeButton.isVisible(), 'Prize button should be visible').toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'prize-button.png') });
        
        // TC-APP-VIEW-006: Verify Message button
        console.log('TC-APP-VIEW-006: Verifying Message button');
        const messageButton = page.locator('button:has-text("Message")');
        expect(await messageButton.isVisible(), 'Message button should be visible').toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'message-button.png') });
        
        // TC-APP-VIEW-007: Verify Photos button
        console.log('TC-APP-VIEW-007: Verifying Photos button');
        const photosButton = page.locator('button:has-text("Photos")');
        expect(await photosButton.isVisible(), 'Photos button should be visible').toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'photos-button.png') });
        
        // TC-APP-VIEW-008: Verify Videos button
        console.log('TC-APP-VIEW-008: Verifying Videos button');
        const videosButton = page.locator('button:has-text("Videos")');
        expect(await videosButton.isVisible(), 'Videos button should be visible').toBeTruthy();
        await page.screenshot({ path: path.join(screenshotsDir, 'videos-button.png') });
    });
});