require('dotenv').config();

module.exports = {
    baseURL: 'https://staging.livesharenow.com',
    apiBaseURL: 'https://staging-api.livesharenow.com',
    
    // Authentication credentials
    credentials: {
        googleEmail: process.env.STAGING_GOOGLE_EMAIL || 'staging@example.com',
        googlePassword: process.env.STAGING_GOOGLE_PASSWORD || 'stagingpassword'
    },
    
    // Test data
    testData: {
        event: {
            name: 'Staging Test Event',
            description: 'Staging test event for verification purposes',
            editedName: 'Staging Test Event Edited',
            editedDescription: 'Staging test event edited for verification'
        },
        settings: {
            theme: 'light',
            notifications: false,
            language: 'en'
        }
    },
    
    // Page URLs
    pageURL: {
        dashboard: '/dashboard',
        events: '/events',
        settings: '/settings',
        profile: '/profile'
    },
    
    // API endpoints
    endpoints: {
        events: '/api/events',
        users: '/api/users',
        auth: '/api/auth'
    },
    
    // Test configuration
    testConfig: {
        timeout: 90000,
        retries: 3,
        screenshotOnFailure: true,
        videoOnFailure: true
    }
};

