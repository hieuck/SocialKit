import React, { useRef, useState, useEffect } from 'react'

interface Props {
  url: string
  onUrlChange?: (url: string) => void
  visible: boolean
  onClose: () => void
  onOAuthCode?: (code: string) => void
}

export default function BrowserPanel({ url, onUrlChange, visible, onClose, onOAuthCode }: Props) {
  const webviewRef = useRef<any>(null)
  const [currentUrl, setCurrentUrl] = useState(url)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const oauthHandled = useRef(false)

  useEffect(() => { setCurrentUrl(url); oauthHandled.current = false }, [url])

  useEffect(() => {
    const wv = webviewRef.current
    if (!wv) return

    const onUpdate = () => {
      setCanGoBack(wv.canGoBack())
      setCanGoForward(wv.canGoForward())
      setIsLoading(wv.isLoading())
    }

    const onNavigate = (e: any) => {
      setCurrentUrl(e.url)
      onUrlChange?.(e.url)
      onUpdate()

      const parsed = new URL(e.url)
      const code = parsed.searchParams.get('code')
      if (code && !oauthHandled.current) {
        oauthHandled.current = true
        onOAuthCode?.(code)
      }
    }

    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigate)
    wv.addEventListener('did-start-loading', () => setIsLoading(true))
    wv.addEventListener('did-stop-loading', () => setIsLoading(false))

    return () => {
      try { wv.stop() } catch {}
    }
  }, [])

  const navigate = () => {
    const wv = webviewRef.current
    if (wv) wv.loadURL(currentUrl)
  }

  const goBack = () => webviewRef.current?.goBack()
  const goForward = () => webviewRef.current?.goForward()
  const reload = () => webviewRef.current?.reload()

  if (!visible) return null

  const btnStyle = { padding: '4px 10px', margin: '0 2px', cursor: 'pointer', fontSize: 13 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #ccc' }}>
      <div style={{ display: 'flex', padding: 6, background: '#f0f0f0', alignItems: 'center', gap: 4 }}>
        <button onClick={goBack} disabled={!canGoBack} style={btnStyle}>◀</button>
        <button onClick={goForward} disabled={!canGoForward} style={btnStyle}>▶</button>
        <button onClick={reload} style={btnStyle}>{isLoading ? '◉' : '⟳'}</button>
        <input
          value={currentUrl}
          onChange={e => setCurrentUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate()}
          style={{ flex: 1, padding: '4px 8px', fontSize: 13, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button onClick={onClose} style={{ ...btnStyle, color: '#c00' }}>✕</button>
      </div>
      <webview
        ref={webviewRef}
        src={url}
        style={{ flex: 1 }}
        webpreferences="contextIsolation=1"
      />
    </div>
  )
}
