import { InstagramProvider } from '../src'
import nock from 'nock'

describe('InstagramProvider', () => {
  let provider: InstagramProvider
  const config = { appId: 'app123', appSecret: 'secret456', igUserId: 'ig_user_1' }

  beforeEach(() => {
    provider = new InstagramProvider(config)
  })

  afterEach(() => nock.cleanAll())

  it('has platform name', () => {
    expect(provider.platform).toBe('instagram')
  })

  it('manages access token', () => {
    provider.setAccessToken('test_token')
    expect(provider.getAccessToken()).toBe('test_token')
  })

  it('returns login URL with scopes', () => {
    const url = provider.getLoginUrl(['instagram_basic', 'instagram_content_publish'], 'http://localhost/callback')
    expect(url).toContain('client_id=app123')
    expect(url).toContain('scope=instagram_basic%2Cinstagram_content_publish')
    expect(url).toContain('dialog/oauth')
  })

  it('exchanges code for token', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/oauth/access_token')
      .query({ client_id: 'app123', client_secret: 'secret456', redirect_uri: 'http://localhost', code: 'abc' })
      .reply(200, { access_token: 'ig_token', expires_in: 5184000 })

    const result = await provider.exchangeCodeForToken('abc', 'http://localhost')
    expect(result.accessToken).toBe('ig_token')
    expect(result.expiresIn).toBe(5184000)
  })

  it('gets Instagram profile (business account)', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/ig_user_1')
      .query({ access_token: 'tok', fields: 'id,name,username,profile_picture_url' })
      .reply(200, { id: 'ig_user_1', name: 'My Business', username: 'mybusiness', profile_picture_url: 'https://pic.url' })

    provider.setAccessToken('tok')
    const result = await provider.getProfile()
    expect(result.name).toBe('My Business')
    expect(result.pictureUrl).toBe('https://pic.url')
  })

  it('gets media (posts)', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/ig_user_1/media')
      .query({ access_token: 'tok' })
      .reply(200, { data: [{ id: 'media_1', caption: 'Hello', media_type: 'IMAGE', timestamp: '2024-01-01T00:00:00+0000' }] })

    provider.setAccessToken('tok')
    const result = await provider.getPagePosts('ig_user_1')
    expect(result.data).toHaveLength(1)
    expect(result.data[0].message).toBe('Hello')
  })

  it('publishes a post (create container + publish)', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/ig_user_1/media', { image_url: 'https://example.com/pic.jpg', caption: 'Nice photo' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'container_1' })

    nock('https://graph.facebook.com')
      .post('/v22.0/ig_user_1/media_publish', { creation_id: 'container_1' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'published_media_1' })

    provider.setAccessToken('tok')
    const result = await provider.publishPost('ig_user_1', { message: 'Nice photo', link: 'https://example.com/pic.jpg' })
    expect(result.id).toBe('published_media_1')
  })

  it('gets a single media item', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/media_1')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'media_1', caption: 'Single post', media_type: 'CAROUSEL', timestamp: '2024-01-01T00:00:00+0000' })

    provider.setAccessToken('tok')
    const result = await provider.getPost('media_1')
    expect(result.message).toBe('Single post')
  })

  it('gets comments on media', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/media_1/comments')
      .query({ access_token: 'tok' })
      .reply(200, { data: [{ id: 'c1', text: 'Nice!', username: 'user1', timestamp: '2024-01-01T00:00:00+0000' }] })

    provider.setAccessToken('tok')
    const result = await provider.getPostComments('media_1')
    expect(result.data).toHaveLength(1)
    expect(result.data[0].message).toBe('Nice!')
  })

  it('replies to a comment', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/media_1/comments', { message: 'Thanks!' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'reply_1' })

    provider.setAccessToken('tok')
    const result = await provider.replyToComment('media_1', 'Thanks!')
    expect(result.id).toBe('reply_1')
  })

  it('deletes a comment', async () => {
    nock('https://graph.facebook.com')
      .delete('/v22.0/c1')
      .query({ access_token: 'tok' })
      .reply(200, { success: true })

    provider.setAccessToken('tok')
    await expect(provider.deleteComment('c1')).resolves.toBeUndefined()
  })

  it('throws PlatformError for likePost (not supported)', async () => {
    await expect(provider.likePost('media_1')).rejects.toThrow()
  })

  it('gets a single comment', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/c1')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'c1', text: 'Great!', username: 'user1', timestamp: '2024-01-01T00:00:00+0000', like_count: 2 })

    provider.setAccessToken('tok')
    const result = await provider.getComment('c1')
    expect(result.message).toBe('Great!')
    expect(result.likeCount).toBe(2)
  })
})
