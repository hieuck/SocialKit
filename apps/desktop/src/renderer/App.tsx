import React, { useState, useRef } from 'react'

const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: "Segoe UI, sans-serif" },
  browser: { flex: 1, display: 'flex', flexDirection: 'column' as const },
  urlBar: { display: 'flex', padding: 6, background: '#f0f0f0', alignItems: 'center', gap: 4, borderBottom: '1px solid #ddd' },
  btn: (d = false) => ({ padding: '4px 10px', cursor: d ? 'not-allowed' : 'pointer', fontSize: 13, background: '#fff', border: '1px solid #ccc', borderRadius: 3, opacity: d ? 0.5 : 1 }),
  urlInput: { flex: 1, padding: '4px 8px', fontSize: 13, border: '1px solid #ccc', borderRadius: 4, outline: 'none' },
  panel: { width: 340, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column' as const, background: '#fafafa' },
  tab: (a: boolean) => ({ flex: 1, padding: '10px 0', textAlign: 'center' as const, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: a ? '#1877F2' : '#666', borderBottom: a ? '2px solid #1877F2' : '2px solid transparent', background: '#fff' }),
  content: { flex: 1, overflow: 'auto', padding: 16 },
  statusBar: { padding: '8px 12px', fontSize: 12, borderTop: '1px solid #ddd', background: '#fff' },
  green: { color: '#0a0' }, red: { color: '#c00' },
}

export default function App() {
  const webview = useRef<any>(null)
  const [url, setUrl] = useState('https://facebook.com')
  const [inputUrl, setInputUrl] = useState('https://facebook.com')
  const [tab, setTab] = useState('login')
  const [token, setToken] = useState('')
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIdx, setHIdx] = useState(-1)

  const nav = (u: string) => {
    setUrl(u); setHistory(h => [...h, u]); setHIdx(h => h + 1)
  }

  const extractToken = async () => {
    try {
      const wv = webview.current
      if (!wv) return

      const fbToken = await wv.executeJavaScript(`
        (async () => {
          try {
            const r = await fetch('/ajax/session', { credentials: 'include' });
            const d = await r.json();
            return d.accessToken || '';
          } catch(e) {
            try {
              const r2 = await fetch('https://www.facebook.com/ajax/session', { credentials: 'include' });
              const d2 = await r2.json();
              return d2.accessToken || '';
            } catch(e2) { return 'ERROR: ' + e2.message; }
          }
        })()
      `)

      if (fbToken && !fbToken.startsWith('ERROR')) {
        setToken(fbToken)
        setResult('Token extracted! You can now post/schedule.')
        
        const fbId = await wv.executeJavaScript(`
          (async () => {
            try {
              const r = await fetch('https://graph.facebook.com/v22.0/me?access_token=${fbToken}&fields=id,name');
              const d = await r.json();
              return d.id || '';
            } catch(e) { return ''; }
          })()
        `)
        if (fbId) setUserId(fbId)
      } else {
        setResult(fbToken || 'Not logged in. Log into Facebook first.')
      }
    } catch (err) {
      setResult('Error: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const callApi = async (path: string, method = 'GET', body?: any) => {
    if (!token) { setResult('Not logged in. Extract token first.'); return }
    try {
      const opts: any = { method, headers: { 'Authorization': `Bearer ${token}` } }
      if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body) }
      const r = await fetch(`https://graph.facebook.com/v22.0${path}`, opts)
      const d = await r.json()
      setResult(JSON.stringify(d, null, 2))
    } catch (err) {
      setResult('Error: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const navigate = () => {
    const target = inputUrl.startsWith('http') ? inputUrl : 'https://' + inputUrl
    nav(target)
  }

  const goBack = () => { const i = Math.max(0, hIdx - 1); setInputUrl(history[i]); setUrl(history[i]); setHIdx(i) }
  const goForward = () => { const i = Math.min(history.length - 1, hIdx + 1); setInputUrl(history[i]); setUrl(history[i]); setHIdx(i) }

  return (
    <div style={styles.container}>
      <div style={styles.browser}>
        <div style={styles.urlBar}>
          <button style={styles.btn(hIdx <= 0)} onClick={goBack} disabled={hIdx <= 0}>◀</button>
          <button style={styles.btn(hIdx >= history.length - 1)} onClick={goForward} disabled={hIdx >= history.length - 1}>▶</button>
          <button style={styles.btn(false)} onClick={() => nav(inputUrl)}>⟳</button>
          <input style={styles.urlInput} value={inputUrl} onChange={e => setInputUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && navigate()} />
        </div>
        <webview ref={webview} src={url} style={{ flex: 1 }} webpreferences="contextIsolation=0" />
      </div>

      <div style={styles.panel}>
        <div style={{ display: 'flex' }}>
          {['login', 'post', 'schedule'].map(t => (
            <div key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</div>
          ))}
        </div>

        <div style={styles.content}>
          {tab === 'login' && (
            <div>
              <h3 style={{ margin: '0 0 8px' }}>1. Login to Facebook</h3>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>Log into Facebook in the browser panel, then click the button below.</p>
              <button onClick={extractToken} style={{ padding: '10px 20px', background: '#1877F2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Extract Token</button>
              {token && (
                <div style={{ marginTop: 12, padding: 8, background: '#e8f5e9', borderRadius: 4, fontSize: 12, wordBreak: 'break-all' }}>
                  <div style={{ fontWeight: 600, color: '#0a0' }}>Logged in</div>
                  <div>Token: {token.slice(0, 30)}...</div>
                  {userId && <div>User ID: {userId}</div>}
                </div>
              )}
            </div>
          )}

          {tab === 'post' && (
            <div>
              <h3 style={{ margin: '0 0 8px' }}>2. Post to Facebook</h3>
              <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>Publish a post to your timeline.</p>
              <textarea id="msg" rows={4} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8, fontFamily: 'inherit' }} placeholder="What's on your mind?" />
              <button onClick={() => {
                const msg = (document.getElementById('msg') as HTMLTextAreaElement).value
                callApi('/me/feed', 'POST', { message: msg })
              }} style={{ padding: '10px 20px', background: token ? '#1877F2' : '#ccc', color: '#fff', border: 'none', borderRadius: 6, cursor: token ? 'pointer' : 'not-allowed', fontWeight: 600 }} disabled={!token}>Publish</button>
            </div>
          )}

          {tab === 'schedule' && (
            <div>
              <h3 style={{ margin: '0 0 8px' }}>Schedule</h3>
              <p style={{ color: '#666', fontSize: 13 }}>Coming soon. Use the Post tab for now.</p>
            </div>
          )}
        </div>

        <div style={styles.statusBar}>
          <div style={token ? styles.green : styles.red}>{token ? '✅ Logged in' : '◻ Not logged in'}</div>
        </div>
        {result && <div style={{ padding: 12, background: '#1e1e1e', color: '#ce9178', fontFamily: 'monospace', fontSize: 11, maxHeight: 150, overflow: 'auto', whiteSpace: 'pre-wrap', borderTop: '1px solid #ddd' }}>{result}</div>}
      </div>
    </div>
  )
}
