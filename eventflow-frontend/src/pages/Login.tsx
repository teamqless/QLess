import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, X } from 'lucide-react'
import api from '@/lib/api'
import { setToken, setStoredClub, setAdminToken } from '@/lib/auth'
import { QLessLogo } from '@/components/qless/Logo'
import { MagneticButton } from '@/components/qless/MagneticButton'

const TESTIMONIALS = [
  { quote: 'QLess replaced our 5 spreadsheets and 3 WhatsApp groups. Setup took 20 minutes.', who: 'Aisha K. — TechFest Lead' },
  { quote: 'Gate entry went from 45 minutes to zero queue. Volunteers loved the scanner.', who: 'Rohan M. — Cultura Head' },
  { quote: 'Payment verification used to be my nightmare. Now it\'s a two-second tap.', who: 'Priya S. — Startup Cell' },
]

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        className="glass-strong rounded-3xl p-8 max-w-sm w-full relative ring-glow text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <QLessLogo size={32} className="mx-auto mb-6 justify-center" />
        <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
        <p className="text-sm text-muted-foreground mb-8">Get in touch with us. We're here to help!</p>
        
        <div className="glass rounded-2xl p-6 text-left space-y-4">
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Email:</p>
            <a href="mailto:team.qless@gmail.com" className="text-sm text-primary hover:underline">
              team.qless@gmail.com
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Phone:</p>
            <a href="tel:+919129484479" className="text-sm text-primary hover:underline">
              +91 9129484479
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tIdx, setTIdx] = useState(0)
  const [form, setForm] = useState({ email: '', password: '' })
  const [isReadOnly, setIsReadOnly] = useState(true)
  const [showContact, setShowContact] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })
      if (data.role === 'admin') {
        setAdminToken(data.token)
        navigate('/admin/dashboard')
      } else {
        setToken(data.token)
        setStoredClub(data.club)
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-background via-background to-accent/40">
        <div className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-violet/20 blur-3xl animate-float-slow" />
        </div>
        <QLessLogo size={40} />
        <div className="max-w-md">
          <div className="glass rounded-2xl p-6">
            <Sparkles className="h-6 w-6 text-primary mb-3" />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={tIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-lg font-medium"
              >
                "{TESTIMONIALS[tIdx].quote}"
                <footer className="mt-3 text-sm text-muted-foreground">— {TESTIMONIALS[tIdx].who}</footer>
              </motion.blockquote>
            </AnimatePresence>
            <div className="mt-4 flex gap-1.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === tIdx ? 'bg-primary w-8' : 'bg-white/20 w-4'}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 QLess. Next-gen event ops.</p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <QLessLogo />
          </div>
          <div className="glass-strong rounded-3xl p-8 ring-glow">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to your QLess account.</p>

            {error && (
              <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handle} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs text-muted-foreground">Email address or username</span>
                <div className="mt-1.5 flex items-center gap-2 glass rounded-xl px-3 h-11 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="admin@campus.edu"
                    className="flex-1 bg-transparent outline-none text-sm"
                    readOnly={isReadOnly}
                    onFocus={() => setIsReadOnly(false)}
                    autoComplete="username"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Password</span>
                <div className="mt-1.5 flex items-center gap-2 glass rounded-xl px-3 h-11 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-sm"
                    readOnly={isReadOnly}
                    onFocus={() => setIsReadOnly(false)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded accent-primary" defaultChecked />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <MagneticButton type="submit" loading={loading} className="w-full mt-2">
                Sign In <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowContact(true)}
                className="text-primary font-medium hover:underline"
              >
                Contact Us
              </button>
            </p>
          </div>
        </div>
      </div>
      <AnimatePresence>
        <ContactModal open={showContact} onClose={() => setShowContact(false)} />
      </AnimatePresence>
    </div>
  )
}
