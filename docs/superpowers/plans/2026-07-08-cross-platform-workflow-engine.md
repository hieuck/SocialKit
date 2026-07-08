# Cross-Platform Workflow Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal, testable cross-platform workflow engine to `@socialkit/automation` that can chain actions, share context, branch on conditions, and be triggered by the existing scheduler.

**Architecture:** A new `WorkflowEngine` executes declarative `WorkflowDefinition` objects step-by-step against a `SocialProvider`. A small template resolver lets steps reference outputs from previous steps. A `WorkflowScheduler` thinly wraps the existing `Scheduler` to trigger workflow executions.

**Tech Stack:** TypeScript, Jest, `@socialkit/core`, `@socialkit/testing`.

---

## File Map

| File | Responsibility |
|------|----------------|
| `packages/automation/src/workflow-types.ts` | Type definitions for workflows, steps, context, and executions. |
| `packages/automation/src/template-resolver.ts` | Resolves `{{key}}` and `{{steps.stepId.outputKey}}` templates against context. |
| `packages/automation/src/workflow-engine.ts` | Executes workflow definitions step-by-step, handles transitions and errors. |
| `packages/automation/src/workflow-scheduler.ts` | Wraps `Scheduler` to schedule workflow executions. |
| `packages/automation/__tests__/template-resolver.test.ts` | Unit tests for template resolution. |
| `packages/automation/__tests__/workflow-engine.test.ts` | Unit tests for workflow engine and built-in actions. |
| `packages/automation/__tests__/workflow-scheduler.test.ts` | Unit tests for workflow scheduling. |
| `packages/automation/src/index.ts` | Barrel export of new public API. |

---

## Task 1: Define Workflow Types

**Files:**
- Create: `packages/automation/src/workflow-types.ts`
- Modify: `packages/automation/src/task-types.ts`

**Context:** These types are used by `WorkflowEngine`, `WorkflowScheduler`, and their tests. The existing `TaskType` union must include `'workflow'` so scheduled workflow tasks are type-safe.

- [ ] **Step 0: Extend `TaskType` union**

Modify `packages/automation/src/task-types.ts` to add `'workflow'`:

```typescript
export type TaskType = 'post' | 'comment' | 'like' | 'workflow'
```

- [ ] **Step 1: Create the type definitions file**

Create `packages/automation/src/workflow-types.ts` with this content:

```typescript
export type ActionType = 'post' | 'comment' | 'like' | 'wait' | 'setContext' | 'condition'

export interface WorkflowStep {
  id: string
  action: ActionType | string
  inputs?: Record<string, unknown>
  transitions?: {
    onSuccess?: string
    onFailure?: string
  }
}

export interface WorkflowDefinition {
  id: string
  name: string
  steps: WorkflowStep[]
  initialContext?: Record<string, unknown>
}

export interface WorkflowContext {
  variables: Record<string, unknown>
  stepOutputs: Record<string, Record<string, unknown>>
  error?: string
}

export interface WorkflowExecution {
  id: string
  definitionId: string
  status: 'pending' | 'running' | 'done' | 'failed'
  context: WorkflowContext
  currentStepId?: string
  error?: string
}
```

- [ ] **Step 2: Verify the package compiles**

Run:

```bash
pnpm -F @socialkit/automation build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/automation/src/workflow-types.ts packages/automation/src/task-types.ts
git commit -m "feat(automation): add workflow type definitions"
```

---

## Task 2: Template Resolver

**Files:**
- Create: `packages/automation/src/template-resolver.ts`
- Create: `packages/automation/__tests__/template-resolver.test.ts`

**Context:** Steps need to reference outputs from earlier steps and variables in context. The resolver supports `{{key}}` and `{{steps.stepId.outputKey}}`.

- [ ] **Step 1: Write the failing test**

Create `packages/automation/__tests__/template-resolver.test.ts`:

