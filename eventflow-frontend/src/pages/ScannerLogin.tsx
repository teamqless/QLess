import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVolunteerLogin } from '@/hooks/useScanner'

export default function ScannerLogin() {
  const navigate        = useNavigate()
  const [params]        = useSearchParams()
  const presetEventId   = params.get('event') || ''
  const login           = useVolunteerLogin()

  const [code, setCode]   = useState('')
  const [eid, setEid]     = useState(presetEventId)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter your access code')
      return
    }

    try {
      const result = await login.mutateAsync({
        access_code: code.trim(),
        event_id:    eid.trim() || '',  // empty string = club-wide
      })

      // If no event_id was provided and the server returned an event, use it
      // Otherwise navigate to a generic scanner
      const targetEventId = eid.trim() || result?.event?.id || ''
      if (targetEventId) {
        navigate(`/scanner/${targetEventId}`)
      } else {
        navigate('/scanner/ready')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid access code. Please try again.')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a3a',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '13px 16px',
    color: '#f0eeff',
    fontSize: 15,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#6b6890',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  }

  return (
    <div style={{
      minHeight: '100dvh',  // mobile viewport fix
      background: '#080714',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      padding: '20px 16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: '#10102a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '36px 28px',
        width: '100%',
        maxWidth: 400,
        boxSizing: 'border-box',
      }}>

        {/* Icon + Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
          }}>📷</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0eeff', marginBottom: 8 }}>
            Gate Scanner
          </h1>
          <p style={{ fontSize: 13, color: '#5e5a80', lineHeight: 1.5 }}>
            Enter your access code to start scanning
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.12)',
            border: '1px solid rgba(220,38,38,0.35)',
            borderRadius: 10, padding: '11px 14px',
            fontSize: 13, color: '#f87171',
            marginBottom: 20, lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Access Code — always shown, most important field */}
          <div>
            <label style={labelStyle}>Access Code *</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              required
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="e.g. TECH-V1"
              style={{
                ...inputStyle,
                textAlign: 'center',
                fontSize: 22,
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.2em',
                fontWeight: 700,
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
          </div>

          {/* Event ID — optional, shown only if not preset in URL */}
          {!presetEventId && (
            <div>
              <label style={labelStyle}>
                Event ID
                <span style={{ color: '#3d3a5c', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                  (optional — leave blank if not sure)
                </span>
              </label>
              <input
                type="text"
                value={eid}
                onChange={e => setEid(e.target.value.trim())}
                placeholder="Paste event ID here if given"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              <p style={{ fontSize: 11, color: '#3d3a5c', marginTop: 6 }}>
                The event admin will share this with you. You can leave it blank for club-wide access.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending || !code.trim()}
            style={{
              padding: '15px',
              fontSize: 16,
              fontWeight: 700,
              background: login.isPending || !code.trim()
                ? 'rgba(99,102,241,0.4)'
                : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: login.isPending || !code.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'opacity 0.15s',
              marginTop: 4,
            }}
          >
            {login.isPending ? 'Verifying…' : 'Start Scanning'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#2a2848', marginTop: 24 }}>
          Contact your event organizer if you don't have an access code
        </p>
      </div>
    </div>
  )
}
