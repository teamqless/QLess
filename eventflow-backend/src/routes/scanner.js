const express = require('express')
const jwt     = require('jsonwebtoken')
const supabase = require('../lib/supabase')
const { requireAuth, requireVolunteer } = require('../middleware/auth')
const socketLib = require('../lib/socket')

const router = express.Router()

// ─── POST /scanner/volunteers — create volunteer ──────────────────────────────

router.post('/volunteers', requireAuth, async (req, res) => {
  try {
    const { name, access_code, event_id } = req.body

    if (!name || !access_code) {
      return res.status(400).json({ error: 'name and access_code are required' })
    }
    if (access_code.length < 4) {
      return res.status(400).json({ error: 'Access code must be at least 4 characters' })
    }

    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('club_id', req.club.clubId)
      .eq('access_code', access_code.toUpperCase())
      .single()

    if (existing) {
      return res.status(409).json({ error: 'This access code is already in use' })
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

    if (error) return res.status(500).json({ error: 'Failed to create volunteer' })

    return res.status(201).json({ volunteer })
  } catch (err) {
    console.error('Create volunteer error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /scanner/volunteers — list club volunteers ───────────────────────────

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

// ─── DELETE /scanner/volunteers/:id — permanently remove ─────────────────────

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

// ─── POST /scanner/login — volunteer login ────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { access_code, event_id } = req.body

    if (!access_code || !event_id) {
      return res.status(400).json({ error: 'access_code and event_id are required' })
    }

    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .select('*, clubs(id, name)')
      .eq('access_code', access_code.toUpperCase())
      .eq('is_active', true)
      .or(`event_id.eq.${event_id},event_id.is.null`)
      .single()

    if (error || !volunteer) {
      return res.status(401).json({ error: 'Invalid access code' })
    }

    const { data: event } = await supabase
      .from('events')
      .select('id, title, status, club_id, theme_color')
      .eq('id', event_id)
      .eq('club_id', volunteer.club_id)
      .single()

    if (!event) return res.status(404).json({ error: 'Event not found' })

    if (event.status !== 'published' && event.status !== 'completed') {
      return res.status(403).json({ error: 'Event is not active for scanning' })
    }

    const token = jwt.sign(
      {
        role:        'volunteer',
        volunteerId: volunteer.id,
        clubId:      volunteer.club_id,
        eventId:     event_id,
        name:        volunteer.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    )

    return res.json({
      token,
      volunteer: { id: volunteer.id, name: volunteer.name },
      event:     { id: event.id, title: event.title, theme_color: event.theme_color },
      club:      { name: volunteer.clubs.name },
    })
  } catch (err) {
    console.error('Volunteer login error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /scanner/scan — core one-scan enforcement + WebSocket broadcast ─────

router.post('/scan', requireVolunteer, async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'QR token is required' })

    const eventId = req.volunteer.eventId

    // 1. Decode QR token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      const payload = {
        result:      'invalid',
        message:     'This QR code is not valid',
        scanned_at:  new Date().toISOString(),
        volunteer:   req.volunteer.name,
      }
      socketLib.broadcastScan(eventId, payload)
      return res.status(400).json(payload)
    }

    const { registrationId, eventId: qrEventId } = decoded

    // 2. Validate this QR belongs to this event
    if (qrEventId !== eventId) {
      const payload = { result: 'invalid', message: 'QR is for a different event' }
      socketLib.broadcastScan(eventId, payload)
      return res.status(403).json(payload)
    }

    // 3. Fetch QR record
    const { data: qrCode, error: qrErr } = await supabase
      .from('qr_codes')
      .select('*, registrations(attendee_name, attendee_email, status, form_data)')
      .eq('registration_id', registrationId)
      .eq('event_id', eventId)
      .single()

    if (qrErr || !qrCode) {
      const payload = { result: 'invalid', message: 'QR code not found in system' }
      socketLib.broadcastScan(eventId, payload)
      return res.status(404).json(payload)
    }

    // 4. Check approval
    if (qrCode.registrations.status !== 'approved') {
      await supabase.from('scan_logs').insert({
        qr_code_id:      qrCode.id,
        event_id:        eventId,
        registration_id: registrationId,
        volunteer_id:    req.volunteer.volunteerId,
        result:          'rejected',
      })
      const payload = {
        result:   'rejected',
        message:  'This registration has not been approved',
        attendee: { name: qrCode.registrations.attendee_name },
      }
      socketLib.broadcastScan(eventId, payload)
      return res.status(403).json(payload)
    }

    // 5. ── ONE-SCAN ENFORCEMENT ────────────────────────────────────────────
    if (qrCode.scanned_at !== null) {
      await supabase.from('scan_logs').insert({
        qr_code_id:      qrCode.id,
        event_id:        eventId,
        registration_id: registrationId,
        volunteer_id:    req.volunteer.volunteerId,
        result:          'already_scanned',
      })
      const payload = {
        result:      'already_scanned',
        message:     'This QR code has already been used for entry',
        scanned_at:  qrCode.scanned_at,
        attendee: {
          name:  qrCode.registrations.attendee_name,
          email: qrCode.registrations.attendee_email,
        },
      }
      socketLib.broadcastScan(eventId, payload)
      return res.status(409).json(payload)
    }

    // 6. Mark scanned (atomic — only if still null)
    const { data: updated } = await supabase
      .from('qr_codes')
      .update({
        scanned_at: new Date().toISOString(),
        scanned_by: req.volunteer.volunteerId,
      })
      .eq('id', qrCode.id)
      .is('scanned_at', null)
      .select()
      .single()

    if (!updated) {
      const payload = { result: 'already_scanned', message: 'Just scanned by another device' }
      socketLib.broadcastScan(eventId, payload)
      return res.status(409).json(payload)
    }

    // 7. Log success
    await supabase.from('scan_logs').insert({
      qr_code_id:      qrCode.id,
      event_id:        eventId,
      registration_id: registrationId,
      volunteer_id:    req.volunteer.volunteerId,
      result:          'success',
    })

    // 8. Build response
    const successPayload = {
      result:     'success',
      message:    'Entry granted',
      attendee: {
        name:      qrCode.registrations.attendee_name,
        email:     qrCode.registrations.attendee_email,
        form_data: qrCode.registrations.form_data,
      },
      scanned_at:  updated.scanned_at,
      volunteer:   req.volunteer.name,
    }

    // 9. Broadcast to all connected clients watching this event
    socketLib.broadcastScan(eventId, successPayload)

    // 10. Also broadcast updated stats
    const { count: scannedIn }    = await supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('event_id', eventId).not('scanned_at', 'is', null)
    const { count: totalApproved } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', eventId).eq('status', 'approved')
    socketLib.broadcastStats(eventId, { scanned_in: scannedIn, total_approved: totalApproved })

    return res.json(successPayload)
  } catch (err) {
    console.error('Scan error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /scanner/live/:eventId — live dashboard (REST fallback) ──────────────

router.get('/live/:eventId', requireVolunteer, async (req, res) => {
  try {
    if (req.volunteer.eventId !== req.params.eventId) {
      return res.status(403).json({ error: 'Access denied for this event' })
    }

    const eid = req.params.eventId

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
      stats: {
        total_approved: totalApproved,
        scanned_in:     scannedIn,
        remaining:      totalApproved - scannedIn,
      },
      recent_entries: recent,
    })
  } catch (err) {
    console.error('Live dashboard error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /scanner/event-stats/:eventId — club admin real-time stats ───────────

router.get('/event-stats/:eventId', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase
      .from('events').select('id, club_id')
      .eq('id', req.params.eventId)
      .eq('club_id', req.club.clubId)
      .single()

    if (!event) return res.status(404).json({ error: 'Event not found' })

    const eid = req.params.eventId

    const [
      { count: total },
      { count: approved },
      { count: pending },
      { count: scanned },
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
