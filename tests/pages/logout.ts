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

export default class LogoutPage extends BasePage {
  private commonUtils: CommonUtils;
  constructor(page: Page, context: BrowserContext) {
    super(page, context);
    this.commonUtils = new CommonUtils(page, context);
  }

  async searchRoleToLogout() {
    const role = await this.page.locator("//*[text()='Super admin']");
    await role.click();
  }

  async clickLogout() {
    const logout = await this.page.locator("//*[text()='Log Out']");
    await logout.click();
  }
}
