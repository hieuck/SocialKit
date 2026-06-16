import {
  SocialProvider,
  SocialProfile,
  SocialPage,
  SocialPost,
  SocialComment,
  PaginatedResponse,
  SocialTokenResponse,
  PlatformError,
} from '@socialkit/core'

interface ZaloProviderConfig {
  appId: string
  appSecret: string
}

interface ZaloApiResponse<T> {
  error: number
  message: string
  data?: T
}

export class ZaloProvider implements SocialProvider {
  readonly platform = 'zalo'
  private token?: string
  private baseUrl = 'https://openapi.zalo.me/v2.0'
  private oauthUrl = 'https://oauth.zaloapp.com/v4/oa/permission'

  constructor(private config: ZaloProviderConfig) {}

  setAccessToken(token: string): void { this.token = token }
  getAccessToken(): string | undefined { return this.token }

  getLoginUrl(scopes: string[], redirectUri = 'https://localhost/callback'): string {
    const params = new URLSearchParams({
      app_id: this.config.appId,
      redirect_uri: redirectUri,
      permissions: scopes.join(','),
    })
    return `${this.oauthUrl}?${params.toString()}`
  }

  async exchangeCodeForToken(_code: string, _redirectUri: string): Promise<SocialTokenResponse> {
    const resp = await this.rawApi<{ access_token: string; expires_in: number }>('POST', '/oa/access_token', {
      app_id: this.config.appId,
      app_secret: this.config.appSecret,
      code: _code,
      redirect_uri: _redirectUri,
    })
    return { accessToken: resp.access_token, expiresIn: resp.expires_in }
  }

  async refreshToken(_token: string): Promise<SocialTokenResponse> {
    const resp = await this.rawApi<{ access_token: string; expires_in: number }>('POST', '/oa/refresh_token', {
      app_id: this.config.appId,
      app_secret: this.config.appSecret,
      refresh_token: _token,
    })
    return { accessToken: resp.access_token, expiresIn: resp.expires_in }
  }

  async getProfile(_userId?: string): Promise<SocialProfile> {
    const resp = await this.apiGet<{ oa_id: string; name: string; avatar?: string; description?: string }>('/oa/getprofile')
    return { id: resp.oa_id, name: resp.name, pictureUrl: resp.avatar }
  }

  async getPage(_pageId: string): Promise<SocialPage> {
    const resp = await this.apiGet<{ oa_id: string; name: string; avatar?: string }>('/oa/getprofile')
    return { id: resp.oa_id, name: resp.name }
  }

  async getPagePosts(_pageId: string, _cursor?: string): Promise<PaginatedResponse<SocialPost>> {
    throw new PlatformError('Zalo OA has no feed/posts API', 400)
  }

  async publishPost(_pageId: string, data: { message: string; link?: string }): Promise<{ id: string }> {
    const payload: Record<string, unknown> = { text: data.message }
    const resp = await this.apiPost<{ message_id: string }>('/oa/sendtext', payload)
    return { id: resp.message_id }
  }

  async getPost(_postId: string): Promise<SocialPost> {
    throw new PlatformError('Zalo OA has no post retrieval API', 400)
  }

  async getPostComments(_postId: string, _cursor?: string): Promise<PaginatedResponse<SocialComment>> {
    throw new PlatformError('Zalo OA has no comments API', 400)
  }

  async likePost(_postId: string): Promise<void> {
    throw new PlatformError('Zalo OA has no like API', 400)
  }

  async getComment(_commentId: string): Promise<SocialComment> {
    throw new PlatformError('Zalo OA has no comment retrieval API', 400)
  }

  async replyToComment(userId: string, message: string): Promise<{ id: string }> {
    const resp = await this.apiPost<{ message_id: string }>('/oa/message', { user_id: userId, text: message })
    return { id: resp.message_id }
  }

  async deleteComment(_commentId: string): Promise<void> {
    throw new PlatformError('Zalo OA has no comment deletion API', 400)
  }

  private apiGet<T>(path: string): Promise<T> {
    return this.rawApi<T>('GET', path, undefined, this.token ? { access_token: this.token } : undefined)
  }

  private apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
    return this.rawApi<T>('POST', path, body, this.token ? { access_token: this.token } : undefined)
  }

  private async rawApi<T>(method: string, path: string, body?: Record<string, unknown>, query?: Record<string, string>): Promise<T> {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const url = new URL(cleanPath, base)
    if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v))

    const init: RequestInit = { method }
    if (body) {
      init.headers = { 'Content-Type': 'application/json' }
      init.body = JSON.stringify(body)
    }

    const res = await fetch(url.toString(), init)
    const json: ZaloApiResponse<T> = await res.json()

    if (json.error !== 0) {
      throw new PlatformError(json.message || `Zalo API error #${json.error}`, json.error)
    }

    return json.data as T
  }
}
