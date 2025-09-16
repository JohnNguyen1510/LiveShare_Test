const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Loads configuration based on environment
 * @returns {Object} The configuration object
 */
function loadConfig() {
  // Get environment from .env file or use 'dev' as default
  const env = process.env.MODE || 'dev';
  console.log(`Loading config for environment: ${env}`);
  
  try {
    const configPath = path.join(__dirname, 'environments', `${env}.js`);
    
    if (fs.existsSync(configPath)) {
      const envConfig = require(configPath);
      
      const config = { ...envConfig };
      
      console.log('Config loaded from environment:', env);
      console.log('Config path:', configPath);
      
      return config;
    } else {
      console.warn(`Configuration file for environment '${env}' not found.`);
      return {};
    }
  } catch (error) {
    console.error(`Error loading configuration: ${error.message}`);
    return {};
  }
}

module.exports = loadConfig();

