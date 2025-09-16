require('dotenv').config();

module.exports = {
    baseURL: 'https://app.livesharenow.com',
    apiBaseURL: 'https://api.livesharenow.com',
    
    // Authentication credentials
    credentials: {
        googleEmail: process.env.GOOGLE_EMAIL || 'test@example.com',
        googlePassword: process.env.GOOGLE_PASSWORD || 'testpassword'
    },
    
    // Test data
    testData: {
        event: {
            name: 'Auto Test Event',
            description: 'Automated test event for verification purposes',
            editedName: 'Auto Test Event Edited',
            editedDescription: 'Automated test event edited for verification'
        },
        settings: {
            theme: 'dark',
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
        timeout: 60000,
        retries: 2,
        screenshotOnFailure: true,
        videoOnFailure: true
    }
};