```typescript
import { resolveValue, resolveInputs } from '../src/template-resolver'

describe('TemplateResolver', () => {
  it('resolves a simple variable', () => {
    const context = { variables: { pageId: 'p1' }, stepOutputs: {} }
    expect(resolveValue('{{pageId}}', context)).toBe('p1')
  })

  it('resolves a step output', () => {
    const context = {
      variables: {},
      stepOutputs: { publishPost: { id: 'post_123' } },
    }
    expect(resolveValue('{{steps.publishPost.id}}', context)).toBe('post_123')
  })

  it('returns literal value unchanged', () => {
    const context = { variables: { pageId: 'p1' }, stepOutputs: {} }
    expect(resolveValue('literal string', context)).toBe('literal string')
  })

  it('resolves object inputs recursively', () => {
    const context = {
      variables: { pageId: 'p1' },
      stepOutputs: { publishPost: { id: 'post_123' } },
    }
    const inputs = {
      pageId: '{{pageId}}',
      postId: '{{steps.publishPost.id}}',
      message: 'Hello',
    }
    expect(resolveInputs(inputs, context)).toEqual({
      pageId: 'p1',
      postId: 'post_123',
      message: 'Hello',
    })
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run:

```bash
pnpm -F @socialkit/automation test -- template-resolver.test.ts
```

Expected: FAIL — module not found, functions undefined.

- [ ] **Step 3: Implement minimal resolver**

Create `packages/automation/src/template-resolver.ts`:

```typescript
import type { WorkflowContext } from './workflow-types.js'

export function resolveValue(value: unknown, context: WorkflowContext): unknown {
  if (typeof value !== 'string') return value
  const match = value.match(/^\{\{(.+)\}\}$/)
  if (!match) return value
  return resolvePath(match[1].trim(), context)
}

export function resolveInputs(
  inputs: Record<string, unknown> | undefined,
  context: WorkflowContext,
): Record<string, unknown> {
  if (!inputs) return {}
  const resolved: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(inputs)) {
    resolved[key] = resolveValue(value, context)
  }
  return resolved
}

