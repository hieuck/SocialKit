import { existsSync, readFileSync, writeFileSync } from 'fs'

interface ConfigData {
  providers: Record<string, Record<string, string>>
}

export class Config {
  private data: ConfigData

  constructor(private filePath: string) {
    this.data = this.load()
  }

  get(platform: string, key: string): string {
    return this.data.providers[platform]?.[key] ?? ''
  }

  set(platform: string, key: string, value: string): void {
    if (!this.data.providers[platform]) this.data.providers[platform] = {}
    this.data.providers[platform][key] = value
    this.persist()
  }

  getProvider(platform: string): Record<string, string> {
    return this.data.providers[platform] ? { ...this.data.providers[platform] } : {}
  }

  listConfigured(): string[] {
    return Object.entries(this.data.providers)
      .filter(([_, v]) => Object.keys(v).length > 0)
      .map(([k]) => k)
  }

  private load(): ConfigData {
    if (!existsSync(this.filePath)) return { providers: {} }
    try {
      return JSON.parse(readFileSync(this.filePath, 'utf-8'))
    } catch {
      return { providers: {} }
    }
  }

  private persist(): void {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
  }
}
