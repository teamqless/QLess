// ============================================================
// pages/Dashboard.tsx — PHASE 2
// Club admin home page at /dashboard
// ============================================================
// TODO Phase 2:
// - Fetch GET /dashboard using useDashboard() hook
// - Show 4 stat cards: Total Events, Live Events, Total Registrations, Pending Approvals
// - Recent events list with status badges
// - Recent registrations list
// - Quick action: "Create New Event" button

import { useDashboard } from '@/hooks/useDashboard'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <div className="p-8 text-gray-500">Loading dashboard...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/events/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + New Event
        </Link>
      </div>

      {/* Stat cards — Phase 2: replace with real StatsCard components */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events',         value: data?.stats.total_events ?? 0 },
          { label: 'Live Events',          value: data?.stats.live_events ?? 0 },
          { label: 'Total Registrations',  value: data?.stats.total_registrations ?? 0 },
          { label: 'Pending Approvals',    value: data?.stats.pending_approvals ?? 0, alert: true },
        ].map(s => (
          <div key={s.label} className={`bg-white border rounded-xl p-5 ${s.alert && s.value > 0 ? 'border-amber-300' : ''}`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.alert && s.value > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent events — Phase 2: replace with EventCard components */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Events</h2>
        {data?.recent_events?.length === 0 && (
          <p className="text-gray-400 text-sm">No events yet. <Link to="/events/new" className="text-indigo-600">Create your first event →</Link></p>
        )}
        <div className="space-y-3">
          {data?.recent_events?.map(event => (
            <Link key={event.id} to={`/events/${event.id}`}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm text-gray-900">{event.title}</p>
                <p className="text-xs text-gray-400">{event.venue || 'No venue set'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                  event.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-100 text-blue-700'}`}>
                {event.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
