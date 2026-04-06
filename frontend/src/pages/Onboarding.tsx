import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

const questions = [
  { key: 'name', question: 'What is your name?', placeholder: 'e.g. Sam' },
  { key: 'address_as', question: 'How would you like to be addressed?', placeholder: 'e.g. sir, boss, by my name' },
  { key: 'use_case', question: 'What will you primarily use me for?', placeholder: 'e.g. coding, research, managing my schedule' },
]

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ name: '', address_as: '', use_case: '' })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const current = questions[step]

  const handleNext = async () => {
    if (!input.trim()) return
    const updated = { ...answers, [current.key]: input.trim() }
    setAnswers(updated)
    setInput('')

    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      setLoading(true)
      await axios.post(`${API}/onboarding/complete`, updated)
      setLoading(false)
      onComplete()
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', height: '100vh', padding: '2rem', gap: '2rem'
    }}>
      <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--cyan)', opacity: 0.6 }}>
        J.A.R.V.I.S. — INITIAL SETUP {step + 1}/{questions.length}
      </div>

      <div style={{
        border: '1px solid var(--border-dim)', padding: '2.5rem',
        maxWidth: '600px', width: '100%', background: 'var(--panel)',
        boxShadow: '0 0 30px var(--cyan-glow)'
      }}>
        <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', color: 'var(--cyan)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {current.question}
        </div>

        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleNext()}
          placeholder={current.placeholder}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: '1px solid var(--border-dim)', color: 'var(--text)',
            fontFamily: 'var(--font-mono)', fontSize: '1rem', padding: '0.75rem 0',
            outline: 'none', caretColor: 'var(--cyan)'
          }}
        />
      </div>

      <button
        onClick={handleNext}
        disabled={loading || !input.trim()}
        style={{
          fontFamily: 'var(--font-hud)', fontSize: '0.7rem', letterSpacing: '0.2em',
          background: 'transparent', border: '1px solid var(--cyan)', color: 'var(--cyan)',
          padding: '0.75rem 2rem', cursor: 'pointer', opacity: loading ? 0.4 : 1
        }}
      >
        {loading ? 'INITIALIZING...' : step < questions.length - 1 ? 'NEXT' : 'LAUNCH JARVIS'}
      </button>
    </div>
  )
}