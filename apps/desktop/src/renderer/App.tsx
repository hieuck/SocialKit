import React, { useState, useRef } from 'react'

const S = {
  c: { display: 'flex', height: '100vh', fontFamily: "Segoe UI, sans-serif" },
  browser: { flex: 1, display: 'flex', flexDirection: 'column' as const },
  bar: { display: 'flex', padding: 6, background: '#f0f0f0', alignItems: 'center', gap: 4, borderBottom: '1px solid #ddd' },
  btn: (d = false) => ({ padding: '4px 10px', cursor: d ? 'not-allowed' : 'pointer', fontSize: 13, background: '#fff', border: '1px solid #ccc', borderRadius: 3, opacity: d ? 0.5 : 1 }),
  inp: { flex: 1, padding: '4px 8px', fontSize: 13, border: '1px solid #ccc', borderRadius: 4, outline: 'none' },
  side: { width: 380, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column' as const, background: '#fafafa' },
  tab: (a: boolean) => ({ padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: a ? '#1877F2' : '#666', borderBottom: a ? '2px solid #1877F2' : '2px solid transparent', background: '#fff' }),
  scroll: { flex: 1, overflow: 'auto', padding: 12 },
  card: { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 12, marginBottom: 8 },
  status: { padding: '8px 12px', fontSize: 12, borderTop: '1px solid #ddd', background: '#fff', display: 'flex', alignItems: 'center', gap: 6 },
  log: { padding: 12, background: '#1e1e1e', color: '#ce9178', fontFamily: 'monospace', fontSize: 11, maxHeight: 120, overflow: 'auto', whiteSpace: 'pre-wrap', borderTop: '1px solid #ddd' },
}

async function api(token: string, path: string, method = 'GET', body?: any) {
  const opts: any = { method, headers: {} as any }
  if (token) opts.headers['Authorization'] = 'Bearer ' + token
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body) }
  const r = await fetch('https://graph.facebook.com/v22.0' + path, opts)
  return r.json()
}

