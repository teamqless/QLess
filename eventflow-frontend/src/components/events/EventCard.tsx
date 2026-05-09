import { Link } from 'react-router-dom'
import type { Event } from '@/types'
import EventStatusBadge from './EventStatusBadge'

export default function EventCard({ event }: { event: Event }) {
  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <Link
      to={`/events/${event.id}`}
      style={{ textDecoration: 'none' }}
    >
      <div className="card" style={{
        overflow: 'hidden',
        transition: 'box-shadow 0.15s, transform 0.15s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = ''
          ;(e.currentTarget as HTMLElement).style.transform = ''
        }}
      >
        {/* Color stripe / banner */}
        <div style={{
          height: 6,
          background: event.banner_url
            ? `url(${event.banner_url}) center/cover no-repeat`
            : event.theme_color,
        }} />

        <div style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3 }}>
              {event.title}
            </h3>
            <EventStatusBadge status={event.status} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {event.venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)' }}>
                <span>📍</span> {event.venue}
              </div>
            )}
            {dateStr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)' }}>
                <span>📅</span> {dateStr}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)' }}>
              <span>🎟️</span> {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
