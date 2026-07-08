import { Cli } from '../src/cli'
import { Session } from '../src/session'
import { ProviderRegistry } from '../src/registry'
import { MockSocialProvider } from '@socialkit/testing'
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

function testSession(): Session {
  const dir = mkdtempSync(join(tmpdir(), 'cli-test-'))
  return new Session(join(dir, 'session.json'))
}

describe('Cli', () => {
  it('returns help message for empty args', async () => {
    const cli = new Cli({ session: testSession(), registry: new ProviderRegistry() })
    const result = await cli.run([])
    expect(result).toContain('Usage')
  })

  it('returns help for unknown command', async () => {
    const cli = new Cli({ session: testSession(), registry: new ProviderRegistry() })
    const result = await cli.run(['unknown'])
    expect(result).toContain('Usage')
  })

  it('shows login URL for known platform', async () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())

    const cli = new Cli({ session: testSession(), registry })
    const result = await cli.run(['login', 'facebook'])
    expect(result).toContain('mock/login')
  })

  it('errors for unknown platform', async () => {
    const cli = new Cli({ session: testSession(), registry: new ProviderRegistry() })
    const result = await cli.run(['login', 'unknown'])
    expect(result).toContain('Unknown platform')
  })

  it('shows whoami with profile info', async () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => {
      const p = new MockSocialProvider({ profile: { id: '1', name: 'Alice', email: 'a@b.com' } })
      p.setAccessToken('tok')
      return p
    })
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['whoami'])
    expect(result).toContain('Alice')
    expect(result).toContain('a@b.com')
  })

  it('publishes a post', async () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['post', '--page', 'p1', '--message', 'Hello'])
    expect(result).toContain('Posted')
  })

  it('handles provider errors gracefully', async () => {
    const provider = new MockSocialProvider()
    provider.setAccessToken('tok')
    jest.spyOn(provider, 'getProfile').mockRejectedValue(new Error('API timeout'))

    const registry = new ProviderRegistry()
    registry.register('facebook', () => provider)
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['whoami'])
    expect(result).toBe('Error: API timeout')
  })

  it('handles unknown errors gracefully', async () => {
    const provider = new MockSocialProvider()
    provider.setAccessToken('tok')
    jest.spyOn(provider, 'getProfile').mockRejectedValue('raw string error')

    const registry = new ProviderRegistry()
    registry.register('facebook', () => provider)
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['whoami'])
    expect(result).toBe('Error: raw string error')
  })

  it('runs a workflow from a file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cli-workflow-test-'))
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'announce',
      name: 'Announce',
      steps: [{ id: 'post1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }))

    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    const session = testSession()
    session.save('facebook', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['workflow', 'run', file])
    expect(result).toContain('Workflow announce completed')

    rmSync(dir, { recursive: true, force: true })
  })

  it('runs a workflow with explicit --platform', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cli-workflow-test-'))
    const file = join(dir, 'workflow.json')
    writeFileSync(file, JSON.stringify({
      id: 'cross',
      name: 'Cross',
      steps: [{ id: 'post1', action: 'post', inputs: { pageId: 'p1', message: 'Hi' } }],
    }))

    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    registry.register('instagram', () => new MockSocialProvider())
    const session = testSession()
    session.save('instagram', 'tok')

    const cli = new Cli({ session, registry })
    const result = await cli.run(['workflow', 'run', file, '--platform', 'facebook'])
    expect(result).toContain('Workflow cross completed')

    rmSync(dir, { recursive: true, force: true })
  })
})
