import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScan, useLiveDashboard, getVolunteerToken, clearVolunteerSession } from '@/hooks/useScanner'
import { useEventSocket } from '@/hooks/useSocket'
import type { ScanResponse } from '@/types'

type ScanResult = ScanResponse & { _ts?: number }

const RESULT_CONFIG = {
  success: {
    bg:    '#14532d',
    accent:'#22c55e',
    icon:  '✓',
    title: 'Entry Granted',
  },
  already_scanned: {
    bg:    '#78350f',
    accent:'#f59e0b',
    icon:  '⚠',
    title: 'Already Used',
  },
  rejected: {
    bg:    '#7f1d1d',
    accent:'#ef4444',
    icon:  '✗',
    title: 'Not Approved',
  },
  invalid: {
    bg:    '#1e1b4b',
    accent:'#818cf8',
    icon:  '?',
    title: 'Invalid QR',
  },
}

export default function Scanner() {
  const { eventId }    = useParams<{ eventId: string }>()
  const navigate       = useNavigate()
  const scan           = useScan()

  // Only fetch live data if we have an eventId
  const { data: initialLive } = useLiveDashboard(eventId || '')

  const [result, setResult]       = useState<ScanResult | null>(null)
  const [scanning, setScanning]   = useState(true)
  const [ready, setReady]         = useState(false)
  const [liveStats, setLiveStats] = useState<{ scanned_in: number; total_approved: number } | null>(null)
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const scannerRef = useRef<any>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout>>()

  // Redirect if no volunteer token
  useEffect(() => {
    if (!getVolunteerToken()) {
      navigate(eventId ? `/scanner/login?event=${eventId}` : '/scanner/login')
    }
  }, [])

  // Seed stats from REST on first load
  useEffect(() => {
    if (initialLive && !liveStats) {
      setLiveStats(initialLive.stats)
      setRecentEntries(initialLive.recent_entries || [])
    }
  }, [initialLive])

  // Load html5-qrcode dynamically (avoids SSR/build issues)
  useEffect(() => {
    import('html5-qrcode').then(m => {
      ;(window as any).__H5QS = m.Html5QrcodeScanner
      setReady(true)
    }).catch(err => console.error('Failed to load scanner:', err))
  }, [])

  // WebSocket for live stat updates (only if we have an eventId)
  useEventSocket({
    eventId: eventId || '',
    useVolunteerToken: true,
    onLiveStats: (stats) => { if (eventId) setLiveStats(stats) },
  })

  // Start QR scanner
  useEffect(() => {
    if (!ready || !scanning) return
    const Html5QrcodeScanner = (window as any).__H5QS
    if (!Html5QrcodeScanner) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
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
            message: err.response?.data?.message || err.response?.data?.error || 'Invalid QR code',
          }
        }

        res._ts = Date.now()
        setResult(res)

        if (res.result === 'success') {
          setRecentEntries(prev => [{
            registrations: { attendee_name: res.attendee?.name },
            scanned_at: new Date().toISOString(),
          }, ...prev].slice(0, 8))
        }

        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          setResult(null)
          setScanning(true)
        }, 3200)
      },
      () => {} // ignore decode errors (blurry frames)
    )

    scannerRef.current = scanner
    return () => {
      clearTimeout(timerRef.current)
      scanner.clear().catch(() => {})
    }
  }, [ready, scanning])

  const logout = () => {
    clearVolunteerSession()
    navigate('/scanner/login')
  }

  const cfg           = result ? RESULT_CONFIG[result.result] : null
  const scannedIn     = liveStats?.scanned_in    ?? 0
  const totalApproved = liveStats?.total_approved ?? 0
  const pct           = totalApproved > 0 ? Math.round((scannedIn / totalApproved) * 100) : 0

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#080714',
      fontFamily: 'DM Sans, sans-serif',
      color: '#f0eeff',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        background: '#10102a',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0eeff' }}>Gate Scanner</div>
          <div style={{ fontSize: 11, color: '#5e5a80', marginTop: 2 }}>
            {scanning ? '● Ready' : '⏳ Processing…'}
          </div>
        </div>

        {/* Live counter — only shown if we have event stats */}
        {eventId && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#818cf8', lineHeight: 1 }}>
              {scannedIn}
            </div>
            <div style={{ fontSize: 10, color: '#5e5a80', marginTop: 2 }}>
              of {totalApproved} in
            </div>
            <div style={{
              width: 64, height: 3,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 10, marginTop: 4, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                borderRadius: 10, transition: 'width 0.5s',
              }} />
            </div>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#9893b8', borderRadius: 8,
            padding: '8px 14px', fontSize: 13,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          Logout
        </button>
      </div>

      {/* Scanner area */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <div id="qr-reader" style={{ width: '100%' }} />

        {!ready && (
          <div style={{
            padding: 60, textAlign: 'center', color: '#5e5a80', fontSize: 14,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📷</div>
            Loading camera…
          </div>
        )}

        {/* Result overlay */}
        {result && cfg && (
          <div style={{
            position: 'absolute', inset: 0,
            background: cfg.bg,
            border: `3px solid ${cfg.accent}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 24,
            animation: 'resultFadeIn 0.2s ease',
          }}>
            <style>{`
              @keyframes resultFadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <div style={{
              width: 80, height: 80,
              background: cfg.accent,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, fontWeight: 900, color: 'white',
              marginBottom: 16,
            }}>
              {cfg.icon}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>{cfg.title}</div>
            {result.attendee?.name && (
              <div style={{ fontSize: 18, opacity: 0.9, fontWeight: 600, textAlign: 'center' }}>
                {result.attendee.name}
              </div>
            )}
            {result.attendee?.email && (
              <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4, textAlign: 'center' }}>
                {result.attendee.email}
              </div>
            )}
            {result.result === 'already_scanned' && result.scanned_at && (
              <div style={{
                marginTop: 12, background: 'rgba(0,0,0,0.25)',
                padding: '6px 14px', borderRadius: 8, fontSize: 13, opacity: 0.8,
              }}>
                Scanned at {new Date(result.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
              </div>
            )}
            <div style={{ fontSize: 11, opacity: 0.4, marginTop: 20 }}>
              Resuming in 3 seconds…
            </div>
          </div>
        )}
      </div>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div style={{
          padding: '12px 16px',
          background: '#0c0c20',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#3d3a5c', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Recent entries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentEntries.slice(0, 5).map((entry: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8, padding: '8px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26,
                    background: 'rgba(99,102,241,0.2)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#818cf8', flexShrink: 0,
                  }}>
                    {entry.registrations?.attendee_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: 13, color: '#c4bfe0' }}>
                    {entry.registrations?.attendee_name || 'Unknown'}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#3d3a5c' }}>
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
