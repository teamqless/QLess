import { Link } from 'react-router-dom'
import type { Event } from '@/types'
import EventStatusBadge from './EventStatusBadge'

export default function EventCard({ event }: { event: Event }) {
  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <Link to={`/events/${event.id}`} className="block no-underline">
      <div className="vc-card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Color stripe / banner */}
        <div 
          className="h-1.5 w-full shrink-0" 
          style={{
            background: event.banner_url
              ? `url(${event.banner_url}) center/cover no-repeat`
              : event.theme_color,
          }} 
        />

        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-[15px] font-semibold text-ink leading-snug line-clamp-2">
              {event.title}
            </h3>
            <EventStatusBadge status={event.status} />
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            {event.venue && (
              <div className="flex items-center gap-2 text-[13px] text-ink-soft">
                <span className="shrink-0 text-ink-faint">📍</span> 
                <span className="truncate">{event.venue}</span>
              </div>
            )}
            {dateStr && (
              <div className="flex items-center gap-2 text-[13px] text-ink-soft">
                <span className="shrink-0 text-ink-faint">📅</span> 
                <span>{dateStr}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[13px] text-ink-soft">
              <span className="shrink-0 text-ink-faint">🎟️</span> 
              <span>{event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
