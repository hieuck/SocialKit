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
