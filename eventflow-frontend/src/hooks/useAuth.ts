// ============================================================
// hooks/useAuth.ts — PHASE 2
// Fetch current club profile. Used to verify session is valid.
// ============================================================
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Club } from '@/types'

export const useAuth = () => {
  return useQuery<Club>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data.club
    },
    retry: false,
  })
}
