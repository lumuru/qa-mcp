# QA MCP Toolkit

Centralized QA automation hub for AI-powered end-to-end testing across multiple web projects. Uses [Playwright](https://playwright.dev/) and three MCP (Model Context Protocol) servers to create a complete explore → generate → run pipeline.

## How It Works

| Phase | MCP Server | What It Does |
|-------|-----------|--------------|
| **Explore** | [Playwriter](https://github.com/Playwriter-MCP/playwriter) | Browse real Chrome with active auth sessions to discover features |
| **Generate** | [ExecuteAutomation](https://github.com/nickshanks347/executeautomation-playwright-mcp-server) | Convert natural-language descriptions into `.spec.ts` test files |
| **Run** | [Microsoft Playwright](https://github.com/nickshanks347/mcp-playwright) | Execute tests headlessly for CI/CD |

## Project Structure

```
qa-mcp/
├── playwright.config.ts          # Multi-project Playwright config
├── .vscode/mcp.json              # MCP server definitions
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
