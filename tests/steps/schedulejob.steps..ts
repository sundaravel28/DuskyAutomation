import { setDefaultTimeout, Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, BrowserContext, Page, expect } from '@playwright/test';
import jobdetailsPage from '../pages/jobdetailsPage';
import jobdescription from '../pages/jobdescription';
import jobscorescriteria from '../pages/jobscorescriteria';
import LogoutPage from '../pages/logout';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { editPdf, createResumePdf } from '../pages/pdfeditor';
import { SCHEDULE_INTERVIEW_PAGE } from '../pages/Selectors';
import { CommonUtils } from '../pages/CommonUtils';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), 'config.env'), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), 'validation.env'), quiet: true });

setDefaultTimeout(120 * 1000);

let context: BrowserContext;
let page: Page;
let talentPage: jobdetailsPage;
let jobDescPage: jobdescription;
let jobScorePage: jobscorescriteria;
let logout: LogoutPage;
let utils: CommonUtils;

Before({ tags: '@schedule' }, async function () {
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
  logout = new LogoutPage(page, context);
  utils = new CommonUtils(page, context);
});

After({ tags: '@schedule' }, async function () {
  if (context) {
    await context.close();
  }
});

Given('I launch Chrome with profile {string}', async function (profileName: string) {
  // Profile is already applied in Before hook; do nothing to avoid closing context mid-scenario
});

Given('I launch Chrome with schedule profile {string}', async function (profileName: string) {
  // Profile is already applied in Before hook; do nothing to avoid closing context mid-scenario
});

When('I navigate to the Talent QA site for schedule', async function () {
  await talentPage.navigateToTalentQA();
  await talentPage.maximize();
  await page.waitForLoadState('domcontentloaded');
  await talentPage.waitForTimeout(3000);
});  

Given('Update PDF', async function () {
  // Create a new PDF resume from scratch with random name, email, and phone
  await createResumePdf();
});

// Validate job title heading on Schedule Interview page using centralized selector
When('Search Role to Schedule Interview', async function () {
  const heading = page.locator(`xpath=${SCHEDULE_INTERVIEW_PAGE.SELECT_ROLE_FOR_INTERVIEW}`).first();
  await heading.waitFor({ state: 'visible', timeout: 10000 });
  await heading.click();
  console.log('✓ Clicked job title heading via selector: SELECT_ROLE_FOR_INTERVIEW');
});

