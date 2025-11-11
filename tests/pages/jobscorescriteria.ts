import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonUtils } from './CommonUtils';
import { 
  JOB_SCORES_CRITERIA_PAGE, 
  URLS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  POSITIONS,
  COMMON_SELECTORS,
  DROPDOWN_OPTIONS,
  REGEX_PATTERNS,
} from './Selectors';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load default .env and project-specific config.env
dotenv.config({ quiet: true });
try {
  dotenv.config({ path: path.resolve(process.cwd(), 'config.env'), quiet: true });
} catch (_) {}

export default class jobscorescriteria extends BasePage {
  private commonUtils: CommonUtils;
  constructor(page: Page, context: BrowserContext) {
    super(page, context);
    this.commonUtils = new CommonUtils(page, context);
  }

  /**
   * Simple method: Select domain and click button
   */
  async domainSelection() {
    try {
      // Read domains from env, fallback to 'Healthcare'
      const domains = (process.env.domain || 'Healthcare').split(',').map(d => d.trim()).filter(Boolean);
  
      // Find dropdown using selectors and open it
      let dropdownOpened = false;
      for (const selector of JOB_SCORES_CRITERIA_PAGE.DOMAIN_DROPDOWN_SELECTORS) {
        const dropdown = this.page.locator(selector).first();
        if (await dropdown.count() > 0) {
          await dropdown.click();
          dropdownOpened = true;
          break;
        }
      }
      if (!dropdownOpened) throw new Error('Domain dropdown not found');
  
      // Try to type into the search input if present
      for (const inputSelector of (JOB_SCORES_CRITERIA_PAGE as any).DOMAIN_SEARCH_INPUT ?? []) {
        const searchBox = this.page.locator(inputSelector).first();
        if (await searchBox.count() > 0) {
          for (const domain of domains) {
            await searchBox.fill('');
            await searchBox.type(domain, { delay: 50 });
            const option = this.page.locator(`text="${domain}"`).first();
            await option.waitFor({ state: 'visible', timeout: 2000 });
            await option.click();
          }
          break;
        }
      }
      // Fallback: click options directly if no search box
      if (domains.length > 0) {
        for (const domain of domains) {
          const option = this.page.locator(`text="${domain}"`).first();
          if (await option.count() > 0) {
            await option.click();
          }
        }
      }
      console.log('Domain selection completed');
    } catch (error) {
      console.error('Error selecting domains:', error);
      throw error;
    }
  }

  async selectRequiredSkills() {
    try {
      // Read hard and soft skills from env with fallback defaults
      const hardSkills = (process.env.hardskills || 'Python,CSS')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const softSkills = (process.env.softskills || 'aptitude,communication')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      
      // Find and open Required Skills dropdown
      let dropdownOpened = false;
      for (const selector of JOB_SCORES_CRITERIA_PAGE.REQUIRED_SKILLS_DROPDOWN_SELECTORS) {
        const dropdown = this.page.locator(selector).first();
        if (await dropdown.count() > 0) {
          await dropdown.click();
          dropdownOpened = true;
          break;
        }
      }
      if (!dropdownOpened) throw new Error('Required Skills dropdown not found');

      // Click Hard Skills tab if present
      for (const hardTabSelector of JOB_SCORES_CRITERIA_PAGE.HARD_SKILL_SELECTORS ?? []) {
        const hardTab = this.page.locator(hardTabSelector).first();
        if (await hardTab.count() > 0) {
          if (await hardTab.isVisible()) {
            await hardTab.click();
            break;
          }
        }
      }

      // List all visible Hard Skills options (for debugging/trace)
      try {
        const hardSkillsPanel = this.page.locator('div', { hasText: JOB_SCORES_CRITERIA_PAGE.TEXT_HARD_SKILLS }).first();
        const labels = await hardSkillsPanel.locator('label').allTextContents();
        const cleaned = labels.map(t => t.trim()).filter(Boolean);
        console.log(`Hard Skills options (${cleaned.length}):`, cleaned);
      } catch (e) {
        console.log('Could not enumerate Hard Skills options:', e);
      }

      // Helper to type into search input and choose option
      const selectSkill = async (skill: string): Promise<void> => {
        // Prefer the dedicated search input if available
        let input = this.page.locator(COMMON_SELECTORS.DROPDOWN_INPUT).first();
        for (const s of (JOB_SCORES_CRITERIA_PAGE as any).REQUIRED_SKILLS_SEARCH_INPUT ?? []) {
          const candidate = this.page.locator(s).first();
          if (await candidate.count() > 0 && await candidate.isVisible()) {
            input = candidate;
            break;
          }
        }
        await input.waitFor({ state: 'visible', timeout: 4000 });
        await input.fill('');
        await input.type(skill, { delay: 50 });
        // Small wait to allow the list to filter
        await this.page.waitForTimeout(250);

        // Try react-select style option first
        const option = this.page.locator(DROPDOWN_OPTIONS.CUSTOM_REACT_SELECT_OPTION).filter({ hasText: skill }).first();
        if (await option.count() > 0 && await option.isVisible()) {
          await option.click();
          return;
        }

        // Fallback: click checkbox/label in Hard Skills panel
        try {
          await this.commonUtils.selectCheckboxesByText([skill], `//div[.//text()[contains(., "${JOB_SCORES_CRITERIA_PAGE.TEXT_HARD_SKILLS}")]]//input[@type='checkbox']`);
          return;
        } catch (_) {
          // Last resort: click the label directly
          const label = this.page.locator(`xpath=//div[.//text()[contains(., "${JOB_SCORES_CRITERIA_PAGE.TEXT_HARD_SKILLS}")]]//label[contains(normalize-space(.), "${skill}")]`).first();
          if (await label.count() > 0) {
            await label.click();
            return;
          }
        }
      };

      // Select hard skills by searching
      for (const skill of hardSkills) {
        await selectSkill(skill);
      }

      // Click Soft Skills tab and select
      for (const softTabSelector of JOB_SCORES_CRITERIA_PAGE.SOFT_SKILL_SELECTORS ?? []) {
        const softTab = this.page.locator(softTabSelector).first();
        if (await softTab.count() > 0) {
          if (await softTab.isVisible()) {
            await softTab.click();
            break;
          }
        }
      }

      for (const skill of softSkills) {
        await selectSkill(skill);
      }
  
      console.log('Required skills selection completed');
    } catch (error) {
      console.error('Error selecting required skills:', error);
      throw error;
    }
  }

