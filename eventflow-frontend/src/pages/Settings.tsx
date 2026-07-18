import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { setStoredClub } from '@/lib/auth'

type Tab = 'profile' | 'password' | 'email' | 'danger'

const TAB_LABELS: { id: Tab; label: string; proOnly?: boolean }[] = [
  { id: 'password', label: 'Password' },
  { id: 'email',    label: 'Email Settings' },
  { id: 'danger',   label: 'Danger Zone' },
]

export default function Settings() {
  const { data: club, refetch } = useAuth()
  const [tab, setTab] = useState<Tab>('password')
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [smtp, setSmtp] = useState({ smtp_host: '', smtp_port: '587', smtp_user: '', smtp_pass: '', smtp_from_name: '', smtp_from_email: '' })

  const [pwMsg,      setPwMsg]      = useState('')
  const [smtpMsg,    setSmtpMsg]    = useState('')
  const [pwErr,      setPwErr]      = useState('')
  const [smtpErr,    setSmtpErr]    = useState('')

  const [savingPw, setSavingPw] = useState(false)
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)

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
    <div className="w-full max-w-3xl pb-12 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Settings</h1>
          <p className="text-sm text-ink-soft mt-1">Manage your club account and preferences</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 mb-8 bg-paper-dim border border-line-soft rounded-xl p-1.5 w-max max-w-full scrollbar-hide">
        {TAB_LABELS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`
              whitespace-nowrap px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center gap-2
              ${tab === t.id ? 'bg-paper text-ink shadow-sm border border-line-soft' : 'text-ink-soft hover:text-ink hover:bg-paper/50'}
            `}>
            {t.label}
            {t.proOnly && !isProOrAbove && (
              <span className="text-[10px] bg-amber-soft text-amber-deep px-1.5 py-0.5 rounded flex-shrink-0 font-bold border border-amber/20">PRO</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Password tab ── */}
      {tab === 'password' && (
        <div className="vc-card p-5 sm:p-6">
          <div className="text-base font-semibold text-ink mb-4">Change Password</div>
          {pwMsg && <div className="bg-teal-soft border border-teal/20 rounded-lg p-3 text-sm text-teal mb-4">{pwMsg}</div>}
          {pwErr && <div className="bg-rust-soft border border-rust/20 rounded-lg p-3 text-sm text-rust mb-4">{pwErr}</div>}
          
          <form onSubmit={changePassword} className="flex flex-col gap-4">
            <div>
              <label className="label">Current Password</label>
              <input className="input" type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} placeholder="Min 8 characters" />
            </div>
            <button type="submit" disabled={savingPw} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5 mt-2 self-start w-full sm:w-auto">
              {savingPw ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* ── Custom Email (SMTP) tab ── */}
      {tab === 'email' && (
        <div className="vc-card p-5 sm:p-6">
          <div className="text-base font-semibold text-ink mb-3">Email Settings</div>

          {/* Current sender info */}
          <div className="bg-paper-dim border border-line-soft rounded-xl p-4 mb-5 text-sm text-ink-soft leading-relaxed">
            <strong className="text-ink">Current sending mode:</strong>{' '}
            {club?.smtp_host
              ? <span className="text-teal font-medium">✓ Custom SMTP — emails sent from your club address</span>
              : <span>Using EventFlow default sender (<code className="font-mono bg-paper-card px-1.5 py-0.5 rounded text-ink border border-line-soft">onboarding@resend.dev</code>). Configure SMTP below to send from your own email.</span>
            }
          </div>

          <p className="text-sm text-ink-soft mb-6 leading-relaxed">
            Configure your club's SMTP settings to send QR passes from your own email address.
            Works with Gmail (use App Password), Outlook, or any SMTP provider.
          </p>

          {smtpMsg && <div className="bg-teal-soft border border-teal/20 rounded-lg p-3 text-sm text-teal mb-4">{smtpMsg}</div>}
          {smtpErr && <div className="bg-rust-soft border border-rust/20 rounded-lg p-3 text-sm text-rust mb-4">{smtpErr}</div>}

          {/* Current SMTP status */}
          {club?.smtp_host && (
            <div className="bg-teal-soft border border-teal/20 rounded-lg p-3 text-sm text-teal mb-5 font-medium">
              ✓ SMTP configured — sending from <strong className="text-teal">{club.smtp_from_email || club.smtp_host}</strong>
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

            <div className="bg-amber-soft border border-amber/20 rounded-lg p-3 text-xs text-amber-deep leading-relaxed mt-2">
              💡 For Gmail, use an <strong className="text-amber">App Password</strong> (not your regular password). Go to Google Account → Security → 2-Step Verification → App passwords.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button type="submit" disabled={savingSmtp} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5 w-full sm:w-auto">
                {savingSmtp ? 'Saving…' : 'Save SMTP Settings'}
              </button>
              {club?.smtp_host && (
                <button type="button" onClick={testSmtp} disabled={testingSmtp} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5 w-full sm:w-auto">
                  {testingSmtp ? 'Sending…' : 'Send test email'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── Danger zone tab ── */}
      {tab === 'danger' && (
        <div className="vc-card p-5 sm:p-6 border border-rust/30 bg-rust-soft">
          <div className="text-base font-semibold text-rust mb-2">Danger Zone</div>
          <p className="text-sm text-ink-soft mb-6 leading-relaxed">
            These actions are permanent and cannot be undone. Proceed with caution.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-paper rounded-xl border border-line-soft gap-4">
              <div>
                <div className="text-sm font-medium text-ink">Delete all events</div>
                <div className="text-xs text-ink-soft mt-1">Removes all draft events. Published events cannot be deleted.</div>
              </div>
              <button className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-rust text-paper hover:bg-rust/90 shadow-sm text-sm px-4.5 py-2.5 whitespace-nowrap self-start sm:self-auto" onClick={() => alert('Contact support to perform bulk deletions.')}>Delete drafts</button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-paper rounded-xl border border-line-soft gap-4">
              <div>
                <div className="text-sm font-medium text-ink">Delete account</div>
                <div className="text-xs text-ink-soft mt-1">Permanently deletes your club and all associated data.</div>
              </div>
              <button className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-rust text-paper hover:bg-rust/90 shadow-sm text-sm px-4.5 py-2.5 whitespace-nowrap self-start sm:self-auto" onClick={() => alert('Contact support at hello@eventflow.app to delete your account.')}>Delete account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
