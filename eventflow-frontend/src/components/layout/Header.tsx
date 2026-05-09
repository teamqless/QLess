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
    <header style={{
      height: 56,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      flexShrink: 0,
    }}>
      <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {club && (
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {club.college || club.email}
          </span>
        )}
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--surface-3)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
        }}>
          {club?.name.charAt(0).toUpperCase() ?? 'C'}
        </div>
      </div>
    </header>
  )
}
