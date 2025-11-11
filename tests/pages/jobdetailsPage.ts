import { Page, BrowserContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonUtils } from './CommonUtils';
import { 
  JOB_DETAILS_PAGE, 
  URLS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  DROPDOWN_CONTROLS
} from './Selectors';
import dotenv from 'dotenv';
import * as path from 'path';

// Load default .env and project-specific config.env
dotenv.config({ quiet: true });
try {
  dotenv.config({ path: path.resolve(process.cwd(), 'config.env'), quiet: true });
} catch (_) {}

export default class jobdetailsPage extends BasePage {
  private commonUtils: CommonUtils;

  constructor(page: Page, context: BrowserContext) {
    super(page, context);
    this.commonUtils = new CommonUtils(page, context);
  }

  /**
   * Navigate to the Ideas2IT Talent QA website
   */
  async navigateToTalentQA() {
    await this.commonUtils.navigateToUrl(URLS.TALENT_QA_BASE);
  }

  /**
   * Click on Job Description element
   */
  async clickJobDescription() {
    const jobDescriptionElement = await this.commonUtils.findElementWithFallback([...JOB_DETAILS_PAGE.JOB_DESCRIPTION_SELECTORS]);
    if (!jobDescriptionElement) {
      throw new Error(ERROR_MESSAGES.JOB_DESCRIPTION_NOT_FOUND);
    }
    
    // Double-click the element
    await jobDescriptionElement.dblclick();
    console.log(`✓ ${SUCCESS_MESSAGES.ELEMENT_DOUBLE_CLICKED} ${JOB_DETAILS_PAGE.TEXT_JOB_DESCRIPTION} element`);
    
    // Wait for 10 seconds before next step
    console.log(`⏳ Waiting ${JOB_DETAILS_PAGE.WAIT_AFTER_JD_CLICK / 1000} seconds for next step...`);
    await this.commonUtils.waitForTimeout(JOB_DETAILS_PAGE.WAIT_AFTER_JD_CLICK);
    console.log(`✓ ${JOB_DETAILS_PAGE.WAIT_AFTER_JD_CLICK / 1000} seconds wait completed`);
  }

  /**
   * Click the "Add Job" button with fallback selectors
   */
  async clickAddJobButton() {
    try {
      // Wait for page to be ready
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await this.commonUtils.waitForTimeout(1000);
      
      // Try clicking with fallback selectors
      const buttonFound = await this.commonUtils.clickButtonWithFallback(
        [...JOB_DETAILS_PAGE.ADD_JOB_BUTTON_SELECTORS],
        'Add Job',
        (text) => text?.toLowerCase().includes('add') && text?.toLowerCase().includes('job')
      );
      
      if (!buttonFound) {
        // Last resort: try the original selector with explicit wait
        console.log('⚠️ Fallback selectors failed, trying original selector...');
        const button = this.page.locator(JOB_DETAILS_PAGE.ADD_JOB_BUTTON);
        await button.waitFor({ state: 'visible', timeout: 10000 });
        await button.click({ timeout: 10000 });
      }
      
      console.log('✓ Clicked "Add Job" button');
      await this.commonUtils.waitForTimeout(1000);
    } catch (error) {
      console.error('❌ Error clicking Add Job button:', error);
      throw new Error(`Failed to click Add Job button: ${(error as Error).message}`);
    }
  }

  /**
   * Fill the job title input field
   */
  async fillJobTitle(jobTitle?: string) {
    const title = jobTitle || this.commonUtils.getEnvVar('role');
    await this.commonUtils.fillInputWithValidation(JOB_DETAILS_PAGE.JOB_TITLE_INPUT, title, 'job title');
  }

