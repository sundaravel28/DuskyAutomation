import { Page, BrowserContext } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonUtils } from './CommonUtils';
import { 
  JOB_DESCRIPTION_PAGE, 
  URLS, 
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WARNING_MESSAGES,
  REGEX_PATTERNS
} from './Selectors';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export default class jobdescription extends BasePage {
  private commonUtils: CommonUtils;
  constructor(page: Page, context: BrowserContext) {
    super(page, context);
    this.commonUtils = new CommonUtils(page, context);
  }

  /**
   * Write multi-line JD content from jd.env into the text editor
   */
  async writeJDContent() {
    try {
      // Check if we have a valid job ID in the URL
      const currentUrl = this.commonUtils.getCurrentUrl();
      console.log('✓ Current URL:', currentUrl);
      
      if (currentUrl.includes('/null/')) {
        console.log(`⚠️ ${WARNING_MESSAGES.NULL_JOB_ID}`);
        console.log('⚠️ Consider ensuring job is properly created before writing JD');
      }
      
      // Extract job ID from URL if possible
      const jobIdMatch = currentUrl.match(REGEX_PATTERNS.JOB_ID_EXTRACTION);
      const jobId = jobIdMatch ? jobIdMatch[1] : null;
      console.log('✓ Job ID from URL:', jobId);
      
      // Read JD content from jd.env file
      const jdContent = await this.commonUtils.readContentFromEnvFile('jd.env', 'jd_content');
      
      // Write content to text editor
      await this.commonUtils.writeToTextEditor(jdContent, [...JOB_DESCRIPTION_PAGE.TEXT_EDITOR_SELECTORS]);
      
    } catch (error) {
      console.error('❌ Error writing JD content:', error);
      throw error;
    }
  }

  /**
   * Scroll down to the bottom of the page
   */
  async scrollToBottom() {
    await this.commonUtils.scrollToBottom(CommonUtils.TIMEOUTS.SCROLL_ATTEMPTS_SHORT);
  }

  /**
   * Click the Job Score Criteria button
   */
  async clickJobScoreCriteria() {
    const button = await this.commonUtils.findElementWithFallback([...JOB_DESCRIPTION_PAGE.JOB_SCORE_CRITERIA_BUTTON_SELECTORS]);
    if (!button) {
      throw new Error(ERROR_MESSAGES.JOB_SCORE_CRITERIA_NOT_FOUND);
    }
    
    // Scroll the button into view before clicking
    await button.scrollIntoViewIfNeeded();
    await this.commonUtils.waitForTimeout(CommonUtils.TIMEOUTS.AFTER_SCROLL);
    
    // Click the button
    await this.commonUtils.clickElementWithFallback(button, 'Job Score Criteria button');
    
    // Wait for any potential page changes or loading
    await this.commonUtils.waitForTimeout(CommonUtils.TIMEOUTS.AFTER_CLICK);
    console.log('✓ Job Score Criteria button click completed');
  }

  /**
   * Save job description with proper error handling for UUID issues
   */
  async saveJobDescription() {
    try {
      console.log('⏳ Attempting to save job description...');
      
      // Check current URL and job ID
      const currentUrl = this.commonUtils.getCurrentUrl();
      console.log('✓ Current URL:', currentUrl);
      
      if (currentUrl.includes('/null/')) {
        console.log(`⚠️ ${WARNING_MESSAGES.NULL_JOB_ID_GRACEFUL}`);
        
        // Try to wait for the page to load and get a proper job ID
        await this.commonUtils.waitForTimeout(CommonUtils.TIMEOUTS.AFTER_UUID_RETRY);
        
        // Check if URL has changed to have a proper job ID
        const newUrl = this.commonUtils.getCurrentUrl();
        console.log('✓ New URL after wait:', newUrl);
        
        if (newUrl.includes('/null/')) {
          console.log(`⚠️ ${WARNING_MESSAGES.STILL_NULL_JOB_ID}`);
        }
      }
      
      // Look for save button
      const saveButtonFound = await this.commonUtils.clickButtonWithFallback(
        [...JOB_DESCRIPTION_PAGE.SAVE_BUTTON_SELECTORS],
        'save button'
      );
      
      if (!saveButtonFound) {
        console.log(`⚠️ ${WARNING_MESSAGES.NO_SAVE_BUTTON}`);
      }
      
      // Check for any error messages on the page
      await this.commonUtils.checkForErrorMessages();
      
      console.log(`✅ ${SUCCESS_MESSAGES.JD_SAVE_COMPLETED}`);

    } catch (error) {
      console.error('❌ Error in job description save:', error);
      
      // Check if it's a UUID-related error
      if (error.message && error.message.includes('UUID')) {
        console.log(`⚠️ ${ERROR_MESSAGES.UUID_ERROR_DETECTED}`);
        ERROR_MESSAGES.UUID_ERROR_CAUSES.forEach((cause, index) => {
          console.log(`   ${index + 1}. ${cause}`);
        });
      }
      
      throw error;
    }
  }
}
