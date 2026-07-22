import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useState as _useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Keyboard, X, ArrowLeft, Zap } from 'lucide-react'
import { QLessLogo } from '@/components/qless/Logo'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { useScan, useLiveDashboard, getVolunteerToken, clearVolunteerSession } from '@/hooks/useScanner'
import { useEventSocket } from '@/hooks/useSocket'
import type { ScanResponse } from '@/types'

type ScanResult = ScanResponse & { _ts?: number }

export default function Scanner() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const scan = useScan()
  const { data: initialLive } = useLiveDashboard(eventId || '')

  const [result, setResult] = useState<ScanResult | null>(null)
  const [scanning, setScanning] = useState(true)
  const [ready, setReady] = useState(false)
  const [scans, setScans] = useState(0)
  const [liveStats, setLiveStats] = useState<{ scanned_in: number; total_approved: number } | null>(null)
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const [manual, setManual] = useState(false)
  const [manualId, setManualId] = useState('')
  const scannerRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!getVolunteerToken()) {
      navigate(eventId ? `/scanner/login?event=${eventId}` : '/scanner/login')
    }
  }, [])

  useEffect(() => {
    if (initialLive && !liveStats) {
      setLiveStats(initialLive.stats)
      setRecentEntries(initialLive.recent_entries || [])
      setScans(initialLive.stats?.scanned_in ?? 0)
    }
  }, [initialLive])

  useEffect(() => {
    import('html5-qrcode').then(m => {
      ;(window as any).__H5QS = m.Html5QrcodeScanner
      setReady(true)
    }).catch(err => console.error('Failed to load scanner:', err))
  }, [])

  useEventSocket({
    eventId: eventId || '',
    useVolunteerToken: true,
    onLiveStats: (stats) => { if (eventId) setLiveStats(stats) },
  })

  useEffect(() => {
    if (!ready || !scanning) return
    const Html5QrcodeScanner = (window as any).__H5QS
    if (!Html5QrcodeScanner) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0, showTorchButtonIfSupported: true },
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
            result: 'invalid',
            message: err.response?.data?.message || err.response?.data?.error || 'Invalid QR code',
          }
        }

        res._ts = Date.now()
        setResult(res)

        if (res.result === 'success') {
          setScans(n => n + 1)
          setRecentEntries(prev => [{
            registrations: { attendee_name: res.attendee?.name },
            scanned_at: new Date().toISOString(),
          }, ...prev].slice(0, 8))
          try {
            const AC = (window as any).AudioContext || (window as any).webkitAudioContext
            if (AC) {
              const ac = new AC()
              const o = ac.createOscillator()
              const g = ac.createGain()
              o.frequency.value = 880
              o.connect(g); g.connect(ac.destination)
              g.gain.setValueAtTime(0.15, ac.currentTime)
              g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2)
              o.start(); o.stop(ac.currentTime + 0.2)
            }
          } catch {}
        }

        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          setResult(null)
          setScanning(true)
        }, 2200)
      },
      () => {}
    )

    scannerRef.current = scanner
    return () => {
      clearTimeout(timerRef.current)
      scanner.clear().catch(() => {})
    }
  }, [ready, scanning])

  const handleManualValidate = async () => {
    setManual(false)
    setScanning(false)
    let res: ScanResult
    try {
      res = await scan.mutateAsync(manualId)
    } catch (err: any) {
      res = { result: 'invalid', message: 'Invalid ticket ID' }
    }
    res._ts = Date.now()
    setResult(res)
    setManualId('')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setResult(null)
      setScanning(true)
    }, 2200)
  }

  const logout = () => {
    clearVolunteerSession()
    navigate('/scanner/login')
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Camera viewport */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.2_0.05_250)_0%,oklch(0.06_0_0)_70%)]" />
        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[repeating-linear-gradient(0deg,transparent_0px,rgba(255,255,255,0.03)_1px,transparent_2px)]" />
        {/* Real camera feed */}
        {ready && (
          <div id="qr-reader" className="absolute inset-0 opacity-0" />
        )}
      </div>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center gap-3 z-20">
        <button
          onClick={logout}
          className="h-10 w-10 grid place-items-center rounded-full glass-strong"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <QLessLogo size={22} />
          <p className="text-xs text-muted-foreground truncate">Gate Scanner</p>
        </div>
        <div className="glass-strong rounded-full px-3 h-10 flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-mono">{scans}</span>
        </div>
      </div>

      {/* Reticle */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="relative h-72 w-72">
          <div className="absolute top-0 left-0 h-10 w-10 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
          <div className="absolute top-0 right-0 h-10 w-10 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-primary rounded-br-2xl" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" style={{ boxShadow: '0 0 20px oklch(0.85 0.17 205)' }} />
          </div>
        </div>
      </div>

      <p className="absolute inset-x-0 top-1/2 mt-52 text-center text-sm text-muted-foreground z-10">
        {ready ? 'Point camera at ticket QR' : 'Loading camera…'}
      </p>

      {/* Bottom actions */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-20">
        <div className="glass-strong rounded-2xl p-3 flex gap-2">
          <button
            onClick={() => setManual(true)}
            className="flex-1 h-9 rounded-lg glass flex items-center justify-center gap-2 text-sm hover:bg-white/10"
            aria-label="Manual input"
          >
            <Keyboard className="h-4 w-4" /> Manual Entry
          </button>
          <button onClick={logout} className="h-9 px-4 rounded-lg glass text-sm hover:bg-white/10">
            Logout
          </button>
        </div>
      </div>

      {/* Manual sheet */}
      <AnimatePresence>
        {manual && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            className="absolute bottom-0 inset-x-0 z-30 glass-strong rounded-t-3xl p-6"
          >
            <div className="flex items-center mb-4">
              <h3 className="font-semibold">Enter Ticket ID</h3>
              <button onClick={() => setManual(false)} className="ml-auto p-2 rounded-lg hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="e.g. A392F1"
              className="w-full glass rounded-xl h-12 px-4 font-mono text-lg bg-transparent outline-none"
            />
            <MagneticButton className="mt-4 w-full" onClick={handleManualValidate}>
              Validate Ticket
            </MagneticButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-40 grid place-items-center ${
              result.result === 'success' ? 'bg-success' : 'bg-destructive'
            }`}
          >
            <div className="text-center px-6">
              {result.result === 'success' ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2 className="h-32 w-32 mx-auto text-white" strokeWidth={2.5} />
                  </motion.div>
                  <h2 className="mt-6 text-5xl font-bold text-white">ENTRY GRANTED</h2>
                  {result.attendee?.name && (
                    <p className="mt-4 text-2xl font-semibold text-white">{result.attendee.name}</p>
                  )}
                  {result.attendee?.email && (
                    <p className="mt-1 text-white/80">{result.attendee.email}</p>
                  )}
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ x: [-10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <XCircle className="h-32 w-32 mx-auto text-white" strokeWidth={2.5} />
                  </motion.div>
                  <h2 className="mt-6 text-4xl font-bold text-white">
                    {result.result === 'already_scanned' ? 'ALREADY CHECKED IN' : 'INVALID QR TICKET'}
                  </h2>
                  {result.result === 'already_scanned' && result.scanned_at && (
                    <p className="mt-3 text-xl text-white/90">
                      at {new Date(result.scanned_at).toLocaleTimeString()}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        #qr-reader { border: none !important; width: 100% !important; height: 100% !important; }
        #qr-reader video { object-fit: cover; width: 100% !important; height: 100% !important; }
      `}</style>
    </div>
  )
}
