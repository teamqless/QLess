import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '⬡',
    title: 'Flexible Registration Forms',
    desc: 'Build forms with any fields — text, dropdowns, phone, file uploads. Every club has different needs, so we let you define your own structure completely.',
  },
  {
    icon: '⬢',
    title: 'Payment Verification Built-in',
    desc: 'Attendees upload payment screenshots during registration. You review and approve with one click. No third-party payment gateway needed.',
  },
  {
    icon: '◈',
    title: 'Branded QR Entry Passes',
    desc: 'Approved attendees get a beautifully designed QR code emailed automatically — with your event name, date, venue, and theme color.',
  },
  {
    icon: '◉',
    title: 'One-Scan Enforcement',
    desc: 'Each QR is cryptographically signed and single-use. The moment it\'s scanned, it\'s locked. No duplicate entries, no sharing workarounds.',
  },
  {
    icon: '▦',
    title: 'Mobile Gate Scanner',
    desc: 'Volunteers open a URL on any phone. No app install. The camera scanner shows instant green/red feedback and logs every entry in real-time.',
  },
  {
    icon: '✦',
    title: 'Live Entry Dashboard',
    desc: 'Watch attendees check in live. See who\'s arrived, who hasn\'t, and export the full list to CSV anytime — even during the event.',
  },
]

const HOW_IT_WORKS = [
  { n: '01', title: 'Create your event', desc: 'Set a title, venue, date, fee, and design a registration form with your own fields. Publish a shareable link in minutes.' },
  { n: '02', title: 'Attendees register', desc: 'Students fill your form, upload payment proof. You see every submission, review screenshots, and approve or reject with one click.' },
  { n: '03', title: 'QR codes delivered', desc: 'The moment you approve, a branded QR entry pass gets emailed automatically. Attendees keep it in their inbox.' },
  { n: '04', title: 'Scan at the gate', desc: 'Volunteers use any phone to scan QR codes at entry. One scan per ticket, enforced server-side. Done.' },
]

const PRICING = [
  {
    name: 'Free',
    price: '₹0',
    per: 'forever',
    desc: 'Perfect for trying it out or small internal events.',
    features: ['1 active event', 'Up to 100 attendees', 'QR code email delivery', 'Mobile gate scanner', 'Basic dashboard'],
    cta: 'Start for free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Club Pro',
    price: '₹499',
    per: 'per event',
    desc: 'For clubs running real events with real attendees.',
    features: [
      'Unlimited attendees',
      'Custom event theme & banner',
      'Send QR from your club email',
      'Payment screenshot verification',
      'Multiple volunteer accounts',
      'CSV export anytime',
      'Priority support',
    ],
    cta: 'Get started free →',
    href: '/signup',
    highlight: true,
  },
  {
    name: 'Institution',
    price: '₹4,999',
    per: 'per year',
    desc: 'For student affairs offices managing all clubs.',
    features: [
      'All clubs under one roof',
      'Central admin dashboard',
      'Cross-club analytics',
      'Google Sheets live sync',
      'White-label (remove EventFlow branding)',
      'Dedicated onboarding',
    ],
    cta: 'Contact us',
    href: 'mailto:hello@eventflow.app',
    highlight: false,
  },
]

const STATS = [
  { value: '2,400+', label: 'QR passes sent' },
  { value: '48',     label: 'Events managed' },
  { value: '0',      label: 'Duplicate entries' },
  { value: '< 1s',   label: 'Scan response time' },
]

