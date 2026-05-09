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
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: step > i ? 'var(--success)' : step === i ? 'var(--brand)' : 'var(--surface-3)',
                color: step >= i ? 'white' : 'var(--text-3)',
                transition: 'all 0.2s',
              }}>
                {step > i ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: step === i ? 600 : 400, color: step === i ? 'var(--text-1)' : 'var(--text-3)' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: step > i ? 'var(--success)' : 'var(--border)', margin: '0 12px', transition: 'background 0.2s' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Basic Info */}
      {step === 0 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 24, color: 'var(--text-1)' }}>Event Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Event Title *</label>
              <input className="input" name="title" value={basic.title} onChange={handleBasic}
                placeholder="e.g. TechFest 2026" autoFocus />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" name="description" value={basic.description}
                onChange={handleBasic as any} rows={3}
                placeholder="Tell attendees what this event is about…" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label">Capacity <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                <input className="input" name="capacity" type="number" min={1}
                  value={basic.capacity} onChange={handleBasic} placeholder="Leave blank for unlimited" />
              </div>
              <div>
                <label className="label">Theme Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" name="theme_color" value={basic.theme_color}
                    onChange={handleBasic}
                    style={{ width: 42, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>{basic.theme_color}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
            <button onClick={() => setStep(1)} disabled={!basic.title.trim()}
              className="btn btn-primary">
              Next: Registration Form →
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — Form Builder */}
      {step === 1 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: 'var(--text-1)' }}>Registration Form</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.5 }}>
            Design the form attendees will fill out. Full Name and Email are always included automatically.
          </p>
          <FormBuilder value={fields} onChange={setFields} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button onClick={() => setStep(0)} className="btn btn-ghost">← Back</button>
            <button onClick={() => setStep(2)} className="btn btn-primary">Next: Preview →</button>
          </div>
        </div>
      )}

      {/* Step 2 — Preview */}
      {step === 2 && (
        <div>
          {/* Preview card */}
          <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ height: 8, background: basic.theme_color }} />
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.3px' }}>{basic.title}</h2>
                  {basic.description && <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.5 }}>{basic.description}</p>}
                </div>
                <EventStatusBadge status="draft" />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {basic.venue && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>📍 {basic.venue}</span>}
                {basic.event_date && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>📅 {new Date(basic.event_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>🎟️ {basic.entry_fee === 0 ? 'Free entry' : `₹${basic.entry_fee}`}</span>
                {basic.capacity && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>👥 {basic.capacity} seats</span>}
              </div>
            </div>

            {/* Form preview */}
            <div style={{ padding: '0 28px 24px', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                Registration Form Preview
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Full Name', type: 'text', required: true },
                  { label: 'Email Address', type: 'email', required: true },
                  ...fields,
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5 }}>
                      {f.label} {f.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                    </div>
                    <div style={{ height: 36, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6 }} />
                  </div>
                ))}
                {basic.entry_fee > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5 }}>
                      Payment Screenshot <span style={{ color: 'var(--danger)' }}>*</span>
                    </div>
                    <div style={{ height: 36, background: 'var(--surface-2)', border: '1px dashed var(--border)', borderRadius: 6 }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(1)} className="btn btn-ghost">← Back</button>
            <button onClick={submit} disabled={createEvent.isPending} className="btn btn-primary btn-lg">
              {createEvent.isPending ? 'Creating…' : 'Create Event'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
