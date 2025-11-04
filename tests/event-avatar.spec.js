import { test, expect } from '@playwright/test';
import { EventListPage } from '../page-objects/EventListPage.js';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

test.describe('Event Avatar Icon', () => {
  test.setTimeout(240000);
  
  let eventListPage;

  test.beforeEach(async ({ page }) => {
    eventListPage = new EventListPage(page);
  });

  test('TC-APP-AI-001-005: Verify Avatar Icon in Event Page using POM', async ({ page }) => {
    try {
      // Execute complete avatar menu verification workflow
      const success = await eventListPage.verifyAvatarMenuWorkflow();
      expect(success, 'Avatar menu workflow should complete successfully').toBeTruthy();
      
    } catch (error) {
      await page.screenshot({ path: path.join(screenshotsDir, `error-avatar-icon-${Date.now()}.png`) });
      throw error;
    }
  });
});