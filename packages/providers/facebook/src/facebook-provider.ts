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

interface FacebookProviderConfig {
  appId: string
  appSecret: string
  apiVersion?: string
}

interface FacebookErrorBody {
  error?: { message: string; code: number; type: string; error_subcode?: number }
}

export class FacebookProvider implements SocialProvider {
  readonly platform = 'facebook'
  private baseUrl: string
  private token?: string

  constructor(private config: FacebookProviderConfig) {
    const version = config.apiVersion ?? 'v22.0'
    this.baseUrl = `https://graph.facebook.com/${version}`
  }

  setAccessToken(token: string): void {
    this.token = token
  }

  getAccessToken(): string | undefined {
    return this.token
  }

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
    const id = userId ?? 'me'
    const resp = await this.apiGet<{ id: string; name: string; email?: string; picture?: { data: { url: string } } }>(`/${id}`)
    return { id: resp.id, name: resp.name, email: resp.email, pictureUrl: resp.picture?.data?.url }
  }

  async getPage(pageId: string): Promise<SocialPage> {
    const resp = await this.apiGet<{ id: string; name: string; category?: string }>(`/${pageId}`)
    return { id: resp.id, name: resp.name, category: resp.category }
  }

  async getPagePosts(pageId: string, cursor?: string): Promise<PaginatedResponse<SocialPost>> {
    const params: Record<string, string> = {}
    if (cursor) params.cursor = cursor
    const resp = await this.apiGet<{ data: FacebookPostItem[]; paging?: { cursors: { after: string }; next?: string } }>(`/${pageId}/posts`, params)
    return this.mapPosts(resp)
  }

  async publishPost(pageId: string, data: { message: string; link?: string }): Promise<{ id: string }> {
    const body: Record<string, unknown> = { message: data.message }
    if (data.link) body.link = data.link
    return this.apiPost<{ id: string }>(`/${pageId}/feed`, body)
  }

  async getPost(postId: string): Promise<SocialPost> {
    const resp = await this.apiGet<FacebookPostItem>(`/${postId}`)
    return this.mapPost(resp)
  }

  async getPostComments(postId: string, cursor?: string): Promise<PaginatedResponse<SocialComment>> {
    const params: Record<string, string> = {}
    if (cursor) params.cursor = cursor
    const resp = await this.apiGet<{
      data: FacebookCommentItem[]
      paging?: { cursors: { after: string }; next?: string }
    }>(`/${postId}/comments`, params)
    return this.mapComments(resp)
  }

  async likePost(postId: string): Promise<void> {
    await this.apiPost<{ success: boolean }>(`/${postId}/likes`, {})
  }

  async getComment(commentId: string): Promise<SocialComment> {
    const resp = await this.apiGet<FacebookCommentItem>(`/${commentId}`)
    return this.mapComment(resp)
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
    const body: T & FacebookErrorBody = await res.json()
    if (!res.ok) {
      const fbErr = body?.error
      const message = fbErr?.message ?? `HTTP ${res.status}`
      if (res.status === 429) throw new RateLimitError(message, 60)
      if (res.status === 401 || fbErr?.type === 'OAuthException') throw new AuthError(message, 'invalid_token')
      throw new PlatformError(message, res.status)
    }
    return body as T
  }

  private mapPosts(resp: { data: FacebookPostItem[]; paging?: { cursors: { after: string }; next?: string } }): PaginatedResponse<SocialPost> {
    return {
      data: resp.data.map(p => this.mapPost(p)),
      cursor: resp.paging?.cursors?.after,
      hasMore: !!resp.paging?.next,
    }
  }

  private mapPost(p: FacebookPostItem): SocialPost {
    return {
      id: p.id,
      message: p.message,
      createdAt: p.created_time,
      updatedAt: p.updated_time,
    }
  }

  private mapComments(resp: {
    data: FacebookCommentItem[]
    paging?: { cursors: { after: string }; next?: string }
  }): PaginatedResponse<SocialComment> {
    return {
      data: resp.data.map(c => this.mapComment(c)),
      cursor: resp.paging?.cursors?.after,
      hasMore: !!resp.paging?.next,
    }
  }

  private mapComment(c: FacebookCommentItem): SocialComment {
    return {
      id: c.id,
      message: c.message,
      author: c.from ? { id: c.from.id, name: c.from.name } : undefined,
      createdAt: c.created_time,
      likeCount: c.like_count ?? 0,
    }
  }
}

interface FacebookPostItem {
  id: string
  message?: string
  created_time: string
  updated_time?: string
}

interface FacebookCommentItem {
  id: string
  message: string
  from?: { id: string; name: string }
  created_time: string
  like_count?: number
}
