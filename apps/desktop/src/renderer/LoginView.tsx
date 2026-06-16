import React, { useState } from 'react'

interface Props {
  onResult: (msg: string) => void
}

export default function LoginView({ onResult }: Props) {
  const [platform, setPlatform] = useState('facebook')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)
    try {
      const api = (window as any).socialkit
      if (api?.login) {
        const result = await api.login(platform)
        onResult(result)
      } else {
        const result = await api.run(['login', platform])
        onResult(`Open this URL in your browser:\n${result}`)
      }
    } catch (err) {
      onResult(`Error: ${err instanceof Error ? err.message : String(err)}`)
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label>
          Platform:
          <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ marginLeft: 8, padding: '4px 8px' }}>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="zalo">Zalo</option>
          </select>
        </label>
      </div>
      <button
        onClick={login}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: 16,
          background: '#1877F2',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        {loading ? 'Opening browser...' : `Login with ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
      </button>
    </div>
  )
}