  /**
   * Select a department from dropdown
   */
  async selectDepartment(department?: string) {
    const dept = department || this.commonUtils.getEnvVar('department', this.commonUtils.getEnvVar('DEPARTMENT'));
    
    // Wait for form to load
    await this.commonUtils.waitForTimeout(CommonUtils.TIMEOUTS.FORM_LOAD);
    
    try {
      // Prefer selecting department by scanning for the exact placeholder text to avoid wrong dropdowns
      const allControls = this.page.locator(DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
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
        await this.commonUtils.selectFromDropdown(
          [...JOB_DETAILS_PAGE.DEPARTMENT_DROPDOWN_FALLBACK],
          dept,
          'department'
        );
        return;
      }

      await this.commonUtils.selectFromDropdownByIndex(departmentIndex, dept, 'department');
    } catch (error) {
      console.log('🔍 Primary dropdown selection failed, trying fallback methods...');
      await this.commonUtils.debugDropdowns();
      
      try {
        // Fallback: Try selecting by index (assuming department is the first dropdown)
        console.log('🔄 Trying department selection by index 0...');
        await this.commonUtils.selectFromDropdownByIndex(0, dept, 'department');
      } catch (indexError) {
        console.log('❌ All dropdown selection methods failed');
        throw new Error(`Could not select department "${dept}" using any method. Original error: ${error.message}`);
      }
    }
  }

  /**
   * Fill number of openings (text input)
   */
  async fillNumberOfOpenings(value?: string) {
    const openings = value || this.commonUtils.getEnvVar('Openings');
    await this.commonUtils.fillInputWithValidation(JOB_DETAILS_PAGE.NUMBER_OF_OPENINGS, openings, 'number of openings');
  }

