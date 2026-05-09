import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEvent, usePublishEvent } from '@/hooks/useEvents'
import { useRegistrations, useApproveRegistration, useRejectRegistration, useResendQR } from '@/hooks/useRegistrations'
import { exportCSV } from '@/hooks/useDashboard'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import type { EventStatus, RegistrationStatus } from '@/types'

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading }      = useEvent(id!)
  const publishEvent             = usePublishEvent(id!)
  const [statusFilter, setFilter] = useState<RegistrationStatus | 'all'>('all')
  const [search, setSearch]      = useState('')
  const { data: registrations, isLoading: regsLoading } = useRegistrations(
    id!, statusFilter === 'all' ? undefined : statusFilter, search || undefined
  )
  const approve  = useApproveRegistration(id!)
  const reject   = useRejectRegistration(id!)
  const resendQR = useResendQR()
  const [rejectId, setRejectId]     = useState<string | null>(null)
  const [rejectReason, setReason]   = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="shimmer" style={{ height: 60, borderRadius: 10 }} />
      ))}
    </div>
  )
  if (!data) return <div style={{ color: 'var(--danger)', fontSize: 14 }}>Event not found</div>

  const { event, stats } = data
  const regUrl = `${window.location.origin}/register/${event.slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(regUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleReject = async () => {
    if (!rejectId) return
    await reject.mutateAsync({ id: rejectId, reason: rejectReason })
    setRejectId(null); setReason('')
  }

  const STATUS_TABS: { value: RegistrationStatus | 'all'; label: string }[] = [
    { value: 'all', label: `All (${stats.total})` },
    { value: 'pending', label: `Pending (${stats.pending})` },
    { value: 'approved', label: `Approved (${stats.approved})` },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Link to="/events" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none' }}>← Events</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title">{event.title}</h1>
              <EventStatusBadge status={event.status as EventStatus} />
            </div>
            <p className="page-subtitle">
              {event.venue && `${event.venue} · `}
              {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}
              {event.capacity && ` · ${event.capacity} capacity`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link to={`/scanner/login?event=${event.id}`} className="btn btn-ghost btn-sm">
              📷 Scanner
            </Link>
            <button onClick={() => exportCSV(event.id, event.title)} className="btn btn-ghost btn-sm">
              ↓ Export CSV
            </button>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total',         value: stats.total },
          { label: 'Pending',       value: stats.pending,   color: stats.pending > 0 ? 'var(--warning)' : undefined },
          { label: 'Approved',      value: stats.approved,  color: 'var(--success)' },
          { label: 'Scanned in',    value: stats.scanned },
          { label: 'Not arrived',   value: stats.approved - stats.scanned },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '14px 18px' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Registration link */}
      {event.status === 'published' && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1d4ed8', flexShrink: 0 }}>Registration link:</span>
          <span style={{ flex: 1, fontSize: 13, color: '#2563eb', fontFamily: 'DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {regUrl}
          </span>
          <button onClick={copyLink} className="btn btn-sm"
            style={{ background: '#2563eb', color: 'white', flexShrink: 0 }}>
            {copiedLink ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}

      {/* Registrations table */}
      <div className="card">
        {/* Table header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginRight: 8 }}>Registrations</span>

          {/* Status tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 7, padding: 3 }}>
            {STATUS_TABS.map(t => (
              <button key={t.value} onClick={() => setFilter(t.value)}
                style={{
                  padding: '4px 12px', borderRadius: 5, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: statusFilter === t.value ? 'var(--surface)' : 'transparent',
                  color: statusFilter === t.value ? 'var(--text-1)' : 'var(--text-3)',
                  boxShadow: statusFilter === t.value ? 'var(--shadow-sm)' : 'none',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input className="input" placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 200, marginLeft: 'auto', fontSize: 13 }} />
        </div>

        {/* Table */}
        <div className="table-container">
          {regsLoading ? (
            <div style={{ padding: 28 }}>
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
                          View screenshot ↗
                        </a>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                          {event.entry_fee === 0 ? 'Free' : '—'}
                        </span>
                      )}
                    </td>
                    <td>
                      {reg.qr_codes?.[0]?.scanned_at ? (
                        <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>✓ Scanned in</span>
                      ) : reg.qr_codes?.[0]?.email_sent ? (
                        <span style={{ fontSize: 12, color: '#2563eb' }}>Email sent</span>
                      ) : reg.status === 'approved' ? (
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Generating…</span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {new Date(reg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {reg.status === 'pending' && (
                          <>
                            <button onClick={() => approve.mutate(reg.id)} disabled={approve.isPending}
                              className="btn btn-success btn-sm">
                              Approve
                            </button>
                            <button onClick={() => { setRejectId(reg.id); setReason('') }}
                              className="btn btn-danger btn-sm">
                              Reject
                            </button>
                          </>
                        )}
                        {reg.status === 'approved' && reg.qr_codes?.[0] && (
                          <button onClick={() => resendQR.mutate(reg.id)} disabled={resendQR.isPending}
                            className="btn btn-ghost btn-sm">
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }} onClick={() => setRejectId(null)}>
          <div className="card" style={{ padding: 28, width: 400, maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Reject Registration</h3>
            <div>
              <label className="label">Reason <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <input className="input" value={rejectReason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Payment not verified" autoFocus />
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
