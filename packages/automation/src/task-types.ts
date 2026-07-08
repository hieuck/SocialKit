export type TaskType = 'post' | 'comment' | 'like' | 'workflow'

export type TaskStatus = 'pending' | 'done' | 'failed'

export interface ScheduledTask {
  id: string
  type: TaskType
  pageId: string
  postId?: string
  payload?: Record<string, unknown>
  cron?: string
  runAt?: Date
  status: TaskStatus
  error?: string
}

export interface ScheduleInput {
  type: TaskType
  pageId: string
  postId?: string
  payload?: Record<string, unknown>
  cron?: string
  runAt?: Date
}

export type TaskCallback = (task: ScheduledTask) => Promise<void>
