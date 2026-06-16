export async function cliRun(argv: string[]): Promise<string> {
  const api = (window as any).socialkit
  if (api) return api.run(argv)
  throw new Error('socialkit API not available (not running in Electron?)')
}

export async function getPlatforms(): Promise<string[]> {
  const api = (window as any).socialkit
  if (api) return api.getPlatforms()
  return ['facebook', 'instagram', 'zalo']
}
