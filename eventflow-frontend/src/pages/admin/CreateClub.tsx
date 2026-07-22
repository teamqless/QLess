import { useState } from 'react'
import { getAdminToken } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Key, Mail, Building2, Sparkles, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react'
import { MagneticButton } from '@/components/qless/MagneticButton'

export default function CreateClub() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState('free')
  const [isPlanOpen, setIsPlanOpen] = useState(false)

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

      setSuccess(`Club "${data.club.name}" created successfully!\nEmail: ${data.club.email}\nPassword: ${password}`)
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
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight text-foreground flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          Create New Club
        </h1>
        <p className="text-muted-foreground mt-2">Generate an account and credentials for a new club.</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" /> 
          {error}
        </motion.div>
      )}
      
      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 bg-primary/10 border border-primary/20 text-primary font-medium text-sm rounded-xl whitespace-pre-wrap flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-6 md:p-8 space-y-6 ring-glow">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Club Name
          </label>
          <div className="flex items-center gap-2 glass rounded-xl px-3 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="e.g. Google Developer Student Club"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Club Email (Login ID)
          </label>
          <div className="flex items-center gap-2 glass rounded-xl px-3 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="club@university.edu"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" /> Temporary Password
          </label>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 glass rounded-xl px-3 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10 flex-1">
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="••••••••"
              />
            </div>
            <button
              type="button"
              onClick={generatePassword}
              className="px-5 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap text-foreground"
            >
              Generate
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Initial Plan</label>
          <div className="relative">
            <div 
              className="flex items-center gap-2 glass rounded-xl px-4 h-12 cursor-pointer transition-all duration-300 hover:bg-white/10"
              onClick={() => setIsPlanOpen(!isPlanOpen)}
            >
              <div className="flex-1 text-sm text-foreground capitalize">{plan}</div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isPlanOpen ? 'rotate-180' : ''}`} />
            </div>
            
            <AnimatePresence>
              {isPlanOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 w-full mt-2 bg-background/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                >
                  <div 
                    className={`px-4 py-3 text-sm cursor-pointer hover:bg-white/10 transition-colors ${plan === 'free' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                    onClick={() => { setPlan('free'); setIsPlanOpen(false) }}
                  >
                    Free
                  </div>
                  <div 
                    className={`px-4 py-3 text-sm cursor-pointer hover:bg-white/10 transition-colors ${plan === 'pro' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                    onClick={() => { setPlan('pro'); setIsPlanOpen(false) }}
                  >
                    Pro
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="pt-2">
          <MagneticButton
            type="submit"
            loading={loading}
            disabled={!password || !name || !email}
            className="w-full"
          >
            {loading ? 'Creating Club...' : 'Create Club & Generate Credentials'} <Plus className="w-4 h-4 ml-2" />
          </MagneticButton>
        </div>
      </form>
    </div>
  )
}
