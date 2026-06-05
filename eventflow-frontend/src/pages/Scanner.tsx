import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScan, useLiveDashboard, getVolunteerToken, clearVolunteerSession } from '@/hooks/useScanner'
import { useEventSocket } from '@/hooks/useSocket'
import type { ScanResponse } from '@/types'

type ScanResult = ScanResponse & { _ts?: number }

const RESULT_CONFIG = {
  success: {
    bg:    'bg-green-950/90',
    accent:'border-green-500',
    iconBg:'bg-green-500',
    icon:  '✓',
    title: 'Entry Granted',
  },
  already_scanned: {
    bg:    'bg-amber-950/90',
    accent:'border-amber-500',
    iconBg:'bg-amber-500',
    icon:  '⚠',
    title: 'Already Used',
  },
  rejected: {
    bg:    'bg-red-950/90',
    accent:'border-red-500',
    iconBg:'bg-red-500',
    icon:  '✗',
    title: 'Not Approved',
  },
  invalid: {
    bg:    'bg-indigo-950/90',
    accent:'border-indigo-400',
    iconBg:'bg-indigo-400',
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
    <div className="min-h-[100dvh] bg-[#080714] text-[#f0eeff] font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-[20%] left-[-20%] w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#10102a]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div>
          <div className="text-[15px] font-bold text-[#f0eeff] tracking-tight">Gate Scanner</div>
          <div className="text-[11px] text-[#5e5a80] mt-0.5 font-medium flex items-center gap-1.5">
            {scanning ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Ready</>
            ) : (
              <><span className="animate-spin text-[10px]">⏳</span> Processing…</>
            )}
          </div>
        </div>

        {/* Live counter */}
        {eventId && (
          <div className="text-center flex flex-col items-center">
            <div className="text-[28px] font-black text-indigo-400 leading-none tracking-tighter">
              {scannedIn}
            </div>
            <div className="text-[10px] text-[#5e5a80] mt-0.5 uppercase tracking-wider font-bold">
              of {totalApproved} in
            </div>
            <div className="w-16 h-[3px] bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="bg-white/5 border border-white/10 text-[#9893b8] rounded-lg px-3.5 py-2 text-[13px] font-medium hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>

      {/* Scanner area */}
      <div className="relative flex-1 min-h-0 flex flex-col z-10 bg-black/20">
        <div id="qr-reader" className="w-full h-full object-cover [&>video]:object-cover" />

        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#5e5a80] text-sm font-medium">
            <div className="text-4xl mb-3 animate-pulse">📷</div>
            Loading camera…
          </div>
        )}

        {/* Result overlay */}
        {result && cfg && (
          <div className={`absolute inset-0 ${cfg.bg} backdrop-blur-md border-[3px] ${cfg.accent} flex flex-col items-center justify-center p-6 animate-[resultFadeIn_0.2s_ease-out_forwards]`}>
            <div className={`w-20 h-20 rounded-full ${cfg.iconBg} flex items-center justify-center text-[40px] font-black text-white mb-4 shadow-xl`}>
              {cfg.icon}
            </div>
            <div className="text-[26px] font-black mb-2 text-center text-white tracking-tight">{cfg.title}</div>
            
            {result.attendee?.name && (
              <div className="text-lg font-bold text-white/90 text-center">
                {result.attendee.name}
              </div>
            )}
            
            {result.attendee?.email && (
              <div className="text-[13px] text-white/60 mt-1 text-center font-medium">
                {result.attendee.email}
              </div>
            )}
            
            {result.result === 'already_scanned' && result.scanned_at && (
              <div className="mt-4 bg-black/40 px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-white/80 border border-white/10">
                Scanned at {new Date(result.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
              </div>
            )}
            
            <div className="text-[11px] font-medium text-white/40 mt-6 tracking-wide uppercase">
              Resuming in 3 seconds…
            </div>
          </div>
        )}
      </div>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div className="p-4 bg-[#0c0c20]/90 backdrop-blur-md border-t border-white/5 flex-shrink-0 z-10">
          <div className="text-[10px] font-bold text-[#3d3a5c] uppercase tracking-[0.07em] mb-3">
            Recent entries
          </div>
          <div className="flex flex-col gap-1.5">
            {recentEntries.slice(0, 5).map((entry: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-indigo-500/20 rounded-full flex items-center justify-center text-[11px] font-bold text-indigo-400 shrink-0">
                    {entry.registrations?.attendee_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-[13px] font-medium text-[#c4bfe0]">
                    {entry.registrations?.attendee_name || 'Unknown'}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#5e5a80]">
                  {new Date(entry.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes resultFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        /* Override html5-qrcode default ugly styles */
        #qr-reader { border: none !important; }
        #qr-reader__dashboard_section_csr span { color: #5e5a80 !important; }
        #qr-reader__dashboard_section_swaplink { color: #818cf8 !important; text-decoration: none !important; }
        #qr-reader button { 
          background: rgba(99,102,241,0.2) !important;
          color: #818cf8 !important;
          border: 1px solid rgba(99,102,241,0.3) !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
          font-family: inherit !important;
        }
      `}</style>
    </div>
  )
}
