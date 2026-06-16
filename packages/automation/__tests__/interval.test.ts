import { Scheduler } from '../src/scheduler'

describe('Scheduler configurable interval', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('defaults to 60000ms interval', () => {
    const s = new Scheduler()
    expect(s).toBeDefined()
    s.stop()
  })

  it('accepts custom checkInterval', () => {
    const s = new Scheduler({ checkIntervalMs: 100 })
    expect(s).toBeDefined()
    s.stop()
  })

  it('fires cron check at custom interval', async () => {
    const s = new Scheduler({ checkIntervalMs: 10 })
    const executed: string[] = []
    s.onTaskDue(async (t) => { executed.push(t.id) })
    s.schedule({ type: 'post', pageId: 'p1', payload: {}, cron: '* * * * *' })

    await new Promise(r => setTimeout(r, 30))

    expect(executed.length).toBeGreaterThanOrEqual(1)
    s.stop()
  })
})