When('Select pipeline Button', async function () {
  const selectcreateeventbutton = (SCHEDULE_INTERVIEW_PAGE.CLICKPIPELINE);
  const btn = page.locator(`xpath=${selectcreateeventbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked pipeline Button');
});



When('Click Settings', async function () {
  const selectorFromMap = (SCHEDULE_INTERVIEW_PAGE as any).CLICK_SETTINGS;
  const candidates = [
    selectorFromMap ? `xpath=${selectorFromMap}` : undefined,
    (SCHEDULE_INTERVIEW_PAGE as any).SETTINGS_BADGE_STRICT,
    ...(((SCHEDULE_INTERVIEW_PAGE as any).SETTINGS_BADGE_CANDIDATES) || []),
    "a:has-text(\"Settings\")",
    "text=Settings",
    "role=link[name=Settings]",
  ].filter(Boolean) as string[];

  const btn = await utils.findElementWithFallback(candidates, 10000);
  if (!btn) {
    throw new Error('Could not find Settings link/button');
  }
  await utils.clickElementWithFallback(btn, 'Settings');
  console.log('✓ Clicked SETTINGS');
});

When('Open Feedback form', async function () {
  // Ensure Hiring Stages section is in view
  try {
    await this.page.locator('text=Hiring Stages').first().scrollIntoViewIfNeeded();
  } catch (_) {}

  // Try the most specific selector first: title
  try {
    const byTitle = this.page.getByTitle('Select a form').first();
    await byTitle.waitFor({ state: 'visible', timeout: 5000 });
    await byTitle.click();
    console.log('✓ Opened Feedback form via title selector');
    return;
  } catch (_) {}

  const strict = (SCHEDULE_INTERVIEW_PAGE as any).FEEDBACK_FORM_BUTTON_STRICT;
  const candidates = [
    strict,
    ...(((SCHEDULE_INTERVIEW_PAGE as any).FEEDBACK_FORM_BUTTON_CANDIDATES) || []),
  ].filter(Boolean) as string[];

  const button = await utils.findElementWithFallback(candidates, 15000);
  if (button) {
    await utils.clickElementWithFallback(button, 'Feedback form button');
    console.log('✓ Opened Feedback form');
    return;
  }

  // Deep DOM fallback: scan all buttons for title/text/class heuristics
  const handle = await this.page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
    const match = buttons.find(b => {
      const t = (b.getAttribute('title') || '').toLowerCase();
      const text = (b.innerText || '').toLowerCase();
      const cls = (b.className || '').toLowerCase();
      return t.includes('select a form')
        || text.includes('add feedback form')
        || (cls.includes('ml-auto') && cls.includes('px-2') && cls.includes('bg-gray-100') && cls.includes('gap-1'));
    });
    return match || null;
  });
  if (handle) {
    try {
      await (handle as any).scrollIntoViewIfNeeded?.();
    } catch {}
    await this.page.evaluate((el: Element) => (el as HTMLElement).click(), handle as any);
    console.log('✓ Opened Feedback form via DOM scan');
    return;
  }

  throw new Error('Feedback form button not found');
});

When('Add Candidate', async function () {
  const addCandidateSelector = (SCHEDULE_INTERVIEW_PAGE as any).ADD_CANDIDATE_BUTTON;
  const btn = page.locator(`xpath=${addCandidateSelector}`).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  console.log('✓ Clicked Add Candidate');
});

When('click resume upload link', async function () {
  const heading = page.locator(`xpath=${SCHEDULE_INTERVIEW_PAGE.SELECT_RESUME_UPLOAD_LINK}`).first();
  await heading.waitFor({ state: 'visible', timeout: 10000 });
  await heading.click();
  console.log('✓ Clicked job title heading via selector: SELECT_RESUME_UPLOAD_LINK');
});

When('select source', async function () {
  // Available source options (excluding "Others" to choose from other options)
  const sourceOptions = ['Career Page', 'Website', 'LinkedIn', 'Naukri', 'Others'];
  
  // Randomly select one source option
  const randomIndex = Math.floor(Math.random() * sourceOptions.length);
  const selectedSource = sourceOptions[randomIndex];
  
  // Get the main selector and candidate selectors
  const sourceSelector = (SCHEDULE_INTERVIEW_PAGE as any).SELECT_SOURCE;
  const candidates = [
      sourceSelector,
      ...((SCHEDULE_INTERVIEW_PAGE as any).SELECT_SOURCE_CANDIDATES || [])
  ].filter(Boolean) as string[];

  // Prefer native select if present; otherwise use generic dropdown selection
  const found = await utils.findElementWithFallback(candidates, 5000);
  if (!found) throw new Error('Source dropdown not found');

  const tagName = await found.evaluate((el: unknown) => (el as HTMLElement).tagName);
  if (tagName && String(tagName).toUpperCase() === 'SELECT') {
    // For native select, get all available options and match by text
    const availableOptions = await found.evaluate((select: HTMLSelectElement) => {
      return Array.from(select.options).map(opt => ({
        text: opt.text.trim(),
        value: opt.value,
        index: opt.index
      }));
    });

    console.log(`📋 Available source options: ${availableOptions.map(o => o.text).join(', ')}`);
    
    // Try to find matching option (case-insensitive, trim whitespace)
    const matchedOption = availableOptions.find(opt => 
      opt.text.toLowerCase().trim() === selectedSource.toLowerCase().trim()
    );

    if (matchedOption) {
      // Use value if available, otherwise use index
      if (matchedOption.value) {
        await found.selectOption({ value: matchedOption.value });
        console.log(`✓ Selected "${selectedSource}" (value: ${matchedOption.value}) via native <select>`);
      } else {
        await found.selectOption({ index: matchedOption.index });
        console.log(`✓ Selected "${selectedSource}" (index: ${matchedOption.index}) via native <select>`);
      }
    } else {
      // Fallback: try label matching (original method)
      try {
        await found.selectOption({ label: selectedSource });
        console.log(`✓ Selected "${selectedSource}" via native <select> (label match)`);
      } catch (error) {
        // If label matching fails, try to match by partial text
        const partialMatch = availableOptions.find(opt => 
          opt.text.toLowerCase().includes(selectedSource.toLowerCase()) ||
          selectedSource.toLowerCase().includes(opt.text.toLowerCase())
        );
        
        if (partialMatch) {
          if (partialMatch.value) {
            await found.selectOption({ value: partialMatch.value });
            console.log(`✓ Selected "${partialMatch.text}" (partial match for "${selectedSource}") via native <select>`);
          } else {
            await found.selectOption({ index: partialMatch.index });
            console.log(`✓ Selected "${partialMatch.text}" (partial match for "${selectedSource}") via native <select>`);
          }
        } else {
          throw new Error(`Could not find option matching "${selectedSource}" in dropdown. Available: ${availableOptions.map(o => o.text).join(', ')}`);
        }
      }
    }
  } else {
    await utils.selectFromDropdown(candidates, selectedSource, 'Source');
    console.log(`✓ Selected "${selectedSource}" via dropdown`);
  }
});

When('Add Feedback Form', async function () {
  const AddfeedbackSelector = (SCHEDULE_INTERVIEW_PAGE as any).ADDFEEDBACK;
  const btn = page.locator(`xpath=${AddfeedbackSelector}`);
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.dblclick();
  console.log('✓ Clicked Add Feedback Form');
});

When('Search candidate by generated name', async function () {
  // Read the generated_name.txt and search it in the UI
  const nameFile = path.resolve(process.cwd(), 'generated_name.txt');
  if (!fs.existsSync(nameFile)) {
    throw new Error('generated_name.txt not found. Run the PDF update step first.');
  }
  const candidateName = fs.readFileSync(nameFile, 'utf8').trim();
  if (!candidateName) {
    throw new Error('generated_name.txt is empty');
  }

  // If there is a Pipeline tab, click it first to expose the search input
  try {
    const pipeSel = (SCHEDULE_INTERVIEW_PAGE as any).CLICKPIPELINE;
    if (pipeSel) {
      const pipelineTab = this.page.locator(`xpath=${pipeSel}`).first();
      if (await pipelineTab.isVisible().catch(() => false)) {
        await pipelineTab.click();
        await utils.waitForTimeout(1000);
      }
    }
  } catch (_) {}

  // Try common search field patterns
  const searchCandidates = [
    "input[placeholder*='Search']",
    "input[type='search']",
    "input[aria-label*='Search']",
    "[role='search'] input",
  ];
  const searchInput = await utils.findElementWithFallback(searchCandidates, 5000);
  if (!searchInput) {
    // If no input, try to highlight row directly
    const row = this.page.locator(`text=${candidateName}`).first();
    await row.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✓ Found candidate row for ${candidateName}`);
    return;
  }

  await searchInput.fill('');
  await searchInput.type(candidateName);
  await utils.waitForTimeout(1500);

  // Verify presence
  const result = this.page.locator(`text=${candidateName}`).first();
  await result.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`✓ Candidate visible in results: ${candidateName}`);
});

