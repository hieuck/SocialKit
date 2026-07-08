# Cross-Platform Workflow Engine — Design Spec

> **Goal:** Extend `@socialkit/automation` from single-task scheduling into a minimal, testable workflow engine that can chain cross-platform actions (post → wait → comment → like) with shared context, conditional branching, and scheduled triggers.

---

## 1. Background

Current state:

- `Scheduler` schedules one-shot or cron `ScheduledTask` objects.
- `AutomationEngine` exposes `schedulePost`, `scheduleComment`, `scheduleLike`.
- `AutoExecutor` maps a single task type to one `SocialProvider` method call.

Gap: There is no way to express multi-step operations such as *"publish a Facebook post, wait 5 minutes, then cross-post the same message to Instagram"*.

## 2. Design Overview

Introduce three new concepts in `@socialkit/automation`:

1. **`WorkflowDefinition`** — a declarative graph of steps.
2. **`WorkflowContext`** — mutable state passed between steps.
3. **`WorkflowEngine`** — executes definitions step-by-step, handling transitions, errors, and provider calls.

The existing `Scheduler` and `AutomationEngine` remain unchanged. The workflow engine is an additional layer that can optionally be driven by scheduled tasks.

## 3. Data Model

### 3.1 WorkflowDefinition

```typescript
interface WorkflowDefinition {
  id: string
  name: string
  steps: WorkflowStep[]
  initialContext?: Record<string, unknown>
}
```

### 3.2 WorkflowStep

```typescript
interface WorkflowStep {
  id: string
  action: ActionType | string
  inputs?: Record<string, unknown>
  transitions?: {
    onSuccess?: string   // next step id
    onFailure?: string   // fallback step id
  }
}
```

### 3.3 ActionType

Built-in actions supported in v1:

| Action | Purpose | Inputs |
|--------|---------|--------|
| `post` | Publish a post via provider | `pageId`, `message`, `link?` |
| `comment` | Reply to a post/comment | `postId`, `message` |
| `like` | Like a post | `postId` |
| `wait` | Pause execution | `durationMs` |
| `setContext` | Store a computed value | `key`, `value` |
| `condition` | Branch based on context | `expression` (simple: `ctx.key === 'value'`) |

Platform-specific actions can be added later by mapping `string` action names to provider methods.

### 3.4 WorkflowContext

```typescript
interface WorkflowContext {
  variables: Record<string, unknown>
  stepOutputs: Record<string, unknown>
}
```

Inputs may reference context using a simple template syntax: `{{pageId}}`, `{{steps.publishPost.id}}`.

## 4. Execution Flow

```
WorkflowEngine.execute(definition, initialContext)
  → resolve current step
  → evaluate inputs from context
  → run action
  → store output under stepOutputs[step.id]
  → determine next step (onSuccess / onFailure / sequential default)
  → repeat until no next step
```

### Error handling

- Step failure stores `error` in context.
- If `transitions.onFailure` is defined, engine jumps there.
- If not defined, execution stops and status is `failed`.
- All thrown errors are caught and recorded; engine never crashes mid-workflow.

### Completion

- Execution returns a `WorkflowExecution` object:

```typescript
interface WorkflowExecution {
  id: string
  definitionId: string
  status: 'pending' | 'running' | 'done' | 'failed'
  context: WorkflowContext
  currentStepId?: string
  error?: string
}
```

## 5. Integration with Scheduler

A new `WorkflowScheduler` class wraps `Scheduler`:

```typescript
class WorkflowScheduler {
  scheduleWorkflow(definitionId: string, runAt: Date, initialContext?: Record<string, unknown>): ScheduledTask
}
```

On task due, it calls `WorkflowEngine.execute` with the stored definition and context.

## 6. Boundaries & Constraints

- Workflow engine depends only on `@socialkit/core` (via `SocialProvider`).
- No changes to provider packages.
- No UI work in this iteration.
- Condition expressions are intentionally simple; no full expression evaluator.
- Templates only support shallow key lookup (`{{key}}`, `{{steps.stepId.outputKey}}`).

## 7. Testing Strategy

- Unit tests for `WorkflowEngine` using `MockSocialProvider`.
- Tests for template resolution.
- Tests for each built-in action.
- Tests for error transitions and sequential defaults.
- Tests for `WorkflowScheduler` integration with a mocked clock.

## 8. Files to Create / Modify

### Create

- `packages/automation/src/workflow-types.ts`
- `packages/automation/src/workflow-engine.ts`
- `packages/automation/src/workflow-scheduler.ts`
- `packages/automation/__tests__/workflow-engine.test.ts`
- `packages/automation/__tests__/workflow-scheduler.test.ts`

### Modify

- `packages/automation/src/index.ts` — export new public API.
- `packages/cli/src/index.ts` (optional) — expose `workflow run` command if time permits.

## 9. Success Criteria

1. `WorkflowEngine` can execute a 3-step workflow: post → wait → comment.
2. Context variables can be shared between steps using templates.
3. Failed steps route to `onFailure` when configured.
4. All new code is covered by tests written first (TDD).
5. `pnpm test` passes for the entire workspace.
6. No regressions in existing `Scheduler`, `AutomationEngine`, or `AutoExecutor` tests.
