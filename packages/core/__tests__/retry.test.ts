import { withRetry } from '../src/retry'

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = withRetry(async () => 'ok')
    await expect(fn()).resolves.toBe('ok')
  })

  it('retries on failure and succeeds', async () => {
    let attempts = 0
    const fn = withRetry(async () => {
      attempts++
      if (attempts < 3) throw new Error('fail')
      return 'success'
    }, { maxRetries: 3, baseDelay: 5 })

    const result = await fn()
    expect(result).toBe('success')
    expect(attempts).toBe(3)
  })

  it('fails after exhausting all retries', async () => {
    const fn = withRetry(async () => { throw new Error('always fail') }, { maxRetries: 2, baseDelay: 5 })
    await expect(fn()).rejects.toThrow('always fail')
  })

  it('uses exponential backoff', async () => {
    const delays: number[] = []
    const original = setTimeout
    jest.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: any, ms: number) => {
      delays.push(ms)
      return original(fn, 0) as any
    }) as any)

    let attempts = 0
    const fn = withRetry(async () => {
      attempts++
      if (attempts < 3) throw new Error('fail')
      return 'ok'
    }, { maxRetries: 3, baseDelay: 100 })

    await fn()
    expect(delays[0]).toBe(100)
    expect(delays[1]).toBe(200)

    jest.restoreAllMocks()
  })
})
