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
    <div className="min-h-screen bg-[#080714] text-[#eeeaf8] font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-6 md:px-16 h-16 bg-[#080714]/85 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center font-extrabold text-sm text-white">E</div>
          <span className="font-bold text-base text-[#f0eeff]">EventFlow</span>
        </Link>
        <div className="flex gap-2 items-center">
          {authed
            ? <Link to="/dashboard" className="px-4 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-semibold transition hover:bg-indigo-600">Dashboard</Link>
            : <>
                <Link to="/login" className="px-4 py-1.5 text-[#9893b8] hover:text-white transition text-sm">Sign in</Link>
                <Link to="/signup" className="px-4 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-semibold transition hover:bg-indigo-600">Get started</Link>
              </>
          }
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center pt-16 pb-12 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Simple, transparent pricing</h1>
        <p className="text-base text-[#6b6690] max-w-md mx-auto">
          Pay per event, not per month. Fits how college clubs actually budget.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-xl mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 text-sm text-red-400 text-center mx-6">
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="flex flex-col md:flex-row flex-wrap gap-5 max-w-5xl mx-auto px-6 pb-20 justify-center">
        {PLANS.map(plan => (
          <div key={plan.id} className={`
            flex-1 min-w-[280px] max-w-sm p-8 rounded-[1.25rem] relative transition-transform duration-300 hover:-translate-y-1
            ${plan.highlight ? 'border border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.12)]' : 'border border-white/10 bg-white/5'}
          `}>
            {plan.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[11px] font-bold px-3.5 py-1 rounded-full whitespace-nowrap tracking-wide">
                Most popular
              </div>
            )}
            {club?.plan === plan.id && (
              <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                Current
              </div>
            )}
            <div className="text-sm font-semibold text-[#8884a8] mb-1.5">{plan.name}</div>
            <div className="text-4xl md:text-5xl font-black tracking-tight mb-1 text-[#f0eeff]">
              {plan.price === 0 ? '₹0' : `₹${plan.price.toLocaleString('en-IN')}`}
            </div>
            <div className="text-sm text-[#56527a] mb-2.5">{plan.per}</div>
            <div className="text-sm text-[#6b6690] mb-6 leading-relaxed min-h-[40px]">{plan.desc}</div>
            
            <ul className="flex flex-col gap-2.5 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex gap-2.5 text-sm text-[#b0abc8] leading-snug items-start">
                  <span className={`font-bold shrink-0 ${plan.highlight ? 'text-indigo-400' : 'text-indigo-500'}`}>✓</span> 
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => !plan.disabled && handleUpgrade(plan.id)}
              disabled={plan.disabled || loading === plan.id || club?.plan === plan.id}
              className={`
                block w-full py-3 text-center rounded-xl text-sm font-semibold transition-all duration-300
                ${plan.disabled || club?.plan === plan.id 
                  ? 'bg-white/5 text-[#56527a] cursor-not-allowed' 
                  : plan.highlight 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)]' 
                    : 'bg-white/10 text-[#b0abc8] hover:bg-white/20'
                }
                ${loading && loading !== plan.id ? 'opacity-60' : 'opacity-100'}
              `}>
              {loading === plan.id ? 'Opening payment…' : club?.plan === plan.id ? 'Current plan' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-center">Frequently asked questions</h2>
        <div className="flex flex-col gap-2">
          {FAQ.map((item, i) => (
            <div key={i} className="border border-white/10 rounded-xl overflow-hidden transition-colors duration-300">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full text-left px-5 py-4 flex justify-between items-center transition-colors
                  ${openFaq === i ? 'bg-indigo-500/10' : 'bg-white/[0.02] hover:bg-white/[0.04]'}
                `}>
                <span className="text-sm font-semibold text-[#ddd9f5] pr-4">{item.q}</span>
                <span className="text-indigo-500 text-lg leading-none shrink-0 transition-transform duration-300">
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-4 pt-1 text-sm text-[#6b6690] leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 py-6 px-6 text-center text-xs text-[#3a3758]">
        © 2026 EventFlow · <a href="mailto:hello@eventflow.app" className="text-[#3a3758] hover:text-[#56527a] transition-colors">hello@eventflow.app</a>
      </div>
    </div>
  )
}
