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
  test.setTimeout(120000);
  let registerPage

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
  }); 


  test('TC-APP-RA-001: Complete registration flow with email verification', async ({ page }) => {
    // Check if environment variables are set
    if (!process.env.MAILOSAUR_API_KEY || !process.env.MAILOSAUR_SERVER_ID) {
      test.skip('Mailosaur environment variables not set');
      return;
    }

    const mailosaurClient = new Mailosaur(process.env.MAILOSAUR_API_KEY);
    const serverId = process.env.MAILOSAUR_SERVER_ID;
    // Generate unique identifiers for parallel-safe email
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const processId = process.pid || Math.floor(Math.random() * 10000);
    const emailAddress = `auto_${timestamp}_${processId}_${randomId}@${serverId}.mailosaur.net`;

    console.log(`📧 Using email: ${emailAddress}`);

    // Prepare credentials for Mailosaur email
    const credentials = {
      name: `auto_user_${timestamp}_${processId}`,
      email: emailAddress,
      password: '123456!'
    };

    // Execute complete registration flow using page object
    const registrationResult = await registerPage.completeRegistrationFlow(credentials);
    
    // Verify registration was successful
    expect(registrationResult.response).toHaveProperty('message', 'Account created. Please verify with OTP sent to your email.');
    console.log(`✅ Registration successful. User ID: ${registrationResult.response._id}`);
    
    // Wait for verification email from Mailosaur
    console.log('📬 Waiting for verification email...');
    const signUpEmail = await mailosaurClient.messages.get(serverId, {
      sentTo: emailAddress
    });
    const otpCode = signUpEmail.html.codes[0].value;
    console.log(`📝 Received OTP code: ${otpCode}`);
    
    // Wait for OTP dialog to appear
    await page.waitForTimeout(2000);
    
    // Fill and submit OTP using page object
    await registerPage.fillAndSubmitOTP(otpCode);
    
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