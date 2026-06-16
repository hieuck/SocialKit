export class PlatformError extends Error {
  constructor(
    message: string,
    public readonly code: number
  ) {
    super(message)
    this.name = 'PlatformError'
  }
}

export class RateLimitError extends PlatformError {
  constructor(
    message: string,
    public readonly retryAfter: number
  ) {
    super(message, 429)
    this.name = 'RateLimitError'
  }
}

export class AuthError extends PlatformError {
  constructor(
    message: string,
    public readonly reason: 'invalid_token' | 'expired_token' | 'insufficient_permissions'
  ) {
    super(message, 401)
    this.name = 'AuthError'
  }
}
