import { useLocation } from 'react-router-dom'
import { getStoredClub } from '@/lib/auth'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/events': 'Events',
  '/events/new': 'Create Event',
  '/volunteers': 'Volunteers',
  '/settings': 'Settings',
}

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation()
  const club = getStoredClub()

  const title = PAGE_TITLES[location.pathname]
    ?? (location.pathname.startsWith('/events/') ? 'Event Details' : 'EventFlow')

  return (
    <header className="h-16 bg-white dark:bg-black border-b border-slate-200 dark:border-red-500/20 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-30 shadow-sm w-full transition-colors duration-300">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-red-500/10 rounded-lg transition-colors md:hidden">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {club && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
            {club.college || club.email}
          </span>
        )}
        <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-red-500/10 border border-indigo-100 dark:border-red-500/20 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-red-500 shadow-sm">
          {club?.name?.charAt(0)?.toUpperCase() ?? 'C'}
        </div>
      </div>
    </header>
  )
}
