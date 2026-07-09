import { SocialProvider } from '@socialkit/core'
import { WorkflowEngine, WorkflowScheduler, WorkflowDefinition, TaskStore } from '@socialkit/automation'
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

export interface WorkflowScheduleInput {
  subcommand: string
  file?: string
  at?: string
  cron?: string
  list?: string
  cancel?: string
}

export async function scheduleWorkflowCommand(provider: SocialProvider, input: WorkflowScheduleInput, store?: TaskStore): Promise<string> {
  if (input.list === 'true') {
    const engine = new WorkflowEngine(provider)
    const scheduler = new WorkflowScheduler(engine, { store })
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
    const scheduler = new WorkflowScheduler(engine, { store })
    try {
      return scheduler.cancel(input.cancel) ? `Cancelled: ${input.cancel}` : `Task not found: ${input.cancel}`
    } finally {
      scheduler.stop()
    }
  }

  if (input.at && input.cron) {
    return 'Error: Specify only one of --at or --cron.'
  }
  if (!input.at && !input.cron) {
    return 'Error: Specify --at or --cron.'
  }
  if (!input.file) {
    return 'Usage: workflow schedule <file> --at <time> | --cron <expr>'
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
  const scheduler = new WorkflowScheduler(engine, { store })
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

function isValidCron(cron: string): boolean {
  const parts = cron.split(' ')
  return parts.length === 5 && parts.every(p => /^[\d*,/-]+$/.test(p))
}

function formatOutput(output: Record<string, unknown>): string {
  if (output.id) return String(output.id)
  return Object.entries(output).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ') || '(no output)'
}
