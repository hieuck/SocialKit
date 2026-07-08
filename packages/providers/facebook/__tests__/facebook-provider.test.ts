import { FacebookProvider } from '../src'
import nock from 'nock'

describe('FacebookProvider', () => {
  let provider: FacebookProvider
  const config = { appId: 'app123', appSecret: 'secret456' }

  beforeEach(() => {
    provider = new FacebookProvider(config)
  })

  afterEach(() => nock.cleanAll())

  it('has platform name', () => {
    expect(provider.platform).toBe('facebook')
  })

  it('manages access token', () => {
    provider.setAccessToken('test_token')
    expect(provider.getAccessToken()).toBe('test_token')
  })

  it('returns login URL with scopes', () => {
    const url = provider.getLoginUrl(['email', 'pages_read_engagement'], 'http://localhost/callback')
    expect(url).toContain('client_id=app123')
    expect(url).toContain('scope=email%2Cpages_read_engagement')
    expect(url).toContain('dialog/oauth')
  })

  it('exchanges code for token', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/oauth/access_token')
      .query({ client_id: 'app123', client_secret: 'secret456', redirect_uri: 'http://localhost', code: 'abc' })
      .reply(200, { access_token: 'new_token', expires_in: 5184000 })

    const result = await provider.exchangeCodeForToken('abc', 'http://localhost')
    expect(result.accessToken).toBe('new_token')
    expect(result.expiresIn).toBe(5184000)
  })

  it('refreshes token', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/oauth/access_token')
      .query({ grant_type: 'fb_exchange_token', client_id: 'app123', client_secret: 'secret456', fb_exchange_token: 'short_token' })
      .reply(200, { access_token: 'long_token', expires_in: 5184000 })

    const result = await provider.refreshToken('short_token')
    expect(result.accessToken).toBe('long_token')
  })

  it('gets profile', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'user1', name: 'Alice', email: 'a@b.com' })

    provider.setAccessToken('tok')
    const result = await provider.getProfile()
    expect(result.name).toBe('Alice')
    expect(result.email).toBe('a@b.com')
  })

  it('gets page', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/page1')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'page1', name: 'Test Page', category: 'Software' })

    provider.setAccessToken('tok')
    const result = await provider.getPage('page1')
    expect(result.name).toBe('Test Page')
    expect(result.category).toBe('Software')
  })

  it('gets page posts', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/page1/posts')
      .query({ access_token: 'tok' })
      .reply(200, { data: [{ id: 'post1', message: 'Hello', created_time: '2024-01-01' }] })

    provider.setAccessToken('tok')
    const result = await provider.getPagePosts('page1')
    expect(result.data).toHaveLength(1)
    expect(result.data[0].message).toBe('Hello')
  })

  it('publishes a post', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/page1/feed', { message: 'New post' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'post_new' })

    provider.setAccessToken('tok')
    const result = await provider.publishPost('page1', { message: 'New post' })
    expect(result.id).toBe('post_new')
  })

  it('gets a post', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/post1')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'post1', message: 'Hello', created_time: '2024-01-01' })

    provider.setAccessToken('tok')
    const result = await provider.getPost('post1')
    expect(result.message).toBe('Hello')
  })

  it('gets post comments', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/post1/comments')
      .query({ access_token: 'tok' })
      .reply(200, {
        data: [{ id: 'c1', message: 'nice', from: { id: 'u1', name: 'User' }, like_count: 0, created_time: '2024-01-01' }]
      })

    provider.setAccessToken('tok')
    const result = await provider.getPostComments('post1')
    expect(result.data).toHaveLength(1)
    expect(result.data[0].message).toBe('nice')
  })

  it('likes a post', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/post1/likes')
      .query({ access_token: 'tok' })
      .reply(200, { success: true })

    provider.setAccessToken('tok')
    await expect(provider.likePost('post1')).resolves.toBeUndefined()
  })

  it('gets a comment', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/c1')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'c1', message: 'nice', like_count: 3, created_time: '2024-01-01' })

    provider.setAccessToken('tok')
    const result = await provider.getComment('c1')
    expect(result.message).toBe('nice')
    expect(result.likeCount).toBe(3)
  })

  it('replies to comment', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/c1/comments', { message: 'thanks' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'r1' })

    provider.setAccessToken('tok')
    const result = await provider.replyToComment('c1', 'thanks')
    expect(result.id).toBe('r1')
  })

  it('deletes comment', async () => {
    nock('https://graph.facebook.com')
      .delete('/v22.0/c1')
      .query({ access_token: 'tok' })
      .reply(200, { success: true })

    provider.setAccessToken('tok')
    await expect(provider.deleteComment('c1')).resolves.toBeUndefined()
  })

  it('throws RateLimitError on 429', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .query(true)
      .reply(429, { error: { message: 'rate limited', code: 429 } })

    provider.setAccessToken('tok')
    await expect(provider.getProfile()).rejects.toThrow('rate limited')
  })

  it('includes access_token in requests when set', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .query({ access_token: 'my_token' })
      .reply(200, { id: '1', name: 'Test' })

    provider.setAccessToken('my_token')
    const result = await provider.getProfile()
    expect(result.name).toBe('Test')
  })

  it('gets profile with explicit userId', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/user_456')
      .query({ access_token: 'tok' })
      .reply(200, { id: '456', name: 'Bob', email: 'b@b.com' })

    provider.setAccessToken('tok')
    const result = await provider.getProfile('user_456')
    expect(result.id).toBe('456')
    expect(result.name).toBe('Bob')
  })

  it('publishes post with link', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/page1/feed', { message: 'Check this', link: 'https://example.com' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'post_link_1' })

    provider.setAccessToken('tok')
    const result = await provider.publishPost('page1', { message: 'Check this', link: 'https://example.com' })
    expect(result.id).toBe('post_link_1')
  })

  it('throws AuthError on 401', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .query(true)
      .reply(401, { error: { message: 'invalid token', code: 401, type: 'OAuthException' } })

    provider.setAccessToken('tok')
    await expect(provider.getProfile()).rejects.toThrow('invalid token')
  })

  it('handles pagination cursor on getPagePosts', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/page1/posts')
      .query({ access_token: 'tok', cursor: 'next_page' })
      .reply(200, { data: [{ id: 'p2', message: 'Page 2', created_time: '2024-01-02' }] })

    provider.setAccessToken('tok')
    const result = await provider.getPagePosts('page1', 'next_page')
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('p2')
  })
})
