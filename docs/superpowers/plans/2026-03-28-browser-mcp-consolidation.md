# Browser MCP Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate 3 MCP servers into one (`@playwright/mcp`), add prompt templates and Claude Code slash commands for two workflow modes (explore + generate).

**Architecture:** Single `@playwright/mcp` server with snapshot mode as default. Prompt templates in `prompts/` define the explore and generate workflows. Claude Code slash commands in `.claude/commands/` wrap the prompts for quick invocation. README updated with usage guide for all editors.

**Tech Stack:** `@playwright/mcp`, Playwright Test, Claude Code custom commands, Markdown prompt templates

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `.vscode/mcp.json` | Reduce to single MCP server |
| Create | `prompts/locator-strategy.md` | Selector priority rules, rejection patterns, examples |
| Create | `prompts/explore-instructions.md` | Exploration mode behavior |
| Create | `prompts/generate-instructions.md` | Test generation conventions |
| Create | `.claude/commands/explore.md` | Slash command wrapping explore prompt |
| Create | `.claude/commands/generate.md` | Slash command wrapping generate prompt |
| Modify | `README.md` | Add usage guide for Claude Code + other editors |

---

## Chunk 1: MCP Server Consolidation

### Task 1: Reduce `.vscode/mcp.json` to single server

**Files:**
- Modify: `.vscode/mcp.json`

- [ ] **Step 1: Replace the 3-server config with single `@playwright/mcp` entry**

Replace the entire contents of `.vscode/mcp.json` with:

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

This removes `executeautomation-playwright` and `playwriter`. The server name stays `playwright` for consistency.

- [ ] **Step 2: Verify the MCP server starts**

Run:
```bash
npx -y @playwright/mcp@latest --help
```

Expected: Help output listing available flags like `--headless`, `--browser`, `--caps`, etc. This confirms the package is installable and runnable.

- [ ] **Step 3: Commit**

```bash
git add .vscode/mcp.json
git commit -m "refactor: consolidate to single @playwright/mcp server"
```

---

## Chunk 2: Prompt Templates

### Task 2: Create locator strategy prompt

**Files:**
- Create: `prompts/locator-strategy.md`

- [ ] **Step 1: Create `prompts/locator-strategy.md`**

```markdown
# Locator Strategy

When writing or reviewing Playwright locators, follow this priority order. Always use the highest-priority locator that uniquely identifies the element.

## Priority Chain

| Priority | Method | When to use | Example |
|----------|--------|-------------|---------|
| 1st | `getByRole` | Element has an ARIA role + accessible name | `page.getByRole('button', { name: 'Save' })` |
| 2nd | `getByLabel` | Form input with associated `<label>` | `page.getByLabel('Email address')` |
| 3rd | `getByPlaceholder` | Input with placeholder text, no label | `page.getByPlaceholder('Search...')` |
| 4th | `getByTestId` | Element has a `data-testid` attribute | `page.getByTestId('submit-btn')` |
| 5th | Stable CSS | Semantic class or structural selector | `page.locator('.login-form > button')` |
| 6th | `getByText` | Visible static text (last resort for interactive elements) | `page.getByText('Welcome back')` |

## Rejection Rules

NEVER use locators that contain:
- Hex strings 6+ characters: `#input-7f3a2b`, `[id="el-a1b2c3d4"]`
- UUIDs: `#550e8400-e29b-41d4-a716-446655440000`
- Framework-generated attributes: `data-v-*`, `data-reactid`, `_ngcontent-*`, `_nghost-*`
- Sequential/random IDs: `#radix-12`, `#headlessui-menu-button-3`
- Hash-based class names: `.css-1a2b3c`, `.sc-bdVTJa`

Regex to detect dynamic IDs: `/[a-f0-9]{6,}|[0-9]{4,}|uuid|radix-|headlessui-/i`

## When No Stable Locator Exists

If an element cannot be uniquely identified by any of the above:

1. **Do not guess** a brittle selector
2. **Flag it** in the test with a comment: `// TODO: needs data-testid — element has no accessible name or stable selector`
3. **Suggest to the team** that the element needs a `data-testid` attribute or better accessibility markup

## Good vs Bad Examples

**Good:**
```typescript
// Role-based — resilient to styling and DOM changes
await page.getByRole('button', { name: 'Submit application' }).click();

// Label-based — tied to visible text users see
await page.getByLabel('Email').fill('user@test.com');

// Test ID — explicit contract between dev and QA
await page.getByTestId('checkout-total').toContainText('$99');
```

