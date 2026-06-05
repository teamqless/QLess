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
    <div className="stat-card p-4">
      <div className="stat-label">{label}</div>
      <div className="stat-value text-2xl" style={{ color }}>{display}</div>
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
    <div className="flex flex-col gap-4">
      {[80, 60, 400].map((h, i) => (
        <div key={i} className="shimmer rounded-xl" style={{ height: h }} />
      ))}
    </div>
  )
  if (!data) return <div className="text-danger text-sm">Event not found</div>

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
    <div className="max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3 rounded-xl text-sm font-medium text-white shadow-lg animate-fade-in ${
          toast.type === 'success' ? 'bg-success' : toast.type === 'info' ? 'bg-blue-600' : 'bg-danger'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="mb-2">
            <Link to="/events" className="text-sm text-text-3 hover:text-text-2 transition-colors">← Events</Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{event.title}</h1>
            <EventStatusBadge status={event.status as EventStatus} />
            {event.status === 'published' && (
              <span className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="page-subtitle mt-2">
            {event.venue && `${event.venue} · `}
            {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}
            {event.capacity && ` · ${event.capacity} capacity`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
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

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <AnimatedStat label="Total"       value={stats.total} />
        <AnimatedStat label="Pending"     value={stats.pending}  color={stats.pending > 0 ? 'var(--warning)' : undefined} />
        <AnimatedStat label="Approved"    value={liveTotalApproved} color="var(--success)" />
        <AnimatedStat label="Scanned in"  value={liveScannedIn} color="var(--brand)" />
        <AnimatedStat label="Not arrived" value={liveTotalApproved - liveScannedIn} />
      </div>

      {/* Capacity progress + registration link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Entry progress */}
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-2">Entry progress</span>
            <span className="text-2xl font-extrabold text-brand">{pct}%</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand to-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-3">
            <span>{liveScannedIn} in</span>
            <span>{liveTotalApproved - liveScannedIn} remaining</span>
          </div>
        </div>

        {/* Registration link */}
        <div className="glass p-5">
          <div className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-2">
            Registration Link
          </div>
          {event.status === 'published' ? (
            <>
              <div className="text-sm text-brand font-mono overflow-hidden text-ellipsis whitespace-nowrap mb-3">
                {regUrl}
              </div>
              <div className="flex gap-2.5">
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
            <div className="text-sm text-text-3">Publish the event to get the registration link</div>
          )}
        </div>
      </div>

      {/* Recent live scans (real-time) */}
      {recentScans.length > 0 && (
        <div className="glass p-5 mb-6">
          <div className="text-sm font-semibold text-text-1 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-success rounded-full inline-block animate-pulse" />
            Live scans
          </div>
          <div className="flex gap-2 flex-wrap">
            {recentScans.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/50 border border-border/50 rounded-lg py-1.5 px-3 text-sm">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-success shrink-0">
                  {s.attendee?.name?.charAt(0)?.toUpperCase()}
                </span>
                <div>
                  <div className="font-medium text-text-1 leading-tight">{s.attendee?.name}</div>
                  <div className="text-[10px] text-text-3 leading-tight">{new Date(s.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics chart */}
      {chartData.length > 1 && (
        <div className="glass p-5 mb-6">
          <div className="text-sm font-semibold text-text-1 mb-4">Registrations over time</div>
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
      <div className="glass overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center gap-3 flex-wrap bg-white/40">
          <span className="text-base font-semibold text-text-1 mr-1">Registrations</span>
          <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                  statusFilter === t.value 
                    ? 'bg-white text-text-1 shadow-sm' 
                    : 'text-text-3 hover:text-text-2'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          <input className="input w-full md:w-48 ml-auto text-sm bg-white/50" placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="table-container border-none shadow-none bg-transparent">
          {regsLoading ? (
            <div className="p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shimmer h-11 rounded-md mb-2" />
              ))}
            </div>
          ) : !registrations?.length ? (
            <div className="py-10 text-center text-text-3 text-sm">
              No registrations found
            </div>
          ) : (
            <table>
              <thead className="bg-white/30">
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
                  <tr key={reg.id} className="hover:bg-white/40">
                    <td>
                      <div className="font-medium text-text-1">{reg.attendee_name}</div>
                      <div className="text-xs text-text-3">{reg.attendee_email}</div>
                    </td>
                    <td><span className={`badge badge-${reg.status}`}>{reg.status}</span></td>
                    <td>
                      {reg.payment_screenshot_url ? (
                        <a href={reg.payment_screenshot_url} target="_blank" rel="noreferrer"
                          className="text-sm text-brand font-medium hover:underline">
                          View ↗
                        </a>
                      ) : (
                        <span className="text-sm text-text-3">
                          {event.entry_fee === 0 ? 'Free' : '—'}
                        </span>
                      )}
                    </td>
                    <td>
                      {reg.qr_codes?.[0]?.scanned_at
                        ? <span className="text-xs text-success font-semibold">✓ Scanned in</span>
                        : reg.qr_codes?.[0]?.email_sent
                          ? <span className="text-xs text-blue-600">Email sent</span>
                          : reg.status === 'approved'
                            ? <span className="text-xs text-text-3">Generating…</span>
                            : <span className="text-xs text-text-3">—</span>
                      }
                    </td>
                    <td className="text-xs text-text-3">
                      {new Date(reg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4" 
             onClick={() => setRejectId(null)}>
          <div className="glass-panel p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-text-1">Reject Registration</h3>
            <div>
              <label className="label">Reason <span className="text-text-3 font-normal">(optional)</span></label>
              <input className="input" value={rejectReason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Payment screenshot unclear" autoFocus />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setRejectId(null)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={handleReject} disabled={reject.isPending}
                className="btn btn-danger flex-1">
                {reject.isPending ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
