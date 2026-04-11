# QWEN.md — Qwen Code Context for qa-mcp

## Project Overview

QA automation hub for AI-powered end-to-end testing across multiple web projects. Uses Playwright and a single MCP server (`@playwright/mcp`) for browser-driven exploration and test generation.

This is a **multi-project test framework** where each web app gets its own folder under `projects/`, with tests organized by category: `smoke/`, `api/`, and `regression/`.

## Tech Stack

- **TypeScript** (strict mode, ES2022, target ESNext)
- **Playwright Test** (`@playwright/test` v1.58+) — browser automation + test runner
- **`@playwright/mcp`** — single MCP server for all browser interactions (configured in `.vscode/mcp.json`)
- **ts-node / tsx** — TypeScript execution

## Project Structure

```
projects/<name>/smoke|api|regression/   — test files per app, organized by category
shared/helpers/                         — reusable helpers (auth login helper)
shared/fixtures/                        — test data factories (createTestUser, uniqueEmail)
prompts/                                — prompt templates for exploration, generation, locators
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

These are resolved via `tsconfig.json` path mapping.

### Test File Naming

- Place tests in `projects/<project-name>/<category>/<feature>.spec.ts`
- File names are kebab-case, feature-focused: `login.spec.ts`, `dashboard.spec.ts`, `checkout-flow.spec.ts`
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
- Regex to detect: `/[a-f0-9]{6,}|[0-9]{4,}|uuid|radix-|headlessui-/i`

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

Since Qwen Code doesn't have native slash commands, these workflows are triggered by natural language:

| User Says | What I Do |
|-----------|-----------|
| **"start"** or **"setup"** | Run the `/start` workflow — interactive setup wizard |
| **"explore `<url>`"** | Run the `/explore` workflow — navigate, snapshot, map interactive elements |
| **"generate tests for `<project>` `<category>` `<url>`"** | Run the `/generate` workflow — write `.spec.ts` files |
| **"analyze the codebase"** | Run the `/analyze-codebase` workflow — review all source files |

### Explore Workflow

1. Navigate to target URL using Playwright (`page.goto`)
2. Take accessibility snapshot (`page.accessibility.snapshot()`)
3. Identify all interactive elements: buttons, links, forms, inputs, dropdowns, modals
4. Follow key user flows — click through navigation, open menus, expand sections
5. Snapshot each new state
6. Check for auth requirements
7. Output structured summary per `prompts/explore-instructions.md`
8. **Save exploration results to `docs/` folder**

### Generate Workflow

1. Navigate to target URL
2. Snapshot page structure
3. Identify testable interactions based on category (smoke/api/regression)
4. Interact with app to verify flows work
5. Get Playwright-compatible locators
6. Write `.spec.ts` files to `projects/<project>/<category>/`
7. Run tests and fix any failures
8. Follow conventions from `prompts/generate-instructions.md` and `prompts/locator-strategy.md`

## File Organization Rules

### When Exploring a New URL

**Always** organize generated files into their proper folders immediately:

1. **Test files** → `projects/<project-name>/<category>/<feature>.spec.ts`
   - Smoke tests → `projects/<name>/smoke/`
   - API tests → `projects/<name>/api/`
   - Regression tests → `projects/<name>/regression/`

2. **Helpers** → `shared/helpers/<feature>.ts`
   - Reusable utilities for specific modules

3. **Documentation** → `docs/<PROJECT>-<TYPE>.md`
   - Exploration results → `docs/<PROJECT>-EXPLORATION-RESULTS.md`
   - Test summaries → `docs/<PROJECT>-TESTS-SUMMARY.md`
   - Analysis reports → `docs/<PROJECT>-<MODULE>-EXPLORATION.md`

4. **HTML artifacts** → `docs/` folder
   - Page snapshots → `docs/<PROJECT>-<PAGE>.html`
   - Exported reports → `docs/<PROJECT>-<REPORT>.html`

**Never** leave files in the root directory. Clean up temporary scripts after use.

### File Naming Convention

- **Documentation:** `PROJECT-TYPE.md` (e.g., `BSC-EXPLORATION-RESULTS.md`, `SDM-PLANNING-EXPLORATION.md`)
- **Test files:** `<feature>.spec.ts` (e.g., `login.spec.ts`, `planning-smoke.spec.ts`)
- **Helpers:** `<feature>.ts` (e.g., `planning.ts`, `auth.ts`)
- **HTML artifacts:** `<project>-<page>.html` (e.g., `bsc-planning-page.html`)

### Cleanup Rules

- Delete temporary exploration scripts (`explore-*.ts`, `debug-*.ts`) after use
- Move any generated HTML files to `docs/` folder
- Remove Windows reserved filenames (`nul`, `con`, etc.)
- Never commit generated test results or screenshots to git

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

## Playwright Config

Defined in `playwright.config.ts`:
- `testDir: './projects'` — root for all tests
- `timeout: 30_000` — per-test timeout
- `retries: 0` — no retries (fail fast)
- Reporter: HTML (to `results/html`) + list
- Screenshots: only on failure
- Trace: retain on failure
- Each project entry specifies `baseURL`

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
4. Explore the app: "explore `<url>`"
5. Generate smoke tests: "generate tests for `<name>` smoke `<url>`"
6. Run and verify: `npm test -- --project=<name>`

## Troubleshooting

- **Tests timeout**: Check `baseURL` in config, verify network connectivity
- **MCP server not connecting**: Run `npx playwright install` to ensure browsers are available
- **Locator fails**: Check if selector uses dynamic ID — replace with `getByRole`/`getByLabel`
- **Auth wall on explore**: Note login form selectors, suggest `createLoginHelper` config
- **Import resolution error**: Verify `tsconfig.json` has correct `paths` for `@shared/*`
