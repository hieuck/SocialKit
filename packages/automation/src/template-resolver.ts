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
