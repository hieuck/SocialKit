export interface RetryOptions {
  maxRetries: number
  baseDelay: number
}

export function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, baseDelay: 1000 }
): () => Promise<T> {
  return async () => {
    let lastError: unknown
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (err) {
        lastError = err
        if (attempt < options.maxRetries) {
          const delay = options.baseDelay * Math.pow(2, attempt)
          await new Promise(r => setTimeout(r, delay))
        }
      }
    }
    const message = lastError instanceof Error ? lastError.message : String(lastError)
    throw new Error(`Max retries exceeded: ${message}`)
  }
}
