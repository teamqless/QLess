import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { setStoredClub } from '@/lib/auth'

type Tab = 'profile' | 'password' | 'email' | 'danger'

const TAB_LABELS: { id: Tab; label: string; proOnly?: boolean }[] = [
  { id: 'profile',  label: 'Profile' },
  { id: 'password', label: 'Password' },
  { id: 'email',    label: 'Email Settings' },
  { id: 'danger',   label: 'Danger Zone' },
]

export default function Settings() {
  const { data: club, refetch } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')

  const [profile, setProfile]   = useState({ name: '', college: '', phone: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [smtp, setSmtp] = useState({ smtp_host: '', smtp_port: '587', smtp_user: '', smtp_pass: '', smtp_from_name: '', smtp_from_email: '' })

  const [profileMsg, setProfileMsg] = useState('')
  const [pwMsg,      setPwMsg]      = useState('')
  const [smtpMsg,    setSmtpMsg]    = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [pwErr,      setPwErr]      = useState('')
  const [smtpErr,    setSmtpErr]    = useState('')

  const [saving,   setSaving]   = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)

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

  const saveSmtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSmtp(true); setSmtpMsg(''); setSmtpErr('')
    try {
      await api.patch('/auth/smtp', smtp)
      setSmtpMsg('SMTP settings saved successfully')
      await refetch()
    } catch (err: any) {
      setSmtpErr(err.response?.data?.error || 'Failed to save SMTP settings')
    } finally { setSavingSmtp(false) }
  }

  const testSmtp = async () => {
    setTestingSmtp(true); setSmtpMsg(''); setSmtpErr('')
    try {
      const { data } = await api.post('/auth/smtp/test')
      setSmtpMsg(data.message)
    } catch (err: any) {
      setSmtpErr(err.response?.data?.error || 'Test failed')
    } finally { setTestingSmtp(false) }
  }

  const isProOrAbove = club?.plan === 'pro' || club?.plan === 'institution'

  return (
    <div className="w-full max-w-3xl pb-12">
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title text-2xl font-bold text-white tracking-tight mb-1">Settings</h1>
          <p className="page-subtitle text-sm text-gray-400">Manage your club account and preferences</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-1.5 w-max max-w-full scrollbar-hide border border-white/5">
        {TAB_LABELS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`
              whitespace-nowrap px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center gap-2
              ${tab === t.id ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'}
            `}>
            {t.label}
            {t.proOnly && !isProOrAbove && (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded flex-shrink-0 font-bold border border-purple-500/30">PRO</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {tab === 'profile' && (
        <div className="space-y-6">
          {/* Current info */}
          <div className="card p-5 sm:p-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Current Account</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: 'Club Name', value: club?.name },
                { label: 'Email',     value: club?.email },
                { label: 'College',   value: club?.college || '—' },
                { label: 'Plan',      value: club?.plan === 'free' ? 'Free' : club?.plan === 'pro' ? 'Club Pro' : 'Institution' },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{f.label}</div>
                  <div className="text-sm text-gray-200 font-medium">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <div className="text-base font-semibold text-white mb-4">Update Profile</div>
            {profileMsg && <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400 mb-4">{profileMsg}</div>}
            {profileErr && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 mb-4">{profileErr}</div>}
            
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
              <button type="submit" disabled={saving} className="btn btn-primary mt-2 self-start w-full sm:w-auto">
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Password tab ── */}
      {tab === 'password' && (
        <div className="card p-5 sm:p-6">
          <div className="text-base font-semibold text-white mb-4">Change Password</div>
          {pwMsg && <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400 mb-4">{pwMsg}</div>}
          {pwErr && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 mb-4">{pwErr}</div>}
          
          <form onSubmit={changePassword} className="flex flex-col gap-4">
            <div>
              <label className="label">Current Password</label>
              <input className="input" type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} placeholder="Min 8 characters" />
            </div>
            <button type="submit" disabled={savingPw} className="btn btn-primary mt-2 self-start w-full sm:w-auto">
              {savingPw ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* ── Custom Email (SMTP) tab ── */}
      {tab === 'email' && (
        <div className="card p-5 sm:p-6">
          <div className="text-base font-semibold text-white mb-3">Email Settings</div>

          {/* Current sender info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 text-sm text-gray-300 leading-relaxed">
            <strong className="text-gray-200">Current sending mode:</strong>{' '}
            {club?.smtp_host
              ? <span className="text-green-400 font-medium">✓ Custom SMTP — emails sent from your club address</span>
              : <span>Using EventFlow default sender (<code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-gray-300 border border-white/5">onboarding@resend.dev</code>). Configure SMTP below to send from your own email.</span>
            }
          </div>

          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Configure your club's SMTP settings to send QR passes from your own email address.
            Works with Gmail (use App Password), Outlook, or any SMTP provider.
          </p>

          {smtpMsg && <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400 mb-4">{smtpMsg}</div>}
          {smtpErr && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 mb-4">{smtpErr}</div>}

          {/* Current SMTP status */}
          {club?.smtp_host && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400 mb-5 font-medium">
              ✓ SMTP configured — sending from <strong className="text-green-300">{club.smtp_from_email || club.smtp_host}</strong>
            </div>
          )}

          <form onSubmit={saveSmtp} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="label">SMTP Host</label>
                <input className="input" value={smtp.smtp_host} onChange={e => setSmtp(p => ({ ...p, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" />
              </div>
              <div>
                <label className="label">Port</label>
                <input className="input" value={smtp.smtp_port} onChange={e => setSmtp(p => ({ ...p, smtp_port: e.target.value }))} placeholder="587" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Username / Email</label>
                <input className="input" value={smtp.smtp_user} onChange={e => setSmtp(p => ({ ...p, smtp_user: e.target.value }))} placeholder="yourclub@gmail.com" />
              </div>
              <div>
                <label className="label">Password / App Password</label>
                <input className="input" type="password" value={smtp.smtp_pass} onChange={e => setSmtp(p => ({ ...p, smtp_pass: e.target.value }))} placeholder="••••••••••••" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">From Name</label>
                <input className="input" value={smtp.smtp_from_name} onChange={e => setSmtp(p => ({ ...p, smtp_from_name: e.target.value }))} placeholder="IEEE Student Branch" />
              </div>
              <div>
                <label className="label">From Email</label>
                <input className="input" value={smtp.smtp_from_email} onChange={e => setSmtp(p => ({ ...p, smtp_from_email: e.target.value }))} placeholder="events@yourclub.edu" />
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200/80 leading-relaxed mt-2">
              💡 For Gmail, use an <strong className="text-amber-200">App Password</strong> (not your regular password). Go to Google Account → Security → 2-Step Verification → App passwords.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button type="submit" disabled={savingSmtp} className="btn btn-primary w-full sm:w-auto">
                {savingSmtp ? 'Saving…' : 'Save SMTP Settings'}
              </button>
              {club?.smtp_host && (
                <button type="button" onClick={testSmtp} disabled={testingSmtp} className="btn btn-ghost w-full sm:w-auto border border-white/10 hover:bg-white/5">
                  {testingSmtp ? 'Sending…' : 'Send test email'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── Danger zone tab ── */}
      {tab === 'danger' && (
        <div className="card p-5 sm:p-6 border border-red-500/30 bg-red-500/5">
          <div className="text-base font-semibold text-red-400 mb-2">Danger Zone</div>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            These actions are permanent and cannot be undone. Proceed with caution.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-200">Delete all events</div>
                <div className="text-xs text-gray-400 mt-1">Removes all draft events. Published events cannot be deleted.</div>
              </div>
              <button className="btn btn-danger btn-sm whitespace-nowrap self-start sm:self-auto" onClick={() => alert('Contact support to perform bulk deletions.')}>Delete drafts</button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-200">Delete account</div>
                <div className="text-xs text-gray-400 mt-1">Permanently deletes your club and all associated data.</div>
              </div>
              <button className="btn btn-danger btn-sm whitespace-nowrap self-start sm:self-auto" onClick={() => alert('Contact support at hello@eventflow.app to delete your account.')}>Delete account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
