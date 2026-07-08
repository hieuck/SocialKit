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
