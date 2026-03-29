Walk the user through setting up and using this QA toolkit step by step. Be interactive — do each step with them, confirm it works, then move to the next.

## Step 1: Check Prerequisites

Verify the environment is ready:
- Node.js v18+ is installed (`node --version`)
- npm dependencies are installed (`ls node_modules/.package-lock.json` or run `npm install`)
- Playwright browsers are installed (`npx playwright --version` or run `npx playwright install`)

If anything is missing, help them install it before continuing.

## Step 2: Choose a Project

Ask the user: **What web app do you want to test?** They need:
- A name for the project (e.g., `my-app`)
- A URL to the staging/dev environment (e.g., `https://staging.myapp.com`)

## Step 3: Scaffold the Project

Create the project folder structure:
```
projects/<project-name>/
├── smoke/
├── api/
└── regression/
```

Create an `.env.staging` file with their `BASE_URL`.

## Step 4: Register in Playwright Config

Add a new project entry in `playwright.config.ts` with their project name and base URL.

## Step 5: Explore the App

Run the explore workflow using the @playwright/mcp browser tools:
- Navigate to their URL
- Take a `browser_snapshot` to map the page
- Identify testable areas, forms, flows, and accessibility gaps
- Present a summary of what was found

Before starting, read `prompts/explore-instructions.md` and `prompts/locator-strategy.md` for the full process.

## Step 6: Generate Tests

Based on what was found in Step 5, generate test files:
- Start with smoke tests (quick sanity checks)
- Place them in `projects/<project-name>/smoke/`
- Follow the conventions in `prompts/generate-instructions.md`
- Use the locator strategy from `prompts/locator-strategy.md`

## Step 7: Run and Verify

Run the generated tests:
```bash
npx playwright test --project=<project-name>
```

If any tests fail, help debug and fix them. Show the user how to view the HTML report with `npm run report`.

## Step 8: Next Steps

Explain what they can do from here:
- Add more tests: `/generate <project> regression <url>` for full flows
- Re-explore after app changes: `/explore <url>`
- Run specific categories: `npm run test:smoke`, `npm run test:regression`
- Add another project: run `/start` again

## Rules

- Be conversational — guide, don't dump
- Do one step at a time, confirm it works before moving on
- If something fails, help fix it before continuing
- Use the actual project name and URL they provide throughout
