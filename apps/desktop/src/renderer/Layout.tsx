import React from 'react'
import BrowserPanel from './BrowserPanel'

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1a1a1a',
  },
  sidebar: {
    width: 180,
    background: '#1a1a2e',
    color: '#fff',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  logo: {
    padding: '0 16px 24px',
    fontSize: 18,
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  navItem: (active: boolean) => ({
    padding: '10px 16px',
    cursor: 'pointer',
    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderLeft: active ? '3px solid #4a9eff' : '3px solid transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
    fontSize: 13,
  }),
  browserPanel: {
    width: '50%' as const,
    minWidth: 400,
  },
  content: {
    flex: 1,
    padding: 24,
    overflow: 'auto',
    background: '#f5f6fa',
  },
  result: {
    marginTop: 20,
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'monospace',
    fontSize: 13,
  },
}

interface LayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  result: string
  browserUrl?: string
  onBrowserUrlChange?: (url: string) => void
  onBrowserClose?: () => void
}

const tabs = [
  { id: 'login', label: 'Login' },
  { id: 'post', label: 'Post' },
  { id: 'schedule', label: 'Schedule' },
]

export function Layout({ activeTab, onTabChange, children, result, browserUrl, onBrowserUrlChange, onBrowserClose }: LayoutProps) {
  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>SocialKit</div>
        {tabs.map(tab => (
          <div
            key={tab.id}
            style={styles.navItem(activeTab === tab.id)}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      {browserUrl && (
        <div style={styles.browserPanel}>
          <BrowserPanel
            url={browserUrl}
            onUrlChange={onBrowserUrlChange}
            visible={true}
            onClose={onBrowserClose || (() => {})}
          />
        </div>
      )}
      <div style={styles.content}>
        {children}
        {result && <div style={styles.result}>{result}</div>}
      </div>
    </div>
  )
}
