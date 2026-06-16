import { whoamiCommand } from '../src/whoami'
import { postCommand } from '../src/post'
import { MockSocialProvider } from '@socialkit/testing'

describe('whoamiCommand', () => {
  it('returns profile name', async () => {
    const provider = new MockSocialProvider({ profile: { id: '1', name: 'Alice' } })
    const result = await whoamiCommand(provider)
    expect(result).toContain('Alice')
  })

  it('includes email if available', async () => {
    const provider = new MockSocialProvider({ profile: { id: '1', name: 'Alice', email: 'a@b.com' } })
    const result = await whoamiCommand(provider)
    expect(result).toContain('a@b.com')
  })
})

describe('postCommand', () => {
  it('publishes a post and returns result id', async () => {
    const provider = new MockSocialProvider()
    const result = await postCommand(provider, { page: 'page1', message: 'Hello' })
    expect(result).toContain('new_post_mock')
  })
})
