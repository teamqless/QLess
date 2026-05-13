const express   = require('express')
const jwt       = require('jsonwebtoken')
const supabase  = require('../lib/supabase')
const { requireAuth, requireVolunteer } = require('../middleware/auth')
const socketLib = require('../lib/socket')

const router = express.Router()

// ─── POST /scanner/volunteers — create ───────────────────────────────────────

router.post('/volunteers', requireAuth, async (req, res) => {
  try {
    const { name, access_code, event_id } = req.body

    if (!name || !access_code) {
      return res.status(400).json({ error: 'name and access_code are required' })
    }
    if (access_code.length < 4) {
      return res.status(400).json({ error: 'Access code must be at least 4 characters' })
    }

    // Check uniqueness within this club only
    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('club_id', req.club.clubId)
      .eq('access_code', access_code.toUpperCase())
      .maybeSingle()

    if (existing) {
      return res.status(409).json({ error: 'This access code is already in use by another volunteer' })
    }

    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .insert({
        club_id:     req.club.clubId,
        event_id:    event_id || null,
        name,
        access_code: access_code.toUpperCase(),
        is_active:   true,
      })
      .select()
      .single()

    if (error) {
      console.error('Create volunteer error:', error)
      return res.status(500).json({ error: 'Failed to create volunteer' })
    }

    return res.status(201).json({ volunteer })
  } catch (err) {
    console.error('Create volunteer error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /scanner/volunteers ──────────────────────────────────────────────────

router.get('/volunteers', requireAuth, async (req, res) => {
  try {
    const { data: volunteers, error } = await supabase
      .from('volunteers')
      .select('id, name, access_code, event_id, is_active, created_at')
      .eq('club_id', req.club.clubId)
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Failed to fetch volunteers' })
    return res.json({ volunteers })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── PATCH /scanner/volunteers/:id — toggle active ───────────────────────────

router.patch('/volunteers/:id', requireAuth, async (req, res) => {
  try {
    const { is_active } = req.body
    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .update({ is_active: Boolean(is_active) })
      .eq('id', req.params.id)
      .eq('club_id', req.club.clubId)
      .select('id, name, access_code, is_active')
      .single()

    if (error || !volunteer) return res.status(404).json({ error: 'Volunteer not found' })
    return res.json({ volunteer })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── DELETE /scanner/volunteers/:id ──────────────────────────────────────────

router.delete('/volunteers/:id', requireAuth, async (req, res) => {
  try {
    await supabase
      .from('volunteers')
      .delete()
      .eq('id', req.params.id)
      .eq('club_id', req.club.clubId)
    return res.json({ message: 'Volunteer removed' })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /scanner/login ──────────────────────────────────────────────────────
// BUG FIXES:
// 1. Removed .single() — allows multiple devices with same code simultaneously
// 2. Fixed Supabase OR filter for null event_id (was broken with template literal)
// 3. event_id is now optional — volunteers with no event_id can log in to any event

router.post('/login', async (req, res) => {
  try {
    const { access_code, event_id } = req.body

    if (!access_code) {
      return res.status(400).json({ error: 'access_code is required' })
    }

    // FIX: Use separate queries instead of broken .or() with null check
    // First try exact event match, then fall back to club-wide volunteer
    let volunteer = null

    // Try event-specific volunteer first
    if (event_id) {
      const { data } = await supabase
        .from('volunteers')
        .select('*, clubs(id, name)')
        .eq('access_code', access_code.toUpperCase())
        .eq('is_active', true)
        .eq('event_id', event_id)
        .limit(1)

      if (data && data.length > 0) volunteer = data[0]
    }

    // If not found, try club-wide volunteer (event_id IS NULL)
    if (!volunteer) {
      const { data } = await supabase
        .from('volunteers')
        .select('*, clubs(id, name)')
        .eq('access_code', access_code.toUpperCase())
        .eq('is_active', true)
        .is('event_id', null)
        .limit(1)

      if (data && data.length > 0) volunteer = data[0]
    }

    if (!volunteer) {
      return res.status(401).json({ error: 'Invalid access code. Check the code and try again.' })
    }

    // If event_id provided, validate it belongs to this club
    let event = null
    if (event_id) {
      const { data: eventData } = await supabase
        .from('events')
        .select('id, title, status, club_id, theme_color')
        .eq('id', event_id)
        .eq('club_id', volunteer.club_id)
        .single()

      if (!eventData) {
        return res.status(404).json({ error: 'Event not found. Check the event ID.' })
      }
      if (eventData.status !== 'published' && eventData.status !== 'completed') {
        return res.status(403).json({ error: 'This event is not currently active for scanning.' })
      }
      event = eventData
    }

    // FIX: No event_id required — if volunteer is club-wide and no event_id given,
    // they can still log in and scan for any event in the club
    // The event_id in the JWT is optional — scanner uses it for live stats only

    // FIX: Multi-device support — we sign a new JWT every time, no session conflict
    const token = jwt.sign(
      {
        role:        'volunteer',
        volunteerId: volunteer.id,
        clubId:      volunteer.club_id,
        eventId:     event_id || null,     // null = club-wide, can scan any event
        name:        volunteer.name,
        iat:         Math.floor(Date.now() / 1000),  // unique per login
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    return res.json({
      token,
      volunteer: { id: volunteer.id, name: volunteer.name },
      event:     event ? { id: event.id, title: event.title, theme_color: event.theme_color } : null,
      club:      { name: volunteer.clubs?.name || 'Your Club' },
    })
  } catch (err) {
    console.error('Volunteer login error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /scanner/scan ───────────────────────────────────────────────────────

router.post('/scan', requireVolunteer, async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'QR token is required' })

    const volunteerId = req.volunteer.volunteerId
    const clubId      = req.volunteer.clubId
    const volunteerEventId = req.volunteer.eventId  // may be null for club-wide

    // Decode QR token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      const payload = { result: 'invalid', message: 'This QR code is not valid' }
      if (volunteerEventId) socketLib.broadcastScan(volunteerEventId, payload)
      return res.status(400).json(payload)
    }

    const { registrationId, eventId: qrEventId } = decoded

    // If volunteer is event-specific, ensure QR matches their event
    if (volunteerEventId && qrEventId !== volunteerEventId) {
      const payload = { result: 'invalid', message: 'This QR is for a different event' }
      socketLib.broadcastScan(volunteerEventId, payload)
      return res.status(403).json(payload)
    }

    // Verify the event belongs to this volunteer's club
    const { data: event } = await supabase
      .from('events')
      .select('id, club_id')
      .eq('id', qrEventId)
      .eq('club_id', clubId)
      .single()

    if (!event) {
      const payload = { result: 'invalid', message: 'QR code belongs to a different club' }
      return res.status(403).json(payload)
    }

    // Fetch QR record
    const { data: qrCode, error: qrErr } = await supabase
      .from('qr_codes')
      .select('*, registrations(attendee_name, attendee_email, status, form_data)')
      .eq('registration_id', registrationId)
      .eq('event_id', qrEventId)
      .single()

    if (qrErr || !qrCode) {
      const payload = { result: 'invalid', message: 'QR code not found in system' }
      socketLib.broadcastScan(qrEventId, payload)
      return res.status(404).json(payload)
    }

    // Check approval status
    if (qrCode.registrations.status !== 'approved') {
      await supabase.from('scan_logs').insert({
        qr_code_id: qrCode.id, event_id: qrEventId,
        registration_id: registrationId, volunteer_id: volunteerId, result: 'rejected',
      })
      const payload = {
        result: 'rejected', message: 'This registration has not been approved',
        attendee: { name: qrCode.registrations.attendee_name },
      }
      socketLib.broadcastScan(qrEventId, payload)
      return res.status(403).json(payload)
    }

    // ONE-SCAN ENFORCEMENT
    if (qrCode.scanned_at !== null) {
      await supabase.from('scan_logs').insert({
        qr_code_id: qrCode.id, event_id: qrEventId,
        registration_id: registrationId, volunteer_id: volunteerId, result: 'already_scanned',
      })
      const payload = {
        result: 'already_scanned', message: 'This QR has already been used for entry',
        scanned_at: qrCode.scanned_at,
        attendee: { name: qrCode.registrations.attendee_name, email: qrCode.registrations.attendee_email },
      }
      socketLib.broadcastScan(qrEventId, payload)
      return res.status(409).json(payload)
    }

    // Mark as scanned atomically
    const { data: updated } = await supabase
      .from('qr_codes')
      .update({ scanned_at: new Date().toISOString(), scanned_by: volunteerId })
      .eq('id', qrCode.id)
      .is('scanned_at', null)
      .select()
      .single()

    if (!updated) {
      const payload = { result: 'already_scanned', message: 'Just scanned by another device' }
      socketLib.broadcastScan(qrEventId, payload)
      return res.status(409).json(payload)
    }

    // Log success
    await supabase.from('scan_logs').insert({
      qr_code_id: qrCode.id, event_id: qrEventId,
      registration_id: registrationId, volunteer_id: volunteerId, result: 'success',
    })

    const successPayload = {
      result: 'success', message: 'Entry granted',
      attendee: {
        name:      qrCode.registrations.attendee_name,
        email:     qrCode.registrations.attendee_email,
        form_data: qrCode.registrations.form_data,
      },
      scanned_at: updated.scanned_at,
      volunteer:  req.volunteer.name,
    }

    socketLib.broadcastScan(qrEventId, successPayload)

    // Update live stats
    const { count: scannedIn }    = await supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('event_id', qrEventId).not('scanned_at', 'is', null)
    const { count: totalApproved } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', qrEventId).eq('status', 'approved')
    socketLib.broadcastStats(qrEventId, { scanned_in: scannedIn, total_approved: totalApproved })

    return res.json(successPayload)
  } catch (err) {
    console.error('Scan error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /scanner/live/:eventId ───────────────────────────────────────────────

router.get('/live/:eventId', requireVolunteer, async (req, res) => {
  try {
    const eid = req.params.eventId

    // Club-wide volunteers can access any event in their club
    if (req.volunteer.eventId && req.volunteer.eventId !== eid) {
      return res.status(403).json({ error: 'Access denied for this event' })
    }

    const { count: totalApproved } = await supabase
      .from('registrations').select('id', { count: 'exact', head: true })
      .eq('event_id', eid).eq('status', 'approved')

    const { count: scannedIn } = await supabase
      .from('qr_codes').select('id', { count: 'exact', head: true })
      .eq('event_id', eid).not('scanned_at', 'is', null)

    const { data: recent } = await supabase
      .from('scan_logs')
      .select('scanned_at, result, registrations(attendee_name, attendee_email)')
      .eq('event_id', eid)
      .eq('result', 'success')
      .order('scanned_at', { ascending: false })
      .limit(20)

    return res.json({
      stats: { total_approved: totalApproved, scanned_in: scannedIn, remaining: totalApproved - scannedIn },
      recent_entries: recent,
    })
  } catch (err) {
    console.error('Live dashboard error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /scanner/event-stats/:eventId ───────────────────────────────────────

router.get('/event-stats/:eventId', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase.from('events').select('id, club_id').eq('id', req.params.eventId).eq('club_id', req.club.clubId).single()
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const eid = req.params.eventId
    const [
      { count: total }, { count: approved }, { count: pending }, { count: scanned },
    ] = await Promise.all([
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', eid),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', eid).eq('status', 'approved'),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', eid).eq('status', 'pending'),
      supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('event_id', eid).not('scanned_at', 'is', null),
    ])

    return res.json({ total, approved, pending, scanned, remaining: approved - scanned })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
