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

Zalo exception: Zalo API uses `{ error: number, message: string }` in response body (not HTTP status codes). ZaloProvider maps `error !== 0` to `PlatformError`.

## Platform-Specific Differences

Not all social platforms support every SocialProvider method. Providers should throw `PlatformError` for unsupported operations.

| Method | Facebook | Instagram | Zalo OA |
|--------|----------|-----------|---------|
| `getLoginUrl` | ✅ `facebook.com/dialog/oauth` | ✅ Same (Meta OAuth) | ✅ `oauth.zaloapp.com/v4/oa/permission` |
| `exchangeCodeForToken` | ✅ GET `/oauth/access_token` | ✅ Same | ✅ POST `/oa/access_token` |
| `refreshToken` | ✅ GET `/oauth/access_token` | ✅ Same | ✅ POST `/oa/refresh_token` |
| `getProfile` | ✅ `/me` | ✅ `/{ig-user}` fields=id,name,username | ✅ GET `/oa/getprofile` |
| `getPage` | ✅ `/{page-id}` | ✅ `/{ig-user}` | ✅ Same as getProfile (OA) |
| `getPagePosts` | ✅ `/{page}/posts` | ✅ `/{ig-user}/media` | ❌ No feed API |
| `publishPost` | ✅ `/{page}/feed` POST | ✅ Two-step: create container → publish | ✅ POST `/oa/sendtext` (broadcast) |
| `getPost` | ✅ `/{post-id}` | ✅ `/{media-id}` | ❌ No post API |
| `getPostComments` | ✅ `/{post}/comments` | ✅ `/{media}/comments` | ❌ No comments API |
| `likePost` | ✅ `/{post}/likes` POST | ❌ Not supported | ❌ Not supported |
| `getComment` | ✅ `/{comment-id}` | ✅ `/{comment-id}` | ❌ No comment API |
| `replyToComment` | ✅ `/{comment}/comments` POST | ✅ `/{media}/comments` POST | ✅ POST `/oa/message` (to user) |
| `deleteComment` | ✅ `/{comment-id}` DELETE | ✅ `/{comment-id}` DELETE | ❌ Not supported |

## Naming Convention

- Package: `@socialkit/provider-{platform}`
- Class: `{Platform}Provider` (e.g., `FacebookProvider`)
- File: `{platform}-provider.ts`
