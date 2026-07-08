import { createOAuthServer } from '../src/main/oauth-server'
import { request } from 'http'

function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = request(url, res => {
      let data = ''
      res.on('data', (chunk: string) => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.end()
  })
}

describe('OAuthServer', () => {
  it('captures authorization code from callback', async () => {
    const server = await createOAuthServer(0)
    const url = server.url()
    await httpGet(`${url}/callback?code=test_code_123`)
    const result = await server.waitForCode(1000)
    expect(result).toBe('test_code_123')
    server.close()
  })

  it('returns success page to browser', async () => {
    const server = await createOAuthServer(0)
    const url = server.url()
    const page = await httpGet(`${url}/callback?code=abc`)
    expect(page).toContain('Logged in')
    server.close()
  })

  it('times out when no callback received', async () => {
    const server = await createOAuthServer(0)
    await expect(server.waitForCode(100)).rejects.toThrow('timed out')
    server.close()
  })
})