  async selectPreferredQualifications() {
    try {
      // Read qualifications from env, fallback to defaults
      const qualifications = (process.env.qualifications || "Bachelor'S Degree,Master'S Degree")
        .split(',')
        .map(q => q.trim())
        .filter(Boolean);
  
      // Find dropdown and open it
      let dropdownOpened = false;
      for (const selector of JOB_SCORES_CRITERIA_PAGE.PREFERRED_QUALIFICATIONS_DROPDOWN_SELECTORS) {
        const dropdown = this.page.locator(selector).first();
        if (await dropdown.count() > 0) {
          await dropdown.click();
          dropdownOpened = true;
          break;
        }
      }
      if (!dropdownOpened) throw new Error('Preferred Qualifications dropdown not found');
  
      // Try to type into the search input if present
      for (const inputSelector of (JOB_SCORES_CRITERIA_PAGE as any).PREFERRED_QUALIFICATIONS_SEARCH_INPUT ?? []) {
        const searchBox = this.page.locator(inputSelector).first();
        if (await searchBox.count() > 0) {
          for (const qualification of qualifications) {
            await searchBox.fill('');
            await searchBox.type(qualification, { delay: 50 });
            const option = this.page.locator(`text="${qualification}"`).first();
            await option.waitFor({ state: 'visible', timeout: 2000 });
            await option.click();
          }
          break;
        }
      }
  
      // Fallback: click options directly if no search box
      if (qualifications.length > 0) {
        for (const qualification of qualifications) {
          const option = this.page.locator(`text="${qualification}"`).first();
          if (await option.count() > 0) {
            await option.click();
          }
        }
      }
  
      console.log('Preferred qualifications selection completed');
    } catch (error) {
      console.error('Error selecting preferred qualifications:', error);
      throw error;
    }
  }

