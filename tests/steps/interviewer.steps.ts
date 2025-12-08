import { setDefaultTimeout, Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, BrowserContext, Page, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { SCHEDULE_INTERVIEW_PAGE, URLS } from '../pages/Selectors';
import { CommonUtils } from '../pages/CommonUtils';
import InterviewerPage from '../pages/Interviewer';
import jobdetailsPage from '../pages/jobdetailsPage';

// Load default .env and project-specific config.env
dotenv.config({ quiet: true });
try {
  dotenv.config({ path: path.resolve(process.cwd(), 'config.env'), quiet: true });
} catch (_) {}

let context: BrowserContext;
let page: Page;
let utils: CommonUtils;
let interviewerPage: InterviewerPage;
let talentPage: jobdetailsPage;


Before({ tags: '@Interviewflow' }, async function () {
    // Resolve Chrome user data and profile directories. Defaults target the Sundaravel profile.
    const chromeBaseDir = process.env.CHROME_USER_DATA_DIR || 'C\\\\Users\\\\Windows\\\\AppData\\\\Local\\\\Google\\\\Chrome\\\\User Data\\\\Profile 6';
    const chromeProfileDir = process.env.CHROME_PROFILE_DIR || 'Profile 6'; // adjust if Sundaravel maps to a different folder
    const profilePath = path.join(chromeBaseDir, chromeProfileDir);
  
    context = await chromium.launchPersistentContext(profilePath, {
      headless: false,
      channel: 'chrome',
      args: [
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--start-maximized',
      ]
    });
    page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    page.setDefaultTimeout(60000);
    utils = new CommonUtils(page, context);
    interviewerPage = new InterviewerPage(page, context);
    talentPage = new jobdetailsPage(page, context);
  });
  
  After({ tags: '@Interviewflow' }, async function () {
    if (context) {
      await context.close();
    }
  });


  Given('I launch Chrome with Interviewer profile {string}', async function (profileName: string) {
    // Profile is already applied in Before hook; do nothing to avoid closing context mid-scenario
  });
  
  Given('I launch Chrome with schedule Interviewer profile {string}', async function (profileName: string) {
    // Profile is already applied in Before hook; do nothing to avoid closing context mid-scenario
  });
  
  When('I navigate to the Talent Interviewer site', async function () {
    await interviewerPage.navigateToInterviewerFlowUrl(URLS.TALENT_QA_BASE);
    await interviewerPage.maximize();
    await page.waitForLoadState('domcontentloaded');
    await interviewerPage.waitForTimeout(3000);
  });  


  When('I stop the script here for interviewer login', async function () {
    console.log('⏸ Script stopped here for debugging. No further steps will run.');
    // Infinite promise -> blocks execution forever
    await new Promise(() => {});
  });
  
  
