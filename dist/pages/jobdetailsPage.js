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
dotenv.config(); // Load env variables
class jobdetailsPage extends BasePage_1.BasePage {
    constructor(page, context) {
        super(page, context);
        this.commonUtils = new CommonUtils_1.CommonUtils(page, context);
    }
    /**
     * Navigate to the Ideas2IT Talent QA website
     */
    async navigateToTalentQA() {
        await this.commonUtils.navigateToUrl(Selectors_1.URLS.TALENT_QA_BASE);
    }
    /**
     * Click on Job Description element
     */
    async clickJobDescription() {
        const jobDescriptionElement = await this.commonUtils.findElementWithFallback([...Selectors_1.JOB_DETAILS_PAGE.JOB_DESCRIPTION_SELECTORS]);
        if (!jobDescriptionElement) {
            throw new Error(Selectors_1.ERROR_MESSAGES.JOB_DESCRIPTION_NOT_FOUND);
        }
        // Double-click the element
        await jobDescriptionElement.dblclick();
        console.log(`✓ ${Selectors_1.SUCCESS_MESSAGES.ELEMENT_DOUBLE_CLICKED} ${Selectors_1.JOB_DETAILS_PAGE.TEXT_JOB_DESCRIPTION} element`);
        // Wait for 10 seconds before next step
        console.log(`⏳ Waiting ${Selectors_1.JOB_DETAILS_PAGE.WAIT_AFTER_JD_CLICK / 1000} seconds for next step...`);
        await this.commonUtils.waitForTimeout(Selectors_1.JOB_DETAILS_PAGE.WAIT_AFTER_JD_CLICK);
        console.log(`✓ ${Selectors_1.JOB_DETAILS_PAGE.WAIT_AFTER_JD_CLICK / 1000} seconds wait completed`);
    }
    /**
     * Click the "Add Job" button
     */
    async clickAddJobButton() {
        await this.page.click(Selectors_1.JOB_DETAILS_PAGE.ADD_JOB_BUTTON);
        console.log('✓ Clicked "Add Job" button');
    }
    /**
     * Fill the job title input field
     */
    async fillJobTitle(jobTitle) {
        const title = jobTitle || this.commonUtils.getEnvVar('role');
        await this.commonUtils.fillInputWithValidation(Selectors_1.JOB_DETAILS_PAGE.JOB_TITLE_INPUT, title, 'job title');
    }
    /**
     * Select a department from dropdown
     */
    async selectDepartment(department) {
        const dept = department || this.commonUtils.getEnvVar('department', this.commonUtils.getEnvVar('DEPARTMENT'));
        // Wait for form to load
        await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.FORM_LOAD);
        try {
            // Prefer selecting department by scanning for the exact placeholder text to avoid wrong dropdowns
            const allControls = this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
            const count = await allControls.count();
            let departmentIndex = -1;
            for (let i = 0; i < count; i++) {
                const text = (await allControls.nth(i).textContent()) || '';
                if (text.toLowerCase().includes('select a department')) {
                    departmentIndex = i;
                    break;
                }
            }
            if (departmentIndex === -1) {
                // Fallback to previous intelligent method
                await this.commonUtils.selectFromDropdown([...Selectors_1.JOB_DETAILS_PAGE.DEPARTMENT_DROPDOWN_FALLBACK], dept, 'department');
                return;
            }
            await this.commonUtils.selectFromDropdownByIndex(departmentIndex, dept, 'department');
        }
        catch (error) {
            console.log('🔍 Primary dropdown selection failed, trying fallback methods...');
            await this.commonUtils.debugDropdowns();
            try {
                // Fallback: Try selecting by index (assuming department is the first dropdown)
                console.log('🔄 Trying department selection by index 0...');
                await this.commonUtils.selectFromDropdownByIndex(0, dept, 'department');
            }
            catch (indexError) {
                console.log('❌ All dropdown selection methods failed');
                throw new Error(`Could not select department "${dept}" using any method. Original error: ${error.message}`);
            }
        }
    }
    /**
     * Fill number of openings (text input)
     */
    async fillNumberOfOpenings(value) {
        const openings = value || this.commonUtils.getEnvVar('Openings');
        await this.commonUtils.fillInputWithValidation(Selectors_1.JOB_DETAILS_PAGE.NUMBER_OF_OPENINGS, openings, 'number of openings');
    }
    /**
     * Select a value from minimum experience dropdown
     */
    async selectMinExperienceFromDropdown(value) {
        const val = value || this.commonUtils.getEnvVar('minexperience');
        try {
            // Prefer identifying by visible placeholder/text to avoid wrong dropdown
            const allControls = this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
            const count = await allControls.count();
            let targetIndex = -1;
            for (let i = 0; i < count; i++) {
                const text = (await allControls.nth(i).textContent()) || '';
                if (text.toLowerCase().includes('min exp')) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex === -1) {
                targetIndex = 1; // fallback to known position
            }
            await this.commonUtils.selectFromDropdownByIndex(targetIndex, val, 'minimum experience');
        }
        catch (error) {
            console.log('❌ Minimum experience dropdown selection failed');
            throw error;
        }
    }
    /**
     * Fill minimum experience field (alternative method for text input)
     */
    async fillMinExperience(value) {
        const exp = value || this.commonUtils.getEnvVar('minexperience');
        await this.commonUtils.fillInputWithValidation('.custom-react-select__input input', exp, 'minimum experience');
    }
    async selectMaxExperienceFromDropdown(value) {
        const val = value || this.commonUtils.getEnvVar('maxexperience');
        try {
            const allControls = this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
            const count = await allControls.count();
            let targetIndex = -1;
            for (let i = 0; i < count; i++) {
                const text = (await allControls.nth(i).textContent()) || '';
                if (text.toLowerCase().includes('max exp')) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex === -1) {
                targetIndex = 2; // fallback to known position
            }
            await this.commonUtils.selectFromDropdownByIndex(targetIndex, val, 'maximum experience');
        }
        catch (error) {
            console.log('❌ Maximum experience dropdown selection failed');
            throw error;
        }
    }
    async fillMaxExperience(value) {
        const exp = value || this.commonUtils.getEnvVar('maxexperience');
        await this.commonUtils.fillInputWithValidation('.custom-react-select__input input', exp, 'maximum experience');
    }
    /**
     * Select work preference from dropdown
     */
    async selectWorkPreferenceFromDropdown(value) {
        const val = value || this.commonUtils.getEnvVar('workpreference', 'Hybrid');
        try {
            const allControls = this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
            const count = await allControls.count();
            let targetIndex = -1;
            for (let i = 0; i < count; i++) {
                const text = (await allControls.nth(i).textContent()) || '';
                if (text.toLowerCase().includes('select mode')) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex === -1) {
                targetIndex = 3; // fallback to known position
            }
            // Wait for options to load
            await this.commonUtils.waitForDropdownOptionsByIndex(targetIndex, [
                process.env.WORK_PREF_ONSITE || 'On Site',
                process.env.WORK_PREF_HYBRID || 'Hybrid',
                process.env.WORK_PREF_REMOTE || '100% Remote'
            ], 12000);
            await this.commonUtils.selectFromDropdownByIndex(targetIndex, val, 'work preference');
        }
        catch (error) {
            console.log('❌ Work preference dropdown selection failed');
            throw error;
        }
    }
    /**
     * Fill work preference field (alternative method for text input)
     */
    async fillWorkPreference(value) {
        const pref = value || this.commonUtils.getEnvVar('workpreference', 'Hybrid');
        await this.commonUtils.fillInputWithValidation('.custom-react-select__input input', pref, 'work preference');
    }
    /**
     * Fill location input field
     */
    async fillLocation(value) {
        const location = value || this.commonUtils.getEnvVar('location', 'Others');
        await this.commonUtils.fillInputWithValidation(Selectors_1.JOB_DETAILS_PAGE.LOCATION_INPUT, location, 'location');
    }
    /**
     * Select job type from dropdown
     */
    async selectJobTypeFromDropdown(value) {
        const jobType = value || process.env.jobtype || 'Full-time';
        if (!jobType)
            throw new Error('Job type value not provided and not defined in .env');
        try {
            const allControls = this.page.locator(Selectors_1.DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
            const count = await allControls.count();
            let targetIndex = -1;
            for (let i = 0; i < count; i++) {
                const text = (await allControls.nth(i).textContent()) || '';
                if (text.toLowerCase().includes('select the job type')) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex === -1) {
                targetIndex = 5; // fallback to known position
            }
            await this.commonUtils.waitForDropdownOptionsByIndex(targetIndex, [
                process.env.JOBTYPE_FULLTIME || 'Full-time',
                process.env.JOBTYPE_PARTTIME || 'Part-time'
            ], 12000);
            await this.commonUtils.selectFromDropdownByIndex(targetIndex, jobType, 'job type');
        }
        catch (error) {
            console.log('❌ Job type dropdown selection failed');
            throw error;
        }
    }
    /**
     * Fill job type field (alternative method for text input)
     */
    async fillJobType(value) {
        const jobType = value || process.env.jobtype || 'Full Time';
        if (!jobType)
            throw new Error('Job type not provided and not defined in .env');
        await this.page.locator(Selectors_1.JOB_DETAILS_PAGE.JOB_TYPE_DROPDOWN).locator(Selectors_1.JOB_DETAILS_PAGE.JOB_TYPE_INPUT).fill(jobType);
        console.log(`✓ Filled job type: ${jobType}`);
    }
    /**
     * Alternative method to select job type using keyboard navigation
     */
    async selectJobTypeWithKeyboard(value) {
        const jobType = value || process.env.jobtype || 'Full-time';
        if (!jobType)
            throw new Error('Job type value not provided and not defined in .env');
        // Find the parent control element to click on
        const jobTypeControl = this.page.locator(Selectors_1.JOB_DETAILS_PAGE.JOB_TYPE_DROPDOWN).locator('../../..');
        await jobTypeControl.click();
        // Wait for dropdown menu to appear
        await this.page.waitForSelector('.custom-react-select__menu-list', { state: 'visible', timeout: CommonUtils_1.CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
        // Use keyboard to navigate and select
        await this.page.keyboard.press('ArrowDown'); // Navigate to first option
        await this.page.keyboard.press('Enter'); // Select the option
        console.log(`✓ Selected job type using keyboard: ${jobType}`);
    }
    /**
     * Wait for the form to load after clicking add job button
     */
    async waitForFormToLoad() {
        await this.commonUtils.waitForFormToLoad();
    }
    /**
     * Wait until the Job Details screen has rendered all key elements
     */
    async waitForJobDetailsToRender() {
        try {
            // Ensure DOM is loaded
            await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        }
        catch (_) { }
        // Wait until all react-select controls are present (expecting at least 5)
        await this.page.waitForFunction(() => document.querySelectorAll('.custom-react-select__control').length >= 5, { timeout: 15000 });
        // Wait for each expected control by visible text
        const expectedControls = [
            'Select a department',
            'Min Exp',
            'Max exp',
            'Select mode',
            'Select the job type'
        ];
        for (const text of expectedControls) {
            const control = this.page.locator('.custom-react-select__control', { hasText: text });
            await control.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => { });
        }
        // Also wait for text inputs
        await this.page.locator(Selectors_1.JOB_DETAILS_PAGE.JOB_TITLE_INPUT).waitFor({ state: 'visible', timeout: 8000 }).catch(() => { });
        await this.page.locator(Selectors_1.JOB_DETAILS_PAGE.NUMBER_OF_OPENINGS).waitFor({ state: 'visible', timeout: 8000 }).catch(() => { });
        await this.page.locator(Selectors_1.JOB_DETAILS_PAGE.LOCATION_INPUT).waitFor({ state: 'visible', timeout: 8000 }).catch(() => { });
        // Wait for react-select value container to be ready as a loader signal
        try {
            await this.page.locator('.custom-react-select__value-container.css-mo8lq1').first().waitFor({ state: 'visible', timeout: 15000 });
        }
        catch (_) {
            // Fallback to generic value container if hashed class changes
            await this.page.locator('.custom-react-select__value-container').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => { });
        }
        // Small buffer
        await this.commonUtils.waitForTimeout(500);
    }
    /**
     * Complete the Add Job flow
     */
    async AddJob(jobTitle, department, openings, minExperience, maxExperience, workPreference, location, jobType) {
        await this.clickAddJobButton();
        await this.waitForFormToLoad();
        await this.waitForJobDetailsToRender();
        await this.fillJobTitle(jobTitle);
        await this.selectDepartment(department);
        await this.fillNumberOfOpenings(openings);
        await this.selectMinExperienceFromDropdown(minExperience?.toString());
        await this.selectMaxExperienceFromDropdown(maxExperience?.toString());
        await this.selectWorkPreferenceFromDropdown(workPreference);
        await this.fillLocation(location);
        // Try the regular method first, fallback to keyboard method
        try {
            await this.selectJobTypeFromDropdown(jobType);
        }
        catch (error) {
            console.log('Regular job type selection failed, trying keyboard method...');
            await this.selectJobTypeWithKeyboard(jobType);
        }
        await this.commonUtils.waitForTimeout(CommonUtils_1.CommonUtils.TIMEOUTS.AFTER_CLICK);
    }
}
exports.default = jobdetailsPage;
//# sourceMappingURL=jobdetailsPage.js.map