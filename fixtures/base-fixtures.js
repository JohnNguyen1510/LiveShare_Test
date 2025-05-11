// @ts-check
import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';
import { loadAuthState, hasAuthState } from '../utils/auth-utils.js';

/**
 * Define the custom fixtures
 */
const fixtures = {
  loginPage: [async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  }, { scope: 'test' }],
  
  todoPage: [async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await use(todoPage);
  }, { scope: 'test' }],
  
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
  }, { scope: 'test' }]
};

/**
 * Extend the base test with our fixtures
 */
export const test = base.extend(fixtures); 