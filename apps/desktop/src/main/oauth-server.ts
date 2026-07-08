import { createServer, IncomingMessage, ServerResponse } from 'http'
import { URL } from 'url'

export interface OAuthServer {
  url(): string
  waitForCode(timeoutMs: number): Promise<string>
  close(): void
}

export async function createOAuthServer(port = 0): Promise<OAuthServer> {
  let capturedCode: string | null = null
  let resolveCode: ((code: string) => void) | null = null
  let actualPort = port

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', `http://localhost:${actualPort}`)

    if (url.pathname === '/callback' && url.searchParams.has('code')) {
      capturedCode = url.searchParams.get('code')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<html><body><h1>Logged in!</h1><p>You can close this window and return to SocialKit.</p></body></html>')
      if (resolveCode && capturedCode) resolveCode(capturedCode)
      return
    }

    res.writeHead(404)
    res.end('Not found')
  })

  await new Promise<void>(resolve => {
    server.listen(port, () => {
      const addr = server.address()
      if (addr && typeof addr === 'object') actualPort = addr.port
      resolve()
    })
  })

  return {
    url(): string {
      return `http://localhost:${actualPort}`
    },

    waitForCode(timeoutMs: number): Promise<string> {
      if (capturedCode) return Promise.resolve(capturedCode)
      return new Promise((resolve, reject) => {
        resolveCode = resolve
        setTimeout(() => {
          if (!capturedCode) reject(new Error('OAuth callback timed out'))
        }, timeoutMs)
      })
    },

    close(): void {
      server.close()
    },
  }
}
