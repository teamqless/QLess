import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '@/lib/api'
import { setToken, setStoredClub, setAdminToken } from '@/lib/auth'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(true)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex bg-paper font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-ink relative overflow-hidden flex-col justify-between p-12">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber/30 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet/20 rounded-full blur-[120px] mix-blend-screen" />
        
        {/* Animated Line */}
        <div className="absolute top-0 left-[20%] w-[1px] h-full bg-gradient-to-b from-transparent via-amber/50 to-transparent" />
        <div className="absolute top-[30%] left-[20%] w-[1px] h-32 bg-amber blur-sm shadow-[0_0_15px_rgba(232,163,61,0.8)] animate-bounce" />

        <Link to="/" className="flex items-center gap-3 no-underline mb-auto relative z-10 hover:opacity-90 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-paper">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="60 16"></circle>
            <path d="M22 22L30 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
            <path d="M14 16L18 20L26 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"></path>
          </svg>
          <span className="font-display font-extrabold text-2xl tracking-tight text-paper">
            Event<span className="text-amber">Flow</span>
          </span>
        </Link>
        
        <div className="pb-16 relative z-10">
          <div className="text-[10px] font-mono font-black text-amber uppercase tracking-[0.2em] mb-4">
            The QLess Ecosystem
          </div>
          <div className="font-display text-4xl font-black text-paper tracking-tight leading-tight mb-6">
            Intelligence at Scale.
          </div>
          <div className="text-[15px] text-paper/70 leading-relaxed font-medium">
            We don't just track your registrations; we harmonize your entire logistical operation. QLess is the single, powerful ecosystem that turns chaotic event data into precise, automated intelligence.
          </div>
        </div>
      </div>

      {/* Right Panel - Dynamic Form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-paper p-6 transition-colors duration-300">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink mb-2">
              Welcome back
            </h2>
            <p className="text-ink-soft">
              Sign in to manage your events and registrations.
            </p>
          </div>

          {error && (
            <div className="bg-rust-soft border border-rust/20 rounded-xl px-4 py-3 text-sm text-rust mb-6 font-medium flex items-center gap-2">
              <span className="text-lg leading-none shrink-0">⚠</span> {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label className="section-label block mb-2">Email Address or Admin Username</label>
              <input 
                id="username"
                className="input"
                name="email" type="text" required
                value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@university.edu or 'admin'" 
                autoComplete="username"
                readOnly={isReadOnly}
                onFocus={() => setIsReadOnly(false)}
              />
            </div>
            <div>
              <label className="section-label block mb-2">Password</label>
              <input 
                id="password"
                className="input"
                name="password" type="password" required
                value={form.password} onChange={handle} placeholder="••••••••" 
                autoComplete="current-password"
                readOnly={isReadOnly}
                onFocus={() => setIsReadOnly(false)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              variant="accent"
              className="w-full mt-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner size={16} color="text-ink" />
                  <span className="ml-2">Authenticating…</span>
                </>
              ) : 'Authenticate'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
