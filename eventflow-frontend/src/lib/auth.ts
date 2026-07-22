// ============================================================
// lib/auth.ts — Token & session helpers
// ============================================================
import type { Club } from '@/types'

const TOKEN_KEY = 'eventflow_token'
const CLUB_KEY  = 'eventflow_club'
const ADMIN_TOKEN_KEY = 'eventflow_admin_token'

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
  if (!raw || raw === 'undefined') return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse stored club:', e)
    return null
  }
}

export const setStoredClub = (club: Club): void =>
  localStorage.setItem(CLUB_KEY, JSON.stringify(club))

export const logout = (): void => {
  removeToken()
  window.location.href = '/login'
}

// ─── ADMIN AUTH ─────────────────────────────────────────────────────────────

export const getAdminToken = (): string | null =>
  localStorage.getItem(ADMIN_TOKEN_KEY)

export const setAdminToken = (token: string): void =>
  localStorage.setItem(ADMIN_TOKEN_KEY, token)

export const removeAdminToken = (): void =>
  localStorage.removeItem(ADMIN_TOKEN_KEY)

export const isAdminAuthenticated = (): boolean =>
  !!localStorage.getItem(ADMIN_TOKEN_KEY)

export const adminLogout = (): void => {
  removeAdminToken()
  window.location.href = '/login'
}

// Clears all auth state (used by sidebar logout button)
export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CLUB_KEY)
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}
