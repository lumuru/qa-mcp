import { test, expect } from '@playwright/test';

test.describe('Dashboard API - Public Endpoints', () => {
  test('GET /api/dashboard/stats should return dashboard statistics', async ({ request }) => {
    const response = await request.get('/api/dashboard/stats');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('total_projects');
    expect(data).toHaveProperty('active_projects');
    expect(data).toHaveProperty('test_cases');
    expect(data).toHaveProperty('total_users');
    expect(data).toHaveProperty('bugs');
    expect(data.bugs).toHaveProperty('total');
    expect(data.bugs).toHaveProperty('open');
    expect(data.bugs).toHaveProperty('closed');
    expect(data).toHaveProperty('test_runs');
    expect(data).toHaveProperty('avg_pass_rate');
    expect(data).toHaveProperty('bugs_by_severity');
    expect(Array.isArray(data.bugs_by_severity)).toBe(true);
  });

  test('GET /api/dashboard/activity should return recent activity', async ({ request }) => {
    const response = await request.get('/api/dashboard/activity');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('recent_bugs');
    expect(data).toHaveProperty('recent_runs');
    expect(Array.isArray(data.recent_bugs)).toBe(true);
    expect(Array.isArray(data.recent_runs)).toBe(true);

    // Verify bug entry shape if data exists
    if (data.recent_bugs.length > 0) {
      const bug = data.recent_bugs[0];
      expect(bug).toHaveProperty('id');
      expect(bug).toHaveProperty('title');
      expect(bug).toHaveProperty('status');
      expect(bug).toHaveProperty('severity');
      expect(bug).toHaveProperty('created_at');
    }

    // Verify run entry shape if data exists
    if (data.recent_runs.length > 0) {
      const run = data.recent_runs[0];
      expect(run).toHaveProperty('id');
      expect(run).toHaveProperty('name');
      expect(run).toHaveProperty('project_name');
      expect(run).toHaveProperty('total');
      expect(run).toHaveProperty('passed');
      expect(run).toHaveProperty('failed');
    }
  });

  test('GET /api/dashboard/project-summary should return all projects', async ({ request }) => {
    const response = await request.get('/api/dashboard/project-summary');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Verify project entry shape
    const project = data[0];
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('name');
    expect(project).toHaveProperty('status');
    expect(project).toHaveProperty('test_case_count');
    expect(project).toHaveProperty('open_defects');
    expect(project).toHaveProperty('latest_pass_rate');
  });
});

test.describe('Auth-Protected Endpoints', () => {
  const protectedEndpoints = [
    '/api/projects',
    '/api/test-cases',
    '/api/test-runs',
    '/api/bugs',
    '/api/members',
    '/api/auth/me',
  ];

  for (const endpoint of protectedEndpoints) {
    test(`GET ${endpoint} should return 401 without auth`, async ({ request }) => {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(401);
    });
  }
});

test.describe('Auth API', () => {
  test('POST /api/auth/login should return 401 for invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'invalid@test.com', password: 'wrongpassword' },
    });

    expect(response.status()).toBe(401);
  });
});
