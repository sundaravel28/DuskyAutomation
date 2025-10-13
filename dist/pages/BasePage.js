"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
class BasePage {
    constructor(page, context) {
        this.page = page;
        this.context = context;
    }
    /**
     * Navigate to a URL with default timeout and wait conditions
     */
    async navigateTo(url, options) {
        const defaultOptions = {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        };
        await this.page.goto(url, { ...defaultOptions, ...options });
    }
    /**
     * Wait for a specified amount of time
     */
    async waitForTimeout(milliseconds) {
        await this.page.waitForTimeout(milliseconds);
    }
    /**
     * Set default timeout for the page
     */
    setDefaultTimeout(timeout) {
        this.page.setDefaultTimeout(timeout);
    }
    /**
     * Maximize the browser window by setting viewport to available screen size
     */
    async maximize() {
        const { width, height } = await this.page.evaluate(() => {
            return {
                width: window.screen.availWidth || window.innerWidth,
                height: window.screen.availHeight || window.innerHeight
            };
        });
        await this.page.setViewportSize({ width, height });
    }
    /**
     * Get the current page title
     */
    async getTitle() {
        return await this.page.title();
    }
    /**
     * Get the current URL
     */
    getCurrentUrl() {
        return this.page.url();
    }
}
exports.BasePage = BasePage;
//# sourceMappingURL=BasePage.js.map