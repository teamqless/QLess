import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function useVolunteers() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['volunteers'],
    queryFn: async () => {
      const { data } = await api.get('/volunteers')
      return data
    },
  })
  return { data, isLoading, refetch }
}
