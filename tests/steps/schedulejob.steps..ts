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

When('Click Add Hiring Stage Button', async function () {
  const AddhiringstageSelector = (SCHEDULE_INTERVIEW_PAGE as any).ADDHIRINGSTAGEBUTTON;
  const btn = page.locator(`xpath=${AddhiringstageSelector}`);
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  console.log('✓ Clicked Add Hiring Stage Button');
  await page.getByPlaceholder('Enter the stage name').fill('Level 1');
  await page.getByPlaceholder('Enter the stage name').press('Tab');
  console.log('✓ Added Hiring Stage');
});

When('Click Screening Button in Add Hiring Stage', async function () {
  const ScreeningbuttonSelector = (SCHEDULE_INTERVIEW_PAGE as any).ADDHIRINGSTAGETYPEBUTTON;
  const btn = page.locator(`xpath=${ScreeningbuttonSelector}`);
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  console.log('✓ Clicked Screening Button');
});

When('Click HR Screening Button in Add Hiring Stage Name', async function () {
  const HRScreeningbuttonSelector = (SCHEDULE_INTERVIEW_PAGE as any).ADDHIRINGSTAGENAMEBUTTON;
  const btn = page.locator(`xpath=${HRScreeningbuttonSelector}`);
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  console.log('✓ Clicked HR Screening Button');
});

