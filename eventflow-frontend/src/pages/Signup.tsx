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
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface-2)' }}>
      {/* Left panel */}
      <div style={{
        width: 420, background: '#0f0e1a', display: 'flex', flexDirection: 'column',
        padding: '40px', flexShrink: 0,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 'auto' }}>
          <div style={{ width: 28, height: 28, background: '#6366f1', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white' }}>E</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'white', letterSpacing: '-0.3px' }}>EventFlow</span>
        </Link>
        <div style={{ paddingBottom: 60 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 12 }}>
            Start for free
          </div>
          <div style={{ fontSize: 14, color: '#6b6880', lineHeight: 1.7, marginBottom: 28 }}>
            No credit card. No payment upfront. Get your first event running in minutes.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['1 free event to start', 'QR codes sent to attendees', 'Mobile gate scanner included', 'Upgrade only when you need to'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#a09cc0' }}>
                <span style={{ color: '#6366f1' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.3px', marginBottom: 6 }}>Create your club account</h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 28 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Club Name</label>
              <input className="input" name="name" type="text" required autoFocus
                value={form.name} onChange={handle} placeholder="IEEE Student Branch" />
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="input" name="email" type="email" required
                value={form.email} onChange={handle} placeholder="club@college.edu" />
            </div>
            <div>
              <label className="label">Password <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(min 8 characters)</span></label>
              <input className="input" name="password" type="password" required minLength={8}
                value={form.password} onChange={handle} placeholder="••••••••" />
            </div>
            <div>
              <label className="label">College <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <input className="input" name="college" type="text"
                value={form.college} onChange={handle} placeholder="IIT BHU, Varanasi" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: 4 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
