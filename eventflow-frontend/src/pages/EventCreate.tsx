import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateEvent } from '@/hooks/useEvents'
import FormBuilder from '@/components/events/FormBuilder'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import type { FormField } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '@/components/qless/AdminLayout'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { ArrowRight, ArrowLeft, Calendar, Clock, MapPin, Users, Palette, AlertCircle, FileSpreadsheet, FormInput, CheckCircle2, Ticket } from 'lucide-react'

const STEPS = ['Basic Info', 'Registration Method', 'Preview']

export default function EventCreate() {
  const navigate    = useNavigate()
  const createEvent = useCreateEvent()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  const [basic, setBasic] = useState({
    title: '', description: '', venue: '',
    event_date: '', registration_deadline: '',
    entry_fee: 0, capacity: '',
    theme_color: '#6366f1', banner_url: '',
    registration_type: 'native' as 'native' | 'sheet',
    sheet_url: '',
  })

  const [fields, setFields] = useState<FormField[]>([])

  const handleBasic = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setBasic(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async () => {
    setError('')
    try {
      const event = await createEvent.mutateAsync({
        ...basic,
        entry_fee: Number(basic.entry_fee),
        capacity:  basic.capacity ? Number(basic.capacity) : undefined,
        form_fields: fields,
      } as any)
      navigate(`/events/${event.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create event')
    }
  }

  return (
    <AdminLayout title="Create Event">
      <div className="max-w-4xl mx-auto w-full pb-12 animate-fade-in-up">
        {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-foreground">Create New Event</h1>
        <p className="text-muted-foreground mt-1">Set up your next amazing event on QLess.</p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((label, i) => (
          <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1 min-w-[140px]' : 'shrink-0'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors duration-300
                ${step > i ? 'bg-primary text-white shadow-lg shadow-primary/20' : step === i ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-white/10 text-muted-foreground'}
              `}>
                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm whitespace-nowrap transition-colors duration-300 ${step >= i ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-[2px] mx-4 transition-colors duration-300 rounded-full ${step > i ? 'bg-primary/50' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" /> 
          {error}
        </motion.div>
      )}

      {/* STEP 0: BASIC INFO */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-strong rounded-3xl p-6 md:p-8 ring-glow space-y-6"
          >
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Event Title <span className="text-destructive">*</span></label>
              <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                <input className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" name="title" value={basic.title} onChange={handleBasic} placeholder="e.g. TechFest 2026" autoFocus />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Description</label>
              <div className="flex gap-2 glass rounded-xl p-4 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                <textarea className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground resize-y min-h-[100px]" name="description" value={basic.description} onChange={handleBasic as any} placeholder="Tell attendees what this event is about…" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Venue</label>
                <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <input className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" name="venue" value={basic.venue} onChange={handleBasic} placeholder="Auditorium, Block A" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-2"><Ticket className="w-4 h-4" /> Entry Fee (₹)</label>
                <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <input className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" name="entry_fee" type="number" min={0} value={basic.entry_fee} onChange={handleBasic} placeholder="0 = free" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Event Date & Time</label>
                <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <input className="flex-1 bg-transparent outline-none text-foreground color-scheme-dark" name="event_date" type="datetime-local" value={basic.event_date} onChange={handleBasic} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Registration Deadline</label>
                <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <input className="flex-1 bg-transparent outline-none text-foreground color-scheme-dark" name="registration_deadline" type="datetime-local" value={basic.registration_deadline} onChange={handleBasic} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Capacity <span className="opacity-50 lowercase normal-case">(optional)</span></label>
                <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <input className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" name="capacity" type="number" min={1} value={basic.capacity} onChange={handleBasic} placeholder="Leave blank for unlimited" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-2"><Palette className="w-4 h-4" /> Theme Color</label>
                <div className="flex items-center gap-3 glass rounded-xl p-1.5 h-12 max-w-[200px] transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                  <input type="color" name="theme_color" value={basic.theme_color} onChange={handleBasic} className="w-12 h-full rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                  <span className="text-sm font-mono text-muted-foreground font-medium">{basic.theme_color}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <MagneticButton onClick={() => setStep(1)} disabled={!basic.title.trim()}>
                Next: Registration Form <ArrowRight className="w-4 h-4 ml-2" />
              </MagneticButton>
            </div>
          </motion.div>
        )}

        {/* STEP 1: REGISTRATION METHOD */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-strong rounded-3xl p-6 md:p-8 ring-glow"
          >
            <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">Registration Method</h2>
            <p className="text-sm text-muted-foreground mb-8">Choose how you want to collect registrations for your event.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${basic.registration_type === 'native' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/10 glass hover:bg-white/10'}`}
                onClick={() => setBasic(p => ({ ...p, registration_type: 'native' }))}
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <FormInput className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">QLess Form</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Build a custom form directly in QLess. We'll automatically generate QR codes and send tickets to attendees.</p>
              </div>

              <div
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${basic.registration_type === 'sheet' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/10 glass hover:bg-white/10'}`}
                onClick={() => setBasic(p => ({ ...p, registration_type: 'sheet' }))}
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Google Forms Sync</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Use your own external Google Form and sync responses securely from the attached Google Sheet.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              {basic.registration_type === 'native' ? (
                <div className="animate-fade-in">
                  <h3 className="text-md font-bold text-foreground mb-4 flex items-center gap-2"><FormInput className="w-5 h-5 text-primary" /> Form Builder</h3>
                  <FormBuilder value={fields} onChange={setFields} />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h3 className="text-md font-bold text-foreground mb-4 flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-green-500" /> Google Sheet Configuration</h3>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Public Google Sheet URL <span className="text-destructive">*</span></label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <input className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" name="sheet_url" value={basic.sheet_url} onChange={handleBasic} placeholder="https://docs.google.com/spreadsheets/d/..." />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    Make sure the sheet is public ("Anyone with the link can view"). You will map the specific columns on the event dashboard after creation.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
              <button onClick={() => setStep(0)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 text-foreground text-sm font-medium transition-colors order-2 sm:order-1">
                ← Back
              </button>
              <MagneticButton onClick={() => setStep(2)} disabled={basic.registration_type === 'sheet' && !basic.sheet_url} className="order-1 sm:order-2">
                Next: Preview <ArrowRight className="w-4 h-4 ml-2" />
              </MagneticButton>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-strong rounded-3xl overflow-hidden ring-glow">
              <div className="h-3 w-full" style={{ background: basic.theme_color }} />
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">{basic.title}</h2>
                    {basic.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{basic.description}</p>}
                  </div>
                  <div className="shrink-0">
                    <EventStatusBadge status="draft" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {basic.venue && <span className="text-xs font-medium text-foreground bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {basic.venue}</span>}
                  {basic.event_date && <span className="text-xs font-medium text-foreground bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(basic.event_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                  <span className="text-xs font-medium text-foreground bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> {basic.entry_fee === 0 ? 'Free entry' : `₹${basic.entry_fee}`}</span>
                  {basic.capacity && <span className="text-xs font-medium text-foreground bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {basic.capacity} seats</span>}
                </div>
              </div>

              <div className="px-6 pb-8 md:px-8 md:pb-8 border-t border-white/10 pt-6 bg-black/20">
                {basic.registration_type === 'native' ? (
                  <>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                      <FormInput className="w-4 h-4" /> Registration Form Preview
                    </p>
                    <div className="flex flex-col gap-5">
                      {[
                        { label: 'Full Name', type: 'text', required: true },
                        { label: 'Email Address', type: 'email', required: true },
                        ...fields,
                      ].map((f, i) => (
                        <div key={i}>
                          <div className="text-xs font-semibold text-foreground mb-2">
                            {f.label} {f.required && <span className="text-destructive">*</span>}
                          </div>
                          <div className="h-11 glass rounded-xl border border-white/5 opacity-50" />
                        </div>
                      ))}
                      {basic.entry_fee > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-foreground mb-2">
                            Payment Screenshot <span className="text-destructive">*</span>
                          </div>
                          <div className="h-20 glass rounded-xl border border-dashed border-white/20 flex items-center justify-center text-xs text-muted-foreground">Upload Area</div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 mx-auto flex items-center justify-center mb-4">
                      <FileSpreadsheet className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Google Forms Sync Ready</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Attendees will register using your external Google Form. You will be able to sync their responses directly from the sheet you provided.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 text-foreground text-sm font-medium transition-colors order-2 sm:order-1">
                ← Back
              </button>
              <MagneticButton onClick={submit} loading={createEvent.isPending} className="order-1 sm:order-2">
                {createEvent.isPending ? 'Creating Event...' : 'Launch Event'}
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AdminLayout>
  )
}