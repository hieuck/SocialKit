import { SocialProvider } from '@socialkit/core'
import { AutomationEngine, TaskStore, AutoExecutor } from '@socialkit/automation'
import { join } from 'path'
import { tmpdir } from 'os'
import { mkdtempSync } from 'fs'

export interface DaemonResult {
  message: string
  stop: () => void
}

export interface DaemonInput {
  platform?: string
  taskFilePath?: string
}

export function daemonCommand(provider: SocialProvider, input: DaemonInput): DaemonResult {
  const filePath = input.taskFilePath ?? join(mkdtempSync(join(tmpdir(), 'socialkit-')), 'tasks.json')
  const store = new TaskStore(filePath)
  const engine = new AutomationEngine(provider, { store, checkIntervalMs: 60000 })
  const executor = new AutoExecutor(provider)

  const loaded = store.list().filter(t => t.status === 'pending')

  if (loaded.length > 0) {
    engine.setOnTaskDue(async (task) => {
      try {
        await executor.execute(task)
        task.status = 'done'
        store.save(task)
      } catch (err) {
        task.status = 'failed'
        task.error = err instanceof Error ? err.message : String(err)
        store.save(task)
      }
    })

    for (const task of loaded) {
      if (task.cron) {
        engine.schedulePost({ pageId: task.pageId, message: (task.payload as any)?.message ?? '', cron: task.cron })
      }
    }

    return {
      message: `Daemon running with ${loaded.length} pending task(s). Press Ctrl+C to stop.`,
      stop: () => engine.stop(),
    }
  }

  engine.stop()
  return { message: 'No pending tasks. Use schedule --at <time> first.', stop: () => {} }
}
