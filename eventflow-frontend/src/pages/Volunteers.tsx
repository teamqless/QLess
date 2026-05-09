import { useState } from 'react'
import { useVolunteers, useCreateVolunteer } from '@/hooks/useScanner'

export default function Volunteers() {
  const { data: volunteers, isLoading } = useVolunteers()
  const create = useCreateVolunteer()
  const [form, setForm]   = useState({ name: '', access_code: '', event_id: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await create.mutateAsync(form)
      setSuccess(`Volunteer "${form.name}" created with code ${form.access_code.toUpperCase()}`)
      setForm({ name: '', access_code: '', event_id: '' })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create volunteer')
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Volunteers</h1>
          <p className="page-subtitle">Manage gate scanning volunteers for your events</p>
        </div>
      </div>

      {/* Create form */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Add Volunteer</h2>
        {error   && <div style={{ background: 'var(--danger-bg)',  border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)',  marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 16 }}>{success}</div>}
        <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label className="label">Volunteer Name</label>
            <input className="input" name="name" value={form.name} onChange={handle} required placeholder="e.g. Rahul" />
          </div>
          <div>
            <label className="label">Access Code</label>
            <input className="input" name="access_code" value={form.access_code.toUpperCase()}
              onChange={handle} required placeholder="e.g. TECH-V1"
              style={{ fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
          </div>
          <div>
            <label className="label">Event ID <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
            <input className="input" name="event_id" value={form.event_id} onChange={handle} placeholder="Leave blank = all events" />
          </div>
          <button type="submit" disabled={create.isPending} className="btn btn-primary">
            {create.isPending ? '…' : 'Add'}
          </button>
        </form>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>
          Volunteers use their access code at <strong>/scanner/login</strong> to start scanning. Share the scanner URL with them.
        </p>
      </div>

      {/* Volunteers list */}
      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>All Volunteers</span>
        </div>
        {isLoading ? (
          <div style={{ padding: 20 }}>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 44, borderRadius: 6, marginBottom: 8 }} />)}
          </div>
        ) : !volunteers?.length ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
            No volunteers yet. Add your first volunteer above.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Access Code</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Scanner URL</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v: any) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 500 }}>{v.name}</td>
                  <td>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 5, border: '1px solid var(--border)' }}>
                      {v.access_code}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {v.event_id ? 'Specific event' : 'All events'}
                  </td>
                  <td>
                    <span className={`badge ${v.is_active ? 'badge-published' : 'badge-rejected'}`}>
                      {v.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/scanner/login${v.event_id ? `?event=${v.event_id}` : ''}`)}
                      className="btn btn-ghost btn-sm">
                      Copy link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
