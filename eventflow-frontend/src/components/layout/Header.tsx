import { useLocation } from 'react-router-dom'
import { getStoredClub } from '@/lib/auth'
import { Avatar } from '@/components/ui/Avatar'

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
    <header className="h-16 glass flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-30 shadow-sm w-full transition-colors duration-300">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="p-2 -ml-2 text-ink-soft hover:bg-paper-dim rounded-lg transition-colors md:hidden">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="font-display text-lg font-bold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {club && (
          <span className="text-sm font-medium text-ink-soft hidden sm:block">
            {club.college || club.email}
          </span>
        )}
        <Avatar name={club?.name || 'Club'} size={36} />
      </div>
    </header>
  )
}
