// ============================================================
// hooks/useRegistrations.ts — PHASE 3
// All registration-related queries and mutations
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Registration } from '@/types'

// List registrations for an event (club admin view)
export const useRegistrations = (eventId: string, status?: string, search?: string) => {
  return useQuery<Registration[]>({
    queryKey: ['registrations', eventId, status, search],
    queryFn: async () => {
      const { data } = await api.get(`/registrations/${eventId}`, {
        params: { status, search },
      })
      return data.registrations
    },
    enabled: !!eventId,
  })
}

// Submit registration (public, no auth)
export const useSubmitRegistration = (slug: string) => {
  return useMutation({
    mutationFn: async (payload: {
      form_data: Record<string, string>
      payment_screenshot_url?: string
    }) => {
      const { data } = await api.post(`/registrations/submit/${slug}`, payload)
      return data
    },
  })
}

// Approve a registration (triggers QR generation + email)
export const useApproveRegistration = (eventId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (registrationId: string) => {
      const { data } = await api.post(`/registrations/${registrationId}/approve`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['registrations', eventId] }),
  })
}

export function useBulkSendQR(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/events/${eventId}/bulk-qr`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations', eventId] })
    }
  })
}

// Reject a registration
export const useRejectRegistration = (eventId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.post(`/registrations/${id}/reject`, { reason })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['registrations', eventId] }),
  })
}

// Resend QR email
export const useResendQR = () => {
  return useMutation({
    mutationFn: async (registrationId: string) => {
      const { data } = await api.post(`/registrations/${registrationId}/resend-qr`)
      return data
    },
  })
}

// Upload payment screenshot (public endpoint, returns URL)
export const useUploadPaymentScreenshot = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/upload/payment-screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.url as string
    },
  })
}
