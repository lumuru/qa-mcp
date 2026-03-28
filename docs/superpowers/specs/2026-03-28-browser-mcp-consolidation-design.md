# Browser MCP Consolidation Design

**Date:** 2026-03-28
**Status:** Approved
**Approach:** B — Workflow Scripts with single MCP

## Problem

The current 3-MCP setup (Playwriter, ExecuteAutomation, Microsoft Playwright) has too many moving parts with significant overlap. All three can be replaced by `@playwright/mcp` alone, which covers exploration, code generation, and script execution in a single server.

Additionally, the project should be team-friendly — not locked to Claude Code or any specific provider.

## Architecture

### Single MCP Server

Replace the 3-server setup with `@playwright/mcp` only.

**Why this works:**
- `@playwright/mcp` has 59 tools covering navigate, snapshot, click, fill, assert, codegen, and more
- Snapshot mode uses the accessibility tree (not DOM), producing reliable locators by default
- `--codegen` flag generates Playwright TypeScript test code as the LLM interacts with the browser
- Native integration with existing Playwright test infrastructure (same library, same locators, same storage state)

### Two Operational Modes

**Mode 1: Explore (interactive, collaborative)**
- Used when investigating a new feature or unfamiliar app
- Claude drives the browser in headed + snapshot mode
- Output: summary of testable areas, flagged accessibility gaps, prioritized user flows

**Mode 2: Generate (automated, one-shot)**
- Used when producing test files for known features
- Claude interacts with the app via MCP tools, then writes `.spec.ts` files using Playwright's locator patterns
- The prompt template instructs Claude to prefer accessibility-tree locators from `browser_snapshot` and `browser_generate_locator` over raw codegen output
- Output: `.spec.ts` files placed in `projects/<name>/<category>/`
- Applies locator strategy rules to rewrite any brittle selectors

### Locator Strategy

All generated tests must follow this selector priority:

| Priority | Locator Type | Example | Reliability |
|---|---|---|---|
| 1st | Role + name | `getByRole('button', { name: 'Save' })` | High |
| 2nd | Label / placeholder | `getByLabel('Email')` | High |
| 3rd | Test ID | `getByTestId('login-form')` | High (requires dev support) |
| 4th | Stable CSS | `.login-form > button` | Medium |
| 5th | Text content | `getByText('Welcome back')` | Medium |

**Reject:** Any ID matching `/[a-f0-9]{6,}/`, UUIDs, `data-v-*`, `data-reactid`, `ng-*` dynamic attributes. When no stable locator exists, flag the element and suggest a `data-testid` to the user.

## Project Structure

### New files

```
qa-mcp/
├── .claude/commands/              # Claude Code slash commands
│   ├── explore.md                 #   /explore <url>
│   └── generate.md                #   /generate <project> <category> <url>
│
├── prompts/                       # Shared prompt content (provider-agnostic)
│   ├── locator-strategy.md        #   Selector rules (single source of truth)
│   ├── explore-instructions.md    #   Exploration behavior
│   └── generate-instructions.md   #   Generation conventions
```

### Changed files

- `.vscode/mcp.json` — Remove `playwriter` and `executeautomation-playwright`, keep only `@playwright/mcp`
- `package.json` — No new scripts needed (test runner scripts unchanged)
- `README.md` — Add usage guide for both Claude Code users and other editors

### Unchanged

- `projects/` — All existing tests remain as-is
- `shared/` — Auth helper and test data factory unchanged
- `playwright.config.ts` — No changes
- `results/` — Report output unchanged

## Prompt Templates

### `prompts/explore-instructions.md`

Instructions for exploration mode:
- Navigate to the target URL
- Use `browser_snapshot` (accessibility tree) to map each page
- Identify: user flows, interactive elements, forms, navigation patterns, API calls
- Flag elements with poor accessibility (no labels, no roles)
- Output a summary organized by: critical flows, forms/inputs, navigation, API endpoints
- Note any auth requirements and suggest `createLoginHelper` configuration

### `prompts/generate-instructions.md`

Instructions for test generation mode:
- Receive: target URL, project name, test category (smoke/api/regression)
- Use `--codegen` mode to interact with the app and capture Playwright code
- Apply locator strategy from `locator-strategy.md`
- Import shared helpers where applicable:
  - `createLoginHelper` from `@shared/helpers/auth` for auth flows
  - `createTestUser`, `uniqueEmail` from `@shared/fixtures/test-data` for test data
- Follow naming convention: `<feature>.spec.ts`
- Place output in `projects/<project>/<category>/`
- Each test file should be self-contained and runnable independently

### `prompts/locator-strategy.md`

The selector rulebook, shared by both modes:
- Priority chain with examples
- Rejection patterns for dynamic IDs
- Guidance for when no stable locator exists
- Examples of good vs bad locators

## Claude Code Integration

### Slash Commands

`.claude/commands/explore.md`:
- Includes content from `prompts/explore-instructions.md` and `prompts/locator-strategy.md`
- Accepts `$ARGUMENTS` as the target URL
- Usage: `/explore https://staging.myapp.com/dashboard`

`.claude/commands/generate.md`:
- Includes content from `prompts/generate-instructions.md` and `prompts/locator-strategy.md`
- Accepts `$ARGUMENTS` as `<project> <category> <url>`
- Usage: `/generate my-project smoke https://staging.myapp.com/dashboard`

## Team Usage (Provider-Agnostic)

The prompt templates in `prompts/` work with any AI tool that supports MCP:

| Editor / Tool | How to use |
|---|---|
| Claude Code | `/explore <url>` or `/generate <project> <category> <url>` |
| VS Code + Copilot | Connect `@playwright/mcp` via `.vscode/mcp.json`, paste prompt from `prompts/` |
| Cursor | Add MCP server in settings, paste prompt from `prompts/` |
| Cline | Add MCP server in config, paste prompt from `prompts/` |

MCP server config for non-VS Code editors:
```json
{
  "command": "npx",
  "args": ["-y", "@playwright/mcp@latest"]
}
```

## What Gets Removed

- `playwriter` MCP server entry from `.vscode/mcp.json`
- `executeautomation-playwright` MCP server entry from `.vscode/mcp.json`

No code or tests are deleted.

## Success Criteria

1. Single MCP server (`@playwright/mcp`) replaces the 3-server setup
2. `/explore` produces a useful summary of testable areas for any given URL
3. `/generate` produces `.spec.ts` files that:
   - Use stable locators (no dynamic IDs)
   - Import shared helpers where appropriate
   - Land in the correct `projects/<name>/<category>/` directory
   - Pass `npx playwright test` without modification (or with minimal edits)
4. Team members using other editors can follow the prompts to achieve the same results
5. Locator strategy is documented and consistently applied
