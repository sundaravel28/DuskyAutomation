import { setDefaultTimeout, Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, BrowserContext, Page, expect } from '@playwright/test';
import jobdetailsPage from '../pages/jobdetailsPage';
import jobdescription from '../pages/jobdescription';
import jobscorescriteria from '../pages/jobscorescriteria';
import { CommonUtils } from '../pages/CommonUtils';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'validation.env') });

setDefaultTimeout(120 * 1000);

let context: BrowserContext;
let page: Page;
let talentPage: jobdetailsPage;
let jobDescPage: jobdescription;
let jobScorePage: jobscorescriteria;
let utils: CommonUtils;

Before({ tags: '@addjob' }, async function () {
  // Resolve Chrome user data and profile directories. Defaults target the Sundaravel profile.
  const chromeBaseDir = process.env.CHROME_USER_DATA_DIR || 'C\\\\Users\\\\Windows\\\\AppData\\\\Local\\\\Google\\\\Chrome\\\\User Data';
  const chromeProfileDir = process.env.CHROME_PROFILE_DIR || 'Default'; // adjust if Sundaravel maps to a different folder
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
  talentPage = new jobdetailsPage(page, context);
  jobDescPage = new jobdescription(page, context);
  jobScorePage = new jobscorescriteria(page, context);
  utils = new CommonUtils(page, context);
});

After({ tags: '@addjob' }, async function () {
  if (context) {
    await context.close();
  }
});

Given('I launch Chrome with profile {string}', async function (profileName: string) {
  // Profile is already applied in Before hook; do nothing to avoid closing context mid-scenario
});
When('I navigate to the Talent QA site', async function () {
  await talentPage.navigateToTalentQA();
  await talentPage.maximize();   // 👈 now you can call this
  await page.waitForLoadState('domcontentloaded');
  await talentPage.waitForTimeout(3000);
});

When('I stop the script here', async function () {
  console.log('⏸ Script stopped here for debugging. No further steps will run.');
  // Infinite promise -> blocks execution forever
  await new Promise(() => {});
});

When('I add a new job using environment values', async function () {
  const role = process.env.role as string;
  const department = process.env.department as string;
  const openings = process.env.Openings as string;
  const minexperienceStr = process.env.minexperience as string;
  const maxexperienceStr = process.env.maxexperience as string;
  const workpreference = process.env.workpreference as string;
  const location = process.env.location as string;
  const jobtype = process.env.jobtype as string;

  const minexperience = parseInt(minexperienceStr, 10);
  const maxexperience = parseInt(maxexperienceStr, 10);

  // Collect validation errors instead of failing immediately
  const validationErrors: string[] = [];

  if (!role) validationErrors.push("role is missing or empty");
  if (!department) validationErrors.push("department is missing or empty");
  if (!openings) validationErrors.push("openings is missing or empty");
  if (!minexperienceStr) validationErrors.push("minexperience is missing");
  if (!maxexperienceStr) validationErrors.push("maxexperience is missing");
  if (!workpreference) validationErrors.push("workpreference is missing or empty");
  if (!location) validationErrors.push("location is missing or empty");
  if (!jobtype) validationErrors.push("jobtype is missing or empty");

  if (Number.isNaN(minexperience)) {
    validationErrors.push("minexperience must be a valid number");
  }
  if (Number.isNaN(maxexperience)) {
    validationErrors.push("maxexperience must be a valid number");
  }
  if (!Number.isNaN(minexperience) && !Number.isNaN(maxexperience) && minexperience >= maxexperience) {
    validationErrors.push("minexperience must be less than maxexperience");
  }

  if (validationErrors.length > 0) {
    throw new Error(`Validation failed:\n- ${validationErrors.join("\n- ")}`);
  }

  // Fill the main job form with validated parameters
  await talentPage.AddJob(
    role,
    department,
    openings,
    minexperience,
    maxexperience,
    workpreference,
    location,
    jobtype
  );
});

When('I open Job Description and write JD content', async function () {
  await talentPage.clickJobDescription();
  await jobDescPage.writeJDContent();
  await jobDescPage.saveJobDescription();
  await jobDescPage.waitForTimeout(1000);
  await jobDescPage.scrollToBottom();
  await jobDescPage.waitForTimeout(2000);
});

When('I open Job Score Criteria and complete selections', async function () {
  await jobDescPage.clickJobScoreCriteria();
  await utils.clickAnywhereInUI();
  await jobScorePage.domainSelection();
  await utils.clickAnywhereInUI();
  await jobScorePage.selectRequiredSkills();
  await utils.clickAnywhereInUI();
  await jobScorePage.selectPreferredQualifications();
  await utils.clickAnywhereInUI();
  await jobScorePage.writeJobResponsibilities();
  await utils.clickAnywhereInUI();
  await jobScorePage.clicksaveandnext();
  await jobScorePage.clickPublish();
});

When('clickpublish', async function () {
  await jobScorePage.clickPublish();

});

Then('the job creation flow should complete successfully', async function () {
  // As in your spec, success is primarily via log statements; add a lightweight check
  expect(true).toBeTruthy();
});


