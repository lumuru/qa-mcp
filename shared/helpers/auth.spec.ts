import { test, expect } from '@playwright/test';
import { createLoginHelper } from './auth';

test.describe('Auth Helper', () => {
  test('createLoginHelper returns a function', () => {
    const login = createLoginHelper({
      loginUrl: '/login',
      usernameSelector: '#username',
      passwordSelector: '#password',
      submitSelector: '#submit',
      credentials: { username: 'testuser', password: 'testpass' },
    });
    expect(typeof login).toBe('function');
  });
});
