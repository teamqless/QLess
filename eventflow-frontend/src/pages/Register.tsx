import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePublicEvent } from '@/hooks/useEvents'
import { useSubmitRegistration, useUploadPaymentScreenshot } from '@/hooks/useRegistrations'
import type { FormField } from '@/types'

function FieldInput({
  field,
  value,
  onChange,
  themeColor,
}: {
  field: FormField
  value: string
  onChange: (val: string) => void
  themeColor: string
}) {
  const base: React.CSSProperties = {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '10px 13px',
    fontSize: 14,
    fontFamily: 'DM Sans, sans-serif',
    color: '#0f0e1a',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  const focusStyle = (e: React.FocusEvent<any>) => {
    e.target.style.borderColor = themeColor
    e.target.style.boxShadow = `0 0 0 3px ${themeColor}22`
  }
  const blurStyle = (e: React.FocusEvent<any>) => {
    e.target.style.borderColor = '#d1d5db'
    e.target.style.boxShadow = 'none'
  }

  if (field.type === 'textarea') return (
    <textarea
      style={{ ...base, resize: 'vertical', minHeight: 80 }}
      required={field.required}
      placeholder={field.placeholder}
      value={value}
      rows={3}
      onChange={e => onChange(e.target.value)}
      onFocus={focusStyle} onBlur={blurStyle}
    />
  )

  if (field.type === 'select') return (
    <select
      style={{ ...base, cursor: 'pointer' }}
      required={field.required}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={focusStyle} onBlur={blurStyle}
    >
      <option value="">Select an option</option>
      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  )

  if (field.type === 'checkbox') return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <input
        type="checkbox"
        required={field.required}
        checked={value === 'true'}
        onChange={e => onChange(e.target.checked ? 'true' : 'false')}
        style={{ width: 18, height: 18, accentColor: themeColor, flexShrink: 0 }}
      />
      <span style={{ fontSize: 14, color: '#374151' }}>{field.placeholder || 'Yes'}</span>
    </label>
  )

  return (
    <input
      style={base}
      type={field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
      required={field.required}
      placeholder={field.placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={focusStyle} onBlur={blurStyle}
    />
  )
}

function PaymentUpload({
  fee,
  themeColor,
  onUploaded,
}: {
  fee: number
  themeColor: string
  onUploaded: (url: string) => void
}) {
  const upload = useUploadPaymentScreenshot()
  const [preview, setPreview] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState(false)
  const [err, setErr] = useState('')
  const [dragging, setDragging] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErr('Please upload an image file (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('File too large. Max 5MB.')
      return
    }
    setErr('')
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const url = await upload.mutateAsync(file)
      onUploaded(url)
      setUploaded(true)
    } catch {
      setErr('Upload failed. Please try again.')
      setPreview(null)
    }
  }

  return (
    <div>
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: 8, padding: '12px 14px', marginBottom: 14,
        fontSize: 13, color: '#92400e', lineHeight: 1.5,
      }}>
        💳 This event requires a fee of <strong>₹{fee}</strong>. Pay via UPI/bank transfer and upload your payment screenshot below.
      </div>

      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault(); setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          style={{
            border: `2px dashed ${dragging ? themeColor : '#d1d5db'}`,
            borderRadius: 10, padding: '28px 20px', textAlign: 'center',
            background: dragging ? `${themeColor}08` : '#fafafa',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onClick={() => document.getElementById('payment-file-input')?.click()}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
            Drop your screenshot here, or <span style={{ color: themeColor, textDecoration: 'underline' }}>browse</span>
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>JPG, PNG, WEBP up to 5MB</div>
          <input
            id="payment-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <img src={preview} alt="Payment screenshot" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: uploaded ? 'rgba(22,163,74,0.75)' : 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 6,
          }}>
            {upload.isPending ? (
              <>
                <div style={{ fontSize: 28 }}>⏳</div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Uploading…</div>
              </>
            ) : uploaded ? (
              <>
                <div style={{ fontSize: 32 }}>✓</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Uploaded successfully</div>
              </>
            ) : null}
          </div>
          {!upload.isPending && (
            <button
              type="button"
              onClick={() => { setPreview(null); setUploaded(false) }}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.6)', color: 'white',
                border: 'none', borderRadius: 6, padding: '4px 10px',
                fontSize: 12, cursor: 'pointer',
              }}
            >Remove</button>
          )}
        </div>
      )}
      {err && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{err}</p>}
    </div>
  )
}

