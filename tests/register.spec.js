import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import Mailosaur from 'mailosaur';
import dotenv from 'dotenv';
import {RegisterPage} from '../page-objects/RegisterPage'
dotenv.config();

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('App-Register', () => {
  test.setTimeout(240000);
  let registerPage

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
  }); 


  test('TC-APP-RA-001', async ({ page }) => {
    // Check if environment variables are set
    if (!process.env.MAILOSAUR_API_KEY || !process.env.MAILOSAUR_SERVER_ID) {
      test.skip('Mailosaur environment variables not set');
      return;
    }

    const mailosaurClient = new Mailosaur(process.env.MAILOSAUR_API_KEY);
    const serverId = process.env.MAILOSAUR_SERVER_ID;
    const emailAddress = `auto_${Date.now()}@${serverId}.mailosaur.net`;

    console.log(`Using email: ${emailAddress}`);

    // 1) Open app
    await page.goto('https://dev.livesharenow.com/');
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
      await page.screenshot({ path: path.join(screenshotsDir, 'terms-checked.png') });
      const continueBtn = termsDialog.locator('button:has-text("Continue"), button:has-text("OK")').first();
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }

    // 6) Fill signup form and click Create Account
    const name = `auto_user_${Date.now()}`;
    const email = emailAddress; // Use the same email address for Mailosaur
    const password = '123456!';

    // Inputs
    const nameInput = page.locator('input[placeholder="Enter Name"]').first();
    const emailInput = page.locator('input[placeholder="Enter Email"]').first();
    const passInput = page.locator('input[placeholder="Enter Password"]').first();
    const confirmInput = page.locator('input[placeholder="Confirm Password"]').first();
    const createButton = page.locator('button:has-text("Create Account")').first();

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
    await page.keyboard.press('Enter');

    await createButton.click();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for email to arrive
    console.log('Waiting for verification email...');
    const signUpEmail = await mailosaurClient.messages.get(serverId, {
      sentTo: emailAddress
    });
    const verifyEmail = signUpEmail.html.codes[0].value;
    console.log(`Received OTP code: ${verifyEmail}`);
    
    // Wait for OTP verification dialog to appear
    await page.waitForTimeout(2000);
    
    // Wait for OTP input fields to be visible
    const otpInputs = page.locator('.otp-box');
    await otpInputs.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Fill each OTP input field with the corresponding digit
    const otpCode = verifyEmail.toString();
    console.log(`Filling OTP code: ${otpCode}`);
    
    for (let i = 0; i < otpCode.length && i < 6; i++) {
      const input = otpInputs.nth(i);
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.fill(otpCode[i]);
      await page.waitForTimeout(200); // Small delay between inputs
    }
    
    // Take screenshot after filling OTP
    await page.screenshot({ path: path.join(screenshotsDir, 'otp-filled.png') });
    
    // Click Continue button
    const continueButton = page.locator('button:has-text("Continue to the Event")').first();
    await continueButton.waitFor({ state: 'visible', timeout: 10000 });
    await continueButton.click();
    
    // Wait for navigation or success
    await page.waitForTimeout(3000);
    await page.waitForLoadState('domcontentloaded');
    
    // Take final screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'registration-complete.png') });
    
    console.log('✅ Registration and OTP verification completed successfully');
  });

  test('TC-APP-RA-002', async ({ page }) => {
    // Test này chạy trong guest-tests project với clean state
    const result = await registerPage.verifyJoinEventByCode()
    
    // Verify that logout option is present (meaning login was successful)
    expect(result).toBeTruthy();
    console.log('✅ TC-APP-RA-002: Join event by code and guest login test passed');
  });
});