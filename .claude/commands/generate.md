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
