# `socialkit workflow schedule` CLI Command — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `socialkit workflow schedule`, `workflow schedule list`, and `workflow schedule cancel` commands that expose `WorkflowScheduler` through the CLI.

**Architecture:** Extend `parseArgs` to support the new subcommands and flags. Add a `scheduleWorkflowCommand` helper to `packages/cli/src/workflow.ts`. Wire it into `Cli.run` alongside the existing `workflow run` handling. Reuse `WorkflowScheduler` from `@socialkit/automation`.

**Tech Stack:** TypeScript, Jest, ts-jest, `@socialkit/core`, `@socialkit/automation`, `@socialkit/testing`.

---

## File Structure

- `packages/cli/src/args.ts` — extend `CliCommand` parsing for `workflow schedule`, `workflow schedule list`, `workflow schedule cancel`, plus `--at`, `--cron`, `--platform` flags.
- `packages/cli/src/workflow.ts` — add `WorkflowScheduleInput`, `scheduleWorkflowCommand`, and helper validation/formatting functions.
- `packages/cli/src/cli.ts` — route `workflow schedule` subcommands and update `help()`.
- `packages/cli/__tests__/args.test.ts` — new arg parsing tests.
- `packages/cli/__tests__/workflow.test.ts` — new unit tests for scheduling, listing, cancelling.
- `packages/cli/__tests__/cli.test.ts` — new integration tests.

---

### Task 1: Parse `workflow schedule` args

**Files:**
- Modify: `packages/cli/src/args.ts`
- Test: `packages/cli/__tests__/args.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/__tests__/args.test.ts`:

```typescript
  it('parses "workflow schedule" command with --at', () => {
    const result = parseArgs(['workflow', 'schedule', './w.json', '--at', '2026-07-09T09:00:00Z', '--platform', 'facebook'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('schedule')
    expect(result.payload.file).toBe('./w.json')
    expect(result.payload.at).toBe('2026-07-09T09:00:00Z')
    expect(result.payload.platform).toBe('facebook')
  })

  it('parses "workflow schedule" command with --cron', () => {
    const result = parseArgs(['workflow', 'schedule', './w.json', '--cron', '0 9 * * 1'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('schedule')
    expect(result.payload.cron).toBe('0 9 * * 1')
  })

  it('parses "workflow schedule list" subcommand', () => {
    const result = parseArgs(['workflow', 'schedule', 'list'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('schedule')
    expect(result.payload.list).toBe('true')
  })

  it('parses "workflow schedule cancel" subcommand', () => {
    const result = parseArgs(['workflow', 'schedule', 'cancel', 'task_123'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('schedule')
    expect(result.payload.cancel).toBe('task_123')
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/args.test.ts
```

Expected: FAIL — `subcommand` will be `run` or command will be `help`.

- [ ] **Step 3: Write minimal implementation**

In `packages/cli/src/args.ts`, replace the existing `cmd === 'workflow'` block with:

```typescript
  if (cmd === 'workflow') {
    const subcommand = argv[1] ?? ''
    if (subcommand === 'schedule') {
      if (argv[2] === 'list') {
        return {
          command: 'workflow',
          payload: { subcommand: 'schedule', list: 'true' },
        }
      }
      if (argv[2] === 'cancel') {
        return {
          command: 'workflow',
          payload: { subcommand: 'schedule', cancel: argv[3] ?? '' },
        }
      }
      return {
        command: 'workflow',
        payload: {
          subcommand: 'schedule',
          file: argv[2] ?? '',
          ...parseFlags(argv.slice(3)),
        },
      }
    }
    return {
      command: 'workflow',
      payload: {
        subcommand,
        file: argv[2] ?? '',
        ...parseFlags(argv.slice(3)),
      },
    }
  }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && pnpm test -- __tests__/args.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/args.ts packages/cli/__tests__/args.test.ts
git commit -m "feat(cli): parse workflow schedule args"
```

---

### Task 2: Implement `scheduleWorkflowCommand`

**Files:**
- Modify: `packages/cli/src/workflow.ts`
- Test: `packages/cli/__tests__/workflow.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/__tests__/workflow.test.ts`:

