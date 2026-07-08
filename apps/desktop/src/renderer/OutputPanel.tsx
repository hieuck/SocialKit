import React from 'react'

interface Props {
  result: string
  visible: boolean
  onClose: () => void
}

export default function OutputPanel({ result, visible, onClose }: Props) {
  if (!visible || !result) return null

  return (
    <div style={{
      background: '#1e1e1e',
      color: '#ce9178',
      fontFamily: 'monospace',
      fontSize: 13,
      borderTop: '1px solid #333',
      padding: 8,
      maxHeight: 150,
      overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#999', fontSize: 11, textTransform: 'uppercase' }}>Output</span>
        <span onClick={onClose} style={{ cursor: 'pointer', color: '#999', fontSize: 12 }}>✕</span>
      </div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>
    </div>
  )
}