**Bad:**
```typescript
// Dynamic ID — breaks on next build
await page.locator('#input-7f3a2b').click();

// Framework-generated attribute — not stable
await page.locator('[data-v-4e8c91]').fill('user@test.com');

// Hash class — generated by CSS-in-JS, changes on rebuild
await page.locator('.css-1a2b3c').toContainText('$99');

// Overly specific DOM path — breaks on any layout change
await page.locator('div > div:nth-child(3) > form > div:nth-child(2) > input').fill('test');
```
```

- [ ] **Step 2: Commit**

```bash
git add prompts/locator-strategy.md
git commit -m "docs: add locator strategy prompt template"
```

### Task 3: Create explore instructions prompt

**Files:**
- Create: `prompts/explore-instructions.md`

- [ ] **Step 1: Create `prompts/explore-instructions.md`**

```markdown
# Explore Mode Instructions

You are a QA engineer exploring a web application to identify testable areas. Use the `@playwright/mcp` browser tools in snapshot mode.

## Target

Explore: {{URL}}

## Process

1. **Navigate** to the target URL using `browser_navigate`
2. **Snapshot** the page using `browser_snapshot` to get the accessibility tree
3. **Identify and list** all interactive elements: buttons, links, forms, inputs, dropdowns, modals
4. **Follow key user flows** — click through primary navigation, open menus, expand sections
5. **Snapshot each new state** to map the application
6. **Check for auth requirements** — if a login wall appears, note the login form selectors

## What to Look For

- **Critical user flows**: Sign up, login, checkout, form submissions, CRUD operations
- **Navigation structure**: Main nav, sidebar, breadcrumbs, footer links
- **Forms and inputs**: All input fields, their labels (or lack of), validation behavior
- **Dynamic content**: Modals, drawers, tabs, accordions, infinite scroll
- **API calls**: Note any XHR/fetch requests visible in network activity
- **Accessibility gaps**: Unlabeled inputs, buttons with no text, images with no alt text

## Output Format

Provide a structured summary:

### Page: [URL]

**Auth required:** Yes/No (if yes, describe the login form and suggest `createLoginHelper` config)

**Critical Flows:**
- [Flow name] — [steps involved]

**Forms & Inputs:**
- [Form name] — [fields, submit button, validation notes]

**Navigation:**
- [Nav element] — [where it leads]

