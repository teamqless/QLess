import { useState } from 'react'
import { getAdminToken } from '@/lib/auth'

export default function CreateClub() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState('free')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let pass = ''
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(pass)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('http://localhost:5000/admin/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ name, email, password, plan })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create club')

      setSuccess(`Club "${data.club.name}" created successfully! Credentials: Email: ${data.club.email}, Password: ${password}`)
      setName('')
      setEmail('')
      setPassword('')
      setPlan('free')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in-up mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight text-ink">Create New Club</h1>
        <p className="text-ink-soft mt-1">Generate an account for a new club.</p>
      </div>

      {error && <div className="p-4 mb-6 bg-rust-soft border border-rust/20 text-rust font-medium rounded-xl flex items-center gap-2"><span className="text-lg">⚠</span> {error}</div>}
      {success && <div className="p-4 mb-6 bg-teal-soft border border-teal/20 text-teal-deep font-medium rounded-xl whitespace-pre-wrap flex items-center gap-2"><span className="text-lg">✓</span> {success}</div>}

      <form onSubmit={handleSubmit} className="vc-card p-6 space-y-6">
        <div>
          <label className="section-label block mb-2">Club Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="e.g. Google Developer Student Club"
          />
        </div>

        <div>
          <label className="section-label block mb-2">Club Email (Login ID)</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="club@university.edu"
          />
        </div>

        <div>
          <label className="section-label block mb-2">Temporary Password</label>
          <div className="flex gap-3">
            <input
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input flex-1"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={generatePassword}
              className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label className="section-label block mb-2">Initial Plan</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="input appearance-none"
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="institution">Institution</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !password}
          className={`
            inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 text-paper text-sm px-4.5 py-3 w-full mt-4
            ${(loading || !password) ? 'bg-ink-soft cursor-not-allowed opacity-70' : 'bg-ink hover:bg-ink-soft cursor-pointer shadow-sm'}
          `}
        >
          {loading ? 'Creating...' : 'Create Club & Generate Credentials'}
        </button>
      </form>
    </div>
  )
}
