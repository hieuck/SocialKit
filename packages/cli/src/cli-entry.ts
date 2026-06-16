#!/usr/bin/env node

import { Cli } from './cli.js'
import { Session } from './session.js'
import { Config } from './config.js'
import { ProviderRegistry } from './registry.js'
import type { SocialProvider, SocialProfile, SocialPage, SocialPost, SocialComment, PaginatedResponse, SocialTokenResponse } from '@socialkit/core'
import { FacebookProvider } from '@socialkit/provider-facebook'
import { InstagramProvider } from '@socialkit/provider-instagram'
import { ZaloProvider } from '@socialkit/provider-zalo'
import { homedir } from 'os'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export interface MainOptions {
  argv?: string[]
  sessionPath?: string
  configPath?: string
}

export function getDataDir(): string {
  const dir = join(homedir(), '.socialkit')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function getSessionPath(sessionPath?: string): string {
  return sessionPath ?? join(getDataDir(), 'session.json')
}

export function getConfigPath(configPath?: string): string {
  return configPath ?? join(getDataDir(), 'config.json')
}

class MockProvider implements SocialProvider {
  readonly platform: string
  private _token?: string
  private id = 0

  constructor(platform: string) { this.platform = platform }

  setAccessToken(t: string): void { this._token = t }
  getAccessToken(): string | undefined { return this._token }

  getLoginUrl(_scopes: string[], _redirectUri: string): string {
    return `https://${this.platform}.mock/login?client_id=mock`
  }

  async exchangeCodeForToken(_code: string, _redirectUri: string): Promise<SocialTokenResponse> {
    return { accessToken: 'mock_token', expiresIn: 3600 }
  }

  async refreshToken(_token: string): Promise<SocialTokenResponse> {
    return { accessToken: 'mock_token', expiresIn: 3600 }
  }

  async getProfile(_userId?: string): Promise<SocialProfile> {
    return { id: 'mock_user', name: `Mock ${this.platform} User`, email: `user@${this.platform}.mock` }
  }

  async getPage(_pageId: string): Promise<SocialPage> {
    return { id: 'mock_page', name: `Mock ${this.platform} Page` }
  }

  async getPagePosts(_pageId: string, _cursor?: string): Promise<PaginatedResponse<SocialPost>> {
    return { data: [{ id: 'post_1', message: 'Mock post', createdAt: '2024-01-01' }] }
  }

  async publishPost(_pageId: string, _data: { message: string; link?: string }): Promise<{ id: string }> {
    this.id++
    return { id: `mock_post_${this.id}` }
  }

  async getPost(_postId: string): Promise<SocialPost> {
    return { id: _postId, message: 'Mock post content', createdAt: '2024-01-01' }
  }

  async getPostComments(_postId: string, _cursor?: string): Promise<PaginatedResponse<SocialComment>> {
    return { data: [{ id: 'c1', message: 'Mock comment', createdAt: '2024-01-01', likeCount: 1 }] }
  }

  async likePost(_postId: string): Promise<void> {}

  async getComment(_commentId: string): Promise<SocialComment> {
    return { id: _commentId, message: 'Mock comment', createdAt: '2024-01-01', likeCount: 1 }
  }

  async replyToComment(_commentId: string, _message: string): Promise<{ id: string }> {
    return { id: 'reply_mock' }
  }

  async deleteComment(_commentId: string): Promise<void> {}
}

export function createRegistry(config: Config, mock = false): ProviderRegistry {
  const registry = new ProviderRegistry()

  if (mock) {
    registry.register('facebook', () => new MockProvider('facebook'))
    registry.register('instagram', () => new MockProvider('instagram'))
    registry.register('zalo', () => new MockProvider('zalo'))
    return registry
  }

  registry.register('facebook', () => {
    return new FacebookProvider({
      appId: config.get('facebook', 'appId') || process.env.SOCIALKIT_FACEBOOK_APP_ID || '',
      appSecret: config.get('facebook', 'appSecret') || process.env.SOCIALKIT_FACEBOOK_APP_SECRET || '',
    })
  })

  registry.register('instagram', () => {
    return new InstagramProvider({
      appId: config.get('instagram', 'appId') || process.env.SOCIALKIT_INSTAGRAM_APP_ID || '',
      appSecret: config.get('instagram', 'appSecret') || process.env.SOCIALKIT_INSTAGRAM_APP_SECRET || '',
      igUserId: config.get('instagram', 'igUserId') || process.env.SOCIALKIT_INSTAGRAM_IG_USER_ID || '',
    })
  })

  registry.register('zalo', () => {
    return new ZaloProvider({
      appId: config.get('zalo', 'appId') || process.env.SOCIALKIT_ZALO_APP_ID || '',
      appSecret: config.get('zalo', 'appSecret') || process.env.SOCIALKIT_ZALO_APP_SECRET || '',
    })
  })

  return registry
}

export async function main(options: MainOptions = {}): Promise<string> {
  const argv = options.argv ?? process.argv.slice(2)
  const mock = argv[0] === '--mock'
  const cliArgv = mock ? argv.slice(1) : argv

  const sessionPath = getSessionPath(options.sessionPath)
  const configPath = getConfigPath(options.configPath)
  const session = new Session(sessionPath)
  const config = new Config(configPath)
  const registry = createRegistry(config, mock)
  const cli = new Cli({ session, registry, config })
  return cli.run(cliArgv)
}

if (process.argv[1]?.endsWith('cli-entry.ts') || process.argv[1]?.endsWith('cli-entry.js')) {
  main().then(result => {
    console.log(result)
    if (result.startsWith('Error:')) process.exit(1)
  }).catch(err => {
    console.error('Fatal:', err.message ?? err)
    process.exit(1)
  })
}
