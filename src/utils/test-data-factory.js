const ShortUniqueId = require('short-unique-id');

class TestDataFactory {
    /**
     * Create a unique name with timestamp
     * @param {string} baseName - Base name for the item
     * @returns {string} Unique name
     */
    static createUniqueName(baseName) {
        const uid = new ShortUniqueId({ length: 6 });
        const uniqueId = uid.rnd();
        const timestamp = Date.now().toString().slice(-6);
        return `${baseName}_${uniqueId}_${timestamp}`;
    }

    /**
     * Create an array of names
     * @param {string} baseName - The base name for the names
     * @param {number} count - The number of names to create
     * @param {boolean} unique - Whether to create unique names
     * @returns {string[]} An array of names
     */
    static createNames(baseName, count, unique = false) {
        const names = [];
        for (let i = 0; i < count; i++) {
            if (unique) {
                names.push(this.createUniqueName(baseName));
            } else {
                names.push(`${baseName}${i === 0 ? '' : `_${i + 1}`}`);
            }
        }
        return names;
    }

    /**
     * Create edited name
     * @param {string} baseName - Base name
     * @param {boolean} unique - Whether to create unique name
     * @returns {string} Edited name
     */
    static createEditedName(baseName, unique = false) {
        return `${unique ? this.createUniqueName(baseName) : baseName}_edited`;
    }

    /**
     * Create duplicate name
     * @param {string} baseName - Base name
     * @param {boolean} unique - Whether to create unique name
     * @returns {string} Duplicate name
     */
    static createDuplicateName(baseName, unique = false) {
        return `${unique ? this.createUniqueName(baseName) : baseName} (1)`;
    }

    /**
     * Create copied name
     * @param {string} baseName - Base name
     * @param {boolean} unique - Whether to create unique name
     * @returns {string} Copied name
     */
    static createCopiedName(baseName, unique = false) {
        return `Copy of ${unique ? this.createUniqueName(baseName) : baseName}`;
    }

    /**
     * Create test event data
     * @param {string} baseName - Base name for the event
     * @param {boolean} unique - Whether to create unique name
     * @returns {Object} Event data object
     */
    static createEventData(baseName = 'Test Event', unique = true) {
        const name = unique ? this.createUniqueName(baseName) : baseName;
        return {
            name,
            description: `Automated test event: ${name}`,
            editedName: this.createEditedName(name, false),
            editedDescription: `Edited automated test event: ${name}`,
            tags: ['automation', 'test', 'e2e'],
            editedTags: ['automation', 'test', 'e2e', 'edited']
        };
    }

    /**
     * Create test user data
     * @param {string} baseName - Base name for the user
     * @param {boolean} unique - Whether to create unique name
     * @returns {Object} User data object
     */
    static createUserData(baseName = 'Test User', unique = true) {
        const name = unique ? this.createUniqueName(baseName) : baseName;
        return {
            name,
            email: `${name.toLowerCase().replace(/\s+/g, '.')}@test.com`,
            editedName: this.createEditedName(name, false),
            editedEmail: `${name.toLowerCase().replace(/\s+/g, '.')}.edited@test.com`
        };
    }

    /**
     * Create test settings data
     * @returns {Object} Settings data object
     */
    static createSettingsData() {
        return {
            theme: 'dark',
            language: 'en',
            notifications: true,
            editedTheme: 'light',
            editedLanguage: 'vi',
            editedNotifications: false
        };
    }

    /**
     * Generate random string
     * @param {number} length - Length of the string
     * @returns {string} Random string
     */
    static generateRandomString(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Generate random email
     * @param {string} domain - Email domain
     * @returns {string} Random email
     */
    static generateRandomEmail(domain = 'test.com') {
        const username = this.generateRandomString(8);
        return `${username}@${domain}`;
    }

    /**
     * Generate random number
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    static generateRandomNumber(min = 1, max = 100) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Create test file data
     * @param {string} filename - File name
     * @param {string} content - File content
     * @param {string} type - File type
     * @returns {Object} File data object
     */
    static createFileData(filename, content = 'Test file content', type = 'text/plain') {
        return {
            filename,
            content,
            type,
            size: content.length
        };
    }

    /**
     * Create test image data
     * @param {string} name - Image name
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {string} color - Image color
     * @returns {Object} Image data object
     */
    static createImageData(name, width = 800, height = 600, color = '#ff0000') {
        return {
            name,
            width,
            height,
            color,
            filename: `${name}.jpg`,
            type: 'image/jpeg'
        };
    }
}

module.exports = TestDataFactory;

