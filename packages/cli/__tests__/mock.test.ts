import { MockProvider } from '../src/mock'

describe('MockProvider', () => {
  const provider = new MockProvider('facebook')

  it('has platform name', () => {
    expect(provider.platform).toBe('facebook')
  })

  it('manages access token', () => {
    provider.setAccessToken('tok')
    expect(provider.getAccessToken()).toBe('tok')
  })

  it('returns login URL with platform name', () => {
    const url = provider.getLoginUrl(['email'], 'http://localhost')
    expect(url).toContain('facebook.mock/login')
  })

  it('exchanges code for mock token', async () => {
    const result = await provider.exchangeCodeForToken('code', 'uri')
    expect(result.accessToken).toBe('mock_token')
  })

  it('gets profile with platform name', async () => {
    const profile = await provider.getProfile()
    expect(profile.name).toContain('facebook')
    expect(profile.email).toContain('facebook.mock')
  })

  it('publishes post with incrementing id', async () => {
    const r1 = await provider.publishPost('p1', { message: 'First' })
    const r2 = await provider.publishPost('p2', { message: 'Second' })
    expect(r1.id).toBe('mock_post_1')
    expect(r2.id).toBe('mock_post_2')
  })

  it('implements all SocialProvider methods', async () => {
    await expect(provider.getPost('p1')).resolves.toBeDefined()
    await expect(provider.getPage('p1')).resolves.toBeDefined()
    await expect(provider.getPagePosts('p1')).resolves.toBeDefined()
    await expect(provider.getPostComments('p1')).resolves.toBeDefined()
    await expect(provider.likePost('p1')).resolves.toBeUndefined()
    await expect(provider.getComment('c1')).resolves.toBeDefined()
    await expect(provider.replyToComment('c1', 'hi')).resolves.toBeDefined()
    await expect(provider.deleteComment('c1')).resolves.toBeUndefined()
    await expect(provider.refreshToken('old')).resolves.toBeDefined()
  })
})
