import { Scheduler, ScheduledTask } from '../src/scheduler'

describe('Scheduler', () => {
  let scheduler: Scheduler

  beforeEach(() => {
    scheduler = new Scheduler()
  })

  afterEach(() => {
    scheduler.stop()
  })

  it('creates an empty scheduler', () => {
    expect(scheduler.list()).toEqual([])
  })

  it('schedules a one-time task', () => {
    const task = scheduler.schedule({
      type: 'post',
      pageId: 'page1',
      payload: { message: 'Hello' },
      runAt: new Date(Date.now() + 60000)
    })
    expect(task.id).toBeDefined()
    expect(task.type).toBe('post')
    expect(task.status).toBe('pending')
  })

  it('schedules a recurring task with cron', () => {
    const task = scheduler.schedule({
      type: 'post',
      pageId: 'page1',
      payload: { message: 'Daily post' },
      cron: '0 9 * * *'
    })
    expect(task.id).toBeDefined()
    expect(task.cron).toBe('0 9 * * *')
  })

  it('lists all scheduled tasks', () => {
    scheduler.schedule({ type: 'post', pageId: 'p1', payload: { message: 'A' }, runAt: new Date(Date.now() + 60000) })
    scheduler.schedule({ type: 'like', pageId: 'p1', postId: 'post1', cron: '0 * * * *' })
    expect(scheduler.list()).toHaveLength(2)
  })

  it('cancels a scheduled task', () => {
    const task = scheduler.schedule({ type: 'post', pageId: 'p1', payload: { message: 'Cancel me' }, runAt: new Date(Date.now() + 60000) })
    scheduler.cancel(task.id)
    expect(scheduler.list()).toHaveLength(0)
  })

  it('executes a callback when task is due', async () => {
    const executed: string[] = []
    scheduler.onTaskDue(async (task) => { executed.push(task.id) })
    scheduler.schedule({ type: 'post', pageId: 'p1', payload: { message: 'Test' }, runAt: new Date(Date.now() + 50) })
    await new Promise(r => setTimeout(r, 150))
    expect(executed).toHaveLength(1)
  })

  it('marks executed task as done', async () => {
    scheduler.onTaskDue(async () => {})
    const task = scheduler.schedule({ type: 'post', pageId: 'p1', payload: { message: 'X' }, runAt: new Date(Date.now() + 50) })
    await new Promise(r => setTimeout(r, 150))
    const updated = scheduler.list()
    expect(updated[0].status).toBe('done')
  })

  it('marks task as failed when callback throws', async () => {
    scheduler.onTaskDue(async () => { throw new Error('oops') })
    const task = scheduler.schedule({ type: 'post', pageId: 'p1', payload: { message: 'X' }, runAt: new Date(Date.now() + 50) })
    await new Promise(r => setTimeout(r, 150))
    const updated = scheduler.list()
    expect(updated[0].status).toBe('failed')
    expect(updated[0].error).toBe('oops')
  })
})
