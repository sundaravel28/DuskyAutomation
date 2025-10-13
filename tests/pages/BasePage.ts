import { Page, BrowserContext } from '@playwright/test';

export class BasePage {
  protected page: Page;
  protected context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
  }

  /**
   * Navigate to a URL with default timeout and wait conditions
   */
  async navigateTo(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle', timeout?: number }) {
    const defaultOptions = {
      waitUntil: 'domcontentloaded' as const,
      timeout: 60000
    };
    
    await this.page.goto(url, { ...defaultOptions, ...options });
  }

  /**
   * Wait for a specified amount of time
   */
  async waitForTimeout(milliseconds: number) {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Set default timeout for the page
   */
  setDefaultTimeout(timeout: number) {
    this.page.setDefaultTimeout(timeout);
  }

  /**
   * Maximize the browser window by setting viewport to available screen size
   */
  async maximize() {
    const { width, height } = await this.page.evaluate(() => {
      return { 
        width: window.screen.availWidth || window.innerWidth, 
        height: window.screen.availHeight || window.innerHeight 
      };
    });

    await this.page.setViewportSize({ width, height });
  }

  /**
   * Get the current page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }
}
