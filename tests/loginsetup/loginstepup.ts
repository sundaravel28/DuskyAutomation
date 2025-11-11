import { chromium } from '@playwright/test';

(async () => {
  try {
    // Launch Chrome in non-headless mode
    const browser = await chromium.launch({
      headless: false,
      channel: 'chrome', // Ensures actual Chrome is used
    });

    // Create a fresh context
    const context = await browser.newContext();

    // Open a new page
    const page = await context.newPage();

    // Navigate to the login page
    await page.goto('https://talent-qa.ideas2it.com/');

    console.log('🌐 Please log in manually within 40 seconds...');
    await page.waitForTimeout(40000); // 20 seconds for manual login

    // Save the authenticated storage state
    await context.storageState({ path: 'authState.json' });

    console.log('✅ Auth state saved successfully to authState.json');
    await browser.close();
  } catch (error) {
    console.error('❌ Error occurred:', error);
    process.exit(1);
  }
})();



