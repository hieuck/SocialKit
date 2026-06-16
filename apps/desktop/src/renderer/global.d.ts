/// <reference types="vite/client" />

interface SocialKitAPI {
  run(argv: string[]): Promise<string>
  getPlatforms(): Promise<string[]>
}

declare global {
  interface Window {
    socialkit: SocialKitAPI
  }
}
