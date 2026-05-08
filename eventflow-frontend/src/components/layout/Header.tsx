// ============================================================
// components/layout/Header.tsx — PHASE 2
// Top bar for the authenticated dashboard
// ============================================================
import { logout, getStoredClub } from '@/lib/auth'

export default function Header() {
  const club = getStoredClub()

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        {club && (
          <span className="text-sm text-gray-600 font-medium">{club.name}</span>
        )}
        <button
          onClick={logout}
          className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">
          Logout
        </button>
      </div>
    </header>
  )
}
