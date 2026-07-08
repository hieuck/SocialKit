import { WorkflowEngine } from '../src/workflow-engine'
import { MockSocialProvider } from '@socialkit/testing'

describe('WorkflowEngine', () => {
  it('executes a single post step', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_1',
      name: 'Single Post',
      steps: [
        { id: 'post1', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(result.context.stepOutputs.post1.id).toBe('new_post_mock')
    expect(provider.calls[0].method).toBe('publishPost')
  })
})
