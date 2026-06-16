import { scheduleCommand } from '../src/schedule'
import { MockSocialProvider } from '@socialkit/testing'

describe('scheduleCommand', () => {
  it('publishes immediately when no --at', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleCommand(provider, { page: 'page1', message: 'Hello' })
    expect(result).toContain('Posted')
  })

  it('schedules a future post with --at', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleCommand(provider, { page: 'page1', message: 'Future', at: '2099-01-01T09:00:00Z' })
    expect(result).toContain('Scheduled')
  })

  it('lists scheduled tasks', async () => {
    const provider = new MockSocialProvider()
    const result = await scheduleCommand(provider, { subcommand: 'list' })
    expect(result).toBe('No scheduled tasks.')
  })
})
