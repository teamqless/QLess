// ============================================================
// hooks/useSocket.ts — WebSocket event subscriptions
// ============================================================
import { useEffect, useRef, useCallback } from 'react'
import { joinEventRoom, leaveEventRoom } from '@/lib/socket'
import type { ScanResponse } from '@/types'

interface LiveStats {
  scanned_in:     number
  total_approved: number
  remaining:      number
}

interface UseEventSocketOptions {
  eventId:               string
  useVolunteerToken?:    boolean
  onScanResult?:         (data: ScanResponse & { volunteer?: string; scanned_at?: string }) => void
  onLiveStats?:          (stats: LiveStats) => void
  onNewRegistration?:    (reg: any) => void
}

export const useEventSocket = ({
  eventId,
  useVolunteerToken = false,
  onScanResult,
  onLiveStats,
  onNewRegistration,
}: UseEventSocketOptions) => {
  const socketRef = useRef<ReturnType<typeof joinEventRoom> | null>(null)

  const stableScan = useCallback(onScanResult ?? (() => {}), [])
  const stableStats = useCallback(onLiveStats ?? (() => {}), [])
  const stableReg = useCallback(onNewRegistration ?? (() => {}), [])

  useEffect(() => {
    if (!eventId) return

    const s = joinEventRoom(eventId, useVolunteerToken)
    socketRef.current = s

    if (onScanResult)      s.on('scan_result',       stableScan)
    if (onLiveStats)       s.on('live_stats',         stableStats)
    if (onNewRegistration) s.on('new_registration',   stableReg)

    return () => {
      s.off('scan_result',     stableScan)
      s.off('live_stats',      stableStats)
      s.off('new_registration', stableReg)
      leaveEventRoom(eventId)
    }
  }, [eventId])
}
