# Design: `socialkit workflow schedule` CLI Command

## Goal

Add CLI commands to schedule a workflow definition for one-time or recurring execution, list scheduled workflow tasks, and cancel them. This exposes `WorkflowScheduler` to users without requiring them to write TypeScript code.

## User Interface

```bash
# Schedule a workflow to run once at a specific time
socialkit workflow schedule <file> --at <ISO-8601> [--platform <platform>]

# Schedule a workflow to run on a cron expression
socialkit workflow schedule <file> --cron "0 9 * * 1" [--platform <platform>]

# List scheduled workflow tasks
socialkit workflow schedule list

# Cancel a scheduled workflow task
socialkit workflow schedule cancel <taskId>
```

- `<file>` — path to a JSON workflow definition (required for schedule).
- `--at <time>` — ISO-8601 datetime for one-time execution.
- `--cron <expr>` — 5-field cron expression for recurring execution.
- `--platform <platform>` — optional override of the active platform.

Exactly one of `--at` or `--cron` must be provided when scheduling.

### Examples

```bash
socialkit workflow schedule ./workflows/announce.json --at 2026-07-09T09:00:00Z --platform facebook
socialkit workflow schedule ./workflows/weekly-report.json --cron "0 9 * * 1"
socialkit workflow schedule list
socialkit workflow schedule cancel task_1234567890_abcdef
```

### Output

On schedule success:

```
Scheduled: task_1234567890_abcdef
  workflow: announce
  at: 2026-07-09T09:00:00.000Z
```

On list:

```
Scheduled workflows:
  [task_123] workflow announce — pending — at 2026-07-09T09:00:00.000Z
```

On cancel:

```
Cancelled: task_123
```

## Execution Model

The command creates a `WorkflowScheduler` with a `WorkflowEngine` backed by the resolved provider. It calls `scheduleWorkflow` with the parsed `WorkflowDefinition`.

The scheduler is ephemeral: it schedules the task and immediately stops. A separate `daemon` process is responsible for executing tasks when due, just like existing post/comment scheduled tasks.

## Files Changed

- `packages/cli/src/args.ts` — parse `workflow schedule`, `workflow schedule list`, `workflow schedule cancel`, and flags `--at`, `--cron`, `--platform`.
- `packages/cli/src/workflow.ts` — add `scheduleWorkflowCommand(provider, input)` and update exports.
- `packages/cli/src/cli.ts` — wire `schedule` subcommand and update help text.
- `packages/cli/__tests__/workflow.test.ts` — add unit tests for scheduling, listing, cancelling.
- `packages/cli/__tests__/args.test.ts` — add arg parsing tests.
- `packages/cli/__tests__/cli.test.ts` — add integration tests.

## Error Handling

- Missing file → `Error: Workflow file not found: <path>`
- Neither `--at` nor `--cron` → `Error: Specify --at or --cron.`
- Both `--at` and `--cron` → `Error: Specify only one of --at or --cron.`
- Invalid ISO datetime → `Error: Invalid --at value: <value>`
- Invalid cron expression → `Error: Invalid --cron value: <value>` (basic 5-field check)
- No active platform and no `--platform` → `Error: Specify a platform with --platform or log in first.`
- Unknown platform → `Error: Unknown platform: <platform>`
- Cancel missing task id → `Usage: workflow schedule cancel <taskId>`
- Cancel unknown task → `Task not found: <taskId>`

## Testing Strategy

- Unit tests for `scheduleWorkflowCommand` with `MockSocialProvider`.
- Use `jest.useFakeTimers()` to test cron matching and task execution.
- Test validation errors.
- Integration tests through `Cli.run`.

## Out of Scope

- Persisting scheduled workflows across CLI invocations (TaskStore support could be added later).
- Modifying scheduled tasks after creation.
- Daemon command changes (existing daemon already executes scheduled tasks by type).
