import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Camera, Delete } from 'lucide-react'
import { QLessLogo } from '@/components/qless/Logo'
import { MagneticButton } from '@/components/qless/MagneticButton'
import api from '@/lib/api'
import { useEvents } from '@/hooks/useEvents'

export default function ScannerLogin() {
  const [pin, setPin] = useState('')
  const [eventId, setEventId] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { data: events } = useEvents()

  const press = (d: string) => setPin((p) => (p.length < 4 ? p + d : p))
  const back = () => setPin((p) => p.slice(0, -1))

  const launch = async () => {
    if (pin.length !== 4) {
      toast.error('Enter your 4-digit code')
      return
    }
    if (!eventId) {
      toast.error('Select an event')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/volunteers/auth', {
        access_code: pin,
        event_id: eventId,
      })
      localStorage.setItem('scanner_token', data.token)
      localStorage.setItem('scanner_event_id', data.event_id ?? eventId)
      navigate(`/scanner/${data.event_id ?? eventId}`)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid access code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <QLessLogo size={40} className="justify-center" />
          <p className="mt-2 text-sm text-muted-foreground">Gate Scanner PWA</p>
        </div>

        <div className="glass-strong rounded-3xl p-6 ring-glow">
          <h1 className="text-2xl font-bold text-center">Volunteer Access</h1>
          <p className="mt-1 text-sm text-muted-foreground text-center">Enter your 4-digit passcode</p>

          <div className="mt-6 flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={pin[i] ? { scale: [1, 1.15, 1] } : {}}
                className={`h-14 w-14 rounded-2xl grid place-items-center text-3xl font-mono font-bold border ${
                  pin[i] ? 'bg-primary/15 border-primary text-primary glow-cyan' : 'border-white/10 text-muted-foreground'
                }`}
              >
                {pin[i] ? '•' : ''}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => press(d)}
                className="h-16 rounded-2xl glass text-2xl font-semibold hover:bg-white/10 active:scale-95 transition-transform"
              >
                {d}
              </button>
            ))}
            <div />
            <button
              onClick={() => press('0')}
              className="h-16 rounded-2xl glass text-2xl font-semibold hover:bg-white/10 active:scale-95 transition-transform"
            >
              0
            </button>
            <button
              onClick={back}
              className="h-16 rounded-2xl glass grid place-items-center hover:bg-white/10 active:scale-95 transition-transform"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">
            <label className="text-xs text-muted-foreground">Assigned event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="mt-1.5 w-full glass rounded-xl h-11 px-3 text-sm bg-transparent outline-none"
            >
              <option value="" className="bg-background">Select event</option>
              {(events ?? []).map((e) => (
                <option key={e.id} value={e.id} className="bg-background">
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <MagneticButton className="mt-6 w-full" size="lg" loading={loading} onClick={launch}>
            <Camera className="h-5 w-5" /> Launch Camera
          </MagneticButton>
        </div>
      </div>
    </div>
  )
}
