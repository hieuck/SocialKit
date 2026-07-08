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

  private async runStep(step: WorkflowStep, context: WorkflowContext): Promise<Record<string, unknown> | void> {
    const inputs = resolveInputs(step.inputs, context)
    switch (step.action) {
      case 'post': {
        const result = await this.provider.publishPost(String(inputs.pageId), {
          message: String(inputs.message ?? ''),
          link: inputs.link as string | undefined,
        })
        return result
      }
      case 'comment': {
        const result = await this.provider.replyToComment(String(inputs.postId), String(inputs.message ?? ''))
        return result
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
}

function evaluateCondition(expression: string, variables: Record<string, unknown>): boolean {
  const keys = Object.keys(variables)
  const values = keys.map(k => variables[k])
  try {
    return new Function(...keys, `return (${expression})`)(...values) as boolean
  } catch {
    return false
  }
}
