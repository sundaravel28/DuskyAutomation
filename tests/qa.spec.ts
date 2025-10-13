import { test, expect, chromium } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('Talent QA Site Test', async ({ page }) => {
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 720 });

  // Navigate to login page
  await page.goto('https://talent-qa.ideas2it.com/login');

  // Wait for page load
  await page.waitForLoadState('networkidle', { timeout: 100000 });
  await page.waitForTimeout(3000); // extra wait

  // Debug: page title
  console.log('Page title:', await page.title());

  // Navigate through main sections
  await page.getByRole('searchbox', { name: 'Search...' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('link', { name: 'Interviews' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('button', { name: 'Past Interviews (138)' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Upcoming Interviews (1)' }).click();
  await page.waitForTimeout(1000);

  // Filter and select options
  await page.getByRole('button', { name: 'Filter Filters' }).click();
  await page.locator('div').filter({ hasText: /^Interview Type$/ }).click();
  await page.getByRole('button').nth(2).click();
  await page.getByText('Interview Stage', { exact: true }).click();
  await page.locator('div').filter({ hasText: /^Role$/ }).first().click();
  await page.getByRole('button').nth(2).click();
  await page.locator('div').filter({ hasText: /^Status$/ }).click();
  await page.getByRole('button').nth(2).click();
  await page.getByText('Panel Members', { exact: true }).click();
  await page.getByRole('button').nth(2).click();
  await page.locator('span').filter({ hasText: 'Scheduled By' }).click();
  await page.getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Show results' }).click();

  // My Availability section
  await page.getByRole('link', { name: 'My Availability' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('button', { name: 'Add Tech Stack' }).click();
  await page.waitForTimeout(1000);
  
  await page.locator('.absolute').first().click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'AWS' }).click();
  await page.waitForTimeout(1000);
  
  await page.locator('div:nth-child(6) > .hover\\:bg-blue-700').click();
  await page.waitForTimeout(1000);
  
  await page.locator('div').filter({ hasText: /^JavaScript$/ }).click();
  await page.waitForTimeout(1000);

  // Calendar interactions
  await page.getByText('Thursday (Oct 9)Unavailable').click();
  await page.locator('div:nth-child(8) > .day-header > .toggle-switch').first().click();
  await page.locator('div:nth-child(8) > .day-header > .toggle-switch').last().click();
  await page.getByRole('button', { name: 'Calendar View' }).click();
  await page.locator('div:nth-child(8) > div:nth-child(14)').click();
  await page.locator('.w-5.h-5.flex').first().click();

  // Referrals, Templates, Candidates
  await page.getByRole('link', { name: 'Refer a Friend' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'My Referrals' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('link', { name: 'Templates' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.locator('div').filter({ hasText: /^Name$/ }).first().click();
  await page.waitForTimeout(1000);
  
  await page.getByText('Name', { exact: true }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('link', { name: 'Candidates' }).click();
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('button', { name: 'In Applicants (1162)' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'In-pipeline (388)' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Hired (14)' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Disqualified (74)' }).click();
  await page.waitForTimeout(1000);
  
  await page.getByRole('button', { name: 'Deleted (154)' }).click();
  await page.waitForTimeout(1000);

  // Reports
  await page.getByRole('link', { name: 'Reports' }).click();
  await page.waitForLoadState('networkidle');
});
