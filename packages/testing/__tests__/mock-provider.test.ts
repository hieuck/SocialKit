import { MockSocialProvider } from '../src'
import { SocialProfile, SocialPage, SocialPost, SocialComment } from '@socialkit/core'

describe('MockSocialProvider', () => {
  let provider: MockSocialProvider

  beforeEach(() => {
    provider = new MockSocialProvider()
  })

  it('has platform name', () => {
    expect(provider.platform).toBe('mock')
  })

  it('tracks method calls', async () => {
    await provider.getProfile()
    await provider.publishPost('page1', { message: 'hi' })
    await provider.likePost('post1')

    expect(provider.calls).toHaveLength(3)
    expect(provider.calls[0].method).toBe('getProfile')
    expect(provider.calls[1].args[0]).toBe('page1')
    expect(provider.calls[2].args[0]).toBe('post1')
  })

  it('returns configurable profile', async () => {
    const customProfile: SocialProfile = { id: 'custom', name: 'Custom' }
    const custom = new MockSocialProvider({ profile: customProfile })
    const result = await custom.getProfile()
    expect(result.name).toBe('Custom')
  })

  it('returns configurable page', async () => {
    const customPage: SocialPage = { id: 'custom_page', name: 'Custom Page' }
    const custom = new MockSocialProvider({ page: customPage })
    const result = await custom.getPage('any')
    expect(result.name).toBe('Custom Page')
  })

  it('returns configurable posts', async () => {
    const posts = { data: [{ id: 'p1', message: 'Custom post', createdAt: '2024-01-01' }] }
    const custom = new MockSocialProvider({ posts })
    const result = await custom.getPagePosts('any')
    expect(result.data[0].message).toBe('Custom post')
  })

  it('returns configurable token response', async () => {
    const custom = new MockSocialProvider({ token: { accessToken: 'special_token', expiresIn: 999 } })
    const result = await custom.exchangeCodeForToken('code', 'uri')
    expect(result.accessToken).toBe('special_token')
    expect(result.expiresIn).toBe(999)
  })

  it('manages access token', () => {
    provider.setAccessToken('test_tok')
    expect(provider.getAccessToken()).toBe('test_tok')
  })
})
