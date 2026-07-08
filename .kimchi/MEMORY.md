# SocialKit Project Memory

## 2026-07-08 — Cross-Platform Workflow Engine

### What was built

Added a declarative workflow engine to `@socialkit/automation` that can chain cross-platform actions, share context between steps, branch on conditions, and handle errors via transitions.

### Key files

- `packages/automation/src/workflow-types.ts` — `WorkflowDefinition`, `WorkflowStep`, `WorkflowContext`, `WorkflowExecution`, `ActionType`
- `packages/automation/src/workflow-engine.ts` — `WorkflowEngine` executes steps against a `SocialProvider`
- `packages/automation/src/workflow-scheduler.ts` — `WorkflowScheduler` wraps existing `Scheduler` to trigger workflows
- `packages/automation/src/template-resolver.ts` — resolves `{{var}}` and `{{steps.stepId.key}}` templates
- `packages/automation/src/index.ts` — public API exports

### Built-in actions

`post`, `comment`, `like`, `wait`, `setContext`, `condition`

### Transitions

Steps may declare `onSuccess` and `onFailure` step ids. When a step throws, the engine jumps to `onFailure` if present; otherwise the workflow fails.

### Testing

- 53 tests in `@socialkit/automation` (was 38)
- Full workspace: 218 tests passed
- Build passes for all packages

### Decisions

- Kept workflow engine inside `@socialkit/automation`; it only depends on `@socialkit/core`.
- Reused existing `Scheduler` instead of building a new scheduling layer.
- Condition expressions are evaluated via `new Function(...)` with context variables as parameters; malformed expressions return `false`.
- Template resolver only supports exact `{{...}}` replacements, not inline interpolation.

### Also fixed

- `apps/desktop` was missing `react` and `react-dom` devDependencies; tests failed to resolve `react/jsx-runtime`.
- `TerminalPanel` tests produced `act(...)` warnings because async state updates were not awaited.

### Open gaps

- Root `package.json` advertises `pnpm -r lint` but no `lint` script exists in any package.
- No CLI command exposes workflow execution yet (could add `workflow run` in a follow-up).
