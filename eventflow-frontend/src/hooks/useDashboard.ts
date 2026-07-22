// ============================================================
// hooks/useDashboard.ts — PHASE 2
// Club admin dashboard stats and per-event analytics
// ============================================================
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { DashboardStats, Event, Registration } from '@/types'

interface DashboardData {
  stats: DashboardStats & { approved: number; rejected: number }
  timeline: Record<string, number>
  recent_events: Event[]
  recent_registrations: (Registration & { events: { title: string } })[]
}

export const useDashboard = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard')
      return data
    },
  })
}

interface EventAnalytics {
  event: Event
  stats: {
    total: number
    pending: number
    approved: number
    rejected: number
    scanned: number
    not_yet_arrived: number
    capacity: number | null
    capacity_pct: number | null
  }
  timeline: Record<string, number>  // { "2026-01-15": 12, ... }
}

export const useEventAnalytics = (eventId: string) => {
  return useQuery<EventAnalytics>({
    queryKey: ['dashboard', 'event', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/dashboard/event/${eventId}`)
      return data
    },
    enabled: !!eventId,
  })
}

// CSV export — triggers a browser download
export const exportCSV = async (eventId: string, eventTitle: string) => {
  const token = localStorage.getItem('eventflow_token')
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/dashboard/export/${eventId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const blob = await response.blob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${eventTitle}-attendees.csv`
  a.click()
  URL.revokeObjectURL(url)
}
