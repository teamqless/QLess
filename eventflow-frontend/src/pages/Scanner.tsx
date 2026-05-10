import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScan, useLiveDashboard, getVolunteerToken, clearVolunteerSession } from '@/hooks/useScanner'
import { useEventSocket } from '@/hooks/useSocket'
import type { ScanResponse } from '@/types'

type ScanResult = ScanResponse & { _ts?: number }

const RESULT_CONFIG = {
  success: {
    bg:    'linear-gradient(160deg,#14532d,#15803d)',
    border:'#22c55e',
    icon:  '✓',
    title: 'Entry Granted',
  },
  already_scanned: {
    bg:    'linear-gradient(160deg,#78350f,#b45309)',
    border:'#f59e0b',
    icon:  '⚠',
    title: 'Already Used',
  },
  rejected: {
    bg:    'linear-gradient(160deg,#7f1d1d,#b91c1c)',
    border:'#ef4444',
    icon:  '✗',
    title: 'Not Approved',
  },
  invalid: {
    bg:    'linear-gradient(160deg,#1e1b4b,#312e81)',
    border:'#6366f1',
    icon:  '✗',
    title: 'Invalid QR',
  },
}

export default function Scanner() {
  const { eventId }    = useParams<{ eventId: string }>()
  const navigate       = useNavigate()
  const scan           = useScan()
  const { data: initialLive } = useLiveDashboard(eventId!)   // initial load only

  const [result, setResult]     = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(true)
  const [ready, setReady]       = useState(false)
  const [liveStats, setLiveStats] = useState<{ scanned_in: number; total_approved: number } | null>(null)
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const scannerRef = useRef<any>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout>>()

  // Seed from REST on first load
  useEffect(() => {
    if (initialLive && !liveStats) {
      setLiveStats(initialLive.stats)
      setRecentEntries(initialLive.recent_entries || [])
    }
  }, [initialLive])

  // Redirect if no token
  useEffect(() => {
    if (!getVolunteerToken()) navigate(`/scanner/login?event=${eventId}`)
  }, [])

  // Load html5-qrcode dynamically
  useEffect(() => {
    import('html5-qrcode').then(m => {
      ;(window as any).__Html5QrcodeScanner = m.Html5QrcodeScanner
      setReady(true)
    })
  }, [])

  // ── WebSocket: receive live stats pushed from server ─────────────────────
  useEventSocket({
    eventId: eventId!,
    useVolunteerToken: true,
    onLiveStats: (stats) => setLiveStats(stats),
  })

  useEffect(() => {
    if (!ready || !scanning) return
    const Html5QrcodeScanner = (window as any).__Html5QrcodeScanner
    if (!Html5QrcodeScanner) return

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
      () => {}
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

  const cfg = result ? RESULT_CONFIG[result.result] : null
  const scannedIn     = liveStats?.scanned_in     ?? 0
  const totalApproved = liveStats?.total_approved  ?? 0
  const pct           = totalApproved > 0 ? Math.round((scannedIn / totalApproved) * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#080714', fontFamily: 'DM Sans, sans-serif', color: '#f0eeff' }}>

      {/* Header */}
      <div style={{
        background: '#10102a', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Gate Scanner</div>
          <div style={{ fontSize: 12, color: '#5e5a80', marginTop: 1 }}>
            {scanning ? 'Ready — point camera at QR code' : 'Processing…'}
          </div>
        </div>

        {/* Live counter */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#818cf8', lineHeight: 1 }}>{scannedIn}</div>
          <div style={{ fontSize: 11, color: '#5e5a80' }}>of {totalApproved} in</div>
          <div style={{ width: 70, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 10, marginTop: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 10, transition: 'width 0.5s' }} />
          </div>
        </div>

        <button onClick={logout} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#9893b8', borderRadius: 8, padding: '7px 14px', fontSize: 13,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
        }}>
          Logout
        </button>
      </div>

      {/* Scanner area */}
      <div style={{ position: 'relative', minHeight: 340 }}>
        <div id="qr-reader" style={{ width: '100%' }} />
        {!ready && (
          <div style={{ padding: 40, textAlign: 'center', color: '#5e5a80', fontSize: 14 }}>
            Initialising camera…
          </div>
        )}

        {/* Result overlay */}
        {result && cfg && (
          <div style={{
            position: 'absolute', inset: 0,
            background: cfg.bg,
            border: `2px solid ${cfg.border}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            animation: 'fadeInScale 0.2s ease',
          }}>
            <style>{`
              @keyframes fadeInScale {
                from { opacity: 0; transform: scale(0.95); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, marginBottom: 10 }}>{cfg.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{cfg.title}</div>
            {result.attendee?.name && (
              <div style={{ fontSize: 20, opacity: 0.9, fontWeight: 600 }}>{result.attendee.name}</div>
            )}
            {result.attendee?.email && (
              <div style={{ fontSize: 14, opacity: 0.6, marginTop: 4 }}>{result.attendee.email}</div>
            )}
            {result.result === 'already_scanned' && result.scanned_at && (
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 8, background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: 6 }}>
                Scanned at {new Date(result.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
              </div>
            )}
            <div style={{ fontSize: 12, opacity: 0.4, marginTop: 20 }}>Resuming in 3 seconds…</div>
          </div>
        )}
      </div>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3d3a5c', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Recent entries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {recentEntries.map((entry: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8, padding: '8px 14px',
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
