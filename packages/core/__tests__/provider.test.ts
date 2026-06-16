import { SocialProvider, SocialProfile, SocialPage, SocialPost, SocialComment, PaginatedResponse, SocialTokenResponse } from '../src'

class MockProvider implements SocialProvider {
  platform = 'mock'
  private token?: string

  setAccessToken(token: string): void { this.token = token }
  getAccessToken(): string | undefined { return this.token }

  getLoginUrl(_scopes: string[], _redirectUri: string): string { return 'https://mock/login' }
  async exchangeCodeForToken(_code: string, _redirectUri: string): Promise<SocialTokenResponse> {
    return { accessToken: 'mock_token', expiresIn: 3600 }
  }
  async refreshToken(_token: string): Promise<SocialTokenResponse> {
    return { accessToken: 'new_token', expiresIn: 3600 }
  }

  async getProfile(_userId?: string): Promise<SocialProfile> {
    return { id: '1', name: 'Mock User' }
  }

  async getPage(_pageId: string): Promise<SocialPage> {
    return { id: 'page1', name: 'Mock Page' }
  }
  async getPagePosts(_pageId: string, _cursor?: string): Promise<PaginatedResponse<SocialPost>> {
    return { data: [{ id: 'post1', message: 'hi', createdAt: '2024-01-01' }] }
  }
  async publishPost(_pageId: string, _data: { message: string; link?: string }): Promise<{ id: string }> {
    return { id: 'new_post' }
  }

  async getPost(_postId: string): Promise<SocialPost> {
    return { id: 'post1', message: 'hello', createdAt: '2024-01-01' }
  }
  async getPostComments(_postId: string, _cursor?: string): Promise<PaginatedResponse<SocialComment>> {
    return { data: [{ id: 'c1', message: 'nice', createdAt: '2024-01-01', likeCount: 1 }] }
  }
  async likePost(_postId: string): Promise<void> {}

  async getComment(_commentId: string): Promise<SocialComment> {
    return { id: 'c1', message: 'nice', createdAt: '2024-01-01', likeCount: 1 }
  }
  async replyToComment(_commentId: string, _message: string): Promise<{ id: string }> {
    return { id: 'reply1' }
  }
  async deleteComment(_commentId: string): Promise<void> {}
}

describe('SocialProvider interface', () => {
  let provider: MockProvider

  beforeEach(() => {
    provider = new MockProvider()
  })

  it('has platform name', () => {
    expect(provider.platform).toBe('mock')
  })

  it('manages access token', () => {
    provider.setAccessToken('test_token')
    expect(provider.getAccessToken()).toBe('test_token')
  })

  it('returns login URL', () => {
    const url = provider.getLoginUrl(['email'], 'http://localhost/callback')
    expect(url).toContain('mock/login')
  })

  it('exchanges code for token', async () => {
    const result = await provider.exchangeCodeForToken('code', 'http://localhost/callback')
    expect(result.accessToken).toBe('mock_token')
  })

  it('refreshes token', async () => {
    const result = await provider.refreshToken('old_token')
    expect(result.accessToken).toBe('new_token')
  })

  it('gets profile', async () => {
    const profile = await provider.getProfile()
    expect(profile.name).toBe('Mock User')
  })

  it('gets page', async () => {
    const page = await provider.getPage('page1')
    expect(page.name).toBe('Mock Page')
  })

  it('gets page posts', async () => {
    const posts = await provider.getPagePosts('page1')
    expect(posts.data).toHaveLength(1)
    expect(posts.data[0].message).toBe('hi')
  })

  it('publishes post', async () => {
    const result = await provider.publishPost('page1', { message: 'new post' })
    expect(result.id).toBe('new_post')
  })

  it('gets post', async () => {
    const post = await provider.getPost('post1')
    expect(post.message).toBe('hello')
  })

  it('gets post comments', async () => {
    const comments = await provider.getPostComments('post1')
    expect(comments.data[0].message).toBe('nice')
  })

  it('likes a post', async () => {
    await expect(provider.likePost('post1')).resolves.toBeUndefined()
  })

  it('gets comment', async () => {
    const comment = await provider.getComment('c1')
    expect(comment.likeCount).toBe(1)
  })

  it('replies to comment', async () => {
    const result = await provider.replyToComment('c1', 'thanks')
    expect(result.id).toBe('reply1')
  })

  it('deletes comment', async () => {
    await expect(provider.deleteComment('c1')).resolves.toBeUndefined()
  })
})
