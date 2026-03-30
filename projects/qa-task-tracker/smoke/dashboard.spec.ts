import { test, expect } from '@playwright/test';

test.describe('Public Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the page title and heading', async ({ page }) => {
    await expect(page).toHaveTitle('QA Task Tracker');
    await expect(page.getByRole('heading', { name: 'QA Tracker', level: 1 })).toBeVisible();
  });

  test('should show the login form', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should show public view notice', async ({ page }) => {
    await expect(page.getByText('Public view. Log in to manage projects.')).toBeVisible();
  });

  test('should display dashboard stats', async ({ page }) => {
    await expect(page.getByText('pass rate')).toBeVisible();
    await expect(page.getByText('Test Runs')).toBeVisible();
    await expect(page.getByText('Open Bugs')).toBeVisible();
    await expect(page.getByText('Projects', { exact: true })).toBeVisible();
  });

  test('should display Project Health section with projects', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'Project Health', level: 3 });
    await expect(heading).toBeVisible();
    // Wait for project data to load from API
    await expect(page.getByText('BSC (CR-BSC-HR1-2025-001)')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Balanced Scorecard (BSC)')).toBeVisible();
  });

  test('should display Recent Activity section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recent Activity', level: 3 })).toBeVisible();
    // Should show at least one bug or test run entry
    await expect(page.getByText('BUG').first()).toBeVisible();
  });

  test('should display Bug Distribution section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bug Distribution', level: 3 })).toBeVisible();
    await expect(page.getByText('Critical', { exact: true })).toBeVisible();
    await expect(page.getByText('Major', { exact: true })).toBeVisible();
  });

  test('should display footer stats', async ({ page }) => {
    await expect(page.getByText('test cases')).toBeVisible();
    await expect(page.getByText('team members')).toBeVisible();
    await expect(page.getByText('total bugs')).toBeVisible();
  });
});

test.describe('Login Form Validation', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'Email' }).fill('wrong@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should not submit when fields are empty', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Login' }).click();

    // Empty fields trigger HTML required validation or no-op — no error message appears
    // Verify the login form is still visible (no navigation occurred)
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
