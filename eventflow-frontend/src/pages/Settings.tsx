import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { setStoredClub } from '@/lib/auth'

export default function Settings() {
  const { data: club, refetch } = useAuth()
  const [profile, setProfile]   = useState({ name: '', college: '', phone: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [pwMsg, setPwMsg]           = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [pwErr, setPwErr]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [savingPw, setSavingPw]     = useState(false)

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setProfileMsg(''); setProfileErr('')
    try {
      const updates: any = {}
      if (profile.name)    updates.name    = profile.name
      if (profile.college) updates.college = profile.college
      if (profile.phone)   updates.phone   = profile.phone
      const { data } = await api.patch('/auth/profile', updates)
      setStoredClub(data.club)
      await refetch()
      setProfileMsg('Profile updated successfully')
      setProfile({ name: '', college: '', phone: '' })
    } catch (err: any) {
      setProfileErr(err.response?.data?.error || 'Update failed')
    } finally { setSaving(false) }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPw(true); setPwMsg(''); setPwErr('')
    try {
      await api.post('/auth/change-password', passwords)
      setPwMsg('Password changed successfully')
      setPasswords({ currentPassword: '', newPassword: '' })
    } catch (err: any) {
      setPwErr(err.response?.data?.error || 'Password change failed')
    } finally { setSavingPw(false) }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your club account</p>
        </div>
      </div>

      {/* Current info */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Current Account</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Club Name', value: club?.name },
            { label: 'Email',     value: club?.email },
            { label: 'College',   value: club?.college || '—' },
            { label: 'Plan',      value: club?.plan === 'free' ? 'Free' : club?.plan === 'pro' ? 'Club Pro' : 'Institution' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Update profile */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Update Profile</div>
        {profileMsg && <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 14 }}>{profileMsg}</div>}
        {profileErr && <div style={{ background: 'var(--danger-bg)', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 14 }}>{profileErr}</div>}
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">New Club Name</label>
            <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder={club?.name} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label">College</label>
              <input className="input" value={profile.college} onChange={e => setProfile(p => ({ ...p, college: e.target.value }))}
                placeholder={club?.college || 'Your college name'} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="Contact number" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Change Password</div>
        {pwMsg && <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 14 }}>{pwMsg}</div>}
        {pwErr && <div style={{ background: 'var(--danger-bg)', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 14 }}>{pwErr}</div>}
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" value={passwords.currentPassword}
              onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" value={passwords.newPassword}
              onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required minLength={8}
              placeholder="Min 8 characters" />
          </div>
          <button type="submit" disabled={savingPw} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {savingPw ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
