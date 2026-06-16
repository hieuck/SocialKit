import React, { useState } from 'react'
import { cliRun } from './api'

interface Props {
  onResult: (msg: string) => void
}

export default function ScheduleView({ onResult }: Props) {
  const [pageId, setPageId] = useState('')
  const [message, setMessage] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  const schedule = async () => {
    setLoading(true)
    const args = ['schedule', '--page', pageId, '--message', message]
    if (time) args.push('--at', new Date(time).toISOString())
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
        <label>Time (optional):<br /><input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} /></label>
      </div>
      <button onClick={schedule} disabled={loading || !pageId || !message}>Schedule</button>
    </div>
  )
}
