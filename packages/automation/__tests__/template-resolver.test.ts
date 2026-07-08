import { resolveValue, resolveInputs } from '../src/template-resolver'

describe('TemplateResolver', () => {
  it('resolves a simple variable', () => {
    const context = { variables: { pageId: 'p1' }, stepOutputs: {} }
    expect(resolveValue('{{pageId}}', context)).toBe('p1')
  })

  it('resolves a step output', () => {
    const context = {
      variables: {},
      stepOutputs: { publishPost: { id: 'post_123' } },
    }
    expect(resolveValue('{{steps.publishPost.id}}', context)).toBe('post_123')
  })

  it('returns literal value unchanged', () => {
    const context = { variables: { pageId: 'p1' }, stepOutputs: {} }
    expect(resolveValue('literal string', context)).toBe('literal string')
  })

  it('resolves object inputs recursively', () => {
    const context = {
      variables: { pageId: 'p1' },
      stepOutputs: { publishPost: { id: 'post_123' } },
    }
    const inputs = {
      pageId: '{{pageId}}',
      postId: '{{steps.publishPost.id}}',
      message: 'Hello',
    }
    expect(resolveInputs(inputs, context)).toEqual({
      pageId: 'p1',
      postId: 'post_123',
      message: 'Hello',
    })
  })
})
