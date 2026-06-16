#!/usr/bin/env node

import { Cli } from './cli.js'
import { Session } from './session.js'
import { Config } from './config.js'
import { ProviderRegistry } from './registry.js'
import { MockProvider } from './mock.js'
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