export default function App() {
  const wv = useRef<any>(null)
  const [url, setUrl] = useState('https://facebook.com')
  const [iu, setIu] = useState('https://facebook.com')
  const [tab, setTab] = useState('profile')
  const [token, setToken] = useState('')
  const [me, setMe] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [log, setLog] = useState('')
  const [hist, setHist] = useState<string[]>([])
  const [hi, setHi] = useState(-1)

  const g = (p: string, m = 'GET', b?: any) => api(token, p, m, b).then(d => { setData(d); setLog(JSON.stringify(d, null, 2)); return d })
  const nav = (u: string) => { setUrl(u); setHist(h => [...h, u]); setHi(h => h + 1) }

  const extract = async () => {
    try {
      const fbToken = await wv.current.executeJavaScript(`
        fetch('/ajax/session',{credentials:'include'}).then(r=>r.json()).then(d=>d.accessToken||'')
      `)
      if (!fbToken) { setLog('Not logged in. Log into Facebook first.'); return }
      setToken(fbToken)
      const profile = await api(fbToken, '/me?fields=id,name,email,picture')
      if (profile.error) { setLog('Token invalid: ' + profile.error.message); setToken(''); return }
      setMe(profile)
      setLog('Logged in as ' + profile.name)
    } catch (e: any) { setLog('Error: ' + e.message) }
  }

  const loadPosts = async () => {
    const d = await g('/me/posts?fields=id,message,created_time,likes.limit(1).summary(true),comments.limit(1).summary(true)&limit=10')
    if (d.error) return
  }

  const loadPages = async () => { const d = await g('/me/accounts'); if (d.error) return }
  const loadComments = async (id: string) => { const d = await g('/' + id + '/comments?fields=id,message,from,created_time&limit=20'); if (d.error) return }
  const like = async (id: string) => { const d = await g('/' + id + '/likes', 'POST'); if (d.error) return }

  return (
    <div style={S.c}>
      <div style={S.browser}>
        <div style={S.bar}>
          <button style={S.btn(hi <= 0)} onClick={() => { const i = Math.max(0, hi - 1); setIu(hist[i]); setUrl(hist[i]); setHi(i) }} disabled={hi <= 0}>◀</button>
          <button style={S.btn(hi >= hist.length - 1)} onClick={() => { const i = Math.min(hist.length - 1, hi + 1); setIu(hist[i]); setUrl(hist[i]); setHi(i) }} disabled={hi >= hist.length - 1}>▶</button>
          <button style={S.btn(false)} onClick={() => nav(iu)}>⟳</button>
          <input style={S.inp} value={iu} onChange={e => setIu(e.target.value)} onKeyDown={e => e.key === 'Enter' && nav(e.currentTarget.value.startsWith('http') ? e.currentTarget.value : 'https://' + e.currentTarget.value)} />
        </div>
        <webview ref={wv} src={url} style={{ flex: 1 }} webpreferences="contextIsolation=0" />
      </div>

      <div style={S.side}>
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', background: '#fff' }}>
          {['profile', 'posts', 'pages', 'publish'].map(t => (
            <div key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</div>
          ))}
        </div>

        <div style={S.scroll}>
          {tab === 'profile' && (
            <div>
              {!token ? (
                <div style={S.card}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>1. Login to Facebook</div>
                  <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>Log into Facebook in the left panel, then click the button.</p>
                  <button onClick={extract} style={{ padding: '10px 20px', background: '#1877F2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, width: '100%' }}>Extract Token</button>
                </div>
              ) : (
                <div>
                  <div style={S.card}>
                    {me?.picture?.data?.url && <img src={me.picture.data.url} style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 8 }} />}
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{me?.name || 'Loading...'}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>ID: {me?.id}</div>
                    {me?.email && <div style={{ color: '#666', fontSize: 13 }}>{me.email}</div>}
                  </div>
                  <div style={S.card}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Quick Actions</div>
                    <button onClick={() => g('/me?fields=id,name,email,picture,birthday,location')} style={{ ...btnS, marginRight: 4 }}>Refresh</button>
                    <button onClick={loadPosts} style={btnS}>My Posts</button>
                    <button onClick={loadPages} style={btnS}>My Pages</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'posts' && (
            <div>
              <button onClick={loadPosts} style={{ ...btnS, width: '100%', marginBottom: 12 }}>⟳ Refresh Posts</button>
              {data?.data?.map((p: any) => (
                <div key={p.id} style={S.card}>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>{p.message || '(no text)'}</div>
                  <div style={{ color: '#999', fontSize: 11, marginBottom: 6 }}>{new Date(p.created_time).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#666' }}>
                    <span>♥ {p.likes?.summary?.total_count || 0}</span>
                    <span>💬 {p.comments?.summary?.total_count || 0}</span>
                    <span style={{ cursor: 'pointer', color: '#1877F2' }} onClick={() => like(p.id)}>Like</span>
                    <span style={{ cursor: 'pointer', color: '#1877F2' }} onClick={() => loadComments(p.id)}>Comments</span>
                  </div>
                </div>
              )) || <div style={{ color: '#999', fontSize: 13 }}>Click 'Refresh Posts' to load</div>}
            </div>
          )}

          {tab === 'pages' && (
            <div>
              <button onClick={loadPages} style={{ ...btnS, width: '100%', marginBottom: 12 }}>⟳ Refresh Pages</button>
              {data?.data?.map((p: any) => (
                <div key={p.id} style={S.card}>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>ID: {p.id}</div>
                  <div style={{ color: '#999', fontSize: 11 }}>Category: {p.category || 'N/A'}</div>
                </div>
              )) || <div style={{ color: '#999', fontSize: 13 }}>Click 'Refresh Pages' to load</div>}
            </div>
          )}

          {tab === 'publish' && (
            <div>
              <div style={S.card}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Publish Post</div>
                <textarea id="msg" rows={4} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8, fontFamily: 'inherit' }} placeholder="What's on your mind?" />
                <button onClick={() => {
                  const msg = (document.getElementById('msg') as HTMLTextAreaElement).value
                  g('/me/feed', 'POST', { message: msg })
                }} style={{ ...btnS, width: '100%', background: token ? '#1877F2' : '#ccc', color: '#fff' }} disabled={!token}>Publish to Timeline</button>
              </div>
              <div style={S.card}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Publish to Page</div>
                <input id="pid" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8 }} placeholder="Page ID" />
                <textarea id="pmsg" rows={3} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 8, fontFamily: 'inherit' }} placeholder="Message" />
                <button onClick={() => {
                  const pid = (document.getElementById('pid') as HTMLInputElement).value
                  const msg = (document.getElementById('pmsg') as HTMLTextAreaElement).value
                  if (pid && msg) g('/' + pid + '/feed', 'POST', { message: msg })
                }} style={{ ...btnS, width: '100%', background: token ? '#1877F2' : '#ccc', color: '#fff' }} disabled={!token}>Publish to Page</button>
              </div>
            </div>
          )}
        </div>

        <div style={S.status}>
          <span style={{ color: token ? '#0a0' : '#c00' }}>{token ? '●' : '○'}</span>
          <span>{token ? (me?.name || 'Connected') : 'Not logged in'}</span>
        </div>
        {log && <div style={S.log}>{log}</div>}
      </div>
    </div>
  )
}

const btnS: any = { padding: '8px 16px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: '#e4e6eb', color: '#050505' }