When('Click candidate by generated name', async function () {
  const nameFile = path.resolve(process.cwd(), 'generated_name.txt');
  if (!fs.existsSync(nameFile)) {
    throw new Error('generated_name.txt not found. Run the PDF update step first.');
  }
  const candidateName = fs.readFileSync(nameFile, 'utf8').trim();
  if (!candidateName) {
    throw new Error('generated_name.txt is empty');
  }

  // Try clicking the row or chip that contains the candidate name
  const clickCandidates = [
    `text=${candidateName}`,
    `[title*='${candidateName}']`,
    `a:has-text('${candidateName}')`,
    `button:has-text('${candidateName}')`
  ];
  const element = await utils.findElementWithFallback(clickCandidates, 10000);
  if (!element) {
    throw new Error(`Could not find clickable element for candidate: ${candidateName}`);
  }
  await utils.clickElementWithFallback(element, `candidate ${candidateName}`);
  console.log(`✓ Clicked candidate: ${candidateName}`);
});

// Combined step: search and click the candidate in one go
When('Search and open candidate by generated name', async function () {
  const nameFile = path.resolve(process.cwd(), 'generated_name.txt');
  if (!fs.existsSync(nameFile)) {
    throw new Error('generated_name.txt not found. Run the PDF update step first.');
  }
  const candidateName = fs.readFileSync(nameFile, 'utf8').trim();
  if (!candidateName) {
    throw new Error('generated_name.txt is empty');
  }

  // Optional: bring Pipeline tab into view
  try {
    const pipeSel = (SCHEDULE_INTERVIEW_PAGE as any).CLICKPIPELINE;
    if (pipeSel) {
      const pipelineTab = this.page.locator(`xpath=${pipeSel}`).first();
      if (await pipelineTab.isVisible().catch(() => false)) {
        await pipelineTab.click();
        await utils.waitForTimeout(1000);
      }
    }
  } catch (_) {}

  // Search
  const searchCandidates = [
    "input[placeholder*='Search']",
    "input[type='search']",
    "input[aria-label*='Search']",
    "[role='search'] input",
  ];
  const searchInput = await utils.findElementWithFallback(searchCandidates, 5000);
  if (searchInput) {
    await searchInput.fill('');
    await searchInput.type(candidateName);
    await utils.waitForTimeout(1500);
  }

  // Click result
  const clickCandidates = [
    `text=${candidateName}`,
    `[title*='${candidateName}']`,
    `a:has-text('${candidateName}')`,
    `button:has-text('${candidateName}')`
  ];
  const element = await utils.findElementWithFallback(clickCandidates, 10000);
  if (!element) {
    throw new Error(`Could not find clickable element for candidate: ${candidateName}`);
  }
  await utils.clickElementWithFallback(element, `candidate ${candidateName}`);
  console.log(`✓ Opened candidate: ${candidateName}`);
});


