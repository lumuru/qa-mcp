import { Page } from '@playwright/test';

export interface LoginConfig {
  loginUrl: string;
  usernameSelector: string;
  passwordSelector: string;
  submitSelector: string;
  credentials: {
    username: string;
    password: string;
  };
  /** Optional: selector to verify login succeeded */
  successSelector?: string;
}

export function createLoginHelper(config: LoginConfig) {
  return async (page: Page): Promise<void> => {
    await page.goto(config.loginUrl);
    await page.fill(config.usernameSelector, config.credentials.username);
    await page.fill(config.passwordSelector, config.credentials.password);
    await page.click(config.submitSelector);

    if (config.successSelector) {
      await page.waitForSelector(config.successSelector, { timeout: 10_000 });
    } else {
      await page.waitForLoadState('networkidle');
    }
  };
}
