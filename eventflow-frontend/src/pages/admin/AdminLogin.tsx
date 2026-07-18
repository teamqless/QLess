import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAdminToken } from '@/lib/auth'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-ink">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-amber/30 blur-[150px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-soft/20 blur-[150px] rounded-full animate-float" />
      
      <div className="vc-card w-full max-w-md p-8 z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-soft flex items-center justify-center mx-auto mb-4 border border-amber/20">
            <span className="text-amber-deep font-bold text-3xl">S</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Super Admin</h1>
          <p className="text-ink-soft mt-2">Manage all clubs & subscriptions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rust-soft border border-rust/20 rounded-xl text-rust text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="section-label block mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="section-label block mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4"
            size="lg"
            variant="accent"
          >
            {loading ? (
              <>
                <Spinner size={16} color="text-ink" />
                <span className="ml-2">Logging in...</span>
              </>
            ) : 'Login to Admin Panel'}
          </Button>
        </form>
      </div>
    </div>
  )
}
