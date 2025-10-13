import { Page, BrowserContext, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonUtils } from './CommonUtils';
import { SCHEDULE_INTERVIEW_PAGE } from './Selectors';

export default class schedulejobPage extends BasePage {
  private utils: CommonUtils;

  constructor(page: Page, context: BrowserContext) {
    super(page, context);
    this.utils = new CommonUtils(page, context);
  }

  async fillCurrentDate(): Promise<void> {
    const today = await this.utils.autoFillCurrentDate(); // ✅ Await the async method
  
    const locator = this.page.locator(`xpath=${(SCHEDULE_INTERVIEW_PAGE as any).SELECTDATE}`).first();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
  
    await locator.click();
    await this.page.keyboard.type(today, { delay: 100 });
    await this.page.keyboard.press('Tab');
  }

  async fillFromTime(): Promise<string> {
    const time = await this.utils.getCurrentTime();
    const locator = this.page.locator(`xpath=${(SCHEDULE_INTERVIEW_PAGE as any).SELECTFROMTIME}`).first();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click({ clickCount: 3 });
    await locator.type(time);
    try { const handle = await locator.elementHandle(); await handle?.evaluate(el => (el as HTMLElement).blur()); } catch {}
    await this.utils.waitForTimeout(200);
    return time;
  }

  async fillToTimePlusOneHour(): Promise<string> {
    const timeStr = await this.utils.getCurrentTime();
    const [time, ampm] = timeStr.split(' ');
    const [hStr, mStr] = time.split(':');
    const h12 = Number(hStr);
    const mins = Number(mStr);
    let h24 = (h12 % 12) + (ampm === 'PM' ? 12 : 0);
    h24 = (h24 + 1) % 24;
    const newAmPm = h24 >= 12 ? 'PM' : 'AM';
    const h12Out = h24 % 12 || 12;
    const newTime = `${String(h12Out).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${newAmPm}`;

    const locator = this.page.locator(`xpath=${(SCHEDULE_INTERVIEW_PAGE as any).SELECTTOTIME}`).first();
    try { await this.page.keyboard.press('Escape'); } catch {}
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click({ force: true });
    await locator.click({ clickCount: 3 });
    await locator.type(newTime, { delay: 100 });
    return newTime;
  }
}