```typescript
import { WorkflowScheduleInput, scheduleWorkflowCommand } from '../src/workflow'
```

Add inside `describe('workflowCommand', () => { ... })` or a new describe block:

```typescript
describe('scheduleWorkflowCommand', () => {
  it('schedules a workflow at a specific time', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w1',
      name: 'Test',
      steps: [{ id: 's1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file, at: '2099-01-01T00:00:00Z' })

    expect(result).toContain('Scheduled:')
    expect(result).toContain('workflow: w1')

    rmSync(dir, { recursive: true, force: true })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/workflow.test.ts
```

Expected: FAIL — `scheduleWorkflowCommand` not exported.

- [ ] **Step 3: Write minimal implementation**

Add to `packages/cli/src/workflow.ts`:

```typescript
import { WorkflowEngine, WorkflowScheduler, WorkflowDefinition } from '@socialkit/automation'
```

Add interface and function:

```typescript
export interface WorkflowScheduleInput {
  subcommand: string
  file?: string
  at?: string
  cron?: string
}

export async function scheduleWorkflowCommand(provider: SocialProvider, input: WorkflowScheduleInput): Promise<string> {
  if (input.at && input.cron) {
    return 'Error: Specify only one of --at or --cron.'
  }
  if (!input.at && !input.cron) {
    return 'Error: Specify --at or --cron.'
  }
  if (!input.file) {
    return 'Usage: workflow schedule <file> --at <time> | --cron <expr>'
  }

  let definition: WorkflowDefinition
  try {
    const content = readFileSync(input.file, 'utf-8')
    definition = JSON.parse(content) as WorkflowDefinition
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return `Error: Invalid workflow JSON: ${msg}`
  }

  const validation = validateWorkflow(definition)
  if (validation) {
    return `Error: Invalid workflow: ${validation}`
  }

  let runAt: Date | undefined
  if (input.at) {
    runAt = new Date(input.at)
    if (isNaN(runAt.getTime())) {
      return `Error: Invalid --at value: ${input.at}`
    }
  }

  if (input.cron && !isValidCron(input.cron)) {
    return `Error: Invalid --cron value: ${input.cron}`
  }

  const engine = new WorkflowEngine(provider)
  const scheduler = new WorkflowScheduler(engine)
  try {
    const task = scheduler.scheduleWorkflow({
      definition,
      runAt,
      cron: input.cron,
    })
    const time = runAt ? `at ${runAt.toISOString()}` : `cron ${input.cron}`
    return `Scheduled: ${task.id}\n  workflow: ${definition.id}\n  ${time}`
  } finally {
    scheduler.stop()
  }
}
```

Add helper:

```typescript
function isValidCron(cron: string): boolean {
  const parts = cron.split(' ')
  return parts.length === 5 && parts.every(p => /^[\d*,/-]+$/.test(p))
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && pnpm test -- __tests__/workflow.test.ts
```

Expected: PASS

- [ ] **Step 5: Add more tests**

Add tests for listing, cancelling, validation errors:

```typescript
  it('lists scheduled workflows', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', list: 'true' })
    expect(result).toContain('Scheduled workflows')
  })

  it('cancels a scheduled workflow', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w1',
      name: 'Test',
      steps: [{ id: 's1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const provider = new MockSocialProvider()
    const scheduled = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file, at: '2099-01-01T00:00:00Z' })
    const taskId = scheduled.split('\n')[0].replace('Scheduled: ', '').trim()

    const cancelled = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', cancel: taskId })
    expect(cancelled).toContain(`Cancelled: ${taskId}`)

    rmSync(dir, { recursive: true, force: true })
  })

  it('returns error when both --at and --cron are provided', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file: './x.json', at: '2099-01-01T00:00:00Z', cron: '0 9 * * 1' })
    expect(result).toContain('Specify only one of --at or --cron')
  })

  it('returns error when neither --at nor --cron is provided', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file: './x.json' })
    expect(result).toContain('Specify --at or --cron')
  })
```

Update `WorkflowScheduleInput` interface to include optional `list` and `cancel`:

