import { useEffect, useState } from 'react'
import Widget from './Widget'

interface Props {
  isOwner: boolean
  onMinimize?: (id: string, title: string) => void
  addLog: (type: 'info' | 'thinking' | 'success' | 'error' | 'system', message: string) => void
  onLocationFound?: (location: string) => void
}

interface Weather {
  temp: number
  feels_like: number
  description: string
  humidity: number
  wind: number
  city: string
}

export default function WeatherWidget({ isOwner, onMinimize, addLog, onLocationFound }: Props) {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [consent, setConsent] = useState<boolean | null>(isOwner ? true : null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (consent) fetchWeather()
  }, [consent])

  const fetchWeather = () => {
    addLog('thinking', 'Acquiring GPS coordinates...')
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      addLog('info', `Location acquired: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&temperature_unit=celsius`
        )
        const data = await res.json()
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const geoData = await geoRes.json()
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Unknown'
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feels_like: Math.round(data.current.apparent_temperature),
          description: codeToDesc(data.current.weather_code),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          city
        })
        onLocationFound?.(`${city}, coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        addLog('success', `Weather data loaded for ${city}`)
      } catch {
        setError('Failed to fetch weather')
        addLog('error', 'Weather fetch failed')
      }
    }, () => {
      setError('Location access denied')
      addLog('error', 'GPS access denied')
    })
  }

  const codeToDesc = (code: number) => {
    if (code === 0) return 'CLEAR SKY'
    if (code <= 3) return 'PARTLY CLOUDY'
    if (code <= 48) return 'FOGGY'
    if (code <= 67) return 'RAIN'
    if (code <= 77) return 'SNOW'
    if (code <= 82) return 'SHOWERS'
    return 'THUNDERSTORM'
  }

  return (
    <Widget
      id="weather"
      title="ATMOSPHERIC DATA"
      fileNumber="W-001"
      defaultPos={{ x: 40, y: 520 }}
      defaultSize={{ w: 380, h: 220 }}
      onMinimize={onMinimize}
      statusColor={weather ? 'var(--green)' : 'var(--amber)'}
    >
      <div style={{ flex: 1, padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {consent === null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              JARVIS requires location access to display weather data. Do you consent?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setConsent(true)} style={{ fontFamily: 'var(--font-hud)', fontSize: '0.55rem', letterSpacing: '0.2em', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)', padding: '0.5rem 1rem', cursor: 'pointer' }}>ALLOW</button>
              <button onClick={() => setConsent(false)} style={{ fontFamily: 'var(--font-hud)', fontSize: '0.55rem', letterSpacing: '0.2em', background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', padding: '0.5rem 1rem', cursor: 'pointer' }}>DENY</button>
            </div>
          </div>
        ) : consent === false ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center' }}>LOCATION ACCESS DENIED</div>
        ) : error ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--red)', textAlign: 'center' }}>{error}</div>
        ) : !weather ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--cyan)', textAlign: 'center', animation: 'flicker 1s infinite' }}>ACQUIRING DATA...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-hud)', fontSize: '2.5rem', color: 'var(--cyan)', lineHeight: 1 }}>{weather.temp}°C</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{weather.description}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-mid)', textAlign: 'right' }}>{weather.city.toUpperCase()}</div>
            </div>
            <div style={{ height: '1px', background: 'var(--border-dim)' }} />
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { label: 'FEELS LIKE', value: `${weather.feels_like}°C` },
                { label: 'HUMIDITY', value: `${weather.humidity}%` },
                { label: 'WIND', value: `${weather.wind} km/h` },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>{item.label}</div>
                  <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: 'var(--text)', marginTop: '0.2rem' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Widget>
  )
}