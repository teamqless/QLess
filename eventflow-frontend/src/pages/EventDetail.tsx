import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEvent, usePublishEvent } from '@/hooks/useEvents'
import { useRegistrations, useApproveRegistration, useRejectRegistration, useResendQR, useBulkSendQR } from '@/hooks/useRegistrations'
import { useEventAnalytics, exportCSV } from '@/hooks/useDashboard'
import { useEventSocket } from '@/hooks/useSocket'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import type { EventStatus, RegistrationStatus } from '@/types'
import { Camera, RefreshCw, Download, Send, Globe, ChevronLeft, Search, Eye, CheckCircle2, XCircle, AlertCircle, Copy, ExternalLink, Ticket, MapPin, Users } from 'lucide-react'
import { AnimatedCounter } from '@/components/qless/AnimatedCounter'
import { StatusPill } from '@/components/qless/StatusPill'
import { AdminLayout } from '@/components/qless/AdminLayout'
import { MagneticButton } from '@/components/qless/MagneticButton'

// ── Live stat counter with animation ─────────────────────────────────────────
function AnimatedStat({ value, label, color, isPrimary }: { value: number; label: string; color?: string; isPrimary?: boolean }) {
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
  }, [value, display])

  return (
    <div className={`glass-strong rounded-3xl p-5 md:p-6 ring-glow flex flex-col justify-center relative overflow-hidden group transition-all duration-300 hover:bg-white/5`}>
      {isPrimary && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
      )}
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 relative z-10">{label}</div>
      <div className="text-4xl font-bold font-display relative z-10 tracking-tight" style={{ color: color || 'var(--color-foreground)' }}>{display}</div>
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
    <AdminLayout title="Event Details">
        <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-32 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-28 bg-white/5 rounded-3xl" />)}
        </div>
        <div className="h-64 bg-white/5 rounded-3xl" />
        </div>
    </AdminLayout>
  )
  if (!data) return <div className="text-destructive font-medium p-4 bg-destructive/10 rounded-xl">Event not found</div>

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
    <AdminLayout title="Event Details">
      <div className="max-w-7xl mx-auto pb-12 pt-4 md:pt-6 animate-fade-in-up">
        {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-xl text-sm font-medium text-white shadow-2xl animate-fade-in border flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-[#0a0a14] border-primary text-foreground' : toast.type === 'info' ? 'bg-[#0a0a14] border-blue-500 text-foreground' : 'bg-[#0a0a14] border-destructive text-destructive'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-primary" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
          {toast.type === 'info' && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
          {toast.msg}
        </div>
      )}

      {/* Image Modal */}
      {viewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fade-in" onClick={() => setViewImage(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img src={viewImage} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10" alt="Payment Screenshot" />
            <button className="absolute -top-4 -right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-foreground text-xl backdrop-blur-md transition-colors border border-white/20" onClick={() => setViewImage(null)}><XCircle className="w-6 h-6" /></button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="mb-6">
            <Link 
              to="/events" 
              className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all duration-300 group hover:scale-105"
              style={{
                color: event.theme_color || '#6366f1',
                backgroundColor: `${event.theme_color || '#6366f1'}15`,
                border: `1px solid ${event.theme_color || '#6366f1'}30`,
                boxShadow: `0 0 15px ${event.theme_color || '#6366f1'}10`
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" /> Back to Events
            </Link>
          </div>
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <h1 
              className="font-display font-bold text-5xl tracking-tight pb-1"
              style={{ 
                background: `linear-gradient(135deg, #ffffff 30%, ${event.theme_color || '#6366f1'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 25px ${event.theme_color || '#6366f1'}50)`
              }}
            >
              {event.title}
            </h1>
            <EventStatusBadge status={event.status as EventStatus} />
            {event.status === 'published' && (
              <span className="flex items-center gap-2 text-xs text-primary font-semibold bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {event.venue && <span className="text-sm font-medium text-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-muted-foreground" /> {event.venue}</span>}
            <span className="text-sm font-medium text-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5"><Ticket className="w-4 h-4 text-muted-foreground" /> {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}</span>
            {event.capacity && <span className="text-sm font-medium text-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5"><Users className="w-4 h-4 text-muted-foreground" /> {event.capacity} capacity</span>}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link to={`/scanner/login?event=${event.id}`} className="glass px-4 h-11 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-foreground"><Camera className="w-4 h-4 text-muted-foreground" /> Scanner</Link>
          {event.registration_type === 'sheet' && (
            <Link to={`/import?event=${event.id}`} className="glass px-4 h-11 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-foreground"><RefreshCw className="w-4 h-4 text-muted-foreground" /> Sync Sheet</Link>
          )}
          <button onClick={() => exportCSV(event.id, event.title)} className="glass px-4 h-11 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-foreground"><Download className="w-4 h-4 text-muted-foreground" /> Export CSV</button>
          
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
            className="glass px-4 h-11 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-foreground"
          >
            <Send className="w-4 h-4 text-muted-foreground" /> {bulkSendQR.isPending ? 'Sending...' : 'Send Pending QRs'}
          </button>

          <MagneticButton
            onClick={() => publishEvent.mutate()}
            disabled={publishEvent.isPending}
            className={`h-11 px-5 ${event.status === 'published' ? 'bg-transparent border border-white/20 hover:bg-white/5' : ''}`}
          >
            <Globe className="w-4 h-4 mr-2" />
            {event.status === 'published' ? 'Unpublish' : 'Publish Event'}
          </MagneticButton>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <AnimatedStat label="Total"       value={stats.total} />
        <AnimatedStat label="Pending"     value={stats.pending}  color={stats.pending > 0 ? '#eab308' : undefined} />
        <AnimatedStat label="Approved"    value={liveTotalApproved} color="#10b981" />
        <AnimatedStat label="Scanned in"  value={liveScannedIn} color="#6366f1" isPrimary />
        <AnimatedStat label="Not arrived" value={liveTotalApproved - liveScannedIn} />
      </div>

      {/* Capacity progress + registration link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Entry progress */}
        <div className="glass-strong rounded-3xl p-6 md:p-8 ring-glow flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entry Progress</span>
            <span className="text-3xl font-extrabold text-foreground font-display">{pct}%</span>
          </div>
          <div className="h-3 glass rounded-full overflow-hidden mb-3 p-0.5">
            <div className="h-full bg-gradient-to-r from-primary to-[#a855f7] rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span><span className="text-foreground">{liveScannedIn}</span> in</span>
            <span><span className="text-foreground">{liveTotalApproved - liveScannedIn}</span> remaining</span>
          </div>
        </div>

        {/* Registration link */}
        <div className="glass-strong rounded-3xl p-6 md:p-8 ring-glow flex flex-col justify-center">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Registration Link
          </div>
          {event.status === 'published' ? (
            event.registration_type === 'sheet' ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">This event uses Google Forms for registration. Share your Google Form link with attendees.</p>
                <Link to={`/import?event=${event.id}`} className="glass px-5 h-11 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-foreground w-max">
                  Configure Sync Settings <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 glass rounded-xl px-4 h-12 mb-4 overflow-hidden border-white/5">
                  <div className="text-sm text-foreground font-mono overflow-hidden text-ellipsis whitespace-nowrap opacity-80">
                    {regUrl}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { navigator.clipboard.writeText(regUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 h-11 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    {copiedLink ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                  </button>
                  <a href={regUrl} target="_blank" rel="noreferrer" className="flex-1 glass rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 h-11 text-foreground border border-white/10">
                    Open Page <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-2">
              <Globe className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <div className="text-sm text-muted-foreground">Publish the event to generate a public registration link</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent live scans (real-time) */}
      {recentScans.length > 0 && (
        <div className="glass-strong rounded-3xl p-6 ring-glow mb-8">
          <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full inline-block animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            Live Scans Activity
          </div>
          <div className="flex gap-3 flex-wrap">
            {recentScans.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-2.5 pr-4 transition-all hover:bg-white/10">
                <span className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {s.attendee?.name?.charAt(0)?.toUpperCase()}
                </span>
                <div>
                  <div className="font-semibold text-foreground text-sm tracking-tight">{s.attendee?.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> {new Date(s.scanned_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics chart */}
      {chartData.length > 1 && (
        <div className="glass-strong rounded-3xl p-6 md:p-8 ring-glow mb-8">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">Registrations Over Time</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 500 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}
                itemStyle={{ color: '#6366f1', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={3} fill="url(#regGrad)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Registrations table */}
      <div className="glass-strong rounded-3xl overflow-hidden ring-glow">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
            <span className="text-xl font-bold text-foreground font-display mr-2">Registrations</span>
            <div className="flex gap-1 bg-black/40 border border-white/5 rounded-xl p-1 overflow-x-auto scrollbar-hide">
              {STATUS_TABS.map(t => (
                <button key={t.value} onClick={() => setFilter(t.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                    statusFilter === t.value 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 w-full md:w-72 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10 shrink-0">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" placeholder="Search name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          {regsLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !registrations?.length ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Users className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <div className="text-foreground font-semibold mb-1">No registrations found</div>
              <div className="text-sm text-muted-foreground">Try adjusting your filters or search query.</div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 border-b border-white/10">
                <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Attendee</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">QR Code</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground tracking-tight">{reg.attendee_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{reg.attendee_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <EventStatusBadge status={reg.status as any} />
                    </td>
                    <td className="px-6 py-4">
                      {reg.payment_screenshot_url ? (
                        <button 
                          onClick={() => setViewImage(reg.payment_screenshot_url!)}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary glass px-3 py-2 rounded-lg border border-white/10 transition-all hover:border-primary/50"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Proof
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground bg-white/5 px-2.5 py-1 rounded-md">
                          {event.entry_fee === 0 ? 'Free' : 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {reg.qr_codes?.[0]?.scanned_at
                        ? <span className="text-xs font-semibold text-primary flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-md w-max"><CheckCircle2 className="w-3.5 h-3.5" /> Scanned in</span>
                        : reg.qr_codes?.[0]?.email_sent
                          ? <span className="text-xs font-medium text-foreground bg-white/10 px-2.5 py-1 rounded-md w-max">Sent to email</span>
                          : reg.status === 'approved'
                            ? <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" /> Generating…</span>
                            : <span className="text-xs font-medium text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {new Date(reg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        {reg.status === 'pending' && (
                          <>
                            <button onClick={() => { approve.mutate(reg.id); showToast(`Approving ${reg.attendee_name}…`, 'info') }}
                              disabled={approve.isPending} className="glass px-3 py-2 rounded-lg text-xs font-semibold text-green-400 hover:bg-green-400/10 hover:border-green-400/30 transition-colors flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => { setRejectId(reg.id); setReason('') }}
                              className="glass px-3 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {reg.status === 'approved' && reg.qr_codes?.[0] && (
                          <button onClick={() => { resendQR.mutate(reg.id); showToast('QR resent', 'success') }}
                            disabled={resendQR.isPending} className="glass px-3 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-white/10 transition-colors flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5" /> Resend QR
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4" 
             onClick={() => setRejectId(null)}>
          <div className="glass-strong rounded-3xl p-8 w-full max-w-sm ring-glow shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-foreground tracking-tight flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" /> Reject Registration
            </h3>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Reason <span className="opacity-50 lowercase normal-case">(optional)</span></label>
              <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-destructive focus-within:bg-white/10">
                <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={rejectReason} onChange={e => setReason(e.target.value)} placeholder="e.g. Payment unclear" autoFocus />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setRejectId(null)} className="flex-1 px-4 h-11 rounded-xl text-sm font-semibold text-foreground hover:bg-white/10 transition-colors border border-white/10">Cancel</button>
              <button onClick={handleReject} disabled={reject.isPending}
                className="flex-1 px-4 h-11 rounded-xl text-sm font-semibold bg-destructive hover:bg-destructive/90 text-white transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                {reject.isPending ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  )
}
