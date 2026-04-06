import { useEffect, useRef, useState } from 'react'
import Widget from './Widget'

export interface LogEntry {
  type: 'info' | 'thinking' | 'success' | 'error' | 'system'
  message: string
  timestamp: Date
}

interface Props {
  logs: LogEntry[]
  onMinimize?: (id: string, title: string) => void
}

export default function SystemLog({ logs, onMinimize }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const color = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'var(--red)'
      case 'success': return 'var(--green)'
      case 'thinking': return 'var(--amber)'
      case 'system': return 'var(--cyan)'
      default: return 'var(--text-mid)'
    }
  }

  const prefix = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'ERROR'
      case 'success': return 'OK'
      case 'thinking': return 'THINK'
      case 'system': return 'SYS'
      default: return 'INFO'
    }
  }

  const pad = (n: number) => n.toString().padStart(2, '0')
  const fmt = (d: Date) => `${pad(d.getHours() % 12 || 12)}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

  return (
    <Widget
      id="syslog"
      title="SYSTEM LOG"
      fileNumber="S-001"
      defaultPos={{ x: 40, y: 60 }}
      defaultSize={{ w: 380, h: 420 }}
      onMinimize={onMinimize}
      statusColor="var(--green)"
    >
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)', flexShrink: 0, marginTop: '0.1rem' }}>
              {fmt(log.timestamp)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: color(log.type), flexShrink: 0, width: 42, marginTop: '0.1rem' }}>
              [{prefix(log.type)}]
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: color(log.type), lineHeight: 1.5 }}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </Widget>
  )
}