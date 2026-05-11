import { Link } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'
import { getStoredClub } from '@/lib/auth'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import type { EventStatus } from '@/types'

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="shimmer" style={{ height: 14, width: 80, marginBottom: 10 }} />
      <div className="shimmer" style={{ height: 32, width: 60 }} />
    </div>
  )
}

function PlanBanner({ plan, eventCount }: { plan: string; eventCount: number }) {
  if (plan !== 'free') return null

  const atLimit = eventCount >= 1

  return (
    <div style={{
      background: atLimit
        ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
        : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
      border: `1px solid ${atLimit ? '#fde68a' : '#bfdbfe'}`,
      borderRadius: 12, padding: '14px 20px', marginBottom: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: atLimit ? '#92400e' : '#1e40af', marginBottom: 3 }}>
          {atLimit ? '⚠ Free plan limit reached' : '🎉 You are on the Free plan'}
        </div>
        <div style={{ fontSize: 13, color: atLimit ? '#b45309' : '#2563eb' }}>
          {atLimit
            ? 'You have used your 1 free event. Upgrade to Club Pro to create unlimited events.'
            : `${1 - eventCount} free event remaining. Upgrade anytime to unlock unlimited events.`}
        </div>
      </div>
      <Link to="/pricing" style={{
        padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        background: atLimit ? '#d97706' : '#2563eb', color: 'white',
        textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        Upgrade →
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const club = getStoredClub()

  return (
    <div>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-label">Total Events</div>
              <div className="stat-value">{data?.stats.total_events ?? 0}</div>
              {club?.plan === 'free' && (
                <div className="stat-sub" style={{ color: (data?.stats.total_events ?? 0) >= 1 ? 'var(--warning)' : undefined }}>
                  {(data?.stats.total_events ?? 0) >= 1 ? 'Limit reached' : '1 free remaining'}
                </div>
              )}
            </div>
            <div className="stat-card">
              <div className="stat-label">Live Now</div>
              <div className="stat-value" style={{ color: (data?.stats.live_events ?? 0) > 0 ? 'var(--success)' : undefined }}>
                {data?.stats.live_events ?? 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Registrations</div>
              <div className="stat-value">{data?.stats.total_registrations ?? 0}</div>
            </div>
            <div className="stat-card" style={{ borderColor: (data?.stats.pending_approvals ?? 0) > 0 ? '#fcd34d' : undefined }}>
              <div className="stat-label">Pending Approvals</div>
              <div className="stat-value" style={{ color: (data?.stats.pending_approvals ?? 0) > 0 ? 'var(--warning)' : undefined }}>
                {data?.stats.pending_approvals ?? 0}
              </div>
              {(data?.stats.pending_approvals ?? 0) > 0 && (
                <div className="stat-sub" style={{ color: 'var(--warning)' }}>Needs attention</div>
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Recent events */}
        <div className="card">
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Recent Events</span>
            <Link to="/events" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="shimmer" style={{ flex: 1, height: 14 }} />
                  <div className="shimmer" style={{ width: 50, height: 20, borderRadius: 100 }} />
                </div>
              ))
            ) : !data?.recent_events?.length ? (
              <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>No events yet</p>
                <Link to="/events/new" className="btn btn-primary btn-sm">Create your first event</Link>
              </div>
            ) : (
              data.recent_events.map(event => (
                <Link key={event.id} to={`/events/${event.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', textDecoration: 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <div style={{
                    width: 6, height: 32, borderRadius: 3, flexShrink: 0,
                    background: (event as any).theme_color || 'var(--brand)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>
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
        <div className="card">
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Recent Registrations</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="shimmer" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="shimmer" style={{ height: 13, width: '60%', marginBottom: 6 }} />
                    <div className="shimmer" style={{ height: 11, width: '40%' }} />
                  </div>
                </div>
              ))
            ) : !data?.recent_registrations?.length ? (
              <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Registrations will appear here</p>
              </div>
            ) : (
              data.recent_registrations.map(reg => (
                <div key={reg.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: reg.status === 'approved' ? '#dcfce7' : reg.status === 'pending' ? '#fef9c3' : '#fee2e2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: reg.status === 'approved' ? '#16a34a' : reg.status === 'pending' ? '#ca8a04' : '#dc2626',
                    flexShrink: 0,
                  }}>
                    {reg.attendee_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {reg.attendee_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { to: '/events/new',  icon: '◈', label: 'Create Event',      sub: 'Launch a new event' },
          { to: '/volunteers',  icon: '◉', label: 'Manage Volunteers', sub: 'Add scanning volunteers' },
          { to: '/pricing',     icon: '✦', label: 'View Plans',        sub: 'Upgrade for more features' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
