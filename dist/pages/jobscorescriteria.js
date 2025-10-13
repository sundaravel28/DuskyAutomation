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
const BasePage_1 = require("./BasePage");
const CommonUtils_1 = require("./CommonUtils");
const Selectors_1 = require("./Selectors");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class jobscorescriteria extends BasePage_1.BasePage {
    constructor(page, context) {
        super(page, context);
        this.commonUtils = new CommonUtils_1.CommonUtils(page, context);
    }
    /**
     * Simple method: Select domain and click button
     */
    async domainSelection() {
        try {
            // Check if page is still active
            if (!this.commonUtils.isPageActive()) {
                console.log('⚠️ Page is closed, skipping domain selection');
                return;
            }
            // Read domains from config.env and handle comma-separated values
            const domainsToSelect = this.commonUtils.parseCommaSeparatedEnvVar('domain', 'Healthcare');
            console.log('⏳ Starting domain selection...');
            console.log('✓ Domains to select:', domainsToSelect);
            // Try to find and open domain dropdown using multiple strategies
            let dropdownOpened = false;
            // Strategy 0: Use provided full class and filter by text 'Select domains...'
            try {
                const candidates = this.page.locator(Selectors_1.JOB_SCORES_CRITERIA_PAGE.DOMAIN_DROPDOWN_SELECTORS[0]);
                const candidateCount = await candidates.count();
                console.log(`✓ Found ${candidateCount} candidates with provided class`);
                for (let i = 0; i < candidateCount; i++) {
                    const el = candidates.nth(i);
                    const text = (await el.textContent()) || '';
                    console.log(`   Candidate ${i} text: "${text.trim()}"`);
                    if (text.toLowerCase().includes(Selectors_1.JOB_SCORES_CRITERIA_PAGE.TEXT_SELECT_DOMAINS.toLowerCase())) {
                        await el.click();
                        console.log('✓ Opened domain dropdown using provided class + text filter');
                        dropdownOpened = true;
                        break;
                    }
                }
            }
            catch (e) {
                console.log('⚠️ Provided class strategy failed');
            }
            // Strategy 1: Try the original selectors
            if (!dropdownOpened) {
                try {
                    const dropdown = await this.commonUtils.findElementWithFallback([...Selectors_1.JOB_SCORES_CRITERIA_PAGE.DOMAIN_DROPDOWN_SELECTORS]);
                    if (dropdown) {
                        await dropdown.click();
                        console.log('✓ Opened domain dropdown using original selectors');
                        dropdownOpened = true;
                    }
                }
                catch (error) {
                    console.log('⚠️ Original domain dropdown selectors failed');
                }
            }
            // Strategy 2: Try generic dropdown selectors
            if (!dropdownOpened) {
                try {
                    const genericSelectors = [
                        'button[role="combobox"]',
                        '[role="combobox"]',
                        '.dropdown-toggle',
                        'button:has-text("Select")',
                        'button:has-text("Choose")',
                        'button:has-text("Domain")',
                        'select',
                        '.select',
                        '[data-testid*="domain"]',
                        '[aria-label*="domain"]'
                    ];
                    const dropdown = await this.commonUtils.findElementWithFallback(genericSelectors);
                    if (dropdown) {
                        await dropdown.click();
                        console.log('✓ Opened domain dropdown using generic selectors');
                        dropdownOpened = true;
                    }
                }
                catch (error) {
                    console.log('⚠️ Generic domain dropdown selectors failed');
                }
            }
            // Strategy 3: Try to find by text content
            if (!dropdownOpened) {
                try {
                    const textSelectors = [
                        'button:has-text("Select Domain")',
                        'button:has-text("Choose Domain")',
                        'div:has-text("Domain")',
                        'label:has-text("Domain")',
                        '*:has-text("Domain"):visible'
                    ];
                    const dropdown = await this.commonUtils.findElementWithFallback(textSelectors);
                    if (dropdown) {
                        await dropdown.click();
                        console.log('✓ Opened domain dropdown using text selectors');
                        dropdownOpened = true;
                    }
                }
                catch (error) {
                    console.log('⚠️ Text-based domain dropdown selectors failed');
                }
            }
            if (!dropdownOpened) {
                console.log('🔍 Debugging available elements on page...');
                await this.commonUtils.debugClickableElements();
                await this.commonUtils.debugDropdowns();
                throw new Error('Could not find or open domain dropdown using any strategy');
            }
            if (this.commonUtils.isPageActive()) {
                await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.AFTER_DROPDOWN_OPEN);
            }
            // Select domains using robust option-by-text strategies (dropdown may not use checkboxes)
            for (const domain of domainsToSelect) {
                if (!this.commonUtils.isPageActive())
                    break;
                console.log(`⏳ Selecting domain: ${domain}`);
                let selected = false;
                // Strategy 1: role=option exact match
                try {
                    const opt = this.page.getByRole('option', { name: domain }).first();
                    await opt.waitFor({ state: 'visible', timeout: 2000 });
                    await opt.click();
                    console.log(`✓ Selected domain via role=option: ${domain}`);
                    selected = true;
                }
                catch (_) { }
                // Strategy 2: label containing text (checkbox-like UIs)
                if (!selected) {
                    try {
                        const label = this.page.locator(`label:has-text("${domain}")`).first();
                        await label.waitFor({ state: 'visible', timeout: 2000 });
                        await label.click();
                        console.log(`✓ Selected domain via label click: ${domain}`);
                        selected = true;
                    }
                    catch (_) { }
                }
                // Strategy 3: list item text
                if (!selected) {
                    try {
                        const li = this.page.locator(`li:has-text("${domain}")`).first();
                        await li.waitFor({ state: 'visible', timeout: 2000 });
                        await li.click();
                        console.log(`✓ Selected domain via li item: ${domain}`);
                        selected = true;
                    }
                    catch (_) { }
                }
                // Strategy 4: generic option containers
                if (!selected) {
                    try {
                        const generic = this.page.locator(`[role="option"], div, span`, { hasText: domain }).first();
                        await generic.waitFor({ state: 'visible', timeout: 2000 });
                        await generic.click();
                        console.log(`✓ Selected domain via generic container: ${domain}`);
                        selected = true;
                    }
                    catch (_) { }
                }
                if (!selected) {
                    console.log(`⚠️ Could not select domain: ${domain}`);
                }
                if (this.commonUtils.isPageActive()) {
                    await this.commonUtils.waitForTimeout(300);
                }
            }
            // Close dropdown
            await this.commonUtils.closeDropdown();
            // Domain selection completed; proactively open Preferred Qualifications control next
            console.log('✓ Domain selection completed');
            try {
                const prefCandidates = this.page.locator(Selectors_1.JOB_SCORES_CRITERIA_PAGE.PREFERRED_QUALIFICATIONS_DROPDOWN_SELECTORS[0]);
                const prefCount = await prefCandidates.count();
                for (let i = 0; i < prefCount; i++) {
                    const el = prefCandidates.nth(i);
                    const text = (await el.textContent()) || '';
                    if (text.toLowerCase().includes(Selectors_1.JOB_SCORES_CRITERIA_PAGE.TEXT_SELECT_PREFERRED_QUALIFICATIONS.toLowerCase())) {
                        await el.click();
                        console.log('✓ Focused Preferred Qualifications control');
                        break;
                    }
                }
            }
            catch (_) { }
            if (this.commonUtils.isPageActive()) {
                await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.AFTER_CLICK);
            }
            console.log(`✅ ${Selectors_1.SUCCESS_MESSAGES.DOMAIN_SELECTION_COMPLETED}`);
        }
        catch (error) {
            console.error('❌ Error in domain selection:', error);
            throw error;
        }
    }
    /**
     * Debug method to list all available elements in the skills dropdown
     */
    async debugSkillsDropdownContent() {
        try {
            console.log('🔍 Debugging skills dropdown content...');
            // Check for different element types in the dropdown
            const buttons = await this.page.locator('button').count();
            const divs = await this.page.locator('div').count();
            const spans = await this.page.locator('span').count();
            const labels = await this.page.locator('label').count();
            const checkboxes = await this.page.locator('input[type="checkbox"]').count();
            console.log(`✓ Found ${buttons} button elements`);
            console.log(`✓ Found ${divs} div elements`);
            console.log(`✓ Found ${spans} span elements`);
            console.log(`✓ Found ${labels} label elements`);
            console.log(`✓ Found ${checkboxes} checkbox elements`);
            // List elements with "Skills" in their text
            const skillsElements = this.page.locator('*:has-text("Skills")');
            const skillsCount = await skillsElements.count();
            console.log(`✓ Found ${skillsCount} elements containing "Skills"`);
            for (let i = 0; i < Math.min(skillsCount, 10); i++) {
                const element = skillsElements.nth(i);
                const isVisible = await element.isVisible();
                const text = await element.textContent();
                const tagName = await element.evaluate(el => el.tagName);
                console.log(`   Skills Element ${i}:`);
                console.log(`     - tag: ${tagName}`);
                console.log(`     - visible: ${isVisible}`);
                console.log(`     - text: "${text?.trim()}"`);
            }
            // List all checkboxes with their labels
            for (let i = 0; i < Math.min(checkboxes, 10); i++) {
                const checkbox = this.page.locator('input[type="checkbox"]').nth(i);
                const isVisible = await checkbox.isVisible();
                const isChecked = await checkbox.isChecked();
                const label = await checkbox.evaluate(el => {
                    const labelEl = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
                    return labelEl ? labelEl.textContent : '';
                });
                console.log(`   Checkbox ${i}:`);
                console.log(`     - visible: ${isVisible}`);
                console.log(`     - checked: ${isChecked}`);
                console.log(`     - label: "${label?.trim()}"`);
            }
        }
        catch (error) {
            console.log('⚠️ Error debugging skills dropdown content:', error);
        }
    }
    /**
     * Method to select required skills from the multiselect dropdown
     */
    async selectRequiredSkills() {
        try {
            // Check if page is still active
            if (this.page.isClosed()) {
                console.log('⚠️ Page is closed, skipping required skills selection');
                return;
            }
            // Read skills from config.env
            const hardSkillsFromConfig = process.env.hardskills || 'python,css';
            const softSkillsFromConfig = process.env.softskills || 'aptitude,communication';
            const hardSkills = hardSkillsFromConfig.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
            const softSkills = softSkillsFromConfig.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
            console.log('⏳ Starting required skills selection...');
            console.log('✓ Hard Skills to select:', hardSkills);
            console.log('✓ Soft Skills to select:', softSkills);
            // Find and click the Required Skills dropdown using provided class and text filter
            let dropdownFound = false;
            try {
                const candidates = this.page.locator(Selectors_1.JOB_SCORES_CRITERIA_PAGE.REQUIRED_SKILLS_DROPDOWN_SELECTORS[0]);
                const count = await candidates.count();
                console.log(`✓ Found ${count} candidates for required skills`);
                for (let i = 0; i < count; i++) {
                    const el = candidates.nth(i);
                    const text = (await el.textContent()) || '';
                    if (text.toLowerCase().includes(Selectors_1.JOB_SCORES_CRITERIA_PAGE.TEXT_SELECT_REQUIRED_SKILLS.toLowerCase())) {
                        await el.click();
                        console.log('✓ Opened Required Skills dropdown using provided class + text filter');
                        dropdownFound = true;
                        break;
                    }
                }
            }
            catch (_) { }
            if (!dropdownFound) {
                // Fallback to previous selector loop
                for (const selector of Selectors_1.JOB_SCORES_CRITERIA_PAGE.REQUIRED_SKILLS_DROPDOWN_SELECTORS.slice(1)) {
                    try {
                        console.log(`⏳ Trying required skills dropdown selector: ${selector}`);
                        const allDropdowns = this.page.locator(selector);
                        const dropdownCount = await allDropdowns.count();
                        console.log(`✓ Found ${dropdownCount} dropdowns with selector: ${selector}`);
                        for (let i = 0; i < dropdownCount; i++) {
                            const dropdown = allDropdowns.nth(i);
                            await dropdown.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                            const text = (await dropdown.textContent()) || '';
                            if (text.toLowerCase().includes(Selectors_1.JOB_SCORES_CRITERIA_PAGE.TEXT_SELECT_REQUIRED_SKILLS.toLowerCase())) {
                                await dropdown.click();
                                console.log(`✓ Opened Required Skills dropdown (index ${i})`);
                                dropdownFound = true;
                                break;
                            }
                        }
                        if (dropdownFound)
                            break;
                    }
                    catch (_) { }
                }
            }
            if (!dropdownFound)
                throw new Error(Selectors_1.ERROR_MESSAGES.REQUIRED_SKILLS_DROPDOWN_NOT_FOUND);
            await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.AFTER_DROPDOWN_OPEN);
            // Wait for dropdown to fully load
            if (this.commonUtils.isPageActive()) {
                await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.AFTER_DROPDOWN_OPEN);
            }
            // Debug available elements in the dropdown
            console.log('🔍 Debugging skills dropdown content...');
            await this.debugSkillsDropdownContent();
            // First, expand "Hard Skills" category using multiple strategies
            console.log('⏳ Expanding Hard Skills category...');
            let hardSkillsExpanded = false;
            // Strategy 1: Try the original selector
            try {
                if (this.commonUtils.isPageActive()) {
                    const hardSkillsCategory = this.page.locator(Selectors_1.JOB_SCORES_CRITERIA_PAGE.TEXT_HARD_SKILLS).first();
                    await hardSkillsCategory.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
                    await hardSkillsCategory.click();
                    console.log('✓ Clicked Hard Skills category to expand (original selector)');
                    hardSkillsExpanded = true;
                }
            }
            catch (error) {
                console.log('⚠️ Original Hard Skills selector failed');
            }
            // Strategy 2: Try generic selectors for Hard Skills
            if (!hardSkillsExpanded) {
                try {
                    const hardSkillsSelectors = [
                        'button:has-text("Hard Skills")',
                        'div:has-text("Hard Skills")',
                        'span:has-text("Hard Skills")',
                        'label:has-text("Hard Skills")',
                        '[data-testid*="hard-skills"]',
                        '[aria-label*="Hard Skills"]',
                        '*:has-text("Hard Skills"):visible'
                    ];
                    for (const selector of hardSkillsSelectors) {
                        try {
                            const element = this.page.locator(selector).first();
                            await element.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                            await element.click();
                            console.log(`✓ Clicked Hard Skills category using selector: ${selector}`);
                            hardSkillsExpanded = true;
                            break;
                        }
                        catch (e) {
                            // Continue to next selector
                        }
                    }
                }
                catch (error) {
                    console.log('⚠️ Generic Hard Skills selectors failed');
                }
            }
            if (hardSkillsExpanded && this.commonUtils.isPageActive()) {
                await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.WAIT_FOR_SKILLS_LOAD);
            }
            // Select hard skills from the expanded Hard Skills section
            for (const skill of hardSkills) {
                if (!this.commonUtils.isPageActive()) {
                    console.log('⚠️ Page is closed, stopping hard skills selection');
                    break;
                }
                console.log(`⏳ Selecting hard skill: ${skill}`);
                try {
                    // Try multiple selectors for hard skills
                    const skillSelectors = Selectors_1.JOB_SCORES_CRITERIA_PAGE.HARD_SKILL_SELECTORS.map(selector => selector.replace('{skill}', skill));
                    let skillSelected = false;
                    for (const selector of skillSelectors) {
                        try {
                            if (!this.commonUtils.isPageActive())
                                break;
                            const skillCheckbox = this.page.locator(selector).first();
                            await skillCheckbox.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                            const isChecked = await skillCheckbox.isChecked();
                            if (!isChecked) {
                                await skillCheckbox.click();
                                console.log(`✓ Selected hard skill: ${skill}`);
                                skillSelected = true;
                                break;
                            }
                            else {
                                console.log(`✓ Hard skill "${skill}" is already selected`);
                                skillSelected = true;
                                break;
                            }
                        }
                        catch (selectorError) {
                            console.log(`⚠️ Selector failed for hard skill ${skill}: ${selector}`);
                        }
                    }
                    if (!skillSelected) {
                        // Try clicking the label directly
                        try {
                            if (this.commonUtils.isPageActive()) {
                                const skillLabel = this.page.locator(`label:has-text("${skill}")`).first();
                                await skillLabel.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                                await skillLabel.click();
                                console.log(`✓ Selected hard skill by clicking label: ${skill}`);
                            }
                        }
                        catch (labelError) {
                            console.log(`⚠️ Could not find hard skill: ${skill}`);
                        }
                    }
                }
                catch (error) {
                    console.log(`⚠️ Error selecting hard skill: ${skill}`);
                }
                if (this.commonUtils.isPageActive()) {
                    await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.AFTER_SKILL_SELECTION);
                }
            }
            // Then, expand "Soft Skills" category using multiple strategies
            console.log('⏳ Expanding Soft Skills category...');
            let softSkillsExpanded = false;
            // Strategy 1: Try the original selector
            try {
                if (this.commonUtils.isPageActive()) {
                    const softSkillsCategory = this.page.locator(Selectors_1.JOB_SCORES_CRITERIA_PAGE.TEXT_SOFT_SKILLS).first();
                    await softSkillsCategory.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
                    await softSkillsCategory.click();
                    console.log('✓ Clicked Soft Skills category to expand (original selector)');
                    softSkillsExpanded = true;
                }
            }
            catch (error) {
                console.log('⚠️ Original Soft Skills selector failed');
            }
            // Strategy 2: Try generic selectors for Soft Skills
            if (!softSkillsExpanded) {
                try {
                    const softSkillsSelectors = [
                        'button:has-text("Soft Skills")',
                        'div:has-text("Soft Skills")',
                        'span:has-text("Soft Skills")',
                        'label:has-text("Soft Skills")',
                        '[data-testid*="soft-skills"]',
                        '[aria-label*="Soft Skills"]',
                        '*:has-text("Soft Skills"):visible'
                    ];
                    for (const selector of softSkillsSelectors) {
                        try {
                            const element = this.page.locator(selector).first();
                            await element.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                            await element.click();
                            console.log(`✓ Clicked Soft Skills category using selector: ${selector}`);
                            softSkillsExpanded = true;
                            break;
                        }
                        catch (e) {
                            // Continue to next selector
                        }
                    }
                }
                catch (error) {
                    console.log('⚠️ Generic Soft Skills selectors failed');
                }
            }
            if (softSkillsExpanded && this.commonUtils.isPageActive()) {
                await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.WAIT_FOR_SKILLS_LOAD);
            }
            // Select soft skills from the expanded Soft Skills section
            for (const skill of softSkills) {
                if (!this.commonUtils.isPageActive()) {
                    console.log('⚠️ Page is closed, stopping soft skills selection');
                    break;
                }
                console.log(`⏳ Selecting soft skill: ${skill}`);
                try {
                    // Try multiple selectors for soft skills
                    const skillSelectors = Selectors_1.JOB_SCORES_CRITERIA_PAGE.SOFT_SKILL_SELECTORS.map(selector => selector.replace('{skill}', skill));
                    let skillSelected = false;
                    for (const selector of skillSelectors) {
                        try {
                            if (!this.commonUtils.isPageActive())
                                break;
                            const skillCheckbox = this.page.locator(selector).first();
                            await skillCheckbox.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                            const isChecked = await skillCheckbox.isChecked();
                            if (!isChecked) {
                                await skillCheckbox.click();
                                console.log(`✓ Selected soft skill: ${skill}`);
                                skillSelected = true;
                                break;
                            }
                            else {
                                console.log(`✓ Soft skill "${skill}" is already selected`);
                                skillSelected = true;
                                break;
                            }
                        }
                        catch (selectorError) {
                            console.log(`⚠️ Selector failed for soft skill ${skill}: ${selector}`);
                        }
                    }
                    if (!skillSelected) {
                        // Try clicking the label directly
                        try {
                            if (this.commonUtils.isPageActive()) {
                                const skillLabel = this.page.locator(`label:has-text("${skill}")`).first();
                                await skillLabel.waitFor({ state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE_SHORT });
                                await skillLabel.click();
                                console.log(`✓ Selected soft skill by clicking label: ${skill}`);
                            }
                        }
                        catch (labelError) {
                            console.log(`⚠️ Could not find soft skill: ${skill}`);
                        }
                    }
                }
                catch (error) {
                    console.log(`⚠️ Error selecting soft skill: ${skill}`);
                }
                if (this.commonUtils.isPageActive()) {
                    await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.AFTER_SKILL_SELECTION);
                }
            }
            // Close the dropdown
            await this.commonUtils.closeDropdown();
            console.log(`✅ ${Selectors_1.SUCCESS_MESSAGES.SKILLS_SELECTION_COMPLETED}`);
        }
        catch (error) {
            console.error('❌ Error in required skills selection:', error);
            throw error;
        }
    }
    /**
     * Method to select preferred qualifications from the multiselect dropdown
     */
    async selectPreferredQualifications() {
        try {
            // Check if page is still active
            if (this.page.isClosed()) {
                console.log('⚠️ Page is closed, skipping preferred qualifications selection');
                return;
            }
            // Read qualifications from config.env
            const qualificationsFromConfig = process.env.qualifications || 'Bachelor\'s Degree,Master\'s Degree';
            const qualifications = qualificationsFromConfig.split(',').map(qual => qual.trim()).filter(qual => qual !== '');
            console.log('⏳ Starting preferred qualifications selection...');
            console.log('✓ Qualifications to select:', qualifications);
            // Prefer finding the section by its title/text and then opening the nearest dropdown within it
            let dropdownOpened = false;
            // Strategy 0: Use provided long class and filter by text 'Select preferred qualifications'
            try {
                const candidates = this.page.locator(Selectors_1.JOB_SCORES_CRITERIA_PAGE.PREFERRED_QUALIFICATIONS_DROPDOWN_SELECTORS[0]);
                const count = await candidates.count();
                console.log(`✓ Found ${count} candidates for preferred qualifications`);
                for (let i = 0; i < count; i++) {
                    const el = candidates.nth(i);
                    const text = (await el.textContent()) || '';
                    if (text.toLowerCase().includes(Selectors_1.JOB_SCORES_CRITERIA_PAGE.TEXT_SELECT_PREFERRED_QUALIFICATIONS.toLowerCase())) {
                        await el.click();
                        console.log('✓ Opened Preferred Qualifications dropdown using provided class + text filter');
                        dropdownOpened = true;
                        break;
                    }
                }
            }
            catch (_) { }
            try {
                const section = this.page.locator('*:has-text("Select preferred qualifications")').first();
                if (await section.count()) {
                    const candidate = section.locator('.border-gray-300.rounded-md.bg-white, .w-full.px-3.py-2.border.rounded-md.bg-white.text-left.flex.justify-between.items-center').first();
                    await candidate.waitFor({ state: 'visible', timeout: 3000 });
                    await candidate.click();
                    console.log('✓ Opened Preferred Qualifications dropdown via section-based locator');
                    dropdownOpened = true;
                }
            }
            catch (_) { }
            // Fallback: open the second matching dropdown that already shows selected chips (likely the correct multiselect)
            if (!dropdownOpened) {
                const all = this.page.locator('.border-gray-300.rounded-md.bg-white');
                const count = await all.count();
                for (let i = 0; i < count; i++) {
                    const el = all.nth(i);
                    const text = (await el.textContent()) || '';
                    if (text.includes('×')) { // chips indicator
                        await el.click();
                        console.log(`✓ Opened Preferred Qualifications dropdown by chips container (index ${i})`);
                        dropdownOpened = true;
                        break;
                    }
                }
            }
            if (!dropdownOpened) {
                // Last resort: click the first styled container
                const first = this.page.locator('.w-full.px-3.py-2.border.rounded-md.bg-white.text-left.flex.justify-between.items-center').first();
                await first.click();
                console.log('✓ Opened Preferred Qualifications dropdown via generic container');
                dropdownOpened = true;
            }
            if (!this.page.isClosed())
                await this.waitForTimeout(1000);
            // Wait for one of the expected qualifications to be visible as a checkbox item
            if (!this.page.isClosed()) {
                const probe = qualifications[0] || 'Bachelor\'s Degree';
                await this.page.locator(`label:has-text("${probe}")`).first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
            }
            // Select qualifications from the dropdown
            for (const qualification of qualifications) {
                if (this.page.isClosed()) {
                    console.log('⚠️ Page is closed, stopping qualifications selection');
                    break;
                }
                console.log(`⏳ Selecting qualification: ${qualification}`);
                try {
                    // Try multiple selectors for qualifications
                    const qualificationSelectors = [
                        `input[type="checkbox"]:near(span:has-text("${qualification}"))`,
                        `label:has-text("${qualification}") input[type="checkbox"]`,
                        `input[type="checkbox"]:near(label:has-text("${qualification}"))`,
                        `[data-testid*="${qualification}"] input[type="checkbox"]`
                    ];
                    let qualificationSelected = false;
                    for (const selector of qualificationSelectors) {
                        try {
                            if (this.page.isClosed())
                                break;
                            const qualificationCheckbox = this.page.locator(selector).first();
                            await qualificationCheckbox.waitFor({ state: 'visible', timeout: 3000 });
                            const isChecked = await qualificationCheckbox.isChecked();
                            if (!isChecked) {
                                await qualificationCheckbox.click();
                                console.log(`✓ Selected qualification: ${qualification}`);
                                qualificationSelected = true;
                                break;
                            }
                            else {
                                console.log(`✓ Qualification "${qualification}" is already selected`);
                                qualificationSelected = true;
                                break;
                            }
                        }
                        catch (selectorError) {
                            console.log(`⚠️ Selector failed for qualification ${qualification}: ${selector}`);
                        }
                    }
                    if (!qualificationSelected) {
                        // Try clicking the label directly
                        try {
                            if (!this.page.isClosed()) {
                                const qualificationLabel = this.page.locator(`label:has-text("${qualification}")`).first();
                                await qualificationLabel.waitFor({ state: 'visible', timeout: 3000 });
                                await qualificationLabel.click();
                                console.log(`✓ Selected qualification by clicking label: ${qualification}`);
                            }
                        }
                        catch (labelError) {
                            console.log(`⚠️ Could not find qualification: ${qualification}`);
                        }
                    }
                }
                catch (error) {
                    console.log(`⚠️ Error selecting qualification: ${qualification}`);
                }
                if (!this.page.isClosed()) {
                    await this.waitForTimeout(500);
                }
            }
            // Close the dropdown
            console.log('⏳ Closing Preferred Qualifications dropdown...');
            try {
                if (!this.page.isClosed()) {
                    await this.page.keyboard.press('Escape');
                    console.log('✓ Pressed Escape key to close dropdown');
                    if (!this.page.isClosed()) {
                        await this.waitForTimeout(1000);
                    }
                }
            }
            catch (error) {
                console.log('⚠️ Escape key failed to close dropdown');
            }
            try {
                if (!this.page.isClosed()) {
                    await this.page.click('body', { position: { x: 50, y: 50 } });
                    console.log('✓ Clicked outside dropdown to close it');
                    if (!this.page.isClosed()) {
                        await this.waitForTimeout(1000);
                    }
                }
            }
            catch (error) {
                console.log('⚠️ Clicking outside failed to close dropdown');
            }
            if (!this.page.isClosed()) {
                await this.waitForTimeout(2000);
            }
            console.log('✅ Preferred qualifications selection completed successfully');
        }
        catch (error) {
            console.error('❌ Error in preferred qualifications selection:', error);
            throw error;
        }
    }
    /**
     * Method to write job responsibilities from jr.env file into the text area
     */
    async writeJobResponsibilities() {
        try {
            // Check if page is still active
            if (!this.commonUtils.isPageActive()) {
                console.log('⚠️ Page is closed, skipping job responsibilities writing');
                return;
            }
            console.log('⏳ Starting job responsibilities writing...');
            // Read job responsibilities from jr.env file
            let jobResponsibilities = '';
            try {
                jobResponsibilities = await this.commonUtils.readContentFromEnvFile('jr.env', 'job_responsibilities');
            }
            catch (fileError) {
                console.log('⚠️ Error reading jr.env file, using default responsibilities');
                jobResponsibilities = 'Develop and implement marketing strategies, Manage social media campaigns, Analyze market trends and customer insights, Collaborate with cross-functional teams, Track and report on campaign performance';
            }
            console.log('✓ Job responsibilities to write:', jobResponsibilities);
            // Find the job responsibilities text area
            const textArea = await this.commonUtils.findElementWithFallback([...Selectors_1.JOB_SCORES_CRITERIA_PAGE.JOB_RESPONSIBILITIES_TEXTAREA_SELECTORS]);
            if (!textArea) {
                throw new Error(Selectors_1.ERROR_MESSAGES.JOB_RESPONSIBILITIES_TEXTAREA_NOT_FOUND);
            }
            // Use common method to write content
            await this.commonUtils.writeToTextEditor(jobResponsibilities, [...Selectors_1.JOB_SCORES_CRITERIA_PAGE.JOB_RESPONSIBILITIES_TEXTAREA_SELECTORS]);
            console.log(`✅ ${Selectors_1.SUCCESS_MESSAGES.JOB_RESPONSIBILITIES_COMPLETED}`);
        }
        catch (error) {
            console.error('❌ Error in job responsibilities writing:', error);
            throw error;
        }
    }
    /**
     * Click the Publish button on Job Score Criteria page
     */
    async clickPublish() {
        try {
            if (!this.commonUtils.isPageActive()) {
                console.log('⚠️ Page is closed, skipping Publish action');
                return;
            }
            console.log('⏳ Looking for Publish button...');
            const clicked = await this.commonUtils.clickButtonWithFallback([
                ...Selectors_1.JOB_SCORES_CRITERIA_PAGE.PUBLISH_BUTTON_SELECTORS
            ], 'Publish button', (text) => Boolean(text && text.toLowerCase().includes('publish')));
            if (!clicked) {
                console.log('⚠️ Could not find Publish button');
            }
            if (this.commonUtils.isPageActive()) {
                await this.commonUtils.waitForTimeout(1000);
            }
            console.log('✓ Publish button click attempted');
        }
        catch (error) {
            console.error('❌ Error clicking Publish button:', error);
            throw error;
        }
    }
}
exports.default = jobscorescriteria;
//# sourceMappingURL=jobscorescriteria.js.map