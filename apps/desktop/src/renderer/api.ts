export async function cliRun(argv: string[]): Promise<string> {
  if (window.socialkit) return window.socialkit.run(argv)
  throw new Error('socialkit API not available (not running in Electron?)')
}

export async function getPlatforms(): Promise<string[]> {
  if (window.socialkit) return window.socialkit.getPlatforms()
  return ['facebook', 'instagram', 'zalo']
}