  async writeJobResponsibilities() {
    try {
      // Check if we have a valid job ID in the URL
      const currentUrl = this.commonUtils.getCurrentUrl();
      console.log('✓ Current URL:', currentUrl);
  
      if (currentUrl.includes('/null/')) {
        console.log(`⚠️ ${WARNING_MESSAGES.NULL_JOB_ID}`);
        console.log('⚠️ Consider ensuring job is properly created before writing job responsibilities');
      }
  
      // Extract job ID from URL if possible
      const jobIdMatch = currentUrl.match(REGEX_PATTERNS.JOB_ID_EXTRACTION);
      const jobId = jobIdMatch ? jobIdMatch[1] : null;
      console.log('✓ Job ID from URL:', jobId);
  
      // Read job responsibilities content from jr.env or jr.txt file
      let jrContent: string = '';
      try {
        // Try jr.env first (preferred format - file exists)
        try {
          jrContent = await this.commonUtils.readContentFromEnvFile('jr.env', 'job_responsibilities');
          console.log('✓ Read job responsibilities from jr.env');
        } catch (e1) {
          // Fallback to jr.txt with key
          try {
            jrContent = await this.commonUtils.readContentFromEnvFile('jr.txt', 'job_responsibilities');
            console.log('✓ Read job responsibilities from jr.txt');
          } catch (e2) {
            // Final fallback: use entire jr.env or jr.txt contents (plain text format)
            const jrTxtPath = path.join(process.cwd(), 'jr.txt');
            const jrEnvPath = path.join(process.cwd(), 'jr.env');
            
            if (fs.existsSync(jrEnvPath)) {
              // Read entire jr.env file content
              const envContent = fs.readFileSync(jrEnvPath, 'utf8');
              // Extract content after job_responsibilities= or use entire file
              const lines = envContent.split(/\r?\n/);
              const contentLines: string[] = [];
              let foundStart = false;
              
              for (const line of lines) {
                if (line.startsWith('job_responsibilities=')) {
                  const firstLineContent = line.substring('job_responsibilities='.length);
                  if (firstLineContent.trim()) {
                    contentLines.push(firstLineContent);
                  }
                  foundStart = true;
                } else if (foundStart) {
                  contentLines.push(line);
                }
              }
              
              jrContent = contentLines.length > 0 
                ? contentLines.join('\n').replace(/\r/g, '')
                : envContent.replace(/\r/g, '');
              console.log('✓ Fallback: using jr.env content');
            } else if (fs.existsSync(jrTxtPath)) {
              jrContent = fs.readFileSync(jrTxtPath, 'utf8').replace(/\r/g, '');
              console.log('✓ Fallback: using full jr.txt content');
            } else {
              // File doesn't exist - provide helpful error
              throw new Error(
                `Job responsibilities file not found. Please create either:\n` +
                `  - jr.env with 'job_responsibilities=...' key\n` +
                `  - jr.txt file with job responsibilities content\n` +
                `  Expected location: ${process.cwd()}`
              );
            }
            
            if (!jrContent.trim()) {
              throw new Error('Job responsibilities file exists but is empty');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error reading job responsibilities:', error);
        throw error;
      }
  
      // Write content to the job responsibilities textarea(s)
      await this.commonUtils.writeToTextEditor(jrContent, [...JOB_SCORES_CRITERIA_PAGE.JOB_RESPONSIBILITIES_TEXTAREA_SELECTORS]);
  
    } catch (error) {
      console.error('❌ Error writing job responsibilities:', error);
      throw error;
    }
  }
  
  async clickPublish() {
    try {
      let clicked = false;
  
      for (const selector of JOB_SCORES_CRITERIA_PAGE.PUBLISH_BUTTON_SELECTORS) {
        const button = this.page.locator(selector).first();
        if (await button.count() > 0) {
          await button.waitFor({ state: 'visible', timeout: 3000 });
          await button.click();
          console.log(`✓ Clicked publish button using selector: ${selector}`);
          clicked = true;
          break;
        }
      }
  
      if (!clicked) {
        throw new Error('❌ Publish button not found using any selector.');
      }
  
    } catch (error) {
      console.error('❌ Error clicking publish button:', error);
      throw error;
    }
  }

  async clicksaveandnext() {
    try {
      let clicked = false;

      // Prefer the comprehensive Save & Next selector set
      for (const selector of JOB_SCORES_CRITERIA_PAGE.SAVE_NEXT_BUTTON_SELECTORS) {
        const button = this.page.locator(selector).first();
        if (await button.count() > 0) {
          await button.waitFor({ state: 'visible', timeout: 4000 });
          if (await button.isDisabled?.()) {
            continue;
          }
          await button.click();
          console.log(`✓ Clicked Save & Next using selector: ${selector}`);
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        throw new Error('❌ Save & Next button not found using any selector.');
      }

      // Wait for next step to be ready (Publish button or a brief delay)
      let publishVisible = false;
      for (const pubSelector of JOB_SCORES_CRITERIA_PAGE.PUBLISH_BUTTON_SELECTORS) {
        const pub = this.page.locator(pubSelector).first();
        if (await pub.count() > 0) {
          try {
            await pub.waitFor({ state: 'visible', timeout: 5000 });
            publishVisible = true;
            break;
          } catch (_) {
            // ignore and try next selector
          }
        }
      }
      if (!publishVisible) {
        await this.page.waitForTimeout(JOB_SCORES_CRITERIA_PAGE.WAIT_AFTER_SAVE_NEXT);
      }

    } catch (error) {
      console.error('❌ Error clicking Save & Next button:', error);
      throw error;
    }
  }

}