import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import Widget from './Widget'
import L from 'leaflet'

interface Props {
  isOwner: boolean
  onMinimize?: (id: string, title: string) => void
  addLog: (type: 'info' | 'thinking' | 'success' | 'error' | 'system', message: string) => void
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 13) }, [lat, lng])
  return null
}

const crosshairIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:40px;height:40px;">
      <div style="position:absolute;top:50%;left:0;right:0;height:1px;background:#00e5ff;box-shadow:0 0 6px #00e5ff;"></div>
      <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:#00e5ff;box-shadow:0 0 6px #00e5ff;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#00e5ff;box-shadow:0 0 10px #00e5ff;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;border:1px solid rgba(0,229,255,0.4);"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

export default function MapWidget({ isOwner, onMinimize, addLog }: Props) {
  const [consent, setConsent] = useState<boolean | null>(isOwner ? true : null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [city, setCity] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (consent) fetchLocation()
  }, [consent])

  const fetchLocation = () => {
    addLog('thinking', 'Acquiring map coordinates...')
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      setCoords({ lat: latitude, lng: longitude })
      addLog('success', 'Map location acquired')
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const data = await res.json()
        setCity(data.address?.city || data.address?.town || data.address?.village || 'Unknown')
      } catch {
        setCity('Unknown')
      }
    }, () => {
      setError('Location access denied')
      addLog('error', 'Map GPS access denied')
    })
  }

  if (expanded) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          {coords ? (
            <MapContainer center={[coords.lat, coords.lng]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="" />
              <RecenterMap lat={coords.lat} lng={coords.lng} />
              <Marker position={[coords.lat, coords.lng]} icon={crosshairIcon}>
                <Popup>{city || 'Current Location'}</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--cyan)' }}>
              ACQUIRING COORDINATES...
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(false)}
          style={{
            position: 'fixed', top: 48, right: 16, zIndex: 9999,
            fontFamily: 'var(--font-hud)', fontSize: '0.6rem', letterSpacing: '0.2em',
            background: 'rgba(2,10,20,0.95)', border: '1px solid var(--cyan)', color: 'var(--cyan)',
            padding: '0.5rem 1.2rem', cursor: 'pointer',
            boxShadow: '0 0 15px var(--cyan-glow)'
          }}
        >
          COLLAPSE
        </button>
      </div>
    )
  }

  return (
    <Widget
      id="map"
      title="GEOLOCATION"
      fileNumber="G-001"
      defaultPos={{ x: 440, y: 520 }}
      defaultSize={{ w: 420, h: 320 }}
      onMinimize={onMinimize}
      statusColor={coords ? 'var(--green)' : 'var(--amber)'}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
        <div style={{ padding: '0.4rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-dim)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-dim)' }}>
            {city ? city.toUpperCase() : 'ACQUIRING...'}
          </span>
          <button onClick={() => setExpanded(true)} style={{
            fontFamily: 'var(--font-hud)', fontSize: '0.5rem', letterSpacing: '0.15em',
            background: 'transparent', border: '1px solid var(--border-dim)', color: 'var(--cyan)',
            padding: '0.3rem 0.8rem', cursor: 'pointer'
          }}>
            EXPAND
          </button>
        </div>

        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          {consent === null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                JARVIS requires location access for geolocation. Do you consent?
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setConsent(true)} style={{ fontFamily: 'var(--font-hud)', fontSize: '0.55rem', letterSpacing: '0.2em', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)', padding: '0.5rem 1rem', cursor: 'pointer' }}>ALLOW</button>
                <button onClick={() => setConsent(false)} style={{ fontFamily: 'var(--font-hud)', fontSize: '0.55rem', letterSpacing: '0.2em', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.5rem 1rem', cursor: 'pointer' }}>DENY</button>
              </div>
            </div>
          ) : consent === false ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)' }}>LOCATION ACCESS DENIED</div>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--red)' }}>{error}</div>
          ) : !coords ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--cyan)' }}>ACQUIRING COORDINATES...</div>
          ) : (
            <MapContainer center={[coords.lat, coords.lng]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="" />
              <RecenterMap lat={coords.lat} lng={coords.lng} />
              <Marker position={[coords.lat, coords.lng]} icon={crosshairIcon}>
                <Popup>{city || 'Current Location'}</Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </div>
    </Widget>
  )
}