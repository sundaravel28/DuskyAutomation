/**
 * Centralized selectors, paths, links, and text constants for all pages
 * Organized by page sections for easy maintenance and updates
 */

// ============================================================================
// COMMON SELECTORS
// ============================================================================

export const COMMON_SELECTORS = {
  // Generic dropdown selectors
  DROPDOWN_CONTROL: '.custom-react-select__control',
  DROPDOWN_MENU: '.custom-react-select__menu-list',
  DROPDOWN_OPTION: '.custom-react-select__option',
  DROPDOWN_INDICATOR: '.custom-react-select__indicator.custom-react-select__dropdown-indicator',
  DROPDOWN_INPUT: '.custom-react-select__input input',
  // React-select value container (strict, hashed class may change)
  VALUE_CONTAINER_STRICT: '.custom-react-select__value-container.css-mo8lq1',
  
  // Generic button selectors
  BUTTON_SHADOW_SM: 'button.shadow-sm',
  BUTTON_FLEX_ROW: 'button.shadow-sm.flex.flex-row.items-center.justify-center',
  BUTTON_BORDER_GRAY: 'button[class*="border-gray-300"]',
  BUTTON_BG_WHITE: 'button[class*="bg-white"]',
  
  // Generic input selectors
  INPUT_CHECKBOX: 'input[type="checkbox"]',
  INPUT_TEXT: 'input[type="text"]',
  INPUT_SUBMIT: 'input[type="submit"]',
  INPUT_BUTTON: 'input[type="button"]',
  
  // Generic text area selectors
  TEXTAREA: 'textarea',
  CONTENTEDITABLE: '[contenteditable="true"]',
  
  // Generic error selectors
  ERROR_ELEMENTS: '[class*="error"], [class*="Error"], .alert-danger, .error-message',
  
  // Generic text selectors
  TEXT_HARD_SKILLS: 'text=Hard Skills',
  TEXT_SOFT_SKILLS: 'text=Soft Skills',
} as const;

// ============================================================================
// URLS AND PATHS
// ============================================================================

export const URLS = {
  // Main application URLs
  TALENT_QA_BASE: 'https://talent-qa.ideas2it.com/',
  LOCALHOST_BASE: 'http://localhost:3000',
  
  // Job creation URLs
  JOB_CREATE_NULL_JD: '/jobs/create-new/null/job-description',
  JOB_CREATE_PATTERN: /\/jobs\/create-new\/([^\/]+)\//,
  
  // File paths
  JD_ENV_FILE: 'jd.env',
  JR_ENV_FILE: 'jr.env',
  CONFIG_ENV_FILE: 'config.env',
} as const;

// ============================================================================
// PDF EDITOR CONSTANTS (positions, sizes)
// ============================================================================

export const PDF_EDITOR = {
  // Rectangle to cover old header text
  COVER_RECTANGLE: {
    x: 50,
    y: 700,
    width: 400,
    height: 60,
  },

  // Text drawing positions
  TEXT_POSITIONS: {
    NAME: { x: 55, y: 740 },
    EMAIL: { x: 55, y: 725 },
    PHONE: { x: 55, y: 710 },
  },

  DEFAULT_FONT_SIZE: 12,
} as const;

// ============================================================================
// JOB DETAILS PAGE
// ============================================================================

