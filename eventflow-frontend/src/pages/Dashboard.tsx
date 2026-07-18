import { Link } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'
import { getStoredClub } from '@/lib/auth'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import type { EventStatus } from '@/types'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

function SkeletonCard() {
  return (
    <div className="vc-card p-5">
      <div className="skeleton h-3.5 w-20 mb-2.5" />
      <div className="skeleton h-8 w-16" />
    </div>
  )
}

function PlanBanner({ plan, eventCount }: { plan: string; eventCount: number }) {
  if (plan !== 'free') return null

  const atLimit = eventCount >= 1

  return (
    <div className={`vc-card p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${atLimit
        ? 'bg-rust-soft border-rust/20'
        : 'bg-amber-soft border-amber/20'
      }`}>
      <div>
        <div className={`text-sm font-display font-semibold mb-1 ${atLimit ? 'text-rust' : 'text-amber-deep'}`}>
          {atLimit ? '⚠ Free plan limit reached' : '🎉 You are on the Free plan'}
        </div>
        <div className={`text-sm ${atLimit ? 'text-rust/80' : 'text-amber-deep/80'}`}>
          {atLimit
            ? 'You have used your 1 free event. Upgrade to Club Pro to create unlimited events.'
            : `${1 - eventCount} free event remaining. Upgrade anytime to unlock unlimited events.`}
        </div>
      </div>
      <Link to="/pricing" className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5 whitespace-nowrap shrink-0">
        Upgrade →
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const club = getStoredClub()

  return (
    <div className="w-full animate-page-enter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Good to see you, {club?.name?.split(' ')?.[0]} 👋</h1>
          <p className="text-sm text-ink-soft mt-1">Here's what's happening with your events</p>
        </div>
        <Link to="/events/new" className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5">
          + New Event
        </Link>
      </div>

      {/* Plan banner */}
      {!isLoading && data && (
        <PlanBanner plan={club?.plan || 'free'} eventCount={data?.stats?.total_events ?? 0} />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="vc-card p-5">
              <div className="section-label mb-1">Total Events</div>
              <div className="font-display font-bold text-3xl text-ink">{data?.stats.total_events ?? 0}</div>
              {club?.plan === 'free' && (
                <div className={`text-xs mt-1 ${(data?.stats.total_events ?? 0) >= 1 ? 'text-rust font-medium' : 'text-ink-soft'}`}>
                  {(data?.stats.total_events ?? 0) >= 1 ? 'Limit reached' : '1 free remaining'}
                </div>
              )}
            </div>
            <div className="vc-card p-5">
              <div className="section-label mb-1">Live Now</div>
              <div className={`font-display font-bold text-3xl ${(data?.stats.live_events ?? 0) > 0 ? 'text-teal' : 'text-ink'}`}>
                {data?.stats.live_events ?? 0}
              </div>
            </div>
            <div className="vc-card p-5">
              <div className="section-label mb-1">Total Registrations</div>
              <div className="font-display font-bold text-3xl text-ink">{data?.stats.total_registrations ?? 0}</div>
            </div>
            <div className={`vc-card p-5 ${(data?.stats.pending_approvals ?? 0) > 0 ? 'border-rust/30 bg-rust-soft/50' : ''}`}>
              <div className="section-label mb-1">Pending Approvals</div>
              <div className={`font-display font-bold text-3xl ${(data?.stats.pending_approvals ?? 0) > 0 ? 'text-rust' : 'text-ink'}`}>
                {data?.stats.pending_approvals ?? 0}
              </div>
              {(data?.stats.pending_approvals ?? 0) > 0 && (
                <div className="text-xs mt-1 text-rust font-medium">Needs attention</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent events */}
        <div className="vc-card flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-line-soft flex items-center justify-between bg-paper-dim">
            <span className="text-sm font-semibold text-ink">Recent Events</span>
            <Link to="/events" className="text-sm font-medium text-amber-deep hover:text-amber transition-colors">View all →</Link>
          </div>
          <div className="py-2 flex-1 overflow-y-auto max-h-[300px]">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex gap-3 items-center">
                  <div className="skeleton flex-1 h-3.5" />
                  <div className="skeleton w-12 h-5 rounded-full" />
                </div>
              ))
            ) : !data?.recent_events?.length ? (
              <div className="p-8 text-center">
                <p className="text-sm text-ink-faint mb-3">No events yet</p>
                <Link to="/events/new" className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-xs px-3.5 py-1.5">Create your first event</Link>
              </div>
            ) : (
              data.recent_events.map(event => (
                <Link key={event.id} to={`/events/${event.id}`}
                  className="flex items-center gap-3 px-5 py-3 text-decoration-none transition-colors hover:bg-paper-dim group">
                  <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: (event as any).theme_color || 'var(--color-amber)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate group-hover:text-amber-deep transition-colors">
                      {event.title}
                    </div>
                    <div className="text-xs text-ink-faint mt-0.5 truncate">
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
        <div className="vc-card flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-line-soft bg-paper-dim">
            <span className="text-sm font-semibold text-ink">Recent Registrations</span>
          </div>
          <div className="py-2 flex-1 overflow-y-auto max-h-[300px]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex gap-3 items-center">
                  <div className="skeleton w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <div className="skeleton h-3 w-3/5 mb-1.5" />
                    <div className="skeleton h-2.5 w-2/5" />
                  </div>
                </div>
              ))
            ) : !data?.recent_registrations?.length ? (
              <div className="p-8 text-center">
                <p className="text-sm text-ink-faint">Registrations will appear here</p>
              </div>
            ) : (
              data.recent_registrations.map(reg => (
                <div key={reg.id} className="flex items-center gap-3 px-5 py-3 hover:bg-paper-dim transition-colors">
                  <Avatar name={reg.attendee_name} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate">
                      {reg.attendee_name}
                    </div>
                    <div className="text-xs text-ink-faint truncate">
                      {(reg as any).events?.title}
                    </div>
                  </div>
                  <Badge color={reg.status === 'approved' ? 'teal' : reg.status === 'pending' ? 'amber' : 'rust'}>
                    {reg.status}
                  </Badge>
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
            <div className="vc-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover bg-paper-card">
              <div className="text-2xl mb-2 text-amber-deep group-hover:scale-110 transition-all origin-left">{item.icon}</div>
              <div className="text-sm font-semibold text-ink mb-1">{item.label}</div>
              <div className="text-xs text-ink-soft">{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
