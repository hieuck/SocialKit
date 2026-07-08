import React from 'react'
import BrowserPanel from './BrowserPanel'
import TerminalPanel from './TerminalPanel'
import OutputPanel from './OutputPanel'

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#1a1a1a',
  },
  sidebar: {
    width: 48,
    background: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: 12,
  },
  iconBtn: (active: boolean) => ({
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
    cursor: 'pointer',
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
    fontSize: 16,
    border: 'none',
  }),
  mainRow: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  browserCol: (visible: boolean) => ({
    width: visible ? '50%' as const : 0,
    minWidth: visible ? 400 : 0,
    overflow: 'hidden',
    transition: 'width 0.2s',
  }),
  centerCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 24,
    overflow: 'auto',
    background: '#f5f6fa',
  },
  terminalCol: (visible: boolean) => ({
    width: visible ? 320 : 0,
    minWidth: visible ? 320 : 0,
    overflow: 'hidden',
    transition: 'width 0.2s',
    borderLeft: visible ? '1px solid #333' : 'none',
  }),
  result: {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'monospace',
    fontSize: 13,
    marginTop: 20,
  },
}

interface LayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  result: string
  showBrowser: boolean
  showTerminal: boolean
  showOutput: boolean
  onToggleBrowser: () => void
  onToggleTerminal: () => void
  onToggleOutput: () => void
  browserUrl?: string
  onBrowserUrlChange?: (url: string) => void
  onBrowserClose?: () => void
  onClearResult?: () => void
  onOAuthCode?: (code: string) => void
}

const tabs = [
  { id: 'login', label: '⟐', title: 'Login' },
  { id: 'post', label: '✎', title: 'Post' },
  { id: 'schedule', label: '◎', title: 'Schedule' },
]

export function Layout({
  activeTab, onTabChange, children, result,
  showBrowser, showTerminal, showOutput,
  onToggleBrowser, onToggleTerminal, onToggleOutput,
  browserUrl, onBrowserUrlChange, onBrowserClose, onClearResult, onOAuthCode,
}: LayoutProps) {
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            style={styles.iconBtn(activeTab === tab.id)}
            onClick={() => onTabChange(tab.id)}
            title={tab.title}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={styles.iconBtn(showBrowser)} onClick={onToggleBrowser} title="Browser">🌐</button>
        <button style={styles.iconBtn(showTerminal)} onClick={onToggleTerminal} title="Terminal">⌨</button>
        <button style={styles.iconBtn(showOutput)} onClick={onToggleOutput} title="Output">⬌</button>
      </div>

      <div style={styles.mainRow}>
        <div style={styles.browserCol(showBrowser)}>
          {showBrowser && browserUrl && (
            <BrowserPanel url={browserUrl} visible={true} onUrlChange={onBrowserUrlChange} onClose={onBrowserClose || (() => {})} onOAuthCode={onOAuthCode} />
          )}
        </div>

        <div style={styles.centerCol}>
          <div style={styles.content}>
            {children}
            {result && <div style={styles.result}>{result}</div>}
          </div>
          {showOutput && (
            <OutputPanel result={result} visible={true} onClose={onClearResult || (() => {})} />
          )}
        </div>

        <div style={styles.terminalCol(showTerminal)}>
          <TerminalPanel />
        </div>
      </div>
    </div>
  )
}
