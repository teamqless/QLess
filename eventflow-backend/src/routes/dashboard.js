const express  = require('express')
const supabase = require('../lib/supabase')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// ─── GET /dashboard ───────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req, res) => {
  try {
    const clubId = req.club.clubId

    const [
      { count: totalEvents },
      { count: liveEvents },
      { count: totalRegistrations },
      { count: pendingApprovals },
    ] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('club_id', clubId),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('club_id', clubId).eq('status', 'published'),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('club_id', clubId),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('club_id', clubId).eq('status', 'pending'),
    ])

    const { data: recentEvents } = await supabase.from('events').select('id, title, status, event_date, slug, entry_fee').eq('club_id', clubId).order('created_at', { ascending: false }).limit(5)
    const { data: recentRegistrations } = await supabase.from('registrations').select('id, attendee_name, attendee_email, status, created_at, events(title)').eq('club_id', clubId).order('created_at', { ascending: false }).limit(10)

    return res.json({
      stats: { total_events: totalEvents, live_events: liveEvents, total_registrations: totalRegistrations, pending_approvals: pendingApprovals },
      recent_events: recentEvents,
      recent_registrations: recentRegistrations,
    })
  } catch (err) { console.error('Dashboard error:', err); return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── GET /dashboard/event/:eventId — per-event analytics ─────────────────────

router.get('/event/:eventId', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase.from('events').select('id, title, capacity').eq('id', req.params.eventId).eq('club_id', req.club.clubId).single()
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const eid = req.params.eventId
    const [
      { count: total },
      { count: pending },
      { count: approved },
      { count: rejected },
      { count: scanned },
    ] = await Promise.all([
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', eid),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', eid).eq('status', 'pending'),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', eid).eq('status', 'approved'),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', eid).eq('status', 'rejected'),
      supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('event_id', eid).not('scanned_at', 'is', null),
    ])

    // Timeline - last 14 days
    const { data: timeline } = await supabase.from('registrations').select('created_at').eq('event_id', eid).gte('created_at', new Date(Date.now() - 14*24*60*60*1000).toISOString()).order('created_at', { ascending: true })
    const byDate = {}
    ;(timeline || []).forEach(r => {
      const date = r.created_at.slice(0,10)
      byDate[date] = (byDate[date] || 0) + 1
    })

    return res.json({
      event,
      stats: { total, pending, approved, rejected, scanned, not_yet_arrived: approved - scanned, capacity: event.capacity || null, capacity_pct: event.capacity ? Math.round((approved/event.capacity)*100) : null },
      timeline: byDate,
    })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── GET /dashboard/export/:eventId — CSV download ───────────────────────────

router.get('/export/:eventId', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase.from('events').select('id, title, form_fields').eq('id', req.params.eventId).eq('club_id', req.club.clubId).single()
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const { data: registrations } = await supabase.from('registrations').select('*, qr_codes(scanned_at)').eq('event_id', event.id).order('created_at', { ascending: true })

    const fields  = event.form_fields || []
    const headers = ['Registration ID', ...fields.map(f => f.label), 'Status', 'Payment Status', 'Registered At', 'Checked In At']
    const rows    = (registrations || []).map(reg => {
      const formValues = fields.map(f => `"${String(reg.form_data?.[f.id] || '').replace(/"/g,'""')}"`)
      return [reg.id.slice(0,8).toUpperCase(), ...formValues, reg.status, reg.payment_status, reg.created_at, reg.qr_codes?.[0]?.scanned_at || ''].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="eventflow-${event.title.replace(/\s+/g,'-')}-${Date.now()}.csv"`)
    return res.send(csv)
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── GET /dashboard/export-sheets/:eventId — Google Sheets compatible JSON ───

router.get('/export-sheets/:eventId', requireAuth, async (req, res) => {
  try {
    if (req.club.plan === 'free') {
      return res.status(403).json({ error: 'Google Sheets export is a Pro feature', upgrade_required: true })
    }

    const { data: event } = await supabase.from('events').select('id, title, form_fields').eq('id', req.params.eventId).eq('club_id', req.club.clubId).single()
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const { data: registrations } = await supabase.from('registrations').select('*, qr_codes(scanned_at)').eq('event_id', event.id).order('created_at', { ascending: true })

    const fields = event.form_fields || []
    const rows   = (registrations || []).map(reg => {
      const row = { 'Registration ID': reg.id.slice(0,8).toUpperCase() }
      fields.forEach(f => { row[f.label] = reg.form_data?.[f.id] || '' })
      row['Status']        = reg.status
      row['Payment']       = reg.payment_status
      row['Registered At'] = reg.created_at
      row['Checked In']    = reg.qr_codes?.[0]?.scanned_at || ''
      return row
    })

    return res.json({
      event_title: event.title,
      row_count:   rows.length,
      columns:     ['Registration ID', ...fields.map(f => f.label), 'Status', 'Payment', 'Registered At', 'Checked In'],
      rows,
    })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
