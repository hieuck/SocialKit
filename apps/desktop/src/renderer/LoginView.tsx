import React, { useState } from 'react'

interface Props {
  onResult: (msg: string) => void
  onOpenBrowser?: (url: string) => void
}

export default function LoginView({ onResult, onOpenBrowser }: Props) {
  const [platform, setPlatform] = useState('facebook')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)
    try {
      const api = (window as any).socialkit

      if (api?.getLoginUrl) {
        const url = await api.getLoginUrl(platform)
        if (onOpenBrowser) {
          onOpenBrowser(url)
          onResult('Browser opened. Log in to Facebook in the panel on the left.')
          return
        }
      }

      if (api?.login) {
        const result = await api.login(platform)
        onResult(result)
      } else if (api?.run) {
        const result = await api.run(['login', platform])
        onResult(`Open this URL in your browser:\n${result}`)
      } else {
        onResult('socialkit API not available. Are you running in Electron?')
      }
    } catch (err) {
      onResult(`Error: ${err instanceof Error ? err.message : String(err)}`)
    }
    setLoading(false)
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 8px' }}>Login</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Select a platform and click the button to authenticate.
        The login page will open in the embedded browser panel.
      </p>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontWeight: 500, marginRight: 8 }}>Platform:</span>
        <select
          aria-label="Platform"
          value={platform}
          onChange={e => setPlatform(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #ccc', fontSize: 14 }}
        >
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="zalo">Zalo</option>
        </select>
      </div>
      <button
        onClick={login}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 600,
          background: '#1877F2',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Opening browser...' : `Login with ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
      </button>
    </div>
  )
}
