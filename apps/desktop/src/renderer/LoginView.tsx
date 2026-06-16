import React, { useState } from 'react'
import { cliRun } from './api'

interface Props {
  onResult: (msg: string) => void
}

export default function LoginView({ onResult }: Props) {
  const [platform, setPlatform] = useState('facebook')
  const [loginUrl, setLoginUrl] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const getUrl = async () => {
    setLoading(true)
    const result = await cliRun(['login', platform])
    setLoginUrl(result)
    onResult(result)
    setLoading(false)
  }

  const exchangeCode = async () => {
    setLoading(true)
    const result = await cliRun(['login', platform, '--code', code, '--redirectUri', 'http://localhost:3000/callback'])
    onResult(result)
    setLoading(false)
  }

  return (
    <div>
      <label>
        Platform:
        <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ marginLeft: 8 }}>
          <option value="facebook">facebook</option>
          <option value="instagram">instagram</option>
          <option value="zalo">zalo</option>
        </select>
      </label>
      <div style={{ marginTop: 12 }}>
        <button onClick={getUrl} disabled={loading}>Get Login URL</button>
      </div>
      {loginUrl && (
        <div style={{ marginTop: 12 }}>
          <p style={{ background: '#f0f0f0', padding: 8, borderRadius: 4, wordBreak: 'break-all' }}>{loginUrl}</p>
          <div style={{ marginTop: 8 }}>
            <input
              placeholder="Paste auth code here"
              value={code}
              onChange={e => setCode(e.target.value)}
              style={{ width: 300, marginRight: 8 }}
            />
            <button onClick={exchangeCode} disabled={loading || !code}>Exchange Code</button>
          </div>
        </div>
      )}
    </div>
  )
}
