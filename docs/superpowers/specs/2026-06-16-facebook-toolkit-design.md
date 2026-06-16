# Facebook Toolkit — Design Spec

## Overview

A full-stack TypeScript monorepo providing a modular toolkit for Facebook platform operations. Built with NPM Workspaces, TDD-first methodology.

## Architecture

### Monorepo Structure

```
facebook-toolkit/
├── packages/
│   ├── core/           # Facebook Graph API wrapper (auth, resources, rate limiting)
│   ├── automation/     # Scheduled posting, auto-comment, auto-like
│   ├── analyzer/       # Data fetching, statistics, export
│   └── messenger/      # Messenger bot SDK with webhook handlers
├── apps/
│   └── dashboard/      # React SPA for combined management UI
├── package.json        # Root workspace config
├── tsconfig.base.json  # Shared TypeScript config
├── jest.config.ts      # Root test config
└── .eslintrc.js        # Shared lint config
```

### Build Order

1. **core** — foundation, all other packages depend on it
2. **automation** — uses core for API calls, adds scheduling
3. **analyzer** — uses core, adds data aggregation
4. **messenger** — uses core, adds webhook server
5. **dashboard** — consumes all packages via API layer

### Core API Surface

```typescript
// Auth
class FacebookClient {
  constructor(config: { appId: string; appSecret: string })
  auth: AuthModule
  user: UserModule
  page: PageModule
  post: PostModule
  comment: CommentModule
}

// Token management
class AuthModule {
  loginWithToken(token: string): Promise<void>
  loginWithCode(code: string, redirectUri: string): Promise<void>
  refreshToken(): Promise<string>
  getLoginUrl(scopes: Scope[]): string
}

// Typed resources
interface FacebookUser {
  id: string
  name: string
  email?: string
  picture?: string
}

interface FacebookPage {
  id: string
  name: string
  access_token?: string
  category?: string
}

interface FacebookPost {
  id: string
  message?: string
  created_time: string
  attachments?: FacebookAttachment[]
}
```

### Key Design Decisions

- **Type-safe everywhere** — all Graph API responses have corresponding TS interfaces
- **Injectable HTTP client** — enables mocking in tests without network calls
- **Auto-pagination** — list methods return async generators or paginated responses
- **Rate limit handling** — built-in retry with exponential backoff
- **Custom errors** — typed error hierarchy (AuthError, RateLimitError, GraphAPIError)
- **TDD** — every feature starts with a failing test, all modules require >80% coverage

### Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Jest + ts-jest | Module-level tests, mocked HTTP |
| Integration | Jest + nock | Request/response pipeline, auth flow |
| Coverage | Jest --coverage | Minimum 80% per package |

### Error Handling

```typescript
class FacebookError extends Error {
  code: number
  type: string
  constructor(message: string, code: number, type: string)
}

class RateLimitError extends FacebookError {
  retryAfter: number
}

class AuthError extends FacebookError {
  reason: 'invalid_token' | 'expired_token' | 'insufficient_permissions'
}
```

### Data Flow

```
User Action → Package Method → FacebookClient → HTTP Request → Graph API
                                    ↑                    ↓
                              Interceptors          Response
                           (auth, retry, log)     ↓ parse
                                                 Typed Result
```
