// ============================================================
// hooks/useScanner.ts — PHASE 4
// Volunteer login, QR scanning, live dashboard polling
// ============================================================
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ScanResponse } from '@/types'

const VOLUNTEER_TOKEN_KEY = 'eventflow_volunteer_token'
const VOLUNTEER_KEY       = 'eventflow_volunteer'

// Helpers
export const getVolunteerToken  = () => localStorage.getItem(VOLUNTEER_TOKEN_KEY)
export const setVolunteerToken  = (t: string) => localStorage.setItem(VOLUNTEER_TOKEN_KEY, t)
export const clearVolunteerSession = () => {
  localStorage.removeItem(VOLUNTEER_TOKEN_KEY)
  localStorage.removeItem(VOLUNTEER_KEY)
}

// Volunteer login with access code
export const useVolunteerLogin = () => {
  return useMutation({
    mutationFn: async (payload: { access_code: string; event_id: string }) => {
      const { data } = await api.post('/scanner/login', payload)
      // Store volunteer token separately from club token
      setVolunteerToken(data.token)
      localStorage.setItem(VOLUNTEER_KEY, JSON.stringify(data.volunteer))
      return data
    },
  })
}

// Scan a QR token — uses volunteer token
export const useScan = () => {
  return useMutation({
    mutationFn: async (token: string): Promise<ScanResponse> => {
      const volunteerToken = getVolunteerToken()
      const { data } = await api.post(
        '/scanner/scan',
        { token },
        { headers: { Authorization: `Bearer ${volunteerToken}` } }
      )
      return data
    },
  })
}

// Live dashboard — polls every 5 seconds
export const useLiveDashboard = (eventId: string) => {
  return useQuery({
    queryKey: ['scanner', 'live', eventId],
    queryFn: async () => {
      const volunteerToken = getVolunteerToken()
      const { data } = await api.get(`/scanner/live/${eventId}`, {
        headers: { Authorization: `Bearer ${volunteerToken}` },
      })
      return data
    },
    enabled: !!eventId && !!getVolunteerToken(),
    refetchInterval: 5000,   // poll every 5 seconds
  })
}

// List volunteers for an event (club admin)
export const useVolunteers = () => {
  return useQuery({
    queryKey: ['volunteers'],
    queryFn: async () => {
      const { data } = await api.get('/scanner/volunteers')
      return data.volunteers
    },
  })
}

// Create volunteer (club admin)
export const useCreateVolunteer = () => {
  return useMutation({
    mutationFn: async (payload: {
      name: string
      access_code: string
      event_id?: string
    }) => {
      const { data } = await api.post('/scanner/volunteers', payload)
      return data.volunteer
    },
  })
}
