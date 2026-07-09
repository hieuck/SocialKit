import { workflowCommand, scheduleWorkflowCommand } from '../src/workflow'
import { MockSocialProvider } from '@socialkit/testing'
import { TaskStore } from '@socialkit/automation'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

function tempDir(): string {
  return tmpdir() + '/sk-workflow-test-' + Date.now()
}

describe('workflowCommand', () => {
  it('runs a workflow from a JSON file', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w1',
      name: 'Test',
      steps: [{ id: 's1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const provider = new MockSocialProvider()
    provider.setAccessToken('tok')
    const result = await workflowCommand(provider, { subcommand: 'run', file })

    expect(result).toContain('Workflow w1 completed')
    expect(result).toContain('s1:')

    rmSync(dir, { recursive: true, force: true })
  })

  it('returns usage for missing file', async () => {
    const provider = new MockSocialProvider()
    const result = await workflowCommand(provider, { subcommand: 'run', file: '' })
    expect(result).toContain('Usage')
  })

  it('returns error for missing file path', async () => {
    const provider = new MockSocialProvider()
    const result = await workflowCommand(provider, { subcommand: 'run', file: '/does/not/exist.json' })
    expect(result).toContain('Error: Invalid workflow JSON')
  })

  it('returns error for invalid JSON', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'bad.json')
    writeFileSync(file, '{ not json')
    const provider = new MockSocialProvider()
    const result = await workflowCommand(provider, { subcommand: 'run', file })
    expect(result).toContain('Error: Invalid workflow JSON')
    rmSync(dir, { recursive: true, force: true })
  })

  it('returns error for invalid workflow shape', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'bad.json')
    writeFileSync(file, JSON.stringify({ id: 'w1' }))
    const provider = new MockSocialProvider()
    const result = await workflowCommand(provider, { subcommand: 'run', file })
    expect(result).toContain('Error: Invalid workflow')
    rmSync(dir, { recursive: true, force: true })
  })

  it('reports workflow failure', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w1',
      name: 'Test',
      steps: [{ id: 's1', action: 'like', inputs: { postId: 'p1' } }],
    }))

    const provider = new MockSocialProvider()
    jest.spyOn(provider, 'likePost').mockRejectedValue(new Error('Post not found'))

    const result = await workflowCommand(provider, { subcommand: 'run', file })
    expect(result).toContain('Workflow w1 failed at step s1')
    expect(result).toContain('Post not found')

    rmSync(dir, { recursive: true, force: true })
  })
})

describe('scheduleWorkflowCommand', () => {
  it('schedules a workflow at a specific time', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w1',
      name: 'Test',
      steps: [{ id: 's1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file, at: '2099-01-01T00:00:00Z' })

    expect(result).toContain('Scheduled:')
    expect(result).toContain('workflow: w1')

    rmSync(dir, { recursive: true, force: true })
  })

  it('schedules a workflow with cron', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w2',
      name: 'Weekly',
      steps: [{ id: 's1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file, cron: '0 9 * * 1' })

    expect(result).toContain('Scheduled:')
    expect(result).toContain('workflow: w2')
    expect(result).toContain('cron 0 9 * * 1')

    rmSync(dir, { recursive: true, force: true })
  })

  it('lists scheduled workflows', async () => {
    const store = new TaskStore(join(tempDir(), 'tasks.json'))
    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', list: 'true' }, store)
    expect(result).toContain('Scheduled workflows')
  })

  it('cancels a scheduled workflow', async () => {
    const dir = tempDir()
    mkdirSync(dir, { recursive: true })
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'w1',
      name: 'Test',
      steps: [{ id: 's1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const store = new TaskStore(join(dir, 'tasks.json'))
    const provider = new MockSocialProvider()
    const scheduled = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file, at: '2099-01-01T00:00:00Z' }, store)
    const taskId = scheduled.split('\n')[0].replace('Scheduled: ', '').trim()

    const cancelled = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', cancel: taskId }, store)
    expect(cancelled).toContain(`Cancelled: ${taskId}`)

    rmSync(dir, { recursive: true, force: true })
  })

  it('returns error when both --at and --cron are provided', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file: './x.json', at: '2099-01-01T00:00:00Z', cron: '0 9 * * 1' })
    expect(result).toContain('Specify only one of --at or --cron')
  })

  it('returns error when neither --at nor --cron is provided', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file: './x.json' })
    expect(result).toContain('Specify --at or --cron')
  })

  it('returns error for invalid --at value', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file: './x.json', at: 'not-a-date' })
    expect(result).toContain('Error: Invalid --at value')
  })

  it('returns error for invalid --cron value', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleWorkflowCommand(provider, { subcommand: 'schedule', file: './x.json', cron: 'invalid' })
    expect(result).toContain('Error: Invalid --cron value')
  })
})
