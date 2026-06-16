import type { SocialProvider, SocialProfile, SocialPage, SocialPost, SocialComment, PaginatedResponse, SocialTokenResponse } from '@socialkit/core'

export class MockProvider implements SocialProvider {
  readonly platform: string
  private _token?: string
  private nextId = 1

  constructor(platform: string) { this.platform = platform }

  setAccessToken(t: string): void { this._token = t }
  getAccessToken(): string | undefined { return this._token }

  getLoginUrl(_scopes: string[], _redirectUri: string): string {
    return `https://${this.platform}.mock/login?client_id=mock`
  }

  async exchangeCodeForToken(_code: string, _redirectUri: string): Promise<SocialTokenResponse> {
    return { accessToken: 'mock_token', expiresIn: 3600 }
  }

  async refreshToken(_token: string): Promise<SocialTokenResponse> {
    return { accessToken: 'mock_token', expiresIn: 3600 }
  }

  async getProfile(_userId?: string): Promise<SocialProfile> {
    return { id: 'mock_user', name: `Mock ${this.platform} User`, email: `user@${this.platform}.mock` }
  }

  async getPage(_pageId: string): Promise<SocialPage> {
    return { id: 'mock_page', name: `Mock ${this.platform} Page` }
  }

  async getPagePosts(_pageId: string, _cursor?: string): Promise<PaginatedResponse<SocialPost>> {
    return { data: [{ id: 'post_1', message: 'Mock post', createdAt: '2024-01-01' }] }
  }

  async publishPost(_pageId: string, _data: { message: string; link?: string }): Promise<{ id: string }> {
    return { id: `mock_post_${this.nextId++}` }
  }

  async getPost(_postId: string): Promise<SocialPost> {
    return { id: _postId, message: 'Mock post content', createdAt: '2024-01-01' }
  }

  async getPostComments(_postId: string, _cursor?: string): Promise<PaginatedResponse<SocialComment>> {
    return { data: [{ id: 'c1', message: 'Mock comment', createdAt: '2024-01-01', likeCount: 1 }] }
  }

  async likePost(_postId: string): Promise<void> {}

  async getComment(_commentId: string): Promise<SocialComment> {
    return { id: _commentId, message: 'Mock comment', createdAt: '2024-01-01', likeCount: 1 }
  }

  async replyToComment(_commentId: string, _message: string): Promise<{ id: string }> {
    return { id: 'reply_mock' }
  }

  async deleteComment(_commentId: string): Promise<void> {}
}
