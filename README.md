# QA MCP Toolkit

Centralized QA automation hub for AI-powered end-to-end testing across multiple web projects. Uses [Playwright](https://playwright.dev/) and three MCP (Model Context Protocol) servers to create a complete explore → generate → run pipeline.

## How It Works

This toolkit uses a single MCP server — `@playwright/mcp` — to power two workflow modes:

| Mode | Purpose | Output |
|------|---------|--------|
| **Explore** | Investigate a new app or feature interactively | Summary of testable areas, accessibility gaps, user flows |
| **Generate** | Produce test files for known features | `.spec.ts` files ready to run |

Both modes use the accessibility tree (not DOM selectors) for reliable element identification. See `prompts/locator-strategy.md` for the full selector rulebook.

## Project Structure

```
qa-mcp/
├── playwright.config.ts          # Multi-project Playwright config
├── .vscode/mcp.json              # Playwright MCP server config
├── .claude/commands/              # Claude Code slash commands
│   ├── explore.md                 # /explore <url>
│   └── generate.md                # /generate <project> <category> <url>
├── prompts/                       # Prompt templates (works with any editor)
│   ├── locator-strategy.md
│   ├── explore-instructions.md
│   └── generate-instructions.md
├── projects/
│   └── sample-project/           # One folder per app under test
│       ├── smoke/                # Quick sanity checks
│       ├── api/                  # API-level tests
│       └── regression/           # Full regression suites
├── shared/
│   ├── helpers/auth.ts           # Reusable login helper
│   └── fixtures/test-data.ts     # Unique test data factory
└── results/html/                 # HTML test reports
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- VS Code with MCP support (for AI-assisted workflows)

### Installation

```bash
npm install
npx playwright install
```

### Configure Your Project

1. Copy the environment template:
   ```bash
   cp .env.example projects/your-project/.env.staging
   ```

2. Set your app's base URL:
   ```
   BASE_URL=https://your-app-staging-url.com
   ```

3. Register the project in `playwright.config.ts`:
   ```ts
   {
     name: 'your-project',
     testDir: './projects/your-project',
     use: {
       baseURL: process.env.BASE_URL || 'https://your-app.com',
     },
   }
   ```

## Running Tests

```bash
npm test                              # All tests
npm run test:smoke                    # Smoke tests only
npm run test:api                      # API tests only
npm run test:regression               # Regression tests only
npm test -- --project=sample-project  # Specific project
npm run report                        # Open HTML report
```

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

## Shared Utilities

### Login Helper

Configurable authentication helper for projects that require login:

```ts
import { createLoginHelper } from '@shared/helpers/auth';

const login = createLoginHelper({
  loginUrl: '/login',
  usernameSelector: '#email',
  passwordSelector: '#password',
  submitSelector: 'button[type="submit"]',
  credentials: { username: 'user@test.com', password: 'pass' },
  successSelector: '.dashboard',
});

// In your test:
await login(page);
```

### Test Data Factory

Generates unique test data to prevent collisions between parallel runs:

```ts
import { uniqueEmail, uniqueUsername, createTestUser } from '@shared/fixtures/test-data';

const email = uniqueEmail('signup');    // signup+1732456789_1@example.com
const user = createTestUser();          // { email, username, password }
```

## Adding a New Project

1. Create a folder under `projects/` with `smoke/`, `api/`, and `regression/` subdirectories
2. Add `.env.staging` and `.env.production` files with `BASE_URL`
3. Add a project entry in `playwright.config.ts`
4. Write tests as `*.spec.ts` files in the appropriate category folder

## Tech Stack

- **TypeScript** — strict mode with `@shared/*` path aliases
- **Playwright Test** — browser automation and test runner
- **MCP Servers** — AI-assisted exploration, generation, and execution

## License

ISC