  /**
   * Select a value from minimum experience dropdown
   */
  async selectMinExperienceFromDropdown(value?: string) {
    const val = value || this.commonUtils.getEnvVar('minexperience');
    
    try {
      // Prefer identifying by visible placeholder/text to avoid wrong dropdown
      const allControls = this.page.locator(DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
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
    } catch (error) {
      console.log('❌ Minimum experience dropdown selection failed');
      throw error;
    }
  }

  /**
   * Fill minimum experience field (alternative method for text input)
   */
  async fillMinExperience(value?: string) {
    const exp = value || this.commonUtils.getEnvVar('minexperience');
    await this.commonUtils.fillInputWithValidation('.custom-react-select__input input', exp, 'minimum experience');
  }


  async selectMaxExperienceFromDropdown(value?: string) {
    const val = value || this.commonUtils.getEnvVar('maxexperience');
    
    try {
      const allControls = this.page.locator(DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
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
    } catch (error) {
      console.log('❌ Maximum experience dropdown selection failed');
      throw error;
    }
  }

  async fillMaxExperience(value?: string) {
    const exp = value || this.commonUtils.getEnvVar('maxexperience');
    await this.commonUtils.fillInputWithValidation('.custom-react-select__input input', exp, 'maximum experience');
  }

  /**
   * Select work preference from dropdown
   */
  async selectWorkPreferenceFromDropdown(value?: string) {
    const val = value || this.commonUtils.getEnvVar('workpreference', 'Hybrid');
    
    try {
      const allControls = this.page.locator(DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
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
    } catch (error) {
      console.log('❌ Work preference dropdown selection failed');
      throw error;
    }
  }

  /**
   * Fill work preference field (alternative method for text input)
   */
  async fillWorkPreference(value?: string) {
    const pref = value || this.commonUtils.getEnvVar('workpreference', 'Hybrid');
    await this.commonUtils.fillInputWithValidation('.custom-react-select__input input', pref, 'work preference');
  }

  /**
   * Fill location input field
   */
  async fillLocation(value?: string) {
    const location = value || this.commonUtils.getEnvVar('location', 'Others');
    await this.commonUtils.fillInputWithValidation(JOB_DETAILS_PAGE.LOCATION_INPUT, location, 'location');
  }

  async fillEndDate() {
    try {
      // First, uncheck the "No end date (Ongoing)" checkbox if it's checked
      for (const checkboxSelector of JOB_DETAILS_PAGE.NO_END_DATE_CHECKBOX) {
        try {
          const checkbox = this.page.locator(checkboxSelector).first();
          const isVisible = await checkbox.isVisible({ timeout: 2000 }).catch(() => false);
          if (isVisible) {
            const isChecked = await checkbox.isChecked().catch(() => false);
            if (isChecked) {
              await checkbox.uncheck();
              console.log('✓ Unchecked "No end date (Ongoing)" checkbox');
              await this.commonUtils.waitForTimeout(300);
            }
            break;
          }
        } catch (e) {
          // Try next selector
          continue;
        }
      }
      
      // Now fill the end date
      const endDate = await this.commonUtils.getFutureDate();
      await this.commonUtils.fillInputWithValidation(JOB_DETAILS_PAGE.END_DATE, endDate, 'end date');
    } catch (error) {
      console.error('❌ Error filling end date:', error);
      throw error;
    }
  }

  /**
   * Select job type from dropdown
   */
  async selectJobTypeFromDropdown(value?: string) {
    const jobType = value || process.env.jobtype || 'Full-time';
    if (!jobType) throw new Error('Job type value not provided and not defined in .env');

    try {
      const allControls = this.page.locator(DROPDOWN_CONTROLS.CUSTOM_REACT_SELECT_CONTROL);
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
    } catch (error) {
      console.log('❌ Job type dropdown selection failed');
      throw error;
    }
  }

  /**
   * Fill job type field (alternative method for text input)
   */
  async fillJobType(value?: string) {
    const jobType = value || process.env.jobtype || 'Full Time';
    if (!jobType) throw new Error('Job type not provided and not defined in .env');
    
    await this.page.locator(JOB_DETAILS_PAGE.JOB_TYPE_DROPDOWN).locator(JOB_DETAILS_PAGE.JOB_TYPE_INPUT).fill(jobType);
    console.log(`✓ Filled job type: ${jobType}`);
  }

  /**
   * Alternative method to select job type using keyboard navigation
   */
  async selectJobTypeWithKeyboard(value?: string) {
    const jobType = value || process.env.jobtype || 'Full-time';
    if (!jobType) throw new Error('Job type value not provided and not defined in .env');
    
    // Find the parent control element to click on
    const jobTypeControl = this.page.locator(JOB_DETAILS_PAGE.JOB_TYPE_DROPDOWN).locator('../../..');
    await jobTypeControl.click();
    
    // Wait for dropdown menu to appear
    await this.page.waitForSelector('.custom-react-select__menu-list', { state: 'visible', timeout: CommonUtils.TIMEOUTS.ELEMENT_VISIBLE });
    
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
    } catch (_) {}

    // Wait until all react-select controls are present (expecting at least 5)
    await this.page.waitForFunction(
      () => document.querySelectorAll('.custom-react-select__control').length >= 5,
      { timeout: 15000 }
    );

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
      await control.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    }

    // Also wait for text inputs
    await this.page.locator(JOB_DETAILS_PAGE.JOB_TITLE_INPUT).waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    await this.page.locator(JOB_DETAILS_PAGE.NUMBER_OF_OPENINGS).waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    await this.page.locator(JOB_DETAILS_PAGE.LOCATION_INPUT).waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

    // Wait for react-select value container to be ready as a loader signal
    try {
      await this.page.locator('.custom-react-select__value-container.css-mo8lq1').first().waitFor({ state: 'visible', timeout: 15000 });
    } catch (_) {
      // Fallback to generic value container if hashed class changes
      await this.page.locator('.custom-react-select__value-container').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    }

    // Small buffer
    await this.commonUtils.waitForTimeout(500);
  }

  /**
   * Complete the Add Job flow
   */
  async AddJob(jobTitle: string, department?: string, openings?: string, minExperience?: number, maxExperience?: number, workPreference?: string, location?: string, jobType?: string) {
    await this.clickAddJobButton();
    await this.waitForFormToLoad();
    await this.waitForJobDetailsToRender();
    await this.fillJobTitle(jobTitle);
    await this.selectDepartment(department);
    await this.fillNumberOfOpenings(openings);
    await this.selectMinExperienceFromDropdown(minExperience?.toString());
    await this.selectMaxExperienceFromDropdown(maxExperience?.toString());
    await this.selectWorkPreferenceFromDropdown(workPreference);
    await this.fillEndDate();
    await this.fillLocation(location);
    
    // Try the regular method first, fallback to keyboard method
    try {
      await this.selectJobTypeFromDropdown(jobType);
    } catch (error) {
      console.log('Regular job type selection failed, trying keyboard method...');
      await this.selectJobTypeWithKeyboard(jobType);
    }
    
    await this.commonUtils.waitForTimeout(CommonUtils.TIMEOUTS.AFTER_CLICK);
  }
}
