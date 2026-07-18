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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Events</h1>
          <p className="text-sm text-ink-soft mt-1">Manage all your club events</p>
        </div>
        <Link to="/events/new" className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5">+ New Event</Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-paper-dim border border-line-soft rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.value 
                ? 'bg-paper text-ink shadow-sm border border-line-soft' 
                : 'text-ink-soft hover:text-ink hover:bg-paper/50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vc-card p-5">
              <div className="skeleton h-1.5 rounded-full mb-4" />
              <div className="skeleton h-4 w-3/4 mb-2.5" />
              <div className="skeleton h-3 w-1/2 mb-1.5" />
              <div className="skeleton h-3 w-2/5" />
            </div>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3 text-amber-soft">◈</div>
          <p className="text-base text-ink-soft font-semibold mb-1">No events yet</p>
          <p className="text-sm text-ink-faint mb-6">Create your first event to get started</p>
          <Link to="/events/new" className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5">Create event</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {events?.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  )
}
