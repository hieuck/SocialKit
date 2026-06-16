import { PlatformError, RateLimitError, AuthError } from '@socialkit/core'
import { PostAnalyzer, ContentScorer } from '@socialkit/analyzer'
import { Scheduler } from '@socialkit/automation'
import { MockSocialProvider } from '@socialkit/testing'

describe('smoke: core', () => {
  it('creates error types', () => {
    const p = new PlatformError('test', 400)
    expect(p.code).toBe(400)
    const r = new RateLimitError('slow', 30)
    expect(r.retryAfter).toBe(30)
    const a = new AuthError('bad', 'invalid_token')
    expect(a.reason).toBe('invalid_token')
  })
})

describe('smoke: analyzer', () => {
  it('analyzes text', () => {
    const a = new PostAnalyzer()
    const r = a.analyzeText('Hello #world from @socialkit')
    expect(r.wordCount).toBe(4)
    expect(r.hashtagCount).toBe(1)
    expect(r.mentionCount).toBe(1)
  })

  it('scores content', () => {
    const s = new ContentScorer()
    const a = new PostAnalyzer()
    const text = 'Big #news from @team at https://example.com 🚀'
    const r = s.score(a.analyzeText(text), text)
    expect(r.total).toBeGreaterThan(0)
  })
})

describe('smoke: automation', () => {
  it('schedules and cancels', () => {
    const s = new Scheduler()
    const task = s.schedule({ type: 'post', pageId: 'p1', payload: { message: 'Hi' }, runAt: new Date(Date.now() + 99999) })
    expect(s.list()).toHaveLength(1)
    s.cancel(task.id)
    expect(s.list()).toHaveLength(0)
    s.stop()
  })
})

describe('smoke: testing', () => {
  it('MockSocialProvider works', async () => {
    const m = new MockSocialProvider()
    m.setAccessToken('test')
    expect(m.getAccessToken()).toBe('test')
    const profile = await m.getProfile()
    expect(profile.name).toBeDefined()
  })
})
