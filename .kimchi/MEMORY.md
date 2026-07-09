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
- Full workspace: 224 tests passed
- Build passes for all packages

## 2026-07-08 — Workflow Run CLI Command

### What was built

Added `socialkit workflow run <file> [--platform <platform>]` to `@socialkit/cli`, exposing the `WorkflowEngine` directly from the command line.

### Key files

- `packages/cli/src/workflow.ts` — `workflowCommand` and `WorkflowInput`
- `packages/cli/src/args.ts` — parses `workflow run <file>` and `--platform`
- `packages/cli/src/cli.ts` — wires command into `Cli.run`
- `packages/cli/__tests__/workflow.test.ts` — unit tests
- `packages/cli/__tests__/cli.test.ts` — integration tests

### Usage

```bash
socialkit workflow run ./workflows/announce.json --platform facebook
```

### Decisions

- Kept workflow file validation minimal (`id`, `steps` array with `id` and `action`).
- Execution failures are reported in the CLI output, not thrown, consistent with other CLI commands.
- `--platform` overrides the active session platform.

### Also fixed

- Desktop production build failed because `src/types/window-mock.d.ts` (Jest-only global augmentation) was included in `tsc`. Moved it to `apps/desktop/types/window-mock.d.ts` and included it only in `tsconfig.test.json`.

### Decisions

- Kept workflow engine inside `@socialkit/automation`; it only depends on `@socialkit/core`.
- Reused existing `Scheduler` instead of building a new scheduling layer.
- Condition expressions are evaluated via `new Function(...)` with context variables as parameters; malformed expressions return `false`.
- Template resolver only supports exact `{{...}}` replacements, not inline interpolation.

### Also fixed

- `apps/desktop` was missing `react` and `react-dom` devDependencies; tests failed to resolve `react/jsx-runtime`.
- `TerminalPanel` tests produced `act(...)` warnings because async state updates were not awaited.

## 2026-07-08 — Workflow Schedule CLI Command

### What was built

Added `socialkit workflow schedule`, `workflow schedule list`, and `workflow schedule cancel` commands. Workflows can be scheduled for one-time (`--at`) or recurring (`--cron`) execution using `WorkflowScheduler` with a `TaskStore` persisted next to the session file.

### Key files

- `packages/cli/src/workflow.ts` — `scheduleWorkflowCommand` and `WorkflowScheduleInput`
- `packages/cli/src/cli.ts` — routes schedule/list/cancel subcommands
- `packages/cli/src/session.ts` — exposes `getFilePath()` so the CLI can derive `tasks.json` path
- `packages/automation/src/workflow-scheduler.ts` — accepts `SchedulerOptions` (enables TaskStore)
- `packages/cli/__tests__/workflow.test.ts` and `packages/cli/__tests__/cli.test.ts` — schedule tests

### Decisions

- Schedule/list/cancel share the same `TaskStore` derived from the session file path, so tasks persist across CLI invocations.
- `--at` and `--cron` validation happens before reading the workflow file, giving clearer error messages.
- `WorkflowScheduler` now accepts `SchedulerOptions` to pass a `TaskStore`, keeping the change minimal and backward-compatible.

### Open gaps

- Root `package.json` advertises `pnpm -r lint` but no `lint` script exists in any package.
- No built-in workflow templates yet.
