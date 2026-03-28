Do an in-depth analysis of this codebase, and then update our CLAUDE.md file. The end goal is to have it as detailed as possible — likely around 1000 lines if needed. Anything to make sure we cover everything, and make it easy for us to add features in the future while keeping it bug-free and following existing conventions.

## Analysis Process

1. **Read every source file** (not node_modules) — understand the full codebase
2. **Map the architecture** — how modules connect, data flows, entry points
3. **Identify all conventions** — naming, file structure, import patterns, test patterns
4. **Catalog shared utilities** — every helper, fixture, type, and how they're used
5. **Document configuration** — tsconfig, playwright config, MCP config, environment variables
6. **Review existing tests** — patterns, assertions, organization
7. **Check for implicit rules** — things a new contributor would get wrong

## What to Include in CLAUDE.md

Structure the file with these sections (expand each as needed):

### Project Overview
- What this project does, who it's for, how it fits into the team's workflow

### Tech Stack & Dependencies
- Every dependency and why it's there
- Version constraints that matter

### Architecture
- Directory structure with explanations (not just a tree — explain WHY things are where they are)
- Module boundaries and responsibilities
- How data flows between modules

### Conventions & Patterns
- File naming conventions (with examples)
- Import patterns and path aliases
- TypeScript patterns (strict mode rules, type preferences)
- Test file conventions (describe blocks, assertion patterns, setup/teardown)
- Locator strategy (reference prompts/locator-strategy.md)
- Git commit message format (check git log for patterns)

### Shared Utilities Reference
- Every exported function/type from shared/ with:
  - Signature
  - What it does
  - When to use it
  - Example usage

### Configuration Reference
- Every config file, what it controls, and what each option does
- Environment variables (required vs optional, defaults)
- MCP server configuration

### Slash Commands & Prompts
- Every slash command with usage examples
- Every prompt template with its purpose
- How they relate to each other

### Adding New Features
- Step-by-step guide for adding a new project
- Step-by-step guide for adding a new test category
- Step-by-step guide for adding a new shared utility
- Step-by-step guide for adding a new slash command

### Testing Guide
- How to run tests (all commands)
- How to write tests that follow existing patterns
- Common pitfalls and how to avoid them
- Debugging failed tests

### Troubleshooting
- Common errors and their fixes
- MCP server issues
- Environment setup problems

## Rules

- Be exhaustive — when in doubt, include it
- Use code examples from the actual codebase, not hypothetical ones
- Cross-reference between sections where relevant
- Keep it maintainable — organize so sections can be updated independently
- Write for a developer who has never seen this codebase before
