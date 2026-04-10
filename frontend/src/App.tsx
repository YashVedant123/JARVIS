import { useEffect, useState } from 'react'
import axios from 'axios'
import Background from './components/Background'
import TopBar from './components/TopBar'
import WidgetToolbar from './components/WidgetToolbar'
import Onboarding from './pages/Onboarding'
import Chat from './pages/Chat'
import SystemLog from './components/SystemLog'
import WeatherWidget from './components/WeatherWidget'
import { type LogEntry } from './components/SystemLog'
import MapWidget from './components/MapWidget'

const API = 'https://jarvis-poko.onrender.com'

interface MinimizedWidget {
  id: string
  title: string
}

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null)
  const [minimized, setMinimized] = useState<MinimizedWidget[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([
    { type: 'system', message: 'JARVIS INITIALIZING...', timestamp: new Date() },
  ])
  const [isOwner, setIsOwner] = useState(false)
  const [userLocation, setUserLocation] = useState<string>('')

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }])
  }

  useEffect(() => {
    addLog('thinking', 'Checking onboarding status...')
    axios.get(`${API}/onboarding/status`).then(res => {
      setOnboarded(res.data.onboarded)
      if (res.data.onboarded) {
        addLog('success', 'Profile loaded successfully')
        axios.get(`${API}/onboarding/profile`).then(p => {
          if (p.data.name === 'Yash') setIsOwner(true)
        })
      } else {
        addLog('info', 'New user detected — starting onboarding')
      }
    }).catch(() => {
      addLog('error', 'Failed to connect to backend')
    })
  }, [])

  const handleMinimize = (id: string, title: string) => {
    setMinimized(prev => [...prev.filter(w => w.id !== id), { id, title }])
    addLog('info', `Widget minimized: ${title}`)
  }

  const handleRestore = (id: string) => {
    setMinimized(prev => prev.filter(w => w.id !== id))
  }

  const isMinimized = (id: string) => minimized.some(w => w.id === id)

  if (onboarded === null) return (
    <>
      <Background />
      <TopBar />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-hud)', color: 'var(--cyan)', letterSpacing: '0.3em', fontSize: '0.8rem', animation: 'flicker 3s infinite' }}>
        INITIALIZING SYSTEMS...
      </div>
    </>
  )

  return (
    <>
      <Background />
      <TopBar />
      <WidgetToolbar widgets={minimized} onRestore={handleRestore} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {!onboarded ? (
          <Onboarding onComplete={() => { window.location.href = '/' }} />
        ) : (
          <>
            {!isMinimized('chat') && <Chat onMinimize={handleMinimize} addLog={addLog} userLocation={userLocation} />}
            {!isMinimized('syslog') && <SystemLog logs={logs} onMinimize={handleMinimize} />}
            {!isMinimized('weather') && <WeatherWidget isOwner={isOwner} onMinimize={handleMinimize} addLog={addLog} onLocationFound={setUserLocation} />}
            {!isMinimized('map') && <MapWidget isOwner={isOwner} onMinimize={handleMinimize} addLog={addLog} />}
          </>
        )}
      </div>
    </>
  )
}