export default function Landing() {
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#080714', minHeight: '100vh', color: '#eeeaf8' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 64px', height: 60,
        background: 'rgba(8,7,20,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 15, color: 'white', letterSpacing: '-0.5px',
          }}>E</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.4px', color: '#f0eeff' }}>EventFlow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/login" style={{ padding: '7px 16px', fontSize: 14, color: '#9893b8', textDecoration: 'none', fontWeight: 500, borderRadius: 7 }}>
            Sign in
          </Link>
          <Link to="/signup" style={{
            padding: '7px 18px', fontSize: 14, fontWeight: 600,
            background: '#6366f1', color: 'white', borderRadius: 8,
            textDecoration: 'none', boxShadow: '0 0 0 1px rgba(99,102,241,0.6), 0 2px 8px rgba(99,102,241,0.3)',
          }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: '96px 24px 72px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px 5px 8px', borderRadius: 100,
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
          fontSize: 12, color: '#a5b4fc', fontWeight: 500, marginBottom: 32,
        }}>
          <span style={{ background: '#6366f1', color: 'white', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>NEW</span>
          Built for Indian college clubs
        </div>

        <h1 style={{
          fontSize: 60, fontWeight: 800, lineHeight: 1.08,
          letterSpacing: '-2px', margin: '0 0 22px',
          maxWidth: 780, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Stop managing events<br />
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            with WhatsApp & Excel
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: '#7b76a0', lineHeight: 1.65,
          maxWidth: 540, margin: '0 auto 44px',
        }}>
          Registration forms, payment verification, QR entry passes, and gate
          scanning — all in one place. No Python scripts. No laptop at the door.
          No chaos.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
          <Link to="/signup" style={{
            padding: '14px 32px', fontSize: 15, fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', borderRadius: 11, textDecoration: 'none',
            boxShadow: '0 6px 28px rgba(99,102,241,0.45)',
            letterSpacing: '-0.2px',
          }}>
            Create free account
          </Link>
          <Link to="/login" style={{
            padding: '14px 28px', fontSize: 15, fontWeight: 500,
            background: 'rgba(255,255,255,0.05)', color: '#b8b3d8',
            borderRadius: 11, textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            Sign in →
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'inline-flex', gap: 0,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '16px 32px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#e0dbff', letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#5e597c', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ padding: '72px 64px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            How it works
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.8px', margin: 0 }}>
            Four steps. Fully automated.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.n} style={{
              padding: '28px 24px',
              background: i % 2 === 0 ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
              borderRadius: i === 0 ? '14px 0 0 14px' : i === HOW_IT_WORKS.length - 1 ? '0 14px 14px 0' : 0,
              border: '1px solid rgba(255,255,255,0.06)',
              borderRight: i < HOW_IT_WORKS.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(99,102,241,0.5)', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em', marginBottom: 14 }}>{s.n}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#ddd9f5' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#6b6690', lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ padding: '72px 64px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Features</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.8px', margin: 0 }}>Everything your club needs</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                padding: '24px', borderRadius: 14,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                <div style={{ fontSize: 22, color: '#6366f1', marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#ddd9f5' }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#6b6690', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Problem → Solution callout ── */}
      <div style={{ padding: '72px 64px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
        }}>
          {/* Before */}
          <div style={{
            padding: '28px', borderRadius: 14,
            background: 'rgba(220,38,38,0.05)',
            border: '1px solid rgba(220,38,38,0.15)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ✗ Before EventFlow
            </div>
            {[
              'Google Form → Excel sheet → manual QR generation',
              'Python script running on someone\'s laptop at the gate',
              'WhatsApp for payment confirmations',
              'Duplicate entries because QR was screenshotted',
              'No real-time entry count',
              'Data lost when laptop crashes',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, color: '#9b8a8a', lineHeight: 1.5 }}>
                <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span> {t}
              </div>
            ))}
          </div>

          {/* After */}
          <div style={{
            padding: '28px', borderRadius: 14,
            background: 'rgba(22,163,74,0.05)',
            border: '1px solid rgba(22,163,74,0.15)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ✓ With EventFlow
            </div>
            {[
              'Custom registration form live in 5 minutes',
              'QR emailed automatically on approval',
              'Payment screenshots in the dashboard, approve in one click',
              'Each QR is single-use, server-enforced',
              'Live entry counter on any phone',
              'All data in the cloud, exportable anytime',
            ].map(t => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, color: '#7b9a8a', lineHeight: 1.5 }}>
                <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div style={{ padding: '72px 64px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Pricing</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 10px' }}>Pay per event, not per month</h2>
            <p style={{ color: '#6b6690', fontSize: 15, margin: 0 }}>Clubs budget event-by-event. So do we.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {PRICING.map(plan => (
              <div key={plan.name} style={{
                padding: '32px 28px',
                borderRadius: 18,
                border: `1px solid ${plan.highlight ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.08)'}`,
                background: plan.highlight ? 'rgba(99,102,241,0.09)' : 'rgba(255,255,255,0.02)',
                position: 'relative',
                boxShadow: plan.highlight ? '0 0 40px rgba(99,102,241,0.12)' : 'none',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white',
                    fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 100,
                    whiteSpace: 'nowrap', letterSpacing: '0.02em',
                  }}>Most popular</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#8884a8', marginBottom: 6 }}>{plan.name}</div>
                <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-1px', marginBottom: 2, color: '#f0eeff' }}>{plan.price}</div>
                <div style={{ fontSize: 13, color: '#56527a', marginBottom: 10 }}>{plan.per}</div>
                <div style={{ fontSize: 13, color: '#6b6690', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 9, fontSize: 13, color: '#b0abc8', lineHeight: 1.4 }}>
                      <span style={{ color: plan.highlight ? '#818cf8' : '#6366f1', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} style={{
                  display: 'block', textAlign: 'center', padding: '11px 16px',
                  borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  background: plan.highlight ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
                  color: plan.highlight ? 'white' : '#b0abc8',
                  border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: plan.highlight ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}>
          Ready to run your next event?
        </h2>
        <p style={{ fontSize: 16, color: '#6b6690', marginBottom: 36 }}>
          Free to start. No card needed. Up and running in 5 minutes.
        </p>
        <Link to="/signup" style={{
          padding: '14px 36px', fontSize: 15, fontWeight: 700,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color: 'white', borderRadius: 11, textDecoration: 'none',
          boxShadow: '0 6px 28px rgba(99,102,241,0.45)',
        }}>
          Create your free account →
        </Link>
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: '#6366f1', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white' }}>E</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4768' }}>EventFlow</span>
        </div>
        <div style={{ fontSize: 12, color: '#3a3758' }}>© 2026 EventFlow · Built for college clubs in India</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: '#3a3758', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
