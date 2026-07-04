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
      <div className="page-header">
        <div>
          <h1 className="page-title">Clubs Overview</h1>
          <p className="page-subtitle">Manage all registered clubs and their subscriptions.</p>
        </div>
      </div>

      {error && <div className="text-danger bg-danger-bg p-4 rounded-xl mb-4">{error}</div>}

      {loading ? (
        <div className="shimmer h-64 w-full"></div>
      ) : (
        <div className="table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-slate-600 font-semibold">Name</th>
                <th className="p-4 text-slate-600 font-semibold">Email</th>
                <th className="p-4 text-slate-600 font-semibold">Joined</th>
                <th className="p-4 text-slate-600 font-semibold">Plan</th>
                <th className="p-4 text-slate-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.id}>
                  <td className="font-bold text-text-1">{club.name}</td>
                  <td className="text-text-3 font-medium">{club.email}</td>
                  <td className="text-text-3">{new Date(club.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${club.plan}`}>
                      {club.plan}
                    </span>
                  </td>
                  <td>
                    <select
                      value={club.plan}
                      onChange={(e) => updatePlan(club.id, e.target.value)}
                      className="input py-1.5 px-3 max-w-[150px]"
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
                  <td colSpan={5} className="p-8 text-center text-gray-500">
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
