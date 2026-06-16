import { AutoExecutor } from '../src/executor'
import { MockSocialProvider } from '@socialkit/testing'

describe('AutoExecutor', () => {
  it('creates executor with provider', () => {
    const executor = new AutoExecutor(new MockSocialProvider())
    expect(executor).toBeDefined()
  })

  it('executes a post task', async () => {
    const mx = new MockSocialProvider()
    const executor = new AutoExecutor(mx)
    const result = await executor.execute({
      id: 't1', type: 'post', pageId: 'p1',
      payload: { message: 'Hello' }, status: 'pending',
    })
    expect(result?.id).toBe('new_post_mock')
    expect(mx.calls[0].method).toBe('publishPost')
  })

  it('executes a like task', async () => {
    const mx = new MockSocialProvider()
    const executor = new AutoExecutor(mx)
    const result = await executor.execute({
      id: 't2', type: 'like', pageId: 'p1', postId: 'post1', status: 'pending',
    })
    expect(result).toBeUndefined()
    expect(mx.calls[0].method).toBe('likePost')
  })

  it('executes a comment task', async () => {
    const mx = new MockSocialProvider()
    const executor = new AutoExecutor(mx)
    const result = await executor.execute({
      id: 't3', type: 'comment', pageId: 'p1', postId: 'comment1',
      payload: { message: 'Nice' }, status: 'pending',
    })
    expect(result?.id).toBe('reply_mock')
    expect(mx.calls[0].method).toBe('replyToComment')
  })
})
