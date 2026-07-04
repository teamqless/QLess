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
    <div className="max-w-2xl animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Club</h1>
          <p className="page-subtitle">Generate an account for a new club.</p>
        </div>
      </div>

      {error && <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl">{error}</div>}
      {success && <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl whitespace-pre-wrap">{success}</div>}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="label">Club Name</label>
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
          <label className="label">Club Email (Login ID)</label>
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
          <label className="label">Temporary Password</label>
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
              className="btn btn-ghost"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label className="label">Initial Plan</label>
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
          className="btn btn-primary w-full py-3 mt-4"
        >
          {loading ? 'Creating...' : 'Create Club & Generate Credentials'}
        </button>
      </form>
    </div>
  )
}
