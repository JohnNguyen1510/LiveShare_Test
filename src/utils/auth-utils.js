const fs = require('fs');
const path = require('path');

// Use a relative path approach to avoid both __dirname and import.meta issues
const authStoragePath = path.join(process.cwd(), 'src', 'auth');
const globalSetupAuthFile = path.join(authStoragePath, 'user-auth.json');

/**
 * Ensure the auth storage directory exists
 */
function ensureAuthStorageDirectory() {
  if (!fs.existsSync(authStoragePath)) {
    fs.mkdirSync(authStoragePath, { recursive: true });
  }
}

function resolveAuthStatePath(authName = 'default') {
  // Prefer global-setup auth file if present
  if (fs.existsSync(globalSetupAuthFile)) {
    return globalSetupAuthFile;
  }
  return path.join(authStoragePath, `${authName}-storage-state.json`);
}

/**
 * Save the browser context's storage state for future use
 * @param {import('@playwright/test').BrowserContext} context - Playwright browser context
 * @param {string} authName - Name to identify this auth state
 * @returns {Promise<string>} - Path where the auth state was saved
 */
async function saveAuthState(context, authName = 'default') {
  ensureAuthStorageDirectory();
  
  const storageStatePath = resolveAuthStatePath(authName);
  await context.storageState({ path: storageStatePath });
  
  console.log(`Authentication state saved to: ${storageStatePath}`);
  return storageStatePath;
}

/**
 * Load auth state for browser context creation
 * @param {string} authName - Name to identify this auth state
 * @returns {object} - Object suitable for browser context creation options
 */
function loadAuthState(authName = 'default') {
  ensureAuthStorageDirectory();
  
  const storageStatePath = resolveAuthStatePath(authName);
  
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
function hasAuthState(authName = 'default') {
  const storageStatePath = resolveAuthStatePath(authName);
  return fs.existsSync(storageStatePath);
}

/**
 * Delete a saved auth state
 * @param {string} authName - Name to identify this auth state
 * @returns {boolean} - Whether auth state was deleted
 */
function deleteAuthState(authName = 'default') {
  const storageStatePath = resolveAuthStatePath(authName);
  
  if (fs.existsSync(storageStatePath)) {
    fs.unlinkSync(storageStatePath);
    console.log(`Deleted auth state: ${storageStatePath}`);
    return true;
  }
  
  return false;
}

/**
 * Get all saved auth states
 * @returns {string[]} - Array of auth state names or paths
 */
function getAllAuthStates() {
  ensureAuthStorageDirectory();
  try {
    const files = fs.readdirSync(authStoragePath);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Error reading auth states:', error);
    return [];
  }
}

/**
 * Clear all auth states
 * @returns {number} - Number of auth states cleared
 */
function clearAllAuthStates() {
  const files = getAllAuthStates();
  let clearedCount = 0;
  for (const file of files) {
    const p = path.join(authStoragePath, file);
    try {
      fs.unlinkSync(p);
      clearedCount++;
    } catch (e) {}
  }
  console.log(`Cleared ${clearedCount} auth states`);
  return clearedCount;
}

/**
 * Check if auth state is expired (24h default)
 * @param {string} authName - Name to identify this auth state
 * @returns {boolean} - Whether auth state is expired
 */
function isAuthStateExpired(authName = 'default') {
  const storageStatePath = resolveAuthStatePath(authName);
  if (!fs.existsSync(storageStatePath)) return true;
  try {
    const stats = fs.statSync(storageStatePath);
    const hoursDiff = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
    return hoursDiff > 24;
  } catch (error) {
    console.error('Error checking auth state expiration:', error);
    return true;
  }
}

/**
 * Get auth state info
 * @param {string} authName - Name to identify this auth state
 * @returns {object} - Auth state information
 */
function getAuthStateInfo(authName = 'default') {
  const storageStatePath = resolveAuthStatePath(authName);
  if (!fs.existsSync(storageStatePath)) {
    return { exists: false, path: storageStatePath, expired: true, size: 0, lastModified: null };
    }
  try {
    const stats = fs.statSync(storageStatePath);
    const hoursDiff = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
    return {
      exists: true,
      path: storageStatePath,
      expired: hoursDiff > 24,
      size: stats.size,
      lastModified: new Date(stats.mtimeMs),
      ageHours: Math.round(hoursDiff * 100) / 100
    };
  } catch (error) {
    console.error('Error getting auth state info:', error);
    return { exists: false, path: storageStatePath, expired: true, size: 0, lastModified: null, error: error.message };
  }
}

module.exports = {
  saveAuthState,
  loadAuthState,
  hasAuthState,
  deleteAuthState,
  getAllAuthStates,
  clearAllAuthStates,
  isAuthStateExpired,
  getAuthStateInfo
};

