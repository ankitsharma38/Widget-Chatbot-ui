import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import CallPage from './pages/CallPage'
import TextPage from './pages/TextPage'
import EmailPage from './pages/EmailPage'
import SettingsPage from './pages/SettingsPage'
import BottomNav from './components/navigation/BottomNav'

import { getWidgetConfig } from './hooks/useWidgetConfig'

// detect if running inside the widget iframe
const isEmbedded = window.self !== window.top

// check if current URL path is /setting
const isSettingRoute = window.location.pathname === '/setting'

function App() {
  const cfg = getWidgetConfig()
  const [activePage, setActivePage] = useState('home')

  // listen for postMessage from widget.js when embedded
  useEffect(() => {
    if (!isEmbedded) return
    const handler = (e) => {
      if (e.data && e.data.type === 'navigate') {
        setActivePage(e.data.page)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // ── /setting route → render SettingsPage standalone, nothing else ──
  if (isSettingRoute) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <SettingsPage />
      </div>
    )
  }

  // ── Normal widget / embedded app ──
  const renderPage = () => {
    if (activePage === 'chat')  return <ChatPage />
    if (activePage === 'call')  return <CallPage />
    if (activePage === 'text')  return <TextPage />
    if (activePage === 'email') return <EmailPage />
    return <HomePage />
  }

  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden bg-white">
      {/* Top brand bar — hidden when inside widget iframe */}
      {!isEmbedded && (
        <div 
          style={{ background: cfg.colorPrimary, color: cfg.colorText }}
          className="shrink-0 px-4 py-3"
        >
          <span className="font-semibold text-sm">{cfg.title}</span>
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderPage()}
      </div>

      {/* Bottom nav — only shown in standalone mode, not inside widget iframe */}
      {!isEmbedded && <BottomNav activePage={activePage} onChange={setActivePage} />}
    </div>
  )
}

export default App
