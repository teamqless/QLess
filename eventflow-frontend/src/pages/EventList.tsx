import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Calendar, MapPin, Copy, Settings2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/qless/AdminLayout'
import { GlassCard } from '@/components/qless/GlassCard'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { StatusPill } from '@/components/qless/StatusPill'
import { useEvents } from '@/hooks/useEvents'
import type { EventStatus } from '@/types'

type Filter = 'all' | 'published' | 'draft' | 'completed'

export default function EventList() {
  const [q, setQ] = useState('')
  const [f, setF] = useState<Filter>('all')
  const { data: events, isLoading } = useEvents(f === 'all' ? undefined : f as EventStatus)

  const filtered = (events ?? []).filter(
    (e) => e.title.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <AdminLayout title="My Events">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2 glass rounded-xl px-3 h-11">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events…"
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          {(['all', 'published', 'draft', 'completed'] as Filter[]).map((k) => (
            <button
              key={k}
              onClick={() => setF(k)}
              className={`h-9 px-4 rounded-lg text-xs capitalize transition-colors ${
                f === k ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <Link to="/events/new">
          <MagneticButton>
            <Plus className="h-4 w-4" /> Create Event
          </MagneticButton>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">◈</div>
          <p className="text-lg font-semibold mb-2">No events found</p>
          <p className="text-sm text-muted-foreground mb-6">Create your first event to get started</p>
          <Link to="/events/new">
            <MagneticButton>Create Event</MagneticButton>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e, i) => {
            const pct = Math.min(100, Math.round(((e as any).registered / ((e as any).capacity || 1)) * 100)) || 0
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard tilt className="p-0 overflow-hidden group h-full flex flex-col">
                  <div className="relative h-40 overflow-hidden">
                    {e.banner_url ? (
                      <img
                        src={e.banner_url}
                        alt={e.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/30 to-violet/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute top-3 left-3">
                      <StatusPill
                        tone={e.status === 'published' ? 'success' : e.status === 'draft' ? 'warning' : 'neutral'}
                        dot={e.status === 'published'}
                      >
                        {e.status}
                      </StatusPill>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg leading-tight">{e.title}</h3>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {e.event_date && <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(e.event_date).toLocaleDateString()}</div>}
                      {e.venue && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{e.venue}</div>}
                    </div>
                    {e.capacity && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Registered</span>
                          <span className="font-mono">{(e as any).registered ?? 0}/{(e as any).capacity}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-cyan"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="mt-auto pt-5 flex gap-2">
                      <Link to={`/events/${e.id}`} className="flex-1">
                        <MagneticButton variant="outline" size="sm" className="w-full">
                          <Settings2 className="h-3.5 w-3.5" /> Manage
                        </MagneticButton>
                      </Link>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(`${window.location.origin}/register/${e.slug ?? e.id}`)
                          toast.success('Registration link copied')
                        }}
                        className="h-9 w-9 grid place-items-center rounded-lg border border-white/10 hover:bg-white/5"
                        aria-label="Copy link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/register/${e.slug ?? e.id}`}
                        className="h-9 w-9 grid place-items-center rounded-lg border border-white/10 hover:bg-white/5"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
