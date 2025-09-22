import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

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
}


