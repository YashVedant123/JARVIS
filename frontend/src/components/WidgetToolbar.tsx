interface MinimizedWidget {
  id: string
  title: string
}

interface Props {
  widgets: MinimizedWidget[]
  onRestore: (id: string) => void
}

export default function WidgetToolbar({ widgets, onRestore }: Props) {
  if (widgets.length === 0) return null
  return (
    <div style={{
      position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, display: 'flex', gap: '0.5rem'
    }}>
      {widgets.map(w => (
        <button key={w.id} onClick={() => onRestore(w.id)} style={{
          fontFamily: 'var(--font-hud)', fontSize: '0.55rem', letterSpacing: '0.2em',
          background: 'var(--panel-header)', border: '1px solid var(--border)',
          color: 'var(--cyan)', padding: '0.4rem 1rem', cursor: 'pointer',
          boxShadow: '0 0 10px var(--cyan-glow)'
        }}>
          {w.title}
        </button>
      ))}
    </div>
  )
}