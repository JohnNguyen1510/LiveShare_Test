import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import path from 'path';
import fs from 'fs';

export class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    this.code = '62ME18'

    // Registration flow locators
    this.createAccountLink = this.page.locator('text=Create Free Account').first();
    
    // Email signup button selectors
    this.emailButtonSelectors = [
      'button:has-text("Sign in with Email")',
      '.btn-soicial:has-text("Email")',
      'button:has-text("Email")'
    ];

    // Terms and conditions dialog
    this.termsDialog = this.page.locator('app-terms-dialog').first();
    this.termsCheckboxes = this.termsDialog.locator('input[type="checkbox"]');
    this.continueButton = this.termsDialog.locator('button:has-text("Continue"), button:has-text("OK")').first();

    // Registration form fields
    this.nameInput = this.page.locator('input[placeholder="Enter Name"]').first();
    this.emailInput = this.page.locator('input[placeholder="Enter Email"]').first();
    this.passwordInput = this.page.locator('input[placeholder="Enter Password"]').first();
    this.confirmPasswordInput = this.page.locator('input[placeholder="Confirm Password"]').first();
    this.createAccountButton = this.page.locator('button:has-text("Create Account")').first();

    //Join into event
    this.buttonJoin = this.page.locator('button:has-text("Join")')
    this.uniqueCode = this.page.locator('input[placeholder="Enter Unique ID"]')
    this.joinConfirmButton = this.page.locator('button:has-text("JOIN AN EVENT")')

  }

  async NavigateToLoginPage(){
    await this.page.goto('https://dev.livesharenow.com/')
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreateAccount() {
    await this.createAccountLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.createAccountLink.click();
    await this.page.waitForTimeout(500);
  }

  async clickEmailSignup() {
    let emailBtnFound = false;
    for (const selector of this.emailButtonSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        await element.click({ force: true });
        emailBtnFound = true;
        break;
      }
    }
    return emailBtnFound;
  }

  async handleTermsAndConditions() {
    if (await this.termsDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      
      if (await this.continueButton.isVisible().catch(() => false)) {
        await this.continueButton.click({ force: true });
        await this.page.waitForTimeout(500);
      }
    }
  }

  async fillRegistrationForm(name, email, password) {
    // Fill name
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.nameInput.fill(name);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);

    // Fill email
    await this.emailInput.fill(email);
    await this.page.waitForTimeout(1000);
    await this.page.keyboard.press('Enter');

    // Fill password
    await this.passwordInput.fill(password);
    await this.page.waitForTimeout(1000);
    await this.page.keyboard.press('Enter');

    // Fill confirm password
    await this.confirmPasswordInput.fill(password);
    await this.page.waitForTimeout(1000);
    await this.passwordInput.fill(password);
    await this.page.keyboard.press('Enter');
  }

  async generateTestCredentials() {
    const timestamp = Date.now();
    return {
      name: `auto_user_${timestamp}`,
      email: `auto_${timestamp}@gmail.com`,
      password: '123456!'
    };
  }

  // Verification methods
  async verifyCreateAccountLinkVisible() {
    return await this.createAccountLink.isVisible();
  }

  async verifyRegistrationFormVisible() {
    const nameVisible = await this.nameInput.isVisible();
    const emailVisible = await this.emailInput.isVisible();
    const passwordVisible = await this.passwordInput.isVisible();
    const confirmVisible = await this.confirmPasswordInput.isVisible();
    
    return nameVisible && emailVisible && passwordVisible && confirmVisible;
  }

  async verifyTermsDialogVisible() {
    return await this.termsDialog.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async verifyEmailButtonVisible() {
    for (const selector of this.emailButtonSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        return true;
      }
    }
    return false;
  }

  async verifyJoinEventByCode() {
    // 1. Navigate to login page and click Join button
    await this.NavigateToLoginPage()
    await this.buttonJoin.waitFor({ state: 'visible', timeout: 10000 });
    await this.buttonJoin.click()
    
    await this.page.waitForTimeout(1000)

    // 2. Fill unique code and confirm
    await this.uniqueCode.waitFor({ state: 'visible', timeout: 10000 });
    await this.uniqueCode.fill(this.code)

    await this.joinConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.joinConfirmButton.click()
    await this.page.waitForTimeout(2000)
    await this.page.waitForLoadState('networkidle');

    // Take screenshot after joining event
    await this.page.screenshot({ path: path.join(process.cwd(), 'screenshots', 'joined-event.png') });

    // 3. Click on menu (3 dots) to access login
    const menuButton = this.page.locator('button.mat-menu-trigger:has(mat-icon:has-text("more_vert"))').first();
    await menuButton.waitFor({ state: 'visible', timeout: 10000 });
    await menuButton.click();
    await this.page.waitForTimeout(1000);

    // 4. Click Login option from menu
    const loginOption = this.page.locator('button[mat-menu-item]:has-text("Login")').first();
    await loginOption.waitFor({ state: 'visible', timeout: 10000 });
    await loginOption.click();
    await this.page.waitForTimeout(2000);

    // Take screenshot of login dialog
    await this.page.screenshot({ path: path.join(process.cwd(), 'screenshots', 'login-dialog.png') });

    // 5. Fill nickname and click Post as Guest
    const nicknameInput = this.page.locator('input[placeholder="Enter a Nickname"]').first();
    await nicknameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nicknameInput.fill(`Guest_${Date.now()}`);
    await this.page.waitForTimeout(500);

    const postAsGuestButton = this.page.locator('button:has-text("Post as Guest")').first();
    await postAsGuestButton.waitFor({ state: 'visible', timeout: 10000 });
    await postAsGuestButton.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('networkidle');

    // Take screenshot after posting as guest
    await this.page.screenshot({ path: path.join(process.cwd(), 'screenshots', 'posted-as-guest.png') });

    // 6. Navigate back to event page and verify logout option
    await this.page.waitForTimeout(1000);

    // Click menu again to verify logout option is present
    const menuButtonAgain = this.page.locator('button.mat-menu-trigger:has(mat-icon:has-text("more_vert"))').first();
    await menuButtonAgain.waitFor({ state: 'visible', timeout: 10000 });
    await menuButtonAgain.click();
    await this.page.waitForTimeout(1000);

    // Verify logout option is visible (this means user is logged in)
    const logoutOption = this.page.locator('button[mat-menu-item]:has-text("Logout")').first();
    const isLogoutVisible = await logoutOption.isVisible({ timeout: 5000 }).catch(() => false);
    
    // Take final screenshot
    await this.page.screenshot({ path: path.join(process.cwd(), 'screenshots', 'final-verification.png') });

    console.log('✅ Join event by code and guest login completed successfully');
    
    // Return verification result
    return isLogoutVisible;
  }

}



