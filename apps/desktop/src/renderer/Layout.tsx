import React from 'react'

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1a1a1a',
  },
  sidebar: {
    width: 220,
    background: '#1a1a2e',
    color: '#fff',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  logo: {
    padding: '0 20px 24px',
    fontSize: 20,
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  navItem: (active: boolean) => ({
    padding: '12px 20px',
    cursor: 'pointer',
    background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
    borderLeft: active ? '3px solid #4a9eff' : '3px solid transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
    fontSize: 14,
    transition: 'all 0.2s',
  }),
  content: {
    flex: 1,
    padding: 32,
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
    lineHeight: 1.5,
  },
}

interface LayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  result: string
}

const tabs = [
  { id: 'login', label: 'Login', icon: '🔑' },
  { id: 'post', label: 'Post', icon: '📝' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
]

export function Layout({ activeTab, onTabChange, children, result }: LayoutProps) {
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
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>
      <div style={styles.content}>
        {children}
        {result && <div style={styles.result}>{result}</div>}
      </div>
    </div>
  )
}
