interface SocialKitWindow extends Window {
  socialkit?: {
    run: (argv: string[]) => Promise<string>
    getPlatforms: () => Promise<string[]>
  }
}

function getApi(): SocialKitWindow['socialkit'] {
  return (window as SocialKitWindow).socialkit
}

export async function cliRun(argv: string[]): Promise<string> {
  const api = getApi()
  if (api) return api.run(argv)
  throw new Error('socialkit API not available (not running in Electron?)')
}

export async function getPlatforms(): Promise<string[]> {
  const api = getApi()
  if (api) return api.getPlatforms()
  return ['facebook', 'instagram', 'zalo']
}
