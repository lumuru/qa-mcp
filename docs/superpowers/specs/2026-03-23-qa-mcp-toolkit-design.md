# QA MCP Toolkit Design Spec

## Overview

A central QA automation hub powered by 3 MCP servers in VS Code, enabling a full end-to-end AI-powered QA pipeline: exploratory testing, test generation, and headless automation across multiple projects.

## Context

- **User:** QA engineer testing a mix of SPAs and traditional web apps
- **Client:** VS Code (1.99+ with MCP support)
- **Auth:** Most apps require login (SSO/OAuth/MFA)
- **Test tracking:** Currently spreadsheets/docs (no TMS)
- **Goal:** Full automation pipeline — test generation, execution, reporting, regression detection

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    VS CODE                           │
│               (MCP Client / IDE)                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Playwriter   │  │ ExecuteAuto  │  │ Microsoft  │  │
│  │ (remorses)   │  │ mation MCP   │  │ Playwright │  │
│  │              │  │              │  │ MCP        │  │
│  │ Real Chrome  │  │ Code Gen +   │  │ Headless   │  │
│  │ with auth    │  │ API Testing  │  │ Automation │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                 │                │         │
└─────────┼─────────────────┼────────────────┼─────────┘
          ▼                 ▼                ▼
   Real Chrome        .spec.ts files    CI/CD Pipeline
   (logged in)        + API tests       (headless runs)
```

### MCP Roles

| MCP | Purpose | Token Cost |
|-----|---------|-----------|
| Playwriter (remorses) | Exploratory testing using real Chrome with existing auth sessions | Per session |
| ExecuteAutomation MCP | Generate Playwright test scripts (.spec.ts) + API tests from natural language | One-time per test |
| Microsoft Playwright MCP | Headless browser automation for smoke tests, regression, CI/CD | Per session |

### Flow

1. **Explore & discover** — Playwriter navigates auth-heavy apps in your real browser, finds bugs, validates flows
2. **Generate tests** — ExecuteAutomation MCP converts findings into Playwright test scripts + API tests
3. **Automate & run** — Microsoft Playwright MCP runs headless in CI/CD pipelines

## MCP Configuration

### `.vscode/mcp.json`

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

### Prerequisites

- VS Code 1.99+ with MCP support enabled
- GitHub Copilot Chat extension with `chat.mcp.enabled: true`, OR Claude for VS Code extension
- Node.js installed (for npx)
- Playwright browsers installed: `npx playwright install chromium`
- Playwriter Chrome extension installed from Chrome Web Store

## Project Structure

```
qa-mcp/
├── .vscode/
│   └── mcp.json                 ← All 3 MCPs configured here
├── package.json
├── playwright.config.ts         ← Multi-project Playwright config
├── projects/
│   ├── project-alpha/
│   │   ├── .env.staging         ← Environment-specific URLs, credentials
│   │   ├── .env.production
│   │   ├── smoke/               ← Smoke test specs
│   │   ├── regression/          ← Full regression specs
│   │   └── api/                 ← API test specs
│   ├── project-beta/
│   │   ├── .env.staging
│   │   ├── smoke/
│   │   ├── regression/
│   │   └── api/
│   └── ...                      ← More projects as needed
├── shared/
│   ├── helpers/
│   │   └── auth.ts              ← Reusable login flows per project
│   └── fixtures/                ← Shared test data
├── results/
│   ├── project-alpha/           ← HTML/JSON reports
│   └── project-beta/
└── docs/
    └── superpowers/
        └── specs/
```

## Multi-Project Configuration

### playwright.config.ts

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'project-alpha',
      testDir: './projects/project-alpha',
      use: { baseURL: 'https://staging.alpha.com' },
    },
    {
      name: 'project-beta',
      testDir: './projects/project-beta',
      use: { baseURL: 'https://staging.beta.com' },
    },
  ],
  reporter: [
    ['html', { outputFolder: 'results/html' }],
  ],
});
```

### Running tests

```bash
# Run smoke tests for a specific project
npx playwright test --project=project-alpha smoke/

# Run all projects
npx playwright test

# Run with HTML report
npx playwright test --reporter=html
```

## Token-Saving Strategy

AI tokens are consumed only when generating new tests or doing exploratory testing. All generated `.spec.ts` files run directly via Playwright CLI with zero token cost.

| Activity | Token Cost |
|----------|-----------|
| Exploratory testing with Playwriter | Per session |
| Generating NEW test scripts via ExecuteAutomation | One-time |
| Debugging/fixing failing tests with AI | Per session |
| Running existing .spec.ts files | Zero |
| Rerunning smoke/regression suites | Zero |
| Viewing HTML/JSON reports | Zero |
| CI/CD pipeline executions | Zero |

## Daily Workflow

| Time | Activity | MCP Used |
|------|----------|----------|
| Morning | Explore new features on staging with real browser | Playwriter |
| Mid-day | Convert discovered test cases into automated scripts | ExecuteAutomation |
| Afternoon | Run headless checks, verify fixes, smoke test | Microsoft Playwright |
| Before release | Full regression suite in CI/CD | Microsoft Playwright (headless) |

## Error Handling

### Auth session expiry
- Shared login helper in `shared/helpers/auth.ts` — each project defines its login flow once
- Playwriter supports human-in-the-loop: prompts you to re-login and waits

### Flaky selectors
- Review AI-generated `.spec.ts` files before committing
- Replace brittle selectors with `data-testid` or role-based locators
- Microsoft Playwright MCP uses accessibility tree, producing more stable selectors

### Environment configs
- Each project has `.env.staging` and `.env.production` for different URLs and credentials
- `.env` files are gitignored

### MCP server crashes
- Each MCP runs as an independent process — one crashing doesn't affect the others
- VS Code shows MCP status and allows restarting individual servers

## Excluded (By Design)

- No TMS integration — spreadsheets/docs workflow, tests in code replace need over time
- No accessibility testing MCPs — not a priority currently (can add later: mcp-accessibility-scanner, a11y-mcp)
- No cloud browser service — local-first approach
- No visual regression — can add mcp-image-compare later if needed

## Future Additions (When Needed)

- **mcp-accessibility-scanner** — WCAG compliance testing
- **mcp-image-compare** — Visual regression / screenshot comparison
- **QA Sphere or Testomat.io MCP** — If a TMS is adopted
- **Browserbase MCP** — If cloud-based browser sessions become needed
