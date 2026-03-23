# QA MCP Toolkit Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a central QA automation hub with 3 MCP servers (Microsoft Playwright MCP, ExecuteAutomation MCP, Playwriter) in VS Code, supporting multi-project test automation.

**Architecture:** A single repo (`qa-mcp/`) acts as the command center. VS Code connects to 3 MCP servers via `.vscode/mcp.json`. Playwright's native multi-project config routes tests to different apps. Shared helpers (auth, fixtures) are reused across projects.

**Tech Stack:** Node.js, TypeScript, Playwright Test, VS Code MCP, @playwright/mcp, @executeautomation/playwright-mcp-server, playwriter

**Spec:** `docs/superpowers/specs/2026-03-23-qa-mcp-toolkit-design.md`

---

## File Structure

```
qa-mcp/
├── .vscode/
│   └── mcp.json                          # MCP server configuration (3 servers)
├── .gitignore                            # Ignore node_modules, results, .env files
├── package.json                          # Project dependencies
├── tsconfig.json                         # TypeScript configuration
├── playwright.config.ts                  # Multi-project Playwright config
├── projects/
│   └── sample-project/
│       ├── .env.staging                  # Staging environment config
│       ├── .env.production                # Production environment config
│       ├── smoke/
│       │   └── navigation.spec.ts        # Sample smoke test
│       ├── regression/
│       │   └── .gitkeep
│       └── api/
│           └── health.spec.ts            # Sample API test
├── shared/
│   ├── helpers/
│   │   ├── auth.ts                       # Reusable login helper
│   │   └── auth.spec.ts                  # Auth helper tests
│   └── fixtures/
│       ├── test-data.ts                  # Shared test data factory
│       └── test-data.spec.ts             # Test data factory tests
├── results/
│   └── .gitkeep
└── docs/
```

---

## Chunk 1: Project Scaffolding

### Task 1: Initialize Node.js project and install dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

- [ ] **Step 1: Initialize package.json**

Run: `npm init -y`

- [ ] **Step 2: Install Playwright Test and TypeScript**

Run: `npm install -D @playwright/test typescript @types/node`

- [ ] **Step 3: Install Playwright browsers**

Run: `npx playwright install chromium`

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist", "results"]
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (no .ts files yet, clean compile)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json
git commit -m "feat: initialize Node.js project with Playwright and TypeScript"
```

---

### Task 2: Create .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
dist/
results/
playwright-report/
test-results/
.env*
!.env.example
*.log
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "feat: add .gitignore for node_modules, results, and env files"
```

---

### Task 3: Configure VS Code MCP servers

**Files:**
- Create: `.vscode/mcp.json`

- [ ] **Step 1: Create .vscode directory**

Run: `mkdir -p .vscode`

- [ ] **Step 2: Create .vscode/mcp.json**

```json
{
  "servers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "executeautomation-playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "playwriter": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "playwriter@latest"]
    }
  }
}
```

- [ ] **Step 3: Verify MCP config is valid JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('.vscode/mcp.json','utf8')); console.log('Valid JSON')"`
Expected: `Valid JSON`

- [ ] **Step 4: Commit**

```bash
git add .vscode/mcp.json
git commit -m "feat: configure 3 MCP servers for VS Code (Playwright, ExecuteAutomation, Playwriter)"
```

---

## Chunk 2: Playwright Config & Project Structure

### Task 4: Create multi-project Playwright config

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Write the failing test — verify config loads**

Create `tests/config.spec.ts` (temporary, to verify config):

```ts
import { test, expect } from '@playwright/test';

test('playwright config loads correctly', async ({ page, baseURL }) => {
  expect(baseURL).toBeDefined();
  expect(typeof baseURL).toBe('string');
});
```

- [ ] **Step 2: Run test to verify it fails (no config yet)**

Run: `npx playwright test tests/config.spec.ts --project=sample-project 2>&1 || true`
Expected: Fails — project "sample-project" not found

- [ ] **Step 3: Create playwright.config.ts**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/config.spec.ts --project=sample-project`
Expected: PASS — baseURL is defined

- [ ] **Step 5: Remove temporary config test**

Run: `rm tests/config.spec.ts && rmdir tests`

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts
git commit -m "feat: add multi-project Playwright config with sample-project"
```

---

### Task 5: Create project directory structure

**Files:**
- Create: `projects/sample-project/.env.staging`
- Create: `projects/sample-project/smoke/.gitkeep`
- Create: `projects/sample-project/regression/.gitkeep`
- Create: `projects/sample-project/api/.gitkeep`
- Create: `results/.gitkeep`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p projects/sample-project/{smoke,regression,api}
mkdir -p results
```

- [ ] **Step 2: Create .env.staging for sample project**

```
BASE_URL=https://example.com
```

- [ ] **Step 3: Create .env.production for sample project**

```
BASE_URL=https://example.com
```

- [ ] **Step 4: Create .env.example as a template**

```
BASE_URL=https://your-app-staging-url.com
```

- [ ] **Step 5: Add .gitkeep files for empty directories**

```bash
touch projects/sample-project/regression/.gitkeep
touch results/.gitkeep
```

- [ ] **Step 6: Commit**

```bash
git add projects/ results/.gitkeep .env.example
git commit -m "feat: add sample-project directory structure with env config"
```

---

## Chunk 3: Shared Helpers

### Task 6: Create shared auth helper

**Files:**
- Create: `shared/helpers/auth.ts`
- Create: `shared/helpers/auth.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `shared/helpers/auth.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test shared/helpers/auth.spec.ts`
Expected: FAIL — module `./auth` not found

