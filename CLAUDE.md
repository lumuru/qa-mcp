# CLAUDE.md

## Project Overview

QA automation hub for AI-powered end-to-end testing across multiple web projects. Uses Playwright and a single MCP server (`@playwright/mcp`) for browser-driven exploration and test generation.

## Tech Stack

- **TypeScript** (strict mode, ES2022)
- **Playwright Test** — browser automation and test runner
- **`@playwright/mcp`** — single MCP server for all browser interactions

## Project Structure

```
projects/<name>/smoke|api|regression/   — test files per app
shared/helpers/                         — reusable helpers (auth)
shared/fixtures/                        — test data factories
prompts/                                — prompt templates (locator strategy, explore, generate)
.claude/commands/                       — slash commands (/explore, /generate)
```

## Key Conventions

### Path Aliases

Use `@shared/*` for imports from `shared/`:
```typescript
import { createLoginHelper } from '@shared/helpers/auth';
import { createTestUser, uniqueEmail } from '@shared/fixtures/test-data';
```

### Test File Naming

- Place tests in `projects/<project-name>/<category>/<feature>.spec.ts`
- Categories: `smoke/` (quick sanity), `api/` (HTTP-level), `regression/` (full flows)

### Locator Strategy

Follow `prompts/locator-strategy.md` strictly when writing or reviewing test selectors:
- Priority: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByTestId` > stable CSS > `getByText`
- **Never** use dynamic IDs, framework-generated attributes, or hash-based class names
- Flag elements with no stable locator using `// TODO: needs data-testid`

## Commands

```bash
npm test                              # All tests
npm run test:smoke                    # Smoke tests only
npm run test:api                      # API tests only
npm run test:regression               # Regression tests only
npm test -- --project=<name>          # Specific project
npm run report                        # Open HTML report
```

## Slash Commands

- `/explore <url>` — explore a web app and identify testable areas
- `/generate <project> <category> <url>` — generate `.spec.ts` files for a project

## MCP Server

Single server: `@playwright/mcp` (configured in `.vscode/mcp.json`). Uses snapshot mode (accessibility tree) by default. Supports headed + headless modes.

## When Writing Tests

- Every test needs at least one `expect()` assertion
- No `page.waitForTimeout()` — use Playwright auto-waiting
- Each test must be independent — no shared mutable state
- Use `createLoginHelper` for auth flows, `createTestUser` for unique test data
- Tests must be runnable individually: `npx playwright test <path-to-spec>`
