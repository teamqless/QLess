// ============================================================
// hooks/useEvents.ts — PHASE 2
// All event-related queries and mutations
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Event, EventStats } from '@/types'

// List all events for the logged-in club
export const useEvents = (status?: string) => {
  return useQuery<Event[]>({
    queryKey: ['events', status],
    queryFn: async () => {
      const { data } = await api.get('/events', { params: { status } })
      return data.events
    },
  })
}

// Single event (club admin view, includes stats)
export const useEvent = (id: string) => {
  return useQuery<{ event: Event; stats: EventStats }>({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`)
      return data
    },
    enabled: !!id,
  })
}

// Public event view by slug (for registration page)
export const usePublicEvent = (slug: string) => {
  return useQuery<Event>({
    queryKey: ['events', 'public', slug],
    queryFn: async () => {
      const { data } = await api.get(`/events/public/${slug}`)
      return data.event
    },
    enabled: !!slug,
    retry: false,
  })
}

// Create new event
export const useCreateEvent = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Event>) => {
      const { data } = await api.post('/events', payload)
      return data.event as Event
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

// Update event details
export const useUpdateEvent = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Event>) => {
      const { data } = await api.patch(`/events/${id}`, payload)
      return data.event as Event
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events', id] })
      qc.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// Publish / unpublish toggle
export const usePublishEvent = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/events/${id}/publish`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events', id] }),
  })
}

// Delete event
export const useDeleteEvent = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}
