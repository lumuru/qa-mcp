import { test, expect } from '@playwright/test';
import { uniqueEmail, uniqueUsername, createTestUser } from './test-data';

test.describe('Test Data Factory', () => {
  test('uniqueEmail returns a valid email string', () => {
    const email = uniqueEmail();
    expect(email).toContain('@');
    expect(email).toContain('example.com');
  });

  test('uniqueEmail generates unique values', () => {
    const email1 = uniqueEmail();
    const email2 = uniqueEmail();
    expect(email1).not.toBe(email2);
  });

  test('uniqueUsername generates unique values', () => {
    const u1 = uniqueUsername();
    const u2 = uniqueUsername();
    expect(u1).not.toBe(u2);
  });

  test('createTestUser returns correct shape', () => {
    const user = createTestUser();
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('password');
  });

  test('createTestUser accepts overrides', () => {
    const user = createTestUser({ email: 'custom@test.com' });
    expect(user.email).toBe('custom@test.com');
  });
});
