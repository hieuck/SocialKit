import React, { useState } from 'react'
import { Card, TextInput } from '@socialkit/ui'

interface Props {
  onResult: (msg: string) => void
}

const btnStyle = {
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 600,
  background: '#0066cc',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
}

const btnDisabled = { ...btnStyle, opacity: 0.5, cursor: 'not-allowed' }

export default function PostView({ onResult }: Props) {
  const [pageId, setPageId] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)

  const publish = async () => {
    setLoading(true)
    const api = (window as any).socialkit
    const args = ['post', '--page', pageId, '--message', message]
    if (link) args.push('--link', link)
    const result = await (api?.run?.(args) ?? Promise.resolve('API not available'))
    onResult(result)
    setLoading(false)
  }

  return (
    <Card title="Publish Post">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Publish a new post to your connected page.
      </p>
      <TextInput label="Page ID" value={pageId} onChange={setPageId} />
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 500 }}>Message</label>
        <br />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4, fontFamily: 'inherit' }}
        />
      </div>
      <TextInput label="Link (optional)" value={link} onChange={setLink} />
      <div style={{ marginTop: 16 }}>
        <button
          onClick={publish}
          disabled={loading || !pageId || !message}
          style={(!pageId || !message) ? btnDisabled : btnStyle}
        >
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </Card>
  )
}
