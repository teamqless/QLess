// ============================================================
// pages/EventCreate.tsx — PHASE 2
// Multi-step event creation at /events/new
// ============================================================
// TODO Phase 2: Build as a 3-step wizard:
//
// Step 1 — Basic Info:
//   Fields: title, description, venue, event_date,
//           registration_deadline, entry_fee, capacity,
//           banner_url (upload), theme_color (color picker)
//
// Step 2 — Form Builder (FormBuilder.tsx component):
//   - Add/remove/reorder form fields
//   - Each field: label, type (text/email/phone/select/file/checkbox), required toggle
//   - Note: Name + Email fields are auto-injected by backend if missing
//
// Step 3 — Preview & Create:
//   - Preview how the registration form will look
//   - Submit button calls POST /events via useCreateEvent()
//   - On success: navigate to /events/:id
//
// Use react-hook-form for form state across steps

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateEvent } from '@/hooks/useEvents'
import type { FormField } from '@/types'

export default function EventCreate() {
  const navigate      = useNavigate()
  const createEvent   = useCreateEvent()
  const [step, setStep] = useState(1)

  const [basicInfo, setBasicInfo] = useState({
    title: '', description: '', venue: '',
    event_date: '', entry_fee: 0, capacity: '',
    theme_color: '#6366f1', banner_url: '',
  })

  // Phase 2: replace with FormBuilder component
  const [formFields] = useState<FormField[]>([
    { id: 'attendee_name',  label: 'Full Name',      type: 'text',  required: true },
    { id: 'attendee_email', label: 'Email Address',  type: 'email', required: true },
    { id: 'phone',          label: 'Phone Number',   type: 'phone', required: false },
    { id: 'branch',         label: 'Branch / Dept',  type: 'text',  required: false },
  ])

  const handleSubmit = async () => {
    try {
      const event = await createEvent.mutateAsync({
        ...basicInfo,
        entry_fee:  Number(basicInfo.entry_fee),
        capacity:   basicInfo.capacity ? Number(basicInfo.capacity) : undefined,
        form_fields: formFields,
      } as any)
      navigate(`/events/${event.id}`)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create event')
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Event</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Basic Info', 'Registration Form', 'Preview'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
              ${step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-indigo-600 text-white' :
                'bg-gray-200 text-gray-500'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === i + 1 ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input type="text" value={basicInfo.title}
              onChange={e => setBasicInfo(p => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="TechFest 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={basicInfo.description}
              onChange={e => setBasicInfo(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell attendees about your event..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input type="text" value={basicInfo.venue}
                onChange={e => setBasicInfo(p => ({ ...p, venue: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Auditorium, Block A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee (₹)</label>
              <input type="number" value={basicInfo.entry_fee} min={0}
                onChange={e => setBasicInfo(p => ({ ...p, entry_fee: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0 = free" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time</label>
              <input type="datetime-local" value={basicInfo.event_date}
                onChange={e => setBasicInfo(p => ({ ...p, event_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" value={basicInfo.capacity} min={1}
                onChange={e => setBasicInfo(p => ({ ...p, capacity: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave blank for unlimited" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={basicInfo.theme_color}
                onChange={e => setBasicInfo(p => ({ ...p, theme_color: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
              <span className="text-sm text-gray-500">{basicInfo.theme_color}</span>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={() => setStep(2)} disabled={!basicInfo.title}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
              Next: Registration Form →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Form Builder */}
      {step === 2 && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            These are the fields attendees will fill when registering.
            <br />
            <strong>Full Name</strong> and <strong>Email</strong> are always included automatically.
          </p>

          {/* Phase 2: Replace this list with FormBuilder.tsx drag-and-drop component */}
          <div className="space-y-2 mb-6">
            {formFields.map(field => (
              <div key={field.id}
                className="flex items-center justify-between bg-white border rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{field.label}</p>
                  <p className="text-xs text-gray-400">{field.type} {field.required ? '• required' : '• optional'}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Phase 2: FormBuilder.tsx component will go here — with drag/drop reordering,
            add field button, field type selector, and required toggle.
          </p>

          <div className="flex justify-between pt-6">
            <button onClick={() => setStep(1)}
              className="border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50">
              ← Back
            </button>
            <button onClick={() => setStep(3)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">
              Next: Preview →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Preview & Create */}
      {step === 3 && (
        <div>
          <div className="bg-white border rounded-xl overflow-hidden mb-6">
            <div className="h-16 w-full" style={{ backgroundColor: basicInfo.theme_color }} />
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">{basicInfo.title}</h2>
              {basicInfo.venue && <p className="text-sm text-gray-500 mt-1">📍 {basicInfo.venue}</p>}
              {basicInfo.event_date && (
                <p className="text-sm text-gray-500 mt-1">
                  📅 {new Date(basicInfo.event_date).toLocaleString('en-IN')}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {basicInfo.entry_fee === 0 ? '🎟️ Free entry' : `🎟️ ₹${basicInfo.entry_fee}`}
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)}
              className="border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50">
              ← Back
            </button>
            <button onClick={handleSubmit} disabled={createEvent.isPending}
              className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
