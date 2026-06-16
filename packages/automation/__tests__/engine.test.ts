import { AutomationEngine } from '../src/engine'
import { MockSocialProvider } from '@socialkit/testing'

describe('AutomationEngine', () => {
  let engine: AutomationEngine

  beforeEach(() => {
    engine = new AutomationEngine(new MockSocialProvider())
  })

  afterEach(() => engine.stop())

  it('creates with provider', () => {
    expect(engine).toBeDefined()
  })

  it('schedules a post', () => {
    const task = engine.schedulePost({ pageId: 'page1', message: 'Hello world', runAt: new Date(Date.now() + 60000) })
    expect(task.type).toBe('post')
    expect(task.payload?.message).toBe('Hello world')
  })

  it('schedules a recurring post', () => {
    const task = engine.schedulePost({ pageId: 'page1', message: 'Daily', cron: '0 9 * * *' })
    expect(task.cron).toBe('0 9 * * *')
  })

  it('schedules a comment', () => {
    const task = engine.scheduleComment({ pageId: 'page1', postId: 'post1', message: 'Nice!', runAt: new Date(Date.now() + 60000) })
    expect(task.type).toBe('comment')
    expect(task.postId).toBe('post1')
  })

  it('schedules a like', () => {
    const task = engine.scheduleLike({ pageId: 'page1', postId: 'post1', runAt: new Date(Date.now() + 60000) })
    expect(task.type).toBe('like')
    expect(task.postId).toBe('post1')
  })

  it('lists all scheduled tasks', () => {
    engine.schedulePost({ pageId: 'p1', message: 'A', runAt: new Date(Date.now() + 60000) })
    engine.scheduleComment({ pageId: 'p1', postId: 'post1', message: 'B', runAt: new Date(Date.now() + 60000) })
    expect(engine.list()).toHaveLength(2)
  })

  it('cancels a scheduled task', () => {
    const t = engine.schedulePost({ pageId: 'p1', message: 'X', runAt: new Date(Date.now() + 60000) })
    engine.cancel(t.id)
    expect(engine.list()).toHaveLength(0)
  })
})
