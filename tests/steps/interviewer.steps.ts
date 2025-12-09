import { setDefaultTimeout, Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, BrowserContext, Page, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { SCHEDULE_INTERVIEW_PAGE, URLS } from '../pages/Selectors';
import { CommonUtils } from '../pages/CommonUtils';
import InterviewerPage, { INTERVIEWER_PAGE } from '../pages/Interviewer';
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
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('domcontentloaded');
    await interviewerPage.waitForTimeout(3000);
  });  


  When('I click Past Interviews Button', async function () {
    const pastinterviewsbutton = (INTERVIEWER_PAGE.PASTINTERVIEWSBUTTON);
    const btn = page.locator(`xpath=${pastinterviewsbutton}`);
    await btn.waitFor({ state: 'visible', timeout: 20000 });
    await btn.click();
    console.log('✓ Clicked Past Interviews Button');
  });

  When('I validate past interviews count', async function () {
    // Use double quotes in XPath to avoid quote conflicts
    const rowXpath = `xpath=//div[@data-testid="candidates-table-scroll-container"]//div[contains(@class,"grid h-full border-b border-gray-200")]`;
    const locator = page.locator(rowXpath);
    let previousCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 100; // Prevent infinite loop
    const scrollUntilEnd = page.locator(`xpath=//div[@data-testid="candidates-table-scroll-container"]`);
    
    // Wait for scroll container to be visible
    await scrollUntilEnd.waitFor({ state: 'visible', timeout: 10000 });
    
    let singleScrollCount = 0;
    const maxSingleScrolls = 30; // Hard scroll after 30 single scrolls
    
    let noChangeCount = 0;
    const maxNoChangeAttempts = 3; // Stop only after 3 consecutive attempts with no change
    
    while (scrollAttempts < maxScrollAttempts) {
      // Check if we need to do a hard scroll (after 30 single scrolls)
      if (singleScrollCount >= maxSingleScrolls) {
        console.log(`⏳ Reached ${maxSingleScrolls} single scrolls - scrolling to bottom`);
        // Hard scroll - scroll to bottom of container
        await scrollUntilEnd.evaluate((el: HTMLElement) => {
          el.scrollTop = el.scrollHeight; // Scroll to bottom
        });
        singleScrollCount = 0; // Reset counter after hard scroll
        await utils.waitForTimeout(2000); // Wait longer for hard scroll content
      } else {
        // 1. Single scroll - scroll to bottom
        await scrollUntilEnd.evaluate((el: HTMLElement) => {
          el.scrollTop = el.scrollHeight; // Scroll to bottom
        });
        singleScrollCount++;
      }
      
      // 2. Wait for content to load (increased wait time)
      await utils.waitForTimeout(2000);
      
      // Wait for network to be idle
      try {
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch (e) {
        // Continue if networkidle times out
      }
      
      // 3. Take the count multiple times to ensure stability
      let currentCount = await locator.count();
      await utils.waitForTimeout(1000);
      const secondCount = await locator.count();
      await utils.waitForTimeout(1000);
      const thirdCount = await locator.count();
      
      // Use the maximum count (in case items are still loading)
      currentCount = Math.max(currentCount, secondCount, thirdCount);
      
      // 4. Wait for 2 seconds
      await utils.waitForTimeout(2000);
      
      scrollAttempts++;
      console.log(`⏳ Scroll attempt ${scrollAttempts} (single scrolls: ${singleScrollCount}/${maxSingleScrolls}): Loaded items: ${currentCount} (previous: ${previousCount})`);
      
      // Check if count changed
      if (currentCount === previousCount) {
        noChangeCount++;
        console.log(`⚠️ Count unchanged (${noChangeCount}/${maxNoChangeAttempts} consecutive attempts)`);
        
        // Only stop after multiple consecutive attempts with no change
        if (noChangeCount >= maxNoChangeAttempts) {
          console.log('✓ Reached end - no new items loaded after multiple attempts');
          break;
        }
      } else {
        // Reset counter if count changed
        noChangeCount = 0;
        console.log(`✓ Count increased from ${previousCount} to ${currentCount}`);
      }
      
      // 5. Continue the process - update previous count and repeat
      previousCount = currentCount;
    }
    console.log(`✓ Final Past Interview Count: ${previousCount}`);
  });

  


  When('I click View Candidates Button', async function () {
    const feedbackpendingbutton = (INTERVIEWER_PAGE.FEEDBACKPENDINGBUTTON);
    const btn = page.locator(`xpath=${feedbackpendingbutton}`);
    await btn.waitFor({ state: 'visible', timeout: 20000 });
    await btn.click();
    console.log('✓ Clicked Feedback Pending Button');
  });

  When('I stop the script here for Interviewer login', async function () {
    console.log('⏸️ Pausing before schedule…');
    await utils.waitForTimeout(10000); // waits 10s
  });

  When ('I validate feedback count', async function () {
    //feedbackcount
    const fullText = await page.locator("text=You still have").innerText();
    console.log(`✓ Full text: ${fullText}`);
    const match = fullText.match(/have(.*?)feedback/);
    const FeedbackCount = match?.[1].trim();
    console.log(`✓ Feedback Count: ${FeedbackCount}`);

    //pastinterviewcount
    const countText = await page.locator("//*[text()='Past Interviews']/span").innerText();
    console.log(`✓ Count text: ${countText}`);

    //validate feedback count matches past interview count
    const rowXpath = `xpath=//div[@data-testid="candidates-table-scroll-container"]//div[contains(@class,"grid h-full border-b border-gray-200")]`;
    const locator = page.locator(rowXpath);
    let previousCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 100; // Prevent infinite loop
    const scrollUntilEnd = page.locator(`xpath=//div[@data-testid="candidates-table-scroll-container"]`);
    
    // Wait for scroll container to be visible
    await scrollUntilEnd.waitFor({ state: 'visible', timeout: 10000 });
    
    let singleScrollCount = 0;
    const maxSingleScrolls = 30; // Hard scroll after 30 single scrolls
    
    let noChangeCount = 0;
    const maxNoChangeAttempts = 3; // Stop only after 3 consecutive attempts with no change
    
    while (scrollAttempts < maxScrollAttempts) {
      // Check if we need to do a hard scroll (after 30 single scrolls)
      if (singleScrollCount >= maxSingleScrolls) {
        console.log(`⏳ Reached ${maxSingleScrolls} single scrolls - scrolling to bottom`);
        // Hard scroll - scroll to bottom of container
        await scrollUntilEnd.evaluate((el: HTMLElement) => {
          el.scrollTop = el.scrollHeight; // Scroll to bottom
        });
        singleScrollCount = 0; // Reset counter after hard scroll
        await utils.waitForTimeout(2000); // Wait longer for hard scroll content
      } else {
        // 1. Single scroll - scroll to bottom
        await scrollUntilEnd.evaluate((el: HTMLElement) => {
          el.scrollTop = el.scrollHeight; // Scroll to bottom
        });
        singleScrollCount++;
      }
      // 2. Wait for content to load (increased wait time)
      await utils.waitForTimeout(2000);
      // Wait for network to be idle
      try {
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch (e) {
        // Continue if networkidle times out
      }
      // 3. Take the count multiple times to ensure stability
      let currentCount = await locator.count();
      await utils.waitForTimeout(1000);
      const secondCount = await locator.count();
      await utils.waitForTimeout(1000);
      const thirdCount = await locator.count();
      // Use the maximum count (in case items are still loading)
      currentCount = Math.max(currentCount, secondCount, thirdCount);
      // 4. Wait for 2 seconds
      await utils.waitForTimeout(2000);
      scrollAttempts++;
      console.log(`⏳ Scroll attempt ${scrollAttempts} (single scrolls: ${singleScrollCount}/${maxSingleScrolls}): Loaded items: ${currentCount} (previous: ${previousCount})`);
      // Check if count changed
      if (currentCount === previousCount) {
        noChangeCount++;
        console.log(`⚠️ Count unchanged (${noChangeCount}/${maxNoChangeAttempts} consecutive attempts)`);
        // Only stop after multiple consecutive attempts with no change
        if (noChangeCount >= maxNoChangeAttempts) {
          console.log('✓ Reached end - no new items loaded after multiple attempts');
          break;
        }
      } else {
        // Reset counter if count changed
        noChangeCount = 0;
        console.log(`✓ Count increased from ${previousCount} to ${currentCount}`);
      }
      // 5. Continue the process - update previous count and repeat
      previousCount = currentCount;
    }
    console.log(`✓ Final Past Interview Count: ${previousCount}`);
    
    // Validate that FeedbackCount == countText == previousCount
    const feedbackCountNum = parseInt(FeedbackCount || '0');
    
    // Extract number from countText (remove parentheses if present)
    const countTextMatch = countText.match(/\(?(\d+)\)?/);
    const countTextNum = countTextMatch ? parseInt(countTextMatch[1]) : 0;
    
    console.log(`✓ Validation: FeedbackCount=${feedbackCountNum}, countText=${countTextNum}, previousCount=${previousCount}`);
    
    // Validate all three counts match
    if (feedbackCountNum === countTextNum && countTextNum === previousCount) {
      console.log(`✅ Validation passed: All counts match (${previousCount})`);
      expect(feedbackCountNum).toBe(countTextNum);
      expect(countTextNum).toBe(previousCount);
    } else {
      const errorMsg = `❌ Validation failed: FeedbackCount (${feedbackCountNum}) != countText (${countTextNum}) != previousCount (${previousCount})`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  });
  


  When('I stop the script here for Interviewer login Infinite', async function () {
    console.log('⏸ Script stopped here for debugging. No further steps will run.');
    // Infinite promise -> blocks execution forever
    await new Promise(() => {});
  });
  

  When('I stop the script here for interviewer login', { timeout: 24 * 60 * 60 * 1000 }, async function () {
    console.log('⏸ Script paused here for manual interviewer login.');
    console.log('⏸ You can manually login and then stop the test manually when done.');
    console.log('⏸ This step will wait up to 24 hours before timing out.');
    // Wait for 24 hours (effectively pauses indefinitely but won't timeout)
    await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
  });
  
  
