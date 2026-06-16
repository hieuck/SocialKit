import { existsSync, readFileSync, writeFileSync } from 'fs'

interface SessionData {
  activePlatform?: string
  tokens: Record<string, string>
}

export class Session {
  private data: SessionData

  constructor(private filePath: string) {
    this.data = this.load()
  }

  save(platform: string, token: string): void {
    this.data.tokens[platform] = token
    this.data.activePlatform = platform
    this.persist()
  }

  get(platform: string): string | undefined {
    return this.data.tokens[platform]
  }

  list(): string[] {
    return Object.keys(this.data.tokens)
  }

  getActivePlatform(): string | undefined {
    return this.data.activePlatform
  }

  setActivePlatform(platform: string): void {
    this.data.activePlatform = platform
    this.persist()
  }

  private load(): SessionData {
    if (!existsSync(this.filePath)) return { tokens: {} }
    try {
      return JSON.parse(readFileSync(this.filePath, 'utf-8'))
    } catch {
      return { tokens: {} }
    }
  }

  private persist(): void {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
  }
}
