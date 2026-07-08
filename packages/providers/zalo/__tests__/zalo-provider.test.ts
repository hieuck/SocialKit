import { ZaloProvider } from '../src'
import nock from 'nock'

describe('ZaloProvider', () => {
  let provider: ZaloProvider
  const config = { appId: 'app123', appSecret: 'secret456' }

  beforeEach(() => {
    provider = new ZaloProvider(config)
  })

  afterEach(() => nock.cleanAll())

  it('has platform name', () => {
    expect(provider.platform).toBe('zalo')
  })

  it('manages access token', () => {
    provider.setAccessToken('test_token')
    expect(provider.getAccessToken()).toBe('test_token')
  })

  it('returns login URL with OA permissions', () => {
    const url = provider.getLoginUrl(['send_message', 'access_profile'], 'http://localhost/callback')
    expect(url).toContain('app_id=app123')
    expect(url).toContain('send_message')
    expect(url).toContain('access_profile')
    expect(url).toContain('oauth.zaloapp.com')
  })

  it('gets OA profile', async () => {
    nock('https://openapi.zalo.me')
      .get('/v2.0/oa/getprofile')
      .query({ access_token: 'tok' })
      .reply(200, { error: 0, message: 'Success', data: { oa_id: 'oa1', name: 'My OA', avatar: 'https://avatar.url', description: 'Zalo page' } })

    provider.setAccessToken('tok')
    const result = await provider.getProfile()
    expect(result.name).toBe('My OA')
    expect(result.pictureUrl).toBe('https://avatar.url')
  })

  it('gets page (OA info)', async () => {
    nock('https://openapi.zalo.me')
      .get('/v2.0/oa/getprofile')
      .query({ access_token: 'tok' })
      .reply(200, { error: 0, message: 'Success', data: { oa_id: 'oa1', name: 'My OA', avatar: 'https://avatar.url' } })

    provider.setAccessToken('tok')
    const result = await provider.getPage('oa1')
    expect(result.name).toBe('My OA')
  })

  it('publishes a broadcast message', async () => {
    nock('https://openapi.zalo.me')
      .post('/v2.0/oa/sendtext', { text: 'Hello followers!' })
      .query({ access_token: 'tok' })
      .reply(200, { error: 0, message: 'Success', data: { message_id: 'msg_1' } })

    provider.setAccessToken('tok')
    const result = await provider.publishPost('oa1', { message: 'Hello followers!' })
    expect(result.id).toBe('msg_1')
  })

  it('replies to a user message', async () => {
    nock('https://openapi.zalo.me')
      .post('/v2.0/oa/message', { user_id: 'user1', text: 'Thanks for your message' })
      .query({ access_token: 'tok' })
      .reply(200, { error: 0, message: 'Success', data: { message_id: 'reply_1' } })

    provider.setAccessToken('tok')
    const result = await provider.replyToComment('user1', 'Thanks for your message')
    expect(result.id).toBe('reply_1')
  })

  it('throws for getPagePosts (not supported)', async () => {
    await expect(provider.getPagePosts('oa1')).rejects.toThrow()
  })

  it('throws for getPost (not supported)', async () => {
    await expect(provider.getPost('any')).rejects.toThrow()
  })

  it('throws for getPostComments (not supported)', async () => {
    await expect(provider.getPostComments('any')).rejects.toThrow()
  })

  it('throws for likePost (not supported)', async () => {
    await expect(provider.likePost('any')).rejects.toThrow()
  })

  it('throws for getComment (not supported)', async () => {
    await expect(provider.getComment('any')).rejects.toThrow()
  })

  it('throws for deleteComment (not supported)', async () => {
    await expect(provider.deleteComment('any')).rejects.toThrow()
  })
})