When('Click Create Stage Button', async function () {
  const CreateStagebuttonSelector = (SCHEDULE_INTERVIEW_PAGE as any).CREATESTAGEBUTTON;
  const btn = page.locator(`xpath=${CreateStagebuttonSelector}`);
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  console.log('✓ Clicked Create Stage Button');
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
      const pipelineTab = page.locator(`xpath=${pipeSel}`).first();
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
    const row = page.locator(`text=${candidateName}`).first();
    await row.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✓ Found candidate row for ${candidateName}`);
    return;
  }

  await searchInput.fill('');
  await searchInput.type(candidateName);
  await utils.waitForTimeout(1500);

  // Verify presence
  const result = page.locator(`text=${candidateName}`).first();
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

When('Click Next Page Button in Interview Details', async function () {
  const clicknextpagebutton = (SCHEDULE_INTERVIEW_PAGE.INTERVIEWDETAILSNEXTPAGEBUTTON);
  const btn = page.locator(`xpath=${clicknextpagebutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Next Page Button in Interview Details');
});


When('Click Next Page Button in Description Page', async function () {
  const clicknextpagebutton = (SCHEDULE_INTERVIEW_PAGE.INTERVIEWDETAILSNEXTPAGEBUTTON);
  const btn = page.locator(`xpath=${clicknextpagebutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Next Page Button in Description Page');
});

When('Click No Show button', async function () {
  const clicknoshowbutton = (SCHEDULE_INTERVIEW_PAGE.Clicknoshowbutton);
  const btn = page.locator(`xpath=${clicknoshowbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked No Show button');
});

When('Click Jobs', async function () {
  const clickjobsidemenubutton = (SCHEDULE_INTERVIEW_PAGE.JOBSIDEMENUBUTTON);
  const btn = page.locator(`xpath=${clickjobsidemenubutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Jobs Side Menu Button');
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

When('Click Interviews Side Menu Button', async function () {
  const clickinterviewsidemenubutton = (SCHEDULE_INTERVIEW_PAGE.CLICKINTERVIEWSIDEMENUBUTTON);
  const btn = page.locator(`xpath=${clickinterviewsidemenubutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Interviews Side Menu Button');
});

When('Click Back Button', async function () {
  const clickbackbutton = (SCHEDULE_INTERVIEW_PAGE.CLICKBACKBUTTON);
  const btn = page.locator(`xpath=${clickbackbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Back Button');
});

When('Select Disqualify Candidate Button', async function () {
  const selectdisqualifycandidatebutton = (SCHEDULE_INTERVIEW_PAGE.SELECTDISQUALIFYBUTTON);
  const btn = page.locator(`xpath=${selectdisqualifycandidatebutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Disqualify Candidate Button');
});

When('Search candidate in interviews by generated name', async function () {
  // Read candidate name from generated_name.txt
  const nameFile = path.resolve(process.cwd(), 'generated_name.txt');
  if (!fs.existsSync(nameFile)) {
    throw new Error('generated_name.txt not found. Run the PDF update step first.');
  }
  const candidateName = fs.readFileSync(nameFile, 'utf8').trim();
  if (!candidateName) {
    throw new Error('generated_name.txt is empty');
  }

  // Extract only the first name (split by space and take first part, trim spaces)
  const firstName = candidateName.split(' ')[0].trim();
  if (!firstName) {
    throw new Error('Could not extract first name from candidate name');
  }

  const searchcandidateininterviews = (SCHEDULE_INTERVIEW_PAGE.SEARCHCANDIDATEININTERVIEWS);
  const input = page.locator(`xpath=${searchcandidateininterviews}`);
  await input.waitFor({ state: 'visible', timeout: 20000 });
  await input.fill('');
  await input.type(firstName);
  await utils.waitForTimeout(1000);
  console.log(`✓ Searched candidate in interviews (first name only): ${firstName}`);
});

When('Verify generated name in interviews', async function () {
  // Read candidate name from generated_name.txt
  const nameFile = path.resolve(process.cwd(), 'generated_name.txt');
  if (!fs.existsSync(nameFile)) {
    throw new Error('generated_name.txt not found. Run the PDF update step first.');
  }
  const candidateName = fs.readFileSync(nameFile, 'utf8').trim();
  if (!candidateName) {
    throw new Error('generated_name.txt is empty');
  }

  // Wait for search results to load
  await utils.waitForTimeout(1000);

  // Find and verify candidate name in interviews
  const nameElement = page.locator(`text=${candidateName}`).first();
  await nameElement.waitFor({ state: 'visible', timeout: 10000 });
  console.log(`✅ Verified candidate name in interviews: ${candidateName}`);
});

When('Verify candidate name in Disqualified section', async function () {
  // Read candidate name from generated_name.txt
  const nameFile = path.resolve(process.cwd(), 'generated_name.txt');
  if (!fs.existsSync(nameFile)) {
    throw new Error('generated_name.txt not found. Run the PDF update step first.');
  }
  const candidateName = fs.readFileSync(nameFile, 'utf8').trim();
  if (!candidateName) {
    throw new Error('generated_name.txt is empty');
  }

  // Wait for page to load
  await utils.waitForTimeout(1000);

  // Find the Disqualified section
  const disqualifiedSection = page.locator(`text=Disqualified`).first();
  await disqualifiedSection.waitFor({ state: 'visible', timeout: 10000 });

  // Find the candidate name within or below the Disqualified section
  // Strategy 1: Find name element and verify it's in the Disqualified section
  const nameElement = page.locator(`text=${candidateName}`).first();
  await nameElement.waitFor({ state: 'visible', timeout: 10000 });

  // Verify the name is in the Disqualified section by checking if it's in the same container
  const disqualifiedContainer = disqualifiedSection.locator('xpath=ancestor::*[contains(@class, "column") or contains(@class, "section") or contains(@class, "board")][1]');
  const nameInSection = disqualifiedContainer.locator(`text=${candidateName}`).first();
  
  try {
    await nameInSection.waitFor({ state: 'visible', timeout: 5000 });
    console.log(`✅ Verified candidate name "${candidateName}" is in Disqualified section`);
  } catch (e) {
    // Fallback: Check if name appears after Disqualified text in the DOM
    const bodyText = await page.locator('body').textContent() || '';
    const disqualifiedIndex = bodyText.indexOf('Disqualified');
    const nameIndex = bodyText.indexOf(candidateName);
    
    if (disqualifiedIndex !== -1 && nameIndex !== -1 && nameIndex > disqualifiedIndex) {
      console.log(`✅ Verified candidate name "${candidateName}" appears below Disqualified section`);
    } else {
      throw new Error(`Candidate name "${candidateName}" not found in Disqualified section`);
    }
  }
});

When('Verify and print disqualification reason', async function () {
  // Wait for page to load
  await utils.waitForTimeout(1000);

  // Find the "Disqualification Reason" heading
  const reasonHeading = page.locator(`text=Disqualification Reason`).first();
  await reasonHeading.waitFor({ state: 'visible', timeout: 10000 });

  // Get the disqualification reason text - try multiple strategies
  let disqualificationReason = '';

  // Strategy 1: Find the paragraph/text element after the heading
  try {
    const reasonContainer = reasonHeading.locator('xpath=ancestor::*[contains(@class, "bg-red-50") or contains(@class, "border-red")][1]');
    const reasonText = reasonContainer.locator('xpath=.//p | .//div[not(contains(text(), "Disqualification Reason"))]').first();
    await reasonText.waitFor({ state: 'visible', timeout: 3000 });
    disqualificationReason = await reasonText.textContent() || '';
    if (disqualificationReason.trim() && !disqualificationReason.includes('Disqualification Reason')) {
      console.log(`✅ Found disqualification reason: ${disqualificationReason.trim()}`);
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 2: Get text from the parent container and extract reason
  if (!disqualificationReason.trim()) {
    try {
      const parentContainer = reasonHeading.locator('xpath=ancestor::*[contains(@class, "bg-red-50") or contains(@class, "border-red") or contains(@class, "rounded")][1]');
      const containerText = await parentContainer.textContent() || '';
      // Extract text after "Disqualification Reason"
      const reasonMatch = containerText.match(/Disqualification Reason\s*([^\n]+)/i);
      if (reasonMatch && reasonMatch[1]) {
        disqualificationReason = reasonMatch[1].trim();
        console.log(`✅ Found disqualification reason : ${disqualificationReason}`);
      }
    } catch (e) {
      // Continue to next strategy
    }
  }

  // Strategy 3: Find the next sibling element after the heading
  if (!disqualificationReason.trim()) {
    try {
      const nextElement = reasonHeading.locator('xpath=following-sibling::*[1] | ../following-sibling::*[1]').first();
      const nextText = await nextElement.textContent() || '';
      if (nextText.trim() && !nextText.includes('Disqualification Reason')) {
        disqualificationReason = nextText.trim();
        console.log(`✅ Found disqualification reason: ${disqualificationReason}`);
      }
    } catch (e) {
      // Continue to next strategy
    }
  }

  // Strategy 4: Look for text in red-styled elements near the heading
  if (!disqualificationReason.trim()) {
    try {
      const redTextElements = page.locator('xpath=//*[contains(@class, "text-red-700") or contains(@class, "text-red-800")]');
      const count = await redTextElements.count();
      for (let i = 0; i < count; i++) {
        const element = redTextElements.nth(i);
        const text = await element.textContent() || '';
        if (text.trim() && !text.includes('Disqualification Reason') && text.length < 100) {
          disqualificationReason = text.trim();
          console.log(`✅ Found disqualification reason: ${disqualificationReason}`);
          break;
        }
      }
    } catch (e) {
      // Final fallback
    }
  }

  // Print the disqualification reason
  if (disqualificationReason.trim()) {
    console.log(`📋 Disqualification Reason: ${disqualificationReason.trim()}`);
  } else {
    console.warn(`⚠️ Could not find disqualification reason on the page`);
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

When('Select Feedback Reason Button', async function () {
  const selectfeedbackreasonbutton = (SCHEDULE_INTERVIEW_PAGE.FEEDBACKREASONBUTTON);
  const btn = page.locator(`xpath=${selectfeedbackreasonbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Feedback Reason Button');
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

When('Select Disqualify in Kanban Board', async function () {
  const selectcreateeventbutton = (SCHEDULE_INTERVIEW_PAGE.DISQUALIFYCANDIDATEBUTTONINKANBANBOARD);
  const btn = page.locator(`xpath=${selectcreateeventbutton}`);
  await btn.waitFor({ state: 'visible', timeout: 20000 });
  await btn.click();
  console.log('✓ Clicked Disqualify in Kanban Board');
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

When('Delete PDF files from workspace folder', async function () {
  // Use the same path resolution logic as pdfeditor.ts to find workspace directory
  const targetDirName = 'Dusky Job and Schedule Flow';
  const cwd = process.cwd();
  let workspaceDir: string;
  
  // Check if current directory is already the target workspace directory
  if (path.basename(cwd) === targetDirName) {
    workspaceDir = cwd;
  } 
  // Check if current directory contains the target directory as a direct child
  else if (fs.existsSync(path.join(cwd, targetDirName))) {
    workspaceDir = path.join(cwd, targetDirName);
  }
  // Check if we're inside the target directory (nested)
  else if (cwd.includes(targetDirName)) {
    // Find the correct workspace directory by going up to the target directory
    const parts = cwd.split(path.sep);
    const targetIndex = parts.findIndex(p => p === targetDirName);
    if (targetIndex !== -1) {
      // Use the directory up to and including the target directory
      workspaceDir = parts.slice(0, targetIndex + 1).join(path.sep);
    } else {
      // Fallback: find project root and resolve from there
      let projectRoot = cwd;
      let currentDir = cwd;
      for (let i = 0; i < 10; i++) {
        const configPath = path.join(currentDir, 'config.env');
        if (fs.existsSync(configPath)) {
          projectRoot = currentDir;
          break;
        }
        const parent = path.dirname(currentDir);
        if (parent === currentDir) break;
        currentDir = parent;
      }
      workspaceDir = path.resolve(projectRoot, 'workspace', targetDirName);
    }
  }
  // Not in workspace, find project root and resolve from there
  else {
    let projectRoot = cwd;
    let currentDir = cwd;
    for (let i = 0; i < 10; i++) {
      const configPath = path.join(currentDir, 'config.env');
      if (fs.existsSync(configPath)) {
        projectRoot = currentDir;
        break;
      }
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }
    workspaceDir = path.resolve(projectRoot, 'workspace', targetDirName);
  }

  // Define both paths: primary and nested
  const primaryWorkspaceDir = workspaceDir;
  const nestedWorkspaceDir = path.resolve(workspaceDir, 'workspace', targetDirName);
  
  let totalDeletedCount = 0;

  // Helper function to delete PDFs from a directory
  const deletePdfsFromDirectory = (dirPath: string, locationName: string): number => {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️ ${locationName} directory does not exist: ${dirPath}`);
      return 0;
    }

    try {
      // Read all files in the directory
      const files = fs.readdirSync(dirPath);
      
      // Filter only PDF files
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
      
      if (pdfFiles.length === 0) {
        console.log(`📁 No PDF files found in ${locationName}: ${dirPath}`);
        return 0;
      }

      // Delete each PDF file
      let deletedCount = 0;
      for (const pdfFile of pdfFiles) {
        const filePath = path.resolve(dirPath, pdfFile);
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted from ${locationName}: ${pdfFile}`);
          deletedCount++;
        } catch (error) {
          console.warn(`⚠️ Failed to delete ${pdfFile} from ${locationName}:`, (error as Error).message);
        }
      }

      console.log(`✅ Successfully deleted ${deletedCount} out of ${pdfFiles.length} PDF file(s) from ${locationName}`);
      return deletedCount;
    } catch (error) {
      console.warn(`⚠️ Error processing ${locationName}:`, (error as Error).message);
      return 0;
    }
  };

  // Delete PDFs from primary workspace directory
  console.log(`\n📂 Deleting PDFs from primary location: ${primaryWorkspaceDir}`);
  const primaryDeleted = deletePdfsFromDirectory(primaryWorkspaceDir, 'primary location');
  totalDeletedCount += primaryDeleted;

  // Delete PDFs from nested workspace directory
  console.log(`\n📂 Deleting PDFs from nested location: ${nestedWorkspaceDir}`);
  const nestedDeleted = deletePdfsFromDirectory(nestedWorkspaceDir, 'nested location');
  totalDeletedCount += nestedDeleted;

  console.log(`\n✅ Total: Successfully deleted ${totalDeletedCount} PDF file(s) from both locations`);
});
