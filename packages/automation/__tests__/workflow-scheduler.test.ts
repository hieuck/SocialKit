import { WorkflowScheduler } from '../src/workflow-scheduler'
import { WorkflowEngine } from '../src/workflow-engine'
import { MockSocialProvider } from '@socialkit/testing'

describe('WorkflowScheduler', () => {
  it('schedules a workflow and executes it when due', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const scheduler = new WorkflowScheduler(engine)

    const definition = {
      id: 'wf_scheduled',
      name: 'Scheduled',
      steps: [{ id: 'p1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } }],
    }

    const task = scheduler.scheduleWorkflow({
      definition,
      runAt: new Date(Date.now() + 50),
    })

    expect(task.type).toBe('workflow')
    expect(task.payload?.definitionId).toBe('wf_scheduled')

    await new Promise(r => setTimeout(r, 150))
    expect(provider.calls).toHaveLength(1)
    expect(provider.calls[0].method).toBe('publishPost')
    scheduler.stop()
  })
})
