import { Scheduler, type ScheduledTask, type SchedulerOptions } from './scheduler.js'
import { WorkflowEngine } from './workflow-engine.js'
import type { WorkflowDefinition } from './workflow-types.js'

export interface WorkflowScheduleInput {
  definition: WorkflowDefinition
  runAt?: Date
  cron?: string
}

export class WorkflowScheduler {
  private scheduler: Scheduler

  constructor(private engine: WorkflowEngine, options?: SchedulerOptions) {
    this.scheduler = new Scheduler(options)
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