When('click Browse File', async function () {
  await utils.uploadFileViaPicker(`xpath=${(SCHEDULE_INTERVIEW_PAGE as any).SELECT_BROWSE_FILE}`);
});

When ('scrollToBottom', async function () {
  await utils.scrollToBottom();
});

When('select and open the file', async function () {
  // Fallback to file chooser when input is not directly accessible
  await utils.uploadFileViaPicker(`xpath=${(SCHEDULE_INTERVIEW_PAGE as any).SELECT_BROWSE_FILE}`, 45000);
});

When('Click Hiring Stages', async function () {
  const mapped = (SCHEDULE_INTERVIEW_PAGE as any).HIRING_STAGE;
  const candidates = [
    mapped ? `xpath=${mapped}` : undefined,
    ...(((SCHEDULE_INTERVIEW_PAGE as any).HIRING_STAGE_CANDIDATES) || [])
  ].filter(Boolean) as string[];

  const link = await utils.findElementWithFallback(candidates, 10000);
  if (!link) throw new Error('Could not find Hiring Stages link');
  await utils.clickElementWithFallback(link, 'Hiring Stages');
  console.log('✓ Clicked Hiring Stages');
});

When('Schedule Interview Button', async function () {
  const SchedulebuttonSelector = (SCHEDULE_INTERVIEW_PAGE.SCHEDULEINTERVIEWBUTTON);
  const btn = page.locator(`xpath=${SchedulebuttonSelector}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Schedule Interview Button');
});

When('Search and select panel member', async function () {
  // Reload env to ensure latest values from config.env
  try { dotenv.config({ path: path.resolve(process.cwd(), 'config.env'), override: true, quiet: true }); } catch {}
  let panelValue = (process.env.PanelMember || process.env.PANEL_MEMBER || '').trim();

  if (!panelValue) {
    try {
      const envPath = path.resolve(process.cwd(), 'config.env');
      const raw = fs.readFileSync(envPath, 'utf8');
      const parsed = dotenv.parse(raw);
      let fromFile = (parsed.PanelMember || parsed.PANEL_MEMBER || '').trim();
      if (!fromFile) {
        const match = raw.match(/^\s*PanelMember\s*=\s*(.+)$/gim);
        if (match && match.length > 0) {
          const first = match[0].split('=')[1];
          fromFile = (first || '').trim();
        }
      }
      if (fromFile) {
        panelValue = fromFile;
        process.env.PanelMember = panelValue; // cache for scenario
        console.log(`✓ Loaded PanelMember from file: ${panelValue}`);
      } else {
        console.log('⚠️ PanelMember not found after parsing config.env. Sample keys:', Object.keys(parsed).slice(0, 10));
      }
    } catch (e) {
      console.log('⚠️ Could not read PanelMember from config.env directly:', e);
    }
  }

  if (!panelValue) {
    const envKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('panel'));
    console.log('ENV preview:', envKeys.reduce((acc: Record<string,string>, k) => { acc[k] = String(process.env[k]); return acc; }, {}));
    throw new Error(`PanelMember not set in config.env. Env keys containing 'panel': ${envKeys.join(', ')}`);
  }

  // Focus the search input
  const input = page.locator(`xpath=${(SCHEDULE_INTERVIEW_PAGE as any).SEARCHPANELMEMBER}`).first();
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill('');
  await input.type(panelValue, { delay: 50 });
  await utils.waitForTimeout(800);

  // Try to open the suggestion list if it's not already visible
  try { await input.click({ force: true }); } catch {}
  try { await page.keyboard.press('ArrowDown'); } catch {}
  await utils.waitForTimeout(400);

  // Attempt multiple selection strategies without assuming a specific container
  const checkboxSelectors = [
    `//input[@type='checkbox' and following-sibling::*[contains(normalize-space(text()), "${panelValue}")]]`,
    `//label[contains(normalize-space(.), "${panelValue}")]//input[@type='checkbox']`,
    `//*[contains(normalize-space(.), "${panelValue}")]/ancestor::*[.//input[@type='checkbox']][1]//input[@type='checkbox']`
  ];

  let checked = false;
  for (const xp of checkboxSelectors) {
    const cb = page.locator(`xpath=${xp}`).first();
    try {
      await cb.waitFor({ state: 'visible', timeout: 5000 });
      const isChecked = await cb.isChecked().catch(() => false);
      if (!isChecked) {
        await cb.check({ force: true });
      }
      console.log(`✓ Selected panel member via checkbox: ${xp}`);
      checked = true;
      break;
    } catch { /* try next */ }
  }

  // Final fallback: click the row containing the text to toggle selection
  if (!checked) {
    const row = page.locator(`xpath=//*[contains(normalize-space(.), "${panelValue}")]`).first();
    try {
      await row.waitFor({ state: 'visible', timeout: 5000 });
      await row.click({ force: true });
      console.log(`✓ Clicked row for panel member: ${panelValue}`);
    } catch (e) {
      throw new Error(`Could not locate/select panel member option for: ${panelValue}`);
    }
  }
});

