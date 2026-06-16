import { SocialProvider } from '@socialkit/core'
import { Session } from './session.js'

export type ProviderFactory = () => SocialProvider

export class ProviderRegistry {
  private factories = new Map<string, ProviderFactory>()

  register(platform: string, factory: ProviderFactory): void {
    this.factories.set(platform, factory)
  }

  get(platform: string): SocialProvider | undefined {
    const factory = this.factories.get(platform)
    return factory ? factory() : undefined
  }

  list(): string[] {
    return Array.from(this.factories.keys())
  }

  resolve(session: Session, platform?: string): SocialProvider | undefined {
    const name = platform ?? session.getActivePlatform()
    if (!name) return undefined
    const token = session.get(name)
    const provider = this.get(name)
    if (provider && token) provider.setAccessToken(token)
    return provider
  }
}