```typescript
export interface WorkflowScheduleInput {
  subcommand: string
  file?: string
  at?: string
  cron?: string
  list?: string
  cancel?: string
}
```

And handle list/cancel in `scheduleWorkflowCommand`:

```typescript
export async function scheduleWorkflowCommand(provider: SocialProvider, input: WorkflowScheduleInput): Promise<string> {
  if (input.list === 'true') {
    const engine = new WorkflowEngine(provider)
    const scheduler = new WorkflowScheduler(engine)
    try {
      const tasks = scheduler.list().filter(t => t.type === 'workflow')
      if (tasks.length === 0) return 'Scheduled workflows:\n  No scheduled workflows.'
      return 'Scheduled workflows:\n' + tasks.map(t => {
        const defId = (t.payload?.definitionId as string) ?? 'unknown'
        const time = t.runAt ? `at ${t.runAt.toISOString()}` : `cron ${t.cron}`
        return `  [${t.id}] workflow ${defId} — ${t.status} — ${time}`
      }).join('\n')
    } finally {
      scheduler.stop()
    }
  }

  if (input.cancel) {
    const engine = new WorkflowEngine(provider)
    const scheduler = new WorkflowScheduler(engine)
    try {
      return scheduler.cancel(input.cancel) ? `Cancelled: ${input.cancel}` : `Task not found: ${input.cancel}`
    } finally {
      scheduler.stop()
    }
  }

  // ... existing scheduling logic
}
```

Run tests:

```bash
cd packages/cli && pnpm test -- __tests__/workflow.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/workflow.ts packages/cli/__tests__/workflow.test.ts
git commit -m "feat(cli): add scheduleWorkflowCommand"
```

---

### Task 3: Wire schedule subcommand into `Cli`

**Files:**
- Modify: `packages/cli/src/cli.ts`
- Test: `packages/cli/__tests__/cli.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/__tests__/cli.test.ts`:

```typescript
  it('schedules a workflow through Cli', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cli-workflow-schedule-test-'))
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'announce',
      name: 'Announce',
      steps: [{ id: 'post1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['workflow', 'schedule', file, '--at', '2099-01-01T00:00:00Z'])
    expect(result).toContain('Scheduled:')
    expect(result).toContain('workflow: announce')

    rmSync(dir, { recursive: true, force: true })
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/cli.test.ts
```

Expected: FAIL — `Cli.run` routes `workflow` to `handleWorkflow` which only handles `run`.

- [ ] **Step 3: Write minimal implementation**

In `packages/cli/src/cli.ts`, update `handleWorkflow`:

```typescript
  private async handleWorkflow(payload: Record<string, string>, platform?: string): Promise<string> {
    if (payload.subcommand === 'schedule') {
      if (payload.list === 'true') {
        const provider = platform ? this.options.registry.get(platform) : undefined
        return scheduleWorkflowCommand(provider ?? new MockSocialProvider(), { subcommand: 'schedule', list: 'true' })
      }
      if (payload.cancel) {
        const provider = platform ? this.options.registry.get(platform) : undefined
        return scheduleWorkflowCommand(provider ?? new MockSocialProvider(), { subcommand: 'schedule', cancel: payload.cancel })
      }
      if (!platform) return 'Specify a platform with --platform or log in first.'
      const provider = this.options.registry.get(platform)
      if (!provider) return `Unknown platform: ${platform}`
      return scheduleWorkflowCommand(provider, {
        subcommand: 'schedule',
        file: payload.file,
        at: payload.at,
        cron: payload.cron,
      })
    }

    if (!platform) return 'Specify a platform with --platform or log in first.'
    const provider = this.options.registry.get(platform)
    if (!provider) return `Unknown platform: ${platform}`
    return workflowCommand(provider, {
      subcommand: payload.subcommand,
      file: payload.file,
    })
  }
```

