import { SocialProvider } from '@socialkit/core'

export interface LoginOptions {
  scopes?: string[]
  code?: string
  redirectUri?: string
}

export async function loginCommand(provider: SocialProvider, options: LoginOptions): Promise<string> {
  if (options.code && options.redirectUri) {
    const token = await provider.exchangeCodeForToken(options.code, options.redirectUri)
    provider.setAccessToken(token.accessToken)
    return 'Logged in successfully.'
  }
  return provider.getLoginUrl(options.scopes ?? ['public_profile'], 'http://localhost:3000/callback')
}
