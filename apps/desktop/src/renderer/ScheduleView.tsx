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

export default function ScheduleView({ onResult }: Props) {
  const [pageId, setPageId] = useState('')
  const [message, setMessage] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  const schedule = async () => {
    setLoading(true)
    const api = (window as any).socialkit
    const args = ['schedule', '--page', pageId, '--message', message]
    if (time) args.push('--at', new Date(time).toISOString())
    const result = await (api?.run?.(args) ?? Promise.resolve('API not available'))
    onResult(result)
    setLoading(false)
  }

  return (
    <Card title="Schedule Post">
      <p style={{ color: '#666', marginBottom: 16 }}>
        Schedule a post for future publication.
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
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 500 }}>Schedule Time</label>
        <br />
        <input
          type="datetime-local"
          value={time}
          onChange={e => setTime(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', marginTop: 4, fontSize: 14 }}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={schedule}
          disabled={loading || !pageId || !message}
          style={(!pageId || !message) ? btnDisabled : btnStyle}
        >
          {loading ? 'Scheduling...' : 'Schedule'}
        </button>
      </div>
    </Card>
  )
}