When('Click anywhere in UI', async function () {
  await utils.clickAnywhereInUI();
});

When('Select and fill Current date', async function () {
  const dateSelector = (SCHEDULE_INTERVIEW_PAGE as any).SELECTDATE;
  const locator = page.locator(dateSelector).first();

  const today = await utils.autoFillCurrentDate(); // returns MM/DD/YYYY string
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await locator.click();
  await page.keyboard.type(today, { delay: 100 });

  // Move focus out to trigger blur/validation
  await page.keyboard.press('Tab');

  console.log(`✓ Entered Current Date: ${today}`);
});


When('Fill From Slot Time', async function () {
  const selector = (SCHEDULE_INTERVIEW_PAGE as any).SELECTFROMTIME;
  const locator = page.locator(`xpath=${selector}`).first();
  const time = await utils.getCurrentTime();

  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await locator.click({ clickCount: 3 }); // focus & select all
  await locator.type(time);               // types each character
  // Blur instead of pressing Tab twice (which may skip next input)
  try {
    const handle = await locator.elementHandle();
    if (handle) { await handle.evaluate((el: Element) => (el as HTMLElement).blur()); }
  } catch {}
  await utils.waitForTimeout(200);

  console.log(`⏰ Filled current rounded time: ${time}`);
});

When('Fill To Slot Time', async function () { 
  const selector = (SCHEDULE_INTERVIEW_PAGE as any).SELECTTOTIME;
  const locator = page.locator(`xpath=${selector}`).first();
  const timeStr = await utils.getCurrentTime(); // e.g., "06:15 PM"

  // Convert to 24h, add 1 hour, then convert back to 12h to avoid wrong AM/PM around 12
  const [time, ampm] = timeStr.split(' ');            // e.g., "12:05 PM"
  const [hStr, mStr] = time.split(':');
  const h12 = Number(hStr);
  const mins = Number(mStr);
  let h24 = (h12 % 12) + (ampm === 'PM' ? 12 : 0);    // 12 PM -> 12, 12 AM -> 0
  h24 = (h24 + 1) % 24;                               // add one hour safely
  const newAmPm = h24 >= 12 ? 'PM' : 'AM';
  const h12Out = h24 % 12 || 12;                      // 0 -> 12
  const formattedHours = String(h12Out).padStart(2, '0');
  const formattedMinutes = String(mins).padStart(2, '0');
  const newTime = `${formattedHours}:${formattedMinutes} ${newAmPm}`;
   
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await locator.click({ clickCount: 3 }); // focus & select all
  await locator.type(newTime, { delay: 100 });  
  
  console.log(`⏰ Filled To Slot Time (current + 1hr): ${newTime}`);
});

