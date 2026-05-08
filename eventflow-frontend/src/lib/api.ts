// ============================================================
// lib/api.ts — Central Axios instance
// All API calls go through this. JWT is auto-attached.
// ============================================================
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventflow_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eventflow_token')
      localStorage.removeItem('eventflow_club')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
