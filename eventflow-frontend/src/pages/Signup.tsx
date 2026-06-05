import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { setToken, setStoredClub } from '@/lib/auth'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', college: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/signup', form)
      setToken(data.token)
      setStoredClub(data.club)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
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
            Start for free
          </div>
          <div className="text-sm text-[#8884a8] leading-relaxed mb-8">
            No credit card. No payment upfront. Get your first event running in minutes.
          </div>
          <div className="flex flex-col gap-4">
            {['1 free event to start', 'QR codes sent to attendees', 'Mobile gate scanner included', 'Upgrade only when you need to'].map(f => (
              <div key={f} className="flex gap-3 text-[13px] text-[#a09cc0] items-center bg-white/[0.03] p-3 rounded-lg border border-white/[0.05]">
                <div className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">✓</div> 
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-gradient-to-br from-indigo-50/30 to-purple-50/30">
        
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-md">E</div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">EventFlow</span>
          </Link>
        </div>

        <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mt-12 lg:mt-0">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1.5">Create your club account</h2>
          <p className="text-sm text-gray-500 mb-8">
            Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign in</Link>
          </p>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-6 font-medium shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Club Name</label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                name="name" type="text" required autoFocus
                value={form.name} onChange={handle} placeholder="IEEE Student Branch" 
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email address</label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                name="email" type="email" required
                value={form.email} onChange={handle} placeholder="club@college.edu" 
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                Password <span className="text-gray-400 font-normal ml-1">(min 8 characters)</span>
              </label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                name="password" type="password" required minLength={8}
                value={form.password} onChange={handle} placeholder="••••••••" 
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                College <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                name="college" type="text"
                value={form.college} onChange={handle} placeholder="IIT BHU, Varanasi" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className={`
                mt-3 py-3 px-4 w-full text-[15px] font-bold text-white rounded-xl shadow-lg transition-all duration-300
                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'}
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account…</span>
                </div>
              ) : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
