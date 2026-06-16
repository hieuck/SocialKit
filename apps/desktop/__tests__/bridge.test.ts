import { DesktopBridge } from '../src/bridge'
import { Session, ProviderRegistry } from '@socialkit/cli'
import { MockSocialProvider } from '@socialkit/testing'
import { mkdtempSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

function testSetup(providers?: Record<string, () => import('@socialkit/core').SocialProvider>) {
  const dir = mkdtempSync(join(tmpdir(), 'desktop-test-'))
  const sessionPath = join(dir, 'session.json')
  const session = new Session(sessionPath)
  const registry = new ProviderRegistry()
  if (providers) {
    for (const [name, fn] of Object.entries(providers)) {
      registry.register(name, fn)
    }
  }
  return { bridge: new DesktopBridge({ session, registry }), session, sessionPath }
}

describe('DesktopBridge', () => {
  it('returns help text', () => {
    const { bridge, sessionPath } = testSetup()
    bridge.run([]).then(result => {
      expect(result).toContain('Usage')
    })
    if (existsSync(sessionPath)) unlinkSync(sessionPath)
  })

  it('shows login URL for platform', async () => {
    const { bridge, sessionPath } = testSetup({ facebook: () => new MockSocialProvider() })
    const result = await bridge.run(['login', 'facebook'])
    expect(result).toContain('mock/login')
    if (existsSync(sessionPath)) unlinkSync(sessionPath)
  })

  it('publishes a post', async () => {
    const { bridge, session, sessionPath } = testSetup({ facebook: () => new MockSocialProvider() })
    session.save('facebook', 'tok')
    const result = await bridge.run(['post', '--page', 'p1', '--message', 'Hello'])
    expect(result).toContain('Posted')
    if (existsSync(sessionPath)) unlinkSync(sessionPath)
  })
})
