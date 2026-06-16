import { PostAnalyzer } from '../src/analyzer'

describe('PostAnalyzer', () => {
  const analyzer = new PostAnalyzer()

  describe('analyzeText', () => {
    it('counts words in a simple message', () => {
      const result = analyzer.analyzeText('Hello world from SocialKit')
      expect(result.wordCount).toBe(4)
    })

    it('counts hashtags', () => {
      const result = analyzer.analyzeText('Check out #socialkit and #typescript')
      expect(result.hashtagCount).toBe(2)
    })

    it('counts mentions', () => {
      const result = analyzer.analyzeText('Thanks @user1 and @user2 for help')
      expect(result.mentionCount).toBe(2)
    })

    it('counts URLs', () => {
      const result = analyzer.analyzeText('Visit https://example.com and http://test.com')
      expect(result.linkCount).toBe(2)
    })

    it('counts emojis', () => {
      const result = analyzer.analyzeText('Hello 👋 world 🌍 testing 🎉')
      expect(result.emojiCount).toBe(3)
    })

    it('handles empty message', () => {
      const result = analyzer.analyzeText('')
      expect(result.wordCount).toBe(0)
      expect(result.hashtagCount).toBe(0)
      expect(result.mentionCount).toBe(0)
      expect(result.linkCount).toBe(0)
      expect(result.emojiCount).toBe(0)
    })

    it('handles combined analysis', () => {
      const result = analyzer.analyzeText('Big #news today! Thanks @team for https://example.com 🚀')
      expect(result.wordCount).toBe(8)
      expect(result.hashtagCount).toBe(1)
      expect(result.mentionCount).toBe(1)
      expect(result.linkCount).toBe(1)
      expect(result.emojiCount).toBe(1)
    })
  })

  describe('estimateReadTime', () => {
    it('estimates read time based on word count', () => {
      const short = analyzer.estimateReadTime('Hello')
      expect(short).toBe(1)

      const long = analyzer.estimateReadTime('word '.repeat(250))
      expect(long).toBe(2)
    })
  })

  describe('extractHashtags', () => {
    it('returns hashtag words without #', () => {
      const tags = analyzer.extractHashtags('Use #socialkit and #typescript for #TDD')
      expect(tags).toEqual(['socialkit', 'typescript', 'TDD'])
    })

    it('returns empty array when no hashtags', () => {
      const tags = analyzer.extractHashtags('Plain text without tags')
      expect(tags).toEqual([])
    })
  })
})
