import { useState, useRef, useCallback, type ReactNode } from 'react'

interface WidgetProps {
  id: string
  title: string
  fileNumber?: string
  children: ReactNode
  defaultPos?: { x: number; y: number }
  defaultSize?: { w: number; h: number }
  onMinimize?: (id: string, title: string) => void
  statusColor?: string
}

export default function Widget({
  id, title, fileNumber, children,
  defaultPos = { x: 100, y: 100 },
  defaultSize = { w: 600, h: 500 },
  onMinimize,
  statusColor = 'var(--green)'
}: WidgetProps) {
  const [pos, setPos] = useState(defaultPos)
  const [size] = useState(defaultSize)
  const [minimized, setMinimized] = useState(false)
  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, wx: 0, wy: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStart.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y }
    
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      setPos({
        x: dragStart.current.wx + ev.clientX - dragStart.current.mx,
        y: dragStart.current.wy + ev.clientY - dragStart.current.my,
      })
    }
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  const handleMinimize = () => {
    setMinimized(true)
    onMinimize?.(id, title)
  }

  if (minimized) return null

  return (
    <div style={{
      position: 'fixed', left: pos.x, top: pos.y, zIndex: 10,
      width: size.w, display: 'flex', flexDirection: 'column',
      filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.15))'
    }}>
      {/* SHIELD-style header */}
      <div
        onMouseDown={onMouseDown}
        style={{
          background: 'var(--panel-header)',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          padding: '0 0 0 0',
          cursor: 'grab',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'stretch',
          position: 'relative'
        }}
      >
        {/* Color tab on left */}
        <div style={{ width: 4, background: 'var(--cyan)', flexShrink: 0 }} />
        
        {/* Status dot + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1rem', flex: 1 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor, boxShadow: `0 0 8px ${statusColor}`, animation: 'pulse-border 2s infinite' }} />
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--cyan)', fontWeight: 700 }}>
            {title}
          </span>
          {fileNumber && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>
              #{fileNumber}
            </span>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', borderLeft: '1px solid var(--border-dim)' }}>
          <button onClick={handleMinimize} style={{
            background: 'transparent', border: 'none', color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '0 0.9rem',
            cursor: 'pointer', height: '100%', transition: 'color 0.2s'
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--amber)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
          >−</button>
        </div>
      </div>

      {/* Decorative sub-header line */}
      <div style={{
        background: 'var(--panel-header)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
        padding: '0.25rem 1.2rem', display: 'flex', gap: '1.5rem', alignItems: 'center'
      }}>
        {['ACCESS GRANTED', 'ENCRYPTED', 'LIVE'].map((tag, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>{tag}</span>
        ))}
        <div style={{ marginLeft: 'auto', width: 40, height: 2, background: 'linear-gradient(to right, var(--cyan), transparent)' }} />
      </div>

      {/* Body */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderTop: 'none',
        height: size.h,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)'
      }}>
        {children}
      </div>

      {/* Bottom corner accent */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 20, height: 4, background: 'var(--cyan)', opacity: 0.6 }} />
        <div style={{ width: 20, height: 4, background: 'var(--cyan)', opacity: 0.6 }} />
      </div>
    </div>
  )
}