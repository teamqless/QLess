import { useLocation } from 'react-router-dom'
import { getStoredClub } from '@/lib/auth'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/events':      'Events',
  '/events/new':  'Create Event',
  '/volunteers':  'Volunteers',
  '/settings':    'Settings',
}

export default function Header() {
  const location = useLocation()
  const club     = getStoredClub()

  const title = PAGE_TITLES[location.pathname]
    ?? (location.pathname.startsWith('/events/') ? 'Event Details' : 'EventFlow')

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-white/40 flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-40 shadow-sm transition-all duration-300">
      <h1 className="text-lg font-bold text-text-1 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{title}</h1>

      <div className="flex items-center gap-3">
        {club && (
          <span className="text-sm font-medium text-text-3 hidden sm:block">
            {club.college || club.email}
          </span>
        )}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 flex items-center justify-center text-sm font-bold text-brand shadow-sm">
          {club?.name.charAt(0).toUpperCase() ?? 'C'}
        </div>
      </div>
    </header>
  )
}
