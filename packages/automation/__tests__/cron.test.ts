import { Scheduler } from '../src/scheduler'

describe('Scheduler cron', () => {
  let scheduler: Scheduler

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-15T09:30:00Z'))
    scheduler = new Scheduler()
  })

  afterEach(() => {
    scheduler.stop()
    jest.useRealTimers()
  })

  it('does NOT execute when day-of-month does not match', () => {
    const executed: string[] = []
    scheduler.onTaskDue(async (t) => { executed.push(t.id) })
    scheduler.schedule({ type: 'post', pageId: 'p1', payload: {}, cron: '* * 20 * *' })

    jest.advanceTimersByTime(61000)

    expect(executed).toHaveLength(0)
  })

  it('does NOT execute when month does not match', () => {
    const executed: string[] = []
    scheduler.onTaskDue(async (t) => { executed.push(t.id) })
    scheduler.schedule({ type: 'post', pageId: 'p1', payload: {}, cron: '* * * 7 *' })

    jest.advanceTimersByTime(61000)

    expect(executed).toHaveLength(0)
  })

  it('does NOT execute when day-of-week does not match', () => {
    const executed: string[] = []
    scheduler.onTaskDue(async (t) => { executed.push(t.id) })
    scheduler.schedule({ type: 'post', pageId: 'p1', payload: {}, cron: '* * * * 1' })

    jest.advanceTimersByTime(61000)

    expect(executed).toHaveLength(0)
  })

  it('stores cron expression on the task', () => {
    const task = scheduler.schedule({ type: 'post', pageId: 'p1', payload: {}, cron: '30 9 15 6 6' })
    expect(task.cron).toBe('30 9 15 6 6')
  })
})
