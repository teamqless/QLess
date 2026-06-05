import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import EventCard from '@/components/events/EventCard'
import type { EventStatus } from '@/types'

const TABS: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: 'published', label: 'Live' },
  { value: 'draft',     label: 'Draft' },
  { value: 'completed', label: 'Completed' },
]

export default function EventList() {
  const [tab, setTab] = useState<EventStatus | 'all'>('all')
  const { data: events, isLoading } = useEvents(tab === 'all' ? undefined : tab)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Manage all your club events</p>
        </div>
        <Link to="/events/new" className="btn btn-primary">+ New Event</Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-surface-3/50 backdrop-blur-sm border border-border/50 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.value 
                ? 'bg-white text-text-1 shadow-sm border border-border/50' 
                : 'text-text-3 hover:text-text-2 hover:bg-white/50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="shimmer h-1.5 rounded-full mb-4" />
              <div className="shimmer h-4 w-3/4 mb-2.5" />
              <div className="shimmer h-3 w-1/2 mb-1.5" />
              <div className="shimmer h-3 w-2/5" />
            </div>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3 text-brand/20">◈</div>
          <p className="text-base text-text-2 font-semibold mb-1">No events yet</p>
          <p className="text-sm text-text-3 mb-6">Create your first event to get started</p>
          <Link to="/events/new" className="btn btn-primary">Create event</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {events?.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  )
}
