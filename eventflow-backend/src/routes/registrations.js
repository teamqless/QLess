const express   = require('express')
const supabase  = require('../lib/supabase')
const { requireAuth } = require('../middleware/auth')
const { sendQREmail } = require('../services/email')
const { generateQRCode } = require('../services/qr')
const socketLib = require('../lib/socket')

const router = express.Router()

router.post('/submit/:slug', async (req, res) => {
  try {
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, clubs(name, logo_url, smtp_host, smtp_user, smtp_pass, smtp_from_name, smtp_from_email)')
      .eq('slug', req.params.slug).eq('status', 'published').single()
    if (eventError || !event) return res.status(404).json({ error: 'Event not found' })
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) return res.status(410).json({ error: 'Registration deadline has passed' })
    if (event.capacity) {
      const { count } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'approved')
      if (count >= event.capacity) return res.status(410).json({ error: 'This event is fully booked' })
    }
    const { form_data, payment_screenshot_url } = req.body
    if (!form_data || typeof form_data !== 'object') return res.status(400).json({ error: 'form_data is required' })
    const missingFields = event.form_fields.filter(f => f.required && !form_data[f.id]).map(f => f.label)
    if (missingFields.length > 0) return res.status(400).json({ error: 'Missing required fields', missing: missingFields })
    const attendee_email = form_data['attendee_email'] || form_data['email'] || Object.values(form_data).find(v => typeof v === 'string' && v.includes('@'))
    const attendee_name  = form_data['attendee_name']  || form_data['name']  || Object.values(form_data)[0]
    if (attendee_email) {
      const { data: dup } = await supabase.from('registrations').select('id').eq('event_id', event.id).eq('attendee_email', attendee_email).single()
      if (dup) return res.status(409).json({ error: 'This email is already registered for this event' })
    }
    if (event.entry_fee > 0 && !payment_screenshot_url) return res.status(400).json({ error: `This event requires a payment of Rs.${event.entry_fee}. Please upload your payment screenshot.` })
    const payment_status = event.entry_fee === 0 ? 'free' : 'pending'
    const { data: registration, error: regError } = await supabase.from('registrations').insert({
      event_id: event.id, club_id: event.club_id, form_data,
      attendee_name: attendee_name || 'Unknown', attendee_email: attendee_email || null,
      payment_screenshot_url: payment_screenshot_url || null, payment_status, status: 'pending',
    }).select().single()
    if (regError) { console.error('Registration insert error:', regError); return res.status(500).json({ error: 'Failed to submit registration' }) }
    socketLib.broadcastNewRegistration(event.id, { id: registration.id, attendee_name: registration.attendee_name, attendee_email: registration.attendee_email, status: registration.status, payment_status: registration.payment_status, created_at: registration.created_at })
    if (event.entry_fee === 0) {
      await supabase.from('registrations').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', registration.id)
      ;(async () => { try { const qr = await generateQRCode(registration.id, event.id); await sendQREmail({ registration: { ...registration, status: 'approved' }, event, qrCode: qr }) } catch (e) { console.error('Auto QR error:', e) } })()
      return res.status(201).json({ message: 'Registration successful! Your QR code will be emailed shortly.', registration_id: registration.id, auto_approved: true })
    }
    return res.status(201).json({ message: 'Registration submitted! The club will review your payment and send your QR code.', registration_id: registration.id, auto_approved: false })
  } catch (err) { console.error('Submit error:', err); return res.status(500).json({ error: 'Internal server error' }) }
})

router.get('/:eventId', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase.from('events').select('id').eq('id', req.params.eventId).eq('club_id', req.club.clubId).single()
    if (!event) return res.status(404).json({ error: 'Event not found' })
    const { status, search } = req.query
    let query = supabase.from('registrations').select('id, attendee_name, attendee_email, form_data, payment_screenshot_url, payment_status, status, approved_at, rejection_reason, created_at, qr_codes(id, scanned_at, email_sent)').eq('event_id', req.params.eventId).order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    if (search) query = query.or(`attendee_name.ilike.%${search}%,attendee_email.ilike.%${search}%`)
    const { data: registrations, error } = await query
    if (error) return res.status(500).json({ error: 'Failed to fetch registrations' })
    return res.json({ registrations })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.post('/:id/approve', requireAuth, async (req, res) => {
  try {
    const { data: reg, error } = await supabase.from('registrations').select('*, events(*, clubs(*))').eq('id', req.params.id).eq('club_id', req.club.clubId).single()
    if (error || !reg) return res.status(404).json({ error: 'Registration not found' })
    if (reg.status === 'approved') return res.status(400).json({ error: 'Already approved' })
    await supabase.from('registrations').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', reg.id)
    const event = reg.events
    const { data: existingQR } = await supabase.from('qr_codes').select('*').eq('registration_id', reg.id).single()
    let qrCode = existingQR
    if (!qrCode) {
      try {
        qrCode = await generateQRCode(reg.id, event.id)
      } catch (qrErr) {
        console.error('QR generation failed:', qrErr)
        return res.status(500).json({ error: 'Registration approved but QR generation failed. Try resending QR.' })
      }
    }
    try {
      await sendQREmail({ registration: reg, event, qrCode })
    } catch (emailErr) {
      console.error('QR email failed:', emailErr.message)
      // Don't fail the approval — QR was generated, admin can resend
      return res.json({
        message: 'Registration approved and QR generated, but email delivery failed. Use "Resend QR" to retry.',
        registration_id: reg.id,
        email_error: emailErr.message,
      })
    }
    return res.json({ message: 'Registration approved and QR code sent', registration_id: reg.id })
  } catch (err) { console.error('Approve error:', err); return res.status(500).json({ error: 'Failed to approve registration' }) }
})

router.post('/:id/reject', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body
    const { data: reg } = await supabase.from('registrations').select('id, club_id, status').eq('id', req.params.id).eq('club_id', req.club.clubId).single()
    if (!reg) return res.status(404).json({ error: 'Registration not found' })
    if (reg.status === 'approved') return res.status(400).json({ error: 'Cannot reject an approved registration' })
    await supabase.from('registrations').update({ status: 'rejected', rejection_reason: reason || 'Payment not verified' }).eq('id', reg.id)
    return res.json({ message: 'Registration rejected' })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

router.post('/:id/resend-qr', requireAuth, async (req, res) => {
  try {
    const { data: reg } = await supabase.from('registrations').select('*, events(*, clubs(*))').eq('id', req.params.id).eq('club_id', req.club.clubId).single()
    if (!reg) return res.status(404).json({ error: 'Registration not found' })
    if (reg.status !== 'approved') return res.status(400).json({ error: 'Registration must be approved first' })
    const { data: qrCode } = await supabase.from('qr_codes').select('*').eq('registration_id', reg.id).single()
    if (!qrCode) return res.status(404).json({ error: 'QR code not found' })
    await sendQREmail({ registration: reg, event: reg.events, qrCode })
    return res.json({ message: 'QR code resent successfully' })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
