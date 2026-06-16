import {
  SocialProvider,
  SocialProfile,
  SocialPage,
  SocialPost,
  SocialComment,
  PaginatedResponse,
  SocialTokenResponse,
  PlatformError,
  RateLimitError,
  AuthError,
} from '@socialkit/core'

interface InstagramProviderConfig {
  appId: string
  appSecret: string
  igUserId: string
  apiVersion?: string
}

interface ErrorBody {
  error?: { message: string; code: number; type: string }
}

export class InstagramProvider implements SocialProvider {
  readonly platform = 'instagram'
  private baseUrl: string
  private token?: string
  private igUserId: string

  constructor(private config: InstagramProviderConfig) {
    const version = config.apiVersion ?? 'v22.0'
    this.baseUrl = `https://graph.facebook.com/${version}`
    this.igUserId = config.igUserId
  }

  setAccessToken(token: string): void { this.token = token }
  getAccessToken(): string | undefined { return this.token }

  getLoginUrl(scopes: string[], redirectUri = 'https://localhost/callback'): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: redirectUri,
      scope: scopes.join(','),
      response_type: 'code',
    })
    return `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<SocialTokenResponse> {
    const resp = await this.rawGet<{ access_token: string; expires_in: number }>('/oauth/access_token', {
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      redirect_uri: redirectUri,
      code,
    })
    return { accessToken: resp.access_token, expiresIn: resp.expires_in }
  }

  async refreshToken(token: string): Promise<SocialTokenResponse> {
    const resp = await this.rawGet<{ access_token: string; expires_in: number }>('/oauth/access_token', {
      grant_type: 'fb_exchange_token',
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      fb_exchange_token: token,
    })
    return { accessToken: resp.access_token, expiresIn: resp.expires_in }
  }

  async getProfile(userId?: string): Promise<SocialProfile> {
    const id = userId ?? this.igUserId
    const resp = await this.apiGet<{ id: string; name: string; username?: string; profile_picture_url?: string }>(`/${id}`, { fields: 'id,name,username,profile_picture_url' })
    return { id: resp.id, name: resp.name, pictureUrl: resp.profile_picture_url }
  }

  async getPage(pageId: string): Promise<SocialPage> {
    const resp = await this.apiGet<{ id: string; name: string }>(`/${pageId}`)
    return { id: resp.id, name: resp.name }
  }

  async getPagePosts(_pageId: string, cursor?: string): Promise<PaginatedResponse<SocialPost>> {
    const params: Record<string, string> = {}
    if (cursor) params.after = cursor
    const resp = await this.apiGet<{ data: InstagramMediaItem[]; paging?: { cursors: { after: string }; next?: string } }>(`/${this.igUserId}/media`, params)
    return {
      data: resp.data.map(m => ({
        id: m.id,
        message: m.caption,
        createdAt: m.timestamp,
      })),
      cursor: resp.paging?.cursors?.after,
      hasMore: !!resp.paging?.next,
    }
  }

  async publishPost(pageId: string, data: { message: string; link?: string }): Promise<{ id: string }> {
    const container = await this.apiPost<{ id: string }>(`/${pageId}/media`, {
      image_url: data.link,
      caption: data.message,
    })
    const published = await this.apiPost<{ id: string }>(`/${pageId}/media_publish`, {
      creation_id: container.id,
    })
    return { id: published.id }
  }

  async getPost(postId: string): Promise<SocialPost> {
    const resp = await this.apiGet<InstagramMediaItem>(`/${postId}`)
    return { id: resp.id, message: resp.caption, createdAt: resp.timestamp }
  }

  async getPostComments(postId: string, cursor?: string): Promise<PaginatedResponse<SocialComment>> {
    const params: Record<string, string> = {}
    if (cursor) params.after = cursor
    const resp = await this.apiGet<{ data: InstagramCommentItem[]; paging?: { cursors: { after: string }; next?: string } }>(`/${postId}/comments`, params)
    return {
      data: resp.data.map(c => ({
        id: c.id,
        message: c.text,
        author: c.username ? { id: c.username, name: c.username } : undefined,
        createdAt: c.timestamp,
        likeCount: c.like_count ?? 0,
      })),
      cursor: resp.paging?.cursors?.after,
      hasMore: !!resp.paging?.next,
    }
  }

  async likePost(_postId: string): Promise<void> {
    throw new PlatformError('Likes not supported via Instagram Graph API', 400)
  }

  async getComment(commentId: string): Promise<SocialComment> {
    const resp = await this.apiGet<InstagramCommentItem>(`/${commentId}`)
    return {
      id: resp.id,
      message: resp.text,
      author: resp.username ? { id: resp.username, name: resp.username } : undefined,
      createdAt: resp.timestamp,
      likeCount: resp.like_count ?? 0,
    }
  }

  async replyToComment(commentId: string, message: string): Promise<{ id: string }> {
    return this.apiPost<{ id: string }>(`/${commentId}/comments`, { message })
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.apiDelete(`/${commentId}`)
  }

  private authParams(): Record<string, string> {
    return this.token ? { access_token: this.token } : {}
  }

  private async rawGet<T>(path: string, query?: Record<string, string>): Promise<T> {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const url = new URL(cleanPath, base)
    if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v))
    return this.fetchJson<T>(url.toString())
  }

  private async apiGet<T>(path: string, extra?: Record<string, string>): Promise<T> {
    return this.rawGet<T>(path, { ...this.authParams(), ...extra })
  }

  private async apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const url = new URL(cleanPath, base)
    Object.entries(this.authParams()).forEach(([k, v]) => url.searchParams.set(k, v))
    return this.fetchJson<T>(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  private async apiDelete(path: string): Promise<void> {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : this.baseUrl + '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const url = new URL(cleanPath, base)
    Object.entries(this.authParams()).forEach(([k, v]) => url.searchParams.set(k, v))
    await this.fetchJson(url.toString(), { method: 'DELETE' })
  }

  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init)
    const body: T & ErrorBody = await res.json()
    if (!res.ok) {
      const fbErr = body?.error
      const message = fbErr?.message ?? `HTTP ${res.status}`
      if (res.status === 429) throw new RateLimitError(message, 60)
      if (res.status === 401 || fbErr?.type === 'OAuthException') throw new AuthError(message, 'invalid_token')
      throw new PlatformError(message, res.status)
    }
    return body as T
  }
}

interface InstagramMediaItem {
  id: string
  caption?: string
  media_type?: string
  media_url?: string
  timestamp: string
}

interface InstagramCommentItem {
  id: string
  text: string
  username?: string
  timestamp: string
  like_count?: number
}
