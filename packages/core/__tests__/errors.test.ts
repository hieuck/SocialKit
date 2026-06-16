import { PlatformError, RateLimitError, AuthError } from '../src/errors'

describe('PlatformError', () => {
  it('creates with message and code', () => {
    const err = new PlatformError('test error', 400)
    expect(err.message).toBe('test error')
    expect(err.code).toBe(400)
    expect(err).toBeInstanceOf(Error)
  })
})

describe('RateLimitError', () => {
  it('creates with retryAfter', () => {
    const err = new RateLimitError('rate limited', 17)
    expect(err.message).toBe('rate limited')
    expect(err.retryAfter).toBe(17)
    expect(err).toBeInstanceOf(PlatformError)
  })

  it('defaults code to 429', () => {
    const err = new RateLimitError('too fast', 30)
    expect(err.code).toBe(429)
  })
})

describe('AuthError', () => {
  it('creates with reason', () => {
    const err = new AuthError('invalid token', 'invalid_token')
    expect(err.message).toBe('invalid token')
    expect(err.reason).toBe('invalid_token')
    expect(err).toBeInstanceOf(PlatformError)
  })

  it('defaults code to 401', () => {
    const err = new AuthError('bad', 'expired_token')
    expect(err.code).toBe(401)
  })

  it('accepts all reason types', () => {
    const reasons = ['invalid_token', 'expired_token', 'insufficient_permissions'] as const
    for (const reason of reasons) {
      const err = new AuthError('test', reason)
      expect(err.reason).toBe(reason)
    }
  })
})
