export interface TextAnalysis {
  wordCount: number
  hashtagCount: number
  mentionCount: number
  linkCount: number
  emojiCount: number
}

export class PostAnalyzer {
  analyzeText(text: string): TextAnalysis {
    return {
      wordCount: this.countWords(text),
      hashtagCount: this.countPattern(text, /#\w+/g),
      mentionCount: this.countPattern(text, /@\w+/g),
      linkCount: this.countPattern(text, /https?:\/\/[^\s]+/g),
      emojiCount: this.countEmojis(text),
    }
  }

  estimateReadTime(text: string, wpm = 200): number {
    const words = this.countWords(text)
    return Math.max(1, Math.ceil(words / wpm))
  }

  extractHashtags(text: string): string[] {
    const matches = text.match(/#\w+/g)
    return matches ? matches.map(t => t.slice(1)) : []
  }

  private countWords(text: string): number {
    const trimmed = text.trim()
    return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length
  }

  private countPattern(text: string, pattern: RegExp): number {
    const matches = text.match(pattern)
    return matches ? matches.length : 0
  }

  private countEmojis(text: string): number {
    const emojiRegex = /\p{Emoji_Presentation}/gu
    const matches = text.match(emojiRegex)
    return matches ? matches.length : 0
  }
}
