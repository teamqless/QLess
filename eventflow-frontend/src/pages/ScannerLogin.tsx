import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVolunteerLogin } from '@/hooks/useScanner'

export default function ScannerLogin() {
  const navigate        = useNavigate()
  const [params]        = useSearchParams()
  const eventId         = params.get('event') || ''
  const login           = useVolunteerLogin()
  const [code, setCode] = useState('')
  const [eid, setEid]   = useState(eventId)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ access_code: code, event_id: eid })
      navigate(`/scanner/${eid}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid access code or event ID')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080714',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif', padding: 20,
    }}>
      <div style={{
        background: '#10102a', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 380,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            borderRadius: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', fontSize: 26,
          }}>📷</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f0eeff', marginBottom: 6 }}>Volunteer Scanner</h1>
          <p style={{ fontSize: 13, color: '#5e5a80' }}>Enter your access code to start scanning QR codes at the gate</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 20,
          }}>{error}</div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!eventId && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6890', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Event ID
              </label>
              <input
                type="text"
                value={eid}
                onChange={e => setEid(e.target.value)}
                required
                placeholder="Paste the event ID"
                style={{
                  width: '100%', background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '11px 14px', color: '#f0eeff', fontSize: 13,
                  fontFamily: 'DM Mono, monospace', outline: 'none',
                }}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6890', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Access Code
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              required
              placeholder="e.g. TECH-V1"
              autoFocus
              style={{
                width: '100%', background: '#1a1a3a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '11px 14px', color: '#f0eeff', fontSize: 16,
                fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase',
                outline: 'none', textAlign: 'center',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={login.isPending}
            style={{
              padding: '13px', fontSize: 15, fontWeight: 700,
              background: login.isPending ? '#4338ca' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer',
              marginTop: 4, boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}
          >
            {login.isPending ? 'Verifying…' : 'Start Scanning'}
          </button>
        </form>
      </div>
    </div>
  )
}
