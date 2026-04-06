export default function Background() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>

      {/* Subtle grid lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#00e5ff" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* JARVIS watermark */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-hud)', fontSize: 'clamp(80px, 18vw, 220px)',
        fontWeight: 900, letterSpacing: '0.15em',
        color: 'transparent',
        WebkitTextStroke: '1px rgba(0, 229, 255, 0.06)',
        userSelect: 'none', whiteSpace: 'nowrap',
        animation: 'flicker 8s infinite'
      }}>
        JARVIS
      </div>

      {/* Corner brackets */}
      {[
        { top: 16, left: 16, rotate: '0deg' },
        { top: 16, right: 16, rotate: '90deg' },
        { bottom: 16, right: 16, rotate: '180deg' },
        { bottom: 16, left: 16, rotate: '270deg' },
      ].map((pos, i) => (
        <svg key={i} width="40" height="40" style={{ position: 'absolute', ...pos, opacity: 0.4 }}>
          <path d="M 0 20 L 0 0 L 20 0" fill="none" stroke="#00e5ff" strokeWidth="1.5"
            style={{ transform: `rotate(${pos.rotate})`, transformOrigin: '20px 20px' }} />
        </svg>
      ))}

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(to bottom, transparent, rgba(0,229,255,0.08), transparent)',
        animation: 'scanline 6s linear infinite'
      }} />

      {/* Bottom status bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '28px',
        borderTop: '1px solid var(--border-dim)',
        background: 'rgba(2, 10, 20, 0.8)',
        display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '2rem'
      }}>
        {['SYSTEMS ONLINE', 'NEURAL NET ACTIVE', 'MEMORY CORE STABLE'].map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
          STARK INDUSTRIES — JARVIS v3.0
        </div>
      </div>
    </div>
  )
}