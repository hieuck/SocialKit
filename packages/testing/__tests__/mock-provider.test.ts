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

  it('returns login URL', () => {
    const url = provider.getLoginUrl(['email'], 'http://redirect')
    expect(url).toContain('mock/login')
  })

  it('refreshes token', async () => {
    const result = await provider.refreshToken('old')
    expect(result.accessToken).toBeDefined()
  })

  it('returns configurable post', async () => {
    const custom = new MockSocialProvider({ post: { id: 'p1', message: 'Custom', createdAt: '2024-01-01' } })
    const result = await custom.getPost('p1')
    expect(result.message).toBe('Custom')
  })

  it('returns configurable comments', async () => {
    const comments = { data: [{ id: 'c1', message: 'Nice', createdAt: '2024-01-01', likeCount: 2 }] }
    const custom = new MockSocialProvider({ comments })
    const result = await custom.getPostComments('p1')
    expect(result.data[0].message).toBe('Nice')
  })

  it('returns configurable comment', async () => {
    const custom = new MockSocialProvider({ comment: { id: 'c1', message: 'Great', createdAt: '2024-01-01', likeCount: 5 } })
    const result = await custom.getComment('c1')
    expect(result.message).toBe('Great')
    expect(result.likeCount).toBe(5)
  })

  it('replies to comment', async () => {
    const result = await provider.replyToComment('c1', 'thanks')
    expect(result.id).toBe('reply_mock')
  })

  it('deletes comment', async () => {
    await expect(provider.deleteComment('c1')).resolves.toBeUndefined()
  })

  it('likes a post', async () => {
    await expect(provider.likePost('p1')).resolves.toBeUndefined()
  })
})
