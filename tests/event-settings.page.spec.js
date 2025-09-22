import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { EventPage } from '../page-objects/EventPage.js';
import { EventSettingsPage } from '../page-objects/EventSettingsPage.js';
import path from 'path';

const screenshotsDir = path.join(process.cwd(), 'screenshots');

test.describe('Event Settings (POM) preserves current flow', () => {
  let loginPage;
  let eventPage;
  let settingsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    eventPage = new EventPage(page);
    settingsPage = new EventSettingsPage(page);
  });

  test('Open event, open settings, enable key options, save', async ({ page, context }) => {
    await page.goto('https://app.livesharenow.com/');
    const success = await loginPage.authenticateWithRetry(context, '', 3);
    expect(success).toBeTruthy();

    await eventPage.navigateToEvents();
    await eventPage.clickFirstEvent();

    await settingsPage.openSettingsIfNeeded();
    await settingsPage.waitLoaded();

    // Expect all options texts are present in UI
    await settingsPage.expectOptionVisible('Allow sharing via Facebook');
    await settingsPage.expectOptionVisible('Allow Guest Download');
    await settingsPage.expectOptionVisible('Add Event Managers');
    await settingsPage.expectOptionVisible('Allow posting without login');
    await settingsPage.expectOptionVisible('Require Access Passcode');

    await settingsPage.expectOptionVisible('Event Name');
    await settingsPage.expectOptionVisible('Event Date');
    await settingsPage.expectOptionVisible('Enable Photo Gifts');
    await settingsPage.expectOptionVisible('Event Header Photo');
    await settingsPage.expectOptionVisible('Location');
    await settingsPage.expectOptionVisible('Contact');
    await settingsPage.expectOptionVisible('Itinerary');
    await settingsPage.expectOptionVisible('Enable Message Post');
    await settingsPage.expectOptionVisible('Popularity Badges');
    await settingsPage.expectOptionVisible('Video');

    await settingsPage.expectOptionVisible('Button Link #1');
    await settingsPage.expectOptionVisible('Button Link #2');
    await settingsPage.expectOptionVisible('Welcome Popup');

    await settingsPage.expectOptionVisible('LiveView Slideshow');
    await settingsPage.expectOptionVisible('Then And Now');
    await settingsPage.expectOptionVisible('Movie Editor');
    await settingsPage.expectOptionVisible('KeepSake');
    await settingsPage.expectOptionVisible('Scavenger Hunt');
    await settingsPage.expectOptionVisible('Sponsor');
    await settingsPage.expectOptionVisible('Prize');
    await settingsPage.expectOptionVisible('Force Login');

    // Align with existing flow: ensure FB, Guest Download, Posting without login are enabled
    await settingsPage.enableFacebookSharing();
    await settingsPage.enableGuestDownload();
    await settingsPage.enablePostingWithoutLogin();
    await settingsPage.enablePopularityBadges();
    await settingsPage.enableVideo();
    await settingsPage.enableWelcomePopup();
    await settingsPage.enableLiveView();
    await settingsPage.enableThenAndNow();
    await settingsPage.enableMovieEditor();
    await settingsPage.enableKeepSake();

    await settingsPage.save();
  });
});


