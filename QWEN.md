# QWEN.md — Qwen Code Context for qa-mcp

## Project Overview

QA automation hub for AI-powered end-to-end testing across multiple web projects. Uses Playwright and the `@playwright/mcp` server for browser-driven exploration and test generation.

This is a **multi-project test framework** where each web app gets its own folder under `projects/`, with tests organized by category: `smoke/`, `api/`, and `regression/`.

## Tech Stack

- **TypeScript** (strict mode, ES2022, target ESNext)
- **Playwright Test** (`@playwright/test` v1.58+) — browser automation + test runner
- **`@playwright/mcp`** — MCP server for browser interactions (configured in `.vscode/mcp.json`)
- **tsx** — TypeScript execution for exploration scripts

## Project Structure

```
projects/<name>/smoke|api|regression/   — test files per app, organized by category
shared/helpers/                         — reusable helpers (auth, planning, etc.)
shared/fixtures/                        — test data factories (createTestUser, uniqueEmail)
prompts/                                — prompt templates for exploration, generation, locators
.claude/commands/                       — command templates (reference for workflows)
docs/                                   — documentation and exploration results
results/html/                           — Playwright HTML report output
```

### Why This Structure

- `projects/` isolates each app's tests — easy to add/remove apps without touching others
- Category subfolders (`smoke/`, `api/`, `regression/`) allow running test subsets via `npm run test:smoke` etc.
- `shared/` holds cross-cutting utilities so every project uses the same patterns
- `docs/` stores exploration results, test summaries, and analysis reports

## Key Conventions

### Path Aliases

Use `@shared/*` for imports from `shared/`:
```typescript
import { createLoginHelper } from '@shared/helpers/auth';
import { createTestUser, uniqueEmail } from '@shared/fixtures/test-data';
```

These are resolved via `tsconfig.json` path mapping (`"@shared/*": ["./shared/*"]`).

### Test File Naming

- Place tests in `projects/<project-name>/<category>/<feature>.spec.ts`
- File names are kebab-case, feature-focused: `login.spec.ts`, `dashboard.spec.ts`, `planning-smoke.spec.ts`
- Categories:
  - `smoke/` — quick sanity checks (page loads, key elements visible, nav works)
  - `api/` — HTTP endpoint tests (status codes, response shapes, auth protection)
  - `regression/` — full user flows, form validation, edge cases, error states

### Locator Strategy

**Always** follow `prompts/locator-strategy.md` when writing or reviewing test selectors:

**Priority chain:**
1. `getByRole('button', { name: 'Save' })` — ARIA role + accessible name
2. `getByLabel('Email address')` — form inputs with `<label>`
3. `getByPlaceholder('Search...')` — inputs with placeholder, no label
4. `getByTestId('submit-btn')` — elements with `data-testid` attribute
5. Stable CSS — semantic class or structural selector
6. `getByText('Welcome back')` — last resort for visible static text

**Never use:**
- Hex strings 6+ chars: `#input-7f3a2b`, `[id="el-a1b2c3d4"]`
- UUIDs: `#550e8400-e29b-41d4-a716-446655440000`
- Framework-generated attributes: `data-v-*`, `data-reactid`, `_ngcontent-*`, `_nghost-*`
- Sequential/random IDs: `#radix-12`, `#headlessui-menu-button-3`
- Hash-based class names: `.css-1a2b3c`, `.sc-bdVTJa`

**When no stable locator exists:**
```typescript
// TODO: needs data-testid — element has no accessible name or stable selector
```

### Test Structure Pattern

```typescript
import { test, expect } from '@playwright/test';
import { createLoginHelper } from '@shared/helpers/auth';

const login = createLoginHelper({
  loginUrl: '/login',
  usernameSelector: '#email',
  passwordSelector: '#password',
  submitSelector: 'button[type="submit"]',
  credentials: {
    username: process.env.TEST_USER || 'user@test.com',
    password: process.env.TEST_PASS || 'password',
  },
  successSelector: '.dashboard',
});

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should do specific thing', async ({ page }) => {
    await page.goto('/path');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
```

### Test Data Pattern

```typescript
import { createTestUser, uniqueEmail } from '@shared/fixtures/test-data';

test('should create account', async ({ page }) => {
  const user = createTestUser();
  await page.goto('/signup');
  await page.getByLabel('Email').fill(user.email);
});
```

## Commands

```bash
npm test                              # All tests
npm run test:smoke                    # Smoke tests only
npm run test:api                      # API tests only
npm run test:regression               # Regression tests only
npm test -- --project=<name>          # Specific project
npm run report                        # Open HTML report
npx playwright test <path>            # Single file or directory
npx playwright test --grep "pattern"  # Tests matching pattern
npx playwright install                # Install browsers
```

