import { SocialProvider } from '@socialkit/core'
import { parseArgs } from './args.js'
import { Session } from './session.js'
import { ProviderRegistry } from './registry.js'
import { loginCommand } from './login.js'
import { whoamiCommand } from './whoami.js'
import { postCommand } from './post.js'
import { scheduleCommand } from './schedule.js'
import { daemonCommand } from './daemon.js'
import { configureCommand } from './configure.js'
import { Config } from './config.js'

export interface CliOptions {
  session: Session
  registry: ProviderRegistry
  config?: Config
}

export class Cli {
  constructor(private options: CliOptions) {}

  async run(argv: string[]): Promise<string> {
    try {
      const parsed = parseArgs(argv)

      if (parsed.command === 'help') return this.help()

      const platform = parsed.payload.platform || this.options.session.getActivePlatform()
      const provider = platform ? this.options.registry.resolve(this.options.session, platform) : undefined

      switch (parsed.command) {
        case 'login':
          return await this.handleLogin(parsed.payload, platform)
        case 'whoami':
          return await this.handleWhoami(provider)
        case 'post':
          return await this.handlePost(parsed.payload, provider)
        case 'schedule':
          return await this.handleSchedule(parsed.payload, provider)
        case 'daemon':
          return this.handleDaemon(parsed.payload, provider)
        case 'configure':
          return this.handleConfigure(parsed.payload)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return `Error: ${msg}`
    }
  }

  private help(): string {
    return [
      'SocialKit CLI',
      '',
      'Usage:',
      '  socialkit login <platform>              Show login URL',
      '  socialkit login <platform> --code <c>   Exchange code for token',
      '  socialkit login <platform> --token <t>  Store token directly (no OAuth)',
      '  socialkit whoami                        Show current profile',
      '  socialkit post --page <id> --message <t> Publish a post',
      '  socialkit post --page <id> --message <t> --link <url>',
      '  socialkit schedule --page <id> --message <t> [--at <time>]',
      '  socialkit schedule list                 List scheduled tasks',
      '  socialkit schedule cancel <id>          Cancel a task',
      '  socialkit daemon                        Run daemon for pending tasks',
      '  socialkit configure <platform>          Show platform config',
      '  socialkit configure <platform> <k> <v>  Set config value',
    ].join('\n')
  }

  private async handleLogin(payload: Record<string, string>, platform?: string): Promise<string> {
    if (!platform) return 'Specify a platform: socialkit login facebook'
    const provider = this.options.registry.get(platform)
    if (!provider) return `Unknown platform: ${platform}`

    if (payload.token) {
      await loginCommand(provider, { token: payload.token })
      const tok = provider.getAccessToken()
      if (tok) this.options.session.save(platform, tok)
      return 'Token stored.'
    }

    if (payload.code) {
      await loginCommand(provider, { code: payload.code, redirectUri: payload.redirectUri || 'http://localhost:3000/callback' })
      const tok = provider.getAccessToken()
      if (tok) this.options.session.save(platform, tok)
      return 'Logged in successfully.'
    }
    const url = await loginCommand(provider, {})
    return `Open this URL in your browser:\n${url}`
  }

  private async handleWhoami(provider?: SocialProvider): Promise<string> {
    if (!provider) return 'Not logged in. Run: socialkit login <platform>'
    return whoamiCommand(provider)
  }

  private async handlePost(payload: Record<string, string>, provider?: SocialProvider): Promise<string> {
    if (!provider) return 'Not logged in.'
    return postCommand(provider, { page: payload.page, message: payload.message, link: payload.link })
  }

  private async handleSchedule(payload: Record<string, string>, provider?: SocialProvider): Promise<string> {
    if (!provider) return 'Not logged in.'
    return scheduleCommand(provider, {
      page: payload.page,
      message: payload.message,
      link: payload.link,
      at: payload.at,
      subcommand: payload.subcommand,
      taskId: payload.taskId,
    })
  }

  private handleDaemon(payload: Record<string, string>, provider?: SocialProvider): string {
    if (!provider) return 'Not logged in.'
    const result = daemonCommand(provider, {})
    return result.message
  }

  private handleConfigure(payload: Record<string, string>): string {
    if (!this.options.config) return 'Config not available.'
    return configureCommand(this.options.config, {
      platform: payload.platform || undefined,
      key: payload.key || undefined,
      value: payload.value || undefined,
    })
  }
}
