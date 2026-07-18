import { Link } from 'react-router-dom'
import { useEffect } from 'react'

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

const STATS = [
  { value: '2,400+', label: 'QR passes sent' },
  { value: '48',     label: 'Events managed' },
  { value: '0',      label: 'Duplicate entries' },
  { value: '< 1s',   label: 'Scan response time' },
]

export default function Landing() {
  
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          (entry.target as HTMLElement).style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans overflow-x-hidden relative transition-colors duration-300">
      
      {/* Absolute Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber opacity-10 blur-[100px] rounded-full animate-pulse-glow" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 bg-amber-soft opacity-10 blur-[80px] rounded-full" />
      </div>

      {/* ── Navbar ── */}
      <nav className="glass fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-20 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform group-hover:scale-105 text-amber">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="60 16"></circle>
            <path d="M22 22L30 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
            <path d="M14 16L18 20L26 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"></path>
          </svg>
          <span className="font-display font-extrabold text-2xl tracking-tight text-ink">
            Event<span className="text-amber">Flow</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5">
            Sign in
          </Link>
        </div>
      </nav>

      <div className="relative z-10 pt-20">
        {/* ── Hero ── */}
        <div className="text-center pt-32 pb-24 px-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-soft border border-amber/20 text-xs font-mono text-amber-deep mb-10 fade-in-up">
            <span className="bg-amber text-ink rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">New</span>
            Built for modern college clubs
          </div>

          <h1 className="font-display text-5xl md:text-8xl font-black leading-[1.05] tracking-tighter mb-8 max-w-5xl mx-auto fade-in-up" style={{ animationDelay: '0.1s' }}>
            Stop managing events<br />
            <span className="text-amber-deep">
              with WhatsApp & Excel
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-ink-soft leading-relaxed max-w-3xl mx-auto mb-14 font-medium fade-in-up" style={{ animationDelay: '0.2s' }}>
            Registration forms, payment verification, QR entry passes, and gate
            scanning — all in one place. No chaotic scripts. No stress.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24 px-4 fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/login" className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-amber text-ink hover:bg-amber-deep shadow-sm text-base px-6 py-3">
              Sign in to dashboard
            </Link>
          </div>

          {/* Stats strip */}
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-line-soft border border-line rounded-2xl overflow-hidden fade-in-up shadow-card" style={{ animationDelay: '0.4s' }}>
            {STATS.map((s, i) => (
              <div key={s.label} className="p-8 hover:bg-paper-dim transition-colors bg-paper-card">
                <div className="font-display text-3xl md:text-4xl font-black text-ink tracking-tight mb-2">{s.value}</div>
                <div className="section-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="py-32 px-6 md:px-16 max-w-7xl mx-auto scroll-animate" style={{ opacity: 0 }}>
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-6 text-ink">Four steps. <span className="text-amber">Fully automated.</span></h2>
            <p className="text-xl text-ink-soft max-w-2xl mx-auto">From creating the form to scanning the last QR code, everything just works.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.n} className="vc-card p-8 group">
                <div className="text-[12px] font-black text-amber-deep bg-amber-soft inline-block px-3 py-1 rounded-full mb-6">{s.n}</div>
                <div className="font-display text-xl font-bold mb-4 text-ink group-hover:text-amber-deep transition-colors">{s.title}</div>
                <div className="text-sm text-ink-soft leading-relaxed font-medium">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div className="py-32 px-6 md:px-16 relative scroll-animate" style={{ opacity: 0 }}>
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-20">
              <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-6 text-ink">Everything your club needs</h2>
              <p className="text-xl text-ink-soft max-w-2xl mx-auto">No more stringing together 5 different tools just to run a workshop.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(f => (
                <div key={f.title} className="vc-card p-8 group">
                  <div className="w-14 h-14 rounded-2xl bg-paper-dim flex items-center justify-center text-3xl text-amber mb-6 group-hover:scale-110 group-hover:bg-amber group-hover:text-ink transition-all duration-300">
                    {f.icon}
                  </div>
                  <div className="font-display text-lg font-bold mb-3 text-ink">{f.title}</div>
                  <div className="text-sm text-ink-soft leading-relaxed font-medium">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Problem → Solution ── */}
        <div className="py-32 px-6 max-w-6xl mx-auto scroll-animate" style={{ opacity: 0 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="vc-card p-10 bg-rust-soft border-rust/20">
              <div className="text-sm font-black text-rust mb-8 uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rust-soft border border-rust/20 flex items-center justify-center text-rust">✗</span>
                The Old Way
              </div>
              <ul className="space-y-4">
                {[
                  'Google Form → Excel sheet → manual QR generation',
                  'Python script running on someone\'s laptop at the gate',
                  'WhatsApp for payment confirmations',
                  'Duplicate entries because QR was screenshotted',
                  'No real-time entry count',
                ].map(t => (
                  <li key={t} className="flex gap-4 text-[15px] text-ink-soft font-medium">
                    <span className="text-rust mt-0.5">✗</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="vc-card p-10 bg-paper-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="text-sm font-black text-amber-deep mb-8 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber flex items-center justify-center text-ink">✓</span>
                  EventFlow
                </div>
                <ul className="space-y-4">
                  {[
                    'Custom registration form live in 5 minutes',
                    'QR emailed automatically on approval',
                    'Payment screenshots in the dashboard, approve in one click',
                    'Each QR is single-use, server-enforced',
                    'Live entry counter on any phone',
                  ].map(t => (
                    <li key={t} className="flex gap-4 text-[15px] text-ink font-medium">
                      <span className="text-teal mt-0.5">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-line bg-paper-card py-12 px-6 md:px-16 mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-amber">
              <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="60 16"></circle>
                <path d="M22 22L30 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
                <path d="M14 16L18 20L26 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"></path>
              </svg>
              <span className="font-display font-extrabold text-lg text-ink">Event<span className="text-amber">Flow</span></span>
            </div>
            <div className="text-sm font-medium text-ink-faint">© 2026 EventFlow · Built for modern clubs</div>
            <div className="flex gap-8">
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <a key={l} href="#" className="text-sm font-bold text-ink-soft hover:text-amber transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
