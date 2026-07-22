import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  Mail,
  FormInput,
  ScanLine,
  Wallet,
  Play,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react'

import { PublicHeader } from '@/components/qless/PublicHeader'
import { ScrollBackground } from '@/components/qless/ScrollBackground'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { GlassCard } from '@/components/qless/GlassCard'
import { AnimatedCounter } from '@/components/qless/AnimatedCounter'
import { QLessLogo } from '@/components/qless/Logo'
import { StatusPill } from '@/components/qless/StatusPill'

function SplitHeadline() {
  const words = ['Eliminate', 'Chaos.', 'Go', 'QLess.']
  return (
    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-2 mr-3">
          <motion.span
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-block ${i === 3 ? 'text-gradient-cyan' : ''}`}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-strong rounded-3xl p-6 max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video rounded-2xl bg-black/60 grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 animate-gradient-shift bg-[linear-gradient(120deg,oklch(0.3_0.2_200/0.4),oklch(0.3_0.24_295/0.4),oklch(0.3_0.2_155/0.4))]" />
          <div className="relative text-center">
            <Play className="h-16 w-16 mx-auto text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Live product walkthrough (demo placeholder)</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <MagneticButton variant="outline" onClick={onClose}>
            Close
          </MagneticButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

function HeroMockup() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 80, damping: 20 })
  const sy = useSpring(y, { stiffness: 80, damping: 20 })
  const rx = useTransform(sy, [-0.5, 0.5], [10, -10])
  const ry = useTransform(sx, [-0.5, 0.5], [-10, 10])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      x.set((e.clientX - r.left) / r.width - 0.5)
      y.set((e.clientY - r.top) / r.height - 0.5)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className="relative w-full max-w-md mx-auto"
    >
      <div className="glass-strong rounded-3xl p-6 glow-cyan relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <StatusPill tone="success" dot>
            Live Scan
          </StatusPill>
          <span className="text-xs text-muted-foreground font-mono">TicketID #A392F1</span>
        </div>
        <div className="aspect-square rounded-2xl bg-black/40 grid place-items-center relative overflow-hidden border border-white/10">
          <QrCode className="h-40 w-40 text-primary" strokeWidth={1.2} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
          </div>
          <div className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-sm text-muted-foreground">Attendee</p>
          <p className="text-lg font-semibold">Ananya Rao</p>
          <p className="text-xs font-mono text-muted-foreground">1MS22CS103 · CSE</p>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-success/10 border border-success/30 px-4 py-3">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Entry Granted</span>
          </div>
          <span className="text-xs font-mono text-success/70">0.48s</span>
        </div>
      </div>
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-6 -right-6 glass rounded-2xl px-3 py-2 text-xs font-mono"
      >
        99.9% verified
      </motion.div>
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-6 -left-6 glass rounded-2xl px-3 py-2 text-xs font-mono"
      >
        <Zap className="inline h-3 w-3 text-primary mr-1" />
        342 scans today
      </motion.div>
    </motion.div>
  )
}

function ComparisonSlider() {
  const [pos, setPos] = useState(50)
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 glass-strong h-[520px] select-none">
      {/* Old Way — clipped to show only the right portion (pos% → 100%) */}
      <div
        className="absolute inset-0 p-8 md:p-12 bg-gradient-to-br from-destructive/10 to-transparent"
        style={{ clipPath: `polygon(${pos}% 0, 100% 0, 100% 100%, ${pos}% 100%)` }}
      >
        <StatusPill tone="danger" dot>
          The Old Way
        </StatusPill>
        <h3 className="mt-4 text-2xl md:text-3xl font-bold">Spreadsheets & Chaos</h3>
        <ul className="mt-6 space-y-3">
          {[
            { icon: XCircle, text: 'Cluttered Google Sheets with 40 columns' },
            { icon: XCircle, text: 'Manually verifying fake payment screenshots' },
            { icon: XCircle, text: 'Volunteers checking names one-by-one at the gate' },
            { icon: XCircle, text: '60+ minute entry queues, angry attendees' },
            { icon: XCircle, text: 'Zero audit trail, no analytics' },
          ].map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-sm md:text-base">
              <r.icon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <span className="text-foreground/80">{r.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-mono text-destructive">
            ERROR: Duplicate ID
          </div>
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-mono text-destructive">
            ERROR: Fake proof
          </div>
        </div>
      </div>

      {/* QLess Way — clipped to show only the left portion (0 → pos%)) */}
      <div
        className="absolute inset-0 p-8 md:p-12 bg-gradient-to-br from-primary/10 to-emerald/10"
        style={{ clipPath: `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)` }}
      >
        <StatusPill tone="success" dot>
          The QLess Way
        </StatusPill>
        <h3 className="mt-4 text-2xl md:text-3xl font-bold">Automated & Instant</h3>
        <ul className="mt-6 space-y-3">
          {[
            'AI-assisted screenshot verification in seconds',
            'QR tickets generated & emailed via your SMTP',
            'Sub-second scans at the gate on any phone',
            'Real-time analytics & registration velocity',
            'Full audit trail with fraud detection',
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-3 text-sm md:text-base">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <span className="text-foreground/90">{t}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
          <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-xs font-mono text-success">
            ✓ Ticket delivered
          </div>
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
            ✓ 0.48s scan
          </div>
        </div>
      </div>

      {/* Slider handle */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
        aria-label="Comparison slider"
      />
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-primary pointer-events-none z-[5]"
        style={{ left: `${pos}%`, boxShadow: '0 0 30px oklch(0.85 0.17 205 / 0.8)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full glass-strong grid place-items-center glow-cyan">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-primary" />
            <div className="w-0.5 h-4 bg-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: FormInput, title: 'Dynamic Form Builder', desc: 'Design multi-step registration forms with any field type. No code required.' },
  { icon: Wallet, title: 'Custom Payment Gateways', desc: 'Accept UPI, QR, or card payments with your own account and instructions.' },
  { icon: ShieldCheck, title: 'QR Security Hash', desc: 'Signed cryptographic tickets prevent duplication and screenshot fraud.' },
  { icon: ScanLine, title: 'Gate Scanner PWA', desc: 'Install on any phone, scan tickets offline, sync when back online.' },
  { icon: Mail, title: 'Custom SMTP Delivery', desc: 'Send tickets from your domain — full branding, unbeatable inbox rates.' },
  { icon: Sparkles, title: 'Live Analytics', desc: 'Real-time dashboards, cohort insights, exportable reports.' },
]

export default function Landing() {
  const [demoOpen, setDemoOpen] = useState(false)
  return (
    <div className="relative min-h-screen">
      <ScrollBackground />
      <PublicHeader />

      {/* HERO */}
      <section className="relative pt-32 md:pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs mb-6"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
              Next-Gen Event Operations for Campus Organizations
            </motion.div>
            <SplitHeadline />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-lg text-muted-foreground max-w-xl"
            >
              QLess is the automated event platform built for university clubs — dynamic registration
              forms, verified payments, cryptographic QR tickets, and instant gate scans.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/login">
                <MagneticButton size="lg">
                  Host an Event <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </Link>
              <MagneticButton size="lg" variant="outline" onClick={() => setDemoOpen(true)}>
                <Play className="h-4 w-4" /> Watch Live Demo
              </MagneticButton>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-10 flex items-center gap-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> SOC-ready</div>
              <div className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> {'<1s scans'}</div>
              <div className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> 350+ events</div>
            </motion.div>
          </div>
          <div className="relative">
            <HeroMockup />
          </div>
        </div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-1/2 -translate-x-1/2 bottom-6 text-muted-foreground"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <StatusPill tone="info">How it works</StatusPill>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              Three steps. Zero chaos.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', icon: FormInput, title: 'Build & Configure', desc: 'Design a custom registration form, set fees and add payment instructions.' },
              { n: '02', icon: ShieldCheck, title: 'Verify & Deliver', desc: 'Approve payments in seconds. QR tickets auto-send via your SMTP.' },
              { n: '03', icon: ScanLine, title: 'Scan & Enter', desc: 'Volunteers scan tickets at the gate — 0.5s validation, full audit trail.' },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <GlassCard tilt className="h-full">
                  <div className="text-6xl font-bold text-gradient-cyan opacity-40">{s.n}</div>
                  <s.icon className="h-8 w-8 mt-4 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <StatusPill tone="danger">Before / After</StatusPill>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              The Old Way vs. The <span className="text-gradient-cyan">QLess</span> Way
            </h2>
            <p className="mt-3 text-muted-foreground">Drag the slider to compare.</p>
          </motion.div>
          <ComparisonSlider />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <StatusPill tone="success">Feature matrix</StatusPill>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              Built for the modern campus club
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <GlassCard tilt className="h-full group">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 grid place-items-center group-hover:glow-cyan transition-shadow">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <StatusPill tone="info" dot>Live platform stats</StatusPill>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">Trusted at scale</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { v: 350, s: '+', label: 'Entries Processed', d: 0 },
              { v: 0.48, s: 's', label: 'Avg. Scan Speed', d: 2 },
              { v: 99.9, s: '%', label: 'Fraud Detection', d: 1 },
            ].map((s) => (
              <GlassCard key={s.label} tilt glow className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-gradient-cyan">
                  <AnimatedCounter value={s.v} suffix={s.s} decimals={s.d} />
                </div>
                <div className="mt-3 text-sm text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-r from-primary/20 via-violet/20 to-emerald/20 blur-3xl" />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold tracking-tight"
          >
            Ready to make your next event <span className="text-gradient-aurora">QLess</span>?
          </motion.h2>
          <p className="mt-4 text-lg text-muted-foreground">Free to try. No card required.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/login">
              <MagneticButton size="lg">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </Link>
            <MagneticButton size="lg" variant="outline" onClick={() => setDemoOpen(true)}>
              Watch Demo
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <QLessLogo size={28} />
            <StatusPill tone="success" dot>All Systems Operational</StatusPill>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <span>© 2026 QLess</span>
          </div>
        </div>
      </footer>

      {demoOpen && <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />}
    </div>
  )
}