## Workflows

These workflows are triggered by natural language requests:

| User Says | What I Do |
|-----------|-----------|
| **"start"** or **"setup"** | Run interactive setup wizard (see below) |
| **"explore `<url>`"** | Explore a web app and identify testable areas |
| **"generate tests for `<project>` `<category>` `<url>`"** | Write `.spec.ts` files for a project |
| **"analyze the codebase"** | Review all source files and document findings |

### Interactive Setup (say "start" or "setup")

Walk through setting up a new project step by step:

1. **Check prerequisites** — verify Node.js, npm deps, Playwright browsers
2. **Choose a project** — ask for project name and URL
3. **Scaffold** — create `projects/<name>/smoke|api|regression/` folders
4. **Register** — add project entry to `playwright.config.ts`
5. **Explore** — navigate to URL, snapshot page, map interactive elements
6. **Generate tests** — write smoke tests based on what was found
7. **Run and verify** — execute tests, fix any failures
8. **Next steps** — explain how to add more tests or another project

Be conversational — one step at a time, confirm before moving on.

### Explore Workflow (say "explore `<url>`")

1. Navigate to target URL using Playwright (`page.goto`)
2. Take accessibility snapshot (`page.accessibility.snapshot()`)
3. Identify all interactive elements: buttons, links, forms, inputs, dropdowns, modals
4. Follow key user flows — click through navigation, open menus, expand sections
5. Snapshot each new state
6. Check for auth requirements (login forms, redirect behavior)
7. Output structured summary covering:
   - Auth requirements (with `createLoginHelper` config if needed)
   - Critical user flows
   - Forms and inputs
   - Navigation structure
   - Accessibility issues
   - Recommended test categories (smoke, regression, API)
8. **Save exploration results to `docs/<PROJECT>-EXPLORATION-RESULTS.md`**

Before starting, read `prompts/explore-instructions.md` and `prompts/locator-strategy.md`.

### Generate Tests Workflow (say "generate tests for `<project>` `<category>` `<url>`")

1. Navigate to target URL
2. Snapshot page structure
3. Identify testable interactions based on category:
   - **smoke**: page loads, key elements visible, nav works
   - **api**: HTTP endpoint tests, status codes, response shapes
   - **regression**: full user flows, form validation, edge cases
4. Interact with app to verify flows work
5. Get Playwright-compatible locators following `prompts/locator-strategy.md`
6. Write `.spec.ts` files to `projects/<project>/<category>/`
7. Run tests and fix any failures
8. Follow conventions from `prompts/generate-instructions.md`

### Analyze Codebase (say "analyze the codebase")

1. Read every source file (not node_modules)
2. Map the architecture — how modules connect, data flows, entry points
3. Identify all conventions — naming, file structure, import patterns, test patterns
4. Catalog shared utilities — every helper, fixture, type, and how they're used
5. Document configuration — tsconfig, playwright config, MCP config, environment variables
6. Review existing tests — patterns, assertions,organization
7. Output findings and update documentation if needed

## File Organization Rules

### When Exploring a New URL or Generating Tests

**Always** organize files into their proper folders:

1. **Test files** → `projects/<project-name>/<category>/<feature>.spec.ts`
   - Smoke tests → `projects/<name>/smoke/`
   - API tests → `projects/<name>/api/`
   - Regression tests → `projects/<name>/regression/`

2. **Helpers** → `shared/helpers/<feature>.ts`
   - Reusable utilities for specific modules (e.g., `planning.ts`, `auth.ts`)

3. **Documentation** → `docs/<PROJECT>-<TYPE>.md`
   - Exploration results → `docs/<PROJECT>-EXPLORATION-RESULTS.md`
   - Test summaries → `docs/<PROJECT>-TESTS-SUMMARY.md`
   - Module-specific exploration → `docs/<PROJECT>-<MODULE>-EXPLORATION.md`

4. **HTML artifacts** → `docs/` folder
   - Page snapshots → `docs/<PROJECT>-<PAGE>.html`

**Never** leave files in the root directory. Clean up temporary exploration scripts after use.

### File Naming Convention

- **Documentation:** `PROJECT-TYPE.md` (e.g., `BSC-EXPLORATION-RESULTS.md`, `SDM-PLANNING-EXPLORATION.md`)
- **Test files:** `<feature>.spec.ts` or `<feature>-<category>.spec.ts` (e.g., `login.spec.ts`, `planning-smoke.spec.ts`)
- **Helpers:** `<feature>.ts` (e.g., `planning.ts`, `auth.ts`)
- **HTML artifacts:** `<project>-<page>.html` (e.g., `bsc-planning-page.html`)

