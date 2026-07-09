export type CliCommand = 'login' | 'whoami' | 'post' | 'schedule' | 'daemon' | 'configure' | 'workflow' | 'help'

export interface ParsedArgs {
  command: CliCommand
  payload: Record<string, string>
}

export function parseArgs(argv: string[]): ParsedArgs {
  if (argv.length === 0) return { command: 'help', payload: {} }

  const cmd = argv[0]

  if (cmd === 'login') {
    const payload: Record<string, string> = { platform: argv[1] ?? '' }
    const remaining = argv.slice(2)
    for (let i = 0; i < remaining.length; i += 2) {
      const key = remaining[i].replace(/^--/, '')
      payload[key] = remaining[i + 1] ?? ''
    }
    return { command: 'login', payload }
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

  if (cmd === 'configure') {
    return {
      command: 'configure',
      payload: {
        platform: argv[1] ?? '',
        key: argv[2] ?? '',
        value: argv[3] ?? '',
      },
    }
  }

  if (cmd === 'workflow') {
    const subcommand = argv[1] ?? ''
    if (subcommand === 'schedule') {
      if (argv[2] === 'list') {
        return {
          command: 'workflow',
          payload: { subcommand: 'schedule', list: 'true' },
        }
      }
      if (argv[2] === 'cancel') {
        return {
          command: 'workflow',
          payload: { subcommand: 'schedule', cancel: argv[3] ?? '' },
        }
      }
      return {
        command: 'workflow',
        payload: {
          subcommand: 'schedule',
          file: argv[2] ?? '',
          ...parseFlags(argv.slice(3)),
        },
      }
    }
    return {
      command: 'workflow',
      payload: {
        subcommand,
        file: argv[2] ?? '',
        ...parseFlags(argv.slice(3)),
      },
    }
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
