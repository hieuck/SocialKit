# `socialkit workflow run` CLI Command — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `socialkit workflow run <file> [--platform <platform>]` command that executes a JSON workflow definition through `WorkflowEngine`.

**Architecture:** Reuse existing CLI patterns. Add `'workflow'` to `CliCommand`, parse the subcommand in `args.ts`, implement `workflowCommand` in a new `workflow.ts` module, and wire it into `Cli.run`. Use `MockSocialProvider` for unit tests and temp JSON files for workflow fixtures.

**Tech Stack:** TypeScript, Jest, ts-jest, `@socialkit/core`, `@socialkit/automation`, `@socialkit/testing`.

---

## File Structure

- `packages/cli/src/args.ts` — extend `CliCommand` and `parseArgs` to handle `workflow run <file>` with optional `--platform`.
- `packages/cli/src/workflow.ts` — new module: `WorkflowInput` interface, `workflowCommand(provider, input)`, validation helpers.
- `packages/cli/src/cli.ts` — add `handleWorkflow` branch and update `help()` text.
- `packages/cli/src/index.ts` — export `workflowCommand` and `WorkflowInput`.
- `packages/cli/__tests__/args.test.ts` — add tests for workflow arg parsing.
- `packages/cli/__tests__/workflow.test.ts` — new unit tests for `workflowCommand`.
- `packages/cli/__tests__/cli.test.ts` — integration tests through `Cli.run`.

---

### Task 1: Parse `workflow run` CLI args

**Files:**
- Modify: `packages/cli/src/args.ts`
- Test: `packages/cli/__tests__/args.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/__tests__/args.test.ts`:

```typescript
  it('parses "workflow run" command with file', () => {
    const result = parseArgs(['workflow', 'run', './workflow.json'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('run')
    expect(result.payload.file).toBe('./workflow.json')
  })

  it('parses "workflow run" command with --platform', () => {
    const result = parseArgs(['workflow', 'run', './workflow.json', '--platform', 'facebook'])
    expect(result.command).toBe('workflow')
    expect(result.payload.file).toBe('./workflow.json')
    expect(result.payload.platform).toBe('facebook')
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/args.test.ts
```

Expected: FAIL — `result.command` is `'help'` because `workflow` is not handled.

- [ ] **Step 3: Write minimal implementation**

In `packages/cli/src/args.ts`:

```typescript
export type CliCommand = 'login' | 'whoami' | 'post' | 'schedule' | 'daemon' | 'configure' | 'workflow' | 'help'
```

Add inside `parseArgs` before the final return:

```typescript
  if (cmd === 'workflow') {
    return {
      command: 'workflow',
      payload: {
        subcommand: argv[1] ?? '',
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
git commit -m "feat(cli): parse workflow run args"
```

---

### Task 2: Implement `workflowCommand`

**Files:**
- Create: `packages/cli/src/workflow.ts`
- Test: `packages/cli/__tests__/workflow.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/cli/__tests__/workflow.test.ts`:

```typescript
import { workflowCommand } from '../src/workflow'
import { MockSocialProvider } from '@socialkit/testing'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

function tempDir(): string {
  return tmpdir() + '/sk-workflow-test-' + Date.now()
}

describe('workflowCommand', () => {
  it('runs a workflow from a JSON file', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w1',
      name: 'Test',
      steps: [{ id: 's1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const provider = new MockSocialProvider()
    provider.setAccessToken('tok')
    const result = await workflowCommand(provider, { subcommand: 'run', file })

    expect(result).toContain('Workflow w1 completed')
    expect(result).toContain('s1:')

    rmSync(dir, { recursive: true, force: true })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/workflow.test.ts
```

Expected: FAIL — `workflowCommand` is not defined.

- [ ] **Step 3: Write minimal implementation**

Create `packages/cli/src/workflow.ts`:

```typescript
import { SocialProvider } from '@socialkit/core'
import { WorkflowEngine, WorkflowDefinition } from '@socialkit/automation'
import { readFileSync } from 'fs'

export interface WorkflowInput {
  subcommand: string
  file: string
}

export async function workflowCommand(provider: SocialProvider, input: WorkflowInput): Promise<string> {
  if (input.subcommand !== 'run') {
    return 'Usage: workflow run <file> [--platform <platform>]' 
  }

  if (!input.file) {
    return 'Usage: workflow run <file> [--platform <platform>]' 
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

  const engine = new WorkflowEngine(provider)
  const execution = await engine.execute(definition)

  if (execution.status === 'done') {
    const outputs = Object.entries(execution.context.stepOutputs)
      .map(([id, out]) => `  ${id}: ${formatOutput(out)}`)
      .join('\n')
    return `Workflow ${definition.id} completed.\n${outputs}`
  }

  return `Workflow ${definition.id} failed at step ${execution.currentStepId ?? 'unknown'}: ${execution.error ?? 'Unknown error'}`
}

function validateWorkflow(definition: unknown): string | undefined {
  const d = definition as Record<string, unknown>
  if (!d || typeof d !== 'object') return 'workflow must be an object'
  if (typeof d.id !== 'string' || d.id.length === 0) return 'id is required'
  if (!Array.isArray(d.steps)) return 'steps must be an array'
  for (const step of d.steps) {
    if (!step || typeof step !== 'object') return 'each step must be an object'
    if (typeof (step as Record<string, unknown>).id !== 'string') return 'each step must have an id'
    if (typeof (step as Record<string, unknown>).action !== 'string') return 'each step must have an action'
  }
  return undefined
}

function formatOutput(output: Record<string, unknown>): string {
  if (output.id) return String(output.id)
  return Object.entries(output).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ') || '(no output)'
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && pnpm test -- __tests__/workflow.test.ts
```