Wait — using `MockSocialProvider` as a fallback for list/cancel is wrong because list/cancel don't need a real provider. But `WorkflowScheduler` requires an engine with a provider. For list/cancel, the engine is never used (scheduler stops immediately), so any provider works. However, importing `MockSocialProvider` in `cli.ts` is wrong because it's a dev dependency. Better: create a minimal provider inline or use the registry to get any registered provider. Since list/cancel don't execute workflows, we can use the first registered provider, or create a minimal `SocialProvider` implementation.

Better approach for list/cancel: require no platform. Use a dummy provider:

```typescript
function dummyProvider(): SocialProvider {
  return new MockSocialProvider() // can't import dev dep in production code
}
```

Actually, we should not import `@socialkit/testing` in production code. The cleanest design is to make `WorkflowScheduler` not require a provider for list/cancel, but that requires changing `@socialkit/automation`. That's out of scope.

Alternative: for list/cancel, require an active platform just like schedule/run. The user must log in. This is consistent. The spec should be updated to reflect this. We'll use the resolved provider for list/cancel.

So `handleWorkflow` for schedule/list/cancel all require `platform`. Update implementation:

```typescript
  private async handleWorkflow(payload: Record<string, string>, platform?: string): Promise<string> {
    if (!platform) return 'Specify a platform with --platform or log in first.'
    const provider = this.options.registry.get(platform)
    if (!provider) return `Unknown platform: ${platform}`

    if (payload.subcommand === 'schedule') {
      return scheduleWorkflowCommand(provider, {
        subcommand: 'schedule',
        file: payload.file,
        at: payload.at,
        cron: payload.cron,
        list: payload.list,
        cancel: payload.cancel,
      })
    }

    return workflowCommand(provider, {
      subcommand: payload.subcommand,
      file: payload.file,
    })
  }
```

Update spec to note that list/cancel require logged-in platform. This is acceptable.

Update `help()` text by adding schedule lines:

```text
  socialkit workflow schedule <file> --at <time>
  socialkit workflow schedule <file> --cron <expr>
  socialkit workflow schedule list
  socialkit workflow schedule cancel <taskId>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && pnpm test -- __tests__/cli.test.ts
```

Expected: PASS

- [ ] **Step 5: Add list/cancel integration tests**

Add to `packages/cli/__tests__/cli.test.ts`:

```typescript
  it('lists scheduled workflows through Cli', async () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['workflow', 'schedule', 'list'])
    expect(result).toContain('Scheduled workflows')
  })
```

Run tests:

```bash
cd packages/cli && pnpm test -- __tests__/cli.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/cli.ts packages/cli/__tests__/cli.test.ts
git commit -m "feat(cli): wire workflow schedule subcommands into Cli"
```

---

### Task 4: Update MEMORY.md and barrel export

- [ ] **Step 1: Export `WorkflowScheduleInput`**

In `packages/cli/src/index.ts`, add:

```typescript
export type { WorkflowScheduleInput } from './workflow.js'
```

- [ ] **Step 2: Update MEMORY.md**

Add a note about `workflow schedule` and mark the previous gap as closed.

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/index.ts .kimchi/MEMORY.md
git commit -m "docs: export WorkflowScheduleInput and update memory"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run CLI package tests**

```bash
cd packages/cli && pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run full workspace tests**

```bash
pnpm test
```

Expected: all workspace tests pass.

- [ ] **Step 3: Run lint**

```bash
npx eslint packages/ apps/ --max-warnings 0
```

Expected: no errors or warnings.

- [ ] **Step 4: Build**

```bash
pnpm -r build
```

Expected: all packages build successfully.

---

## Self-Review

**Spec coverage:**
- `workflow schedule <file> --at` → Task 2
- `workflow schedule <file> --cron` → Task 2
- `workflow schedule list` → Task 2 + Task 3
- `workflow schedule cancel <taskId>` → Task 2 + Task 3
- `--platform` override → Task 3 (via existing `Cli.run` platform resolution)
- Validation errors → Task 2 tests
- Output formatting → Task 2 implementation

**Placeholder scan:** No TBD/TODO/vague steps. Each step has exact code and commands.

**Type consistency:** `WorkflowScheduleInput` uses optional `file`, `at`, `cron`, `list`, `cancel`. `Cli` passes payload fields consistently.
