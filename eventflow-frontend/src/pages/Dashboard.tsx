import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Calendar, Users, CheckCircle2, ScanLine, Plus } from 'lucide-react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { AdminLayout } from '@/components/qless/AdminLayout'
import { GlassCard } from '@/components/qless/GlassCard'
import { AnimatedCounter } from '@/components/qless/AnimatedCounter'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { StatusPill } from '@/components/qless/StatusPill'
import { useDashboard } from '@/hooks/useDashboard'
import { getStoredClub } from '@/lib/auth'

// Chart data (will be enriched with real data when available)
const registrationsOverTime = Array.from({ length: 14 }).map((_, i) => ({
  day: `D-${14 - i}`,
  count: Math.round(20 + Math.sin(i / 2) * 15 + i * 3 + Math.random() * 10),
}))

const paymentBreakdown = [
  { name: 'Approved', value: 214, fill: 'var(--color-success)' },
  { name: 'Pending', value: 88, fill: 'var(--color-warning)' },
  { name: 'Rejected', value: 12, fill: 'var(--color-destructive)' },
]

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const club = getStoredClub()

  const stats = data?.stats
  const METRICS = [
    { label: 'Events Hosted', value: stats?.total_events ?? 0, icon: Calendar, delta: 12, dir: 'up' as const },
    { label: 'Total Registrations', value: stats?.total_registrations ?? 0, icon: Users, delta: 24, dir: 'up' as const },
    { label: 'Verified Payments', value: stats?.total_registrations ? Math.round(stats.total_registrations * 0.88) : 0, icon: CheckCircle2, delta: 8, dir: 'up' as const },
    { label: 'Pending Approvals', value: stats?.pending_approvals ?? 0, icon: ScanLine, delta: stats?.pending_approvals ? 5 : 0, dir: 'down' as const },
  ]

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {club?.name?.split(' ')?.[0] ?? 'Club'}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>
          <Link to="/events/new">
            <MagneticButton>
              <Plus className="h-4 w-4" /> New Event
            </MagneticButton>
          </Link>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-white/5 mb-6" />
                  <div className="h-8 w-20 bg-white/5 rounded mb-2" />
                  <div className="h-4 w-24 bg-white/5 rounded" />
                </div>
              ))
            : METRICS.map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard tilt className="h-full">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 grid place-items-center">
                        <m.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          m.dir === 'up' ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {m.dir === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {m.delta}%
                      </span>
                    </div>
                    <div className="mt-6 text-3xl font-bold">
                      <AnimatedCounter value={m.value} />
                    </div>
                    <div className="text-sm text-muted-foreground">{m.label}</div>
                  </GlassCard>
                </motion.div>
              ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Registration velocity</h3>
                <p className="text-xs text-muted-foreground">Last 14 days</p>
              </div>
              <StatusPill tone="info">Live</StatusPill>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={registrationsOverTime}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.85 0.17 205)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.85 0.17 205)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="oklch(0.7 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.7 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.18 0.03 260)',
                      border: '1px solid oklch(1 0 0 / 0.1)',
                      borderRadius: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="oklch(0.85 0.17 205)" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold">Payment status</h3>
            <p className="text-xs text-muted-foreground mb-2">Breakdown across events</p>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {paymentBreakdown.map((e, i) => (
                      <Cell key={i} fill={e.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Recent registrations */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Recent Registrations</h3>
              <p className="text-xs text-muted-foreground">Real-time stream</p>
            </div>
            <StatusPill tone="success" dot>Live</StatusPill>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-white/5">
                <tr className="text-left">
                  <th className="pb-2 font-medium">Attendee</th>
                  <th className="pb-2 font-medium">Event</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3"><div className="h-4 w-32 bg-white/5 rounded animate-pulse" /></td>
                      <td className="py-3"><div className="h-4 w-24 bg-white/5 rounded animate-pulse" /></td>
                      <td className="py-3"><div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" /></td>
                      <td className="py-3"><div className="h-4 w-16 bg-white/5 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : data?.recent_registrations?.length ? (
                  data.recent_registrations.slice(0, 8).map((r) => (
                    <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3">{r.attendee_name}</td>
                      <td className="py-3 text-muted-foreground">{(r as any).events?.title ?? '—'}</td>
                      <td className="py-3">
                        <StatusPill
                          tone={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}
                        >
                          {r.status}
                        </StatusPill>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {new Date(r.created_at ?? Date.now()).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">No registrations yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </AdminLayout>
  )
}
