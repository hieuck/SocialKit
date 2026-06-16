import { SocialProvider } from '@socialkit/core'
import { Scheduler, type SchedulerOptions, type ScheduledTask } from './scheduler.js'

export interface PostInput {
  pageId: string
  message: string
  link?: string
  runAt?: Date
  cron?: string
}

export interface CommentInput {
  pageId: string
  postId: string
  message: string
  runAt?: Date
  cron?: string
}

export interface LikeInput {
  pageId: string
  postId: string
  runAt?: Date
  cron?: string
}

export class AutomationEngine {
  private scheduler: Scheduler

  constructor(_provider: SocialProvider, options?: SchedulerOptions) {
    this.scheduler = new Scheduler(options)
  }

  schedulePost(input: PostInput): ScheduledTask {
    return this.scheduler.schedule({
      type: 'post',
      pageId: input.pageId,
      payload: { message: input.message, link: input.link },
      runAt: input.runAt,
      cron: input.cron,
    })
  }

  scheduleComment(input: CommentInput): ScheduledTask {
    return this.scheduler.schedule({
      type: 'comment',
      pageId: input.pageId,
      postId: input.postId,
      payload: { message: input.message },
      runAt: input.runAt,
      cron: input.cron,
    })
  }

  scheduleLike(input: LikeInput): ScheduledTask {
    return this.scheduler.schedule({
      type: 'like',
      pageId: input.pageId,
      postId: input.postId,
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

  setOnTaskDue(callback: (task: ScheduledTask) => Promise<void>): void {
    this.scheduler.onTaskDue(callback)
  }

  stop(): void {
    this.scheduler.stop()
  }
}