**Accessibility Issues:**
- [Element] — [what's missing]

**Recommended Test Categories:**
- Smoke: [what to cover]
- Regression: [what to cover]
- API: [endpoints to test]

## Rules

- Use `browser_snapshot` (accessibility tree), not screenshots, as your primary exploration tool
- Follow the locator strategy in `prompts/locator-strategy.md` when noting selectors
- Do not generate test code — that is the generate mode's job
- If you encounter an auth wall, stop and report the login form details
```

- [ ] **Step 2: Commit**

```bash
git add prompts/explore-instructions.md
git commit -m "docs: add explore mode prompt template"
```

### Task 4: Create generate instructions prompt

**Files:**
- Create: `prompts/generate-instructions.md`

- [ ] **Step 1: Create `prompts/generate-instructions.md`**

```markdown
# Generate Mode Instructions

You are a QA engineer generating Playwright test files for a web application. Use the `@playwright/mcp` browser tools to interact with the app and produce `.spec.ts` files.

## Target

- **URL:** {{URL}}
- **Project:** {{PROJECT}}
- **Category:** {{CATEGORY}} (smoke | api | regression)

## Process

1. **Navigate** to the target URL using `browser_navigate`
2. **Snapshot** the page using `browser_snapshot` to understand the structure
3. **Identify testable interactions** based on the category:
   - **smoke**: Page loads, key elements visible, primary navigation works, no console errors
   - **api**: HTTP endpoints respond correctly, status codes, response shapes, headers
   - **regression**: Full user flows, form validation, edge cases, error states
4. **Interact** with the app using MCP tools (`browser_click`, `browser_fill`, etc.) to verify the flows work
5. **Use `browser_generate_locator`** to get Playwright-compatible locators for elements
6. **Write the test file** following the conventions below

## Test File Conventions

**File path:** `projects/{{PROJECT}}/{{CATEGORY}}/{{feature}}.spec.ts`

**Imports:**
```typescript
import { test, expect } from '@playwright/test';

// Only import if the test needs authentication:
import { createLoginHelper } from '@shared/helpers/auth';

// Only import if the test needs unique data:
import { createTestUser, uniqueEmail } from '@shared/fixtures/test-data';
```

**Test structure:**
```typescript
test.describe('Feature Name', () => {
  test('should do specific thing', async ({ page }) => {
    await page.goto('/path');
    // Use locators following prompts/locator-strategy.md
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
```

**Auth helper usage** (when login is required):
```typescript
const login = createLoginHelper({
  loginUrl: '/login',
  usernameSelector: '#email',       // Use the actual selectors from exploration
  passwordSelector: '#password',
  submitSelector: 'button[type="submit"]',
  credentials: {
    username: process.env.TEST_USER || 'user@test.com',
    password: process.env.TEST_PASS || 'password',
  },
  successSelector: '.dashboard',
});

test.beforeEach(async ({ page }) => {
  await login(page);
});
```

**Test data usage** (when unique data is needed):
```typescript
test('should create account', async ({ page }) => {
  const user = createTestUser();
  await page.goto('/signup');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Username').fill(user.username);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign up' }).click();
});
```

## Locator Rules

Follow `prompts/locator-strategy.md` strictly:
- Prefer `getByRole` > `getByLabel` > `getByPlaceholder` > `getByTestId` > stable CSS > `getByText`
- NEVER use dynamic IDs, framework-generated attributes, or hash-based class names
- If no stable locator exists, add a `// TODO: needs data-testid` comment and use the best available option

## Quality Checks

Before outputting the test file:
1. Every test has at least one `expect()` assertion
2. No hardcoded waits (`page.waitForTimeout`) — use `waitForSelector`, `waitForLoadState`, or Playwright auto-waiting
3. Each test is independent — no shared mutable state between tests
4. File can run with `npx playwright test projects/{{PROJECT}}/{{CATEGORY}}/{{feature}}.spec.ts`
```

- [ ] **Step 2: Commit**

```bash
git add prompts/generate-instructions.md
git commit -m "docs: add generate mode prompt template"
```

---

## Chunk 3: Claude Code Slash Commands

### Task 5: Create `/explore` slash command

**Files:**
- Create: `.claude/commands/explore.md`

- [ ] **Step 1: Create `.claude/commands/explore.md`**

```markdown
Use the @playwright/mcp browser tools to explore a web application and identify testable areas.

Target URL: $ARGUMENTS

## Instructions

Follow the exploration process from `prompts/explore-instructions.md`:

1. Navigate to the target URL using `browser_navigate`
2. Take a `browser_snapshot` to get the accessibility tree
3. Identify all interactive elements, user flows, forms, and navigation
4. Follow key user flows by clicking through the app
5. Snapshot each new state
6. Check for auth requirements

## Locator Strategy

When noting selectors, follow `prompts/locator-strategy.md`:
- Prefer: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByTestId` > stable CSS
- Reject: dynamic IDs (`/[a-f0-9]{6,}/`), UUIDs, `data-v-*`, `data-reactid`, `ng-*`
- Flag elements with no stable locator and suggest `data-testid`

## Output

Provide a structured summary with:
- Auth requirements (with `createLoginHelper` config if needed)
- Critical user flows
- Forms and inputs
- Navigation structure
- Accessibility issues
- Recommended test categories (smoke, regression, API)
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/explore.md
git commit -m "feat: add /explore slash command for Claude Code"
```

### Task 6: Create `/generate` slash command

**Files:**
- Create: `.claude/commands/generate.md`

- [ ] **Step 1: Create `.claude/commands/generate.md`**

The `$ARGUMENTS` format is: `<project> <category> <url>`

```markdown
Use the @playwright/mcp browser tools to generate Playwright test files for a web application.

Arguments: $ARGUMENTS

Parse the arguments as: `<project> <category> <url>`
- **project**: folder name under `projects/` (e.g., `my-app`)
- **category**: `smoke`, `api`, or `regression`
- **url**: the target URL to test

## Instructions

Follow the generation process from `prompts/generate-instructions.md`:

1. Navigate to the target URL
2. Snapshot the page to understand structure
3. Identify testable interactions based on the category
4. Interact with the app to verify flows work
5. Use `browser_generate_locator` for Playwright-compatible locators
6. Write `.spec.ts` files to `projects/<project>/<category>/`

## Locator Strategy

Follow `prompts/locator-strategy.md` strictly:
- Prefer: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByTestId` > stable CSS
- NEVER use dynamic IDs, framework attributes, or hash classes
- Flag elements needing `data-testid` with a TODO comment

## Test Conventions

- Import from `@playwright/test`
- Use `@shared/helpers/auth` for login flows (with `createLoginHelper`)
- Use `@shared/fixtures/test-data` for unique test data (with `createTestUser`, `uniqueEmail`)
- Every test must have at least one `expect()` assertion
- No `page.waitForTimeout()` — use Playwright auto-waiting
- Each test must be independent and runnable alone
- Name files as `<feature>.spec.ts`

## Output

Write the test file(s) to `projects/<project>/<category>/`. After writing, run:
```
npx playwright test projects/<project>/<category>/<file>.spec.ts
```
Report results and fix any issues.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/generate.md
git commit -m "feat: add /generate slash command for Claude Code"
```

---

## Chunk 4: README Usage Guide

### Task 7: Update README with usage guide

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the "How It Works" section and add usage guide**

In `README.md`, replace the existing "How It Works" section (the 3-MCP table) with:

```markdown
## How It Works

This toolkit uses a single MCP server — [`@playwright/mcp`](https://github.com/nickshanks347/mcp-playwright) — to power two workflow modes:

| Mode | Purpose | Output |
|------|---------|--------|
| **Explore** | Investigate a new app or feature interactively | Summary of testable areas, accessibility gaps, user flows |
| **Generate** | Produce test files for known features | `.spec.ts` files ready to run |

Both modes use the accessibility tree (not DOM selectors) for reliable element identification. See `prompts/locator-strategy.md` for the full selector rulebook.
```

- [ ] **Step 2: Add "Usage" section after "Running Tests"**

Add this section to `README.md` after the "Running Tests" section:

```markdown
## Usage

### Claude Code (recommended for individual use)

If you have Claude Code installed, use the built-in slash commands:

```bash
# Explore a page — discover what's testable
/explore https://staging.myapp.com/dashboard

# Generate smoke tests for a project
/generate my-project smoke https://staging.myapp.com/dashboard

# Generate regression tests
/generate my-project regression https://staging.myapp.com/checkout
```

### VS Code, Cursor, Cline, or other MCP-compatible editors

1. **Connect the MCP server.** The config is already in `.vscode/mcp.json`. For other editors, add:
   ```json
   {
     "command": "npx",
     "args": ["-y", "@playwright/mcp@latest"]
   }
   ```

2. **Open the relevant prompt template** from `prompts/`:
   - `prompts/explore-instructions.md` — for exploration
   - `prompts/generate-instructions.md` — for test generation
   - `prompts/locator-strategy.md` — selector rules (referenced by both)

3. **Paste the prompt** into your AI chat, replacing `{{URL}}`, `{{PROJECT}}`, and `{{CATEGORY}}` with your values.

### Prompt Templates

| File | Purpose |
|------|---------|
| `prompts/explore-instructions.md` | How to explore an app and report findings |
| `prompts/generate-instructions.md` | How to generate `.spec.ts` files following project conventions |
| `prompts/locator-strategy.md` | Selector priority rules — shared by both modes |
```

- [ ] **Step 3: Remove the old 3-MCP reference in the project structure diagram**

In the README project structure section, remove the `.vscode/mcp.json` comment that says `# MCP server definitions` and update it to:

```
├── .vscode/mcp.json              # Playwright MCP server config
├── .claude/commands/              # Claude Code slash commands
│   ├── explore.md                 # /explore <url>
│   └── generate.md                # /generate <project> <category> <url>
├── prompts/                       # Prompt templates (works with any editor)
│   ├── locator-strategy.md
│   ├── explore-instructions.md
│   └── generate-instructions.md
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: update README with single-MCP usage guide"
```

---

## Summary

| Chunk | Tasks | What it delivers |
|-------|-------|-----------------|
| 1 | Task 1 | Single MCP server config |
| 2 | Tasks 2-4 | Three prompt templates (locator strategy, explore, generate) |
| 3 | Tasks 5-6 | Two Claude Code slash commands (`/explore`, `/generate`) |
| 4 | Task 7 | Updated README with usage guide for all editors |

**Total: 7 tasks, ~15 steps, 7 commits.**

Each chunk is independently useful — Chunk 1 simplifies immediately, Chunk 2 adds the prompts, Chunk 3 wires them into Claude Code, Chunk 4 documents everything.
