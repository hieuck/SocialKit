import React, { useState, useRef, useEffect } from 'react'

interface HistoryItem {
  command: string
  output: string
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#1e1e1e',
    color: '#d4d4d4',
    fontFamily: "'Cascadia Code', 'Fira Code', monospace",
    fontSize: 13,
  },
  header: {
    padding: '6px 12px',
    background: '#2d2d2d',
    color: '#999',
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  history: {
    flex: 1,
    overflow: 'auto',
    padding: 8,
  },
  line: {
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  command: { color: '#569cd6' },
  output: { color: '#ce9178' },
  inputRow: {
    display: 'flex',
    borderTop: '1px solid #333',
    padding: '4px 8px',
    alignItems: 'center',
  },
  prompt: { color: '#6a9955', marginRight: 6 },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#d4d4d4',
    fontFamily: 'inherit',
    fontSize: 13,
    outline: 'none',
  },
}

export default function TerminalPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView?.() }, [history])

  const run = async () => {
    if (!input.trim()) return
    const args = input.trim().split(/\s+/)
    try {
      const api = (window as any).socialkit
      const output = api?.run ? await api.run(args) : 'API not available'
      setHistory(h => [...h, { command: input.trim(), output }])
    } catch (err) {
      setHistory(h => [...h, { command: input.trim(), output: `Error: ${err}` }])
    }
    setInput('')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Terminal</div>
      <div style={styles.history}>
        {history.map((item, i) => (
          <div key={i}>
            <div style={{ ...styles.line, ...styles.command }}>{'> '}{item.command}</div>
            <div style={{ ...styles.line, ...styles.output }}>{item.output}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={styles.inputRow}>
        <span style={styles.prompt}>$</span>
        <input
          style={styles.input}
          placeholder="socialkit whoami"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
        />
      </div>
    </div>
  )
}
