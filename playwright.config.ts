import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './projects',
  timeout: 30_000,
  retries: 0,
  projects: [
    {
      name: 'sample-project',
      testDir: './projects/sample-project',
      use: {
        baseURL: process.env.BASE_URL || 'https://example.com',
      },
    },
  ],
  reporter: [
    ['html', { outputFolder: 'results/html', open: 'never' }],
    ['list'],
  ],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
