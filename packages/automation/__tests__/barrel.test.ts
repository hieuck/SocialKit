import { Scheduler, AutomationEngine, AutoExecutor } from '../src'
import { MockSocialProvider } from '@socialkit/testing'

describe('Automation barrel export', () => {
  it('exports Scheduler', () => {
    expect(Scheduler).toBeDefined()
  })

  it('exports AutomationEngine', () => {
    const engine = new AutomationEngine(new MockSocialProvider())
    expect(engine).toBeDefined()
  })

  it('exports AutoExecutor', () => {
    const executor = new AutoExecutor(new MockSocialProvider())
    expect(executor).toBeDefined()
  })
})
