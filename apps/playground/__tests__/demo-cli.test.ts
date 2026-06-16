/**
 * @jest-environment node
 */
import { cliRun, getPlatforms } from '../src/api'

beforeEach(() => {
  ;(globalThis as any).socialkit = {
    run: jest.fn(),
    getPlatforms: jest.fn().mockResolvedValue(['mock']),
  }
})

describe('demo CLI integration', () => {
  it('returns login URL', async () => {
    ;(globalThis as any).socialkit.run = jest.fn().mockResolvedValue('https://mock/login?client_id=demo')
    const result = await cliRun(['login', 'facebook'])
    expect(result).toContain('mock/login')
  })

  it('returns whoami profile', async () => {
    ;(globalThis as any).socialkit.run = jest.fn().mockResolvedValue('Demo User (1)\nEmail: demo@test.com')
    const result = await cliRun(['whoami'])
    expect(result).toContain('Demo User')
    expect(result).toContain('demo@test.com')
  })

  it('returns post success', async () => {
    ;(globalThis as any).socialkit.run = jest.fn().mockResolvedValue('Posted: new_post_mock')
    const result = await cliRun(['post', '--page', 'me', '--message', 'Hello!'])
    expect(result).toContain('Posted')
  })

  it('returns schedule confirmation', async () => {
    ;(globalThis as any).socialkit.run = jest.fn().mockResolvedValue('Scheduled: task_1 on me')
    const result = await cliRun(['schedule', '--page', 'me', '--message', 'Later', '--at', '2099-01-01'])
    expect(result).toContain('Scheduled')
  })
})
