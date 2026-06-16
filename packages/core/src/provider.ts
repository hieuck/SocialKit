import type { SocialProfile, SocialPage, SocialPost, SocialComment, PaginatedResponse, SocialTokenResponse } from './types.js'

export interface SocialProvider {
  readonly platform: string

  setAccessToken(token: string): void
  getAccessToken(): string | undefined

  getLoginUrl(scopes: string[], redirectUri: string): string
  exchangeCodeForToken(code: string, redirectUri: string): Promise<SocialTokenResponse>
  refreshToken(token: string): Promise<SocialTokenResponse>

  getProfile(userId?: string): Promise<SocialProfile>

  getPage(pageId: string): Promise<SocialPage>
  getPagePosts(pageId: string, cursor?: string): Promise<PaginatedResponse<SocialPost>>
  publishPost(pageId: string, data: { message: string; link?: string }): Promise<{ id: string }>

  getPost(postId: string): Promise<SocialPost>
  getPostComments(postId: string, cursor?: string): Promise<PaginatedResponse<SocialComment>>
  likePost(postId: string): Promise<void>

  getComment(commentId: string): Promise<SocialComment>
  replyToComment(commentId: string, message: string): Promise<{ id: string }>
  deleteComment(commentId: string): Promise<void>
}