export const JOB_DETAILS_PAGE = {
  // Main buttons
  ADD_JOB_BUTTON: 'button.px-3.bg-primary.h-8.rounded-lg',
  
  // Input fields
  JOB_TITLE_INPUT: 'input[placeholder="Senior Product Manager"]',
  NUMBER_OF_OPENINGS: '#numberOfOpenings',
  LOCATION_INPUT: '#jobLocation',
  
  // Dropdown selectors (by index - corrected based on debug output)
  DEPARTMENT_DROPDOWN: '.custom-react-select__control:nth-child(1)',
  MIN_EXPERIENCE_DROPDOWN: '.custom-react-select__control:nth-child(2)',
  MAX_EXPERIENCE_DROPDOWN: '.custom-react-select__control:nth-child(3)',
  WORK_PREFERENCE_DROPDOWN: '.custom-react-select__control:nth-child(4)',
  JOB_TYPE_DROPDOWN: '.custom-react-select__control:nth-child(6)', // Index 5 (0-based)
  
  // Fallback dropdown selectors
  DEPARTMENT_DROPDOWN_FALLBACK: [
    '.custom-react-select__control:nth-child(1)',
    '.custom-react-select__control:first-child',
    '.custom-react-select__control',
    '[data-testid="department-dropdown"]',
    'select[name="department"]'
  ],
  
  MIN_EXPERIENCE_DROPDOWN_FALLBACK: [
    '.custom-react-select__control:nth-child(2)',
    '.custom-react-select__control:nth-of-type(2)',
    '.custom-react-select__control',
    '[data-testid="min-experience-dropdown"]',
    'select[name="minExperience"]'
  ],
  
  MAX_EXPERIENCE_DROPDOWN_FALLBACK: [
    '.custom-react-select__control:nth-child(3)',
    '.custom-react-select__control:nth-of-type(3)',
    '.custom-react-select__control',
    '[data-testid="max-experience-dropdown"]',
    'select[name="maxExperience"]'
  ],

  END_DATE:'//*[@id="endDate"]',
  NO_END_DATE_CHECKBOX: [
    '//label[contains(text(), "No end date")]//input[@type="checkbox"]',
    '//label[contains(text(), "Ongoing")]//input[@type="checkbox"]',
    'label:has-text("No end date") input[type="checkbox"]',
    'label:has-text("Ongoing") input[type="checkbox"]',
    '//input[@type="checkbox"][following-sibling::text()[contains(., "No end date")]]',
    '//input[@type="checkbox"][following-sibling::text()[contains(., "Ongoing")]]',
    '//*[@id="endDate"]/following-sibling::*//input[@type="checkbox"]',
  ],
  
  WORK_PREFERENCE_DROPDOWN_FALLBACK: [
    '.custom-react-select__control:nth-child(4)',
    '.custom-react-select__control:nth-of-type(4)',
    '.custom-react-select__control',
    '[data-testid="work-preference-dropdown"]',
    'select[name="workPreference"]'
  ],
  
  // Locator selectors for complex elements
  DEPARTMENT_INPUT: 'input',
  MIN_EXPERIENCE_INPUT: 'input',
  MAX_EXPERIENCE_INPUT: 'input',
  WORK_PREFERENCE_INPUT: 'input',
  JOB_TYPE_INPUT: 'input',
  
  // Legacy selectors
  OPENINGS_DROPDOWN_INDICATOR: '.custom-react-select__indicator.custom-react-select__dropdown-indicator',
  MIN_EXP_INPUT: '.custom-react-select__input input',
  
  // Job Description navigation
  JOB_DESCRIPTION_SELECTORS: [
    '[alt="Job Description"]',
    '.bg-gray-30\\/30.text-gray-900.flex.items-center.gap-2.rounded-md.p-2.active',
    'a[href="/jobs/create-new/null/job-description"]',
    'text=Job Description'
  ],
  
  // Text constants
  TEXT_JOB_DESCRIPTION: 'Job Description',
  
  // Wait times (optimized for speed)
  WAIT_AFTER_JD_CLICK: 3000,
  WAIT_AFTER_FORM_LOAD: 500,
  WAIT_AFTER_JOB_CREATION: 1000,
} as const;

// ============================================================================
// JOB DESCRIPTION EDITOR SELECTORS
// ============================================================================

export const JOB_DESCRIPTION_EDITOR = {
  TIPTAP_EDITOR: '.tiptap.ProseMirror',
  TIPTAP_EDITOR_FULL: '.tiptap.ProseMirror.prose-lg.prose-headings\\:font-display.focus\\:outline-none',
  TIPTAP_EDITOR_SIMPLE: '.tiptap',
  PROSEMIRROR_EDITOR: '.ProseMirror',
  RICH_TEXT_EDITOR: '[contenteditable="true"]',
  EDITOR_CONTAINER: '.editor-container',
} as const;

// ============================================================================
// JOB DESCRIPTION PAGE
// ============================================================================

