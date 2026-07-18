import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { setStoredClub } from '@/lib/auth'

export default function Profile() {
  const { data: club, refetch } = useAuth()

  const [profile, setProfile] = useState({
    name: club?.name || '',
    college: club?.college || '',
    phone: club?.phone || ''
  })
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [saving, setSaving] = useState(false)

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setProfileMsg(''); setProfileErr('')
    try {
      const updates: any = {}
      if (profile.name) updates.name = profile.name
      if (profile.college) updates.college = profile.college
      if (profile.phone) updates.phone = profile.phone
      const { data } = await api.patch('/auth/profile', updates)
      setStoredClub(data.club)
      await refetch()
      setProfileMsg('Profile updated successfully')
    } catch (err: any) {
      setProfileErr(err.response?.data?.error || 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="w-full max-w-3xl pb-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Club Profile</h1>
          <p className="text-sm text-ink-soft mt-1">View and manage your complete club information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current info */}
        <div className="vc-card p-5 sm:p-6">
          <div className="text-xs font-bold text-ink-soft uppercase tracking-widest mb-4">Complete Information</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: 'Club Name', value: club?.name },
              { label: 'Email', value: club?.email },
              { label: 'College', value: club?.college || '—' },
              { label: 'Phone', value: club?.phone || '—' },
              { label: 'Plan', value: club?.plan === 'free' ? 'Free' : club?.plan === 'pro' ? 'Club Pro' : 'Institution' },
              { label: 'Joined', value: club?.created_at ? new Date(club.created_at).toLocaleDateString() : '—' },
            ].map(f => (
              <div key={f.label}>
                <div className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1">{f.label}</div>
                <div className="text-sm text-ink font-medium">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="vc-card p-5 sm:p-6">
          <div className="text-base font-semibold text-ink mb-4">Update Profile</div>
          {profileMsg && <div className="bg-teal-soft border border-teal/20 rounded-lg p-3 text-sm text-teal mb-4">{profileMsg}</div>}
          {profileErr && <div className="bg-rust-soft border border-rust/20 rounded-lg p-3 text-sm text-rust mb-4">{profileErr}</div>}

          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div>
              <label className="label">New Club Name</label>
              <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder={club?.name} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">College</label>
                <input className="input" value={profile.college} onChange={e => setProfile(p => ({ ...p, college: e.target.value }))} placeholder={club?.college || 'Your college'} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="Contact number" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5 mt-2 self-start w-full sm:w-auto">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
