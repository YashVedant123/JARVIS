import { useState, useEffect } from 'react'

export default function TopBar() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')
  const hours = pad(time.getHours() % 12 || 12)
  const minutes = pad(time.getMinutes())
  const seconds = pad(time.getSeconds())
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM'
  const date = time.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '36px', zIndex: 50,
      background: 'rgba(2, 10, 20, 0.95)',
      borderBottom: '1px solid var(--border-dim)',
      display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '0',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderRight: '1px solid var(--border-dim)', paddingRight: '1.2rem', marginRight: '1.2rem' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
        <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--cyan)', fontWeight: 700 }}>J.A.R.V.I.S.</span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
        {['NEURAL NET ACTIVE', 'MEMORY STABLE', 'ALL SYSTEMS NOMINAL'].map((s, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>{s}</span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', borderLeft: '1px solid var(--border-dim)', paddingLeft: '1.2rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>{date}</span>
        <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: 'var(--cyan)', letterSpacing: '0.2em' }}>
          {hours}:{minutes}<span style={{ opacity: 0.5 }}>:{seconds}</span>
          <span style={{ fontSize: '0.55rem', opacity: 0.6, marginLeft: '0.3rem' }}>{ampm}</span>
        </span>
      </div>
    </div>
  )
}