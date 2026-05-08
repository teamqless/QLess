const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');
const { sendQREmail } = require('../services/email');
const { generateQRCode } = require('../services/qr');

const router = express.Router();

// ─── POST /registrations/submit/:slug — public registration submit ────────────

router.post('/submit/:slug', async (req, res) => {
  try {
    // Fetch event by slug
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, clubs(name, logo_url, smtp_host, smtp_user, smtp_pass, smtp_from_name, smtp_from_email)')
      .eq('slug', req.params.slug)
      .eq('status', 'published')
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check deadline
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return res.status(410).json({ error: 'Registration deadline has passed' });
    }

    // Check capacity
    if (event.capacity) {
      const { count } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'approved');

      if (count >= event.capacity) {
        return res.status(410).json({ error: 'This event is fully booked' });
      }
    }

    const { form_data, payment_screenshot_url } = req.body;

    if (!form_data || typeof form_data !== 'object') {
      return res.status(400).json({ error: 'form_data is required' });
    }

    // Validate required fields from event's form_fields definition
    const missingFields = event.form_fields
      .filter(f => f.required && !form_data[f.id])
      .map(f => f.label);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: missingFields,
      });
    }

    // Extract attendee name and email for quick access
    const attendee_email = form_data['attendee_email'] || form_data['email'] ||
      Object.values(form_data).find(v => typeof v === 'string' && v.includes('@'));

    const attendee_name = form_data['attendee_name'] || form_data['name'] ||
      Object.values(form_data)[0];

    // Check for duplicate registration by email
    if (attendee_email) {
      const { data: duplicate } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', event.id)
        .eq('attendee_email', attendee_email)
        .single();

      if (duplicate) {
        return res.status(409).json({
          error: 'This email is already registered for this event',
        });
      }
    }

    // Payment requirement check
    if (event.entry_fee > 0 && !payment_screenshot_url) {
      return res.status(400).json({
        error: `This event requires a payment of ₹${event.entry_fee}. Please upload your payment screenshot.`,
      });
    }

    const payment_status = event.entry_fee === 0 ? 'free' : 'pending';

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        event_id:                event.id,
        club_id:                 event.club_id,
        form_data,
        attendee_name:           attendee_name || 'Unknown',
        attendee_email:          attendee_email || null,
        payment_screenshot_url:  payment_screenshot_url || null,
        payment_status,
        status: 'pending',
      })
      .select()
      .single();

    if (regError) {
      console.error('Registration insert error:', regError);
      return res.status(500).json({ error: 'Failed to submit registration' });
    }

    // If free event, auto-approve and send QR immediately
    if (event.entry_fee === 0) {
      await supabase
        .from('registrations')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', registration.id);

      // Generate and send QR in background
      (async () => {
        try {
          const qrCode = await generateQRCode(registration.id, event.id);
          await sendQREmail({
            registration: { ...registration, status: 'approved' },
            event,
            qrCode,
          });
        } catch (e) {
          console.error('Auto QR send error:', e);
        }
      })();

      return res.status(201).json({
        message: 'Registration successful! Your QR code will be emailed to you shortly.',
        registration_id: registration.id,
        auto_approved: true,
      });
    }

    return res.status(201).json({
      message: 'Registration submitted! The club will review your payment and send your QR code.',
      registration_id: registration.id,
      auto_approved: false,
    });

  } catch (err) {
    console.error('Submit registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /registrations/:eventId — list registrations for an event ────────────

router.get('/:eventId', requireAuth, async (req, res) => {
  try {
    // Verify event ownership
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', req.params.eventId)
      .eq('club_id', req.club.clubId)
      .single();

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { status, search } = req.query;

    let query = supabase
      .from('registrations')
      .select(`
        id, attendee_name, attendee_email, form_data,
        payment_screenshot_url, payment_status, status,
        approved_at, rejection_reason, created_at,
        qr_codes(id, scanned_at, email_sent)
      `)
      .eq('event_id', req.params.eventId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(
        `attendee_name.ilike.%${search}%,attendee_email.ilike.%${search}%`
      );
    }

    const { data: registrations, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch registrations' });
    }

    return res.json({ registrations });

  } catch (err) {
    console.error('Get registrations error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /registrations/:id/approve — approve and send QR ───────────────────

router.post('/:id/approve', requireAuth, async (req, res) => {
  try {
    const { data: registration, error } = await supabase
      .from('registrations')
      .select(`
        *, events(*, clubs(name, logo_url, smtp_host, smtp_user, smtp_pass, smtp_from_name, smtp_from_email))
      `)
      .eq('id', req.params.id)
      .eq('club_id', req.club.clubId)
      .single();

    if (error || !registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status === 'approved') {
      return res.status(400).json({ error: 'Registration is already approved' });
    }

    // Update status
    await supabase
      .from('registrations')
      .update({
        status:      'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', registration.id);

    // Generate QR and send email
    const event = registration.events;

    let qrCode;
    // Check if QR already exists (shouldn't, but safety)
    const { data: existingQR } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('registration_id', registration.id)
      .single();

    if (existingQR) {
      qrCode = existingQR;
    } else {
      qrCode = await generateQRCode(registration.id, event.id);
    }

    await sendQREmail({ registration, event, qrCode });

    return res.json({
      message: 'Registration approved and QR code sent to attendee',
      registration_id: registration.id,
    });

  } catch (err) {
    console.error('Approve error:', err);
    return res.status(500).json({ error: 'Failed to approve registration' });
  }
});

// ─── POST /registrations/:id/reject — reject registration ────────────────────

router.post('/:id/reject', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;

    const { data: registration } = await supabase
      .from('registrations')
      .select('id, club_id, status')
      .eq('id', req.params.id)
      .eq('club_id', req.club.clubId)
      .single();

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status === 'approved') {
      return res.status(400).json({ error: 'Cannot reject an already approved registration' });
    }

    await supabase
      .from('registrations')
      .update({
        status:           'rejected',
        rejection_reason: reason || 'Payment not verified',
      })
      .eq('id', registration.id);

    return res.json({ message: 'Registration rejected' });

  } catch (err) {
    console.error('Reject error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /registrations/:id/resend-qr — resend QR email ─────────────────────

router.post('/:id/resend-qr', requireAuth, async (req, res) => {
  try {
    const { data: registration } = await supabase
      .from('registrations')
      .select(`*, events(*, clubs(*))`)
      .eq('id', req.params.id)
      .eq('club_id', req.club.clubId)
      .single();

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status !== 'approved') {
      return res.status(400).json({ error: 'Registration must be approved first' });
    }

    const { data: qrCode } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('registration_id', registration.id)
      .single();

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    await sendQREmail({
      registration,
      event: registration.events,
      qrCode,
    });

    return res.json({ message: 'QR code resent successfully' });

  } catch (err) {
    console.error('Resend QR error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
