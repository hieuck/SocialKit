import React, { useState } from 'react'
import { Layout } from './Layout'
import LoginView from './LoginView'
import PostView from './PostView'
import ScheduleView from './ScheduleView'

export default function App() {
  const [activeTab, setActiveTab] = useState('login')
  const [result, setResult] = useState('')

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} result={result}>
      {activeTab === 'login' && <LoginView onResult={setResult} />}
      {activeTab === 'post' && <PostView onResult={setResult} />}
      {activeTab === 'schedule' && <ScheduleView onResult={setResult} />}
    </Layout>
  )
}
