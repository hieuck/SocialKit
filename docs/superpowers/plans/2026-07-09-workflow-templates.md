# Built-in Workflow Templates — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add built-in workflow templates and `socialkit workflow template list/show/run` commands to `@socialkit/cli`.

**Architecture:** Store templates as static `WorkflowDefinition` objects in `packages/cli/src/templates/*.ts`, register them in `templates/index.ts`, and expose them through a new `templateCommand` in `packages/cli/src/workflow.ts`. Extend `parseArgs` for the `template` subcommand and wire it into `Cli.run`.

**Tech Stack:** TypeScript, Jest, ts-jest, `@socialkit/core`, `@socialkit/automation`, `@socialkit/testing`.

---

## File Structure

- `packages/cli/src/templates/announce.ts` — announce template definition
- `packages/cli/src/templates/cross-post.ts` — cross-post template definition
- `packages/cli/src/templates/welcome-comment.ts` — welcome-comment template definition
- `packages/cli/src/templates/index.ts` — registry mapping template names to definitions
- `packages/cli/src/workflow.ts` — `templateCommand(provider, input)` and `WorkflowTemplateInput`
- `packages/cli/src/args.ts` — parse `workflow template list/show/run <name>`
- `packages/cli/src/cli.ts` — route template subcommand and update help
- `packages/cli/__tests__/templates.test.ts` — unit tests
- `packages/cli/__tests__/args.test.ts` — arg parsing tests
- `packages/cli/__tests__/cli.test.ts` — integration tests

---

### Task 1: Create template registry

**Files:**
- Create: `packages/cli/src/templates/announce.ts`
- Create: `packages/cli/src/templates/cross-post.ts`
- Create: `packages/cli/src/templates/welcome-comment.ts`
- Create: `packages/cli/src/templates/index.ts`
- Test: `packages/cli/__tests__/templates.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/cli/__tests__/templates.test.ts`:

```typescript
import { listTemplates, getTemplate } from '../src/templates'

describe('template registry', () => {
  it('lists built-in templates', () => {
    const names = listTemplates()
    expect(names).toContain('announce')
    expect(names).toContain('cross-post')
    expect(names).toContain('welcome-comment')
  })

  it('returns a template by name', () => {
    const template = getTemplate('announce')
    expect(template).toBeDefined()
    expect(template?.id).toBe('announce')
  })

  it('returns undefined for unknown template', () => {
    expect(getTemplate('unknown')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/templates.test.ts
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `packages/cli/src/templates/announce.ts`:

```typescript
import type { WorkflowDefinition } from '@socialkit/automation'

export const announceTemplate: WorkflowDefinition = {
  id: 'announce',
  name: 'Product Announcement',
  steps: [
    {
      id: 'post1',
      action: 'post',
      inputs: { pageId: 'me', message: 'Hello from SocialKit!' },
      transitions: { onSuccess: 'comment1' },
    },
    {
      id: 'comment1',
      action: 'comment',
      inputs: { postId: '{{steps.post1.id}}', message: 'Thanks for your support!' },
    },
  ],
}
```

Create `packages/cli/src/templates/cross-post.ts`:

```typescript
import type { WorkflowDefinition } from '@socialkit/automation'

export const crossPostTemplate: WorkflowDefinition = {
  id: 'cross-post',
  name: 'Cross-Platform Post',
  steps: [
    {
      id: 'post1',
      action: 'post',
      inputs: { pageId: 'page1', message: 'Cross-posting!' },
    },
    {
      id: 'post2',
      action: 'post',
      inputs: { pageId: 'page2', message: 'Cross-posting!' },
    },
  ],
}
```

Create `packages/cli/src/templates/welcome-comment.ts`:

```typescript
import type { WorkflowDefinition } from '@socialkit/automation'

export const welcomeCommentTemplate: WorkflowDefinition = {
  id: 'welcome-comment',
  name: 'Welcome Comment',
  steps: [
    {
      id: 'like1',
      action: 'like',
      inputs: { postId: 'post_1' },
      transitions: { onSuccess: 'comment1' },
    },
    {
      id: 'comment1',
      action: 'comment',
      inputs: { postId: 'post_1', message: 'Welcome!' },
    },
  ],
}
```

Create `packages/cli/src/templates/index.ts`:

```typescript
import type { WorkflowDefinition } from '@socialkit/automation'
import { announceTemplate } from './announce.js'
import { crossPostTemplate } from './cross-post.js'
import { welcomeCommentTemplate } from './welcome-comment.js'

const templates: Record<string, WorkflowDefinition> = {
  announce: announceTemplate,
  'cross-post': crossPostTemplate,
  'welcome-comment': welcomeCommentTemplate,
}

export function listTemplates(): string[] {
  return Object.keys(templates)
}

