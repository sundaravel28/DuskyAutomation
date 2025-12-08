import { Page, BrowserContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonUtils } from './CommonUtils';
import { SCHEDULE_INTERVIEW_PAGE } from './Selectors';
import { When } from '@cucumber/cucumber';

export default class CLFlowPage extends BasePage {
  private commonUtils: CommonUtils;

  constructor(page: Page, context: BrowserContext) {
    super(page, context);
    this.commonUtils = new CommonUtils(page, context);
  }

  async navigateToCLFlowUrl(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle', timeout?: number }): Promise<void> {
    const defaultOptions = {
      waitUntil: 'domcontentloaded' as const,
      timeout: 60000
    };
    
    await this.page.goto(url, { ...defaultOptions, ...options });
    console.log(`✓ Successfully navigated to: ${url}`);
  }
}

