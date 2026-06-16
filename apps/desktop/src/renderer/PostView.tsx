import React, { useState } from 'react'
import { cliRun } from './api'

interface Props {
  onResult: (msg: string) => void
}

export default function PostView({ onResult }: Props) {
  const [pageId, setPageId] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)

  const publish = async () => {
    setLoading(true)
    const args = ['post', '--page', pageId, '--message', message]
    if (link) args.push('--link', link)
    const result = await cliRun(args)
    onResult(result)
    setLoading(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <label>Page ID:<br /><input value={pageId} onChange={e => setPageId(e.target.value)} style={{ width: '100%' }} /></label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Message:<br /><textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} style={{ width: '100%' }} /></label>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>Link (optional):<br /><input value={link} onChange={e => setLink(e.target.value)} style={{ width: '100%' }} /></label>
      </div>
      <button onClick={publish} disabled={loading || !pageId || !message}>Publish</button>
    </div>
  )
}