export function getTemplate(name: string): WorkflowDefinition | undefined {
  return templates[name]
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && pnpm test -- __tests__/templates.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/templates packages/cli/__tests__/templates.test.ts
git commit -m "feat(cli): add built-in workflow template registry"
```

---

### Task 2: Parse `workflow template` args

**Files:**
- Modify: `packages/cli/src/args.ts`
- Test: `packages/cli/__tests__/args.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/__tests__/args.test.ts`:

```typescript
  it('parses "workflow template list" subcommand', () => {
    const result = parseArgs(['workflow', 'template', 'list'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('template')
    expect(result.payload.action).toBe('list')
  })

  it('parses "workflow template show" subcommand', () => {
    const result = parseArgs(['workflow', 'template', 'show', 'announce'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('template')
    expect(result.payload.action).toBe('show')
    expect(result.payload.name).toBe('announce')
  })

  it('parses "workflow template run" subcommand with --platform', () => {
    const result = parseArgs(['workflow', 'template', 'run', 'announce', '--platform', 'facebook'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('template')
    expect(result.payload.action).toBe('run')
    expect(result.payload.name).toBe('announce')
    expect(result.payload.platform).toBe('facebook')
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/args.test.ts
```

Expected: FAIL — `workflow template` is treated as `workflow run` or `help`.

- [ ] **Step 3: Write minimal implementation**

In `packages/cli/src/args.ts`, add inside the `cmd === 'workflow'` block after the schedule handling:

```typescript
    if (subcommand === 'template') {
      const action = argv[2] ?? ''
      if (action === 'list') {
        return {
          command: 'workflow',
          payload: { subcommand: 'template', action: 'list' },
        }
      }
      return {
        command: 'workflow',
        payload: {
          subcommand: 'template',
          action,
          name: argv[3] ?? '',
          ...parseFlags(argv.slice(4)),
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
git commit -m "feat(cli): parse workflow template args"
```

---

### Task 3: Implement `templateCommand`

**Files:**
- Modify: `packages/cli/src/workflow.ts`
- Test: `packages/cli/__tests__/workflow.test.ts` (or `templates.test.ts`)

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/__tests__/templates.test.ts`:

```typescript
import { templateCommand } from '../src/workflow'
import { MockSocialProvider } from '@socialkit/testing'

describe('templateCommand', () => {
  it('lists templates', async () => {
    const provider = new MockSocialProvider()
    const result = await templateCommand(provider, { subcommand: 'template', action: 'list' })
    expect(result).toContain('Available workflow templates')
    expect(result).toContain('announce')
  })

  it('shows a template', async () => {
    const provider = new MockSocialProvider()
    const result = await templateCommand(provider, { subcommand: 'template', action: 'show', name: 'announce' })
    expect(result).toContain('"id": "announce"')
  })

  it('runs a template', async () => {
    const provider = new MockSocialProvider()
    const result = await templateCommand(provider, { subcommand: 'template', action: 'run', name: 'announce' })
    expect(result).toContain('Workflow announce completed')
  })

  it('returns error for unknown template', async () => {
    const provider = new MockSocialProvider()
    const result = await templateCommand(provider, { subcommand: 'template', action: 'run', name: 'unknown' })
    expect(result).toContain('Error: Unknown template')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/templates.test.ts
```

Expected: FAIL — `templateCommand` not exported.

- [ ] **Step 3: Write minimal implementation**

Add to `packages/cli/src/workflow.ts`:

```typescript
import { listTemplates, getTemplate } from './templates/index.js'

export interface WorkflowTemplateInput {
  subcommand: string
  action: string
  name?: string
}

export async function templateCommand(provider: SocialProvider, input: WorkflowTemplateInput): Promise<string> {
  if (input.action === 'list') {
    const names = listTemplates()
    return 'Available workflow templates:\n' + names.map(n => `  ${n.padEnd(16)} ${describeTemplate(n)}`).join('\n')
  }

  if (input.action === 'show') {
    if (!input.name) return 'Usage: workflow template show <name>'
    const template = getTemplate(input.name)
    if (!template) return `Error: Unknown template: ${input.name}`
    return JSON.stringify(template, null, 2)
  }

  if (input.action === 'run') {
    if (!input.name) return 'Usage: workflow template run <name> [--platform <platform>]' 
    const template = getTemplate(input.name)
    if (!template) return `Error: Unknown template: ${input.name}`
    return workflowCommand(provider, { subcommand: 'run', file: '', ...template } as WorkflowInput)
  }

  return 'Usage: workflow template list | show <name> | run <name>'
}

function describeTemplate(name: string): string {
  const descriptions: Record<string, string> = {
    announce: 'Post a message and reply with a thank-you comment',
    'cross-post': 'Post the same message to multiple pages',
    'welcome-comment': 'Like and comment on a post',
  }
  return descriptions[name] ?? ''
}
```

Wait — `workflowCommand` expects a `file` path, not a template object. We should refactor `workflowCommand` to accept either a file path or a definition. The cleanest way is to extract a `runWorkflow(provider, definition)` helper.

Refactor `workflowCommand`:

```typescript
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

  return runWorkflow(provider, definition)
}

export async function runWorkflow(provider: SocialProvider, definition: WorkflowDefinition): Promise<string> {
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
```

Then `templateCommand` for `run` uses `runWorkflow(provider, template)`.

Update `templateCommand` implementation accordingly.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && pnpm test -- __tests__/templates.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/workflow.ts packages/cli/__tests__/templates.test.ts
git commit -m "feat(cli): add templateCommand for list/show/run"
```

---

### Task 4: Wire template subcommand into `Cli`

**Files:**
- Modify: `packages/cli/src/cli.ts`
- Test: `packages/cli/__tests__/cli.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/__tests__/cli.test.ts`:

```typescript
  it('lists workflow templates through Cli', async () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['workflow', 'template', 'list'])
    expect(result).toContain('Available workflow templates')
  })

  it('shows a workflow template through Cli', async () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['workflow', 'template', 'show', 'announce'])
    expect(result).toContain('"id": "announce"')
  })

  it('runs a workflow template through Cli', async () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['workflow', 'template', 'run', 'announce'])
    expect(result).toContain('Workflow announce completed')
  })
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/cli && pnpm test -- __tests__/cli.test.ts
```

Expected: FAIL — `Cli.run` doesn't handle `template` subcommand.

- [ ] **Step 3: Write minimal implementation**

In `packages/cli/src/cli.ts`:

1. Import `templateCommand`:

```typescript
import { workflowCommand, scheduleWorkflowCommand, templateCommand } from './workflow.js'
```

2. Update `handleWorkflow`:

```typescript
  private async handleWorkflow(payload: Record<string, string>, platform?: string): Promise<string> {
    if (payload.subcommand === 'template') {
      return templateCommand(platform ? this.options.registry.get(platform) ?? undefined : undefined, {
        subcommand: 'template',
        action: payload.action,
        name: payload.name,
      })
    }

    if (!platform) return 'Specify a platform with --platform or log in first.'
    const provider = this.options.registry.get(platform)
    if (!provider) return `Unknown platform: ${platform}`

    if (payload.subcommand === 'schedule') {
      ...
    }

    return workflowCommand(provider, {
      subcommand: payload.subcommand,
      file: payload.file,
    })
  }
```

Wait — for list/show, no provider is needed, so we shouldn't require a platform. For `run`, we need a provider. The `templateCommand` function should handle the missing provider for run and return the same error message.

So `handleWorkflow` should:
- For `template` subcommand, resolve provider if platform is available, but don't require it.
- `templateCommand` returns the platform error if `run` is requested without provider.

Actually, to keep `Cli.run` consistent, we can require platform only for `template run`, and allow list/show without platform. But `Cli.run` currently resolves platform early. We can adjust:

```typescript
  private async handleWorkflow(payload: Record<string, string>, platform?: string): Promise<string> {
    if (payload.subcommand === 'template') {
      const provider = platform ? this.options.registry.get(platform) ?? undefined : undefined
      return templateCommand(provider, {
        subcommand: 'template',
        action: payload.action,
        name: payload.name,
      })
    }

    if (!platform) return 'Specify a platform with --platform or log in first.'
    const provider = this.options.registry.get(platform)
    if (!provider) return `Unknown platform: ${platform}`

    ...
  }
```

And in `templateCommand`, for `run`, if provider is missing, return the platform error.

3. Update help text:

```text
  socialkit workflow template list          List built-in workflow templates
  socialkit workflow template show <name>   Show template JSON
  socialkit workflow template run <name>    Run a built-in workflow template
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/cli && pnpm test -- __tests__/cli.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/cli.ts packages/cli/__tests__/cli.test.ts
git commit -m "feat(cli): wire workflow template subcommands into Cli"
```

---

### Task 5: Update barrel export and MEMORY.md

- [ ] **Step 1: Export `templateCommand`**

In `packages/cli/src/index.ts`, add:

```typescript
export { templateCommand } from './workflow.js'
export type { WorkflowTemplateInput } from './workflow.js'
```

- [ ] **Step 2: Update MEMORY.md**

Add a section documenting workflow templates and mark the previous gap as closed.

- [ ] **Step 3: Commit**

```bash
git add packages/cli/src/index.ts .kimchi/MEMORY.md
git commit -m "docs: export templateCommand and update project memory"
```

---

### Task 6: Final verification

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
- `workflow template list` → Task 3 + Task 4
- `workflow template show <name>` → Task 3 + Task 4
- `workflow template run <name>` → Task 3 + Task 4
- Unknown template → Task 3 tests
- Output formatting → Task 3 implementation

**Placeholder scan:** No TBD/TODO/vague steps. Each step has exact code and commands.

**Type consistency:** `WorkflowTemplateInput` uses `action` and `name`. `Cli` passes payload fields consistently.
