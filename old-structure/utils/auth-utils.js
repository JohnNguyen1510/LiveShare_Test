// @ts-check
import fs from 'fs';
import path from 'path';

// Use a relative path approach to avoid both __dirname and import.meta issues
const authStoragePath = path.join(process.cwd(), 'auth-state');

/**
 * Ensure the auth storage directory exists
 */
function ensureAuthStorageDirectory() {
  if (!fs.existsSync(authStoragePath)) {
    fs.mkdirSync(authStoragePath, { recursive: true });
  }
}

/**
 * Save the browser context's storage state for future use
 * @param {import('@playwright/test').BrowserContext} context - Playwright browser context
 * @param {string} authName - Name to identify this auth state
 * @returns {Promise<string>} - Path where the auth state was saved
 */
export async function saveAuthState(context, authName = 'default') {
  ensureAuthStorageDirectory();
  
  const storageStatePath = path.join(authStoragePath, `${authName}-storage-state.json`);
  await context.storageState({ path: storageStatePath });
  
  console.log(`Authentication state saved to: ${storageStatePath}`);
  return storageStatePath;
}

/**
 * Load auth state for browser context creation
 * @param {string} authName - Name to identify this auth state
 * @returns {object} - Object suitable for browser context creation options
 */
export function loadAuthState(authName = 'default') {
  ensureAuthStorageDirectory();
  
  const storageStatePath = path.join(authStoragePath, `${authName}-storage-state.json`);
  
  // If the auth file doesn't exist, return empty object
  if (!fs.existsSync(storageStatePath)) {
    console.warn(`Auth state file not found: ${storageStatePath}`);
    return {};
  }
  
  console.log(`Loading authentication state from: ${storageStatePath}`);
  return { storageState: storageStatePath };
}

/**
 * Check if we have a saved auth state
 * @param {string} authName - Name to identify this auth state
 * @returns {boolean} - Whether auth state exists
 */
export function hasAuthState(authName = 'default') {
  const storageStatePath = path.join(authStoragePath, `${authName}-storage-state.json`);
  return fs.existsSync(storageStatePath);
}

/**
 * Delete a saved auth state
 * @param {string} authName - Name to identify this auth state
 * @returns {boolean} - Whether auth state was deleted
 */
export function deleteAuthState(authName = 'default') {
  const storageStatePath = path.join(authStoragePath, `${authName}-storage-state.json`);
  
  if (fs.existsSync(storageStatePath)) {
    fs.unlinkSync(storageStatePath);
    console.log(`Deleted auth state: ${storageStatePath}`);
    return true;
  }
  
  return false;
} 