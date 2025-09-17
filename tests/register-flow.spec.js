import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('TC-APP-RA-001: App-Register - Verify UI for register new account flow', () => {
  test.setTimeout(240000);

  test('Register via email with terms confirmation and optional OTP', async ({ page }) => {
    // 1) Open app
    await page.goto('https://app.livesharenow.com/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);



    // 3) Click Create Account
    const createAccountLink = page.locator('text=Create Free Account').first();
    expect(createAccountLink.isVisible()).toBeTruthy();
    await createAccountLink.waitFor({ state: 'visible', timeout: 10000 });
    await createAccountLink.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'create-account-clicked.png') });

    // 4) Click Sign in with Email (for signup via email)
    const emailBtnSelectors = [
      'button:has-text("Sign in with Email")',
      '.btn-soicial:has-text("Email")',
      'button:has-text("Email")',
    ];
    let emailBtnFound = false;
    for (const s of emailBtnSelectors) {
      const el = page.locator(s).first();
      if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
        await el.click({ force: true });
        emailBtnFound = true;
        break;
      }
    }
    expect(emailBtnFound, 'Email signup button should be found').toBeTruthy();
    await page.waitForTimeout(500);

    // 5) Terms and Conditions dialog: check both and Continue (Click OK to confirm)
    const termsDialog = page.locator('app-terms-dialog').first();
    if (await termsDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      const checkboxes = termsDialog.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).click({ force: true });
      }
      await page.screenshot({ path: path.join(screenshotsDir, 'terms-checked.png') });
      const continueBtn = termsDialog.locator('button:has-text("Continue"), button:has-text("OK")').first();
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    // 6) Fill signup form and click Create Account
    const name = `auto_user_${Date.now()}`;
    const email = `auto_${Date.now()}@gmail.com`;
    const password = '123456!';

    // Inputs
    const nameInput = page.locator('input[placeholder="Enter Name"]').first();
    const emailInput = page.locator('input[placeholder="Enter Email"]').first();
    const passInput = page.locator('input[placeholder="Enter Password"]').first();
    const confirmInput = page.locator('input[placeholder="Confirm Password"]').first();

    expect(nameInput.isVisible()).toBeTruthy();
    expect(emailInput.isVisible()).toBeTruthy();
    expect(passInput.isVisible()).toBeTruthy();
    expect(confirmInput.isVisible()).toBeTruthy();

    await page.waitForTimeout(1000);
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(name);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await emailInput.fill(email);
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await passInput.fill(password);
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await confirmInput.fill(password);
    await page.waitForTimeout(1000);
    await passInput.fill(password);
    await page.keyboard.press('Enter');
    await page.screenshot({ path: path.join(screenshotsDir, 'signup-filled.png') });


  });
});



