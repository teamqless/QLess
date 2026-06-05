import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateEvent } from '@/hooks/useEvents'
import FormBuilder from '@/components/events/FormBuilder'
import EventStatusBadge from '@/components/events/EventStatusBadge'
import type { FormField } from '@/types'

const STEPS = ['Basic Info', 'Registration Form', 'Preview']

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
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
      {/* Step progress */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((label, i) => (
          <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1 min-w-[120px]' : 'shrink-0'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-200
                ${step > i ? 'bg-green-500 text-white' : step === i ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-white/5 text-gray-400'}
              `}>
                {step > i ? '✓' : i + 1}
              </div>
              <span className={`text-sm whitespace-nowrap ${step === i ? 'font-semibold text-white' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-colors duration-200 ${step > i ? 'bg-green-500' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Basic Info */}
      {step === 0 && (
        <div className="card p-5 sm:p-7">
          <h2 className="text-lg font-bold mb-6 text-white tracking-tight">Event Details</h2>
          <div className="flex flex-col gap-5">
            <div>
              <label className="label">Event Title *</label>
              <input className="input" name="title" value={basic.title} onChange={handleBasic}
                placeholder="e.g. TechFest 2026" autoFocus />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input resize-y" name="description" value={basic.description}
                onChange={handleBasic as any} rows={3}
                placeholder="Tell attendees what this event is about…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="label">Venue</label>
                <input className="input" name="venue" value={basic.venue} onChange={handleBasic}
                  placeholder="Auditorium, Block A" />
              </div>
              <div>
                <label className="label">Entry Fee (₹)</label>
                <input className="input" name="entry_fee" type="number" min={0}
                  value={basic.entry_fee} onChange={handleBasic} placeholder="0 = free" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="label">Event Date & Time</label>
                <input className="input" name="event_date" type="datetime-local"
                  value={basic.event_date} onChange={handleBasic} />
              </div>
              <div>
                <label className="label">Registration Deadline</label>
                <input className="input" name="registration_deadline" type="datetime-local"
                  value={basic.registration_deadline} onChange={handleBasic} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="label">Capacity <span className="text-gray-400 font-normal">(optional)</span></label>
                <input className="input" name="capacity" type="number" min={1}
                  value={basic.capacity} onChange={handleBasic} placeholder="Leave blank for unlimited" />
              </div>
              <div>
                <label className="label">Theme Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="theme_color" value={basic.theme_color}
                    onChange={handleBasic}
                    className="w-11 h-9 rounded-md border border-white/10 cursor-pointer p-0.5 bg-transparent" />
                  <span className="text-sm text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-md">{basic.theme_color}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button onClick={() => setStep(1)} disabled={!basic.title.trim()}
              className="btn btn-primary w-full sm:w-auto">
              Next: Registration Form →
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — Form Builder */}
      {step === 1 && (
        <div className="card p-5 sm:p-7">
          <h2 className="text-lg font-bold mb-1.5 text-white tracking-tight">Registration Form</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Design the form attendees will fill out. Full Name and Email are always included automatically.
          </p>
          <FormBuilder value={fields} onChange={setFields} />
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
            <button onClick={() => setStep(0)} className="btn btn-ghost order-2 sm:order-1">← Back</button>
            <button onClick={() => setStep(2)} className="btn btn-primary order-1 sm:order-2">Next: Preview →</button>
          </div>
        </div>
      )}

      {/* Step 2 — Preview */}
      {step === 2 && (
        <div className="space-y-5">
          {/* Preview card */}
          <div className="card overflow-hidden">
            <div className="h-2 w-full" style={{ background: basic.theme_color }} />
            <div className="p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{basic.title}</h2>
                  {basic.description && <p className="text-sm text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">{basic.description}</p>}
                </div>
                <div className="shrink-0">
                  <EventStatusBadge status="draft" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {basic.venue && <span className="text-sm text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1.5">📍 {basic.venue}</span>}
                {basic.event_date && <span className="text-sm text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1.5">📅 {new Date(basic.event_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                <span className="text-sm text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1.5">🎟️ {basic.entry_fee === 0 ? 'Free entry' : `₹${basic.entry_fee}`}</span>
                {basic.capacity && <span className="text-sm text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1.5">👥 {basic.capacity} seats</span>}
              </div>
            </div>

            {/* Form preview */}
            <div className="px-5 pb-6 sm:px-7 sm:pb-7 border-t border-white/10 pt-5 sm:pt-6 bg-white/[0.02]">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Registration Form Preview
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Full Name', type: 'text', required: true },
                  { label: 'Email Address', type: 'email', required: true },
                  ...fields,
                ].map((f, i) => (
                  <div key={i}>
                    <div className="text-sm font-semibold text-gray-300 mb-1.5">
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </div>
                    <div className="h-10 bg-black/20 border border-white/10 rounded-lg" />
                  </div>
                ))}
                {basic.entry_fee > 0 && (
                  <div>
                    <div className="text-sm font-semibold text-gray-300 mb-1.5">
                      Payment Screenshot <span className="text-red-500">*</span>
                    </div>
                    <div className="h-10 bg-black/20 border border-dashed border-white/20 rounded-lg" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 shadow-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button onClick={() => setStep(1)} className="btn btn-ghost order-2 sm:order-1">← Back</button>
            <button onClick={submit} disabled={createEvent.isPending} className="btn btn-primary btn-lg order-1 sm:order-2">
              {createEvent.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating…</span>
                </div>
              ) : 'Create Event'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}