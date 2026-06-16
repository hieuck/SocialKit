import { existsSync, readFileSync, writeFileSync } from 'fs'
import type { ScheduledTask } from './task-types.js'

export class TaskStore {
  constructor(private filePath: string) {}

  load(): ScheduledTask[] {
    if (!existsSync(this.filePath)) return []
    try {
      const raw = readFileSync(this.filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      return this.hydrate(parsed)
    } catch {
      return []
    }
  }

  save(task: ScheduledTask): void {
    const tasks = this.load()
    const idx = tasks.findIndex(t => t.id === task.id)
    if (idx >= 0) tasks[idx] = task
    else tasks.push(task)
    this.persist(tasks)
  }

  delete(id: string): boolean {
    const tasks = this.load()
    const idx = tasks.findIndex(t => t.id === id)
    if (idx < 0) return false
    tasks.splice(idx, 1)
    this.persist(tasks)
    return true
  }

  list(): ScheduledTask[] {
    return this.load()
  }

  private persist(tasks: ScheduledTask[]): void {
    writeFileSync(this.filePath, JSON.stringify(tasks, null, 2), 'utf-8')
  }

  private hydrate(raw: unknown): ScheduledTask[] {
    if (!Array.isArray(raw)) return []
    return raw
      .filter((t): t is ScheduledTask => t && typeof t.id === 'string')
      .map(t => ({
        ...t,
        runAt: t.runAt ? new Date(t.runAt) : undefined,
      }))
  }
}
