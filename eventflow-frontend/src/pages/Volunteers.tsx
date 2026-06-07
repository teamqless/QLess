import { useState } from 'react'
import { useVolunteers, useCreateVolunteer } from '@/hooks/useScanner'
import { useEvents } from '@/hooks/useEvents'
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export default function Volunteers() {
  const { data: volunteers, isLoading } = useVolunteers()
  // Fetch ALL events (draft + published) so clubs can assign to any event
  const { data: events } = useEvents()
  const create   = useCreateVolunteer()
  const qc       = useQueryClient()

  const [form, setForm]         = useState({ name: '', access_code: '', event_id: '' })
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const [copied, setCopied]     = useState<string | null>(null)

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await create.mutateAsync({
        name:        form.name.trim(),
        access_code: form.access_code.toUpperCase().trim(),
        event_id:    form.event_id || undefined,
      })
      setSuccess(`✓ Volunteer "${form.name}" created with code "${form.access_code.toUpperCase()}"`)
      setForm({ name: '', access_code: '', event_id: '' })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create volunteer')
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    setToggling(id)
    try {
      await api.patch(`/scanner/volunteers/${id}`, { is_active: !current })
      qc.invalidateQueries({ queryKey: ['volunteers'] })
    } finally { setToggling(null) }
  }

  const copyScannerLink = (vol: any) => {
    const url = vol.event_id
      ? `${window.location.origin}/scanner/login?event=${vol.event_id}`
      : `${window.location.origin}/scanner/login`
    navigator.clipboard.writeText(url)
    setCopied(`link-${vol.id}`)
    setTimeout(() => setCopied(null), 2500)
  }

  const copyEventId = (eventId: string) => {
    navigator.clipboard.writeText(eventId)
    setCopied(`eid-${eventId}`)
    setTimeout(() => setCopied(null), 2500)
  }

  const getEventTitle = (eventId: string) => {
    const event = (events as any[])?.find((e: any) => e.id === eventId)
    return event?.title || eventId.slice(0, 8) + '…'
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Volunteers</h1>
          <p className="page-subtitle">Create access codes for gate scanning volunteers</p>
        </div>
      </div>

      {/* How it works */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 24,
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 1.8,
      }}>
        <strong style={{ fontSize: 14 }}>How volunteer scanning works:</strong>
        <ol style={{ margin: '8px 0 0 18px', padding: 0 }}>
          <li>Create a volunteer with a unique access code below</li>
          <li>Share the <strong>scanner link</strong> and their <strong>access code</strong> with them</li>
          <li>At the event, they open the link on any phone, enter their code, and start scanning</li>
          <li>Multiple volunteers / devices can scan simultaneously — no conflicts</li>
        </ol>
      </div>

      {/* Event IDs quick reference */}
      {events && (events as any[]).length > 0 && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>
            Your Events — copy the Event ID to share with volunteers
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>
            Volunteers need the Event ID to log into the scanner for a specific event.
            If you don't give them an ID, they can scan for all your events.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(events as any[]).map((event: any) => (
              <div key={event.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--surface-2)', borderRadius: 8, padding: '10px 14px',
                flexWrap: 'wrap', gap: 10,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {event.title}
                    <span className={`badge badge-${event.status}`}>{event.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginTop: 3, wordBreak: 'break-all' }}>
                    {event.id}
                  </div>
                </div>
                <button onClick={() => copyEventId(event.id)} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                  {copied === `eid-${event.id}` ? '✓ Copied' : 'Copy ID'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create form */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18, color: 'var(--text-1)' }}>Add Volunteer</h2>

        {error   && <div style={{ background: 'var(--danger-bg)',  border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)',  marginBottom: 14 }}>{error}</div>}
        {success && <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 14 }}>{success}</div>}

        <form onSubmit={submit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14, marginBottom: 14,
          }}>
            <div>
              <label className="label">Volunteer Name *</label>
              <input className="input" name="name" value={form.name}
                onChange={handle} required placeholder="e.g. Rahul Singh" />
            </div>
            <div>
              <label className="label">Access Code *</label>
              <input className="input" name="access_code"
                value={form.access_code.toUpperCase()} onChange={handle}
                required minLength={4} placeholder="e.g. TECH-V1"
                style={{ fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
            </div>
            <div>
              <label className="label">Assign to Event <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <select className="input" name="event_id" value={form.event_id} onChange={handle}>
                <option value="">All events (club-wide)</option>
                {(events as any[])?.map((event: any) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({event.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Leave event blank to give access to all your events.
            </p>
            <button type="submit" disabled={create.isPending} className="btn btn-primary">
              {create.isPending ? 'Adding…' : '+ Add Volunteer'}
            </button>
          </div>
        </form>
      </div>

      {/* Volunteers list */}
      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
            All Volunteers{(volunteers as any[])?.length ? ` (${(volunteers as any[]).length})` : ''}
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: 20 }}>
            {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />)}
          </div>
        ) : !(volunteers as any[])?.length ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>◉</div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500, marginBottom: 4 }}>No volunteers yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Add your first volunteer using the form above</p>
          </div>
        ) : (
          <>
            {/* Mobile card layout */}
            <div style={{ display: 'none' }} className="mobile-volunteer-list">
              {(volunteers as any[]).map(v => (
                <div key={v.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', opacity: v.is_active ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: 'var(--surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{v.name}</div>
                        <span className={`badge ${v.is_active ? 'badge-published' : 'badge-rejected'}`}>{v.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>{v.access_code}</span>
                    <button onClick={() => copyScannerLink(v)} className="btn btn-ghost btn-sm">{copied === `link-${v.id}` ? '✓ Copied' : 'Copy link'}</button>
                    <button onClick={() => toggleActive(v.id, v.is_active)} disabled={toggling === v.id} className={`btn btn-sm ${v.is_active ? 'btn-danger' : 'btn-success'}`}>
                      {toggling === v.id ? '…' : v.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="table-container desktop-volunteer-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Access Code</th>
                    <th>Assigned Event</th>
                    <th>Status</th>
                    <th>Scanner Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(volunteers as any[]).map(v => (
                    <tr key={v.id} style={{ opacity: v.is_active ? 1 : 0.55 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, background: 'var(--surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-2)', flexShrink: 0 }}>
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-1)' }}>{v.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', letterSpacing: '0.05em' }}>
                          {v.access_code}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-2)' }}>
                        {v.event_id ? getEventTitle(v.event_id) : (
                          <span style={{ color: 'var(--text-3)' }}>All events</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${v.is_active ? 'badge-published' : 'badge-rejected'}`}>
                          {v.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => copyScannerLink(v)} className="btn btn-ghost btn-sm">
                          {copied === `link-${v.id}` ? '✓ Copied' : 'Copy link'}
                        </button>
                      </td>
                      <td>
                        <button onClick={() => toggleActive(v.id, v.is_active)} disabled={toggling === v.id}
                          className={`btn btn-sm ${v.is_active ? 'btn-danger' : 'btn-success'}`}>
                          {toggling === v.id ? '…' : v.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .mobile-volunteer-list { display: block !important; }
          .desktop-volunteer-table { display: none !important; }
        }
      `}</style>
    </div>
  )
}
