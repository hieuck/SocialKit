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
        const result = await this.provider.publishPost(String(inputs.pageId), {
          message: String(inputs.message ?? ''),
          link: inputs.link as string | undefined,
        })
        return result
      }
      default:
        throw new Error(`Unknown action: ${step.action}`)
    }
  }
}
