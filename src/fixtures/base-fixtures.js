const { test: base } = require('@playwright/test');
const LoginPage = require('../pages/login-page');
const EventPage = require('../pages/event-page');
const { loadAuthState, hasAuthState } = require('../utils/auth-utils');

/**
 * Define the custom fixtures
 */
const fixtures = {
  // Login page fixture
  loginPage: [async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  }, { scope: 'test' }],
  
  // Event page fixture
  eventPage: [async ({ page }, use) => {
    const eventPage = new EventPage(page);
    await use(eventPage);
  }, { scope: 'test' }],
  
  // Authenticated page fixture
  authenticatedPage: [async ({ browser }, use) => {
    // Check if we have saved auth state
    const hasAuth = hasAuthState('liveshare');
    const contextOptions = hasAuth 
      ? loadAuthState('liveshare') 
      : {
          viewport: { width: 1280, height: 720 },
          recordVideo: { dir: './videos/' },
        };
    
    // Create a context with the loaded auth state
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    
    // If we don't have auth, try to authenticate
    if (!hasAuth) {
      console.warn('⚠️ No saved authentication found. Please run auth script first!');
      console.warn('Run: npm run test:auth');
    }
    
    await use(page);
    
    // Clean up
    await context.close();
  }, { scope: 'test' }],

  // Authenticated login page fixture
  authenticatedLoginPage: [async ({ browser }, use) => {
    // Check if we have saved auth state
    const hasAuth = hasAuthState('liveshare');
    const contextOptions = hasAuth 
      ? loadAuthState('liveshare') 
      : {
          viewport: { width: 1280, height: 720 },
          recordVideo: { dir: './videos/' },
        };
    
    // Create a context with the loaded auth state
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    
    // If we don't have auth, try to authenticate
    if (!hasAuth) {
      console.warn('⚠️ No saved authentication found. Please run auth script first!');
      console.warn('Run: npm run test:auth');
    }
    
    await use(loginPage);
    
    // Clean up
    await context.close();
  }, { scope: 'test' }],

  // Authenticated event page fixture
  authenticatedEventPage: [async ({ browser }, use) => {
    // Check if we have saved auth state
    const hasAuth = hasAuthState('liveshare');
    const contextOptions = hasAuth 
      ? loadAuthState('liveshare') 
      : {
          viewport: { width: 1280, height: 720 },
          recordVideo: { dir: './videos/' },
        };
    
    // Create a context with the loaded auth state
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    const eventPage = new EventPage(page);
    
    // If we don't have auth, try to authenticate
    if (!hasAuth) {
      console.warn('⚠️ No saved authentication found. Please run auth script first!');
      console.warn('Run: npm run test:auth');
    }
    
    await use(eventPage);
    
    // Clean up
    await context.close();
  }, { scope: 'test' }]
};

/**
 * Extend the base test with our fixtures
 */
const test = base.extend(fixtures);

module.exports = { test };