export const JOB_DESCRIPTION_PAGE = {
  // Text editor selectors (using centralized editor selectors)
  TEXT_EDITOR_SELECTORS: [
    JOB_DESCRIPTION_EDITOR.TIPTAP_EDITOR_FULL,
    JOB_DESCRIPTION_EDITOR.TIPTAP_EDITOR,
    JOB_DESCRIPTION_EDITOR.PROSEMIRROR_EDITOR,
    JOB_DESCRIPTION_EDITOR.RICH_TEXT_EDITOR,
    'div[contenteditable="true"]',
    'div[role="textbox"]',
    'textarea',
    'input[type="text"]'
  ],
  
  // Job Score Criteria button selectors
  JOB_SCORE_CRITERIA_BUTTON_SELECTORS: [
    'button.shadow-sm.flex.flex-row.items-center.justify-center.focus-visible\\:outline.focus-visible\\:outline-2.focus-visible\\:outline-offset-2.focus-visible\\:outline-indigo-600.h-8.w-fit.gap-1.rounded-md.border.border-gray-300.bg-white.px-3.py-1\\.5.text-13.font-medium.leading-5.tracking-n07.text-gray-600.opacity-85.hover\\:bg-gray-20.focus\\:outline-none.disabled\\:cursor-not-allowed.disabled\\:bg-gray-100.disabled\\:text-gray-400',
    'button.shadow-sm.flex.flex-row.items-center.justify-center.h-8.w-fit.gap-1.rounded-md.border.border-gray-300.bg-white.px-3.py-1\\.5',
    'button.shadow-sm.h-8.w-fit.rounded-md.border.border-gray-300.bg-white',
    'button[class*="shadow-sm"][class*="flex"][class*="rounded-md"]',
    'button:has-text("Job Score Criteria")',
    'button:has-text("Score Criteria")',
    'button:has-text("Criteria")'
  ],
  
  // Save button selectors
  SAVE_BUTTON_SELECTORS: [
    'button:has-text("Save")',
    'button:has-text("Save Changes")',
    'button:has-text("Save & Next")',
    'button[type="submit"]',
    'input[type="submit"]',
    'button[class*="save"]',
    'button[class*="Save"]'
  ],
  
  // Text constants
  TEXT_JOB_SCORE_CRITERIA: 'Job Score Criteria',
  TEXT_SCORE_CRITERIA: 'Score Criteria',
  TEXT_CRITERIA: 'Criteria',
  TEXT_SAVE: 'Save',
  TEXT_SAVE_CHANGES: 'Save Changes',
  TEXT_SAVE_AND_NEXT: 'Save & Next',
  
  // Wait times
  WAIT_AFTER_SCROLL: 500,
  WAIT_AFTER_BUTTON_CLICK: 2000,
  WAIT_FOR_UUID_RETRY: 3000,
} as const;

// ============================================================================
// JOB SCORES CRITERIA PAGE//div[text()='Select Domains...']

// ============================================================================

