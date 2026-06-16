import { TextAnalysis } from './analyzer.js'

export interface ContentScore {
  total: number
  breakdown: {
    length: number
    hashtags: number
    mentions: number
    emojis: number
    readability: number
  }
}

export class ContentScorer {
  score(analysis: TextAnalysis, text: string): ContentScore {
    const length = Math.min(10, Math.floor(analysis.wordCount / 10))
    const hashtags = Math.min(5, analysis.hashtagCount * 2)
    const mentions = Math.min(3, analysis.mentionCount)
    const emojis = Math.min(5, analysis.emojiCount * 2)
    const readability = text.length > 0 ? 5 : 0

    return {
      total: length + hashtags + mentions + emojis + readability,
      breakdown: { length, hashtags, mentions, emojis, readability },
    }
  }
}
