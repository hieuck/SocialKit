import { ContentScorer } from '../src/scorer'

describe('ContentScorer', () => {
  const scorer = new ContentScorer()

  it('scores empty text low', () => {
    const analysis = { wordCount: 0, hashtagCount: 0, mentionCount: 0, linkCount: 0, emojiCount: 0 }
    const result = scorer.score(analysis, '')
    expect(result.total).toBe(0)
  })

  it('gives higher score for rich content', () => {
    const analysis = { wordCount: 30, hashtagCount: 2, mentionCount: 1, linkCount: 1, emojiCount: 1 }
    const result = scorer.score(analysis, 'Rich post with #tags and @mentions and emoji 🎉')
    expect(result.total).toBeGreaterThan(10)
    expect(result.breakdown.hashtags).toBe(4)
    expect(result.breakdown.mentions).toBe(1)
    expect(result.breakdown.emojis).toBe(2)
  })

  it('caps hashtag bonus at 5', () => {
    const analysis = { wordCount: 10, hashtagCount: 10, mentionCount: 0, linkCount: 0, emojiCount: 0 }
    const result = scorer.score(analysis, 'a '.repeat(10))
    expect(result.breakdown.hashtags).toBe(5)
  })
})
