import React from 'react'
import { createRoot } from 'react-dom/client'
import AnalyzerTool from './AnalyzerTool'

function Dashboard() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>SocialKit Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Analyze your social media content quality and engagement.
      </p>
      <AnalyzerTool />
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<Dashboard />)
