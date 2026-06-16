import { daemonCommand, DaemonResult } from '../src/daemon'
import { TaskStore } from '@socialkit/automation'
import { MockSocialProvider } from '@socialkit/testing'
import { mkdtempSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('daemonCommand', () => {
  let tmpFile: string
  let result: DaemonResult | null

  beforeEach(() => {
    tmpFile = join(mkdtempSync(join(tmpdir(), 'daemon-test-')), 'tasks.json')
    result = null
  })

  afterEach(() => {
    result?.stop()
    if (existsSync(tmpFile)) unlinkSync(tmpFile)
  })

  it('returns no-tasks message when store is empty', () => {
    result = daemonCommand(new MockSocialProvider(), { taskFilePath: tmpFile })
    expect(result.message).toContain('No pending tasks')
  })

  it('reports pending tasks count from store', () => {
    const store = new TaskStore(tmpFile)
    store.save({ id: 't1', type: 'post', pageId: 'p1', status: 'pending', runAt: new Date(Date.now() + 99999), payload: { message: 'Hi' } })

    result = daemonCommand(new MockSocialProvider(), { taskFilePath: tmpFile })
    expect(result.message).toContain('1 pending task')
  })

  it('stops cleanly without hanging', () => {
    result = daemonCommand(new MockSocialProvider(), { taskFilePath: tmpFile })
    result.stop()
    expect(result.message).toBeDefined()
  })
})
