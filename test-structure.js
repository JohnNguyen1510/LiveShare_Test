#!/usr/bin/env node

/**
 * Test script to verify the new structure is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing LiveShare Test Framework Structure...\n');

// Test 1: Check if all required directories exist
console.log('📁 Checking directory structure...');
const requiredDirs = [
    'src',
    'src/config',
    'src/config/environments',
    'src/pages',
    'src/tests',
    'src/tests/ui',
    'src/tests/api',
    'src/utils',
    'src/fixtures',
    'src/scripts',
    'test-assets',
    'test-assets/upload-images'
];

let dirCheckPassed = true;
requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`  ✅ ${dir}`);
    } else {
        console.log(`  ❌ ${dir} - Missing`);
        dirCheckPassed = false;
    }
});

// Test 2: Check if all required files exist
console.log('\n📄 Checking required files...');
const requiredFiles = [
    'src/config/config-loader.js',
    'src/config/environments/dev.js',
    'src/config/environments/staging.js',
    'src/config/environments/production.js',
    'src/pages/base-page.js',
    'src/pages/login-page.js',
    'src/pages/event-page.js',
    'src/utils/test-data-factory.js',
    'src/utils/auth-utils.js',
    'src/fixtures/base-fixtures.js',
    'src/tests/ui/event-management.spec.js',
    'src/tests/api/events-api.spec.js',
    'playwright.config.js',
    'global-setup.js',
    'package.json',
    'README.md',
    'env.example'
];

let fileCheckPassed = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - Missing`);
        fileCheckPassed = false;
    }
});

// Test 3: Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = [
        'test',
        'test:ui',
        'test:debug',
        'test:headed',
        'test:ui-only',
        'test:api-only',
        'test:dev',
        'test:staging',
        'test:prod',
        'report',
        'install:browsers',
        'setup',
        'clean'
    ];

    let scriptCheckPassed = true;
    requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
            console.log(`  ✅ ${script}`);
        } else {
            console.log(`  ❌ ${script} - Missing`);
            scriptCheckPassed = false;
        }
    });

    // Test 4: Check dependencies
    console.log('\n🔧 Checking dependencies...');
    const requiredDeps = [
        '@playwright/test',
        'dotenv',
        'short-unique-id'
    ];

    let depCheckPassed = true;
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`  ✅ ${dep}`);
        } else {
            console.log(`  ❌ ${dep} - Missing`);
            depCheckPassed = false;
        }
    });

    // Test 5: Check dev dependencies
    const requiredDevDeps = [
        'eslint',
        'rimraf'
    ];

    requiredDevDeps.forEach(dep => {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
            console.log(`  ✅ ${dep} (dev)`);
        } else {
            console.log(`  ❌ ${dep} (dev) - Missing`);
            depCheckPassed = false;
        }
    });

} catch (error) {
    console.log(`  ❌ Error reading package.json: ${error.message}`);
    fileCheckPassed = false;
}

// Test 6: Check if old structure is preserved
console.log('\n📦 Checking old structure preservation...');
if (fs.existsSync('old-structure')) {
    console.log('  ✅ Old structure preserved in old-structure/');
    const oldDirs = fs.readdirSync('old-structure');
    oldDirs.forEach(dir => {
        console.log(`    📁 ${dir}`);
    });
} else {
    console.log('  ❌ Old structure not found');
}

// Test 7: Check environment configuration
console.log('\n🌍 Checking environment configuration...');
try {
    const configLoader = require('./src/config/config-loader');
    if (configLoader && configLoader.baseURL) {
        console.log(`  ✅ Config loaded successfully`);
        console.log(`    Base URL: ${configLoader.baseURL}`);
        console.log(`    API Base URL: ${configLoader.apiBaseURL}`);
    } else {
        console.log('  ❌ Config not loaded properly');
    }
} catch (error) {
    console.log(`  ❌ Error loading config: ${error.message}`);
}

// Summary
console.log('\n📊 Summary:');
console.log(`  Directory Structure: ${dirCheckPassed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Required Files: ${fileCheckPassed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Package Scripts: ${scriptCheckPassed ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Dependencies: ${depCheckPassed ? '✅ PASS' : '❌ FAIL'}`);

const overallPassed = dirCheckPassed && fileCheckPassed && scriptCheckPassed && depCheckPassed;

if (overallPassed) {
    console.log('\n🎉 All tests passed! The new structure is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('  1. Copy env.example to .env and configure your credentials');
    console.log('  2. Run: npm run install:browsers');
    console.log('  3. Run: npm test');
    console.log('  4. Check the old-structure/ folder for reference to old tests');
} else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
    process.exit(1);
}

