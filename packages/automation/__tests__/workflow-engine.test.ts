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

  it('executes a comment step', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_comment',
      name: 'Comment',
      steps: [
        { id: 'c1', action: 'comment', inputs: { postId: 'post1', message: 'Nice!' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(result.context.stepOutputs.c1.id).toBe('reply_mock')
    expect(provider.calls[0].method).toBe('replyToComment')
  })

  it('executes a like step', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_like',
      name: 'Like',
      steps: [
        { id: 'l1', action: 'like', inputs: { postId: 'post1' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(provider.calls[0].method).toBe('likePost')
  })

  it('executes a wait step', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const start = Date.now()
    await engine.execute({
      id: 'wf_wait',
      name: 'Wait',
      steps: [
        { id: 'w1', action: 'wait', inputs: { durationMs: 30 } },
      ],
    })
    expect(Date.now() - start).toBeGreaterThanOrEqual(25)
  })

  it('executes a setContext step', async () => {
    const engine = new WorkflowEngine(new MockSocialProvider())
    const result = await engine.execute({
      id: 'wf_ctx',
      name: 'Set Context',
      steps: [
        { id: 's1', action: 'setContext', inputs: { key: 'greeting', value: 'hello' } },
      ],
    })
    expect(result.context.variables.greeting).toBe('hello')
  })

  it('executes a condition step that succeeds', async () => {
    const engine = new WorkflowEngine(new MockSocialProvider())
    const result = await engine.execute({
      id: 'wf_cond',
      name: 'Condition',
      initialContext: { platform: 'facebook' },
      steps: [
        { id: 'c1', action: 'condition', inputs: { expression: 'platform === "facebook"' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(result.context.stepOutputs.c1.result).toBe(true)
  })

  it('executes a condition step that fails', async () => {
    const engine = new WorkflowEngine(new MockSocialProvider())
    const result = await engine.execute({
      id: 'wf_cond_false',
      name: 'Condition False',
      initialContext: { platform: 'zalo' },
      steps: [
        { id: 'c1', action: 'condition', inputs: { expression: 'platform === "facebook"' } },
      ],
    })
    expect(result.context.stepOutputs.c1.result).toBe(false)
  })

  it('shares post id between steps', async () => {
    const provider = new MockSocialProvider()
    const engine = new WorkflowEngine(provider)
    const result = await engine.execute({
      id: 'wf_chain',
      name: 'Post then Comment',
      steps: [
        { id: 'publish', action: 'post', inputs: { pageId: 'p1', message: 'Hello' } },
        { id: 'comment', action: 'comment', inputs: { postId: '{{steps.publish.id}}', message: 'Thanks!' } },
      ],
    })
    expect(result.status).toBe('done')
    expect(provider.calls[1].args[0]).toBe('new_post_mock')
    expect(provider.calls[1].method).toBe('replyToComment')
  })
})
