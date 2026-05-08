// ============================================================
// pages/Scanner.tsx — PHASE 4
// Live QR scanner for volunteers at /scanner/:eventId
// ============================================================
// Uses html5-qrcode library to access device camera
// On scan: POST /scanner/scan with the decoded token
// Shows color-coded result overlay (green/yellow/red)
// Live entry counter refreshes every 5 seconds

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useScan, useLiveDashboard, getVolunteerToken, clearVolunteerSession } from '@/hooks/useScanner'
import type { ScanResponse } from '@/types'

export default function Scanner() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate    = useNavigate()
  const scan        = useScan()
  const { data: live } = useLiveDashboard(eventId!)

  const [lastResult, setLastResult] = useState<ScanResponse | null>(null)
  const [scanning, setScanning]     = useState(true)
  const scannerRef                  = useRef<Html5QrcodeScanner | null>(null)
  const resultTimeout               = useRef<ReturnType<typeof setTimeout>>()

  // Redirect to login if no volunteer token
  useEffect(() => {
    if (!getVolunteerToken()) {
      navigate(`/scanner/login?event=${eventId}`)
    }
  }, [])

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 280, height: 280 }, aspectRatio: 1 },
      false
    )

    scanner.render(
      async (decodedText) => {
        // Pause scanner while processing
        setScanning(false)
        scanner.pause()

        try {
          const result = await scan.mutateAsync(decodedText)
          setLastResult(result)
        } catch (err: any) {
          setLastResult({
            result:  'invalid',
            message: err.response?.data?.message || 'Invalid QR code',
          })
        }

        // Resume scanning after 3 seconds
        resultTimeout.current = setTimeout(() => {
          setLastResult(null)
          setScanning(true)
          scanner.resume()
        }, 3000)
      },
      () => {}  // ignore scan errors (blurry frame etc)
    )

    scannerRef.current = scanner
    return () => {
      clearTimeout(resultTimeout.current)
      scanner.clear().catch(() => {})
    }
  }, [scanning])

  const resultConfig = {
    success:        { bg: 'bg-green-500', text: '✓ Entry Granted',   icon: '✅' },
    already_scanned:{ bg: 'bg-amber-500', text: '⚠ Already Scanned', icon: '⚠️' },
    rejected:       { bg: 'bg-red-600',   text: '✗ Not Approved',    icon: '❌' },
    invalid:        { bg: 'bg-red-700',   text: '✗ Invalid QR',      icon: '❌' },
  }

  const rc = lastResult ? resultConfig[lastResult.result] : null

  const handleLogout = () => {
    clearVolunteerSession()
    navigate('/scanner/login')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-gray-800 border-b border-gray-700">
        <div>
          <p className="font-semibold">Gate Scanner</p>
          <p className="text-xs text-gray-400">Point camera at attendee QR code</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Live counter */}
          {live && (
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-400">{live.stats.scanned_in}</p>
              <p className="text-xs text-gray-400">of {live.stats.total_approved} in</p>
            </div>
          )}
          <button onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-white border border-gray-600 px-3 py-1.5 rounded-lg">
            Logout
          </button>
        </div>
      </div>

      {/* Scanner viewfinder */}
      <div className="relative">
        <div id="qr-reader" className="w-full" />

        {/* Result overlay */}
        {lastResult && rc && (
          <div className={`absolute inset-0 ${rc.bg} bg-opacity-95 flex flex-col items-center justify-center`}>
            <p className="text-6xl mb-4">{rc.icon}</p>
            <p className="text-2xl font-bold mb-2">{rc.text}</p>
            {lastResult.attendee?.name && (
              <p className="text-lg opacity-90">{lastResult.attendee.name}</p>
            )}
            {lastResult.attendee?.email && (
              <p className="text-sm opacity-70">{lastResult.attendee.email}</p>
            )}
            <p className="text-sm opacity-70 mt-4">{lastResult.message}</p>
            <p className="text-xs opacity-50 mt-6">Resuming scanner in 3 seconds...</p>
          </div>
        )}
      </div>

      {/* Recent entries */}
      {live?.recent_entries?.length > 0 && (
        <div className="px-4 py-4">
          <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wide">Recent entries</p>
          <div className="space-y-2">
            {live.recent_entries.slice(0, 5).map((entry: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                <p className="text-sm">{entry.registrations?.attendee_name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
