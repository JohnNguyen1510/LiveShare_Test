const { expect } = require('@playwright/test');
const config = require('../config/config-loader');

class BasePage {
    constructor(page) {
        this.page = page;
        this.config = config;

        this.loadingSpinner = this.page.locator('.loading, .spinner, [data-testid="loading"]');
        this.errorMessage = this.page.locator('.error, .alert-error, [data-testid="error"]');
        this.successMessage = this.page.locator('.success, .alert-success, [data-testid="success"]');
        this.navMenu = this.page.locator('nav, .navbar, .navigation');
        this.logoutButton = this.page.locator('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout"]');
        this.saveButton = this.page.locator('button:has-text("Save"), button[type="submit"]');
        this.cancelButton = this.page.locator('button:has-text("Cancel"), button:has-text("Close")');
        this.deleteButton = this.page.locator('button:has-text("Delete"), button:has-text("Remove")');
        this.confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        this.searchInput = this.page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search"]');
        this.submitButton = this.page.locator('button[type="submit"], button:has-text("Submit")');
        this.modal = this.page.locator('.modal, .dialog, [role="dialog"], mat-dialog-container, app-personalize');
        this.modalCloseButton = this.page.locator('.modal .close, .dialog .close, [aria-label="Close"]');
        this.toast = this.page.locator('.toast, .notification, .alert');
        this.toastCloseButton = this.page.locator('.toast .close, .notification .close');

        this.loggedInIndicators = [
            '.flex.pt-8',
            'div.event-card',
            'div.mat-card',
            '[data-testid="dashboard"]',
            '.event-card-event',
            'div.navbar-end .avatar',
            'img.profile-image',
        ];
    }

    async goto(url) {
        const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
        await this.page.goto(fullUrl);
        await this.waitForPageLoad();
    }

    async waitForPageLoad(timeout = 30000) {
        try {
            await this.page.waitForLoadState('domcontentloaded', { timeout });
            await this.page.waitForTimeout(800);
            await this.page.waitForLoadState('networkidle', { timeout });
            return true;
        } catch (error) {
            return false;
        }
    }

    async waitForLoadingToComplete(timeout = 30000) {
        try {
            await this.loadingSpinner.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
            await this.loadingSpinner.waitFor({ state: 'hidden', timeout });
            return true;
        } catch (error) {
            return true;
        }
    }

    async ensureLoggedInContext() {
        // After navigation, confirm some logged-in indicator is visible
        for (const selector of this.loggedInIndicators) {
            const visible = await this.page.locator(selector).first().isVisible({ timeout: 1000 }).catch(() => false);
            if (visible) return true;
        }
        // Not definitive, but continue
        return false;
    }

    async waitForSelector(selector, timeout = 30000) {
        try {
            const element = this.page.locator(selector).first();
            await element.waitFor({ state: 'visible', timeout });
            return true;
        } catch (error) {
            return false;
        }
    }

    async safeClick(selector, options = {}, retries = 3) {
        let currentTry = 0;
        while (currentTry < retries) {
            try {
                const element = this.page.locator(selector).first();
                const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
                if (!isVisible) {
                    await this.page.waitForTimeout(600);
                    currentTry++;
                    continue;
                }
                await element.scrollIntoViewIfNeeded().catch(() => {});
                await this.page.waitForTimeout(200);
                await element.click({ force: true, ...options });
                return true;
            } catch (error) {
                await this.page.waitForTimeout(600);
                currentTry++;
                if (currentTry >= retries) {
                    await this.takeScreenshot(`click-failure-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
                    return false;
                }
            }
        }
        return false;
    }

    async safeFill(selector, value, retries = 3) {
        let currentTry = 0;
        while (currentTry < retries) {
            try {
                const ok = await this.waitForSelector(selector, 5000);
                if (!ok) {
                    currentTry++;
                    continue;
                }
                const element = this.page.locator(selector).first();
                await element.fill('');
                await element.fill(value);
                return true;
            } catch (error) {
                await this.page.waitForTimeout(500);
                currentTry++;
                if (currentTry >= retries) {
                    await this.takeScreenshot(`fill-failure-${selector.replace(/[^a-zA-Z0-9]/g, '-')}`);
                    return false;
                }
            }
        }
        return false;
    }

    async takeScreenshot(name, fullPage = true) {
        try {
            if (!this.page.isClosed()) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `./screenshots/${name}-${timestamp}.png`;
                await this.page.screenshot({ path: filename, fullPage });
                return filename;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async getText(selector) {
        try {
            await this.waitForSelector(selector);
            return await this.page.locator(selector).first().textContent();
        } catch (error) {
            return '';
        }
    }

    async exists(selector) {
        try {
            return await this.page.locator(selector).count() > 0;
        } catch (error) {
            return false;
        }
    }

    async evaluate(expression, ...args) {
        return await this.page.evaluate(expression, ...args);
    }

    async goToPage() { throw new Error(`${this.constructor.name} must implement goToPage()`); }
    async waitForPageReady() { throw new Error(`${this.constructor.name} must implement waitForPageReady()`); }
}

module.exports = BasePage;