When('Select Interview Type Online', async function () {
  const selectinterviewtype = (SCHEDULE_INTERVIEW_PAGE.INTERVIEWTYPE);
  const btn = page.locator(`xpath=${selectinterviewtype}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Interview Type Online');
});

When('Select Interview Type Offline', async function () {
  const selectinterviewtype = (SCHEDULE_INTERVIEW_PAGE.INTERVIEWTYPEOFFLINE);
  const btn = page.locator(`xpath=${selectinterviewtype}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Interview Type Offline');
});

When('Select Create Event Button', async function () {
  const selectcreateeventbutton = (SCHEDULE_INTERVIEW_PAGE.CREATEEVENTBUTTON);
  const btn = page.locator(`xpath=${selectcreateeventbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Create Event Button');
});



When('Click confirm', async function () {
  const clickconfirm = (SCHEDULE_INTERVIEW_PAGE.CLICKCONFIRMBUTTON);
  const btn = page.locator(`xpath=${clickconfirm}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Confirm');
});

When('Click cancel', async function () {
  const clickcancel = (SCHEDULE_INTERVIEW_PAGE.CANCELBUTTON);
  const btn = page.locator(`xpath=${clickcancel}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Cancel');
});

When('Click update event', async function () {
  const clickupdateevent = (SCHEDULE_INTERVIEW_PAGE.UPDATEEVENTBUTTON);
  const btn = page.locator(`xpath=${clickupdateevent}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Update Event');
});

When ('Click cancel event', async function () {
  const clickcancelevent = (SCHEDULE_INTERVIEW_PAGE.CANCELEVENTBUTTON);
  const btn = page.locator(`xpath=${clickcancelevent}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Cancel Event');
});

When('Click disqualify', async function () {
  const clickdisqualify = (SCHEDULE_INTERVIEW_PAGE.DISQUALIFYBUTTON);
  const btn = page.locator(`xpath=${clickdisqualify}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Disqualify');
});

When('Select reason to disqualify', async function () {
  const selectreasontodisqualify = (SCHEDULE_INTERVIEW_PAGE.SELECTREASONTODISQUALIFY);
  const btn = page.locator(`xpath=${selectreasontodisqualify}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Reason to Disqualify');
});

When('Select disqualify reason from config', async function () {
  // First click the dropdown to open it (combining both steps)
  const selectreasontodisqualify = (SCHEDULE_INTERVIEW_PAGE.SELECTREASONTODISQUALIFY);
  const dropdown = page.locator(`xpath=${selectreasontodisqualify}`);
  await dropdown.waitFor({ state: 'visible', timeout: 20000 });
  await dropdown.click();
  console.log('✓ Clicked Reason to Disqualify dropdown');

  // Get the disqualify reason from config.env
  let disqualifyReason = process.env.disqualifyreason || process.env.DISQUALIFY_REASON || '';
  
  if (!disqualifyReason) {
    try {
      const envPath = path.resolve(process.cwd(), 'config.env');
      const raw = fs.readFileSync(envPath, 'utf8');
      const parsed = dotenv.parse(raw);
      disqualifyReason = (parsed.disqualifyreason || parsed.DISQUALIFY_REASON || '').trim();
      
      if (!disqualifyReason) {
        const match = raw.match(/^\s*disqualifyreason\s*=\s*(.+)$/gim);
        if (match && match.length > 0) {
          const first = match[0].split('=')[1];
          disqualifyReason = (first || '').trim();
        }
      }
      
      if (disqualifyReason) {
        process.env.disqualifyreason = disqualifyReason;
        console.log(`✓ Loaded disqualify reason from config.env: ${disqualifyReason}`);
      }
    } catch (e) {
      console.log('⚠️ Could not read disqualify reason from config.env:', e);
    }
  }

  if (!disqualifyReason) {
    throw new Error('disqualifyreason not set in config.env');
  }

  // Wait a moment for the dropdown options to appear
  await utils.waitForTimeout(1000);

  // Try to select the reason from the dropdown
  try {
    // First try to select by text content
    const reasonOption = page.locator(`text=${disqualifyReason}`).first();
    await reasonOption.waitFor({ state: 'visible', timeout: 5000 });
    await reasonOption.click();
    console.log(`✓ Selected disqualify reason: ${disqualifyReason}`);
  } catch (e) {
    // Fallback: try to select by partial text match
    try {
      const reasonOption = page.locator(`text*=${disqualifyReason}`).first();
      await reasonOption.waitFor({ state: 'visible', timeout: 5000 });
      await reasonOption.click();
      console.log(`✓ Selected disqualify reason (partial match): ${disqualifyReason}`);
    } catch (e2) {
      // Final fallback: try to find and click any option containing the text
      const reasonOption = page.locator(`[role="option"]:has-text("${disqualifyReason}")`).first();
      await reasonOption.waitFor({ state: 'visible', timeout: 5000 });
      await reasonOption.click();
      console.log(`✓ Selected disqualify reason (role option): ${disqualifyReason}`);
    }
  }
});

When('I stop the script here for schedule', async function () {
  console.log('⏸️ Pausing before schedule…');
  await utils.waitForTimeout(10000); // waits 10s
});

When('Select Change Template Button', async function () {
  const selectcreateeventbutton = (SCHEDULE_INTERVIEW_PAGE.CHANGETEMPLATEBUTTON);
  const btn = page.locator(`xpath=${selectcreateeventbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Change Template Button');
});

When('Select Different Template Button', async function () {
  const selectcreateeventbutton = (SCHEDULE_INTERVIEW_PAGE.SELECTDIFERRENTTEMPLATE);
  const btn = page.locator(`xpath=${selectcreateeventbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Different Template Button');
});


When('Select Template Button', async function () {
  const selectcreateeventbutton = (SCHEDULE_INTERVIEW_PAGE.SELEECTTEMPLATEBUTTON);
  const btn = page.locator(`xpath=${selectcreateeventbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Template Button');
});


When('select template type', async function () {
  // Find the Template Type dropdown - try multiple selectors
  const dropdownSelectors = [
    "//*[contains(text(), 'Template Type')]/following-sibling::*//*[contains(text(), 'All Types')]",
    "//*[contains(text(), 'Template Type')]/..//*[contains(text(), 'All Types')]",
    "//*[text()='All Types']",
    "//*[contains(@placeholder, 'Template Type')]",
    "//*[contains(@aria-label, 'Template Type')]",
    (SCHEDULE_INTERVIEW_PAGE as any).SELECTTEMPLATETYPE
  ].filter(Boolean) as string[];
  
  let dropdown = null;
  for (const selector of dropdownSelectors) {
    try {
      const locator = selector.startsWith('//') 
        ? page.locator(`xpath=${selector}`).first()
        : page.locator(selector).first();
      await locator.waitFor({ state: 'visible', timeout: 3000 });
      dropdown = locator;
      console.log(`✓ Found Template Type dropdown with selector: ${selector}`);
      break;
    } catch (e) {
      continue;
    }
  }
  
  if (!dropdown) {
    throw new Error('Template Type dropdown not found');
  }
  
  // Click the dropdown to open it
  await dropdown.click();
  console.log('✓ Clicked Template Type dropdown');
  
  // Wait for dropdown options to appear
  await utils.waitForTimeout(1000);
  
  // Select "outreach" from the dropdown options
  const optionValue = 'outreach';
  let selected = false;
  
  // Strategy 1: Try exact text match
  try {
    const option = page.locator(`text=${optionValue}`).first();
    await option.waitFor({ state: 'visible', timeout: 3000 });
    await option.click();
    console.log(`✓ Selected template type: ${optionValue}`);
    selected = true;
  } catch (e) {
    // Continue to next strategy
  }
  
  // Strategy 2: Try role="option" with text
  if (!selected) {
    try {
      const option = page.locator(`[role="option"]:has-text("${optionValue}")`).first();
      await option.waitFor({ state: 'visible', timeout: 3000 });
      await option.click();
      console.log(`✓ Selected template type (role option): ${optionValue}`);
      selected = true;
    } catch (e) {
      // Continue to next strategy
    }
  }
  
  // Strategy 3: Try getByText with case-insensitive
  if (!selected) {
    try {
      const option = page.getByText(optionValue, { exact: false }).first();
      await option.waitFor({ state: 'visible', timeout: 3000 });
      await option.click();
      console.log(`✓ Selected template type (case-insensitive): ${optionValue}`);
      selected = true;
    } catch (e) {
      // Continue to next strategy
    }
  }
  
  // Strategy 4: Try XPath with contains
  if (!selected) {
    try {
      const option = page.locator(`xpath=//*[contains(text(), '${optionValue}')]`).first();
      await option.waitFor({ state: 'visible', timeout: 3000 });
      await option.click();
      console.log(`✓ Selected template type (XPath contains): ${optionValue}`);
      selected = true;
    } catch (e) {
      // Continue to next strategy
    }
  }
  
  // Strategy 5: Try li or div elements
  if (!selected) {
    try {
      const option = page.locator(`li:has-text("${optionValue}"), div:has-text("${optionValue}")`).first();
      await option.waitFor({ state: 'visible', timeout: 3000 });
      await option.click();
      console.log(`✓ Selected template type (li/div): ${optionValue}`);
      selected = true;
    } catch (e) {
      // Final fallback
    }
  }
  
  if (!selected) {
    throw new Error(`Could not select template type "${optionValue}" from dropdown`);
  }
  
  // Wait a bit for selection to register
  await utils.waitForTimeout(500);
});

When('Select Disqualify Candidate Button', async function () {
  const selectcreateeventbutton = (SCHEDULE_INTERVIEW_PAGE.SELECTDISQUALIFYBUTTON);
  const btn = page.locator(`xpath=${selectcreateeventbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Disqualify Candidate Button');
});

When('Click confirm disqualify', async function () {
  const clickconfirm = (SCHEDULE_INTERVIEW_PAGE.DISQUALIFYCONFIRMBUTTON);
  const btn = page.locator(`xpath=${clickconfirm}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Confirm Disqualify');
});

When('I stop the script here for schedule Infinite', async function () {
  console.log('⏸ Script stopped here for debugging. No further steps will run.');
  // Infinite promise -> blocks execution forever
  await new Promise(() => {});
});

When('searchRoleToLogout', async function () {
  await logout.searchRoleToLogout();
  console.log('✓ Searched and clicked role to logout');
});

When('clickLogout', async function () {
  await logout.clickLogout();
  console.log('✓ Clicked logout button');
});
