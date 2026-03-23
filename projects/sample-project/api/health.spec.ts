import { test, expect } from '@playwright/test';

test.describe('API: Health Check', () => {
  test('base URL returns successful response', async ({ request, baseURL }) => {
    const response = await request.get(baseURL!);
    expect(response.status()).toBeLessThan(400);
  });

  test('response headers include content-type', async ({ request, baseURL }) => {
    const response = await request.get(baseURL!);
    const contentType = response.headers()['content-type'];
    expect(contentType).toBeDefined();
  });
});
