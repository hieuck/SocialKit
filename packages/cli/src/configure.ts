import { Config } from './config.js'

export interface ConfigureInput {
  platform?: string
  key?: string
  value?: string
}

export function configureCommand(config: Config, input: ConfigureInput): string {
  if (input.platform && input.key && input.value !== undefined) {
    config.set(input.platform, input.key, input.value)
    return `Configured ${input.platform}.${input.key} = ${input.value}`
  }

  if (input.platform) {
    const provider = config.getProvider(input.platform)
    const keys = Object.keys(provider)
    if (keys.length === 0) return `No configuration for ${input.platform}.`
    return `${input.platform}:\n` + keys.map(k => `  ${k}: ${provider[k]}`).join('\n')
  }

  const platforms = config.listConfigured()
  if (platforms.length === 0) return 'No platforms configured.\nUse: configure <platform> <key> <value>'
  return 'Configured platforms:\n' + platforms.map(p => `  ${p}`).join('\n')
}
