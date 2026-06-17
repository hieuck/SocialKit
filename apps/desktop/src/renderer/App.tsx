import React, { useState } from 'react'

const styles = {
  container: { display: 'flex', height: '100vh', fontFamily: "Segoe UI, sans-serif" },
  browser: { flex: 1, display: 'flex', flexDirection: 'column' as const, background: '#fff' },
  urlBar: { display: 'flex', padding: 6, background: '#f0f0f0', alignItems: 'center', gap: 4, borderBottom: '1px solid #ddd' },
  btn: { padding: '4px 10px', cursor: 'pointer', fontSize: 13, background: '#fff', border: '1px solid #ccc', borderRadius: 3 },
  urlInput: { flex: 1, padding: '4px 8px', fontSize: 13, border: '1px solid #ccc', borderRadius: 4, outline: 'none' },
  webview: { flex: 1 },
  toolkit: { width: 320, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column' as const, background: '#fafafa' },
  tabBar: { display: 'flex', borderBottom: '1px solid #ddd', background: '#fff' },
  tab: (active: boolean) => ({
    flex: 1, padding: '10px 0', textAlign: 'center' as const, cursor: 'pointer',
    fontSize: 12, fontWeight: 600, color: active ? '#1877F2' : '#666',
    borderBottom: active ? '2px solid #1877F2' : '2px solid transparent',
  }),
  content: { flex: 1, overflow: 'auto', padding: 16 },
  result: { background: '#1e1e1e', color: '#ce9178', fontFamily: 'monospace', fontSize: 12, padding: 12, maxHeight: 120, overflow: 'auto' },
}

export default function App() {
  const [url, setUrl] = useState('https://facebook.com')
  const [inputUrl, setInputUrl] = useState('https://facebook.com')
  const [activeTab, setActiveTab] = useState('login')
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)

  const navigate = () => {
    const target = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`
    setUrl(target)
    setHistory(h => [...h, target])
    setHistIdx(h => h + 1)
  }

  return (
    <div style={styles.container}>
      {/* LEFT: Browser */}
      <div style={styles.browser}>
        <div style={styles.urlBar}>
          <button style={styles.btn} onClick={() => { const i = Math.max(0, histIdx - 1); setInputUrl(history[i]); setUrl(history[i]); setHistIdx(i) }} disabled={histIdx <= 0}>◀</button>
          <button style={styles.btn} onClick={() => { const i = Math.min(history.length - 1, histIdx + 1); setInputUrl(history[i]); setUrl(history[i]); setHistIdx(i) }} disabled={histIdx >= history.length - 1}>▶</button>
          <button style={styles.btn} onClick={() => setUrl(inputUrl)}>⟳</button>
          <input style={styles.urlInput} value={inputUrl} onChange={e => setInputUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && navigate()} />
        </div>
        <webview src={url} style={styles.webview} webpreferences="contextIsolation=1" />
      </div>

      {/* RIGHT: Toolkit */}
      <div style={styles.toolkit}>
        <div style={styles.tabBar}>
          {['login', 'post', 'schedule'].map(t => (
            <div key={t} style={styles.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>
        <div style={styles.content}>
          {activeTab === 'login' && (
            <div>
              <h3 style={{ margin: '0 0 12px' }}>Login</h3>
              <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
                Browse to Facebook.com in the left panel and log in manually.
              </p>
              <button onClick={() => navigate()} style={{ padding: '10px 20px', background: '#1877F2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Open Facebook
              </button>
            </div>
          )}
          {activeTab === 'post' && (
            <div>
              <h3 style={{ margin: '0 0 12px' }}>Post</h3>
              <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>Coming soon. Use CLI: socialkit post ...</p>
            </div>
          )}
          {activeTab === 'schedule' && (
            <div>
              <h3 style={{ margin: '0 0 12px' }}>Schedule</h3>
              <p style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>Coming soon. Use CLI: socialkit schedule ...</p>
            </div>
          )}
        </div>
        {result && <div style={styles.result}>{result}</div>}
      </div>
    </div>
  )
}
