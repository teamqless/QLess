// ============================================================
// lib/auth.ts — Token & session helpers
// ============================================================
import type { Club } from '@/types'

const TOKEN_KEY = 'eventflow_token'
const CLUB_KEY  = 'eventflow_club'

export const getToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY)

export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token)

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CLUB_KEY)
}

export const isAuthenticated = (): boolean =>
  !!localStorage.getItem(TOKEN_KEY)

export const getStoredClub = (): Club | null => {
  const raw = localStorage.getItem(CLUB_KEY)
  return raw ? JSON.parse(raw) : null
}

export const setStoredClub = (club: Club): void =>
  localStorage.setItem(CLUB_KEY, JSON.stringify(club))

export const logout = (): void => {
  removeToken()
  window.location.href = '/login'
}
