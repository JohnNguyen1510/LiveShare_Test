const { test, expect } = require('@playwright/test');
const config = require('../../config/config-loader');

test.describe('Events API', () => {
    let authToken;

    test.beforeAll(async ({ request }) => {
        // Get authentication token for API requests
        // This would typically be done through a login endpoint
        authToken = process.env.API_TOKEN || 'test-token';
    });

    test('should get events list', async ({ request }) => {
        const response = await request.get(`${config.apiBaseURL}${config.endpoints.events}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        expect(response.status()).toBe(200);
        
        const events = await response.json();
        expect(Array.isArray(events)).toBe(true);
    });

    test('should create a new event via API', async ({ request }) => {
        const eventData = {
            name: 'API Test Event',
            description: 'Event created via API test',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 3600000).toISOString() // 1 hour later
        };

        const response = await request.post(`${config.apiBaseURL}${config.endpoints.events}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: eventData
        });

        expect(response.status()).toBe(201);
        
        const createdEvent = await response.json();
        expect(createdEvent.name).toBe(eventData.name);
        expect(createdEvent.description).toBe(eventData.description);
        expect(createdEvent.id).toBeDefined();
    });

    test('should get event by ID', async ({ request }) => {
        // First create an event
        const eventData = {
            name: 'Get Event Test',
            description: 'Event for get by ID test',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 3600000).toISOString()
        };

        const createResponse = await request.post(`${config.apiBaseURL}${config.endpoints.events}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: eventData
        });

        expect(createResponse.status()).toBe(201);
        const createdEvent = await createResponse.json();

        // Now get the event by ID
        const getResponse = await request.get(`${config.apiBaseURL}${config.endpoints.events}/${createdEvent.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        expect(getResponse.status()).toBe(200);
        
        const retrievedEvent = await getResponse.json();
        expect(retrievedEvent.id).toBe(createdEvent.id);
        expect(retrievedEvent.name).toBe(eventData.name);
    });

    test('should update an event via API', async ({ request }) => {
        // First create an event
        const eventData = {
            name: 'Update Event Test',
            description: 'Event for update test',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 3600000).toISOString()
        };

        const createResponse = await request.post(`${config.apiBaseURL}${config.endpoints.events}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: eventData
        });

        expect(createResponse.status()).toBe(201);
        const createdEvent = await createResponse.json();

        // Update the event
        const updateData = {
            name: 'Updated Event Name',
            description: 'Updated event description'
        };

        const updateResponse = await request.put(`${config.apiBaseURL}${config.endpoints.events}/${createdEvent.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: updateData
        });

        expect(updateResponse.status()).toBe(200);
        
        const updatedEvent = await updateResponse.json();
        expect(updatedEvent.name).toBe(updateData.name);
        expect(updatedEvent.description).toBe(updateData.description);
    });

    test('should delete an event via API', async ({ request }) => {
        // First create an event
        const eventData = {
            name: 'Delete Event Test',
            description: 'Event for delete test',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 3600000).toISOString()
        };

        const createResponse = await request.post(`${config.apiBaseURL}${config.endpoints.events}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: eventData
        });

        expect(createResponse.status()).toBe(201);
        const createdEvent = await createResponse.json();

        // Delete the event
        const deleteResponse = await request.delete(`${config.apiBaseURL}${config.endpoints.events}/${createdEvent.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        expect(deleteResponse.status()).toBe(204);

        // Verify event is deleted by trying to get it
        const getResponse = await request.get(`${config.apiBaseURL}${config.endpoints.events}/${createdEvent.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        expect(getResponse.status()).toBe(404);
    });

    test('should handle invalid event data', async ({ request }) => {
        const invalidEventData = {
            // Missing required fields
            description: 'Event without name'
        };

        const response = await request.post(`${config.apiBaseURL}${config.endpoints.events}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: invalidEventData
        });

        expect(response.status()).toBe(400);
        
        const errorResponse = await response.json();
        expect(errorResponse.error).toBeDefined();
    });

    test('should handle unauthorized requests', async ({ request }) => {
        const eventData = {
            name: 'Unauthorized Test',
            description: 'This should fail'
        };

        const response = await request.post(`${config.apiBaseURL}${config.endpoints.events}`, {
            headers: {
                'Content-Type': 'application/json'
                // No Authorization header
            },
            data: eventData
        });

        expect(response.status()).toBe(401);
    });

    test('should handle non-existent event ID', async ({ request }) => {
        const nonExistentId = 'non-existent-id';

        const response = await request.get(`${config.apiBaseURL}${config.endpoints.events}/${nonExistentId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        expect(response.status()).toBe(404);
    });
});

