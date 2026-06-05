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
  const baseClasses = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-sans text-gray-900 bg-white/70 backdrop-blur-sm outline-none transition-all duration-200 focus:bg-white"
  
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
      className={`${baseClasses} resize-y min-h-[80px]`}
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
      className={`${baseClasses} cursor-pointer`}
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
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        required={field.required}
        checked={value === 'true'}
        onChange={e => onChange(e.target.checked ? 'true' : 'false')}
        className="w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-105"
        style={{ accentColor: themeColor }}
      />
      <span className="text-sm text-gray-700">{field.placeholder || 'Yes'}</span>
    </label>
  )

  return (
    <input
      className={baseClasses}
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
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3 mb-3.5 text-[13px] text-amber-900 leading-relaxed shadow-sm">
        💳 This event requires a fee of <strong className="font-bold">₹{fee}</strong>. Pay via UPI/bank transfer and upload your payment screenshot below.
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
          className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-200 ${dragging ? 'bg-indigo-50/50 scale-[1.02]' : 'bg-gray-50 hover:bg-gray-100/50 hover:border-gray-400'}`}
          style={{ borderColor: dragging ? themeColor : '#d1d5db', backgroundColor: dragging ? `${themeColor}08` : undefined }}
          onClick={() => document.getElementById('payment-file-input')?.click()}
        >
          <div className="text-3xl mb-2 animate-bounce">📸</div>
          <div className="text-sm font-medium text-gray-700 mb-1">
            Drop your screenshot here, or <span className="underline decoration-2 underline-offset-2" style={{ color: themeColor }}>browse</span>
          </div>
          <div className="text-xs text-gray-400">JPG, PNG, WEBP up to 5MB</div>
          <input
            id="payment-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
          <img src={preview} alt="Payment screenshot" className="w-full max-h-[220px] object-cover" />
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 transition-colors duration-300 ${uploaded ? 'bg-green-600/75' : 'bg-black/40'}`}>
            {upload.isPending ? (
              <>
                <div className="text-3xl animate-spin">⏳</div>
                <div className="text-white font-semibold text-sm drop-shadow-md">Uploading…</div>
              </>
            ) : uploaded ? (
              <>
                <div className="text-4xl text-white drop-shadow-lg scale-110">✓</div>
                <div className="text-white font-bold text-[15px] drop-shadow-md">Uploaded successfully</div>
              </>
            ) : null}
          </div>
          {!upload.isPending && (
            <button
              type="button"
              onClick={() => { setPreview(null); setUploaded(false) }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white border-none rounded-md px-2.5 py-1 text-xs cursor-pointer transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
            >
              Remove
            </button>
          )}
        </div>
      )}
      {err && <p className="text-xs text-red-600 mt-1.5 font-medium">{err}</p>}
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f8fc] to-[#f0f0f5]">
      <div className="text-center">
        <div className="w-9 h-9 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3.5" />
        <p className="text-gray-400 text-sm font-medium">Loading event…</p>
      </div>
    </div>
  )

  if (isError || !event) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f8fc] to-[#f0f0f5] p-6">
      <div className="text-center max-w-sm p-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-[22px] font-bold text-gray-900 mb-2">Event not found</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
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
    <div className="min-h-screen bg-[#f8f8fc] font-sans relative overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[300px] opacity-20 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${themeColor}, transparent)` }} />
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: themeColor }} />
      <div className="absolute top-[20%] right-[-50px] w-[200px] h-[200px] rounded-full blur-[80px] opacity-15 pointer-events-none" style={{ backgroundColor: themeColor }} />

      {/* Top color bar */}
      <div className="h-1.5 w-full sticky top-0 z-50 shadow-sm" style={{ background: themeColor }} />

      <div className="max-w-[600px] mx-auto px-4 md:px-6 pt-10 pb-20 relative z-10">

        {/* Event info card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white overflow-hidden mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform hover:-translate-y-1 duration-300">
          {event.banner_url && (
            <div className="relative">
              <img src={event.banner_url} alt={event.title} className="w-full h-40 md:h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 leading-tight">
              {event.title}
            </h1>
            {event.description && (
              <p className="text-[15px] text-gray-600 leading-relaxed mb-5 whitespace-pre-wrap">{event.description}</p>
            )}
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2">
              {event.venue && (
                <div className="flex gap-2 text-[13px] text-gray-600 items-center bg-gray-50/50 rounded-lg px-3 py-1.5 border border-gray-100">
                  <span>📍</span> {event.venue}
                </div>
              )}
              {eventDate && (
                <div className="flex gap-2 text-[13px] text-gray-600 items-center bg-gray-50/50 rounded-lg px-3 py-1.5 border border-gray-100">
                  <span>📅</span> {eventDate}
                </div>
              )}
              <div className={`flex gap-2 text-[13px] items-center rounded-lg px-3 py-1.5 border font-semibold
                ${event.entry_fee === 0 ? 'bg-green-50/50 text-green-700 border-green-100' : 'bg-gray-50/50 text-gray-900 border-gray-100'}
              `}>
                <span>🎟️</span>
                <span>
                  {event.entry_fee === 0 ? 'Free entry' : `₹${event.entry_fee}`}
                </span>
              </div>
              {event.capacity && (
                <div className="flex gap-2 text-[13px] text-gray-600 items-center bg-gray-50/50 rounded-lg px-3 py-1.5 border border-gray-100">
                  <span>👥</span> {event.capacity} seats
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration form card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-xl font-bold text-gray-900 mb-1.5 tracking-tight">Registration Form</h2>
          <p className="text-[13px] text-gray-500 mb-6">
            Fill in your details below. Fields marked <span className="text-red-500 font-bold">*</span> are required.
          </p>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-3.5 text-[13px] text-red-600 mb-5 leading-relaxed font-medium shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {event.form_fields.map((field: FormField) => (
              <div key={field.id} className="group">
                {field.type !== 'checkbox' && (
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5 group-focus-within:text-indigo-600 transition-colors">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
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
              <div className="mt-2">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Payment Screenshot <span className="text-red-500">*</span>
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
              className={`
                mt-4 py-3.5 px-5 text-[15px] font-bold text-white rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98]
                ${submitting ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-xl cursor-pointer'}
              `}
              style={{
                backgroundColor: submitting ? '#a5b4fc' : themeColor,
                boxShadow: submitting ? 'none' : `0 4px 16px ${themeColor}44`,
              }}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting…</span>
                </div>
              ) : (
                'Submit Registration'
              )}
            </button>

            <p className="text-xs text-gray-400 text-center leading-relaxed mt-2">
              Your QR entry pass will be emailed once the organizer approves your registration.
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 font-medium">
          Powered by <span className="text-indigo-500 font-bold tracking-tight">EventFlow</span>
        </p>
      </div>
    </div>
  )
}