function resolvePath(path: string, context: WorkflowContext): unknown {
  const parts = path.split('.')
  if (parts.length >= 3 && parts[0] === 'steps') {
    const stepOutputs = context.stepOutputs[parts[1]]
    return stepOutputs?.[parts.slice(2).join('.')]
  }
  return context.variables[path]
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run:

```bash
pnpm -F @socialkit/automation test -- template-resolver.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/automation/src/template-resolver.ts packages/automation/__tests__/template-resolver.test.ts
git commit -m "feat(automation): add template resolver for workflow context"
```

---

## Task 3: Workflow Engine Core

**Files:**
- Create: `packages/automation/src/workflow-engine.ts`
- Create: `packages/automation/__tests__/workflow-engine.test.ts`

**Context:** `WorkflowEngine` executes a definition's steps sequentially by default. It uses `MockSocialProvider` in tests to avoid real API calls.

- [ ] **Step 1: Write the failing test**

Create `packages/automation/__tests__/workflow-engine.test.ts` with the first test:

```typescript
import { WorkflowEngine } from '../src/workflow-engine'
import { MockSocialProvider } from '@socialkit/testing'

describe('WorkflowEngine', () => {
  it('executes a single post step', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_1',
      name: 'Single Post',
      steps: [
        { id: 'post1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(result.context.stepOutputs.post1.id).toBe('new_post_mock')
    expect(provider.calls[0].method).toBe('publishPost')
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-engine.test.ts
```

Expected: FAIL — `WorkflowEngine` not found.

- [ ] **Step 3: Implement minimal engine**

Create `packages/automation/src/workflow-engine.ts`:

```typescript
import type { SocialProvider } from '@socialkit/core'
import type {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowContext,
  WorkflowStep,
} from './workflow-types.js'
import { resolveInputs } from './template-resolver.js'

export class WorkflowEngine {
  constructor(private provider: SocialProvider) {}

  async execute(definition: WorkflowDefinition): Promise<WorkflowExecution> {
    const context: WorkflowContext = {
      variables: { ...(definition.initialContext ?? {}) },
      stepOutputs: {},
    }
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      definitionId: definition.id,
      status: 'running',
      context,
    }

    let currentStepIndex = 0
    while (currentStepIndex < definition.steps.length) {
      const step = definition.steps[currentStepIndex]
      execution.currentStepId = step.id
      try {
        const output = await this.runStep(step, context)
        context.stepOutputs[step.id] = output ?? {}
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        context.error = message
        execution.status = 'failed'
        execution.error = message
        return execution
      }
      currentStepIndex++
    }

    execution.status = 'done'
    execution.currentStepId = undefined
    return execution
  }

  private async runStep(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, unknown> | void> {
    const inputs = resolveInputs(step.inputs, context)
    switch (step.action) {
      case 'post': {
        const id = await this.provider.publishPost(String(inputs.pageId), {
          message: String(inputs.message ?? ''),
          link: inputs.link as string | undefined,
        })
        return { id }
      }
      default:
        throw new Error(`Unknown action: ${step.action}`)
    }
  }
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-engine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/automation/src/workflow-engine.ts packages/automation/__tests__/workflow-engine.test.ts
git commit -m "feat(automation): add workflow engine core with post action"
```

---

## Task 4: Built-in Actions

**Files:**
- Modify: `packages/automation/src/workflow-engine.ts`
- Modify: `packages/automation/__tests__/workflow-engine.test.ts`

**Context:** Add `comment`, `like`, `wait`, `setContext`, and `condition` actions.

- [ ] **Step 1: Add tests for remaining actions**

Append to `packages/automation/__tests__/workflow-engine.test.ts` inside the existing `describe` block:

```typescript
  it('executes a comment step', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_comment',
      name: 'Comment',
      steps: [
        { id: 'c1', action: 'comment', inputs: { postId: 'post1', message: 'Nice!' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(result.context.stepOutputs.c1.id).toBe('reply_mock')
    expect(provider.calls[0].method).toBe('replyToComment')
  })

  it('executes a like step', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_like',
      name: 'Like',
      steps: [
        { id: 'l1', action: 'like', inputs: { postId: 'post1' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(provider.calls[0].method).toBe('likePost')
  })

  it('executes a wait step', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const start = Date.now()
    await engine.execute({
      id: 'wf_wait',
      name: 'Wait',
      steps: [
        { id: 'w1', action: 'wait', inputs: { durationMs: 30 } },
      ],
    })
    expect(Date.now() - start).toBeGreaterThanOrEqual(25)
  })

  it('executes a setContext step', async () => {
    const engine = new WorkflowEngine(new MockSocialProvider())
    const result = await engine.execute({
      id: 'wf_ctx',
      name: 'Set Context',
      steps: [
        { id: 's1', action: 'setContext', inputs: { key: 'greeting', value: 'hello' } },
      ],
    })
    expect(result.context.variables.greeting).toBe('hello')
  })

  it('executes a condition step that succeeds', async () => {
    const engine = new WorkflowEngine(new MockSocialProvider())
    const result = await engine.execute({
      id: 'wf_cond',
      name: 'Condition',
      initialContext: { platform: 'facebook' },
      steps: [
        { id: 'c1', action: 'condition', inputs: { expression: 'platform === "facebook"' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(result.context.stepOutputs.c1.result).toBe(true)
  })

  it('executes a condition step that fails', async () => {
    const engine = new WorkflowEngine(new MockSocialProvider())
    const result = await engine.execute({
      id: 'wf_cond_false',
      name: 'Condition False',
      initialContext: { platform: 'zalo' },
      steps: [
        { id: 'c1', action: 'condition', inputs: { expression: 'platform === "facebook"' } },
      ],
    })
    expect(result.context.stepOutputs.c1.result).toBe(false)
  })
```

- [ ] **Step 2: Run tests and watch them fail**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-engine.test.ts
```

Expected: FAIL — actions not implemented.

- [ ] **Step 3: Implement remaining actions**

Replace the `runStep` method in `packages/automation/src/workflow-engine.ts` with:

```typescript
  private async runStep(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, unknown> | void> {
    const inputs = resolveInputs(step.inputs, context)
    switch (step.action) {
      case 'post': {
        const id = await this.provider.publishPost(String(inputs.pageId), {
          message: String(inputs.message ?? ''),
          link: inputs.link as string | undefined,
        })
        return { id }
      }
      case 'comment': {
        const id = await this.provider.replyToComment(String(inputs.postId), String(inputs.message ?? ''))
        return { id }
      }
      case 'like': {
        await this.provider.likePost(String(inputs.postId))
        return
      }
      case 'wait': {
        await new Promise(r => setTimeout(r, Number(inputs.durationMs ?? 0)))
        return
      }
      case 'setContext': {
        context.variables[String(inputs.key)] = inputs.value
        return
      }
      case 'condition': {
        const result = evaluateCondition(String(inputs.expression), context.variables)
        return { result }
      }
      default:
        throw new Error(`Unknown action: ${step.action}`)
    }
  }
```

Add the helper function at the bottom of the file:

```typescript
function evaluateCondition(expression: string, variables: Record<string, unknown>): boolean {
  const keys = Object.keys(variables)
  const values = keys.map(k => variables[k])
  try {
    return new Function(...keys, `return (${expression})`)(...values) as boolean
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run tests and watch them pass**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-engine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/automation/src/workflow-engine.ts packages/automation/__tests__/workflow-engine.test.ts
git commit -m "feat(automation): add comment, like, wait, setContext, and condition actions"
```

---

## Task 5: Context Sharing Between Steps

**Files:**
- Modify: `packages/automation/__tests__/workflow-engine.test.ts`

**Context:** Verify that a workflow can publish a post and then use the post id in a later comment step via templates.

- [ ] **Step 1: Add cross-step context test**

Append to `packages/automation/__tests__/workflow-engine.test.ts` inside the `describe` block:

```typescript
  it('shares post id between steps', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_chain',
      name: 'Post then Comment',
      steps: [
        { id: 'publish', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } },
        { id: 'comment', action: 'comment', inputs: { postId: '{{steps.publish.id}}', message: 'Thanks!' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(provider.calls[1].args[0]).toBe('new_post_mock')
    expect(provider.calls[1].method).toBe('replyToComment')
  })
```

- [ ] **Step 2: Run tests and watch it pass**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-engine.test.ts
```

Expected: PASS (template resolver already integrated).

- [ ] **Step 3: Commit**

```bash
git add packages/automation/__tests__/workflow-engine.test.ts
git commit -m "test(automation): verify cross-step context sharing"
```

---

## Task 6: Error Transitions

**Files:**
- Modify: `packages/automation/src/workflow-engine.ts`
- Modify: `packages/automation/__tests__/workflow-engine.test.ts`

**Context:** Steps may declare `transitions.onFailure`. When a step throws, the engine should jump to that step instead of failing the whole workflow.

- [ ] **Step 1: Add tests for error transitions**

Append to `packages/automation/__tests__/workflow-engine.test.ts` inside the `describe` block:

```typescript
  it('jumps to onFailure step when a step throws', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_error',
      name: 'Error Handling',
      steps: [
        {
          id: 'willFail',
          action: 'post',
          inputs: { pageId: '', message: 'x' },
          transitions: { onFailure: 'notify' },
        },
        { id: 'notify', action: 'setContext', inputs: { key: 'notified', value: true } },
      ],
    })
    expect(result.status).toBe('done')
    expect(result.context.variables.notified).toBe(true)
  })

  it('fails workflow when no onFailure transition exists', async () => {
    const provider = new MockSocialProvider()
    provider.publishPost = async () => { throw new Error('publish failed') }
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_fatal',
      name: 'Fatal Error',
      steps: [
        { id: 'p1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } },
      ],
    })
    expect(result.status).toBe('failed')
    expect(result.error).toBe('publish failed')
  })
```

- [ ] **Step 2: Run tests and watch them fail**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-engine.test.ts
```

Expected: FAIL — error transitions not implemented.

- [ ] **Step 3: Implement error transitions**

Replace the `execute` method in `packages/automation/src/workflow-engine.ts` with:

```typescript
  async execute(definition: WorkflowDefinition): Promise<WorkflowExecution> {
    const context: WorkflowContext = {
      variables: { ...(definition.initialContext ?? {}) },
      stepOutputs: {},
    }
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      definitionId: definition.id,
      status: 'running',
      context,
    }

    const stepIndexById = new Map(definition.steps.map((s, i) => [s.id, i]))
    let currentStepIndex = 0

    while (currentStepIndex >= 0 && currentStepIndex < definition.steps.length) {
      const step = definition.steps[currentStepIndex]
      execution.currentStepId = step.id
      try {
        const output = await this.runStep(step, context)
        context.stepOutputs[step.id] = output ?? {}
        delete context.error
        const nextId = step.transitions?.onSuccess
        currentStepIndex = nextId ? (stepIndexById.get(nextId) ?? currentStepIndex + 1) : currentStepIndex + 1
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        context.error = message
        const fallbackId = step.transitions?.onFailure
        if (fallbackId && stepIndexById.has(fallbackId)) {
          currentStepIndex = stepIndexById.get(fallbackId)!
        } else {
          execution.status = 'failed'
          execution.error = message
          return execution
        }
      }
    }

    execution.status = 'done'
    execution.currentStepId = undefined
    return execution
  }
```

- [ ] **Step 4: Run tests and watch them pass**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-engine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/automation/src/workflow-engine.ts packages/automation/__tests__/workflow-engine.test.ts
git commit -m "feat(automation): add error transitions to workflow engine"
```

---

## Task 7: Workflow Scheduler

**Files:**
- Create: `packages/automation/src/workflow-scheduler.ts`
- Create: `packages/automation/__tests__/workflow-scheduler.test.ts`

**Context:** `WorkflowScheduler` wraps `Scheduler` so workflow executions can be triggered at a specific time. It stores the definition id and initial context in the task payload.

- [ ] **Step 1: Write the failing test**

Create `packages/automation/__tests__/workflow-scheduler.test.ts`:

```typescript
import { WorkflowScheduler } from '../src/workflow-scheduler'
import { WorkflowEngine } from '../src/workflow-engine'
import { MockSocialProvider } from '@socialkit/testing'

describe('WorkflowScheduler', () => {
  it('schedules a workflow and executes it when due', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const scheduler = new WorkflowScheduler(engine)

    const definition = {
      id: 'wf_scheduled',
      name: 'Scheduled',
      steps: [{ id: 'p1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }

    const task = scheduler.scheduleWorkflow({
      definition,
      runAt: new Date(Date.now() + 50),
    })

    expect(task.type).toBe('workflow')
    expect(task.payload?.definitionId).toBe('wf_scheduled')

    await new Promise(r => setTimeout(r, 150))
    expect(provider.calls).toHaveLength(1)
    expect(provider.calls[0].method).toBe('publishPost')
    scheduler.stop()
  })
})
```

- [ ] **Step 2: Run the test and watch it fail**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-scheduler.test.ts
```

Expected: FAIL — `WorkflowScheduler` not found.

- [ ] **Step 3: Implement minimal scheduler**

Create `packages/automation/src/workflow-scheduler.ts`:

```typescript
import { Scheduler } from './scheduler.js'
import { WorkflowEngine } from './workflow-engine.js'
import type { WorkflowDefinition, ScheduledTask } from './workflow-types.js'

export interface WorkflowScheduleInput {
  definition: WorkflowDefinition
  runAt?: Date
  cron?: string
}

export class WorkflowScheduler {
  private scheduler = new Scheduler()

  constructor(private engine: WorkflowEngine) {
    this.scheduler.onTaskDue(async (task) => {
      const definition = task.payload?.definition as WorkflowDefinition
      const initialContext = (task.payload?.initialContext as Record<string, unknown>) ?? {}
      if (definition) {
        await this.engine.execute({ ...definition, initialContext })
      }
    })
  }

  scheduleWorkflow(input: WorkflowScheduleInput): ScheduledTask {
    return this.scheduler.schedule({
      type: 'workflow',
      pageId: 'workflow',
      payload: {
        definitionId: input.definition.id,
        definition: input.definition,
        initialContext: input.definition.initialContext ?? {},
      },
      runAt: input.runAt,
      cron: input.cron,
    })
  }

  list(): ScheduledTask[] {
    return this.scheduler.list()
  }

  cancel(id: string): boolean {
    return this.scheduler.cancel(id)
  }

  stop(): void {
    this.scheduler.stop()
  }
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run:

```bash
pnpm -F @socialkit/automation test -- workflow-scheduler.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/automation/src/workflow-scheduler.ts packages/automation/__tests__/workflow-scheduler.test.ts
git commit -m "feat(automation): add workflow scheduler wrapping existing scheduler"
```

---

## Task 8: Export Public API

**Files:**
- Modify: `packages/automation/src/index.ts`

**Context:** Expose the new workflow API from the package barrel.

- [ ] **Step 1: Add exports**

Modify `packages/automation/src/index.ts` to append:

```typescript
export type {
  ActionType,
  WorkflowStep,
  WorkflowDefinition,
  WorkflowContext,
  WorkflowExecution,
} from './workflow-types.js'
export { WorkflowEngine } from './workflow-engine.js'
export { WorkflowScheduler, type WorkflowScheduleInput } from './workflow-scheduler.js'
export { resolveValue, resolveInputs } from './template-resolver.js'
```

- [ ] **Step 2: Run package tests**

Run:

```bash
pnpm -F @socialkit/automation test
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/automation/src/index.ts
git commit -m "feat(automation): export workflow engine public API"
```

---

## Task 9: Full Workspace Verification

**Files:**
- All modified files

**Context:** Ensure no regressions across the monorepo.

- [ ] **Step 1: Run all tests**

Run:

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 2: Run build**

Run:

```bash
pnpm -r build
```

Expected: Build succeeds for all packages.

- [ ] **Step 3: Commit any fixes**

If any test or build fix was needed, commit with:

```bash
git add <files>
git commit -m "fix(automation): resolve workflow engine integration issues"
```

If no fixes were needed, no commit is required for this task.

---

## Self-Review Checklist

- [ ] Spec coverage: every section of the design spec maps to at least one task.
- [ ] No placeholders: every step contains exact file paths, code, and commands.
- [ ] Type consistency: types referenced in tests match types defined in `workflow-types.ts`.
- [ ] Dependency rules: new files stay inside `@socialkit/automation`; only `@socialkit/core` and `@socialkit/testing` are used.
