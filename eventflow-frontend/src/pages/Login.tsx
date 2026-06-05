import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { setToken, setStoredClub } from '@/lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      setToken(data.token)
      setStoredClub(data.club)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] bg-[#0f0e1a] flex-col p-10 shrink-0 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-[10%] left-[-20%] w-[400px] h-[400px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[300px] h-[300px] bg-[radial-gradient(ellipse,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />

        <Link to="/" className="flex items-center gap-2 no-underline mb-auto relative z-10 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-500/20">E</div>
          <span className="font-bold text-lg text-white tracking-tight">EventFlow</span>
        </Link>
        
        <div className="pb-16 relative z-10">
          <div className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Welcome back
          </div>
          <div className="text-sm text-[#8884a8] leading-relaxed">
            Sign in to manage your events, review registrations, and track attendance with ease.
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-gradient-to-br from-indigo-50/30 to-purple-50/30">
        
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-md">E</div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">EventFlow</span>
          </Link>
        </div>

        <div className="w-full max-w-[400px] bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Sign in to your club</h2>
          <p className="text-sm text-gray-500 mb-8">
            Don't have an account? <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign up free</Link>
          </p>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-6 font-medium shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email address</label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                name="email" type="email" required autoFocus
                value={form.email} onChange={handle} placeholder="club@college.edu" 
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password</label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                name="password" type="password" required
                value={form.password} onChange={handle} placeholder="••••••••" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className={`
                mt-2 py-3 px-4 w-full text-[15px] font-bold text-white rounded-xl shadow-lg transition-all duration-300
                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'}
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </div>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
