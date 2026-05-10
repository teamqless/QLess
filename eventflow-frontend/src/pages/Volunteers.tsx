import { useState } from 'react'
import { useVolunteers, useCreateVolunteer } from '@/hooks/useScanner'
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export default function Volunteers() {
  const { data: volunteers, isLoading } = useVolunteers()
  const create = useCreateVolunteer()
  const qc     = useQueryClient()

  const [form, setForm]       = useState({ name: '', access_code: '', event_id: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const [copied, setCopied]   = useState<string | null>(null)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await create.mutateAsync({ ...form, access_code: form.access_code.toUpperCase(), event_id: form.event_id || undefined })
      setSuccess(`Volunteer "${form.name}" created with code ${form.access_code.toUpperCase()}`)
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

  const copyLink = (vol: any) => {
    const url = vol.event_id
      ? `${window.location.origin}/scanner/login?event=${vol.event_id}`
      : `${window.location.origin}/scanner/login`
    navigator.clipboard.writeText(url)
    setCopied(vol.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Volunteers</h1>
          <p className="page-subtitle">Create access codes for gate scanning volunteers</p>
        </div>
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
        <strong>How it works:</strong> Create a volunteer with a unique access code → share the scanner link → they open it on any phone at the event → enter code + event ID → start scanning QR codes. No app install needed.
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18, color: 'var(--text-1)' }}>Add Volunteer</h2>
        {error   && <div style={{ background: 'var(--danger-bg)',  border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)',  marginBottom: 14 }}>{error}</div>}
        {success && <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 14 }}>{success}</div>}
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="label">Name</label>
              <input className="input" name="name" value={form.name} onChange={handle} required placeholder="e.g. Rahul Singh" />
            </div>
            <div>
              <label className="label">Access Code</label>
              <input className="input" name="access_code" value={form.access_code.toUpperCase()} onChange={handle} required minLength={4} placeholder="e.g. TECH-V1" style={{ fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
            </div>
            <div>
              <label className="label">Event ID <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <input className="input" name="event_id" value={form.event_id} onChange={handle} placeholder="Blank = all events" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Paste the event ID from the event detail page to restrict to one event.</p>
            <button type="submit" disabled={create.isPending} className="btn btn-primary">
              {create.isPending ? 'Adding…' : '+ Add Volunteer'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
            All Volunteers{volunteers?.length ? ` (${volunteers.length})` : ''}
          </span>
        </div>
        {isLoading ? (
          <div style={{ padding: 20 }}>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />)}
          </div>
        ) : !volunteers?.length ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>◉</div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500, marginBottom: 4 }}>No volunteers yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Add your first volunteer above</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Access Code</th>
                <th>Scope</th>
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
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{v.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', letterSpacing: '0.05em' }}>
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
                    <button onClick={() => copyLink(v)} className="btn btn-ghost btn-sm">
                      {copied === v.id ? '✓ Copied' : 'Copy link'}
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
        )}
      </div>
    </div>
  )
}
