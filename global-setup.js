const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const config = require('./src/config/config-loader');

/**
 * Global setup function that runs before all tests
 * @param {import('@playwright/test').FullConfig} config - Playwright configuration
 */
async function globalSetup(config) {
    console.log('🚀 Starting global setup...');
    
    // Create necessary directories
    const directories = [
        'screenshots',
        'videos',
        'test-results',
        'src/auth',
        'test-assets',
        'test-assets/upload-images'
    ];
    
    directories.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    });
    
    // Check if authentication is needed
    const authFile = path.join(process.cwd(), 'src/auth/user-auth.json');
    const needsAuth = !fs.existsSync(authFile) || process.env.FORCE_AUTH === 'true';
    
    if (needsAuth) {
        console.log('🔐 Authentication required, setting up auth...');
        await setupAuthentication();
    } else {
        console.log('✅ Authentication already exists, skipping auth setup');
    }
    
    // Generate test assets if needed
    await generateTestAssets();
    
    console.log('✅ Global setup completed successfully');
}

/**
 * Set up authentication for tests
 */
async function setupAuthentication() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Import LoginPage
        const LoginPage = require('./src/pages/login-page');
        const loginPage = new LoginPage(page);
        
        // Navigate to login page
        await loginPage.goToPage();
        
        // Perform authentication
        const authSuccess = await loginPage.authenticateWithRetry(context, config.credentials.googleEmail);
        
        if (authSuccess) {
            // Save authentication state
            await loginPage.saveAuthState();
            console.log('✅ Authentication setup completed successfully');
        } else {
            console.error('❌ Authentication setup failed');
            throw new Error('Authentication setup failed');
        }
    } catch (error) {
        console.error('❌ Error during authentication setup:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

/**
 * Generate test assets (images, files, etc.)
 */
async function generateTestAssets() {
    console.log('📸 Generating test assets...');
    
    const testAssetsDir = path.join(process.cwd(), 'test-assets');
    const uploadImagesDir = path.join(testAssetsDir, 'upload-images');
    
    // Test image files to generate
    const testImageFiles = [
        { name: 'test-image-1.jpg', width: 800, height: 600, color: '#ff0000' },
        { name: 'test-image-2.jpg', width: 800, height: 600, color: '#00ff00' },
        { name: 'test-image-3.jpg', width: 800, height: 600, color: '#0000ff' }
    ];
    
    // Check if all test images exist
    const allImagesExist = testImageFiles.every(img => 
        fs.existsSync(path.join(uploadImagesDir, img.name))
    );
    
    if (!allImagesExist) {
        console.log('📝 Creating README for test assets...');
        const readmePath = path.join(uploadImagesDir, 'README.txt');
        fs.writeFileSync(
            readmePath, 
            'This folder contains sample images for upload testing.\n' +
            'You can replace these with your own test images if needed.\n' +
            'Images should be jpg or png format and less than 5MB in size.\n\n' +
            'Generated test images:\n' +
            testImageFiles.map(img => `- ${img.name} (${img.width}x${img.height}, ${img.color})`).join('\n')
        );
        
        console.log('⚠️  Test images not found. Please add your own test images to test-assets/upload-images/');
        console.log('   Expected files:', testImageFiles.map(img => img.name).join(', '));
    } else {
        console.log('✅ All test images exist');
    }
    
    // Create sample test data file
    const testDataPath = path.join(testAssetsDir, 'sample-test-data.json');
    if (!fs.existsSync(testDataPath)) {
        const sampleData = {
            events: [
                {
                    name: 'Sample Event 1',
                    description: 'This is a sample event for testing',
                    tags: ['sample', 'test']
                },
                {
                    name: 'Sample Event 2',
                    description: 'Another sample event for testing',
                    tags: ['sample', 'test', 'demo']
                }
            ],
            users: [
                {
                    name: 'Test User 1',
                    email: 'testuser1@example.com'
                },
                {
                    name: 'Test User 2',
                    email: 'testuser2@example.com'
                }
            ]
        };
        
        fs.writeFileSync(testDataPath, JSON.stringify(sampleData, null, 2));
        console.log('📄 Created sample test data file');
    }
}

module.exports = globalSetup;