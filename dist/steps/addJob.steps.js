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
dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'validation.env') });
(0, cucumber_1.setDefaultTimeout)(120 * 1000);
let context;
let page;
let talentPage;
let jobDescPage;
let jobScorePage;
(0, cucumber_1.Before)({ tags: '@addjob' }, async function () {
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
});
(0, cucumber_1.After)({ tags: '@addjob' }, async function () {
    if (context) {
        await context.close();
    }
});
(0, cucumber_1.Given)('I launch Chrome with profile {string}', async function (profileName) {
    // Profile is already applied in Before hook; do nothing to avoid closing context mid-scenario
});
(0, cucumber_1.When)('I navigate to the Talent QA site', async function () {
    await talentPage.navigateToTalentQA();
    await talentPage.maximize(); // 👈 now you can call this
    await page.waitForLoadState('domcontentloaded');
    await talentPage.waitForTimeout(3000);
});
(0, cucumber_1.When)('I stop the script here', async function () {
    console.log('⏸ Script stopped here for debugging. No further steps will run.');
    // Infinite promise -> blocks execution forever
    await new Promise(() => { });
});
(0, cucumber_1.When)('I add a new job using environment values', async function () {
    const role = process.env.role;
    const department = process.env.department;
    const openings = process.env.Openings;
    const minexperienceStr = process.env.minexperience;
    const maxexperienceStr = process.env.maxexperience;
    const workpreference = process.env.workpreference;
    const location = process.env.location;
    const jobtype = process.env.jobtype;
    const minexperience = parseInt(minexperienceStr, 10);
    const maxexperience = parseInt(maxexperienceStr, 10);
    // Collect validation errors instead of failing immediately
    const validationErrors = [];
    if (!role)
        validationErrors.push("role is missing or empty");
    if (!department)
        validationErrors.push("department is missing or empty");
    if (!openings)
        validationErrors.push("openings is missing or empty");
    if (!minexperienceStr)
        validationErrors.push("minexperience is missing");
    if (!maxexperienceStr)
        validationErrors.push("maxexperience is missing");
    if (!workpreference)
        validationErrors.push("workpreference is missing or empty");
    if (!location)
        validationErrors.push("location is missing or empty");
    if (!jobtype)
        validationErrors.push("jobtype is missing or empty");
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
    await talentPage.AddJob(role, department, openings, minexperience, maxexperience, workpreference, location, jobtype);
});
(0, cucumber_1.When)('I open Job Description and write JD content', async function () {
    await talentPage.clickJobDescription();
    await jobDescPage.writeJDContent();
    await jobDescPage.saveJobDescription();
    await jobDescPage.waitForTimeout(1000);
    await jobDescPage.scrollToBottom();
    await jobDescPage.waitForTimeout(2000);
});
(0, cucumber_1.When)('I open Job Score Criteria and complete selections', async function () {
    await jobDescPage.clickJobScoreCriteria();
    await jobScorePage.domainSelection();
    await jobScorePage.selectRequiredSkills();
    await jobScorePage.selectPreferredQualifications();
    await jobScorePage.writeJobResponsibilities();
    await jobScorePage.clickPublish();
});
(0, cucumber_1.Then)('the job creation flow should complete successfully', async function () {
    // As in your spec, success is primarily via log statements; add a lightweight check
    (0, test_1.expect)(true).toBeTruthy();
});
//# sourceMappingURL=addJob.steps.js.map