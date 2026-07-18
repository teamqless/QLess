import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAdminToken } from '@/lib/auth'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setAdminToken(data.token)
      navigate('/admin/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-dark">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand/30 blur-[150px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-brand-light/20 blur-[150px] rounded-full animate-float" />
      
      <div className="w-full max-w-md p-8 bg-surface-base border border-border-light rounded-2xl shadow-md z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4 border border-brand/20">
            <span className="text-brand font-bold text-3xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-text-1">Super Admin</h1>
          <p className="text-text-3 mt-2">Manage all clubs & subscriptions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-warning-bg border border-warning/20 rounded-xl text-warning text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-2 mb-1.5">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border-light rounded-xl text-text-1 placeholder-text-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-2 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border-light rounded-xl text-text-1 placeholder-text-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary mt-4 py-3 text-lg"
          >
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
