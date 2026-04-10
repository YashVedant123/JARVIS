import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Widget from '../components/Widget'

const API = 'https://jarvis-poko.onrender.com'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Profile {
  name: string
  address_as: string
}

interface Props {
  onMinimize?: (id: string, title: string) => void
  addLog?: (type: 'info' | 'thinking' | 'success' | 'error' | 'system', message: string) => void
  userLocation?: string
}

export default function Chat({ onMinimize, addLog, userLocation }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    axios.get(`${API}/onboarding/profile`).then(res => setProfile(res.data))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    addLog?.('thinking', `Processing: "${input.trim().slice(0, 40)}..."`)
    const res = await axios.post(`${API}/chat`, {
      messages: updated,
      location: userLocation || null
    })
    setMessages([...updated, { role: 'assistant', content: res.data.response }])
    if (res.data.searched) addLog?.('info', 'Web search performed')
    addLog?.('success', 'Response received')
    setLoading(false)
  }

  return (
    <Widget
      id="chat"
      title="JARVIS INTERFACE"
      fileNumber="J-001"
      defaultPos={{ x: Math.max(20, window.innerWidth / 2 - 240), y: 60 }}
      defaultSize={{ w: 480, h: 560 }}
      onMinimize={onMinimize}
      statusColor="var(--green)"
    >
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-hud)', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'var(--text-dim)', marginTop: '35%' }}>
            SYSTEMS ONLINE — AWAITING INPUT
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ fontSize: '0.55rem', fontFamily: 'var(--font-hud)', letterSpacing: '0.2em', color: m.role === 'user' ? 'var(--text-dim)' : 'var(--cyan)', marginBottom: '0.3rem' }}>
              {m.role === 'user' ? profile?.name.toUpperCase() ?? 'YOU' : '● JARVIS'}
            </div>
            <div style={{
              maxWidth: '80%', padding: '0.75rem 1rem',
              background: m.role === 'user' ? 'rgba(0,229,255,0.04)' : 'rgba(0,10,20,0.8)',
              border: `1px solid ${m.role === 'user' ? 'var(--border-mid)' : 'var(--border)'}`,
              boxShadow: m.role === 'assistant' ? '0 0 15px var(--cyan-glow), inset 0 0 20px rgba(0,229,255,0.03)' : 'none',
              fontFamily: m.role === 'assistant' ? 'var(--font-body)' : 'var(--font-mono)',
              fontSize: m.role === 'assistant' ? '1rem' : '0.85rem',
              lineHeight: 1.7,
              color: 'var(--text)',
              borderLeft: m.role === 'assistant' ? '3px solid var(--cyan)' : 'none',
              borderRight: m.role === 'user' ? '3px solid var(--border-mid)' : 'none',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '0.55rem', fontFamily: 'var(--font-hud)', letterSpacing: '0.2em', color: 'var(--cyan)', marginBottom: '0.3rem' }}>● JARVIS</div>
            <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border)', borderLeft: '3px solid var(--cyan)', background: 'rgba(0,10,20,0.8)', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              PROCESSING<span style={{ animation: 'flicker 1s infinite' }}>...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--border-dim), transparent)' }} />

      <div style={{ padding: '0.8rem 1.2rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(0,10,20,0.5)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--cyan)' }}>›</span>
        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="ENTER COMMAND..."
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text)', fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem', outline: 'none', caretColor: 'var(--cyan)',
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          fontFamily: 'var(--font-hud)', fontSize: '0.55rem', letterSpacing: '0.2em',
          background: 'transparent', border: '1px solid var(--cyan)', color: 'var(--cyan)',
          padding: '0.5rem 1.2rem', cursor: 'pointer', opacity: loading ? 0.3 : 1,
          transition: 'all 0.2s'
        }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'var(--cyan-glow)'; e.currentTarget.style.boxShadow = '0 0 15px var(--cyan-glow-strong)' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
        >
          SEND
        </button>
      </div>
    </Widget>
  )
}