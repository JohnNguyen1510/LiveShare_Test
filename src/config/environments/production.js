require('dotenv').config();

module.exports = {
    baseURL: 'https://app.livesharenow.com',
    apiBaseURL: 'https://api.livesharenow.com',
    
    // Authentication credentials
    credentials: {
        googleEmail: process.env.PROD_GOOGLE_EMAIL || 'prod@example.com',
        googlePassword: process.env.PROD_GOOGLE_PASSWORD || 'prodpassword'
    },
    
    // Test data
    testData: {
        event: {
            name: 'Production Test Event',
            description: 'Production test event for verification purposes',
            editedName: 'Production Test Event Edited',
            editedDescription: 'Production test event edited for verification'
        },
        settings: {
            theme: 'auto',
            notifications: true,
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
        timeout: 120000,
        retries: 1,
        screenshotOnFailure: true,
        videoOnFailure: false
    }
};

