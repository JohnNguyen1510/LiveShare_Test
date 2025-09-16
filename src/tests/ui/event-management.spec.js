const { test, expect } = require('@playwright/test');
const { test: baseTest } = require('../../fixtures/base-fixtures');
const TestDataFactory = require('../../utils/test-data-factory');

// Use the extended test with fixtures
const testWithFixtures = baseTest;

testWithFixtures.describe('Event Management', () => {
    let testEventData;

    testWithFixtures.beforeEach(async () => {
        // Generate unique test data for each test
        testEventData = TestDataFactory.createEventData('Auto Test Event', true);
        console.log(`Generated test event: ${testEventData.name}`);
    });

    testWithFixtures('should create a new event', async ({ authenticatedEventPage }) => {
        // Navigate to events page
        await authenticatedEventPage.goToPage();
        await authenticatedEventPage.waitForPageReady();

        // Create the event
        const createSuccess = await authenticatedEventPage.createEvent(testEventData);
        expect(createSuccess).toBe(true);

        // Verify event appears in the list
        const eventExists = await authenticatedEventPage.findEventByName(testEventData.name);
        expect(eventExists).toBe(true);
    });

    testWithFixtures('should edit an existing event', async ({ authenticatedEventPage }) => {
        // First create an event
        await authenticatedEventPage.goToPage();
        await authenticatedEventPage.waitForPageReady();
        
        const createSuccess = await authenticatedEventPage.createEvent(testEventData);
        expect(createSuccess).toBe(true);

        // Now edit the event
        const editSuccess = await authenticatedEventPage.editEvent(
            testEventData.name, 
            {
                name: testEventData.editedName,
                description: testEventData.editedDescription
            }
        );
        expect(editSuccess).toBe(true);

        // Verify the edited event exists
        const editedEventExists = await authenticatedEventPage.findEventByName(testEventData.editedName);
        expect(editedEventExists).toBe(true);
    });

    testWithFixtures('should duplicate an event', async ({ authenticatedEventPage }) => {
        // First create an event
        await authenticatedEventPage.goToPage();
        await authenticatedEventPage.waitForPageReady();
        
        const createSuccess = await authenticatedEventPage.createEvent(testEventData);
        expect(createSuccess).toBe(true);

        // Now duplicate the event
        const duplicateSuccess = await authenticatedEventPage.duplicateEvent(testEventData.name);
        expect(duplicateSuccess).toBe(true);

        // Verify the duplicate exists (should have "Copy" in the name)
        const duplicateName = `${testEventData.name} (Copy)`;
        const duplicateExists = await authenticatedEventPage.findEventByName(duplicateName);
        expect(duplicateExists).toBe(true);
    });

    testWithFixtures('should update event settings', async ({ authenticatedEventPage }) => {
        // First create an event
        await authenticatedEventPage.goToPage();
        await authenticatedEventPage.waitForPageReady();
        
        const createSuccess = await authenticatedEventPage.createEvent(testEventData);
        expect(createSuccess).toBe(true);

        // Update event settings
        const settingsUpdateSuccess = await authenticatedEventPage.updateEventSettings(
            testEventData.name,
            {
                theme: 'dark',
                privacy: 'private',
                duration: '60'
            }
        );
        expect(settingsUpdateSuccess).toBe(true);
    });

    testWithFixtures('should delete an event', async ({ authenticatedEventPage }) => {
        // First create an event
        await authenticatedEventPage.goToPage();
        await authenticatedEventPage.waitForPageReady();
        
        const createSuccess = await authenticatedEventPage.createEvent(testEventData);
        expect(createSuccess).toBe(true);

        // Verify event exists before deletion
        const eventExistsBefore = await authenticatedEventPage.findEventByName(testEventData.name);
        expect(eventExistsBefore).toBe(true);

        // Delete the event
        const deleteSuccess = await authenticatedEventPage.deleteEvent(testEventData.name);
        expect(deleteSuccess).toBe(true);

        // Verify event no longer exists
        const eventExistsAfter = await authenticatedEventPage.findEventByName(testEventData.name);
        expect(eventExistsAfter).toBe(false);
    });

    testWithFixtures('should search for events', async ({ authenticatedEventPage }) => {
        // Create multiple events
        await authenticatedEventPage.goToPage();
        await authenticatedEventPage.waitForPageReady();
        
        const event1 = TestDataFactory.createEventData('Search Test Event 1', true);
        const event2 = TestDataFactory.createEventData('Search Test Event 2', true);
        
        await authenticatedEventPage.createEvent(event1);
        await authenticatedEventPage.createEvent(event2);

        // Search for the first event
        const searchResult = await authenticatedEventPage.findEventByName(event1.name);
        expect(searchResult).toBe(true);

        // Clear search and verify both events are visible
        await authenticatedEventPage.clearEventSearch();
        
        const event1Visible = await authenticatedEventPage.findEventByName(event1.name);
        const event2Visible = await authenticatedEventPage.findEventByName(event2.name);
        
        expect(event1Visible).toBe(true);
        expect(event2Visible).toBe(true);
    });

    testWithFixtures('should handle event creation with empty data', async ({ authenticatedEventPage }) => {
        await authenticatedEventPage.goToPage();
        await authenticatedEventPage.waitForPageReady();

        // Try to create event with empty name
        const emptyEventData = {
            name: '',
            description: 'Test description'
        };

        const createSuccess = await authenticatedEventPage.createEvent(emptyEventData);
        expect(createSuccess).toBe(false);
    });

    testWithFixtures('should get event count', async ({ authenticatedEventPage }) => {
        await authenticatedEventPage.goToPage();
        await authenticatedEventPage.waitForPageReady();

        // Get initial event count
        const initialCount = await authenticatedEventPage.getEventCount();
        console.log(`Initial event count: ${initialCount}`);

        // Create a new event
        const createSuccess = await authenticatedEventPage.createEvent(testEventData);
        expect(createSuccess).toBe(true);

        // Get updated event count
        const updatedCount = await authenticatedEventPage.getEventCount();
        console.log(`Updated event count: ${updatedCount}`);

        // Verify count increased by 1
        expect(updatedCount).toBe(initialCount + 1);
    });
});

