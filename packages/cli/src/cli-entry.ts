#!/usr/bin/env node

import { Cli } from './cli.js'
import { Session } from './session.js'
import { ProviderRegistry } from './registry.js'
import { FacebookProvider } from '@socialkit/provider-facebook'
import { InstagramProvider } from '@socialkit/provider-instagram'
import { ZaloProvider } from '@socialkit/provider-zalo'
import { homedir } from 'os'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export interface MainOptions {
  argv?: string[]
  sessionPath?: string
  env?: Record<string, string | undefined>
}

export function getSessionPath(sessionPath?: string): string {
  if (sessionPath) return sessionPath
  const dir = join(homedir(), '.socialkit')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'session.json')
}

export function createRegistry(): ProviderRegistry {
  const registry = new ProviderRegistry()

  registry.register('facebook', () => {
    return new FacebookProvider({
      appId: process.env.SOCIALKIT_FACEBOOK_APP_ID || '',
      appSecret: process.env.SOCIALKIT_FACEBOOK_APP_SECRET || '',
    })
  })

  registry.register('instagram', () => {
    return new InstagramProvider({
      appId: process.env.SOCIALKIT_INSTAGRAM_APP_ID || '',
      appSecret: process.env.SOCIALKIT_INSTAGRAM_APP_SECRET || '',
      igUserId: process.env.SOCIALKIT_INSTAGRAM_IG_USER_ID || '',
    })
  })

  registry.register('zalo', () => {
    return new ZaloProvider({
      appId: process.env.SOCIALKIT_ZALO_APP_ID || '',
      appSecret: process.env.SOCIALKIT_ZALO_APP_SECRET || '',
    })
  })

  return registry
}

export async function main(options: MainOptions = {}): Promise<string> {
  const sessionPath = getSessionPath(options.sessionPath)
  const session = new Session(sessionPath)
  const registry = createRegistry()
  const cli = new Cli({ session, registry })
  const argv = options.argv ?? process.argv.slice(2)
  return cli.run(argv)
}

// Self-execution check
if (process.argv[1]?.endsWith('cli-entry.ts') || process.argv[1]?.endsWith('cli-entry.js')) {
  main().then(result => {
    console.log(result)
    if (result.startsWith('Error:')) process.exit(1)
  }).catch(err => {
    console.error('Fatal:', err.message ?? err)
    process.exit(1)
  })
}
