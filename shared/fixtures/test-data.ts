/**
 * Generates unique test data to avoid test collisions.
 * Use these factories when tests need user data, form data, etc.
 */

let counter = 0;

export function uniqueEmail(prefix = 'test'): string {
  return `${prefix}+${Date.now()}_${counter++}@example.com`;
}

export function uniqueUsername(prefix = 'user'): string {
  return `${prefix}_${Date.now()}_${counter++}`;
}

export interface TestUser {
  email: string;
  username: string;
  password: string;
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    email: uniqueEmail(),
    username: uniqueUsername(),
    password: 'TestPass123!',
    ...overrides,
  };
}
