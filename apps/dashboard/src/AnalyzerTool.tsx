import React, { useState, useMemo } from 'react'
import { PostAnalyzer, ContentScorer } from '@socialkit/analyzer'

const analyzer = new PostAnalyzer()
const scorer = new ContentScorer()

export default function AnalyzerTool() {
  const [text, setText] = useState('')

  const analysis = useMemo(() => analyzer.analyzeText(text), [text])

  const score = useMemo(() => scorer.score(analysis, text), [analysis, text])

  return (
    <div>
      <h3>Content Analyzer</h3>
      <textarea
        placeholder="Paste your post text here..."
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        style={{ width: '100%', fontFamily: 'monospace', padding: 8 }}
      />
      <div style={{ display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
        <Stat label="Words" value={analysis.wordCount} />
        <Stat label="Hashtags" value={analysis.hashtagCount} />
        <Stat label="Mentions" value={analysis.mentionCount} />
        <Stat label="Links" value={analysis.linkCount} />
        <Stat label="Emojis" value={analysis.emojiCount} />
        <Stat label="Score" value={score.total} />
      </div>
      {text && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Read time: ~{analyzer.estimateReadTime(text)} min
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#f0f0f0', padding: '8px 16px', borderRadius: 6, textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontSize: 20, fontWeight: 'bold' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#555' }}>{label}</div>
    </div>
  )
}
