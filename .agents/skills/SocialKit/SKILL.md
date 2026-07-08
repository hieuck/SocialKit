```markdown
# SocialKit Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to contribute effectively to the SocialKit codebase, a TypeScript project organized into packages and apps, with a focus on automation, CLI tools, and a desktop UI. You'll learn the project's coding conventions, commit practices, and the main workflows for adding features, CLI commands, UI panels, automation actions, and launch scripts. This guide also covers testing patterns and provides handy commands for common tasks.

## Coding Conventions

- **File Naming:** Use `camelCase` for files (e.g., `userProfile.ts`, `workflowEngine.ts`).
- **Import Style:** Use relative imports.
  ```ts
  import userService from './userService';
  ```
- **Export Style:** Use default exports.
  ```ts
  export default function doSomething() { ... }
  ```
- **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/), using prefixes like `feat:`, `fix:`, `chore:`, `test:`.

## Workflows

### Feature Implementation with Tests
**Trigger:** When adding a new feature or significant capability  
**Command:** `/new-feature`

1. Implement the new feature logic in the appropriate source file.
   - Example: `packages/social/src/newFeature.ts`
2. Add or update corresponding test files.
   - Example: `packages/social/__tests__/newFeature.test.ts`
3. Update `package.json` or configuration if needed.
4. Commit with a message like:
   ```
   feat: add support for scheduled posts
   ```

**Example:**
```ts
// packages/social/src/scheduledPosts.ts
export default function schedulePost(post, time) {
  // implementation
}
```
```ts
// packages/social/__tests__/scheduledPosts.test.ts
import schedulePost from '../src/scheduledPosts';
test('schedules a post', () => { ... });
```

---

### Add or Extend CLI Command
**Trigger:** When adding or modifying a CLI command or flag  
**Command:** `/new-cli-command`

1. Implement or update CLI logic in `src/cli.ts`, `src/args.ts`, or related files.
2. Add or update command-specific files (e.g., `src/login.ts`).
3. Add or update tests in `__tests__` (e.g., `login.test.ts`).
4. Update CLI entry point if needed (`src/cli-entry.ts`).

**Example:**
```ts
// packages/cli/src/login.ts
export default function login(args) { ... }
```
```ts
// packages/cli/__tests__/login.test.ts
import login from '../src/login';
test('login with valid credentials', () => { ... });
```

---

### Add or Update Desktop UI Panel
**Trigger:** When adding a new UI panel or updating the desktop layout  
**Command:** `/new-desktop-panel`

1. Implement new or updated React component in `src/renderer` (e.g., `TerminalPanel.tsx`).
2. Update `App.tsx` and/or `Layout.tsx` to include the new panel.
3. Add or update corresponding test files in `__tests__`.
4. Update `global.d.ts` or `preload/index.ts` if new IPC/APIs are exposed.

**Example:**
```tsx
// apps/desktop/src/renderer/TerminalPanel.tsx
const TerminalPanel = () => <div>Terminal</div>;
export default TerminalPanel;
```
```tsx
// apps/desktop/__tests__/TerminalPanel.test.tsx
import { render } from '@testing-library/react';
import TerminalPanel from '../src/renderer/TerminalPanel';
test('renders terminal panel', () => { ... });
```

---

### Add or Extend Automation Workflow Engine
**Trigger:** When adding new automation actions, transitions, or workflow types  
**Command:** `/new-automation-action`

1. Implement or update types in `src/task-types.ts` or `src/workflow-types.ts`.
2. Add or update logic in `src/workflow-engine.ts` or `src/workflow-scheduler.ts`.
3. Add or update corresponding test files in `__tests__`.
4. Export new APIs in `src/index.ts` if needed.

**Example:**
```ts
// packages/automation/src/task-types.ts
export type EmailTask = { type: 'email'; ... };
```
```ts
// packages/automation/__tests__/workflowEngine.test.ts
import { runWorkflow } from '../src/workflow-engine';
test('runs email workflow', () => { ... });
```

---

### Batch Script Update for Desktop Launch
**Trigger:** When improving or adding scripts for launching the desktop app  
**Command:** `/update-launch-script`

1. Add or update `.bat` or `.ps1` files at the project root.
2. Adjust build, environment, or launch commands as needed.
3. Test script changes for Windows compatibility.

**Example:**
```bat
:: socialkit-dev.bat
@echo off
cd apps\desktop
npm run dev
```

## Testing Patterns

- **Framework:** [Jest](https://jestjs.io/)
- **Test File Pattern:** `*.test.ts` or `*.test.tsx`
- **Location:** `__tests__` directories adjacent to source
- **Example:**
  ```ts
  // __tests__/feature.test.ts
  import feature from '../src/feature';
  test('does something', () => {
    expect(feature()).toBe(true);
  });
  ```

## Commands

| Command               | Purpose                                         |
|-----------------------|-------------------------------------------------|
| /new-feature          | Start a new feature with tests                  |
| /new-cli-command      | Add or extend a CLI command                     |
| /new-desktop-panel    | Add or update a desktop UI panel                |
| /new-automation-action| Add or extend an automation workflow action     |
| /update-launch-script | Update or add desktop launch scripts            |
```