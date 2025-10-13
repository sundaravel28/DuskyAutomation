import { test, chromium, BrowserContext, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import jobdetailsPage from './pages/jobdetailsPage';
import jobdescription from './pages/jobdescription';
import jobscorescriteria from './pages/jobscorescriteria';

dotenv.config({ path: 'C:\\Users\\sundaravel.v\\Documents\\Dusky\\config.env' });

test('open Ideas2IT Talent QA website with specific profile', async () => {
  let context: BrowserContext | undefined;
  let page: Page | undefined;
  let talentPage: jobdetailsPage | undefined;
  let jobDescPage: jobdescription | undefined;
  let jobScorePage: jobscorescriteria | undefined;

  try {
    console.log('Launching Chrome with Sundaravel profile...');

    const userDataDir = 'C:\\Users\\sundaravel.v\\Documents\\Dusky\\C\\Users\\Windows\\AppData\\Local\\Google\\Chrome\\User Data';

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      channel: 'chrome',
      args: [
        '--profile-directory=Profile 6',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--start-maximized',
      ]
    });

    console.log('✓ Chrome launched successfully with Sundaravel profile');

    page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    page.setDefaultTimeout(60000);

    talentPage = new jobdetailsPage(page, context);
    jobDescPage = new jobdescription(page, context);
    jobScorePage = new jobscorescriteria(page, context);

    await talentPage.navigateToTalentQA();
    await page.waitForLoadState('domcontentloaded');
    await talentPage.waitForTimeout(3000);

    const role = process.env.role;
    const department = process.env.department;
    const openings = process.env.Openings;
    
    // Parse experience values as numbers
    const minexperienceStr = process.env.minexperience;
    const maxexperienceStr = process.env.maxexperience;
    const minexperience = minexperienceStr ? parseInt(minexperienceStr, 10) : undefined;
    const maxexperience = maxexperienceStr ? parseInt(maxexperienceStr, 10) : undefined;
    
    const workpreference = process.env.workpreference;
    const location = process.env.location;
    const jobtype = process.env.jobtype;
    
    if (!role || !department || !openings || !minexperience || !maxexperience || !workpreference || !location || !jobtype) {
      throw new Error('role, department, Openings, minexperience, maxexperience, workpreference, location, or jobtype is not defined in the .env file');
    }
    
    // Validate that experience values are valid numbers
    if (isNaN(minexperience) || isNaN(maxexperience)) {
      throw new Error('minexperience and maxexperience must be valid numbers');
    }
    
    if (minexperience >= maxexperience) {
      throw new Error('minexperience must be less than maxexperience');
    }
    
    console.log(`✓ Parsed experience values - Min: ${minexperience} (${typeof minexperience}), Max: ${maxexperience} (${typeof maxexperience})`);

    await talentPage.AddJob(role, department, openings, minexperience, maxexperience, workpreference, location, jobtype);

    // Click on Job Description to proceed to next step
    await talentPage.clickJobDescription();

    // Write JD content into the text editor
    await jobDescPage.writeJDContent();

    // Save job description to handle UUID issues
    console.log('⏳ Saving job description...');
    await jobDescPage.saveJobDescription();
    console.log('✅ Job description saved');

    console.log('⏳ Additional wait for page to stabilize...');
    await jobDescPage.waitForTimeout(1000);

    // Scroll down to reach the bottom of the page
    await jobDescPage.scrollToBottom();
    
    // Additional wait for page to fully load and stabilize
    console.log('⏳ Additional wait for page to stabilize...');
    await jobDescPage.waitForTimeout(2000);
    
    // Click Job Score Criteria button
    await jobDescPage.clickJobScoreCriteria();

    // Select domains in Job Score Criteria page using Page Object Model
    console.log('⏳ Starting Job Score Criteria domain selection...');
    await jobScorePage.domainSelection();
    console.log('✅ Job Score Criteria domain selection completed');
    
    // Select required skills in Job Score Criteria page
    console.log('⏳ Starting Required Skills selection...');
    await jobScorePage.selectRequiredSkills();
    console.log('✅ Required Skills selection completed');
    
    // Select preferred qualifications in Job Score Criteria page
    console.log('⏳ Starting Preferred Qualifications selection...');
    await jobScorePage.selectPreferredQualifications();
    console.log('✅ Preferred Qualifications selection completed');
    
    // Write job responsibilities from jr.env file
    console.log('⏳ Starting Job Responsibilities writing...');
    await jobScorePage.writeJobResponsibilities();
    console.log('✅ Job Responsibilities writing completed');
    

    // Test completed successfully
    console.log('✅ Job creation and JD writing flow completed successfully!');

  } catch (error: any) {
    console.error('❌ Error launching browser with Sundaravel profile:', error.message);
    console.log('🔄 You may try fallback with regular Chrome here if needed');
  }
});
