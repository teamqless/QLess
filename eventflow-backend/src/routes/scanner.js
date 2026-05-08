const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');
const { requireAuth, requireVolunteer } = require('../middleware/auth');

const router = express.Router();

// ─── POST /scanner/volunteers — create volunteer ──────────────────────────────

router.post('/volunteers', requireAuth, async (req, res) => {
  try {
    const { name, access_code, event_id } = req.body;

    if (!name || !access_code) {
      return res.status(400).json({ error: 'name and access_code are required' });
    }

    if (access_code.length < 4) {
      return res.status(400).json({ error: 'Access code must be at least 4 characters' });
    }

    // Check unique access code within this club
    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('club_id', req.club.clubId)
      .eq('access_code', access_code.toUpperCase())
      .single();

    if (existing) {
      return res.status(409).json({ error: 'This access code is already in use' });
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
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create volunteer' });
    }

    return res.status(201).json({ volunteer });

  } catch (err) {
    console.error('Create volunteer error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /scanner/volunteers — list club volunteers ───────────────────────────

router.get('/volunteers', requireAuth, async (req, res) => {
  try {
    const { data: volunteers, error } = await supabase
      .from('volunteers')
      .select('id, name, access_code, event_id, is_active, created_at')
      .eq('club_id', req.club.clubId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch volunteers' });

    return res.json({ volunteers });

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE /scanner/volunteers/:id — deactivate volunteer ───────────────────

router.delete('/volunteers/:id', requireAuth, async (req, res) => {
  try {
    await supabase
      .from('volunteers')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .eq('club_id', req.club.clubId);

    return res.json({ message: 'Volunteer deactivated' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /scanner/login — volunteer login with access code ──────────────────

router.post('/login', async (req, res) => {
  try {
    const { access_code, event_id } = req.body;

    if (!access_code || !event_id) {
      return res.status(400).json({ error: 'access_code and event_id are required' });
    }

    // Find volunteer: either event-specific or club-wide
    const { data: volunteer, error } = await supabase
      .from('volunteers')
      .select('*, clubs(id, name)')
      .eq('access_code', access_code.toUpperCase())
      .eq('is_active', true)
      .or(`event_id.eq.${event_id},event_id.is.null`)
      .single();

    if (error || !volunteer) {
      return res.status(401).json({ error: 'Invalid access code' });
    }

    // Verify event belongs to this club
    const { data: event } = await supabase
      .from('events')
      .select('id, title, status, club_id')
      .eq('id', event_id)
      .eq('club_id', volunteer.club_id)
      .single();

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'published' && event.status !== 'completed') {
      return res.status(403).json({ error: 'Event is not active for scanning' });
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
    );

    return res.json({
      token,
      volunteer: { id: volunteer.id, name: volunteer.name },
      event:     { id: event.id, title: event.title },
      club:      { name: volunteer.clubs.name },
    });

  } catch (err) {
    console.error('Volunteer login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /scanner/scan — THE CORE: scan a QR token ─────────────────────────

router.post('/scan', requireVolunteer, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'QR token is required' });
    }

    // 1. Decode the QR token (it's a JWT itself)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      // Log invalid scan attempt
      await supabase.from('scan_logs').insert({
        qr_code_id:      '00000000-0000-0000-0000-000000000000',
        event_id:        req.volunteer.eventId,
        registration_id: '00000000-0000-0000-0000-000000000000',
        volunteer_id:    req.volunteer.volunteerId,
        result:          'invalid',
      }).catch(() => {});

      return res.status(400).json({
        result: 'invalid',
        message: 'This QR code is not valid',
      });
    }

    const { registrationId, eventId } = decoded;

    // 2. Ensure QR is for this event
    if (eventId !== req.volunteer.eventId) {
      return res.status(403).json({
        result: 'invalid',
        message: 'This QR code is for a different event',
      });
    }

    // 3. Fetch QR code record
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*, registrations(attendee_name, attendee_email, status, form_data)')
      .eq('registration_id', registrationId)
      .eq('event_id', eventId)
      .single();

    if (qrError || !qrCode) {
      return res.status(404).json({
        result: 'invalid',
        message: 'QR code not found in system',
      });
    }

    // 4. Check registration status
    if (qrCode.registrations.status !== 'approved') {
      await supabase.from('scan_logs').insert({
        qr_code_id:      qrCode.id,
        event_id:        eventId,
        registration_id: registrationId,
        volunteer_id:    req.volunteer.volunteerId,
        result:          'rejected',
      });

      return res.status(403).json({
        result:  'rejected',
        message: 'This registration has not been approved',
        attendee: { name: qrCode.registrations.attendee_name },
      });
    }

    // 5. ── ONE-SCAN ENFORCEMENT ──────────────────────────────────────────────
    if (qrCode.scanned_at !== null) {
      await supabase.from('scan_logs').insert({
        qr_code_id:      qrCode.id,
        event_id:        eventId,
        registration_id: registrationId,
        volunteer_id:    req.volunteer.volunteerId,
        result:          'already_scanned',
      });

      return res.status(409).json({
        result:       'already_scanned',
        message:      'This QR code has already been used',
        scanned_at:   qrCode.scanned_at,
        attendee: {
          name:  qrCode.registrations.attendee_name,
          email: qrCode.registrations.attendee_email,
        },
      });
    }

    // 6. Mark as scanned (atomic update)
    const { data: updated, error: updateError } = await supabase
      .from('qr_codes')
      .update({
        scanned_at: new Date().toISOString(),
        scanned_by: req.volunteer.volunteerId,
      })
      .eq('id', qrCode.id)
      .is('scanned_at', null)          // extra safety: only update if still null
      .select()
      .single();

    // Race condition: another volunteer scanned it a millisecond ago
    if (!updated) {
      return res.status(409).json({
        result:  'already_scanned',
        message: 'This QR code was just scanned by another device',
      });
    }

    // 7. Log successful scan
    await supabase.from('scan_logs').insert({
      qr_code_id:      qrCode.id,
      event_id:        eventId,
      registration_id: registrationId,
      volunteer_id:    req.volunteer.volunteerId,
      result:          'success',
    });

    // 8. Return success with attendee info
    return res.json({
      result:  'success',
      message: 'Entry granted',
      attendee: {
        name:      qrCode.registrations.attendee_name,
        email:     qrCode.registrations.attendee_email,
        form_data: qrCode.registrations.form_data,
      },
      scanned_at: updated.scanned_at,
    });

  } catch (err) {
    console.error('Scan error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /scanner/live/:eventId — live entry dashboard ───────────────────────

router.get('/live/:eventId', requireVolunteer, async (req, res) => {
  try {
    if (req.volunteer.eventId !== req.params.eventId) {
      return res.status(403).json({ error: 'Access denied for this event' });
    }

    const { count: totalApproved } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', req.params.eventId)
      .eq('status', 'approved');

    const { count: scannedIn } = await supabase
      .from('qr_codes')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', req.params.eventId)
      .not('scanned_at', 'is', null);

    // Recent 10 entries
    const { data: recent } = await supabase
      .from('scan_logs')
      .select('scanned_at, result, registrations(attendee_name)')
      .eq('event_id', req.params.eventId)
      .eq('result', 'success')
      .order('scanned_at', { ascending: false })
      .limit(10);

    return res.json({
      stats: {
        total_approved: totalApproved,
        scanned_in:     scannedIn,
        remaining:      totalApproved - scannedIn,
      },
      recent_entries: recent,
    });

  } catch (err) {
    console.error('Live dashboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
