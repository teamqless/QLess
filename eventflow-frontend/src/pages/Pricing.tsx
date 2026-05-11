import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { getStoredClub, setStoredClub } from '@/lib/auth'
import { isAuthenticated } from '@/lib/auth'

const PLANS = [
  {
    id:       'free',
    name:     'Free',
    price:    0,
    per:      'forever',
    desc:     'Perfect for trying it out',
    features: ['1 active event', 'Up to 100 attendees', 'QR code email delivery', 'Mobile gate scanner', 'Basic dashboard'],
    cta:      'Current plan',
    disabled: true,
  },
  {
    id:       'pro',
    name:     'Club Pro',
    price:    499,
    per:      'per event',
    desc:     'For clubs running real events',
    features: ['Unlimited attendees', 'Custom event theme', 'Send QR from your club email', 'Payment screenshot verification', 'Multiple volunteer accounts', 'CSV export', 'Google Sheets export'],
    cta:      'Upgrade to Pro',
    highlight: true,
  },
  {
    id:       'institution',
    name:     'Institution',
    price:    4999,
    per:      'per year',
    desc:     'For all clubs in a college',
    features: ['All clubs under one account', 'Central admin dashboard', 'Cross-club analytics', 'White-label branding', 'Dedicated support'],
    cta:      'Contact us',
  },
]

const FAQ = [
  { q: 'Do I need a credit card to start?', a: 'No. The free plan requires no payment details. You only pay when you upgrade.' },
  { q: 'Is the ₹499 per event or per month?', a: 'Per event. Your club runs one event, pays once. No monthly subscriptions.' },
  { q: 'What payment methods are accepted?', a: 'UPI, debit/credit cards, net banking — all via Razorpay.' },
  { q: 'Can I use my club email to send QR codes?', a: 'Yes, on the Pro plan. Configure your SMTP settings in Settings → Email.' },
  { q: 'What if I already ran a free event?', a: 'Upgrade before creating your next event. All data from your free event stays.' },
]

export default function Pricing() {
  const club     = getStoredClub()
  const navigate = useNavigate()
  const authed   = isAuthenticated()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleUpgrade = async (planId: string) => {
    if (!authed) { navigate('/signup'); return }
    if (planId === 'institution') { window.location.href = 'mailto:hello@eventflow.app?subject=Institution Plan Inquiry'; return }

    setLoading(planId); setError('')
    try {
      const { data: orderData } = await api.post('/billing/order', { plan: planId })

      if (orderData.manual_upgrade) {
        alert(orderData.message)
        setLoading(null)
        return
      }

      // Load Razorpay script dynamically
      const script = document.createElement('script')
      script.src   = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      script.onload = () => {
        const options = {
          key:          orderData.key_id,
          amount:       orderData.amount,
          currency:     orderData.currency,
          name:         'EventFlow',
          description:  `Club Pro Plan`,
          order_id:     orderData.order_id,
          prefill: {
            name:  club?.name || '',
            email: club?.email || '',
          },
          theme: { color: '#6366f1' },
          handler: async (response: any) => {
            try {
              const { data } = await api.post('/billing/verify', {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan:                planId,
              })
              setStoredClub(data.club)
              navigate('/dashboard')
              alert(`🎉 ${data.message}`)
            } catch (err: any) {
              setError(err.response?.data?.error || 'Payment verification failed')
            }
          },
          modal: { ondismiss: () => setLoading(null) },
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080714', fontFamily: 'DM Sans, sans-serif', color: '#eeeaf8' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px', height: 60, background: 'rgba(8,7,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#6366f1', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'white' }}>E</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f0eeff' }}>EventFlow</span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          {authed
            ? <Link to="/dashboard" style={{ padding: '7px 18px', background: '#6366f1', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Dashboard</Link>
            : <>
                <Link to="/login"  style={{ padding: '7px 16px', color: '#9893b8', textDecoration: 'none', fontSize: 14 }}>Sign in</Link>
                <Link to="/signup" style={{ padding: '7px 18px', background: '#6366f1', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Get started</Link>
              </>
          }
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '64px 24px 48px' }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Simple, transparent pricing</h1>
        <p style={{ fontSize: 16, color: '#6b6690', maxWidth: 440, margin: '0 auto' }}>
          Pay per event, not per month. Fits how college clubs actually budget.
        </p>
      </div>

      {/* Plan cards */}
      {error && (
        <div style={{ maxWidth: 500, margin: '0 auto 24px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '12px 18px', fontSize: 14, color: '#f87171', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, maxWidth: 980, margin: '0 auto', padding: '0 24px 80px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            flex: '1 1 280px', maxWidth: 320,
            padding: '32px 28px', borderRadius: 18,
            border: `1px solid ${plan.highlight ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.08)'}`,
            background: plan.highlight ? 'rgba(99,102,241,0.09)' : 'rgba(255,255,255,0.02)',
            position: 'relative',
            boxShadow: plan.highlight ? '0 0 40px rgba(99,102,241,0.12)' : 'none',
          }}>
            {plan.highlight && (
              <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                Most popular
              </div>
            )}
            {club?.plan === plan.id && (
              <div style={{ position: 'absolute', top: 16, right: 16, background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                Current
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 600, color: '#8884a8', marginBottom: 6 }}>{plan.name}</div>
            <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px', marginBottom: 2, color: '#f0eeff' }}>
              {plan.price === 0 ? '₹0' : `₹${plan.price.toLocaleString('en-IN')}`}
            </div>
            <div style={{ fontSize: 13, color: '#56527a', marginBottom: 10 }}>{plan.per}</div>
            <div style={{ fontSize: 13, color: '#6b6690', marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', gap: 9, fontSize: 13, color: '#b0abc8', lineHeight: 1.4 }}>
                  <span style={{ color: plan.highlight ? '#818cf8' : '#6366f1', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => !plan.disabled && handleUpgrade(plan.id)}
              disabled={plan.disabled || loading === plan.id || club?.plan === plan.id}
              style={{
                display: 'block', width: '100%', padding: '11px 16px', textAlign: 'center',
                borderRadius: 9, fontSize: 14, fontWeight: 600, border: 'none', cursor: plan.disabled || club?.plan === plan.id ? 'default' : 'pointer',
                background: plan.disabled || club?.plan === plan.id
                  ? 'rgba(255,255,255,0.04)'
                  : plan.highlight ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
                color: plan.disabled || club?.plan === plan.id ? '#56527a' : plan.highlight ? 'white' : '#b0abc8',
                boxShadow: plan.highlight && !plan.disabled ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                opacity: loading && loading !== plan.id ? 0.6 : 1,
              }}>
              {loading === plan.id ? 'Opening payment…' : club?.plan === plan.id ? 'Current plan' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 28, textAlign: 'center' }}>Frequently asked questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '16px 20px',
                  background: openFaq === i ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                  border: 'none', cursor: 'pointer', color: '#ddd9f5', fontSize: 14,
                  fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                {item.q}
                <span style={{ color: '#6366f1', fontSize: 18, lineHeight: 1 }}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 13, color: '#6b6690', lineHeight: 1.65 }}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 64px', textAlign: 'center', fontSize: 12, color: '#3a3758' }}>
        © 2026 EventFlow · <a href="mailto:hello@eventflow.app" style={{ color: '#3a3758' }}>hello@eventflow.app</a>
      </div>
    </div>
  )
}
