import { useState } from 'react'
import { useVolunteers, useCreateVolunteer } from '@/hooks/useScanner'
import { useEvents } from '@/hooks/useEvents'
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export default function Volunteers() {
  const { data: volunteers, isLoading } = useVolunteers()
  const { data: events } = useEvents()
  const create = useCreateVolunteer()
  const qc     = useQueryClient()

  const [form, setForm]       = useState({ name: '', access_code: '', event_id: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const [copied, setCopied]   = useState<string | null>(null)

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      const payload = {
        name:        form.name.trim(),
        access_code: form.access_code.toUpperCase().trim(),
        event_id:    form.event_id || undefined,
      }
      await create.mutateAsync(payload)
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
    const base = window.location.origin
    const url  = vol.event_id
      ? `${base}/scanner/login?event=${vol.event_id}`
      : `${base}/scanner/login`
    navigator.clipboard.writeText(url)
    setCopied(`link-${vol.id}`)
    setTimeout(() => setCopied(null), 2500)
  }

  const copyEventId = (eventId: string) => {
    navigator.clipboard.writeText(eventId)
    setCopied(`eid-${eventId}`)
    setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div className="w-full">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-white tracking-tight mb-1">Volunteers</h1>
          <p className="page-subtitle text-sm text-gray-400">Create access codes for gate scanning volunteers</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 sm:p-5 mb-6 text-sm text-blue-200 leading-relaxed shadow-sm">
        <strong className="text-blue-300 font-semibold mb-2 block">How volunteer scanning works:</strong>
        <ol className="list-decimal pl-5 space-y-1.5 marker:text-blue-400">
          <li>Create a volunteer with a unique access code below</li>
          <li>Share the <strong className="text-blue-100">scanner link</strong> and their <strong className="text-blue-100">access code</strong> with them</li>
          <li>At the event, they open the link on any phone, enter their code, and start scanning</li>
          <li>Multiple volunteers / devices can use the same or different codes simultaneously</li>
        </ol>
      </div>

      {/* Event IDs quick reference */}
      {events && events.length > 0 && (
        <div className="card p-4 sm:p-5 mb-6">
          <div className="text-sm font-semibold text-white mb-3">
            Your Event IDs — share these with volunteers
          </div>
          <div className="flex flex-col gap-2.5">
            {events.filter((e: any) => e.status === 'published').map((event: any) => (
              <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 rounded-lg p-3 gap-3 border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white mb-0.5">{event.title}</div>
                  <div className="text-xs text-gray-400 font-mono">
                    {event.id}
                  </div>
                </div>
                <button
                  onClick={() => copyEventId(event.id)}
                  className="btn btn-ghost btn-sm whitespace-nowrap self-start sm:self-auto">
                  {copied === `eid-${event.id}` ? '✓ Copied' : 'Copy ID'}
                </button>
              </div>
            ))}
            {events.filter((e: any) => e.status === 'published').length === 0 && (
              <p className="text-sm text-gray-400">No published events yet. Publish an event to see its ID here.</p>
            )}
          </div>
        </div>
      )}

      {/* Create form */}
      <div className="card p-5 sm:p-6 mb-6">
        <h2 className="text-base font-semibold mb-4 text-white">Add Volunteer</h2>

        {error   && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 mb-4">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400 mb-4">{success}</div>}

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="label">Volunteer Name *</label>
              <input className="input" name="name" value={form.name}
                onChange={handle} required placeholder="e.g. Rahul Singh" />
            </div>
            <div>
              <label className="label">Access Code *</label>
              <input className="input font-mono uppercase tracking-widest" name="access_code"
                value={form.access_code.toUpperCase()} onChange={handle}
                required minLength={4} placeholder="e.g. TECH-V1" />
            </div>
            <div>
              <label className="label">Assign to Event <span className="text-gray-400 font-normal">(optional)</span></label>
              <select className="input cursor-pointer" name="event_id" value={form.event_id} onChange={handle}>
                <option value="">All events (club-wide)</option>
                {events?.filter((e: any) => e.status === 'published').map((event: any) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Leave event blank to give access to all your events.
            </p>
            <button type="submit" disabled={create.isPending} className="btn btn-primary w-full sm:w-auto">
              {create.isPending ? 'Adding…' : '+ Add Volunteer'}
            </button>
          </div>
        </form>
      </div>

      {/* Volunteers table — responsive */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <span className="text-sm font-semibold text-white">
            All Volunteers{volunteers?.length ? ` (${volunteers.length})` : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="shimmer h-12 rounded-lg" />)}
          </div>
        ) : !(volunteers as any[])?.length ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="text-4xl mb-3 text-gray-600">◉</div>
            <p className="text-sm text-gray-300 font-medium mb-1">No volunteers yet</p>
            <p className="text-xs text-gray-500">Add your first volunteer using the form above</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (visible only on small screens) */}
            <div className="block md:hidden divide-y divide-white/5">
              {(volunteers as any[]).map(v => (
                <div key={v.id} className={`p-4 ${v.is_active ? 'opacity-100' : 'opacity-60 grayscale-[0.2]'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-sm font-bold text-gray-300 shrink-0 border border-white/10">
                      {v.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{v.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{v.event_id ? 'Specific event' : 'All events'}</div>
                    </div>
                    <span className={`badge shrink-0 ${v.is_active ? 'badge-published' : 'badge-rejected'}`}>
                      {v.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs bg-black/40 px-2.5 py-1.5 rounded-md border border-white/5 text-gray-300 tracking-wider">
                      {v.access_code}
                    </span>
                    <button onClick={() => copyScannerLink(v)} className="btn btn-ghost btn-sm text-xs py-1.5">
                      {copied === `link-${v.id}` ? '✓ Copied' : 'Copy link'}
                    </button>
                    <button onClick={() => toggleActive(v.id, v.is_active)} disabled={toggling === v.id} className={`btn btn-sm text-xs py-1.5 ml-auto ${v.is_active ? 'btn-danger' : 'btn-success'}`}>
                      {toggling === v.id ? '…' : v.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.01]">
                    <th className="py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Name</th>
                    <th className="py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Access Code</th>
                    <th className="py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Scope</th>
                    <th className="py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Status</th>
                    <th className="py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Scanner Link</th>
                    <th className="py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(volunteers as any[]).map(v => (
                    <tr key={v.id} className={`hover:bg-white/[0.02] transition-colors ${v.is_active ? 'opacity-100' : 'opacity-60 grayscale-[0.2]'}`}>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-xs font-bold text-gray-300 border border-white/10">
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm text-gray-200">{v.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className="font-mono text-xs bg-black/40 px-2.5 py-1.5 rounded-md border border-white/5 text-gray-300 tracking-wider">
                          {v.access_code}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-sm text-gray-400">
                        {v.event_id ? 'Specific event' : 'All events'}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`badge ${v.is_active ? 'badge-published' : 'badge-rejected'}`}>
                          {v.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <button onClick={() => copyScannerLink(v)} className="btn btn-ghost btn-sm">
                          {copied === `link-${v.id}` ? '✓ Copied' : 'Copy link'}
                        </button>
                      </td>
                      <td className="py-3 px-5">
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
    </div>
  )
}
