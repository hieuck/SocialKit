/// <reference types="vite/client" />

interface SocialKitAPI {
  run(argv: string[]): Promise<string>
  getPlatforms(): Promise<string[]>
  login(platform: string): Promise<string>
  getLoginUrl(platform: string): Promise<string>
}

declare global {
  interface Window {
    socialkit: SocialKitAPI
  }
}
