const express = require('express');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─── GET /dashboard — club summary stats ─────────────────────────────────────

router.get('/', requireAuth, async (req, res) => {
  try {
    const clubId = req.club.clubId;

    // Total events
    const { count: totalEvents } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', clubId);

    const { count: liveEvents } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('status', 'published');

    // Total registrations across all events
    const { count: totalRegistrations } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', clubId);

    const { count: pendingApprovals } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('status', 'pending');

    // Recent 5 events
    const { data: recentEvents } = await supabase
      .from('events')
      .select('id, title, status, event_date, slug')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Recent 10 registrations
    const { data: recentRegistrations } = await supabase
      .from('registrations')
      .select('id, attendee_name, attendee_email, status, created_at, events(title)')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(10);

    return res.json({
      stats: {
        total_events:        totalEvents,
        live_events:         liveEvents,
        total_registrations: totalRegistrations,
        pending_approvals:   pendingApprovals,
      },
      recent_events:        recentEvents,
      recent_registrations: recentRegistrations,
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /dashboard/event/:eventId — per-event analytics ─────────────────────

router.get('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('id, title, capacity')
      .eq('id', req.params.eventId)
      .eq('club_id', req.club.clubId)
      .single();

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { count: total }    = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id);
    const { count: pending }  = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'pending');
    const { count: approved } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'approved');
    const { count: rejected } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'rejected');
    const { count: scanned }  = await supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('event_id', event.id).not('scanned_at', 'is', null);

    // Registrations over time (last 14 days)
    const { data: timeline } = await supabase
      .from('registrations')
      .select('created_at')
      .eq('event_id', event.id)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const byDate = {};
    (timeline || []).forEach(r => {
      const date = r.created_at.slice(0, 10);
      byDate[date] = (byDate[date] || 0) + 1;
    });

    return res.json({
      event,
      stats: {
        total,
        pending,
        approved,
        rejected,
        scanned,
        not_yet_arrived: approved - scanned,
        capacity:        event.capacity || null,
        capacity_pct:    event.capacity ? Math.round((approved / event.capacity) * 100) : null,
      },
      timeline: byDate,
    });

  } catch (err) {
    console.error('Event analytics error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /dashboard/export/:eventId — CSV export ─────────────────────────────

router.get('/export/:eventId', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('id, title, form_fields')
      .eq('id', req.params.eventId)
      .eq('club_id', req.club.clubId)
      .single();

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { data: registrations } = await supabase
      .from('registrations')
      .select('*, qr_codes(scanned_at)')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true });

    // Build CSV header from form_fields
    const fields = event.form_fields || [];
    const headers = [
      'Registration ID',
      ...fields.map(f => f.label),
      'Status',
      'Payment Status',
      'Registered At',
      'Checked In At',
    ];

    const rows = (registrations || []).map(reg => {
      const formValues = fields.map(f => {
        const val = reg.form_data?.[f.id] || '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });

      const scannedAt = reg.qr_codes?.[0]?.scanned_at || '';

      return [
        reg.id.slice(0, 8).toUpperCase(),
        ...formValues,
        reg.status,
        reg.payment_status,
        reg.created_at,
        scannedAt,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="eventflow-${event.title.replace(/\s+/g, '-')}-${Date.now()}.csv"`
    );
    return res.send(csv);

  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
