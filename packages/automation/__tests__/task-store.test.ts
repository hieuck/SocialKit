import { TaskStore } from '../src/task-store'
import { ScheduledTask } from '../src/scheduler'
import { mkdtempSync, existsSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

function makeTask(overrides: Partial<ScheduledTask> = {}): ScheduledTask {
  return { id: 't1', type: 'post', pageId: 'p1', status: 'pending', ...overrides }
}

describe('TaskStore', () => {
  let tmpFile: string

  beforeEach(() => {
    tmpFile = join(mkdtempSync(join(tmpdir(), 'taskstore-')), 'tasks.json')
  })

  afterEach(() => {
    if (existsSync(tmpFile)) unlinkSync(tmpFile)
  })

  it('returns empty array when no file exists', () => {
    const store = new TaskStore(tmpFile)
    expect(store.load()).toEqual([])
  })

  it('saves and loads a task', () => {
    const store = new TaskStore(tmpFile)
    store.save(makeTask())
    const loaded = store.load()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('t1')
  })

  it('persists task data across instances', () => {
    const s1 = new TaskStore(tmpFile)
    s1.save(makeTask({ id: 't1', pageId: 'p1', type: 'post' }))
    s1.save(makeTask({ id: 't2', pageId: 'p2', type: 'like' }))

    const s2 = new TaskStore(tmpFile)
    expect(s2.load()).toHaveLength(2)
    expect(s2.list()).toHaveLength(2)
  })

  it('deletes a task by id', () => {
    const store = new TaskStore(tmpFile)
    store.save(makeTask({ id: 't1' }))
    store.save(makeTask({ id: 't2' }))
    expect(store.delete('t1')).toBe(true)
    expect(store.list()).toHaveLength(1)
    expect(store.list()[0].id).toBe('t2')
  })

  it('returns false when deleting nonexistent task', () => {
    const store = new TaskStore(tmpFile)
    expect(store.delete('nonexistent')).toBe(false)
  })

  it('overwrites existing task with same id', () => {
    const store = new TaskStore(tmpFile)
    store.save(makeTask({ id: 't1', status: 'pending' }))
    store.save(makeTask({ id: 't1', status: 'done' }))
    expect(store.list()).toHaveLength(1)
    expect(store.list()[0].status).toBe('done')
  })
})
