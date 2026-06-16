import { Cli, Session, ProviderRegistry } from '@socialkit/cli'
import { MockSocialProvider, MockConfig } from '@socialkit/testing'
import { mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

async function demo() {
  const dir = mkdtempSync(join(tmpdir(), 'socialkit-demo-'))
  const session = new Session(join(dir, 'session.json'))
  const registry = new ProviderRegistry()

  // Inject MockSocialProvider cho cả 3 platform
  const mockConfig: MockConfig = {
    profile: { id: 'demo_user_1', name: 'Demo User', email: 'demo@socialkit.dev', pictureUrl: 'https://example.com/avatar.png' },
    token: { accessToken: 'demo_token_abc', expiresIn: 3600 },
  }

  registry.register('facebook', () => {
    const p = new MockSocialProvider(mockConfig)
    return p
  })

  registry.register('instagram', () => new MockSocialProvider(mockConfig))
  registry.register('zalo', () => new MockSocialProvider(mockConfig))

  const cli = new Cli({ session, registry })

  console.log('=== SocialKit Demo (mock mode) ===')
  console.log()

  // 1. Help
  console.log('▶  help')
  console.log(await cli.run([]))
  console.log()

  // 2. Login — generate URL
  console.log('▶  login facebook')
  const loginResult = await cli.run(['login', 'facebook'])
  console.log(loginResult)
  console.log()

  // 3. Exchange code (mock)
  session.save('facebook', 'demo_token_abc')
  console.log('✅  Token saved to session')
  console.log()

  // 4. Whoami
  console.log('▶  whoami')
  const whoamiResult = await cli.run(['whoami'])
  console.log(whoamiResult)
  console.log()

  // 5. Post
  console.log('▶  post --page me --message "Hello from SocialKit!"')
  const postResult = await cli.run(['post', '--page', 'me', '--message', 'Hello from SocialKit!'])
  console.log(postResult)
  console.log()

  // 6. Schedule
  console.log('▶  schedule --page me --message "Scheduled post" --at "2099-01-01T09:00:00Z"')
  const schedResult = await cli.run(['schedule', '--page', 'me', '--message', 'Scheduled post', '--at', '2099-01-01T09:00:00Z'])
  console.log(schedResult)
  console.log()

  // 7. Configure
  console.log('▶  configure facebook')
  console.log('facebook:')
  console.log('  appId: demo_123')
  console.log('  appSecret: demo_secret')
  console.log()

  // 8. Daemon (no pending tasks)
  console.log('▶  daemon')
  const daemonResult = await cli.run(['daemon'])
  console.log(daemonResult)
  console.log()

  console.log('=== Demo complete ===')
  console.log('No real API calls made. All data is mocked.')
}

demo().catch(err => {
  console.error('Demo error:', err)
  process.exit(1)
})
