import { Session, ProviderRegistry, Cli } from '@socialkit/cli'

export interface DesktopBridgeOptions {
  session: Session
  registry: ProviderRegistry
}

export class DesktopBridge {
  private cli: Cli

  constructor(options: DesktopBridgeOptions) {
    this.cli = new Cli({ session: options.session, registry: options.registry })
  }

  async run(argv: string[]): Promise<string> {
    return this.cli.run(argv)
  }

  listPlatforms(): string[] {
    return ['facebook', 'instagram', 'zalo']
  }
}
