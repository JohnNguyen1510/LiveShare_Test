import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import path from 'path';
import fs from 'fs';

export class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;

    // Test data
    this.code = '62ME18';

    // ============================================================================
    // NAVIGATION LOCATORS
    // ============================================================================
    this.createAccountLink = this.page.locator('text=Create Free Account').first();
    
    // ============================================================================
    // EMAIL SIGNUP BUTTON SELECTORS
    // ============================================================================
    this.emailButtonSelectors = [
      'button:has-text("Sign in with Email")',
      '.btn-soicial:has-text("Email")',
      'button:has-text("Email")'
    ];

    // ============================================================================
    // TERMS AND CONDITIONS DIALOG LOCATORS
    // ============================================================================
    this.termsDialog = this.page.locator('app-terms-dialog').first();
    this.termsCheckboxes = this.termsDialog.locator('input[type="checkbox"]');
    this.continueButton = this.termsDialog.locator('button:has-text("Continue"), button:has-text("OK")').first();

    // ============================================================================
    // REGISTRATION FORM LOCATORS
    // ============================================================================
    this.nameInput = this.page.locator('input[placeholder="Enter Name"]').first();
    this.emailInput = this.page.locator('input[placeholder="Enter Email"]').first();
    this.passwordInput = this.page.locator('input[placeholder="Enter Password"]').first();
    this.confirmPasswordInput = this.page.locator('input[placeholder="Confirm Password"]').first();
    this.createAccountButton = this.page.locator('button:has-text("Create Account")').first();

    // ============================================================================
    // OTP VERIFICATION LOCATORS
    // ============================================================================
    this.otpInputs = this.page.locator('.otp-box');
    this.otpContinueButton = this.page.locator('button:has-text("Continue to the Event")').first();

    // ============================================================================
    // JOIN EVENT LOCATORS
    // ============================================================================
    this.buttonJoin = this.page.locator('button:has-text("Join")');
    this.uniqueCode = this.page.locator('input[placeholder="Enter Unique ID"]');
    this.joinConfirmButton = this.page.locator('button:has-text("JOIN AN EVENT")');
    
    // ============================================================================
    // GUEST LOGIN LOCATORS
    // ============================================================================
    this.menuButton = this.page.locator('button.mat-menu-trigger:has(mat-icon:has-text("more_vert"))').first();
    this.loginOption = this.page.locator('button[mat-menu-item]:has-text("Login")').first();
    this.nicknameInput = this.page.locator('input[placeholder="Enter a Nickname"]').first();
    this.postAsGuestButton = this.page.locator('button:has-text("Post as Guest")').first();
    this.logoutOption = this.page.locator('button[mat-menu-item]:has-text("Logout")').first();
  }

  // ============================================================================
  // NAVIGATION METHODS
  // ============================================================================

  async NavigateToLoginPage() {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  async clickCreateAccount() {
    await this.createAccountLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.createAccountLink.click();
    await this.page.waitForTimeout(500);
  }

  // ============================================================================
  // EMAIL SIGNUP METHODS
  // ============================================================================

  async clickEmailSignup() {
    // Use tryMultipleSelectors helper from BasePage to simplify
    const result = await this.tryMultipleSelectors(this.emailButtonSelectors, 'click');
    
    if (!result.success) {
      console.error('❌ Email signup button not found');
      return false;
    }
    
    console.log(`✅ Email signup button clicked: ${result.selector}`);
    return true;
  }

  // ============================================================================
  // TERMS AND CONDITIONS METHODS
  // ============================================================================

  async handleTermsAndConditions() {
    // Early return if dialog not visible
    const isDialogVisible = await this.termsDialog.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isDialogVisible) {
      return;
    }
    
    // Early return if continue button not visible
    const isContinueVisible = await this.continueButton.isVisible().catch(() => false);
    if (!isContinueVisible) {
      return;
    }
    
    await this.continueButton.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  // ============================================================================
  // REGISTRATION FORM METHODS
  // ============================================================================

  async fillRegistrationForm(name, email, password) {
    console.log(`📝 Filling registration form for: ${email}`);
    
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
    
    console.log('✅ Registration form filled');
  }

  async submitRegistration() {
    console.log('📤 Submitting registration and waiting for API response...');
    
    // Wait for registration API response using BasePage helper
    const registerResponse = await this.performActionAndWaitForResponse({
      actionPromise: this.createAccountButton.click(),
      apiUrl: '/api/users',
      statusCode: 200,
      requestMethod: 'POST'
    });
    
    if (registerResponse && registerResponse._id) {
      console.log('✅ Registration successful');
      console.log(`User ID: ${registerResponse._id}`);
      return registerResponse;
    }
    
    console.warn('⚠️ Unexpected registration response:', registerResponse);
    return registerResponse;
  }

  async fillAndSubmitRegistrationForm(name, email, password) {
    await this.fillRegistrationForm(name, email, password);
    return await this.submitRegistration();
  }

  async generateTestCredentials() {
    const timestamp = Date.now();
    return {
      name: `auto_user_${timestamp}`,
      email: `auto_${timestamp}@gmail.com`,
      password: '123456!'
    };
  }

  // ============================================================================
  // OTP VERIFICATION METHODS
  // ============================================================================

  async fillOTPCode(otpCode) {
    console.log(`📝 Filling OTP code: ${otpCode}`);
    
    // Wait for OTP inputs to be visible
    await this.otpInputs.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Fill each OTP input field
    const otpString = otpCode.toString();
    for (let i = 0; i < otpString.length && i < 6; i++) {
      const input = this.otpInputs.nth(i);
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.fill(otpString[i]);
      await this.page.waitForTimeout(200);
    }
    
    console.log('✅ OTP code filled');
  }

  async submitOTP() {
    console.log('📤 Submitting OTP...');
    
    await this.otpContinueButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.otpContinueButton.click();
    await this.page.waitForTimeout(3000);
    await this.waitForPageLoad();
    
    console.log('✅ OTP submitted successfully');
  }

  async fillAndSubmitOTP(otpCode) {
    await this.fillOTPCode(otpCode);
    await this.submitOTP();
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

  // ============================================================================
  // JOIN EVENT BY CODE METHODS
  // ============================================================================

  async joinEventByCode(eventCode = null) {
    console.log('🎯 Joining event by code...');
    
    const code = eventCode || this.code;
    
    // Navigate and click Join button
    await this.NavigateToLoginPage();
    await this.buttonJoin.waitFor({ state: 'visible', timeout: 10000 });
    await this.buttonJoin.click();
    await this.page.waitForTimeout(1000);
    
    // Fill unique code and confirm
    await this.uniqueCode.waitFor({ state: 'visible', timeout: 10000 });
    await this.uniqueCode.fill(code);
    
    await this.joinConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.joinConfirmButton.click();
    await this.page.waitForTimeout(2000);
    await this.waitForPageLoad();
    
    console.log(`✅ Joined event with code: ${code}`);
  }

  async openMenuAndSelectLogin() {
    console.log('📋 Opening menu and selecting Login...');
    
    await this.menuButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.menuButton.click();
    await this.page.waitForTimeout(1000);
    
    await this.loginOption.waitFor({ state: 'visible', timeout: 10000 });
    await this.loginOption.click();
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Login option selected');
  }

  async postAsGuest() {
    console.log('👤 Posting as guest...');
    
    const nickname = `Guest_${Date.now()}`;
    
    await this.nicknameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.nicknameInput.fill(nickname);
    await this.page.waitForTimeout(500);
    
    await this.postAsGuestButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.postAsGuestButton.click();
    await this.page.waitForTimeout(2000);
    await this.waitForPageLoad();
    
    console.log(`✅ Posted as guest: ${nickname}`);
  }

  async verifyLogoutOptionVisible() {
    console.log('🔍 Verifying logout option is visible...');
    
    // Open menu
    await this.menuButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.menuButton.click();
    await this.page.waitForTimeout(1000);
    
    // Check logout option
    const isLogoutVisible = await this.logoutOption.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isLogoutVisible) {
      console.log('✅ Logout option is visible - User is logged in');
    } else {
      console.error('❌ Logout option is not visible');
    }
    
    return isLogoutVisible;
  }

  async verifyJoinEventByCode() {
    try {
      // Step 1: Join event by code
      await this.joinEventByCode();
      
      // Step 2: Open menu and select login
      await this.openMenuAndSelectLogin();
      
      // Step 3: Post as guest
      await this.postAsGuest();
      
      // Step 4: Verify logout option is visible
      const isLoggedIn = await this.verifyLogoutOptionVisible();
      
      if (isLoggedIn) {
        console.log('✅ Join event by code and guest login completed successfully');
      } else {
        console.error('❌ Guest login verification failed');
      }
      
      return isLoggedIn;
    } catch (error) {
      console.error('❌ Error in verifyJoinEventByCode:', error.message);
      await this.takeScreenshot('error-join-event-by-code');
      throw error;
    }
  }

  // ============================================================================
  // VERIFICATION METHODS
  // ============================================================================

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
    const result = await this.tryMultipleSelectors(this.emailButtonSelectors, 'isVisible');
    return result.success;
  }

  // ============================================================================
  // COMPLETE REGISTRATION WORKFLOW
  // ============================================================================

  async completeRegistrationFlow(credentials = null) {
    console.log('🎯 Starting complete registration flow...');
    
    try {
      // Generate or use provided credentials
      const creds = credentials || await this.generateTestCredentials();
      
      // Navigate to login page
      await this.NavigateToLoginPage();
      
      // Click create account
      await this.clickCreateAccount();
      
      // Click email signup
      const emailSignupSuccess = await this.clickEmailSignup();
      if (!emailSignupSuccess) {
        throw new Error('Failed to click email signup button');
      }
      
      // Handle terms and conditions
      await this.handleTermsAndConditions();
      
      // Fill and submit registration form
      const registerResponse = await this.fillAndSubmitRegistrationForm(
        creds.name,
        creds.email,
        creds.password
      );
      
      console.log('✅ Registration flow completed');
      
      return {
        credentials: creds,
        response: registerResponse
      };
    } catch (error) {
      console.error('❌ Error in registration flow:', error.message);
      await this.takeScreenshot('error-registration-flow');
      throw error;
    }
  }

}



