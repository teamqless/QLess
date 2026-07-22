import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { KeyRound, RefreshCw, Copy } from 'lucide-react'
import { AdminLayout } from '@/components/qless/AdminLayout'
import { GlassCard } from '@/components/qless/GlassCard'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { StatusPill } from '@/components/qless/StatusPill'
import { useVolunteers } from '@/hooks/useVolunteers'
import { useEvents } from '@/hooks/useEvents'
import api from '@/lib/api'

export default function Volunteers() {
  const { data: events } = useEvents()
  const { data: vols, refetch } = useVolunteers()
  const [name, setName] = useState('')
  const [eventId, setEventId] = useState('')
  const [code, setCode] = useState('')
  const [creating, setCreating] = useState(false)

  const gen = () => setCode(String(Math.floor(1000 + Math.random() * 9000)))

  const create = async () => {
    if (!name.trim() || !code || !eventId) {
      toast.error('Name, event and code are required')
      return
    }
    setCreating(true)
    try {
      await api.post('/volunteers', { name, event_id: eventId, access_code: code })
      toast.success('Volunteer created')
      setName('')
      setCode('')
      refetch?.()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create volunteer')
    } finally {
      setCreating(false)
    }
  }

  const toggle = async (id: string, currentStatus: string) => {
    try {
      await api.patch(`/volunteers/${id}`, { status: currentStatus === 'active' ? 'revoked' : 'active' })
      refetch?.()
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <AdminLayout title="Volunteers">
      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        <GlassCard>
          <h3 className="font-semibold flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> Generate Access Code
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Create a 4-digit passcode assigned to an event.</p>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs text-muted-foreground">Volunteer name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full glass rounded-xl h-11 px-3 text-sm bg-transparent outline-none"
                placeholder="e.g. Riya Sharma"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Assigned event</span>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="mt-1.5 w-full glass rounded-xl h-11 px-3 text-sm bg-transparent outline-none"
              >
                <option value="" className="bg-background">Select an event</option>
                {(events ?? []).map((e) => (
                  <option key={e.id} value={e.id} className="bg-background">
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="text-xs text-muted-foreground">4-digit passcode</span>
              <div className="mt-1.5 flex gap-2">
                <div className="flex-1 glass rounded-xl h-14 grid grid-cols-4 gap-2 p-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-white/10 grid place-items-center text-2xl font-mono font-bold"
                    >
                      {code[i] ?? ''}
                    </div>
                  ))}
                </div>
                <button onClick={gen} className="h-14 w-14 grid place-items-center glass rounded-xl hover:bg-white/10">
                  <RefreshCw className="h-4 w-4" />
                </button>
                {code && (
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(code)
                      toast.success('Code copied')
                    }}
                    className="h-14 w-14 grid place-items-center glass rounded-xl hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <MagneticButton onClick={create} loading={creating} className="w-full">Create Volunteer</MagneticButton>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold">Active Volunteers</h3>
          <p className="text-xs text-muted-foreground mt-1">Revoke access instantly with the toggle.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-white/5">
                <tr className="text-left">
                  <th className="pb-2 font-medium">Volunteer</th>
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium">Event</th>
                  <th className="pb-2 font-medium">Scans</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(vols ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No volunteers yet</td>
                  </tr>
                ) : (
                  (vols ?? []).map((v: any) => (
                    <motion.tr key={v.id} layout className="border-b border-white/5 last:border-0">
                      <td className="py-3">{v.name}</td>
                      <td className="py-3 font-mono">{v.access_code}</td>
                      <td className="py-3 text-muted-foreground">{v.events?.title ?? '—'}</td>
                      <td className="py-3 font-mono">{v.scan_count ?? 0}</td>
                      <td className="py-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <span
                            className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                              v.status === 'active' ? 'bg-success' : 'bg-white/10'
                            }`}
                          >
                            <motion.span
                              layout
                              className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
                              animate={{ x: v.status === 'active' ? 18 : 2 }}
                            />
                          </span>
                          <StatusPill tone={v.status === 'active' ? 'success' : 'neutral'}>{v.status}</StatusPill>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={v.status === 'active'}
                            onChange={() => toggle(v.id, v.status)}
                          />
                        </label>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AdminLayout>
  )
}
