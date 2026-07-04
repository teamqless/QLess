import { Link } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'
import { getStoredClub } from '@/lib/auth'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import type { EventStatus } from '@/types'

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="shimmer h-3.5 w-20 mb-2.5" />
      <div className="shimmer h-8 w-16" />
    </div>
  )
}

function PlanBanner({ plan, eventCount }: { plan: string; eventCount: number }) {
  if (plan !== 'free') return null

  const atLimit = eventCount >= 1

  return (
    <div className={`p-4 mb-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border shadow-sm ${atLimit
        ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-yellow-200'
        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
      }`}>
      <div>
        <div className={`text-sm font-semibold mb-1 ${atLimit ? 'text-amber-800' : 'text-blue-800'}`}>
          {atLimit ? '⚠ Free plan limit reached' : '🎉 You are on the Free plan'}
        </div>
        <div className={`text-sm ${atLimit ? 'text-amber-700' : 'text-blue-600'}`}>
          {atLimit
            ? 'You have used your 1 free event. Upgrade to Club Pro to create unlimited events.'
            : `${1 - eventCount} free event remaining. Upgrade anytime to unlock unlimited events.`}
        </div>
      </div>
      <Link to="/pricing" className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${atLimit ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
        Upgrade →
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const club = getStoredClub()

  return (
    <div className="w-full">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good to see you, {club?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your events</p>
        </div>
        <Link to="/events/new" className="btn btn-primary">+ New Event</Link>
      </div>

      {/* Plan banner */}
      {!isLoading && data && (
        <PlanBanner plan={club?.plan || 'free'} eventCount={data.stats.total_events} />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Events</div>
              <div className="stat-value">{data?.stats.total_events ?? 0}</div>
              {club?.plan === 'free' && (
                <div className={`stat-sub ${(data?.stats.total_events ?? 0) >= 1 ? 'text-warning font-medium' : ''}`}>
                  {(data?.stats.total_events ?? 0) >= 1 ? 'Limit reached' : '1 free remaining'}
                </div>
              )}
            </div>
            <div className="stat-card">
              <div className="stat-label">Live Now</div>
              <div className={`stat-value ${(data?.stats.live_events ?? 0) > 0 ? 'text-success bg-none' : ''}`}>
                {data?.stats.live_events ?? 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Registrations</div>
              <div className="stat-value">{data?.stats.total_registrations ?? 0}</div>
            </div>
            <div className={`stat-card ${(data?.stats.pending_approvals ?? 0) > 0 ? 'border-warning/50 bg-warning/5' : ''}`}>
              <div className="stat-label">Pending Approvals</div>
              <div className={`stat-value ${(data?.stats.pending_approvals ?? 0) > 0 ? 'text-warning bg-none' : ''}`}>
                {data?.stats.pending_approvals ?? 0}
              </div>
              {(data?.stats.pending_approvals ?? 0) > 0 && (
                <div className="stat-sub text-warning font-medium">Needs attention</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent events */}
        <div className="glass flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm font-semibold text-slate-900">Recent Events</span>
            <Link to="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">View all →</Link>
          </div>
          <div className="py-2 flex-1 overflow-y-auto max-h-[300px]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex gap-3 items-center">
                  <div className="shimmer flex-1 h-3.5" />
                  <div className="shimmer w-12 h-5 rounded-full" />
                </div>
              ))
            ) : !data?.recent_events?.length ? (
              <div className="p-8 text-center">
                <p className="text-sm text-text-3 mb-3">No events yet</p>
                <Link to="/events/new" className="btn btn-primary btn-sm">Create your first event</Link>
              </div>
            ) : (
              data.recent_events.map(event => (
                <Link key={event.id} to={`/events/${event.id}`}
                  className="flex items-center gap-3 px-5 py-3 text-decoration-none transition-colors hover:bg-slate-50 group">
                  <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: (event as any).theme_color || 'var(--brand)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-1 truncate group-hover:text-brand transition-colors">
                      {event.title}
                    </div>
                    <div className="text-xs text-text-3 mt-0.5 truncate">
                      {(event as any).entry_fee === 0 ? 'Free entry' : `₹${(event as any).entry_fee}`}
                      {event.venue ? ` · ${event.venue}` : ''}
                    </div>
                  </div>
                  <EventStatusBadge status={event.status as EventStatus} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent registrations */}
        <div className="glass flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <span className="text-sm font-semibold text-slate-900">Recent Registrations</span>
          </div>
          <div className="py-2 flex-1 overflow-y-auto max-h-[300px]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex gap-3 items-center">
                  <div className="shimmer w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <div className="shimmer h-3 w-3/5 mb-1.5" />
                    <div className="shimmer h-2.5 w-2/5" />
                  </div>
                </div>
              ))
            ) : !data?.recent_registrations?.length ? (
              <div className="p-8 text-center">
                <p className="text-sm text-text-3">Registrations will appear here</p>
              </div>
            ) : (
              data.recent_registrations.map(reg => (
                <div key={reg.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${reg.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      reg.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {reg.attendee_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-1 truncate">
                      {reg.attendee_name}
                    </div>
                    <div className="text-xs text-text-3 truncate">
                      {(reg as any).events?.title}
                    </div>
                  </div>
                  <span className={`badge badge-${reg.status}`}>{reg.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/events/new', icon: '◈', label: 'Create Event', sub: 'Launch a new event' },
          { to: '/volunteers', icon: '◉', label: 'Manage Volunteers', sub: 'Add scanning volunteers' },
          { to: '/pricing', icon: '✦', label: 'View Plans', sub: 'Upgrade for more features' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="text-decoration-none group">
            <div className="glass p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md bg-white">
              <div className="text-2xl mb-2 text-indigo-600 group-hover:scale-110 transition-all origin-left">{item.icon}</div>
              <div className="text-sm font-semibold text-slate-900 mb-1">{item.label}</div>
              <div className="text-xs text-slate-500">{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
