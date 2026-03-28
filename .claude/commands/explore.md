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
