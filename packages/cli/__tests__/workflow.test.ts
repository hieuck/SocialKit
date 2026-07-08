import { workflowCommand } from '../src/workflow'
import { MockSocialProvider } from '@socialkit/testing'
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
