import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '@/lib/api'
import { setToken, setStoredClub } from '@/lib/auth'

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

      setToken(data.token)
      setStoredClub(data.club)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left Panel - Dark Mode aesthetic (always dark) */}
      <div className="hidden lg:flex flex-1 bg-[#050505] relative overflow-hidden flex-col justify-between p-12">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-800/20 rounded-full blur-[120px] mix-blend-screen" />
        
        {/* Animated Line */}
        <div className="absolute top-0 left-[20%] w-[1px] h-full bg-gradient-to-b from-transparent via-red-500/50 to-transparent" />
        <div className="absolute top-[30%] left-[20%] w-[1px] h-32 bg-red-400 blur-sm shadow-[0_0_15px_rgba(239,68,68,1)] animate-bounce" />

        <Link to="/" className="flex items-center gap-3 no-underline mb-auto relative z-10 hover:opacity-90 transition-opacity">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <circle cx="16" cy="16" r="12" stroke="#EF4444" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="60 16"></circle>
            <path d="M22 22L30 30" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"></path>
            <path d="M14 16L18 20L26 12" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"></path>
          </svg>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            Q<span className="text-red-600">Less</span>
          </span>
        </Link>
        
        <div className="pb-16 relative z-10">
          <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-4">
            The QLess Ecosystem
          </div>
          <div className="text-4xl font-black text-white tracking-tight leading-tight mb-6">
            Intelligence at Scale.
          </div>
          <div className="text-[15px] text-slate-400 leading-relaxed font-medium">
            We don't just track your registrations; we harmonize your entire logistical operation. QLess is the single, powerful ecosystem that turns chaotic event data into precise, automated intelligence.
          </div>
        </div>
      </div>

      {/* Right Panel - Dynamic Form (Light/Dark aware) */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#f4fdff] dark:bg-[#0a0a0a] p-6 transition-colors duration-300">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Sign in to manage your events and registrations.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-6 font-medium flex items-center gap-2">
              <span className="text-lg leading-none shrink-0">⚠</span> {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                id="username"
                className="w-full border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0B1528] focus:bg-white dark:focus:bg-[#11203b] focus:border-red-600 dark:focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                name="email" type="text" required
                value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@university.edu" 
                autoComplete="username"
                readOnly={isReadOnly}
                onFocus={() => setIsReadOnly(false)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <input 
                id="password"
                className="w-full border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-[#0B1528] focus:bg-white dark:focus:bg-[#11203b] focus:border-red-600 dark:focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
                name="password" type="password" required
                value={form.password} onChange={handle} placeholder="••••••••" 
                autoComplete="current-password"
                readOnly={isReadOnly}
                onFocus={() => setIsReadOnly(false)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  Authenticating…
                </>
              ) : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
