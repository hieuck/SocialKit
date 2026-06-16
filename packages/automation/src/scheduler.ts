export type TaskType = 'post' | 'comment' | 'like'

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

export interface SchedulerOptions {
  checkIntervalMs?: number
}

export class Scheduler {
  private tasks: Map<string, ScheduledTask> = new Map()
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private onTaskDueCallback?: TaskCallback
  private running = false
  private checkInterval?: ReturnType<typeof setInterval>
  private checkIntervalMs: number

  constructor(options?: SchedulerOptions) {
    this.checkIntervalMs = options?.checkIntervalMs ?? 60000
  }

  onTaskDue(callback: TaskCallback): void {
    this.onTaskDueCallback = callback
  }

  schedule(input: ScheduleInput): ScheduledTask {
    const id = this.generateId()
    const task: ScheduledTask = { id, ...input, status: 'pending' }
    this.tasks.set(id, task)

    if (input.runAt && !input.cron) {
      const delay = input.runAt.getTime() - Date.now()
      if (delay > 0) {
        const timer = setTimeout(() => this.executeTask(id), delay)
        this.timers.set(id, timer)
      }
    } else if (input.cron) {
      this.startCronCheck()
    }

    return task
  }

  cancel(id: string): boolean {
    const timer = this.timers.get(id)
    if (timer) { clearTimeout(timer); this.timers.delete(id) }
    return this.tasks.delete(id)
  }

  list(): ScheduledTask[] {
    return Array.from(this.tasks.values())
  }

  stop(): void {
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
    if (this.checkInterval) { clearInterval(this.checkInterval); this.checkInterval = undefined }
    this.running = false
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  private async executeTask(id: string): Promise<void> {
    const task = this.tasks.get(id)
    if (!task || task.status !== 'pending') return
    this.timers.delete(id)
    try {
      if (this.onTaskDueCallback) await this.onTaskDueCallback(task)
      task.status = 'done'
    } catch (err) {
      task.status = 'failed'
      task.error = err instanceof Error ? err.message : String(err)
    }
  }

  private startCronCheck(): void {
    if (this.running) return
    this.running = true
    this.checkInterval = setInterval(async () => {
      const now = new Date()
      for (const task of this.tasks.values()) {
        if (task.status !== 'pending') continue
        if (task.cron && this.matchesCron(task.cron, now)) await this.executeTask(task.id)
      }
    }, this.checkIntervalMs)
  }

  private matchesCron(cron: string, date: Date): boolean {
    const parts = cron.split(' ')
    if (parts.length !== 5) return false
    const [min, hour, dom, month, dow] = parts
    if (min !== '*' && parseInt(min) !== date.getMinutes()) return false
    if (hour !== '*' && parseInt(hour) !== date.getHours()) return false
    if (dom !== '*' && parseInt(dom) !== date.getDate()) return false
    if (month !== '*' && parseInt(month) !== date.getMonth() + 1) return false
    if (dow !== '*' && !this.matchesDayOfWeek(parseInt(dow), date.getDay())) return false
    return true
  }

  private matchesDayOfWeek(cronDow: number, currentDay: number): boolean {
    if (cronDow === 7) cronDow = 0
    return cronDow === currentDay
  }
}