export const JOB_SCORES_CRITERIA_PAGE = {
  // Domain dropdown selectors
  DOMAIN_DROPDOWN_SELECTORS: [
    "//span[contains(text(), 'Select domains...')]",
    'text=Select domains'
  ],
  // Domain search input inside dropdown
  DOMAIN_SEARCH_INPUT: [
    'input[placeholder="Search domain..."]',
    'input[placeholder*="Search domain"]',
  ],
  
  // Required skills dropdown selectors
  REQUIRED_SKILLS_DROPDOWN_SELECTORS: [
    "//span[contains(text(), 'Select required skills...')]",
    'text=Select required skills'
  ],
  // Required skills search input
  REQUIRED_SKILLS_SEARCH_INPUT: [
    'input[placeholder="Search required skills..."]',
    'input[placeholder*="Search required skills"]',
    'input[placeholder*="Search"]'
  ],
  
  // Preferred qualifications dropdown selectors
  PREFERRED_QUALIFICATIONS_DROPDOWN_SELECTORS: [
    "//span[contains(text(), 'Select preferred qualifications...')]",
    'text=Select preferred qualifications'
  ],
  // Preferred qualifications search input
  PREFERRED_QUALIFICATIONS_SEARCH_INPUT: [
    'input[placeholder="Search preferred qualifications..."]',
    'input[placeholder*="Search preferred"]',
    'input[placeholder*="Search"]'
  ],
  
  // Checkbox selectors
  DOMAIN_CHECKBOXES: 'input[type="checkbox"][class*="mr-3"]',
  SKILL_CHECKBOXES: 'input[type="checkbox"]',
  
  // Skill selection selectors
  HARD_SKILL_SELECTORS: ["xpath=//span[contains(text(), 'Hard Skills')]"] ,
  
  SOFT_SKILL_SELECTORS: ["xpath=//span[contains(text(), 'Soft Skills')]"] ,

  QUALIFICATION_SELECTORS: [
    'input[type="checkbox"]:near(span:has-text("{qualification}"))',
    'label:has-text("{qualification}") input[type="checkbox"]',
    'input[type="checkbox"]:near(label:has-text("{qualification}"))',
    '[data-testid*="{qualification}"] input[type="checkbox"]'
  ],
  
  // Job responsibilities text area selectors
  JOB_RESPONSIBILITIES_TEXTAREA_SELECTORS: [
    'input[placeholder="Enter job responsibilities separated by comma..."]',
    'textarea[placeholder="Enter job responsibilities separated by comma..."]'
  ],
  
  
  // Save & Next button selectors
  SAVE_NEXT_BUTTON_SELECTORS: [
    'button:has-text("Save & Next")',
    'button.shadow-sm:has-text("Save & Next")',
    'button[class*="shadow-sm"]:has-text("Save & Next")',
    'button[class*="flex"][class*="items-center"]:has-text("Save & Next")',
    'button[class*="bg-white"]:has-text("Save & Next")',
    'button[class*="border-gray-300"]:has-text("Save & Next")',
    'button.shadow-sm.flex.flex-row.items-center.justify-center:has-text("Save & Next")',
    'button[class*="shadow-sm"][class*="flex"][class*="items-center"][class*="justify-center"]:has-text("Save & Next")',
    'button[class*="Save"]',
    'button[class*="Next"]',
    'input[type="submit"][value*="Save"]',
    'input[type="button"][value*="Save"]'
  ],

  // Publish button selectors
  PUBLISH_BUTTON_SELECTORS: [
    "xpath=//button[contains(text(), 'Publish')]",
    'text=Publish'
  ],

  CLICKSAVEBUTTON:"//button[p[text()='Save & Next']",
  
  // Text constants
  TEXT_SELECT_DOMAINS: 'Select domains...',
  TEXT_SELECT_REQUIRED_SKILLS: 'Select required skills...',
  TEXT_SELECT_PREFERRED_QUALIFICATIONS: 'Select preferred qualifications...',
  TEXT_HARD_SKILLS: 'Hard Skills',
  TEXT_SOFT_SKILLS: 'Soft Skills',
  TEXT_SAVE_AND_NEXT: 'Save & Next',
  TEXT_SAVE_AND_NEXT_ALT: 'Save and Next',
  
  // Placeholder text
  PLACEHOLDER_REQUIRED_SKILLS: 'Select required skills...',
  PLACEHOLDER_PREFERRED_QUALIFICATIONS: 'Select preferred qualifications...',
  PLACEHOLDER_JOB_RESPONSIBILITIES: 'Enter job responsibilities',
  
  
  // Wait times
  WAIT_AFTER_DROPDOWN_OPEN: 2000,
  WAIT_AFTER_SKILL_SELECTION: 500,
  WAIT_AFTER_DROPDOWN_CLOSE: 1000,
  WAIT_AFTER_SAVE_NEXT: 2000,
  WAIT_FOR_SKILLS_LOAD: 2000,
} as const;



// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD = {
  SELECT_ALL: 'Control+a',
  DELETE: 'Delete',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  ARROW_DOWN: 'ArrowDown',
  END: 'End',
} as const;

// ============================================================================
// POSITION COORDINATES
// ============================================================================

