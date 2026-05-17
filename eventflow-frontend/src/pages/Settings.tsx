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
    <div style={{ maxWidth: 600 }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your club account and preferences</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: 'var(--surface-3)', borderRadius: 9, padding: 4, width: 'fit-content' }}>
        {TAB_LABELS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--surface)' : 'transparent',
              color: tab === t.id ? 'var(--text-1)' : 'var(--text-3)',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
            {t.label}
            {t.proOnly && !isProOrAbove && (
              <span style={{ fontSize: 10, background: '#ede9fe', color: '#7c3aed', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>PRO</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {tab === 'profile' && (
        <>
          {/* Current info */}
          <div className="card" style={{ padding: 22, marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Current Account</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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

          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Update Profile</div>
            {profileMsg && <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 14 }}>{profileMsg}</div>}
            {profileErr && <div style={{ background: 'var(--danger-bg)',  border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)',  marginBottom: 14 }}>{profileErr}</div>}
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">New Club Name</label>
                <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder={club?.name} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="label">College</label>
                  <input className="input" value={profile.college} onChange={e => setProfile(p => ({ ...p, college: e.target.value }))} placeholder={club?.college || 'Your college'} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="Contact number" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* ── Password tab ── */}
      {tab === 'password' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Change Password</div>
          {pwMsg && <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 14 }}>{pwMsg}</div>}
          {pwErr && <div style={{ background: 'var(--danger-bg)',  border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)',  marginBottom: 14 }}>{pwErr}</div>}
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="label">Current Password</label>
              <input className="input" type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} placeholder="Min 8 characters" />
            </div>
            <button type="submit" disabled={savingPw} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              {savingPw ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* ── Custom Email (SMTP) tab ── */}
      {tab === 'email' && (
        <>
          {(true || isProOrAbove) && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Email Settings</div>

              {/* Current sender info */}
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                <strong>Current sending mode:</strong>{' '}
                {club?.smtp_host
                  ? <span style={{ color: 'var(--success)' }}>✓ Custom SMTP — emails sent from your club address</span>
                  : <span>Using EventFlow default sender (<code style={{ fontFamily: 'monospace', background: 'var(--surface-3)', padding: '1px 5px', borderRadius: 4 }}>onboarding@resend.dev</code>). Configure SMTP below to send from your own email.</span>
                }
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.5 }}>
                Configure your club's SMTP settings to send QR passes from your own email address.
                Works with Gmail (use App Password), Outlook, or any SMTP provider.
              </p>

              {smtpMsg && <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 14 }}>{smtpMsg}</div>}
              {smtpErr && <div style={{ background: 'var(--danger-bg)',  border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)',  marginBottom: 14 }}>{smtpErr}</div>}

              {/* Current SMTP status */}
              {club?.smtp_host && (
                <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 16 }}>
                  ✓ SMTP configured — sending from <strong>{club.smtp_from_email || club.smtp_host}</strong>
                </div>
              )}

              <form onSubmit={saveSmtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">SMTP Host</label>
                    <input className="input" value={smtp.smtp_host} onChange={e => setSmtp(p => ({ ...p, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <label className="label">Port</label>
                    <input className="input" value={smtp.smtp_port} onChange={e => setSmtp(p => ({ ...p, smtp_port: e.target.value }))} placeholder="587" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">Username / Email</label>
                    <input className="input" value={smtp.smtp_user} onChange={e => setSmtp(p => ({ ...p, smtp_user: e.target.value }))} placeholder="yourclub@gmail.com" />
                  </div>
                  <div>
                    <label className="label">Password / App Password</label>
                    <input className="input" type="password" value={smtp.smtp_pass} onChange={e => setSmtp(p => ({ ...p, smtp_pass: e.target.value }))} placeholder="••••••••••••" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="label">From Name</label>
                    <input className="input" value={smtp.smtp_from_name} onChange={e => setSmtp(p => ({ ...p, smtp_from_name: e.target.value }))} placeholder="IEEE Student Branch" />
                  </div>
                  <div>
                    <label className="label">From Email</label>
                    <input className="input" value={smtp.smtp_from_email} onChange={e => setSmtp(p => ({ ...p, smtp_from_email: e.target.value }))} placeholder="events@yourclub.edu" />
                  </div>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                  💡 For Gmail, use an <strong>App Password</strong> (not your regular password). Go to Google Account → Security → 2-Step Verification → App passwords.
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={savingSmtp} className="btn btn-primary">
                    {savingSmtp ? 'Saving…' : 'Save SMTP Settings'}
                  </button>
                  {club?.smtp_host && (
                    <button type="button" onClick={testSmtp} disabled={testingSmtp} className="btn btn-ghost">
                      {testingSmtp ? 'Sending…' : 'Send test email'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ── Danger zone tab ── */}
      {tab === 'danger' && (
        <div className="card" style={{ padding: 24, border: '1px solid #fca5a5' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>Danger Zone</div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.6 }}>
            These actions are permanent and cannot be undone. Proceed with caution.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>Delete all events</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Removes all draft events. Published events cannot be deleted.</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => alert('Contact support to perform bulk deletions.')}>Delete drafts</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>Delete account</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Permanently deletes your club and all associated data.</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => alert('Contact support at hello@eventflow.app to delete your account.')}>Delete account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