### Cleanup Rules

- Delete temporary exploration scripts (`explore-*.ts`, `debug-*.ts`, `switch-*.ts`, `find-*.ts`) after use
- Move any generated HTML files to `docs/` folder
- Remove Windows reserved filenames (`nul`, `con`, etc.)
- Never commit generated test results or screenshots to git
- Commit incrementally with logical groupings

## MCP Server

Single server: `@playwright/mcp` (configured in `.vscode/mcp.json`).
```json
{
  "servers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Uses snapshot mode (accessibility tree) by default. Supports headed + headless modes.

## Playwright Config

Defined in `playwright.config.ts`:
- `testDir: './projects'` — root for all tests
- `timeout: 30_000` — per-test timeout
- `retries: 0` — no retries (fail fast)
- Reporter: HTML (to `results/html`) + list
- Screenshots: only on failure
- Trace: retain on failure
- Each project entry specifies `baseURL`

Current projects:
- `sample-project` — `https://example.com`

## When Writing Tests — Rules

1. **Every test needs at least one `expect()` assertion**
2. **No `page.waitForTimeout()`** — use Playwright auto-waiting, `waitForSelector`, or `waitForLoadState`
3. **Each test is independent** — no shared mutable state between tests
4. **Use `createLoginHelper`** for auth flows
5. **Use `createTestUser` / `uniqueEmail`** for unique test data
6. **Tests must be individually runnable**: `npx playwright test <path-to-spec>`
7. **Follow locator strategy** from `prompts/locator-strategy.md` strictly

## Environment Variables

- `BASE_URL` — fallback for project baseURL (see `.env.example`)
- `TEST_USER` / `TEST_PASS` — credentials for login helpers
- Per-project env files: `.env.<environment>` (e.g., `.env.staging`)

## Adding a New Project

1. Create folder: `projects/<name>/smoke/`, `projects/<name>/api/`, `projects/<name>/regression/`
2. Add project entry in `playwright.config.ts` with `name` and `baseURL`
3. Create `.env.<environment>` with `BASE_URL=https://...`
4. Explore the app: say "explore `<url>`"
5. Generate smoke tests: say "generate tests for `<name>` smoke `<url>`"
6. Run and verify: `npm test -- --project=<name>`

## Shared Utilities Reference

### `shared/helpers/auth.ts`

```typescript
interface LoginConfig {
  loginUrl: string;
  usernameSelector: string;
  passwordSelector: string;
  submitSelector: string;
  credentials: { username: string; password: string };
  successSelector?: string;
}

function createLoginHelper(config: LoginConfig): (page: Page) => Promise<void>
```

**Usage:**
```typescript
const login = createLoginHelper({
  loginUrl: '/Account/Login',
  usernameSelector: '[name="Input.Email"]',
  passwordSelector: '[name="Input.Password"]',
  submitSelector: 'button[type="submit"]:has-text("Log-in")',
  credentials: {
    username: process.env.TEST_USER || 'user@test.com',
    password: process.env.TEST_PASS || 'password',
  },
});

await login(page);
```

### `shared/helpers/planning.ts`

BSC-QAS Planning module utilities:

```typescript
async function loginAsOwner(page: Page): Promise<void>
async function navigateToPlanning(page: Page): Promise<void>
async function applyPlanningFilter(page: Page, options): Promise<void>
async function getCurrentPageNumber(page: Page): Promise<number>
async function getTotalItemCount(page: Page): Promise<number>
async function goToPage(page: Page, pageNumber: number): Promise<void>
async function setItemsPerPage(page: Page, count: number): Promise<void>
async function exportDevMonitoringPlan(page: Page): Promise<void>
async function verifyPlanningTableStructure(page: Page): Promise<boolean>
```

### `shared/fixtures/test-data.ts`

```typescript
function uniqueEmail(prefix: string): string
function uniqueUsername(prefix: string): string
function createTestUser(overrides?: Partial<TestUser>): TestUser
```

## Troubleshooting

- **Tests timeout**: Check `baseURL` in config, verify network connectivity
- **MCP server not connecting**: Run `npx playwright install` to ensure browsers are available
- **Locator fails**: Check if selector uses dynamic ID — replace with `getByRole`/`getByLabel`
- **Auth wall on explore**: Note login form selectors, suggest `createLoginHelper` config
- **Import resolution error**: Verify `tsconfig.json` has correct `paths` for `@shared/*`
- **Blazor app snapshot fails**: Wait for Blazor to hydrate (`await page.waitForTimeout(3000)`) before taking snapshot
- **Dynamic Blazor IDs**: Blazor generates IDs like `#g8dBbA5v8k` — never use these; prefer `getByRole`/`getByLabel`/`getByText`
