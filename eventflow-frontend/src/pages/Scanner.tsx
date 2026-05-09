import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScan, useLiveDashboard, getVolunteerToken, clearVolunteerSession } from '@/hooks/useScanner'
import type { ScanResponse } from '@/types'

// Dynamically import html5-qrcode only on client
let Html5QrcodeScanner: any = null

type ScanResult = ScanResponse & { _ts?: number }

const RESULT_CONFIG = {
  success: {
    bg:    'linear-gradient(135deg,#15803d,#16a34a)',
    icon:  '✓',
    title: 'Entry Granted',
    sub:   (r: ScanResult) => r.attendee?.name || '',
  },
  already_scanned: {
    bg:    'linear-gradient(135deg,#b45309,#d97706)',
    icon:  '⚠',
    title: 'Already Used',
    sub:   (r: ScanResult) => `Scanned at ${r.scanned_at ? new Date(r.scanned_at).toLocaleTimeString('en-IN') : ''}`,
  },
  rejected: {
    bg:    'linear-gradient(135deg,#b91c1c,#dc2626)',
    icon:  '✗',
    title: 'Not Approved',
    sub:   (r: ScanResult) => r.attendee?.name || '',
  },
  invalid: {
    bg:    'linear-gradient(135deg,#1e1b4b,#312e81)',
    icon:  '✗',
    title: 'Invalid QR Code',
    sub:   () => 'This QR was not recognised',
  },
}

export default function Scanner() {
  const { eventId }    = useParams<{ eventId: string }>()
  const navigate       = useNavigate()
  const scan           = useScan()
  const { data: live } = useLiveDashboard(eventId!)

  const [result, setResult]     = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(true)
  const [ready, setReady]       = useState(false)
  const scannerRef              = useRef<any>(null)
  const timerRef                = useRef<ReturnType<typeof setTimeout>>()

  // Redirect if no token
  useEffect(() => {
    if (!getVolunteerToken()) navigate(`/scanner/login?event=${eventId}`)
  }, [])

  // Load html5-qrcode dynamically
  useEffect(() => {
    import('html5-qrcode').then(m => {
      Html5QrcodeScanner = m.Html5QrcodeScanner
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready || !scanning) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 },
      false
    )

    scanner.render(
      async (decodedText: string) => {
        setScanning(false)
        scanner.pause()

        let res: ScanResult
        try {
          res = await scan.mutateAsync(decodedText)
        } catch (err: any) {
          res = {
            result:  'invalid',
            message: err.response?.data?.message || 'Invalid QR code',
          }
        }

        res._ts = Date.now()
        setResult(res)

        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          setResult(null)
          setScanning(true)
        }, 3500)
      },
      () => {} // ignore decode errors
    )

    scannerRef.current = scanner
    return () => {
      clearTimeout(timerRef.current)
      scanner.clear().catch(() => {})
      scannerRef.current = null
    }
  }, [ready, scanning])

  const logout = () => {
    clearVolunteerSession()
    navigate('/scanner/login')
  }

  const cfg = result ? RESULT_CONFIG[result.result] : null
  const pct = live
    ? Math.round((live.stats.scanned_in / Math.max(live.stats.total_approved, 1)) * 100)
    : 0

  return (
    <div style={{ minHeight: '100vh', background: '#080714', fontFamily: 'DM Sans, sans-serif', color: '#f0eeff' }}>

      {/* Header */}
      <div style={{
        background: '#10102a', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Gate Scanner</div>
          <div style={{ fontSize: 12, color: '#5e5a80', marginTop: 1 }}>Point camera at attendee's QR code</div>
        </div>

        {/* Live counter */}
        {live && (
          <div style={{ textAlign: 'center', margin: '0 auto' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#818cf8', lineHeight: 1 }}>
              {live.stats.scanned_in}
            </div>
            <div style={{ fontSize: 11, color: '#5e5a80' }}>
              of {live.stats.total_approved} in
            </div>
            {/* Progress bar */}
            <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 10, marginTop: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#6366f1', borderRadius: 10, transition: 'width 0.4s' }} />
            </div>
          </div>
        )}

        <button onClick={logout} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#9893b8', borderRadius: 8, padding: '7px 14px', fontSize: 13,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
        }}>
          Logout
        </button>
      </div>

      {/* Scanner area */}
      <div style={{ position: 'relative', minHeight: 380 }}>
        {/* QR reader element */}
        <div id="qr-reader" style={{ width: '100%' }} />

        {!ready && (
          <div style={{ padding: 40, textAlign: 'center', color: '#5e5a80', fontSize: 14 }}>
            Loading camera…
          </div>
        )}

        {/* Result overlay */}
        {result && cfg && (
          <div style={{
            position: 'absolute', inset: 0,
            background: cfg.bg,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeInScale 0.25s ease',
          }}>
            <style>{`
              @keyframes fadeInScale {
                from { opacity: 0; transform: scale(0.96); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>

            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, marginBottom: 12 }}>{cfg.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{cfg.title}</div>
            <div style={{ fontSize: 16, opacity: 0.85, marginBottom: 4 }}>{cfg.sub(result)}</div>
            {result.attendee?.email && (
              <div style={{ fontSize: 13, opacity: 0.6 }}>{result.attendee.email}</div>
            )}
            <div style={{ fontSize: 12, opacity: 0.45, marginTop: 20 }}>
              Scanner resumes in 3 seconds…
            </div>
          </div>
        )}
      </div>

      {/* Recent entries */}
      {live?.recent_entries?.length > 0 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3d3a5c', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Recent entries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {live.recent_entries.slice(0, 6).map((entry: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8, padding: '9px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, background: 'rgba(99,102,241,0.2)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#818cf8', flexShrink: 0,
                  }}>
                    {entry.registrations?.attendee_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: 14, color: '#c4bfe0' }}>
                    {entry.registrations?.attendee_name || 'Unknown'}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#3d3a5c' }}>
                  {new Date(entry.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
