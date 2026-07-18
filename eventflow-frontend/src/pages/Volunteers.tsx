import { useState } from 'react'
import { useVolunteers, useCreateVolunteer } from '@/hooks/useScanner'
import { useEvents } from '@/hooks/useEvents'
import api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

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
    <div className="w-full max-w-[820px] animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Volunteers</h1>
          <p className="text-sm text-ink-soft mt-1">Create access codes for gate scanning volunteers</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-amber-soft border border-amber/20 rounded-xl p-4 md:p-5 mb-6 text-sm text-amber-deep leading-relaxed">
        <strong className="text-sm">How volunteer scanning works:</strong>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Create a volunteer with a unique access code below</li>
          <li>Share the <strong>scanner link</strong> and their <strong>access code</strong> with them</li>
          <li>At the event, they open the link on any phone, enter their code, and start scanning</li>
          <li>Multiple volunteers / devices can scan simultaneously — no conflicts</li>
        </ol>
      </div>

      {/* Event IDs quick reference */}
      {events && (events as any[]).length > 0 && (
        <div className="vc-card p-5 mb-6">
          <div className="text-sm font-semibold text-ink mb-1">
            Your Events — copy the Event ID to share with volunteers
          </div>
          <p className="text-xs text-ink-soft mb-4 leading-relaxed">
            Volunteers need the Event ID to log into the scanner for a specific event.
            If you don't give them an ID, they can scan for all your events.
          </p>
          <div className="flex flex-col gap-2">
            {(events as any[]).map((event: any) => (
              <div key={event.id} className="flex flex-wrap items-center justify-between bg-paper-dim rounded-lg p-3 gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink flex items-center gap-2">
                    {event.title}
                    <Badge color={event.status === 'published' ? 'teal' : 'amber'}>{event.status}</Badge>
                  </div>
                  <div className="text-xs text-ink-faint font-mono mt-1 break-all">
                    {event.id}
                  </div>
                </div>
                <Button onClick={() => copyEventId(event.id)} variant="ghost" size="sm" className="shrink-0">
                  {copied === `eid-${event.id}` ? '✓ Copied' : 'Copy ID'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create form */}
      <div className="vc-card p-6 mb-6">
        <h2 className="text-[15px] font-semibold mb-4 text-ink">Add Volunteer</h2>

        {error   && <div className="bg-rust-soft border border-rust/20 rounded-lg p-3 text-sm text-rust mb-4">{error}</div>}
        {success && <div className="bg-teal-soft border border-teal/20 rounded-lg p-3 text-sm text-teal mb-4">{success}</div>}

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="section-label block mb-1">Volunteer Name *</label>
              <input className="input" name="name" value={form.name}
                onChange={handle} required placeholder="e.g. Rahul Singh" />
            </div>
            <div>
              <label className="section-label block mb-1">Access Code *</label>
              <input className="input font-mono uppercase tracking-wider" name="access_code"
                value={form.access_code.toUpperCase()} onChange={handle}
                required minLength={4} placeholder="e.g. TECH-V1" />
            </div>
            <div>
              <label className="section-label block mb-1">Assign to Event <span className="text-ink-faint font-normal">(optional)</span></label>
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

          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-ink-soft">
              Leave event blank to give access to all your events.
            </p>
            <Button type="submit" disabled={create.isPending} variant="accent">
              {create.isPending ? 'Adding…' : '+ Add Volunteer'}
            </Button>
          </div>
        </form>
      </div>

      {/* Volunteers list */}
      <div className="vc-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line">
          <span className="text-sm font-semibold text-ink">
            All Volunteers{(volunteers as any[])?.length ? ` (${(volunteers as any[]).length})` : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="p-5">
            {[1,2,3].map(i => <div key={i} className="skeleton h-[52px] rounded-lg mb-2" />)}
          </div>
        ) : !(volunteers as any[])?.length ? (
          <div className="py-10 px-5 text-center">
            <div className="text-3xl mb-2 text-ink-faint">◉</div>
            <p className="text-sm text-ink-soft font-medium mb-1">No volunteers yet</p>
            <p className="text-xs text-ink-faint">Add your first volunteer using the form above</p>
          </div>
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="block sm:hidden">
              {(volunteers as any[]).map(v => (
                <div key={v.id} className="p-4 border-b border-line" style={{ opacity: v.is_active ? 1 : 0.55 }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-paper-dim rounded-full flex items-center justify-center text-[13px] font-bold text-ink-soft">
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink">{v.name}</div>
                        <Badge color={v.is_active ? 'teal' : 'rust'}>{v.is_active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className="font-mono text-[13px] bg-paper-dim px-2.5 py-0.5 rounded-md border border-line">{v.access_code}</span>
                    <Button onClick={() => copyScannerLink(v)} variant="ghost" size="sm">{copied === `link-${v.id}` ? '✓ Copied' : 'Copy link'}</Button>
                    <Button onClick={() => toggleActive(v.id, v.is_active)} disabled={toggling === v.id} size="sm" variant={v.is_active ? 'secondary' : 'accent'}>
                      {toggling === v.id ? '…' : v.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-paper-dim text-xs font-semibold text-ink-soft uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Access Code</th>
                    <th className="px-5 py-3 font-medium">Assigned Event</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Scanner Link</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(volunteers as any[]).map(v => (
                    <tr key={v.id} className="hover:bg-paper-dim transition-colors" style={{ opacity: v.is_active ? 1 : 0.55 }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[30px] h-[30px] bg-paper-card border border-line rounded-full flex items-center justify-center text-xs font-bold text-ink-soft shrink-0">
                            {v.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm text-ink">{v.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-[13px] bg-paper-card px-2.5 py-0.5 rounded-md border border-line tracking-wide">
                          {v.access_code}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-ink-soft">
                        {v.event_id ? getEventTitle(v.event_id) : (
                          <span className="text-ink-faint">All events</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge color={v.is_active ? 'teal' : 'rust'}>
                          {v.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Button onClick={() => copyScannerLink(v)} variant="ghost" size="sm">
                          {copied === `link-${v.id}` ? '✓ Copied' : 'Copy link'}
                        </Button>
                      </td>
                      <td className="px-5 py-3">
                        <Button onClick={() => toggleActive(v.id, v.is_active)} disabled={toggling === v.id} size="sm" variant={v.is_active ? 'secondary' : 'accent'}>
                          {toggling === v.id ? '…' : v.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
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