- [ ] **Step 3: Implement auth helper**

Create `shared/helpers/auth.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test shared/helpers/auth.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add shared/helpers/auth.ts shared/helpers/auth.spec.ts
git commit -m "feat: add reusable login helper with configurable selectors"
```

---

### Task 7: Create shared test data fixtures

**Files:**
- Create: `shared/fixtures/test-data.ts`
- Create: `shared/fixtures/test-data.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `shared/fixtures/test-data.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test shared/fixtures/test-data.spec.ts`
Expected: FAIL — module `./test-data` not found

- [ ] **Step 3: Create test data factory**

Create `shared/fixtures/test-data.ts`:

```ts
/**
 * Generates unique test data to avoid test collisions.
 * Use these factories when tests need user data, form data, etc.
 */

export function uniqueEmail(prefix = 'test'): string {
  return `${prefix}+${Date.now()}@example.com`;
}

export function uniqueUsername(prefix = 'user'): string {
  return `${prefix}_${Date.now()}`;
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test shared/fixtures/test-data.spec.ts`
Expected: PASS — all 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add shared/fixtures/test-data.ts shared/fixtures/test-data.spec.ts
git commit -m "feat: add shared test data factory with unique generators"
```

---

## Chunk 4: Sample Tests

### Task 8: Create sample smoke test

**Files:**
- Create: `projects/sample-project/smoke/navigation.spec.ts`

- [ ] **Step 1: Write smoke test**

Create `projects/sample-project/smoke/navigation.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test against example.com**

Run: `npx playwright test --project=sample-project smoke/`
Expected: PASS — example.com loads with 200 and has a title

- [ ] **Step 3: Commit**

```bash
git add projects/sample-project/smoke/navigation.spec.ts
git commit -m "feat: add sample smoke test for navigation"
```

---

### Task 9: Create sample API health check test

**Files:**
- Create: `projects/sample-project/api/health.spec.ts`

- [ ] **Step 1: Write API test**

Create `projects/sample-project/api/health.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test**

Run: `npx playwright test --project=sample-project api/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add projects/sample-project/api/health.spec.ts
git commit -m "feat: add sample API health check test"
```

---

## Chunk 5: Documentation & Verification

### Task 10: Add npm scripts for common operations

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add scripts to package.json**

Add the following `scripts` block to `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test smoke/",
    "test:api": "playwright test api/",
    "test:regression": "playwright test regression/",
    "test:project": "playwright test --project",
    "report": "playwright show-report results/html"
  }
}
```

- [ ] **Step 2: Verify npm scripts work**

Run: `npm test -- --project=sample-project smoke/`
Expected: PASS — smoke tests run

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add npm scripts for test execution shortcuts"
```

---

### Task 11: Final verification — run full test suite

**Files:** None (verification only)

- [ ] **Step 1: Run all tests for sample-project**

Run: `npx playwright test --project=sample-project`
Expected: All tests PASS (navigation smoke + API health check)

- [ ] **Step 2: Generate HTML report**

Run: `npx playwright test --project=sample-project --reporter=html`
Then verify: `ls results/html/index.html`
Expected: Report file exists

- [ ] **Step 3: Verify MCP config is valid**

Run: `node -e "const c = JSON.parse(require('fs').readFileSync('.vscode/mcp.json','utf8')); console.log('Servers:', Object.keys(c.servers).join(', '))"`
Expected: `Servers: playwright, executeautomation-playwright, playwriter`

- [ ] **Step 4: Verify project structure**

Run: `find . -not -path './node_modules/*' -not -path './.git/*' -type f | sort`
Expected files present:
```
./.env.example
./.gitignore
./.vscode/mcp.json
./docs/superpowers/specs/2026-03-23-qa-mcp-toolkit-design.md
./docs/superpowers/plans/2026-03-23-qa-mcp-toolkit.md
./package.json
./package-lock.json
./playwright.config.ts
./projects/sample-project/.env.staging
./projects/sample-project/.env.production
./projects/sample-project/api/health.spec.ts
./projects/sample-project/regression/.gitkeep
./projects/sample-project/smoke/navigation.spec.ts
./results/.gitkeep
./shared/fixtures/test-data.spec.ts
./shared/fixtures/test-data.ts
./shared/helpers/auth.spec.ts
./shared/helpers/auth.ts
./tsconfig.json
```

- [ ] **Step 5: Final commit if any uncommitted changes**

```bash
git status
# Only commit if there are changes
```

---

## Adding a New Project (Reference)

When you need to add a new project to the hub, follow these steps:

1. Create directory: `mkdir -p projects/{project-name}/{smoke,regression,api}`
2. Create env file: `projects/{project-name}/.env.staging` with `BASE_URL=...`
3. Add project to `playwright.config.ts`:

```ts
{
  name: '{project-name}',
  testDir: './projects/{project-name}',
  use: {
    baseURL: process.env.BASE_URL || 'https://your-staging-url.com',
  },
},
```

4. Run: `npx playwright test --project={project-name}`

---

## Summary

| Task | What it does |
|------|-------------|
| 1 | Initialize Node.js + Playwright + TypeScript |
| 2 | Create .gitignore |
| 3 | Configure 3 MCP servers in VS Code |
| 4 | Create multi-project Playwright config |
| 5 | Create sample project directory structure |
| 6 | Create shared auth login helper (TDD) |
| 7 | Create shared test data fixtures |
| 8 | Create sample smoke test |
| 9 | Create sample API health check test |
| 10 | Add npm script shortcuts |
| 11 | Final verification of full setup |
