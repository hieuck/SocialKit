import React, { useState } from 'react'
import { Layout } from './Layout'
import LoginView from './LoginView'
import PostView from './PostView'
import ScheduleView from './ScheduleView'

export default function App() {
  const [activeTab, setActiveTab] = useState('login')
  const [result, setResult] = useState('')
  const [browserUrl, setBrowserUrl] = useState('')
  const [platform, setPlatform] = useState('facebook')
  const [showBrowser, setShowBrowser] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  const openBrowser = (url: string, p: string) => {
    setBrowserUrl(url)
    setPlatform(p)
    setShowBrowser(true)
  }
  const closeBrowser = () => { setBrowserUrl(''); setShowBrowser(false) }

  const handleOAuthCode = async (code: string) => {
    try {
      const api = (window as any).socialkit
      if (api?.exchangeCode) {
        const msg = await api.exchangeCode(platform, code)
        setResult(msg)
        setShowBrowser(false)
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

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
      onOAuthCode={handleOAuthCode}
    >
      {activeTab === 'login' && <LoginView onResult={setResult} onOpenBrowser={(url, p) => openBrowser(url, p || 'facebook')} />}
      {activeTab === 'post' && <PostView onResult={setResult} />}
      {activeTab === 'schedule' && <ScheduleView onResult={setResult} />}
    </Layout>
  )
}
