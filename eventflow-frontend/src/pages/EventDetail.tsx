import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEvent, usePublishEvent } from '@/hooks/useEvents'
import { useRegistrations, useApproveRegistration, useRejectRegistration, useResendQR, useBulkSendQR } from '@/hooks/useRegistrations'
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
    <div className="vc-card p-4">
      <div className="text-sm font-semibold text-ink-soft mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: color || 'var(--color-ink)' }}>{display}</div>
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
  const bulkSendQR = useBulkSendQR(id!)
  const [rejectId, setRejectId]    = useState<string | null>(null)
  const [rejectReason, setReason]  = useState('')
  const [copiedLink, setCopied]    = useState(false)
  const [liveStats, setLiveStats]  = useState<any>(null)
  const [recentScans, setScans]    = useState<any[]>([])
  const [toast, setToast]          = useState<{ msg: string; type: string } | null>(null)
  const [viewImage, setViewImage]  = useState<string | null>(null)

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

      {/* Image Modal */}
      {viewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setViewImage(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={viewImage} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border-4 border-white/10" alt="Payment Screenshot" />
            <button className="absolute -top-4 -right-4 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-xl backdrop-blur-md transition-colors border border-white/20" onClick={() => setViewImage(null)}>×</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="mb-2">
            <Link to="/events" className="text-sm text-ink-soft hover:text-ink transition-colors">← Events</Link>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-bold text-2xl text-ink">{event.title}</h1>
            <EventStatusBadge status={event.status as EventStatus} />
            {event.status === 'published' && (
              <span className="flex items-center gap-1.5 text-xs text-teal-deep font-semibold bg-teal-soft border border-teal/20 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-ink-soft mt-2">
            {event.venue && `${event.venue} · `}
            {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}
            {event.capacity && ` · ${event.capacity} capacity`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link to={`/scanner/login?event=${event.id}`} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5">📷 Scanner</Link>
          {event.registration_type === 'sheet' && (
            <Link to={`/import?event=${event.id}`} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5">🔄 Sync Sheet</Link>
          )}
          <button onClick={() => exportCSV(event.id, event.title)} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5">↓ Export CSV</button>
          
          <button 
            onClick={async () => {
              showToast('Sending QR codes...', 'info')
              try {
                const res = await bulkSendQR.mutateAsync()
                showToast(res.message, 'success')
              } catch (e: any) {
                showToast(e.response?.data?.error || 'Failed to send QR codes', 'error')
              }
            }}
            disabled={bulkSendQR.isPending}
            className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5"
          >
            {bulkSendQR.isPending ? 'Sending...' : '📨 Send Pending QRs'}
          </button>

          <button
            onClick={() => publishEvent.mutate()}
            disabled={publishEvent.isPending}
            className={`inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 shadow-sm text-sm px-4.5 py-2.5 ${event.status === 'published' ? 'bg-paper text-ink border border-line hover:bg-paper-dim' : 'bg-ink text-paper hover:bg-ink-soft'}`}>
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
        <div className="vc-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink-deep">Entry progress</span>
            <span className="text-2xl font-extrabold text-amber-deep">{pct}%</span>
          </div>
          <div className="h-2 bg-paper-dim rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber to-amber-deep rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-ink-soft">
            <span>{liveScannedIn} in</span>
            <span>{liveTotalApproved - liveScannedIn} remaining</span>
          </div>
        </div>

        {/* Registration link */}
        <div className="vc-card p-5">
          <div className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2">
            Registration Link
          </div>
          {event.status === 'published' ? (
            event.registration_type === 'sheet' ? (
              <div className="text-sm text-ink-soft">
                <p className="mb-2">This event uses Google Forms for registration.</p>
                <Link to={`/import?event=${event.id}`} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5">
                  Configure Google Sheet Sync ↗
                </Link>
              </div>
            ) : (
              <>
                <div className="text-sm text-ink-deep font-mono overflow-hidden text-ellipsis whitespace-nowrap mb-3">
                  {regUrl}
                </div>
                <div className="flex gap-2.5">
                  <button onClick={() => { navigator.clipboard.writeText(regUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5">
                    {copiedLink ? '✓ Copied' : 'Copy link'}
                  </button>
                  <a href={regUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5">
                    Open ↗
                  </a>
                </div>
              </>
            )
          ) : (
            <div className="text-sm text-ink-soft">Publish the event to get the registration link</div>
          )}
        </div>
      </div>

      {/* Recent live scans (real-time) */}
      {recentScans.length > 0 && (
        <div className="vc-card p-5 mb-6">
          <div className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-teal rounded-full inline-block animate-pulse" />
            Live scans
          </div>
          <div className="flex gap-2 flex-wrap">
            {recentScans.map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-paper-dim border border-line-soft rounded-lg py-1.5 px-3 text-sm">
                <span className="w-6 h-6 bg-teal-soft rounded-full flex items-center justify-center text-xs font-bold text-teal shrink-0">
                  {s.attendee?.name?.charAt(0)?.toUpperCase()}
                </span>
                <div>
                  <div className="font-medium text-ink leading-tight">{s.attendee?.name}</div>
                  <div className="text-[10px] text-ink-soft leading-tight">{new Date(s.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics chart */}
      {chartData.length > 1 && (
        <div className="vc-card p-5 mb-6">
          <div className="text-sm font-semibold text-ink mb-4">Registrations over time</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C05800" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C05800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                contentStyle={{ background: 'var(--color-paper)', border: '1px solid var(--color-line-soft)', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: 'var(--color-ink)', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="registrations" stroke="#C05800" strokeWidth={2} fill="url(#regGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Registrations table */}
      <div className="vc-card overflow-hidden">
        <div className="p-4 border-b border-line flex items-center gap-3 flex-wrap">
          <span className="text-base font-semibold text-ink mr-1">Registrations</span>
          <div className="flex gap-1 bg-paper-dim border border-line-soft rounded-lg p-1">
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  statusFilter === t.value 
                    ? 'bg-paper text-ink shadow-sm border border-line-soft' 
                    : 'text-ink-soft hover:text-ink'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          <input className="input w-full md:w-48 ml-auto text-sm" placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          {regsLoading ? (
            <div className="p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-11 rounded-md mb-2" />
              ))}
            </div>
          ) : !registrations?.length ? (
            <div className="py-10 text-center text-ink-soft text-sm">
              No registrations found
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-paper-dim border-b border-line">
                <tr className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Attendee</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">QR Code</th>
                  <th className="px-5 py-3 font-medium">Registered</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-paper-dim transition-colors duration-200">
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink">{reg.attendee_name}</div>
                      <div className="text-xs text-ink-soft">{reg.attendee_email}</div>
                    </td>
                    <td className="px-5 py-3"><EventStatusBadge status={reg.status as any} /></td>
                    <td className="px-5 py-3">
                      {reg.payment_screenshot_url ? (
                        <button 
                          onClick={() => setViewImage(reg.payment_screenshot_url!)}
                          className="flex items-center gap-1.5 text-sm text-ink font-medium hover:text-ink-deep bg-paper-dim px-2.5 py-1.5 rounded-md border border-line transition-all hover:shadow-sm"
                        >
                          <span>👁️</span> View
                        </button>
                      ) : (
                        <span className="text-sm text-ink-soft">
                          {event.entry_fee === 0 ? 'Free' : '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {reg.qr_codes?.[0]?.scanned_at
                        ? <span className="text-xs text-teal font-semibold">✓ Scanned in</span>
                        : reg.qr_codes?.[0]?.email_sent
                          ? <span className="text-xs text-ink-deep">Email sent</span>
                          : reg.status === 'approved'
                            ? <span className="text-xs text-ink-soft">Generating…</span>
                            : <span className="text-xs text-ink-soft">—</span>
                      }
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-soft">
                      {new Date(reg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {reg.status === 'pending' && (
                          <>
                            <button onClick={() => { approve.mutate(reg.id); showToast(`Approving ${reg.attendee_name}…`, 'info') }}
                              disabled={approve.isPending} className="inline-flex items-center justify-center font-display font-semibold rounded-lg transition-all duration-200 ease-out active:scale-95 bg-teal-soft text-teal border border-teal/20 hover:bg-teal/20 text-xs px-3 py-1.5">
                              Approve
                            </button>
                            <button onClick={() => { setRejectId(reg.id); setReason('') }}
                              className="inline-flex items-center justify-center font-display font-semibold rounded-lg transition-all duration-200 ease-out active:scale-95 bg-rust-soft text-rust border border-rust/20 hover:bg-rust/20 text-xs px-3 py-1.5">
                              Reject
                            </button>
                          </>
                        )}
                        {reg.status === 'approved' && reg.qr_codes?.[0] && (
                          <button onClick={() => { resendQR.mutate(reg.id); showToast('QR resent', 'success') }}
                            disabled={resendQR.isPending} className="inline-flex items-center justify-center font-display font-semibold rounded-lg transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim text-xs px-3 py-1.5">
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
          <div className="vc-card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-ink">Reject Registration</h3>
            <div>
              <label className="section-label block mb-1">Reason <span className="text-ink-soft font-normal">(optional)</span></label>
              <input className="input" value={rejectReason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Payment screenshot unclear" autoFocus />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setRejectId(null)} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5 flex-1">Cancel</button>
              <button onClick={handleReject} disabled={reject.isPending}
                className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-rust text-paper hover:bg-rust/90 shadow-sm text-sm px-4.5 py-2.5 flex-1">
                {reject.isPending ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
