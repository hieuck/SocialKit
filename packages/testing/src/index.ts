import {
  SocialProvider,
  SocialProfile,
  SocialPage,
  SocialPost,
  SocialComment,
  SocialTokenResponse,
  PaginatedResponse,
} from '@socialkit/core'

export interface MockConfig {
  profile?: SocialProfile
  page?: SocialPage
  posts?: PaginatedResponse<SocialPost>
  post?: SocialPost
  comments?: PaginatedResponse<SocialComment>
  comment?: SocialComment
  token?: SocialTokenResponse
}

export class MockSocialProvider implements SocialProvider {
  readonly platform = 'mock'
  private _token?: string

  calls: { method: string; args: unknown[] }[] = []

  private config: Required<MockConfig> = {
    profile: { id: 'mock_user_1', name: 'Mock User', email: 'mock@test.com' },
    page: { id: 'mock_page_1', name: 'Mock Page', category: 'Testing' },
    posts: { data: [{ id: 'post_1', message: 'Mock post', createdAt: '2024-01-01' }] },
    post: { id: 'post_1', message: 'Mock post', createdAt: '2024-01-01' },
    comments: { data: [{ id: 'comment_1', message: 'Mock comment', createdAt: '2024-01-01', likeCount: 1 }] },
    comment: { id: 'comment_1', message: 'Mock comment', createdAt: '2024-01-01', likeCount: 1 },
    token: { accessToken: 'mock_access_token', expiresIn: 3600 },
  }

  constructor(customConfig?: MockConfig) {
    if (customConfig) Object.assign(this.config, customConfig)
  }

  private track(method: string, ...args: unknown[]): void {
    this.calls.push({ method, args })
  }

  setAccessToken(token: string): void { this._token = token }
  getAccessToken(): string | undefined { return this._token }

  getLoginUrl(scopes: string[], redirectUri: string): string {
    this.track('getLoginUrl', scopes, redirectUri)
    return 'https://mock/login'
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<SocialTokenResponse> {
    this.track('exchangeCodeForToken', code, redirectUri)
    return this.config.token
  }

  async refreshToken(token: string): Promise<SocialTokenResponse> {
    this.track('refreshToken', token)
    return this.config.token
  }

  async getProfile(userId?: string): Promise<SocialProfile> {
    this.track('getProfile', userId)
    return this.config.profile
  }

  async getPage(pageId: string): Promise<SocialPage> {
    this.track('getPage', pageId)
    return this.config.page
  }

  async getPagePosts(pageId: string, cursor?: string): Promise<PaginatedResponse<SocialPost>> {
    this.track('getPagePosts', pageId, cursor)
    return this.config.posts
  }

  async publishPost(pageId: string, _data: { message: string; link?: string }): Promise<{ id: string }> {
    this.track('publishPost', pageId, _data)
    return { id: 'new_post_mock' }
  }

  async getPost(postId: string): Promise<SocialPost> {
    this.track('getPost', postId)
    return this.config.post
  }

  async getPostComments(postId: string, cursor?: string): Promise<PaginatedResponse<SocialComment>> {
    this.track('getPostComments', postId, cursor)
    return this.config.comments
  }

  async likePost(postId: string): Promise<void> {
    this.track('likePost', postId)
  }

  async getComment(commentId: string): Promise<SocialComment> {
    this.track('getComment', commentId)
    return this.config.comment
  }

  async replyToComment(commentId: string, _message: string): Promise<{ id: string }> {
    this.track('replyToComment', commentId, _message)
    return { id: 'reply_mock' }
  }

  async deleteComment(commentId: string): Promise<void> {
    this.track('deleteComment', commentId)
  }
}
