import React, { useState } from 'react'
import { Layout } from './Layout'
import LoginView from './LoginView'
import PostView from './PostView'
import ScheduleView from './ScheduleView'

export default function App() {
  const [activeTab, setActiveTab] = useState('login')
  const [result, setResult] = useState('')
  const [browserUrl, setBrowserUrl] = useState('')
  const [showBrowser, setShowBrowser] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  const openBrowser = (url: string) => {
    setBrowserUrl(url)
    setShowBrowser(true)
  }
  const closeBrowser = () => { setBrowserUrl(''); setShowBrowser(false) }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      result={result}
      showBrowser={showBrowser}
      showTerminal={showTerminal}
      showOutput={showOutput}
      onToggleBrowser={() => setShowBrowser(v => !v)}
      onToggleTerminal={() => setShowTerminal(v => !v)}
      onToggleOutput={() => setShowOutput(v => !v)}
      browserUrl={browserUrl}
      onBrowserUrlChange={setBrowserUrl}
      onBrowserClose={closeBrowser}
      onClearResult={() => setResult('')}
    >
      {activeTab === 'login' && <LoginView onResult={setResult} onOpenBrowser={openBrowser} />}
      {activeTab === 'post' && <PostView onResult={setResult} />}
      {activeTab === 'schedule' && <ScheduleView onResult={setResult} />}
    </Layout>
  )
}
