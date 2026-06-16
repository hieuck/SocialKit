import React, { useState } from 'react'
import { Layout } from './Layout'
import LoginView from './LoginView'
import PostView from './PostView'
import ScheduleView from './ScheduleView'

export default function App() {
  const [activeTab, setActiveTab] = useState('login')
  const [result, setResult] = useState('')
  const [browserUrl, setBrowserUrl] = useState('')

  const openBrowser = (url: string) => setBrowserUrl(url)
  const closeBrowser = () => setBrowserUrl('')

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      result={result}
      browserUrl={browserUrl}
      onBrowserUrlChange={setBrowserUrl}
      onBrowserClose={closeBrowser}
    >
      {activeTab === 'login' && <LoginView onResult={setResult} onOpenBrowser={openBrowser} />}
      {activeTab === 'post' && <PostView onResult={setResult} />}
      {activeTab === 'schedule' && <ScheduleView onResult={setResult} />}
    </Layout>
  )
}
