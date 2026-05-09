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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Manage all your club events</p>
        </div>
        <Link to="/events/new" className="btn btn-primary">+ New Event</Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-3)', borderRadius: 9, padding: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
              background: tab === t.value ? 'var(--surface)' : 'transparent',
              color: tab === t.value ? 'var(--text-1)' : 'var(--text-3)',
              boxShadow: tab === t.value ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 18 }}>
              <div className="shimmer" style={{ height: 6, borderRadius: 3, marginBottom: 16 }} />
              <div className="shimmer" style={{ height: 16, width: '70%', marginBottom: 10 }} />
              <div className="shimmer" style={{ height: 13, width: '50%', marginBottom: 6 }} />
              <div className="shimmer" style={{ height: 13, width: '40%' }} />
            </div>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
          <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 500, marginBottom: 6 }}>No events yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>Create your first event to get started</p>
          <Link to="/events/new" className="btn btn-primary">Create event</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {events?.map(event => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  )
}