export default function Register() {
  const { slug }    = useParams<{ slug: string }>()
  const navigate    = useNavigate()
  const { data: event, isLoading, isError } = usePublicEvent(slug!)
  const submit      = useSubmitRegistration(slug!)

  const [formData, setFormData]             = useState<Record<string, string>>({})
  const [paymentUrl, setPaymentUrl]         = useState<string | undefined>()
  const [error, setError]                   = useState('')
  const [submitting, setSubmitting]         = useState(false)

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8fc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading event…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  if (isError || !event) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8fc' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f0e1a', marginBottom: 8 }}>Event not found</h2>
        <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
          This event may have closed, the link may be incorrect, or the deadline has passed.
        </p>
      </div>
    </div>
  )

  const themeColor = event.theme_color || '#6366f1'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (event.entry_fee > 0 && !paymentUrl) {
      setError('Please upload your payment screenshot before submitting.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await submit.mutateAsync({ form_data: formData, payment_screenshot_url: paymentUrl })
      navigate(`/register/${slug}/success`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' })
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8fc', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Top color bar */}
      <div style={{ height: 5, background: themeColor }} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Event info card */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
          overflow: 'hidden', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          {event.banner_url && (
            <img src={event.banner_url} alt={event.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
          )}
          <div style={{ padding: '24px 28px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f0e1a', letterSpacing: '-0.4px', marginBottom: 8 }}>
              {event.title}
            </h1>
            {event.description && (
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>{event.description}</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {event.venue && (
                <div style={{ display: 'flex', gap: 6, fontSize: 13, color: '#6b7280', alignItems: 'center' }}>
                  <span>📍</span> {event.venue}
                </div>
              )}
              {eventDate && (
                <div style={{ display: 'flex', gap: 6, fontSize: 13, color: '#6b7280', alignItems: 'center' }}>
                  <span>📅</span> {eventDate}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, fontSize: 13, alignItems: 'center' }}>
                <span>🎟️</span>
                <span style={{
                  fontWeight: 600,
                  color: event.entry_fee === 0 ? '#16a34a' : '#0f0e1a',
                }}>
                  {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}
                </span>
              </div>
              {event.capacity && (
                <div style={{ display: 'flex', gap: 6, fontSize: 13, color: '#6b7280', alignItems: 'center' }}>
                  <span>👥</span> {event.capacity} seats
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration form card */}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
          padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f0e1a', marginBottom: 6 }}>Registration Form</h2>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24 }}>
            Fill in your details below. Fields marked <span style={{ color: '#dc2626' }}>*</span> are required.
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
              padding: '12px 14px', fontSize: 13, color: '#dc2626', marginBottom: 20, lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {event.form_fields.map((field: FormField) => (
              <div key={field.id}>
                {field.type !== 'checkbox' && (
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                    {field.label}
                    {field.required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
                  </label>
                )}
                <FieldInput
                  field={field}
                  value={formData[field.id] || ''}
                  onChange={val => setFormData(p => ({ ...p, [field.id]: val }))}
                  themeColor={themeColor}
                />
              </div>
            ))}

            {/* Payment upload */}
            {event.entry_fee > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                  Payment Screenshot <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <PaymentUpload
                  fee={event.entry_fee}
                  themeColor={themeColor}
                  onUploaded={url => setPaymentUrl(url)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (event.entry_fee > 0 && !paymentUrl)}
              style={{
                padding: '13px 20px', fontSize: 15, fontWeight: 700,
                background: submitting ? '#a5b4fc' : themeColor,
                color: 'white', border: 'none', borderRadius: 10,
                cursor: submitting ? 'not-allowed' : 'pointer',
                marginTop: 4, transition: 'opacity 0.15s',
                boxShadow: `0 4px 16px ${themeColor}44`,
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Registration'}
            </button>

            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>
              Your QR entry pass will be emailed once the organizer approves your registration.
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#d1d5db', marginTop: 24 }}>
          Powered by <span style={{ color: '#6366f1', fontWeight: 600 }}>EventFlow</span>
        </p>
      </div>
    </div>
  )
}
