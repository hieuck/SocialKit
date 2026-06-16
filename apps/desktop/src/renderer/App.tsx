import React, { useState } from 'react'
import LoginView from './LoginView'
import PostView from './PostView'
import ScheduleView from './ScheduleView'

type Tab = 'login' | 'post' | 'schedule'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const [result, setResult] = useState('')

  const tabs: Tab[] = ['login', 'post', 'schedule']

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>SocialKit</h1>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              background: activeTab === tab ? '#0066cc' : '#eee',
              color: activeTab === tab ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div style={{ marginBottom: 16 }}>
        {activeTab === 'login' && <LoginView onResult={setResult} />}
        {activeTab === 'post' && <PostView onResult={setResult} />}
        {activeTab === 'schedule' && <ScheduleView onResult={setResult} />}
      </div>
      {result && (
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, whiteSpace: 'pre-wrap' }}>
          {result}
        </pre>
      )}
    </div>
  )
}
