import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { setStoredClub } from '@/lib/auth'
import { AdminLayout } from '@/components/qless/AdminLayout'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { User, Building2, Phone, Mail, CheckCircle2, AlertCircle, Shield, Calendar, Edit3, ArrowRight, UserCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <AdminLayout title="Club Profile">
      <div className="w-full max-w-4xl pb-12 pt-4 animate-fade-in-up">
        <div className="mb-10">
        <h1 className="font-display font-bold text-4xl text-foreground tracking-tight flex items-center gap-3">
          <UserCircle2 className="w-8 h-8 text-primary" /> Club Profile
        </h1>
        <p className="text-muted-foreground mt-2">View and manage your complete club information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Current Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 md:p-8 ring-glow">
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Account Details
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Club Name</div>
                <div className="text-sm font-medium text-foreground flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5"><User className="w-4 h-4 text-muted-foreground" /> {club?.name}</div>
              </div>
              
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Email</div>
                <div className="text-sm font-medium text-foreground flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5"><Mail className="w-4 h-4 text-muted-foreground" /> {club?.email}</div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">College</div>
                <div className="text-sm font-medium text-foreground flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5"><Building2 className="w-4 h-4 text-muted-foreground" /> {club?.college || '—'}</div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Phone</div>
                <div className="text-sm font-medium text-foreground flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5"><Phone className="w-4 h-4 text-muted-foreground" /> {club?.phone || '—'}</div>
              </div>

              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Plan</div>
                  <div className="text-sm font-bold text-primary">{club?.plan === 'free' ? 'Free' : club?.plan === 'pro' ? 'Club Pro' : 'Institution'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Joined</div>
                  <div className="text-sm font-medium text-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {club?.created_at ? new Date(club.created_at).toLocaleDateString() : '—'}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Update Form */}
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-strong rounded-3xl p-6 md:p-8 ring-glow">
            <div className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" /> Update Profile
            </div>
            
            {profileMsg && <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground mb-6 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> {profileMsg}</div>}
            {profileErr && <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {profileErr}</div>}

            <form onSubmit={saveProfile} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">New Club Name</label>
                <div className="flex items-center gap-3 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder={club?.name} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">College</label>
                  <div className="flex items-center gap-3 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={profile.college} onChange={e => setProfile(p => ({ ...p, college: e.target.value }))} placeholder={club?.college || 'Your college'} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Phone</label>
                  <div className="flex items-center gap-3 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="Contact number" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <MagneticButton type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Profile Changes'} <ArrowRight className="w-4 h-4 ml-2" />
                </MagneticButton>
              </div>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
    </AdminLayout>
  )
}
