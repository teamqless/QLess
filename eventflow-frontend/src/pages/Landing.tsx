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
    <div className="min-h-screen bg-[#080714] text-[#eeeaf8] font-sans overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-6 md:px-16 h-16 bg-[#080714]/85 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-md flex items-center justify-center font-extrabold text-sm text-white tracking-tighter">E</div>
          <span className="font-bold text-base text-[#f0eeff] tracking-tight">EventFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="px-4 py-1.5 text-sm text-[#9893b8] hover:text-white transition font-medium rounded-lg">
            Sign in
          </Link>
          <Link to="/signup" className="px-4 py-1.5 text-sm font-semibold bg-indigo-500 text-white rounded-lg shadow-[0_0_0_1px_rgba(99,102,241,0.6),_0_2px_8px_rgba(99,102,241,0.3)] hover:bg-indigo-600 transition">
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="text-center pt-24 pb-16 px-6 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.18)_0%,transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-medium mb-8">
          <span className="bg-indigo-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">NEW</span>
          Built for Indian college clubs
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
          Stop managing events<br />
          <span className="bg-gradient-to-br from-indigo-400 via-purple-400 to-fuchsia-400 text-transparent bg-clip-text">
            with WhatsApp & Excel
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[#7b76a0] leading-relaxed max-w-2xl mx-auto mb-12">
          Registration forms, payment verification, QR entry passes, and gate
          scanning — all in one place. No Python scripts. No laptop at the door.
          No chaos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 px-4">
          <Link to="/signup" className="px-8 py-3.5 text-[15px] font-bold bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl shadow-[0_6px_28px_rgba(99,102,241,0.45)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.6)] transition-all tracking-tight">
            Create free account
          </Link>
          <Link to="/login" className="px-8 py-3.5 text-[15px] font-medium bg-white/5 text-[#b8b3d8] rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            Sign in →
          </Link>
        </div>

        {/* Stats strip */}
        <div className="inline-flex flex-col sm:flex-row bg-white/[0.03] border border-white/[0.07] rounded-[14px] overflow-hidden">
          {STATS.map((s, i) => (
            <div key={s.label} className={`px-8 py-4 text-center ${i < STATS.length - 1 ? 'sm:border-r border-b sm:border-b-0 border-white/[0.07]' : ''}`}>
              <div className="text-2xl font-extrabold text-[#e0dbff] tracking-tight">{s.value}</div>
              <div className="text-xs text-[#5e597c] mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="py-20 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Four steps. Fully automated.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 rounded-[14px] overflow-hidden border border-white/[0.06]">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.n} className={`p-7 ${i % 2 === 0 ? 'bg-indigo-500/[0.06]' : 'bg-white/[0.02]'}`}>
              <div className="text-[11px] font-black text-indigo-500/50 font-mono tracking-wider mb-3.5">{s.n}</div>
              <div className="text-[15px] font-bold mb-2.5 text-[#ddd9f5]">{s.title}</div>
              <div className="text-[13px] text-[#6b6690] leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div className="py-20 px-6 md:px-16 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Features</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Everything your club needs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-[14px] bg-white/[0.025] border border-white/[0.07] hover:border-indigo-500/40 transition-colors duration-200">
                <div className="text-[22px] text-indigo-500 mb-3.5">{f.icon}</div>
                <div className="text-sm font-bold mb-2 text-[#ddd9f5]">{f.title}</div>
                <div className="text-[13px] text-[#6b6690] leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Problem → Solution callout ── */}
      <div className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Before */}
          <div className="p-7 rounded-[14px] bg-red-500/5 border border-red-500/15">
            <div className="text-[13px] font-bold text-red-400 mb-4.5 uppercase tracking-wider mb-4">
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
              <div key={t} className="flex gap-2.5 mb-2.5 text-[13px] text-[#9b8a8a] leading-relaxed">
                <span className="text-red-500 shrink-0">✗</span> {t}
              </div>
            ))}
          </div>

          {/* After */}
          <div className="p-7 rounded-[14px] bg-green-600/5 border border-green-600/15">
            <div className="text-[13px] font-bold text-green-400 mb-4.5 uppercase tracking-wider mb-4">
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
              <div key={t} className="flex gap-2.5 mb-2.5 text-[13px] text-[#7b9a8a] leading-relaxed">
                <span className="text-green-500 shrink-0">✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pricing ── */}
      <div className="py-20 px-6 md:px-16 bg-white/[0.015] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2.5">Pay per event, not per month</h2>
            <p className="text-[#6b6690] text-[15px]">Clubs budget event-by-event. So do we.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRICING.map(plan => (
              <div key={plan.name} className={`
                p-8 rounded-[18px] relative transition-transform duration-300 hover:-translate-y-1
                ${plan.highlight ? 'border border-indigo-500/55 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.12)]' : 'border border-white/[0.08] bg-white/[0.02]'}
              `}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[11px] font-bold px-3.5 py-1 rounded-full whitespace-nowrap tracking-wide">
                    Most popular
                  </div>
                )}
                <div className="text-[13px] font-semibold text-[#8884a8] mb-1.5">{plan.name}</div>
                <div className="text-[38px] font-black tracking-tight mb-0.5 text-[#f0eeff]">{plan.price}</div>
                <div className="text-[13px] text-[#56527a] mb-2.5">{plan.per}</div>
                <div className="text-[13px] text-[#6b6690] mb-6 leading-relaxed min-h-[40px]">{plan.desc}</div>
                <ul className="flex flex-col gap-2.5 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex gap-2.5 text-[13px] text-[#b0abc8] leading-snug items-start">
                      <span className={`font-bold shrink-0 ${plan.highlight ? 'text-indigo-400' : 'text-indigo-500'}`}>✓</span> 
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} className={`
                  block text-center px-4 py-2.5 rounded-lg text-sm font-semibold no-underline transition-all duration-300
                  ${plan.highlight 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)]' 
                    : 'bg-white/[0.06] text-[#b0abc8] border border-white/10 hover:bg-white/10'
                  }
                `}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div className="py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          Ready to run your next event?
        </h2>
        <p className="text-base text-[#6b6690] mb-9">
          Free to start. No card needed. Up and running in 5 minutes.
        </p>
        <Link to="/signup" className="px-9 py-3.5 text-[15px] font-bold bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl no-underline shadow-[0_6px_28px_rgba(99,102,241,0.45)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.6)] transition-all">
          Create your free account →
        </Link>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-white/[0.06] py-6 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] bg-indigo-500 rounded-[5px] flex items-center justify-center font-extrabold text-[11px] text-white">E</div>
          <span className="text-[13px] font-semibold text-[#4a4768]">EventFlow</span>
        </div>
        <div className="text-xs text-[#3a3758]">© 2026 EventFlow · Built for college clubs in India</div>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" className="text-xs text-[#3a3758] no-underline hover:text-[#4a4768] transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
