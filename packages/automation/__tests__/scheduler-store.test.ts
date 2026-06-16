import { Scheduler } from '../src/scheduler'
import { TaskStore } from '../src/task-store'
import { mkdtempSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Scheduler with TaskStore', () => {
  let tmpFile: string

  beforeEach(() => {
    tmpFile = join(mkdtempSync(join(tmpdir(), 'sched-store-')), 'tasks.json')
  })

  afterEach(() => {
    if (existsSync(tmpFile)) unlinkSync(tmpFile)
  })

  it('loads persisted tasks on init', () => {
    const s1 = new Scheduler({ store: new TaskStore(tmpFile) })
    s1.schedule({ type: 'post', pageId: 'p1', payload: { message: 'A' }, runAt: new Date(Date.now() + 99999) })
    s1.stop()

    const s2 = new Scheduler({ store: new TaskStore(tmpFile) })
    expect(s2.list()).toHaveLength(1)
    expect(s2.list()[0].pageId).toBe('p1')
    s2.stop()
  })

  it('removes from store on cancel', () => {
    const s = new Scheduler({ store: new TaskStore(tmpFile) })
    const task = s.schedule({ type: 'post', pageId: 'p1', payload: { message: 'X' }, runAt: new Date(Date.now() + 99999) })
    s.cancel(task.id)
    s.stop()

    const store = new TaskStore(tmpFile)
    expect(store.list()).toHaveLength(0)
  })

  it('does not require a store', () => {
    const s = new Scheduler()
    const task = s.schedule({ type: 'post', pageId: 'p1', payload: { message: 'X' }, runAt: new Date(Date.now() + 99999) })
    expect(task.id).toBeDefined()
    s.stop()
  })
})