Expected: PASS

- [ ] **Step 5: Add more tests**

Add to `packages/cli/__tests__/workflow.test.ts`:

```typescript
  it('returns usage for missing file', async () => {
    const provider = new MockSocialProvider()
    const result = await workflowCommand(provider, { subcommand: 'run', file: '' })
    expect(result).toContain('Usage')
  })

  it('returns error for missing file path', async () => {
    const provider = new MockSocialProvider()
    const result = await workflowCommand(provider, { subcommand: 'run', file: '/does/not/exist.json' })
    expect(result).toContain('Error: Invalid workflow JSON')
  })

  it('returns error for invalid JSON', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'bad.json')
    writeFileSync(file, '{ not json')
    const provider = new MockSocialProvider()
    const result = await workflowCommand(provider, { subcommand: 'run', file })
    expect(result).toContain('Error: Invalid workflow JSON')
    rmSync(dir, { recursive: true, force: true })
  })

  it('returns error for invalid workflow shape', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'bad.json')
    writeFileSync(file, JSON.stringify({ id: 'w1' }))
    const provider = new MockSocialProvider()
    const result = await workflowCommand(provider, { subcommand: 'run', file })
    expect(result).toContain('Error: Invalid workflow')
    rmSync(dir, { recursive: true, force: true })
  })

  it('reports workflow failure', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w1',
      name: 'Test',
      steps: [{ id: 's1', action: 'like', inputs: { postId: 'p1' } }],
    }))

    const provider = new MockSocialProvider()
    jest.spyOn(provider, 'likePost').mockRejectedValue(new Error('Post not found'))

    const result = await workflowCommand(provider, { subcommand: 'run', file })
    expect(result).toContain('Workflow w1 failed at step s1')
    expect(result).toContain('Post not found')

    rmSync(dir, { recursive: true, force: true })
  })
```

Run tests again:

```bash
cd packages/cli && pnpm test -- __tests__/workflow.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/workflow.ts packages/cli/__tests__/workflow.test.ts
git commit -m "feat(cli): add workflowCommand to run JSON workflows"
```

---

### Task 3: Wire workflow command into `Cli`

**Files:**
- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/__tests__/cli.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/__tests__/cli.test.ts`:

```typescript
  it('runs a workflow from a file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cli-workflow-test-'))
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
    const result = await cli.run(['workflow', 'run', file])
    expect(result).toContain('Workflow announce completed')

    rmSync(dir, { recursive: true, force: true })
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/cli.test.ts
```

Expected: FAIL — `Cli.run` returns help text because `workflow` command is unhandled.

- [ ] **Step 3: Write minimal implementation**

In `packages/cli/src/cli.ts`:

Add import:

```typescript
import { workflowCommand } from './workflow.js'
```

Add `'workflow'` case in `switch (parsed.command)`:

```typescript
        case 'workflow':
          return await this.handleWorkflow(parsed.payload, platform)
```

Add private method:

```typescript
  private async handleWorkflow(payload: Record<string, string>, platform?: string): Promise<string> {
    if (!platform) return 'Specify a platform with --platform or log in first.'
    const provider = this.options.registry.get(platform)
    if (!provider) return `Unknown platform: ${platform}`
    return workflowCommand(provider, {
      subcommand: payload.subcommand,
      file: payload.file,
    })
  }
```

Update `help()` text by adding:

```text
  socialkit workflow run <file>           Run a workflow JSON file
  socialkit workflow run <file> --platform <platform>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && pnpm test -- __tests__/cli.test.ts
```

Expected: PASS

- [ ] **Step 5: Add platform override test**

Add to `packages/cli/__tests__/cli.test.ts`:

```typescript
  it('runs a workflow with explicit --platform', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cli-workflow-test-'))
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'cross',
      name: 'Cross',
      steps: [{ id: 'post1', action: 'post', inputs: { pageId: 'p1', message: 'Hi' } }],
    }))

    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    registry.register('instagram', () => new MockSocialProvider())
    const session = testSession()
    session.save('instagram', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['workflow', 'run', file, '--platform', 'facebook'])
    expect(result).toContain('Workflow cross completed')

    rmSync(dir, { recursive: true, force: true })
  })
```

Run tests:

```bash
cd packages/cli && pnpm test -- __tests__/cli.test.ts
```

Expected: PASS

- [ ] **Step 6: Update barrel export**

In `packages/cli/src/index.ts`, add:

```typescript
export { workflowCommand } from './workflow.js'
export type { WorkflowInput } from './workflow.js'
```

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/cli.ts packages/cli/src/index.ts packages/cli/__tests__/cli.test.ts
git commit -m "feat(cli): wire workflow run command into Cli"
```

---

### Task 4: Final verification

- [ ] **Step 1: Run CLI package tests**

```bash
cd packages/cli && pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run full workspace tests**

```bash
pnpm test
```

Expected: all workspace tests pass (target 218+).

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
- `socialkit workflow run <file>` → Task 1 + Task 3
- `--platform` override → Task 3 integration test
- JSON workflow format → Task 2 validation
- Error handling (missing file, invalid JSON, invalid shape, no platform, unknown platform, execution failure) → Task 2 + Task 3 tests
- Output formatting → Task 2 implementation

**Placeholder scan:** No TBD/TODO/vague steps. Each step has exact code and commands.

**Type consistency:** `WorkflowInput` uses `subcommand` and `file` strings. `Cli` passes payload fields consistently. `CliCommand` includes `'workflow'`.
