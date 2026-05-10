import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEvent, usePublishEvent } from '@/hooks/useEvents'
import { useRegistrations, useApproveRegistration, useRejectRegistration, useResendQR } from '@/hooks/useRegistrations'
import { useEventAnalytics, exportCSV } from '@/hooks/useDashboard'
import { useEventSocket } from '@/hooks/useSocket'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import type { EventStatus, RegistrationStatus } from '@/types'

// ── Live stat counter with animation ─────────────────────────────────────────
function AnimatedStat({ value, label, color }: { value: number; label: string; color?: string }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    if (value === prev.current) return
    prev.current = value
    const diff = value - display
    const steps = 12
    let step = 0
    const timer = setInterval(() => {
      step++
      setDisplay(Math.round(display + (diff * step) / steps))
      if (step >= steps) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="stat-card" style={{ padding: '14px 18px' }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ fontSize: 24, color }}>{display}</div>
    </div>
  )
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading }     = useEvent(id!)
  const publishEvent            = usePublishEvent(id!)
  const { data: analytics }     = useEventAnalytics(id!)
  const [statusFilter, setFilter] = useState<RegistrationStatus | 'all'>('all')
  const [search, setSearch]     = useState('')
  const { data: registrations, isLoading: regsLoading, refetch: refetchRegs } = useRegistrations(
    id!, statusFilter === 'all' ? undefined : statusFilter, search || undefined
  )
  const approve  = useApproveRegistration(id!)
  const reject   = useRejectRegistration(id!)
  const resendQR = useResendQR()
  const [rejectId, setRejectId]    = useState<string | null>(null)
  const [rejectReason, setReason]  = useState('')
  const [copiedLink, setCopied]    = useState(false)
  const [liveStats, setLiveStats]  = useState<any>(null)
  const [recentScans, setScans]    = useState<any[]>([])
  const [toast, setToast]          = useState<{ msg: string; type: string } | null>(null)

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Real-time WebSocket subscription ─────────────────────────────────────
  useEventSocket({
    eventId: id!,
    onLiveStats: (stats) => {
      setLiveStats(stats)
    },
    onScanResult: (scan) => {
      if (scan.result === 'success') {
        setScans(prev => [{
          ...scan,
          scanned_at: new Date().toISOString(),
        }, ...prev].slice(0, 10))
        showToast(`✓ ${scan.attendee?.name || 'Attendee'} scanned in`, 'success')
      }
    },
    onNewRegistration: (reg) => {
      refetchRegs()
      showToast(`New registration: ${reg.attendee_name}`, 'info')
    },
  })

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[80, 60, 400].map((h, i) => (
        <div key={i} className="shimmer" style={{ height: h, borderRadius: 12 }} />
      ))}
    </div>
  )
  if (!data) return <div style={{ color: 'var(--danger)', fontSize: 14 }}>Event not found</div>

  const { event, stats } = data
  const regUrl = `${window.location.origin}/register/${event.slug}`

  const liveScannedIn    = liveStats?.scanned_in    ?? stats.scanned
  const liveTotalApproved = liveStats?.total_approved ?? stats.approved
  const pct = liveTotalApproved > 0 ? Math.round((liveScannedIn / liveTotalApproved) * 100) : 0

  // Build chart data from analytics timeline
  const chartData = Object.entries(analytics?.timeline || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      registrations: count,
    }))

  const STATUS_TABS: { value: RegistrationStatus | 'all'; label: string }[] = [
    { value: 'all',      label: `All (${stats.total})` },
    { value: 'pending',  label: `Pending (${stats.pending})` },
    { value: 'approved', label: `Approved (${stats.approved})` },
    { value: 'rejected', label: 'Rejected' },
  ]

  const handleReject = async () => {
    if (!rejectId) return
    await reject.mutateAsync({ id: rejectId, reason: rejectReason })
    setRejectId(null); setReason('')
    showToast('Registration rejected')
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          background: toast.type === 'success' ? '#16a34a' : toast.type === 'info' ? '#2563eb' : '#dc2626',
          color: 'white', padding: '12px 20px', borderRadius: 10,
          fontSize: 14, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 6 }}>
              <Link to="/events" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>← Events</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="page-title">{event.title}</h1>
              <EventStatusBadge status={event.status as EventStatus} />
              {event.status === 'published' && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12, color: '#16a34a', fontWeight: 600,
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  padding: '3px 10px', borderRadius: 100,
                }}>
                  <span style={{ width: 6, height: 6, background: '#16a34a', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                  Live
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
                </span>
              )}
            </div>
            <p className="page-subtitle">
              {event.venue && `${event.venue} · `}
              {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}
              {event.capacity && ` · ${event.capacity} capacity`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            <Link to={`/scanner/login?event=${event.id}`} className="btn btn-ghost btn-sm">📷 Scanner</Link>
            <button onClick={() => exportCSV(event.id, event.title)} className="btn btn-ghost btn-sm">↓ Export CSV</button>
            <button
              onClick={() => publishEvent.mutate()}
              disabled={publishEvent.isPending}
              className={`btn btn-sm ${event.status === 'published' ? 'btn-ghost' : 'btn-primary'}`}>
              {event.status === 'published' ? 'Unpublish' : 'Publish Event'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        <AnimatedStat label="Total"       value={stats.total} />
        <AnimatedStat label="Pending"     value={stats.pending}  color={stats.pending > 0 ? 'var(--warning)' : undefined} />
        <AnimatedStat label="Approved"    value={liveTotalApproved} color="var(--success)" />
        <AnimatedStat label="Scanned in"  value={liveScannedIn} color="var(--brand)" />
        <AnimatedStat label="Not arrived" value={liveTotalApproved - liveScannedIn} />
      </div>

      {/* Capacity progress + registration link */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Entry progress */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Entry progress</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand)' }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              borderRadius: 100, transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>
            <span>{liveScannedIn} in</span>
            <span>{liveTotalApproved - liveScannedIn} remaining</span>
          </div>
        </div>

        {/* Registration link */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Registration Link
          </div>
          {event.status === 'published' ? (
            <>
              <div style={{ fontSize: 13, color: 'var(--brand)', fontFamily: 'DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 10 }}>
                {regUrl}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { navigator.clipboard.writeText(regUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  className="btn btn-primary btn-sm">
                  {copiedLink ? '✓ Copied' : 'Copy link'}
                </button>
                <a href={regUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                  Open ↗
                </a>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Publish the event to get the registration link</div>
          )}
        </div>
      </div>

      {/* Recent live scans (real-time) */}
      {recentScans.length > 0 && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, background: '#16a34a', borderRadius: '50%', display: 'inline-block' }} />
            Live scans
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {recentScans.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '7px 12px', fontSize: 13,
              }}>
                <span style={{ width: 26, height: 26, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>
                  {s.attendee?.name?.charAt(0)?.toUpperCase()}
                </span>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-1)' }}>{s.attendee?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(s.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics chart */}
      {chartData.length > 1 && (
        <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Registrations over time</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: 'var(--text-1)', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={2} fill="url(#regGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Registrations table */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginRight: 4 }}>Registrations</span>
          <div style={{ display: 'flex', gap: 3, background: 'var(--surface-2)', borderRadius: 7, padding: 3 }}>
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)}
                style={{
                  padding: '4px 11px', borderRadius: 5, fontSize: 12, fontWeight: 500,
                  border: 'none', cursor: 'pointer',
                  background: statusFilter === t.value ? 'var(--surface)' : 'transparent',
                  color: statusFilter === t.value ? 'var(--text-1)' : 'var(--text-3)',
                  boxShadow: statusFilter === t.value ? 'var(--shadow-sm)' : 'none',
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <input className="input" placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 200, marginLeft: 'auto', fontSize: 13 }} />
        </div>

        <div className="table-container">
          {regsLoading ? (
            <div style={{ padding: 20 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shimmer" style={{ height: 44, borderRadius: 6, marginBottom: 8 }} />
              ))}
            </div>
          ) : !registrations?.length ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
              No registrations found
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Attendee</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>QR Code</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{reg.attendee_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{reg.attendee_email}</div>
                    </td>
                    <td><span className={`badge badge-${reg.status}`}>{reg.status}</span></td>
                    <td>
                      {reg.payment_screenshot_url ? (
                        <a href={reg.payment_screenshot_url} target="_blank" rel="noreferrer"
                          style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
                          View ↗
                        </a>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                          {event.entry_fee === 0 ? 'Free' : '—'}
                        </span>
                      )}
                    </td>
                    <td>
                      {reg.qr_codes?.[0]?.scanned_at
                        ? <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✓ Scanned in</span>
                        : reg.qr_codes?.[0]?.email_sent
                          ? <span style={{ fontSize: 12, color: '#2563eb' }}>Email sent</span>
                          : reg.status === 'approved'
                            ? <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Generating…</span>
                            : <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>
                      }
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {new Date(reg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {reg.status === 'pending' && (
                          <>
                            <button onClick={() => { approve.mutate(reg.id); showToast(`Approving ${reg.attendee_name}…`, 'info') }}
                              disabled={approve.isPending} className="btn btn-success btn-sm">
                              Approve
                            </button>
                            <button onClick={() => { setRejectId(reg.id); setReason('') }}
                              className="btn btn-danger btn-sm">
                              Reject
                            </button>
                          </>
                        )}
                        {reg.status === 'approved' && reg.qr_codes?.[0] && (
                          <button onClick={() => { resendQR.mutate(reg.id); showToast('QR resent', 'success') }}
                            disabled={resendQR.isPending} className="btn btn-ghost btn-sm">
                            Resend QR
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setRejectId(null)}>
          <div className="card" style={{ padding: 28, width: 400, maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Reject Registration</h3>
            <div>
              <label className="label">Reason <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <input className="input" value={rejectReason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Payment screenshot unclear" autoFocus />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setRejectId(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleReject} disabled={reject.isPending}
                className="btn btn-danger" style={{ flex: 1 }}>
                {reject.isPending ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
