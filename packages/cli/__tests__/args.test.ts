import { parseArgs } from '../src/args'

describe('parseArgs', () => {
  it('parses "login" command with platform', () => {
    const result = parseArgs(['login', 'facebook'])
    expect(result.command).toBe('login')
    expect(result.payload.platform).toBe('facebook')
  })

  it('parses "whoami" command', () => {
    const result = parseArgs(['whoami'])
    expect(result.command).toBe('whoami')
  })

  it('parses "post" command with flags', () => {
    const result = parseArgs(['post', '--page', 'p1', '--message', 'Hello'])
    expect(result.command).toBe('post')
    expect(result.payload.page).toBe('p1')
    expect(result.payload.message).toBe('Hello')
  })

  it('parses "post" command with optional --link', () => {
    const result = parseArgs(['post', '--page', 'p1', '--message', 'Hi', '--link', 'https://example.com'])
    expect(result.command).toBe('post')
    expect(result.payload.link).toBe('https://example.com')
  })

  it('parses "schedule" list subcommand', () => {
    const result = parseArgs(['schedule', 'list'])
    expect(result.command).toBe('schedule')
    expect(result.payload.subcommand).toBe('list')
  })

  it('parses "schedule" cancel subcommand', () => {
    const result = parseArgs(['schedule', 'cancel', 'task_123'])
    expect(result.command).toBe('schedule')
    expect(result.payload.subcommand).toBe('cancel')
    expect(result.payload.taskId).toBe('task_123')
  })

  it('parses "schedule" post with --at', () => {
    const result = parseArgs(['schedule', '--page', 'p1', '--message', 'Scheduled', '--at', '2024-01-01T09:00:00Z'])
    expect(result.command).toBe('schedule')
    expect(result.payload.page).toBe('p1')
    expect(result.payload.at).toBe('2024-01-01T09:00:00Z')
  })

  it('returns "help" for empty args', () => {
    const result = parseArgs([])
    expect(result.command).toBe('help')
  })

  it('returns "help" for unknown command', () => {
    const result = parseArgs(['unknown'])
    expect(result.command).toBe('help')
  })

  it('parses "workflow run" command with file', () => {
    const result = parseArgs(['workflow', 'run', './workflow.json'])
    expect(result.command).toBe('workflow')
    expect(result.payload.subcommand).toBe('run')
    expect(result.payload.file).toBe('./workflow.json')
  })

  it('parses "workflow run" command with --platform', () => {
    const result = parseArgs(['workflow', 'run', './workflow.json', '--platform', 'facebook'])
    expect(result.command).toBe('workflow')
    expect(result.payload.file).toBe('./workflow.json')
    expect(result.payload.platform).toBe('facebook')
  })
})
