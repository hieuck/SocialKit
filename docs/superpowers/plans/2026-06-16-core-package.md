# Core Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `core` package — a type-safe Facebook Graph API wrapper with auth, resource modules, rate limiting, and typed errors.

**Architecture:** Single NPM package in a monorepo. HTTP client with injectable transport, typed resource modules (User, Page, Post, Comment), error hierarchy. TDD-first with nock-based mocking.

**Tech Stack:** TypeScript 5.x, Jest + ts-jest, nock for HTTP mocking, NPM Workspaces.

---

### Task 1: Initialize Monorepo Root + Core Package

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "facebook-toolkit",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "test": "npm run test --workspaces --if-present",
    "test:cov": "npm run test:cov --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "lint": "npx eslint packages/*/src"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.0",
    "@types/jest": "^29.5.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "exclude": ["node_modules", "dist", "**/__tests__/**"]
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
dist/
coverage/
.env
*.log
```

- [ ] **Step 4: Create packages/core/package.json**

```json
{
  "name": "@facebook-toolkit/core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "test": "jest --verbose",
    "test:cov": "jest --coverage --coverageThreshold={\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}",
    "test:tdd": "jest --watch",
    "build": "tsc"
  },
  "dependencies": {
    "nock": "^14.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 5: Create packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/__tests__/**"]
}
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: packages/core/node_modules created, no errors.

---

### Task 2: Core Types + Error Hierarchy

**Files:**
- Create: `packages/core/src/types/facebook.ts`
- Create: `packages/core/src/errors/fb-errors.ts`
- Test: `packages/core/__tests__/errors/fb-errors.test.ts`

- [ ] **Step 1: Write failing error tests**

```typescript
// packages/core/__tests__/errors/fb-errors.test.ts
import { FacebookError, RateLimitError, AuthError } from '../../src/errors/fb-errors.js'

describe('FacebookError', () => {
  it('creates with message, code, and type', () => {
    const err = new FacebookError('test', 400, 'OAuthException')
    expect(err.message).toBe('test')
    expect(err.code).toBe(400)
    expect(err.type).toBe('OAuthException')
    expect(err).toBeInstanceOf(Error)
  })
})

describe('RateLimitError', () => {
  it('creates with retryAfter', () => {
    const err = new RateLimitError('rate limited', 17)
    expect(err.message).toBe('rate limited')
    expect(err.retryAfter).toBe(17)
    expect(err).toBeInstanceOf(FacebookError)
  })

  it('defaults code to 429 and type to RateLimitError', () => {
    const err = new RateLimitError('too fast', 30)
    expect(err.code).toBe(429)
    expect(err.type).toBe('RateLimitError')
  })
})

describe('AuthError', () => {
  it('creates with reason', () => {
    const err = new AuthError('invalid token', 'invalid_token')
    expect(err.message).toBe('invalid token')
    expect(err.reason).toBe('invalid_token')
    expect(err).toBeInstanceOf(FacebookError)
  })

  it('defaults code to 401 and type to AuthError', () => {
    const err = new AuthError('bad', 'expired_token')
    expect(err.code).toBe(401)
    expect(err.type).toBe('AuthError')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest packages/core/__tests__/errors/fb-errors.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Create error classes**

```typescript
// packages/core/src/errors/fb-errors.ts
export class FacebookError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly type: string
  ) {
    super(message)
    this.name = 'FacebookError'
  }
}

export class RateLimitError extends FacebookError {
  constructor(
    message: string,
    public readonly retryAfter: number
  ) {
    super(message, 429, 'RateLimitError')
    this.name = 'RateLimitError'
  }
}

export class AuthError extends FacebookError {
  constructor(
    message: string,
    public readonly reason: 'invalid_token' | 'expired_token' | 'insufficient_permissions'
  ) {
    super(message, 401, 'AuthError')
    this.name = 'AuthError'
  }
}
```

- [ ] **Step 4: Create Facebook types**

```typescript
// packages/core/src/types/facebook.ts
export interface FacebookUser {
  id: string
  name: string
  email?: string
  picture?: FacebookPicture
}

export interface FacebookPicture {
  data: {
    height: number
    width: number
    is_silhouette: boolean
    url: string
  }
}

export interface FacebookPage {
  id: string
  name: string
  access_token?: string
  category?: string
  category_list?: FacebookCategory[]
}

export interface FacebookCategory {
  id: string
  name: string
}

export interface FacebookPost {
  id: string
  message?: string
  created_time: string
  updated_time?: string
  attachments?: { data: FacebookAttachment[] }
}

export interface FacebookAttachment {
  media_type: string
  title?: string
  url?: string
}

export interface FacebookComment {
  id: string
  message: string
  from?: { id: string; name: string }
  created_time: string
  like_count: number
  attachment?: { media: { source: string } }
}

export interface FacebookPaginatedResponse<T> {
  data: T[]
  paging?: {
    cursors: { before: string; after: string }
    next?: string
    previous?: string
  }
}

export interface FacebookConfig {
  appId: string
  appSecret: string
  apiVersion?: string
}
```

- [ ] **Step 5: Create barrel export**

```typescript
// packages/core/src/errors/index.ts
export * from './fb-errors.js'

// packages/core/src/types/index.ts
export * from './facebook.js'
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest packages/core/__tests__/errors/fb-errors.test.ts`
Expected: PASS (3 test suites, ~5+ tests)

---

### Task 3: HTTP Client with Injectable Transport

**Files:**
- Create: `packages/core/src/client/transport.ts`
- Create: `packages/core/src/client/fb-client.ts`
- Create: `packages/core/src/client/index.ts`
- Test: `packages/core/__tests__/client/fb-client.test.ts`
- Test: `packages/core/__tests__/client/transport.test.ts`

- [ ] **Step 1: Write failing transport tests**

```typescript
// packages/core/__tests__/client/transport.test.ts
import { HttpClient, HttpError } from '../../src/client/transport.js'
import nock from 'nock'

describe('HttpClient', () => {
  let client: HttpClient

  beforeEach(() => {
    client = new HttpClient('https://graph.facebook.com/v22.0')
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('makes GET request and returns JSON', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .query({ access_token: 'tok' })
      .reply(200, { id: '123', name: 'Test' })

    const result = await client.get('/me', { access_token: 'tok' })
    expect(result).toEqual({ id: '123', name: 'Test' })
  })

  it('throws HttpError on non-2xx response', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .reply(400, { error: { message: 'invalid', code: 400, type: 'OAuthException' } })

    await expect(client.get('/me')).rejects.toThrow(HttpError)
  })

  it('throws HttpError with status code', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .reply(429, { error: { message: 'too fast', code: 429 } })

    try {
      await client.get('/me')
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError)
      expect((e as HttpError).status).toBe(429)
    }
  })

  it('makes POST request with body', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/feed', { message: 'hello' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'post_123' })

    const result = await client.post('/feed', { message: 'hello' }, { access_token: 'tok' })
    expect(result).toEqual({ id: 'post_123' })
  })
})
```

- [ ] **Step 2: Run transport tests to verify failure**

Run: `npx jest packages/core/__tests__/client/transport.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement transport layer**

```typescript
// packages/core/src/client/transport.ts
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export interface HttpClientOptions {
  baseUrl: string
  defaultParams?: Record<string, string>
}

export class HttpClient {
  private baseUrl: string
  private defaultParams: Record<string, string>

  constructor(options: HttpClientOptions)
  constructor(baseUrl: string, defaultParams?: Record<string, string>)
  constructor(...args: unknown[]) {
    if (typeof args[0] === 'object') {
      const opts = args[0] as HttpClientOptions
      this.baseUrl = opts.baseUrl
      this.defaultParams = opts.defaultParams ?? {}
    } else {
      this.baseUrl = args[0] as string
      this.defaultParams = (args[1] as Record<string, string>) ?? {}
    }
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, this.baseUrl)
    const allParams = { ...this.defaultParams, ...params }
    Object.entries(allParams).forEach(([k, v]) => url.searchParams.set(k, v))
    return url.toString()
  }

  async get<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params)
    const res = await fetch(url)
    const body = await res.json()
    if (!res.ok) throw new HttpError(body?.error?.message ?? 'HTTP error', res.status, body)
    return body as T
  }

  async post<T = unknown>(path: string, data: Record<string, unknown>, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const body = await res.json()
    if (!res.ok) throw new HttpError(body?.error?.message ?? 'HTTP error', res.status, body)
    return body as T
  }
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx jest packages/core/__tests__/client/transport.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing fb-client tests**

```typescript
// packages/core/__tests__/client/fb-client.test.ts
import { FacebookClient } from '../../src/client/fb-client.js'
import { HttpClient } from '../../src/client/transport.js'
import nock from 'nock'

describe('FacebookClient', () => {
  const config = { appId: '123', appSecret: 'secret' }

  beforeEach(() => { nock.cleanAll() })

  it('creates with config and default API version', () => {
    const client = new FacebookClient(config)
    expect(client).toBeDefined()
  })

  it('creates with custom API version', () => {
    const client = new FacebookClient({ ...config, apiVersion: 'v21.0' })
    expect(client).toBeDefined()
  })

  it('provides auth module', () => {
    const client = new FacebookClient(config)
    expect(client.auth).toBeDefined()
  })

  it('provides user module', () => {
    const client = new FacebookClient(config)
    expect(client.user).toBeDefined()
  })
})
```

- [ ] **Step 6: Run fb-client tests to verify failure**

Run: `npx jest packages/core/__tests__/client/fb-client.test.ts`
Expected: FAIL

- [ ] **Step 7: Implement fb-client**

```typescript
// packages/core/src/client/fb-client.ts
import { HttpClient } from './transport.js'
import { AuthModule } from '../auth/oauth.js'
import { UserModule } from '../resources/user.js'

export interface FacebookClientConfig {
  appId: string
  appSecret: string
  apiVersion?: string
}

export class FacebookClient {
  private http: HttpClient
  private _token?: string

  auth: AuthModule
  user: UserModule

  constructor(config: FacebookClientConfig) {
    const version = config.apiVersion ?? 'v22.0'
    this.http = new HttpClient(`https://graph.facebook.com/${version}`)
    this.auth = new AuthModule(this.http, config)
    this.user = new UserModule(this.http)
  }

  setAccessToken(token: string): void {
    this._token = token
  }

  getAccessToken(): string | undefined {
    return this._token
  }

  getHttpClient(): HttpClient {
    return this.http
  }
}
```

- [ ] **Step 8: Create stubs for auth and user modules (needed by fb-client)**

```typescript
// packages/core/src/auth/oauth.ts
import { HttpClient } from '../client/transport.js'

export class AuthModule {
  constructor(
    private http: HttpClient,
    private config: { appId: string; appSecret: string }
  ) {}
}
```

```typescript
// packages/core/src/resources/user.ts
import { HttpClient } from '../client/transport.js'

export class UserModule {
  constructor(private http: HttpClient) {}
}
```

- [ ] **Step 9: Run all tests to verify pass**

Run: `npx jest`
Expected: all tests pass

---

### Task 4: Auth Module — Token Management

**Files:**
- Modify: `packages/core/src/auth/oauth.ts`
- Create: `packages/core/src/auth/index.ts`
- Test: `packages/core/__tests__/auth/oauth.test.ts`

- [ ] **Step 1: Write failing auth tests**

```typescript
// packages/core/__tests__/auth/oauth.test.ts
import { AuthModule } from '../../src/auth/oauth.js'
import { HttpClient } from '../../src/client/transport.js'
import { AuthError } from '../../src/errors/fb-errors.js'
import nock from 'nock'

describe('AuthModule', () => {
  const http = new HttpClient('https://graph.facebook.com/v22.0')
  const config = { appId: 'app123', appSecret: 'secret456' }
  let auth: AuthModule

  beforeEach(() => {
    auth = new AuthModule(http, config)
    nock.cleanAll()
  })

  it('returns login URL with scopes', () => {
    const url = auth.getLoginUrl(['email', 'pages_read_engagement'])
    expect(url).toContain('app_id=app123')
    expect(url).toContain('scope=email,pages_read_engagement')
    expect(url).toContain('oauth/authorize')
  })

  it('exchangeCodeForToken calls and returns token', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/oauth/access_token')
      .query({ client_id: 'app123', client_secret: 'secret456', redirect_uri: 'http://localhost', code: 'abc' })
      .reply(200, { access_token: 'new_token', expires_in: 5184000 })

    const result = await auth.exchangeCodeForToken('abc', 'http://localhost')
    expect(result).toEqual({ access_token: 'new_token', expires_in: 5184000 })
  })

  it('inspectToken returns token metadata', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/debug_token')
      .query({ input_token: 'tok1', access_token: 'app123|secret456' })
      .reply(200, { data: { is_valid: true, user_id: '123' } })

    const result = await auth.inspectToken('tok1')
    expect(result.data.is_valid).toBe(true)
  })
})
```

- [ ] **Step 2: Run auth tests to verify failure**

Run: `npx jest packages/core/__tests__/auth/oauth.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement full AuthModule**

```typescript
// packages/core/src/auth/oauth.ts
import { HttpClient } from '../client/transport.js'
import { AuthError } from '../errors/fb-errors.js'

export type FacebookScope =
  | 'email'
  | 'public_profile'
  | 'pages_read_engagement'
  | 'pages_manage_posts'
  | 'pages_manage_metadata'
  | 'pages_read_user_content'
  | 'pages_show_list'
  | 'pages_messaging'

export interface TokenResponse {
  access_token: string
  token_type?: string
  expires_in: number
}

export interface DebugTokenResponse {
  data: {
    app_id: string
    type: string
    application: string
    data_access_expires_at: number
    expires_at: number
    is_valid: boolean
    scopes: string[]
    user_id: string
  }
}

export class AuthModule {
  constructor(
    private http: HttpClient,
    private config: { appId: string; appSecret: string }
  ) {}

  getLoginUrl(scopes: FacebookScope[], redirectUri = 'https://localhost/callback'): string {
    const base = 'https://www.facebook.com/v22.0/dialog/oauth'
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: redirectUri,
      scope: scopes.join(','),
      response_type: 'code'
    })
    return `${base}?${params.toString()}`
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResponse> {
    return this.http.get<TokenResponse>('/oauth/access_token', {
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      redirect_uri: redirectUri,
      code
    })
  }

  async inspectToken(inputToken: string): Promise<DebugTokenResponse> {
    return this.http.get<DebugTokenResponse>('/debug_token', {
      input_token: inputToken,
      access_token: `${this.config.appId}|${this.config.appSecret}`
    })
  }

  async refreshToken(token: string): Promise<TokenResponse> {
    return this.http.get<TokenResponse>('/oauth/access_token', {
      grant_type: 'fb_exchange_token',
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      fb_exchange_token: token
    })
  }
}
```

- [ ] **Step 4: Run auth tests to verify pass**

Run: `npx jest packages/core/__tests__/auth/oauth.test.ts`
Expected: PASS

---

### Task 5: Resource Modules — User, Page, Post, Comment

**Files:**
- Modify: `packages/core/src/resources/user.ts`
- Create: `packages/core/src/resources/page.ts`
- Create: `packages/core/src/resources/post.ts`
- Create: `packages/core/src/resources/comment.ts`
- Create: `packages/core/src/resources/index.ts`
- Test: `packages/core/__tests__/resources/user.test.ts`
- Test: `packages/core/__tests__/resources/page.test.ts`
- Test: `packages/core/__tests__/resources/post.test.ts`
- Test: `packages/core/__tests__/resources/comment.test.ts`

- [ ] **Step 1: Write failing user resource tests**

```typescript
// packages/core/__tests__/resources/user.test.ts
import { UserModule } from '../../src/resources/user.js'
import { HttpClient } from '../../src/client/transport.js'
import nock from 'nock'

describe('UserModule', () => {
  const http = new HttpClient('https://graph.facebook.com/v22.0')
  let user: UserModule

  beforeEach(() => {
    user = new UserModule(http)
    nock.cleanAll()
  })

  it('get fetches user profile', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .query({ access_token: 'tok' })
      .reply(200, { id: '123', name: 'Alice', email: 'a@b.com' })

    const result = await user.get('me', { access_token: 'tok' })
    expect(result.id).toBe('123')
    expect(result.name).toBe('Alice')
  })

  it('get fetches by specific id', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/456')
      .query({ access_token: 'tok' })
      .reply(200, { id: '456', name: 'Bob' })

    const result = await user.get('456', { access_token: 'tok' })
    expect(result.id).toBe('456')
  })

  it('getProfilePicture fetches picture', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me/picture')
      .query({ access_token: 'tok', redirect: 'false' })
      .reply(200, { data: { url: 'https://example.com/pic.jpg', height: 100, width: 100, is_silhouette: false } })

    const result = await user.getProfilePicture('me', { access_token: 'tok' })
    expect(result.data.url).toContain('example.com')
  })

  it('getAccounts fetches connected pages', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me/accounts')
      .query({ access_token: 'tok' })
      .reply(200, { data: [{ id: 'page1', name: 'My Page', access_token: 'page_tok' }] })

    const result = await user.getAccounts({ access_token: 'tok' })
    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('My Page')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx jest packages/core/__tests__/resources/user.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement full UserModule**

```typescript
// packages/core/src/resources/user.ts
import { HttpClient } from '../client/transport.js'
import { FacebookUser, FacebookPage, FacebookPaginatedResponse, FacebookPicture } from '../types/facebook.js'

export class UserModule {
  constructor(private http: HttpClient) {}

  async get(userId: string, params?: Record<string, string>): Promise<FacebookUser> {
    return this.http.get<FacebookUser>(`/${userId}`, params)
  }

  async getProfilePicture(userId: string, params?: Record<string, string>): Promise<FacebookPicture> {
    return this.http.get<FacebookPicture>(`/${userId}/picture`, { ...params, redirect: 'false' })
  }

  async getAccounts(params?: Record<string, string>): Promise<FacebookPaginatedResponse<FacebookPage>> {
    return this.http.get<FacebookPaginatedResponse<FacebookPage>>('/me/accounts', params)
  }
}
```

- [ ] **Step 4: Write failing page resource tests**

```typescript
// packages/core/__tests__/resources/page.test.ts
import { PageModule } from '../../src/resources/page.js'
import { HttpClient } from '../../src/client/transport.js'
import nock from 'nock'

describe('PageModule', () => {
  const http = new HttpClient('https://graph.facebook.com/v22.0')
  let page: PageModule

  beforeEach(() => {
    page = new PageModule(http)
    nock.cleanAll()
  })

  it('get fetches page by id', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/page1')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'page1', name: 'Test Page' })

    const result = await page.get('page1', { access_token: 'tok' })
    expect(result.id).toBe('page1')
    expect(result.name).toBe('Test Page')
  })

  it('getPosts fetches page posts', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/page1/posts')
      .query({ access_token: 'tok' })
      .reply(200, { data: [{ id: 'post1', message: 'Hello', created_time: '2024-01-01' }] })

    const result = await page.getPosts('page1', { access_token: 'tok' })
    expect(result.data).toHaveLength(1)
    expect(result.data[0].message).toBe('Hello')
  })

  it('publishPost creates a post', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/page1/feed', { message: 'New post' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'post_new' })

    const result = await page.publishPost('page1', { message: 'New post' }, { access_token: 'tok' })
    expect(result).toBeDefined()
  })
})
```

- [ ] **Step 5: Implement PageModule**

```typescript
// packages/core/src/resources/page.ts
import { HttpClient } from '../client/transport.js'
import { FacebookPage, FacebookPost, FacebookPaginatedResponse } from '../types/facebook.js'

export class PageModule {
  constructor(private http: HttpClient) {}

  async get(pageId: string, params?: Record<string, string>): Promise<FacebookPage> {
    return this.http.get<FacebookPage>(`/${pageId}`, params)
  }

  async getPosts(pageId: string, params?: Record<string, string>): Promise<FacebookPaginatedResponse<FacebookPost>> {
    return this.http.get<FacebookPaginatedResponse<FacebookPost>>(`/${pageId}/posts`, params)
  }

  async publishPost(pageId: string, data: { message: string; link?: string }, params?: Record<string, string>): Promise<{ id: string }> {
    return this.http.post<{ id: string }>(`/${pageId}/feed`, data as unknown as Record<string, unknown>, params)
  }
}
```

- [ ] **Step 6: Write failing post + comment resource tests**

```typescript
// packages/core/__tests__/resources/post.test.ts
import { PostModule } from '../../src/resources/post.js'
import { HttpClient } from '../../src/client/transport.js'
import nock from 'nock'

describe('PostModule', () => {
  const http = new HttpClient('https://graph.facebook.com/v22.0')
  let post: PostModule

  beforeEach(() => {
    post = new PostModule(http)
    nock.cleanAll()
  })

  it('get fetches post by id', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/post1')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'post1', message: 'Hello', created_time: '2024-01-01' })

    const result = await post.get('post1', { access_token: 'tok' })
    expect(result.id).toBe('post1')
  })

  it('getComments fetches comments', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/post1/comments')
      .query({ access_token: 'tok' })
      .reply(200, { data: [{ id: 'c1', message: 'nice', from: { id: 'u1', name: 'User' }, like_count: 0, created_time: '2024-01-01' }] })

    const result = await post.getComments('post1', { access_token: 'tok' })
    expect(result.data).toHaveLength(1)
    expect(result.data[0].message).toBe('nice')
  })

  it('like likes a post', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/post1/likes')
      .query({ access_token: 'tok' })
      .reply(200, { success: true })

    await expect(post.like('post1', { access_token: 'tok' })).resolves.not.toThrow()
  })
})
```

```typescript
// packages/core/__tests__/resources/comment.test.ts
import { CommentModule } from '../../src/resources/comment.js'
import { HttpClient } from '../../src/client/transport.js'
import nock from 'nock'

describe('CommentModule', () => {
  const http = new HttpClient('https://graph.facebook.com/v22.0')
  let comment: CommentModule

  beforeEach(() => {
    comment = new CommentModule(http)
    nock.cleanAll()
  })

  it('get fetches comment by id', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/c1')
      .query({ access_token: 'tok' })
      .reply(200, { id: 'c1', message: 'nice', like_count: 3, created_time: '2024-01-01' })

    const result = await comment.get('c1', { access_token: 'tok' })
    expect(result.id).toBe('c1')
  })

  it('reply creates a reply', async () => {
    nock('https://graph.facebook.com')
      .post('/v22.0/c1/comments', { message: 'thanks' })
      .query({ access_token: 'tok' })
      .reply(200, { id: 'r1' })

    const result = await comment.reply('c1', 'thanks', { access_token: 'tok' })
    expect(result).toBeDefined()
  })

  it('delete removes a comment', async () => {
    nock('https://graph.facebook.com')
      .delete('/v22.0/c1')
      .query({ access_token: 'tok' })
      .reply(200, { success: true })

    await expect(comment.delete('c1', { access_token: 'tok' })).resolves.not.toThrow()
  })
})
```

- [ ] **Step 7: Implement PostModule + CommentModule**

```typescript
// packages/core/src/resources/post.ts
import { HttpClient } from '../client/transport.js'
import { FacebookPost, FacebookComment, FacebookPaginatedResponse } from '../types/facebook.js'

export class PostModule {
  constructor(private http: HttpClient) {}

  async get(postId: string, params?: Record<string, string>): Promise<FacebookPost> {
    return this.http.get<FacebookPost>(`/${postId}`, params)
  }

  async getComments(postId: string, params?: Record<string, string>): Promise<FacebookPaginatedResponse<FacebookComment>> {
    return this.http.get<FacebookPaginatedResponse<FacebookComment>>(`/${postId}/comments`, params)
  }

  async like(postId: string, params?: Record<string, string>): Promise<void> {
    await this.http.post(`/${postId}/likes`, {}, params)
  }
}
```

```typescript
// packages/core/src/resources/comment.ts
import { HttpClient } from '../client/transport.js'
import { FacebookComment } from '../types/facebook.js'

export class CommentModule {
  constructor(private http: HttpClient) {}

  async get(commentId: string, params?: Record<string, string>): Promise<FacebookComment> {
    return this.http.get<FacebookComment>(`/${commentId}`, params)
  }

  async reply(commentId: string, message: string, params?: Record<string, string>): Promise<{ id: string }> {
    return this.http.post<{ id: string }>(`/${commentId}/comments`, { message }, params)
  }

  async delete(commentId: string, params?: Record<string, string>): Promise<void> {
    await this.http.post(`/${commentId}`, {}, { ...params, method: 'delete' })
  }
}
```

- [ ] **Step 8: Create barrel exports and update fb-client**

```typescript
// packages/core/src/resources/index.ts
export * from './user.js'
export * from './page.js'
export * from './post.js'
export * from './comment.js'
```

Update `packages/core/src/client/fb-client.ts` to add page, post, comment:
```typescript
import { PageModule } from '../resources/page.js'
import { PostModule } from '../resources/post.js'
import { CommentModule } from '../resources/comment.js'

export class FacebookClient {
  // ... existing ...
  page: PageModule
  post: PostModule
  comment: CommentModule

  constructor(config: FacebookClientConfig) {
    // ... existing ...
    this.page = new PageModule(this.http)
    this.post = new PostModule(this.http)
    this.comment = new CommentModule(this.http)
  }
}
```

- [ ] **Step 9: Run all tests to verify pass**

Run: `npx jest`
Expected: ALL tests pass

---

### Task 6: Rate Limit Handling + Retry Interceptor

**Files:**
- Create: `packages/core/src/client/interceptors.ts`
- Test: `packages/core/__tests__/client/interceptors.test.ts`

- [ ] **Step 1: Write failing interceptor tests**

```typescript
// packages/core/__tests__/client/interceptors.test.ts
import { withRetry } from '../../src/client/interceptors.js'
import nock from 'nock'

describe('withRetry', () => {
  afterEach(() => nock.cleanAll())

  it('returns response on success without retry', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .reply(200, { id: '123' })

    const fn = withRetry(async () => {
      const res = await fetch('https://graph.facebook.com/v22.0/me')
      return res.json()
    })

    const result = await fn()
    expect(result).toEqual({ id: '123' })
  })

  it('retries on 429 and succeeds', async () => {
    let attempts = 0
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .times(2)
      .reply(() => {
        attempts++
        if (attempts === 1) return [429, { error: { message: 'rate limited' } }]
        return [200, { id: '123' }]
      })

    const fn = withRetry(async () => {
      const res = await fetch('https://graph.facebook.com/v22.0/me')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }, { maxRetries: 2, baseDelay: 10 })

    const result = await fn()
    expect(result).toEqual({ id: '123' })
    expect(attempts).toBe(2)
  })

  it('fails after exhausting retries', async () => {
    nock('https://graph.facebook.com')
      .get('/v22.0/me')
      .times(3)
      .reply(429, { error: { message: 'rate limited' } })

    const fn = withRetry(async () => {
      const res = await fetch('https://graph.facebook.com/v22.0/me')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }, { maxRetries: 2, baseDelay: 10 })

    await expect(fn()).rejects.toThrow('Max retries exceeded')
  })
})
```

- [ ] **Step 2: Run interceptor tests to verify failure**

Run: `npx jest packages/core/__tests__/client/interceptors.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement retry interceptor**

```typescript
// packages/core/src/client/interceptors.ts
export interface RetryOptions {
  maxRetries: number
  baseDelay: number
}

export function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, baseDelay: 1000 }
): () => Promise<T> {
  return async () => {
    let lastError: Error | null = null
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (attempt < options.maxRetries) {
          const delay = options.baseDelay * Math.pow(2, attempt)
          await new Promise(r => setTimeout(r, delay))
        }
      }
    }
    throw new Error(`Max retries exceeded: ${lastError!.message}`)
  }
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx jest packages/core/__tests__/client/interceptors.test.ts`
Expected: PASS

---

### Task 7: Main Package Barrel Export

**Files:**
- Create: `packages/core/src/index.ts`

- [ ] **Step 1: Create main barrel export**

```typescript
// packages/core/src/index.ts
export { FacebookClient } from './client/fb-client.js'
export type { FacebookClientConfig } from './client/fb-client.js'
export { HttpClient, HttpError } from './client/transport.js'
export { AuthModule } from './auth/oauth.js'
export type { FacebookScope, TokenResponse, DebugTokenResponse } from './auth/oauth.js'
export { UserModule } from './resources/user.js'
export { PageModule } from './resources/page.js'
export { PostModule } from './resources/post.js'
export { CommentModule } from './resources/comment.js'
export { FacebookError, RateLimitError, AuthError } from './errors/fb-errors.js'
export type {
  FacebookUser, FacebookPage, FacebookPost, FacebookComment,
  FacebookPicture, FacebookCategory, FacebookAttachment,
  FacebookPaginatedResponse, FacebookConfig
} from './types/facebook.js'
export { withRetry } from './client/interceptors.js'
export type { RetryOptions } from './client/interceptors.js'
```

- [ ] **Step 2: Build and verify**

Run: `npx tsc -p packages/core/tsconfig.json --noEmit`
Expected: No type errors

- [ ] **Step 3: Run full test suite**

Run: `npx jest --verbose`
Expected: ALL tests PASS
