import { useState, useEffect } from 'react'
import { getAdminToken } from '@/lib/auth'

type Club = {
  id: string
  name: string
  email: string
  plan: string
  created_at: string
}

export default function AdminDashboard() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      const res = await fetch('http://localhost:5000/admin/clubs', {
        headers: { Authorization: `Bearer ${getAdminToken()}` }
      })
      if (!res.ok) throw new Error('Failed to fetch clubs')
      const data = await res.json()
      setClubs(data.clubs)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updatePlan = async (id: string, newPlan: string) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/clubs/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}` 
        },
        body: JSON.stringify({ plan: newPlan })
      })
      if (!res.ok) throw new Error('Failed to update plan')
      fetchClubs()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight text-ink">Clubs Overview</h1>
        <p className="text-ink-soft mt-1">Manage all registered clubs and their subscriptions.</p>
      </div>

      {error && <div className="text-rust bg-rust-soft p-4 rounded-xl mb-4 border border-rust/20 font-medium">{error}</div>}

      {loading ? (
        <div className="skeleton h-64 w-full rounded-2xl"></div>
      ) : (
        <div className="vc-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-paper-dim border-b border-line text-xs font-semibold text-ink-soft uppercase tracking-wider">
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 font-medium">Plan</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clubs.map((club) => (
                <tr key={club.id} className="hover:bg-paper-dim transition-colors duration-200">
                  <td className="px-5 py-4 font-medium text-ink">{club.name}</td>
                  <td className="px-5 py-4 text-ink-soft">{club.email}</td>
                  <td className="px-5 py-4 text-ink-soft text-sm">{new Date(club.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${club.plan === 'pro' ? 'badge-amber' : club.plan === 'institution' ? 'badge-blue' : 'badge-default'}`}>
                      {club.plan}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={club.plan}
                      onChange={(e) => updatePlan(club.id, e.target.value)}
                      className="input py-1.5 px-3 w-[150px] text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="institution">Institution</option>
                    </select>
                  </td>
                </tr>
              ))}
              {clubs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink-soft">
                    No clubs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
