# Provider Contract

Every social platform provider must implement `SocialProvider` from `@socialkit/core`:

```typescript
interface SocialProvider {
  readonly platform: string

  // Token management
  setAccessToken(token: string): void
  getAccessToken(): string | undefined

  // OAuth
  getLoginUrl(scopes: string[], redirectUri: string): string
  exchangeCodeForToken(code: string, redirectUri: string): Promise<SocialTokenResponse>
  refreshToken(token: string): Promise<SocialTokenResponse>

  // Profile
  getProfile(userId?: string): Promise<SocialProfile>

  // Pages
  getPage(pageId: string): Promise<SocialPage>
  getPagePosts(pageId: string, cursor?: string): Promise<PaginatedResponse<SocialPost>>
  publishPost(pageId: string, data: { message: string; link?: string }): Promise<{ id: string }>

  // Posts
  getPost(postId: string): Promise<SocialPost>
  getPostComments(postId: string, cursor?: string): Promise<PaginatedResponse<SocialComment>>
  likePost(postId: string): Promise<void>

  // Comments
  getComment(commentId: string): Promise<SocialComment>
  replyToComment(commentId: string, message: string): Promise<{ id: string }>
  deleteComment(commentId: string): Promise<void>
}
```

## Error Contract

All providers must map platform errors to the SocialKit hierarchy:

| HTTP Status | SocialKit Error |
|-------------|----------------|
| 429         | RateLimitError  |
| 401         | AuthError       |
| Other       | PlatformError   |

## Naming Convention

- Package: `@socialkit/provider-{platform}`
- Class: `{Platform}Provider` (e.g., `FacebookProvider`)
- File: `{platform}-provider.ts`
