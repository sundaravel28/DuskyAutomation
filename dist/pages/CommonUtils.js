"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtils = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const Selectors_1 = require("./Selectors");
// Load default .env and project-specific config.env
dotenv.config();
try {
    dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });
}
catch (_) { }
class CommonUtils {
    constructor(page, context) {
        this.page = page;
        this.context = context;
    }
    // --------------------------------------------------------------------------
    // Random data generators (names, email, phone)
    // --------------------------------------------------------------------------
    static generateRandomName() {
        const firstNames = ["John", "Alice", "Michael", "Sophia", "David", "Emma"];
        const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller"];
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        return `${first} ${last}`;
    }
    static generateRandomEmail(fullName) {
        const domains = ["example.com", "mail.com", "test.org"];
        const user = fullName.toLowerCase().replace(/\s+/g, ".");
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${user}@${domain}`;
    }
    static generateRandomPhone() {
        return "9" + Math.floor(100000000 + Math.random() * 900000000);
    }
    /**
     * Get required environment variable (static utility)
     */
    static getEnvVar(key, fallback) {
        const value = process.env[key] || fallback;
        if (!value) {
            throw new Error(`${key} not provided and not defined in .env`);
        }
        return value;
    }
    /**
     * Wait until a react-select dropdown (by index) has specific options visible
     */
    async waitForDropdownOptionsByIndex(dropdownIndex, expectedOptions, timeoutMs = 10000) {
        const dropdown = this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL).nth(dropdownIndex);
        await dropdown.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
        await this.openReactSelectDropdown(dropdown, `dropdown (index ${dropdownIndex})`);
        // Wait until all expected options are visible somewhere in the options list
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            let allFound = true;
            for (const opt of expectedOptions) {
                const candidate = this.page.getByRole('option', { name: opt }).first();
                if (!(await candidate.isVisible().catch(() => false))) {
                    allFound = false;
                    break;
                }
            }
            if (allFound) {
                return;
            }
            await this.waitForTimeout(200);
        }
        throw new Error(`Timeout waiting for options: ${expectedOptions.join(', ')}`);
    }
    /**
     * Wait for a specified amount of time
     */
    async waitForTimeout(milliseconds) {
        await this.page.waitForTimeout(milliseconds);
    }
    /**
     * Open a React-Select dropdown reliably
     */
    async openReactSelectDropdown(dropdown, dropdownName) {
        // Ensure it's in view
        try {
            await dropdown.scrollIntoViewIfNeeded();
        }
        catch (_) { }
        // If already open, return early
        try {
            const cls = await dropdown.getAttribute('class');
            const ariaExpanded = await dropdown.getAttribute('aria-expanded');
            const globalMenuVisible = await this.page.locator(`${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU}, ${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU_LIST}, [role="listbox"]`).first().isVisible().catch(() => false);
            if ((cls && cls.includes('--menu-is-open')) || ariaExpanded === 'true' || globalMenuVisible) {
                console.log(`✓ ${dropdownName} dropdown appears already open`);
                return;
            }
        }
        catch (_) { }
        // Try direct click first
        const opened = await (async () => {
            try {
                await dropdown.click();
                await this.page.waitForSelector(`${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU}, ${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU_LIST}, [role="listbox"], [role="option"]`, { state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
                return true;
            }
            catch (_) {
                return false;
            }
        })();
        if (opened) {
            console.log(`✓ Opened ${dropdownName} dropdown`);
            return;
        }
        // Try clicking the dropdown indicator
        try {
            const indicator = dropdown.locator('.custom-react-select__indicator.custom-react-select__dropdown-indicator, [class*="__indicator"][class*="dropdown"]');
            if (await indicator.count()) {
                await indicator.first().click({ force: true });
                await this.page.waitForSelector(`${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU}, ${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU_LIST}, [role="listbox"], [role="option"]`, { state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
                console.log(`✓ Opened ${dropdownName} dropdown via indicator`);
                return;
            }
        }
        catch (_) { }
        // As a last attempt, focus and use keyboard to open
        try {
            await dropdown.click({ force: true });
            await this.page.keyboard.press('ArrowDown');
            await this.page.waitForSelector(`${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU}, ${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU_LIST}, [role="listbox"], [role="option"]`, { state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
            console.log(`✓ Opened ${dropdownName} dropdown via keyboard`);
            return;
        }
        catch (error) {
            console.log(`⚠️ Failed to open ${dropdownName} dropdown`);
            throw error;
        }
    }
    /**
     * Type value into React-Select input and select via Enter or clicking option
     */
    async typeAndSelectReactOption(dropdown, value, dropdownName) {
        // Attempt multiple input strategies
        const inputCandidates = [
            dropdown.locator('.custom-react-select__input input').first(),
            dropdown.locator('input[role="combobox"]').first(),
            dropdown.locator('input[aria-autocomplete="list"]').first(),
            dropdown.locator('input').first(),
            this.page.locator('.custom-react-select__input input').last(),
        ];
        let typed = false;
        for (const candidate of inputCandidates) {
            try {
                if (!(await candidate.count()))
                    continue;
                await candidate.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                await candidate.fill('');
                await candidate.type(value, { delay: 20 });
                typed = true;
                break;
            }
            catch (_) {
                // try next candidate
            }
        }
        // Fallback: type via keyboard into focused control
        if (!typed) {
            try {
                await dropdown.click({ force: true });
                await this.page.keyboard.type(value, { delay: 20 });
                typed = true;
            }
            catch (e) {
                console.log(`⚠️ Could not type into ${dropdownName}:`, e);
                return false;
            }
        }
        // Wait for options to filter and select
        try {
            await this.page.waitForFunction(() => document.querySelectorAll('[role="option"]').length > 0, { timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
        }
        catch (_) { }
        try {
            const exactOption = this.page.getByRole('option', { name: value }).first();
            await exactOption.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
            await exactOption.click();
            console.log(`✓ Selected ${value} from ${dropdownName} via option click`);
        }
        catch (_) {
            // Try Enter, guard failures
            let selected = false;
            try {
                await this.page.keyboard.press('Enter');
                console.log(`✓ Selected ${value} from ${dropdownName} via Enter`);
                selected = true;
            }
            catch (e) {
                console.log(`⚠️ Enter key selection failed for ${dropdownName}:`, e);
            }
            if (!selected) {
                // Try clicking visible options that include the text
                try {
                    const cssOption = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION, { hasText: value }).first();
                    await cssOption.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                    await cssOption.click();
                    console.log(`✓ Selected ${value} from ${dropdownName} via CSS option`);
                    selected = true;
                }
                catch (e2) {
                    console.log(`⚠️ CSS option selection failed for ${dropdownName}:`, e2);
                }
            }
            if (!selected) {
                return false;
            }
        }
        await this.page.waitForSelector(`${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU_LIST}`, { state: 'hidden', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE }).catch(() => { });
        return true;
    }
    /**
     * Check if page is still active/not closed
     */
    isPageActive() {
        return !this.page.isClosed();
    }
    /**
     * Get current page URL
     */
    getCurrentUrl() {
        return this.page.url();
    }
    /**
     * Get current page title
     */
    async getTitle() {
        return await this.page.title();
    }
    /**
     * Scroll to bottom of the page with multiple attempts
     */
    async scrollToBottom(maxAttempts = 5) {
        try {
            console.log('⏳ Scrolling down to reach the bottom of the page...');
            // Method 1: Quick scroll to bottom
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
            await this.waitForTimeout(1000);
            // Method 2: Check if we need to scroll more (for dynamic content)
            let scrollAttempts = 0;
            while (scrollAttempts < maxAttempts) {
                const previousHeight = await this.page.evaluate(() => document.body.scrollHeight);
                // Scroll down a bit more
                await this.page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });
                await this.waitForTimeout(500);
                const newHeight = await this.page.evaluate(() => document.body.scrollHeight);
                if (newHeight === previousHeight) {
                    console.log(`✓ Reached bottom after ${scrollAttempts + 1} attempts`);
                    break;
                }
                scrollAttempts++;
                console.log(`⏳ Scroll attempt ${scrollAttempts}/${maxAttempts} - Height: ${newHeight}`);
            }
            // Method 3: Final scroll using keyboard End key
            await this.page.keyboard.press('End');
            await this.waitForTimeout(500);
            console.log('✓ Successfully scrolled to the bottom of the page');
        }
        catch (error) {
            console.error('❌ Error scrolling to bottom:', error);
            throw error;
        }
    }
    /**
     * Click anywhere in the UI to ensure focus
     */
    async clickAnywhereInUI(x = 100, y = 100) {
        try {
            if (this.isPageActive()) {
                await this.page.click('body', { position: { x, y } });
                console.log('✓ Clicked anywhere in UI to ensure focus');
                await this.waitForTimeout(1000);
            }
        }
        catch (error) {
            console.log('⚠️ Error clicking in UI:', error);
        }
    }
    /**
     * Find element using multiple fallback selectors
     */
    async findElementWithFallback(selectors, timeout = 5000) {
        for (const selector of selectors) {
            try {
                console.log(`⏳ Trying selector: ${selector}`);
                const element = this.page.locator(selector);
                await element.waitFor({ state: 'visible', timeout });
                console.log(`✓ Found element with selector: ${selector}`);
                return element;
            }
            catch (error) {
                console.log(`⚠️ Selector failed: ${selector}`);
            }
        }
        return null;
    }
    /**
     * Click element with multiple fallback methods
     */
    async clickElementWithFallback(element, elementName = 'element') {
        try {
            // Method 1: Direct click
            await element.click();
            console.log(`✓ Clicked ${elementName} with direct click`);
            return true;
        }
        catch (clickError) {
            console.log(`⚠️ Direct click failed for ${elementName}, trying force click`);
            try {
                // Method 2: Force click
                await element.click({ force: true });
                console.log(`✓ Clicked ${elementName} with force click`);
                return true;
            }
            catch (forceClickError) {
                console.log(`⚠️ Force click failed for ${elementName}, trying JavaScript click`);
                try {
                    // Method 3: JavaScript click
                    await element.evaluate((el) => el.click());
                    console.log(`✓ Clicked ${elementName} with JavaScript click`);
                    return true;
                }
                catch (jsClickError) {
                    console.log(`⚠️ JavaScript click failed for ${elementName}: ${jsClickError}`);
                    return false;
                }
            }
        }
    }
    /**
     * Fill input field with validation
     */
    async fillInputWithValidation(selector, value, fieldName = 'input') {
        try {
            const element = this.page.locator(selector);
            await element.waitFor({ state: 'visible', timeout: 5000 });
            // Click and clear the field first
            await element.click();
            await element.clear();
            // Fill the value
            await element.fill(value);
            // Verify the value was entered
            const enteredValue = await element.inputValue();
            if (enteredValue !== value) {
                throw new Error(`Failed to fill ${fieldName}. Expected: ${value}, Got: ${enteredValue}`);
            }
            console.log(`✓ Filled ${fieldName}: ${value}`);
        }
        catch (error) {
            console.error(`❌ Error filling ${fieldName}:`, error);
            throw error;
        }
    }
    /**
     * Debug method to list all available dropdown options in the current dropdown
     */
    async debugDropdownOptions() {
        try {
            console.log('🔍 Debugging dropdown options...');
            // Check for different option types
            const reactSelectOptions = await this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).count();
            const roleOptions = await this.page.locator(Selectors_1.DROPDOWN_OPTIONS.ROLE_OPTION).count();
            const standardOptions = await this.page.locator(Selectors_1.DROPDOWN_OPTIONS.STANDARD_OPTION).count();
            console.log(`✓ Found ${reactSelectOptions} .custom-react-select__option elements`);
            console.log(`✓ Found ${roleOptions} [role="option"] elements`);
            console.log(`✓ Found ${standardOptions} option elements`);
            // List all dropdown options with their text
            for (let i = 0; i < reactSelectOptions; i++) {
                const option = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).nth(i);
                const isVisible = await option.isVisible();
                const text = await option.textContent();
                const value = await option.getAttribute('value');
                console.log(`   Option ${i}:`);
                console.log(`     - visible: ${isVisible}`);
                console.log(`     - text: "${text?.trim()}"`);
                console.log(`     - value: "${value}"`);
            }
        }
        catch (error) {
            console.log('⚠️ Error debugging dropdown options:', error);
        }
    }
    /**
     * Debug method to list all available buttons and clickable elements
     */
    async debugClickableElements() {
        try {
            console.log('🔍 Debugging clickable elements on page...');
            // Check for different button types
            const buttons = await this.page.locator('button').count();
            const clickableDivs = await this.page.locator('div[role="button"]').count();
            const comboboxes = await this.page.locator('[role="combobox"]').count();
            const selects = await this.page.locator('select').count();
            console.log(`✓ Found ${buttons} button elements`);
            console.log(`✓ Found ${clickableDivs} div[role="button"] elements`);
            console.log(`✓ Found ${comboboxes} [role="combobox"] elements`);
            console.log(`✓ Found ${selects} select elements`);
            // List the first few buttons with their text
            for (let i = 0; i < Math.min(buttons, 10); i++) {
                const button = this.page.locator('button').nth(i);
                const isVisible = await button.isVisible();
                const text = await button.textContent();
                const className = await button.getAttribute('class');
                console.log(`   Button ${i}:`);
                console.log(`     - visible: ${isVisible}`);
                console.log(`     - text: "${text?.trim()}"`);
                console.log(`     - class: "${className?.substring(0, 100)}..."`);
            }
        }
        catch (error) {
            console.log('⚠️ Error debugging clickable elements:', error);
        }
    }
    /**
     * Debug method to list all available dropdowns on the page
     */
    async debugDropdowns() {
        try {
            console.log('🔍 Debugging dropdowns on page...');
            // Check for different dropdown types
            const reactSelects = await this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL).count();
            const regularSelects = await this.page.locator('select').count();
            const dropdownButtons = await this.page.locator('[role="button"]').count();
            console.log(`✓ Found ${reactSelects} .custom-react-select__control elements`);
            console.log(`✓ Found ${regularSelects} select elements`);
            console.log(`✓ Found ${dropdownButtons} [role="button"] elements`);
            // List all dropdown controls with more details
            for (let i = 0; i < reactSelects; i++) {
                const dropdown = this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL).nth(i);
                const isVisible = await dropdown.isVisible();
                const text = await dropdown.textContent();
                const placeholder = await dropdown.getAttribute('placeholder');
                const id = await dropdown.getAttribute('id');
                const className = await dropdown.getAttribute('class');
                console.log(`   Dropdown ${i}:`);
                console.log(`     - visible: ${isVisible}`);
                console.log(`     - text: "${text?.trim()}"`);
                console.log(`     - placeholder: "${placeholder}"`);
                console.log(`     - id: "${id}"`);
                console.log(`     - class: "${className}"`);
                // Try to find the parent container to get more context
                try {
                    const parent = dropdown.locator('..');
                    const parentText = await parent.textContent();
                    console.log(`     - parent text: "${parentText?.trim().substring(0, 100)}..."`);
                }
                catch (e) {
                    // Ignore parent errors
                }
            }
        }
        catch (error) {
            console.log('⚠️ Error debugging dropdowns:', error);
        }
    }
    /**
     * Find dropdown by label text (more intelligent approach)
     */
    async findDropdownByLabel(labelText) {
        try {
            // Try to find label first, then find the associated dropdown
            const labelSelectors = [
                `label:has-text("${labelText}")`,
                `*:has-text("${labelText}")`,
                `[aria-label*="${labelText}"]`,
                `[placeholder*="${labelText}"]`
            ];
            for (const labelSelector of labelSelectors) {
                try {
                    const label = this.page.locator(labelSelector).first();
                    if (await label.isVisible()) {
                        // Find the dropdown near this label
                        const dropdown = label.locator('..').locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL).first();
                        if (await dropdown.isVisible()) {
                            console.log(`✓ Found ${labelText} dropdown using label selector: ${labelSelector}`);
                            return dropdown;
                        }
                    }
                }
                catch (e) {
                    // Continue to next selector
                }
            }
            return null;
        }
        catch (error) {
            console.log(`⚠️ Error finding dropdown by label "${labelText}":`, error);
            return null;
        }
    }
    /**
     * Try to select from dropdown by index (fallback method)
     */
    async selectFromDropdownByIndex(dropdownIndex, value, dropdownName = 'dropdown') {
        try {
            console.log(`⏳ Attempting to select "${value}" from ${dropdownName} dropdown (index ${dropdownIndex})`);
            const dropdown = this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL).nth(dropdownIndex);
            await dropdown.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
            await this.openReactSelectDropdown(dropdown, `${dropdownName} (index ${dropdownIndex})`);
            // Try multiple strategies to find and click the option (optimized for speed)
            let optionFound = false;
            // Strategy 0: Type in input and press Enter
            if (!optionFound) {
                optionFound = await this.typeAndSelectReactOption(dropdown, value, dropdownName);
            }
            // Strategy 1: Role-based selection (most reliable)
            try {
                const option = this.page.getByRole('option', { name: value }).first();
                await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                await option.click();
                console.log(`✓ Selected ${value} from ${dropdownName} dropdown (role-based)`);
                optionFound = true;
            }
            catch (error) {
                // Continue to next strategy
            }
            // Strategy 2: Exact text match
            if (!optionFound) {
                try {
                    const option = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION, { hasText: value }).first();
                    await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                    await option.click();
                    console.log(`✓ Selected ${value} from ${dropdownName} dropdown (exact text match)`);
                    optionFound = true;
                }
                catch (error) {
                    // Continue to next strategy
                }
            }
            // Strategy 3: Partial text match
            if (!optionFound) {
                try {
                    const option = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).filter({ hasText: value }).first();
                    await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                    await option.click();
                    console.log(`✓ Selected ${value} from ${dropdownName} dropdown (partial text match)`);
                    optionFound = true;
                }
                catch (error) {
                    // Continue to next strategy
                }
            }
            // Strategy 4: Try to select by index (for numeric values)
            if (!optionFound && !isNaN(Number(value))) {
                try {
                    const optionIndex = Number(value) - 1; // Assuming options start from 1
                    const option = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).nth(optionIndex);
                    await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                    await option.click();
                    console.log(`✓ Selected ${value} from ${dropdownName} dropdown using index ${optionIndex}`);
                    optionFound = true;
                }
                catch (error) {
                    // Continue to next strategy
                }
            }
            // Strategy 5: Try to find by value attribute (last resort)
            if (!optionFound) {
                try {
                    const option = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).filter({ has: this.page.locator(`[value="${value}"]`) }).first();
                    await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                    await option.click();
                    console.log(`✓ Selected ${value} from ${dropdownName} dropdown (value attribute)`);
                    optionFound = true;
                }
                catch (error) {
                    // All strategies failed
                }
            }
            if (!optionFound) {
                throw new Error(`Could not find option "${value}" in ${dropdownName} dropdown using any strategy`);
            }
            // Wait for dropdown to close
            await this.page.waitForSelector(Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU_LIST, { state: 'hidden', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE }).catch(() => { });
        }
        catch (error) {
            console.error(`❌ Error selecting from ${dropdownName} dropdown (index ${dropdownIndex}):`, error);
            throw error;
        }
    }
    /**
     * Select from dropdown with multiple fallback methods
     */
    async selectFromDropdown(dropdownSelectors, value, dropdownName = 'dropdown', optionSelectors = [Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION, Selectors_1.DROPDOWN_OPTIONS.ROLE_OPTION]) {
        try {
            console.log(`⏳ Attempting to select "${value}" from ${dropdownName} dropdown`);
            console.log(`✓ Using dropdown selectors: ${dropdownSelectors.join(', ')}`);
            // First try to find by label if dropdownName is descriptive
            let dropdown = null;
            if (dropdownName !== 'dropdown') {
                dropdown = await this.findDropdownByLabel(dropdownName);
            }
            // If not found by label, try the provided selectors
            if (!dropdown) {
                dropdown = await this.findElementWithFallback(dropdownSelectors);
            }
            if (!dropdown) {
                console.log(`❌ Available dropdowns on page:`);
                await this.debugDropdowns();
                throw new Error(`Could not find ${dropdownName} dropdown`);
            }
            await this.openReactSelectDropdown(dropdown, dropdownName);
            // Try to find and click the option using multiple strategies (optimized for speed)
            let optionFound = false;
            // Strategy 0: Type in input and press Enter
            if (!optionFound) {
                optionFound = await this.typeAndSelectReactOption(dropdown, value, dropdownName);
            }
            // Strategy 1: Try with role selector first (most reliable)
            try {
                const option = this.page.getByRole('option', { name: value }).first();
                await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                await option.click();
                console.log(`✓ Selected ${value} from ${dropdownName} using role selector`);
                optionFound = true;
            }
            catch (error) {
                // Continue to next strategy
            }
            // Strategy 2: Try provided option selectors
            if (!optionFound) {
                for (const optionSelector of optionSelectors) {
                    try {
                        const option = this.page.locator(optionSelector, { hasText: value }).first();
                        await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                        await option.click();
                        console.log(`✓ Selected ${value} from ${dropdownName} using selector: ${optionSelector}`);
                        optionFound = true;
                        break;
                    }
                    catch (error) {
                        // Continue to next selector
                    }
                }
            }
            // Strategy 3: Try partial text match
            if (!optionFound) {
                try {
                    const option = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).filter({ hasText: value }).first();
                    await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                    await option.click();
                    console.log(`✓ Selected ${value} from ${dropdownName} using partial text match`);
                    optionFound = true;
                }
                catch (error) {
                    // Continue to next strategy
                }
            }
            // Strategy 4: Try to select by index (for numeric values)
            if (!optionFound && !isNaN(Number(value))) {
                try {
                    const optionIndex = Number(value) - 1; // Assuming options start from 1
                    const option = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).nth(optionIndex);
                    await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                    await option.click();
                    console.log(`✓ Selected ${value} from ${dropdownName} using index ${optionIndex}`);
                    optionFound = true;
                }
                catch (error) {
                    // Continue to next strategy
                }
            }
            // Strategy 5: Try to find by value attribute (last resort)
            if (!optionFound) {
                try {
                    const option = this.page.locator(Selectors_1.DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).filter({ has: this.page.locator(`[value="${value}"]`) }).first();
                    await option.waitFor({ state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                    await option.click();
                    console.log(`✓ Selected ${value} from ${dropdownName} using value attribute`);
                    optionFound = true;
                }
                catch (error) {
                    // All strategies failed
                }
            }
            if (!optionFound) {
                throw new Error(`Could not find option "${value}" in ${dropdownName}`);
            }
            // Wait for dropdown to close
            await this.page.waitForSelector(Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU_LIST, { state: 'hidden', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE }).catch(() => { });
        }
        catch (error) {
            console.error(`❌ Error selecting from ${dropdownName}:`, error);
            throw error;
        }
    }
    /**
     * Close dropdown using multiple methods
     */
    async closeDropdown() {
        try {
            console.log('⏳ Closing dropdown...');
            // Method 1: Press Escape key
            if (this.isPageActive()) {
                await this.page.keyboard.press('Escape');
                console.log('✓ Pressed Escape key to close dropdown');
                await this.waitForTimeout(300);
            }
            // Method 2: If still open, click the safe center of the viewport (avoid left nav)
            try {
                if (this.isPageActive()) {
                    const isMenuVisible = await this.page.locator(`${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU_LIST}, ${Selectors_1.DROPDOWN_MENUS.CUSTOM_REACT_SELECT_MENU}`).first().isVisible().catch(() => false);
                    if (isMenuVisible) {
                        const viewport = this.page.viewportSize();
                        const x = viewport ? Math.floor(viewport.width / 2) : 600;
                        const y = viewport ? Math.floor(viewport.height / 2) : 400;
                        await this.page.mouse.click(x, y);
                        console.log(`✓ Clicked viewport center (${x}, ${y}) to close dropdown`);
                        await this.waitForTimeout(300);
                    }
                }
            }
            catch (error) {
                console.log('⚠️ Center click failed to close dropdown');
            }
            // Wait a bit more to ensure dropdown is fully closed
            if (this.isPageActive()) {
                await this.waitForTimeout(300);
            }
        }
        catch (error) {
            console.log('⚠️ Error closing dropdown:', error);
        }
    }
    /**
     * Select multiple checkboxes by text content
     */
    async selectCheckboxesByText(texts, checkboxContainer = 'input[type="checkbox"]') {
        try {
            const allCheckboxes = this.page.locator(checkboxContainer);
            const checkboxCount = await allCheckboxes.count();
            console.log(`✓ Found ${checkboxCount} checkboxes`);
            for (const textToSelect of texts) {
                console.log(`⏳ Processing: ${textToSelect}`);
                let found = false;
                for (let i = 0; i < checkboxCount; i++) {
                    const checkbox = allCheckboxes.nth(i);
                    const parentLabel = checkbox.locator('xpath=..');
                    const labelText = await parentLabel.textContent();
                    if (labelText && labelText.trim().includes(textToSelect)) {
                        const isChecked = await checkbox.isChecked();
                        console.log(`✓ Checkbox for "${textToSelect}" is currently: ${isChecked ? 'checked' : 'unchecked'}`);
                        if (!isChecked) {
                            await checkbox.click();
                            console.log(`✓ Clicked and selected: ${textToSelect}`);
                        }
                        else {
                            console.log(`✓ "${textToSelect}" is already selected`);
                        }
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    console.log(`⚠️ Could not find: ${textToSelect}`);
                    // Try alternative approach - click by exact text match
                    try {
                        const labelByText = this.page.locator(`label:has-text("${textToSelect}")`).first();
                        await labelByText.waitFor({ state: 'visible', timeout: 3000 });
                        await labelByText.click();
                        console.log(`✓ Selected by clicking label: ${textToSelect}`);
                        found = true;
                    }
                    catch (error) {
                        console.log(`⚠️ Could not find by label text: ${textToSelect}`);
                    }
                }
                if (this.isPageActive()) {
                    await this.waitForTimeout(500);
                }
            }
        }
        catch (error) {
            console.error('❌ Error selecting checkboxes:', error);
            throw error;
        }
    }
    /**
     * Write content to text editor with multiple fallback methods
     */
    async writeToTextEditor(content, editorSelectors = [
        Selectors_1.JOB_DESCRIPTION_EDITOR.TIPTAP_EDITOR_FULL,
        Selectors_1.JOB_DESCRIPTION_EDITOR.TIPTAP_EDITOR,
        Selectors_1.JOB_DESCRIPTION_EDITOR.PROSEMIRROR_EDITOR,
        Selectors_1.JOB_DESCRIPTION_EDITOR.RICH_TEXT_EDITOR,
        'div[contenteditable="true"]',
        'div[role="textbox"]',
        'textarea',
        'input[type="text"]'
    ]) {
        try {
            // Find text editor
            const textEditor = await this.findElementWithFallback(editorSelectors);
            if (!textEditor) {
                throw new Error('Could not find any text editor element');
            }
            // Focus and clear existing content
            await textEditor.click();
            await this.page.keyboard.press('Control+a');
            await this.page.keyboard.press('Delete');
            // Method 1: Try fill() method
            let contentSet = false;
            try {
                await textEditor.fill(content);
                console.log('✓ Set content using fill() method');
                contentSet = true;
            }
            catch (error) {
                console.log('⚠️ fill() method failed, trying innerText...');
            }
            // Method 2: Try direct innerText setting
            if (!contentSet) {
                try {
                    const editorHandle = await textEditor.elementHandle();
                    if (editorHandle) {
                        await this.page.evaluate(({ editor, content }) => {
                            if (editor && 'innerText' in editor) {
                                editor.innerText = content;
                            }
                            else if (editor && 'textContent' in editor) {
                                editor.textContent = content;
                            }
                            else if (editor && 'value' in editor) {
                                editor.value = content;
                            }
                        }, { editor: editorHandle, content });
                        console.log('✓ Set content using innerText/textContent/value method');
                        contentSet = true;
                    }
                }
                catch (error) {
                    console.log('⚠️ innerText method failed, trying keyboard method...');
                }
            }
            // Method 3: Fallback to keyboard typing
            if (!contentSet) {
                await textEditor.click();
                await this.page.keyboard.press('Control+a');
                await this.page.keyboard.press('Delete');
                await this.waitForTimeout(500);
                // Type content line by line
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.trim() === '') {
                        await this.page.keyboard.press('Enter');
                    }
                    else {
                        await this.page.keyboard.type(line);
                        if (i < lines.length - 1) {
                            await this.page.keyboard.press('Enter');
                        }
                    }
                    await this.waitForTimeout(200);
                }
                console.log('✓ Set content using keyboard method');
                contentSet = true;
            }
            // Trigger editor updates
            await textEditor.press('Enter');
            await this.waitForTimeout(1000);
            // Verify content
            await this.waitForTimeout(2000);
            const editorContent = await textEditor.textContent();
            const editorInnerHTML = await textEditor.innerHTML();
            const editorValue = await textEditor.inputValue().catch(() => '');
            console.log('✓ Editor textContent length:', editorContent?.length || 0);
            console.log('✓ Editor innerHTML length:', editorInnerHTML?.length || 0);
            console.log('✓ Editor inputValue length:', editorValue?.length || 0);
            if (editorContent && editorContent.length > 100) {
                console.log('✓ Editor content preview:', editorContent.substring(0, 100) + '...');
                console.log('✅ Content writing completed successfully');
            }
            else if (editorInnerHTML && editorInnerHTML.length > 100) {
                console.log('✓ Editor innerHTML preview:', editorInnerHTML.substring(0, 100) + '...');
                console.log('✅ Content writing completed successfully (via innerHTML)');
            }
            else if (editorValue && editorValue.length > 100) {
                console.log('✓ Editor value preview:', editorValue.substring(0, 100) + '...');
                console.log('✅ Content writing completed successfully (via value)');
            }
            else {
                console.log('⚠️ Content verification failed - no substantial content found');
                console.log('✓ Expected content length:', content.length);
                console.log('✓ Actual content found:', editorContent?.length || 0);
            }
        }
        catch (error) {
            console.error('❌ Error writing to text editor:', error);
            throw error;
        }
    }
    /**
     * Read content from environment file
     */
    async readContentFromEnvFile(filePath, key) {
        try {
            const fullPath = path.join(process.cwd(), filePath);
            if (!fs.existsSync(fullPath)) {
                throw new Error(`${filePath} file not found at ${fullPath}`);
            }
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            const lines = fileContent.split(/\r?\n/);
            const contentLines = [];
            let foundStart = false;
            for (const line of lines) {
                if (line.startsWith(`${key}=`)) {
                    const firstLineContent = line.substring(`${key}=`.length);
                    if (firstLineContent.trim()) {
                        contentLines.push(firstLineContent);
                    }
                    foundStart = true;
                }
                else if (foundStart) {
                    contentLines.push(line);
                }
            }
            const content = contentLines.join('\n').replace(/\r/g, ''); // remove Windows \r
            if (!content.trim()) {
                throw new Error(`${key} content is empty`);
            }
            console.log(`✓ Extracted ${key} content. Lines found:`, contentLines.length);
            console.log(`✓ ${key} content length:`, content.length);
            console.log(`✓ ${key} content preview:`, content.substring(0, 200) + '...');
            return content;
        }
        catch (error) {
            console.error(`❌ Error reading ${key} from ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Get environment variable with fallback
     */
    getEnvVar(key, fallback) {
        const value = process.env[key] || fallback;
        if (!value) {
            throw new Error(`${key} not provided and not defined in .env`);
        }
        return value;
    }
    /**
     * Parse comma-separated environment variable
     */
    parseCommaSeparatedEnvVar(key, fallback = '') {
        const value = this.getEnvVar(key, fallback);
        return value.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    /**
     * Find and click button with multiple selectors and methods
     */
    async clickButtonWithFallback(buttonSelectors, buttonName = 'button', textVerification) {
        try {
            let buttonFound = false;
            for (const selector of buttonSelectors) {
                try {
                    console.log(`⏳ Looking for ${buttonName} with selector: ${selector}`);
                    const button = this.page.locator(selector);
                    await button.waitFor({ state: 'visible', timeout: 3000 });
                    // Verify this is the correct button if text verification function provided
                    if (textVerification) {
                        const buttonText = await button.textContent();
                        console.log(`✓ Found button with text: "${buttonText}"`);
                        if (!textVerification(buttonText || '')) {
                            console.log(`⚠️ Button text verification failed for: "${buttonText}"`);
                            continue;
                        }
                    }
                    // Try multiple clicking approaches
                    buttonFound = await this.clickElementWithFallback(button, buttonName);
                    if (buttonFound) {
                        await this.waitForTimeout(2000);
                        break;
                    }
                }
                catch (error) {
                    console.log(`⚠️ ${buttonName} selector failed: ${selector}`);
                }
            }
            if (!buttonFound) {
                console.log(`⚠️ Could not find ${buttonName}`);
            }
            return buttonFound;
        }
        catch (error) {
            console.error(`❌ Error clicking ${buttonName}:`, error);
            return false;
        }
    }
    /**
     * Check for error messages on the page
     */
    async checkForErrorMessages() {
        try {
            const errorElements = this.page.locator('[class*="error"], [class*="Error"], .alert-danger, .error-message');
            const errorCount = await errorElements.count();
            if (errorCount > 0) {
                for (let i = 0; i < errorCount; i++) {
                    const errorText = await errorElements.nth(i).textContent();
                    console.log(`⚠️ Error message found: ${errorText}`);
                }
            }
            else {
                console.log('✓ No error messages found on page');
            }
        }
        catch (error) {
            console.log('✓ No error messages found on page');
        }
    }
    /**
     * Wait for form to load
     */
    async waitForFormToLoad() {
        await this.waitForTimeout(1000);
        console.log('✓ Waited for form to load');
    }
    /**
     * Navigate to URL with error handling
     */
    async navigateToUrl(url, options) {
        const defaultOptions = {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        };
        await this.page.goto(url, { ...defaultOptions, ...options });
        console.log(`✓ Successfully navigated to: ${url}`);
    }
}
exports.CommonUtils = CommonUtils;
// Timeout constants for waitForSelector
CommonUtils.TIMEOUTS = {
    ELEMENT_VISIBLE: 7000,
    ELEMENT_VISIBLE_SHORT: 2000,
    ELEMENT_VISIBLE_VERY_SHORT: 1000,
    PAGE_LOAD: 30000,
    FORM_LOAD: 500,
    AFTER_CLICK: 1000,
    AFTER_DOUBLE_CLICK: 5000,
    AFTER_DROPDOWN_OPEN: 1000,
    AFTER_DROPDOWN_CLOSE: 500,
    AFTER_SKILL_SELECTION: 300,
    AFTER_SCROLL: 300,
    AFTER_SAVE: 1000,
    AFTER_UUID_RETRY: 2000,
    WAIT_FOR_SKILLS_LOAD: 1000,
    SCROLL_ATTEMPTS: 3,
    SCROLL_ATTEMPTS_SHORT: 2,
};
//# sourceMappingURL=CommonUtils.js.map