export const POSITIONS = {
  CLICK_ANYWHERE_DEFAULT: { x: 100, y: 100 },
  CLICK_OUTSIDE_DROPDOWN: { x: 50, y: 50 },
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX_PATTERNS = {
  JOB_ID_EXTRACTION: /\/jobs\/create-new\/([^\/]+)\//,
  NULL_JOB_ID: /\/null\//,
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Generic errors
  ELEMENT_NOT_FOUND: 'Could not find element',
  DROPDOWN_NOT_FOUND: 'Could not find or open dropdown',
  BUTTON_NOT_FOUND: 'Could not find button',
  TEXT_AREA_NOT_FOUND: 'Could not find text area',
  
  // Specific errors
  JOB_DESCRIPTION_NOT_FOUND: 'Could not find Job Description element',
  JOB_SCORE_CRITERIA_NOT_FOUND: 'Could not find Job Score Criteria button',
  REQUIRED_SKILLS_DROPDOWN_NOT_FOUND: 'Could not find or open Required Skills dropdown with "Select required skills..." placeholder',
  PREFERRED_QUALIFICATIONS_DROPDOWN_NOT_FOUND: 'Could not find or open Preferred Qualifications dropdown with "Select preferred qualifications..." placeholder',
  JOB_RESPONSIBILITIES_TEXTAREA_NOT_FOUND: 'Could not find job responsibilities text area',
  
  // Environment variable errors
  ENV_VAR_NOT_DEFINED: 'not provided and not defined in .env',
  
  // File errors
  FILE_NOT_FOUND: 'file not found',
  CONTENT_EMPTY: 'content is empty',
  
  // UUID errors
  UUID_ERROR_DETECTED: 'UUID error detected. This usually means:',
  UUID_ERROR_CAUSES: [
    'Job was not properly created before writing JD',
    'Job ID is null or invalid in the URL',
    'Need to ensure job creation completes before JD step'
  ],
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  // Navigation
  NAVIGATION_SUCCESS: 'Successfully navigated to',
  PAGE_LOADED: 'Page loaded successfully',
  
  // Actions
  ELEMENT_CLICKED: 'Successfully clicked',
  ELEMENT_DOUBLE_CLICKED: 'Double-clicked on',
  ELEMENT_FILLED: 'Filled',
  ELEMENT_SELECTED: 'Selected',
  DROPDOWN_OPENED: 'Opened dropdown',
  DROPDOWN_CLOSED: 'Closed dropdown',
  
  // Content
  CONTENT_WRITTEN: 'Content writing completed successfully',
  CONTENT_VERIFIED: 'Content verification successful',
  
  // Process completion
  DOMAIN_SELECTION_COMPLETED: 'Domain selection completed successfully',
  SKILLS_SELECTION_COMPLETED: 'Required skills selection completed successfully',
  QUALIFICATIONS_SELECTION_COMPLETED: 'Preferred qualifications selection completed successfully',
  JOB_RESPONSIBILITIES_COMPLETED: 'Job responsibilities writing completed successfully',
  SAVE_NEXT_COMPLETED: 'Save & Next process completed successfully',
  JD_SAVE_COMPLETED: 'Job description save process completed',
} as const;

// ============================================================================
// WARNING MESSAGES
// ============================================================================

export const WARNING_MESSAGES = {
  // Page state
  PAGE_CLOSED: 'Page is closed, skipping',
  NULL_JOB_ID: 'URL contains null job ID, this may cause UUID errors',
  NULL_JOB_ID_GRACEFUL: 'URL contains null job ID, attempting to handle gracefully',
  STILL_NULL_JOB_ID: 'Still null job ID, this may cause save issues',
  
  // Element interactions
  SELECTOR_FAILED: 'Selector failed',
  CLICK_FAILED: 'Click failed',
  FILL_FAILED: 'Fill method failed',
  KEYBOARD_FAILED: 'Keyboard method failed',
  ESCAPE_FAILED: 'Escape key failed to close dropdown',
  CLICK_OUTSIDE_FAILED: 'Clicking outside failed to close dropdown',
  
  // Content
  CONTENT_VERIFICATION_FAILED: 'Content verification failed - no substantial content found',
  NO_SAVE_BUTTON: 'No save button found, job description may auto-save',
  NO_ERROR_MESSAGES: 'No error messages found on page',
  
  // File operations
  FILE_NOT_FOUND_DEFAULT: 'file not found, using default',
  ERROR_READING_FILE: 'Error reading file',
} as const;

// ============================================================================
// DOM SELECTORS FOR DROPDOWN OPTIONS
// ============================================================================

export const DROPDOWN_OPTIONS = {
  CUSTOM_REACT_SELECT_OPTION: '.custom-react-select__option',
  ROLE_OPTION: '[role="option"]',
  STANDARD_OPTION: 'option',
  SELECT_OPTION: 'select option',
} as const;

// ============================================================================
// DROPDOWN MENU SELECTORS
// ============================================================================

export const DROPDOWN_MENUS = {
  CUSTOM_REACT_SELECT_MENU_LIST: '.custom-react-select__menu-list',
  CUSTOM_REACT_SELECT_MENU: '.custom-react-select__menu',
  DROPDOWN_MENU: '.dropdown-menu',
  SELECT_MENU: 'select',
} as const;

// ============================================================================
// DROPDOWN CONTROL SELECTORS
// ============================================================================

export const DROPDOWN_CONTROLS = {
  CUSTOM_REACT_SELECT_CONTROL: '.custom-react-select__control',
  DROPDOWN_CONTROL: '.dropdown-control',
  SELECT_CONTROL: 'select',
} as const;

// ============================================================================
// SCHEDULE INTERVIW PAGE SELECTORS
// ============================================================================


export const SCHEDULE_INTERVIEW_PAGE = {
  SELECT_ROLE_FOR_INTERVIEW: `//h1[text()='${process.env.ROLE}']`,
  ADD_CANDIDATE_BUTTON: "//button[@id='candidateAddMenu']",
  SELECT_RESUME_UPLOAD_LINK: "//h1[text()='Resume File Upload']",
  SELECT_SOURCE_CANDIDATES: [
    "[role='combobox']",
    "select",
    "div select",
    "input[role='combobox']",
    "[class*='rounded-lg'][class*='border-gray-300'][class*='px-3'][class*='py-2']"
  ],
  SELECT_BROWSE_FILE:"//button[@type='button' and text()='Browse File']",
  CLICK_SETTINGS: "//a[normalize-space()='Settings']",
  HIRING_STAGE:"//a[normalize-space()='Hiring Stages' or normalize-space()='Hiring Stage']",
  HIRING_STAGE_CANDIDATES: [
    "a:has-text('Hiring Stages')",
    "a:has-text('Hiring Stage')",
    "text=Hiring Stages",
    "role=link[name=Hiring Stages]",
    "button:has-text('Hiring Stages')"
  ],
  // Feedback form trigger button (compact utility-classes badge)
  FEEDBACK_FORM_BUTTON_STRICT: "(//button[@title='Select a form' and contains(text(),'Add Feedback Form')])[1]",
  FEEDBACK_FORM_BUTTON_CANDIDATES: [
    "button:has-text('Add Feedback Form')",  // Primary text selector
    "role=button[name='Add Feedback Form']", // ARIA role
    "button:has-text('Feedback')",           // Alternative text
    "a:has-text('Feedback')",                // If it's a link
    "text=Feedback",                          // Fallback text
    "button[title='Select a form']",          // Title attribute
    "button[title*='Select a form']",         // Partial match title
    "[title='Select a form']",                // Generic title fallback
    // Only use class-based as last resort
    "[class*='ml-auto'][class*='font-medium'][class*='h-5'][class*='bg-gray-100']",
    "[class*='rounded-sm'][class*='gap-1']"
  ],
  ADDFEEDBACK: "(//button[contains(@class, 'form-action-icon') and normalize-space(text())='Select Form'])[1]",
  CLICKPIPELINE: "//*[text()='Pipeline']",
  SCHEDULEINTERVIEWBUTTON:"//button[contains(text(), 'Schedule interview')]",
  SEARCHPANELMEMBER:"//input[@placeholder='Search panel members...']",
  PANEL_MEMBER_CHECKBOX_CANDIDATES: [
    "//div[contains(@class,'listbox')]//label[contains(@class,'checkbox')]/input",
    "//div[@role='listbox']//input[@type='checkbox']",
    "//input[@type='checkbox']"],
  SELECTDATE:"//span[@role='spinbutton' and @aria-label='Month']",
  SELECTFROMTIME:"(//*[text()='hh'])[1]",
  SELECTTOTIME:"//*[text()='hh']",
  INTERVIEWTYPE:"//span[text()='Online']",
  INTERVIEWTYPEOFFLINE:"//span[text()='Offline']",
  CREATEEVENTBUTTON: "//button[text()='Create Event']",
  CLICKCONFIRMBUTTON: "//button[text()='Confirm']",
  CANCELEVENTBUTTON: "//button[.//img[@src='/assets/DeleteBin-831cc2ef.svg']]",
  UPDATEEVENTBUTTON: "//button[text()='Update Event']",
  CANCELBUTTON: "//button[text()='Cancel']",
  DISQUALIFYBUTTON: "//*[@data-tooltip-id='disqualify']",
  SELECTREASONTODISQUALIFY:"//*[text()='Qualifications']",
  CHANGETEMPLATEBUTTON:"//button[text()='Change Template']",
  SELECTDIFERRENTTEMPLATE:"//*[text()='Feedback Reminder']",
  SELEECTTEMPLATEBUTTON:"//*[text()='Select Template']",
  SELECTTEMPLATETYPE:"//*[text()='Select Template']",
  SELECTDISQUALIFYBUTTON:"(//*[text()='Disqualify candidate'])[2]",
  DISQUALIFYCONFIRMBUTTON:"//*[text()='Confirm']"
} as const;