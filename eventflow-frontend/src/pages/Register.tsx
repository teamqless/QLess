// ============================================================
// pages/Register.tsx — PHASE 3
// Public attendee registration page at /register/:slug
// ============================================================
// Renders a dynamic form based on event.form_fields
// Handles payment screenshot upload if entry_fee > 0
// On submit: POST /registrations/submit/:slug
// On success: navigate to /register/:slug/success

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePublicEvent } from '@/hooks/useEvents'
import { useSubmitRegistration, useUploadPaymentScreenshot } from '@/hooks/useRegistrations'
import type { FormField } from '@/types'

export default function Register() {
  const { slug }    = useParams<{ slug: string }>()
  const navigate    = useNavigate()
  const { data: event, isLoading, isError } = usePublicEvent(slug!)
  const submit      = useSubmitRegistration(slug!)
  const uploadFile  = useUploadPaymentScreenshot()

  const [formData, setFormData]       = useState<Record<string, string>>({})
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [error, setError]             = useState('')
  const [submitting, setSubmitting]   = useState(false)

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading event...</p>
    </div>
  )

  if (isError || !event) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900 mb-2">Event not found</p>
        <p className="text-gray-500">This event may have closed or the link is invalid.</p>
      </div>
    </div>
  )

  const handleFieldChange = (fieldId: string, value: string) =>
    setFormData(prev => ({ ...prev, [fieldId]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      let paymentUrl: string | undefined

      // Upload payment screenshot first if needed
      if (event.entry_fee > 0) {
        if (!paymentFile) {
          setError('Please upload your payment screenshot')
          setSubmitting(false)
          return
        }
        paymentUrl = await uploadFile.mutateAsync(paymentFile)
      }

      await submit.mutateAsync({
        form_data: formData,
        payment_screenshot_url: paymentUrl,
      })

      navigate(`/register/${slug}/success`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Render a single form field based on its type
  const renderField = (field: FormField) => {
    const baseClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent'
    const focusColor = `focus:ring-[${event.theme_color}]`

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            required={field.required}
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            rows={3}
            className={baseClass + ' ' + focusColor}
          />
        )
      case 'select':
        return (
          <select
            required={field.required}
            value={formData[field.id] || ''}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            className={baseClass + ' ' + focusColor}>
            <option value="">Select an option</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.id}
              required={field.required}
              checked={formData[field.id] === 'true'}
              onChange={e => handleFieldChange(field.id, e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 rounded"
            />
            <label htmlFor={field.id} className="text-sm text-gray-700">{field.label}</label>
          </div>
        )
      default:
        return (
          <input
            type={field.type === 'phone' ? 'tel' : field.type}
            required={field.required}
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            className={baseClass + ' ' + focusColor}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event banner */}
      <div className="h-3 w-full" style={{ backgroundColor: event.theme_color }} />

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Event info */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          {event.description && <p className="text-gray-500 text-sm mb-4">{event.description}</p>}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            {event.venue && <span>📍 {event.venue}</span>}
            {event.event_date && (
              <span>📅 {new Date(event.event_date).toLocaleString('en-IN', {
                dateStyle: 'medium', timeStyle: 'short',
              })}</span>
            )}
            <span>{event.entry_fee === 0 ? '🎟️ Free entry' : `🎟️ ₹${event.entry_fee}`}</span>
          </div>
        </div>

        {/* Registration form */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h2 className="font-semibold text-gray-900 mb-6">Register for this event</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {event.form_fields.map((field: FormField) => (
              <div key={field.id}>
                {field.type !== 'checkbox' && (
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                {renderField(field)}
              </div>
            ))}

            {/* Payment screenshot upload */}
            {event.entry_fee > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Pay ₹{event.entry_fee} and upload your payment screenshot for verification.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={e => setPaymentFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:border-0 file:bg-gray-100 file:text-gray-700 file:rounded"
                />
                {paymentFile && (
                  <p className="text-xs text-green-600 mt-1">✓ {paymentFile.name}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: event.theme_color }}
              className="w-full text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity mt-2">
              {submitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <span className="font-medium text-indigo-600">EventFlow</span>
        </p>
      </div>
    </div>
  )
}
