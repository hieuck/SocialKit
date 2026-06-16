import { loginCommand } from '../src/login'
import { MockSocialProvider } from '@socialkit/testing'

describe('loginCommand', () => {
  it('returns a login URL', async () => {
    const provider = new MockSocialProvider()
    const result = await loginCommand(provider, { scopes: ['email'] })
    expect(result).toContain('mock/login')
  })

  it('handles successful token exchange', async () => {
    const provider = new MockSocialProvider()
    const providerSpy = jest.spyOn(provider, 'exchangeCodeForToken')

    await loginCommand(provider, { code: 'auth_code', redirectUri: 'http://localhost' })

    expect(providerSpy).toHaveBeenCalledWith('auth_code', 'http://localhost')
  })

  it('stores token via setAccessToken after exchange', async () => {
    const provider = new MockSocialProvider({ token: { accessToken: 'final_token', expiresIn: 3600 } })
    const setSpy = jest.spyOn(provider, 'setAccessToken')

    await loginCommand(provider, { code: 'abc', redirectUri: 'http://localhost' })

    expect(setSpy).toHaveBeenCalledWith('final_token')
  })
})
