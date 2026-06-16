import { SocialProvider } from '@socialkit/core'
import { AutomationEngine } from '@socialkit/automation'
import { postCommand } from './post.js'

export interface ScheduleInput {
  page?: string
  message?: string
  link?: string
  at?: string
  subcommand?: string
  taskId?: string
}

export async function scheduleCommand(provider: SocialProvider, input: ScheduleInput): Promise<string> {
  if (input.subcommand === 'list' || input.subcommand === 'cancel') {
    const engine = new AutomationEngine(provider)
    try {
      if (input.subcommand === 'list') {
        const tasks = engine.list()
        return tasks.length === 0 ? 'No scheduled tasks.' : tasks.map(t => `  [${t.id}] ${t.type} on ${t.pageId} — ${t.status}`).join('\n')
      }
      if (input.taskId) {
        return engine.cancel(input.taskId) ? `Cancelled: ${input.taskId}` : `Task not found: ${input.taskId}`
      }
    } finally {
      engine.stop()
    }
  }

  if (input.page && input.message) {
    if (!input.at) {
      return postCommand(provider, { page: input.page, message: input.message, link: input.link })
    }

    const engine = new AutomationEngine(provider)
    try {
      const task = engine.schedulePost({
        pageId: input.page,
        message: input.message,
        link: input.link,
        runAt: new Date(input.at),
      })
      return `Scheduled: ${task.id} on ${input.page} at ${input.at}\nNote: requires running daemon to execute.`
    } finally {
      engine.stop()
    }
  }

  return 'Usage: schedule --page <id> --message <text> [--at <time>]'
}
