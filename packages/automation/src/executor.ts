import { SocialProvider } from '@socialkit/core'
import { ScheduledTask } from './scheduler.js'

export class AutoExecutor {
  constructor(private provider: SocialProvider) {}

  async execute(task: ScheduledTask): Promise<{ id: string } | void> {
    switch (task.type) {
      case 'post': {
        const data = task.payload as { message: string; link?: string } | undefined
        return this.provider.publishPost(task.pageId, { message: data?.message ?? '', link: data?.link })
      }
      case 'like': {
        if (task.postId) await this.provider.likePost(task.postId)
        return
      }
      case 'comment': {
        if (task.postId) {
          const data = task.payload as { message: string } | undefined
          return this.provider.replyToComment(task.postId, data?.message ?? '')
        }
        return
      }
    }
  }
}
