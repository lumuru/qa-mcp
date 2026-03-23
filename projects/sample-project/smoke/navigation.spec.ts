import { test, expect } from '@playwright/test';

test.describe('Smoke: Navigation', () => {
  test('homepage loads successfully', async ({ page, baseURL }) => {
    const response = await page.goto(baseURL!);
    expect(response?.status()).toBeLessThan(400);
  });

  test('page has a title', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
