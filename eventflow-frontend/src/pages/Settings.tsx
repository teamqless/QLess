import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { AdminLayout } from '@/components/qless/AdminLayout'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { Lock, Mail, AlertTriangle, ShieldAlert, CheckCircle2, AlertCircle, Settings as SettingsIcon, Server, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Tab = 'password' | 'email' | 'danger'

const TAB_LABELS: { id: Tab; label: string; icon: any; proOnly?: boolean }[] = [
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'email',    label: 'Email Settings', icon: Mail },
  { id: 'danger',   label: 'Danger Zone', icon: ShieldAlert },
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
    <AdminLayout title="Settings & SMTP">
      <div className="w-full max-w-4xl pb-12 pt-4 animate-fade-in-up">
        <div className="mb-10">
        <h1 className="font-display font-bold text-4xl text-foreground tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your club account, security, and email preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-2 mb-8 bg-black/40 border border-white/5 rounded-2xl p-2 w-max max-w-full scrollbar-hide shadow-inner">
        {TAB_LABELS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`
                whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2.5
                ${tab === t.id ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-muted-foreground hover:text-foreground hover:bg-white/10'}
              `}>
              <Icon className="w-4 h-4" /> {t.label}
              {t.proOnly && !isProOrAbove && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded flex-shrink-0 font-bold border border-amber-500/30 uppercase tracking-widest">PRO</span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Password tab ── */}
        {tab === 'password' && (
          <motion.div key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-strong rounded-3xl p-6 md:p-8 ring-glow max-w-2xl">
            <div className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </div>
            
            {pwMsg && <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground mb-6 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> {pwMsg}</div>}
            {pwErr && <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {pwErr}</div>}
            
            <form onSubmit={changePassword} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Current Password</label>
                <div className="flex items-center gap-3 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">New Password</label>
                <div className="flex items-center gap-3 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} placeholder="Min 8 characters" />
                </div>
              </div>
              <div className="pt-2">
                <MagneticButton type="submit" disabled={savingPw}>
                  {savingPw ? 'Changing…' : 'Change Password'}
                </MagneticButton>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Custom Email (SMTP) tab ── */}
        {tab === 'email' && (
          <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-strong rounded-3xl p-6 md:p-8 ring-glow">
            <div className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Email Configuration
            </div>

            <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-relaxed">
              Configure your club's SMTP settings to send QR passes from your own custom email address.
              Works perfectly with Gmail (using App Passwords), Outlook, or any standard SMTP provider.
            </p>

            {/* Current sender info */}
            <div className="glass rounded-2xl p-5 mb-8 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Sending Mode</div>
              {club?.smtp_host
                ? <div className="text-sm font-medium text-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Custom SMTP active — sending as <strong className="text-green-400">{club.smtp_from_email}</strong></div>
                : <div className="text-sm text-muted-foreground flex items-center gap-2"><Server className="w-4 h-4" /> Using QLess default sender (<code className="font-mono bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-primary text-xs">onboarding@resend.dev</code>).</div>
              }
            </div>

            {smtpMsg && <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground mb-6 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> {smtpMsg}</div>}
            {smtpErr && <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {smtpErr}</div>}

            <form onSubmit={saveSmtp} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">SMTP Host</label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={smtp.smtp_host} onChange={e => setSmtp(p => ({ ...p, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Port</label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={smtp.smtp_port} onChange={e => setSmtp(p => ({ ...p, smtp_port: e.target.value }))} placeholder="587" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Username / Email</label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={smtp.smtp_user} onChange={e => setSmtp(p => ({ ...p, smtp_user: e.target.value }))} placeholder="yourclub@gmail.com" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Password / App Password</label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" type="password" value={smtp.smtp_pass} onChange={e => setSmtp(p => ({ ...p, smtp_pass: e.target.value }))} placeholder="••••••••••••" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">From Name</label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={smtp.smtp_from_name} onChange={e => setSmtp(p => ({ ...p, smtp_from_name: e.target.value }))} placeholder="IEEE Student Branch" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">From Email</label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={smtp.smtp_from_email} onChange={e => setSmtp(p => ({ ...p, smtp_from_email: e.target.value }))} placeholder="events@yourclub.edu" />
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-500/90 leading-relaxed flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                <div>
                  For Gmail, you MUST use an <strong className="text-amber-400">App Password</strong> (not your regular login password). Go to your Google Account → Security → 2-Step Verification → App passwords to generate one.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <MagneticButton type="submit" disabled={savingSmtp}>
                  {savingSmtp ? 'Saving Settings…' : 'Save SMTP Settings'}
                </MagneticButton>
                
                {club?.smtp_host && (
                  <button type="button" onClick={testSmtp} disabled={testingSmtp} className="glass px-6 h-12 rounded-xl font-semibold text-foreground hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10">
                    <RefreshCw className={`w-4 h-4 ${testingSmtp ? 'animate-spin' : ''}`} /> {testingSmtp ? 'Sending Test Email…' : 'Send Test Email'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Danger zone tab ── */}
        {tab === 'danger' && (
          <motion.div key="danger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-strong rounded-3xl p-6 md:p-8 border border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <div className="text-lg font-bold text-destructive mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Danger Zone
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              These actions are extremely permanent and cannot be undone. Proceed with caution.
            </p>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 gap-4">
                <div>
                  <div className="text-sm font-bold text-foreground">Delete all events</div>
                  <div className="text-xs text-muted-foreground mt-1">Removes all draft events from your dashboard. Published events cannot be deleted.</div>
                </div>
                <button className="px-5 h-10 rounded-xl font-semibold text-sm bg-destructive hover:bg-destructive/90 text-white transition-colors shadow-lg shadow-destructive/20 whitespace-nowrap self-start md:self-auto" onClick={() => alert('Contact support to perform bulk deletions.')}>
                  Delete drafts
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 gap-4">
                <div>
                  <div className="text-sm font-bold text-foreground">Delete account</div>
                  <div className="text-xs text-muted-foreground mt-1">Permanently deletes your club and all associated data, events, and attendees from our servers.</div>
                </div>
                <button className="px-5 h-10 rounded-xl font-semibold text-sm bg-destructive hover:bg-destructive/90 text-white transition-colors shadow-lg shadow-destructive/20 whitespace-nowrap self-start md:self-auto" onClick={() => alert('Contact support at hello@eventflow.app to delete your account.')}>
                  Delete account
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AdminLayout>
  )
}
