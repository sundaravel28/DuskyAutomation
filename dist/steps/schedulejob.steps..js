"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
const jobdetailsPage_1 = __importDefault(require("../pages/jobdetailsPage"));
const jobdescription_1 = __importDefault(require("../pages/jobdescription"));
const jobscorescriteria_1 = __importDefault(require("../pages/jobscorescriteria"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const pdfeditor_1 = require("../pages/pdfeditor");
const Selectors_1 = require("../pages/Selectors");
const CommonUtils_1 = require("../pages/CommonUtils");
dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'validation.env') });
(0, cucumber_1.setDefaultTimeout)(120 * 1000);
let context;
let page;
let talentPage;
let jobDescPage;
let jobScorePage;
let utils;
(0, cucumber_1.Before)({ tags: '@schedule' }, async function () {
    // Resolve Chrome user data and profile directories. Defaults target the Sundaravel profile.
    const chromeBaseDir = process.env.CHROME_USER_DATA_DIR || 'C\\\\Users\\\\Windows\\\\AppData\\\\Local\\\\Google\\\\Chrome\\\\User Data';
    const chromeProfileDir = process.env.CHROME_PROFILE_DIR || 'Default'; // adjust if Sundaravel maps to a different folder
    const profilePath = path.join(chromeBaseDir, chromeProfileDir);
    context = await test_1.chromium.launchPersistentContext(profilePath, {
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
    talentPage = new jobdetailsPage_1.default(page, context);
    jobDescPage = new jobdescription_1.default(page, context);
    jobScorePage = new jobscorescriteria_1.default(page, context);
    utils = new CommonUtils_1.CommonUtils(page, context);
});
(0, cucumber_1.After)({ tags: '@schedule' }, async function () {
    if (context) {
        await context.close();
    }
});
(0, cucumber_1.Given)('I launch Chrome with schedule profile {string}', async function (profileName) {
    // Profile is already applied in Before hook; do nothing to avoid closing context mid-scenario
});
(0, cucumber_1.When)('I navigate to the Talent QA site for schedule', async function () {
    await talentPage.navigateToTalentQA();
    await talentPage.maximize();
    await page.waitForLoadState('domcontentloaded');
    await talentPage.waitForTimeout(3000);
});
(0, cucumber_1.Given)('Update PDF', async function () {
    await (0, pdfeditor_1.editPdf)();
});
// Validate job title heading on Schedule Interview page using centralized selector
(0, cucumber_1.When)('Schedule Interview', async function () {
    const heading = page.locator(`xpath=${Selectors_1.SCHEDULE_INTERVIEW_PAGE.SELECT_ROLE_FOR_INTERVIEW}`).first();
    await heading.waitFor({ state: 'visible', timeout: 10000 });
    await heading.click();
    console.log('✓ Clicked job title heading via selector: SELECT_ROLE_FOR_INTERVIEW');
});
(0, cucumber_1.When)('Add Candidate', async function () {
    const addCandidateSelector = Selectors_1.SCHEDULE_INTERVIEW_PAGE.ADD_CANDIDATE_BUTTON || "//button[@id='candidateAddMenu']";
    const btn = page.locator(`xpath=${addCandidateSelector}`).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
    console.log('✓ Clicked Add Candidate');
});
(0, cucumber_1.When)('click resume upload link', async function () {
    const heading = page.locator(`xpath=${Selectors_1.SCHEDULE_INTERVIEW_PAGE.SELECT_RESUME_UPLOAD_LINK}`).first();
    await heading.waitFor({ state: 'visible', timeout: 10000 });
    await heading.click();
    console.log('✓ Clicked job title heading via selector: SELECT_RESUME_UPLOAD_LINK');
});
(0, cucumber_1.When)('select source', async function () {
    const sourceSelector = Selectors_1.SCHEDULE_INTERVIEW_PAGE.SELECT_SOURCE;
    const candidates = [sourceSelector, ...(Selectors_1.SCHEDULE_INTERVIEW_PAGE.SELECT_SOURCE_CANDIDATES || [])].filter(Boolean);
    // Use CommonUtils generic dropdown selector to choose "Others"
    await utils.selectFromDropdown(candidates, 'Others', 'Source');
});
(0, cucumber_1.When)('I stop the script here for schedule', async function () {
    console.log('⏸ Script stopped here for debugging. No further steps will run.');
    // Infinite promise -> blocks execution forever
    await new Promise(() => { });
});
//# sourceMappingURL=schedulejob.steps..js.map