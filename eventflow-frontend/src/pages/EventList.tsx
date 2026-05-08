// ============================================================
// pages/EventList.tsx — PHASE 2
// All club events at /events
// ============================================================
// TODO Phase 2:
// - Fetch events using useEvents() hook
// - Tab filter: All | Draft | Published | Completed
// - EventCard grid for each event
// - Empty state with create CTA

import { useEvents } from '@/hooks/useEvents'
import { Link } from 'react-router-dom'

export default function EventList() {
  const { data: events, isLoading } = useEvents()

  if (isLoading) return <div className="p-8 text-gray-500">Loading events...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link to="/events/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + New Event
        </Link>
      </div>

      {/* Phase 2: Add status tab filters here */}

      {events?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No events yet</p>
          <Link to="/events/new" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
            Create your first event
          </Link>
        </div>
      )}

      {/* Phase 2: Replace with EventCard components */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events?.map(event => (
          <Link key={event.id} to={`/events/${event.id}`}
            className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
            {event.banner_url && (
              <img src={event.banner_url} alt={event.title}
                className="w-full h-32 object-cover rounded-lg mb-4" />
            )}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0
                ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                  event.status === 'draft'     ? 'bg-gray-100 text-gray-600' :
                  event.status === 'closed'    ? 'bg-amber-100 text-amber-700' :
                                                 'bg-blue-100 text-blue-700'}`}>
                {event.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{event.venue || 'No venue'}</p>
            <p className="text-xs text-gray-400 mt-1">
              {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
