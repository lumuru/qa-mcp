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
    {
      name: 'qa-task-tracker',
      testDir: './projects/qa-task-tracker',
      use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3001',
      },
    },
    {
      name: 'bsc-qas',
      testDir: './projects/bsc-qas',
      use: {
        baseURL: process.env.BASE_URL || 'https://REDACTED.example',
      },
    },
    {
      name: 'sdm-qas',
      testDir: './projects/sdm-qas',
      use: {
        baseURL: process.env.BASE_URL || 'https://REDACTED.example',
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
