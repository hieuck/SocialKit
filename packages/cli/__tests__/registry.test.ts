import { ProviderRegistry } from '../src/registry'
import { Session } from '../src/session'
import { MockSocialProvider } from '@socialkit/testing'
import { mkdtempSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('ProviderRegistry', () => {
  it('returns undefined for unknown platform', () => {
    const registry = new ProviderRegistry()
    expect(registry.get('unknown')).toBeUndefined()
  })

  it('creates provider from registered factory', () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    const provider = registry.get('facebook')
    expect(provider?.platform).toBe('mock')
  })

  it('lists registered platforms', () => {
    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())
    registry.register('instagram', () => new MockSocialProvider())
    expect(registry.list()).toEqual(['facebook', 'instagram'])
  })

  it('resolves provider with session token', () => {
    const tmp = join(mkdtempSync(join(tmpdir(), 'reg-test-')), 'session.json')
    const session = new Session(tmp)
    session.save('facebook', 'tok_123')

    const registry = new ProviderRegistry()
    registry.register('facebook', () => new MockSocialProvider())

    const provider = registry.resolve(session)
    expect(provider).toBeDefined()
    expect(provider!.getAccessToken()).toBe('tok_123')

    if (existsSync(tmp)) unlinkSync(tmp)
  })

  it('returns undefined when no active platform', () => {
    const registry = new ProviderRegistry()
    const session = new Session(join(mkdtempSync(join(tmpdir(), 'reg-test-')), 'empty.json'))
    expect(registry.resolve(session)).toBeUndefined()
  })
})
