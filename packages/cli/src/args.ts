export type CliCommand = 'login' | 'whoami' | 'post' | 'schedule' | 'daemon' | 'help'

export interface ParsedArgs {
  command: CliCommand
  payload: Record<string, string>
}

export function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0) return { command: 'help', payload: {} }

  const cmd = argv[0]

  if (cmd === 'login') {
    return { command: 'login', payload: { platform: argv[1] ?? '' } }
  }

  if (cmd === 'whoami') {
    return { command: 'whoami', payload: {} }
  }

  if (cmd === 'post') {
    return { command: 'post', payload: parseFlags(argv.slice(1)) }
  }

  if (cmd === 'schedule') {
    if (argv[1] === 'list') return { command: 'schedule', payload: { subcommand: 'list' } }
    if (argv[1] === 'cancel') return { command: 'schedule', payload: { subcommand: 'cancel', taskId: argv[2] ?? '' } }
    return { command: 'schedule', payload: parseFlags(argv.slice(1)) }
  }

  if (cmd === 'daemon') {
    return { command: 'daemon', payload: { platform: argv[1] ?? '' } }
  }

  return { command: 'help', payload: {} }
}

function parseFlags(args: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    result[key] = args[i + 1] ?? ''
  }
  return result
}
