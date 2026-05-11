const express  = require('express')
const { z }    = require('zod')
const { v4: uuidv4 } = require('uuid')
const supabase = require('../lib/supabase')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

const generateSlug = (title) =>
  `${title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}-${uuidv4().slice(0,6)}`

const formFieldSchema = z.object({
  id:          z.string(),
  label:       z.string().min(1),
  type:        z.enum(['text','email','phone','number','textarea','select','checkbox','file']),
  required:    z.boolean().default(false),
  options:     z.array(z.string()).optional(),
  placeholder: z.string().optional(),
})

const createEventSchema = z.object({
  title:                 z.string().min(2),
  description:           z.string().optional(),
  venue:                 z.string().optional(),
  event_date:            z.string().optional(),
  registration_deadline: z.string().optional(),
  banner_url:            z.string().optional(),
  theme_color:           z.string().default('#6366f1'),
  capacity:              z.number().int().positive().optional(),
  entry_fee:             z.number().int().min(0).default(0),
  form_fields:           z.array(formFieldSchema).min(1),
})

// ─── GET /events ──────────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query
    let query = supabase
      .from('events')
      .select('id, title, slug, status, event_date, venue, capacity, entry_fee, theme_color, banner_url, created_at, registrations(count)')
      .eq('club_id', req.club.clubId)
      .order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data: events, error } = await query
    if (error) return res.status(500).json({ error: 'Failed to fetch events' })
    return res.json({ events })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── POST /events — create event with plan gate ───────────────────────────────

router.post('/', requireAuth, async (req, res) => {
  try {
    // ── Plan gate ────────────────────────────────────────────────────────────
    if (req.club.plan === 'free') {
      const { count } = await supabase
        .from('events').select('id', { count: 'exact', head: true })
        .eq('club_id', req.club.clubId)

      if (count >= 1) {
        return res.status(403).json({
          error:            'Free plan allows only 1 event.',
          upgrade_required: true,
          upgrade_message:  'Upgrade to Club Pro (₹499/event) to create unlimited events with unlimited attendees.',
        })
      }
    }

    const parsed = createEventSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors })

    const data = parsed.data

    // Auto-inject email field if missing
    if (!data.form_fields.some(f => f.type === 'email')) {
      data.form_fields.unshift({ id: 'attendee_email', label: 'Email Address', type: 'email', required: true, placeholder: 'your@email.com' })
    }
    // Auto-inject name field if missing
    if (!data.form_fields.some(f => f.label.toLowerCase().includes('name') && f.type === 'text')) {
      data.form_fields.unshift({ id: 'attendee_name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your full name' })
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        club_id:               req.club.clubId,
        title:                 data.title,
        description:           data.description || null,
        venue:                 data.venue || null,
        event_date:            data.event_date || null,
        registration_deadline: data.registration_deadline || null,
        banner_url:            data.banner_url || null,
        theme_color:           data.theme_color,
        capacity:              data.capacity || null,
        entry_fee:             data.entry_fee,
        form_fields:           data.form_fields,
        slug:                  generateSlug(data.title),
        status:                'draft',
      })
      .select()
      .single()

    if (error) { console.error('Create event error:', error); return res.status(500).json({ error: 'Failed to create event' }) }
    return res.status(201).json({ message: 'Event created', event })
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── GET /events/public/:slug ─────────────────────────────────────────────────

router.get('/public/:slug', async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('id, title, description, venue, event_date, registration_deadline, banner_url, theme_color, capacity, entry_fee, form_fields, slug, status, clubs(name, logo_url, college)')
      .eq('slug', req.params.slug)
      .eq('status', 'published')
      .single()

    if (error || !event) return res.status(404).json({ error: 'Event not found or not accepting registrations' })
    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) return res.status(410).json({ error: 'Registration deadline has passed' })

    if (event.capacity) {
      const { count } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'approved')
      if (count >= event.capacity) return res.status(410).json({ error: 'This event is fully booked' })
    }

    return res.json({ event })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── GET /events/:id ──────────────────────────────────────────────────────────

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from('events').select('*').eq('id', req.params.id).eq('club_id', req.club.clubId).single()
    if (error || !event) return res.status(404).json({ error: 'Event not found' })

    const [
      { count: totalRegistrations },
      { count: approvedRegistrations },
      { count: scannedCount },
    ] = await Promise.all([
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
      supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'approved'),
      supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('event_id', event.id).not('scanned_at', 'is', null),
    ])

    return res.json({
      event,
      stats: { total: totalRegistrations, approved: approvedRegistrations, scanned: scannedCount, pending: totalRegistrations - approvedRegistrations },
    })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── PATCH /events/:id ────────────────────────────────────────────────────────

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('events').select('id').eq('id', req.params.id).eq('club_id', req.club.clubId).single()
    if (!existing) return res.status(404).json({ error: 'Event not found' })

    if (req.body.form_fields) {
      const { count } = await supabase.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', req.params.id)
      if (count > 0) return res.status(400).json({ error: 'Form fields cannot be changed after registrations have been received' })
    }

    const allowed = ['title','description','venue','event_date','registration_deadline','banner_url','theme_color','capacity','entry_fee','form_fields','status']
    const updates = {}
    for (const f of allowed) { if (req.body[f] !== undefined) updates[f] = req.body[f] }

    const { data: event, error } = await supabase.from('events').update(updates).eq('id', req.params.id).select().single()
    if (error) return res.status(500).json({ error: 'Failed to update event' })
    return res.json({ message: 'Event updated', event })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── PATCH /events/:id/publish ────────────────────────────────────────────────

router.patch('/:id/publish', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase.from('events').select('*').eq('id', req.params.id).eq('club_id', req.club.clubId).single()
    if (!event) return res.status(404).json({ error: 'Event not found' })
    if (!event.form_fields.length) return res.status(400).json({ error: 'Add at least one form field before publishing' })

    const newStatus = event.status === 'published' ? 'draft' : 'published'
    const { data: updated } = await supabase.from('events').update({ status: newStatus }).eq('id', req.params.id).select('id, status, slug').single()

    return res.json({
      message:          newStatus === 'published' ? 'Event is now live' : 'Event moved to draft',
      event:            updated,
      registration_url: newStatus === 'published' ? `${process.env.FRONTEND_URL}/register/${updated.slug}` : null,
    })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── DELETE /events/:id ───────────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { data: event } = await supabase.from('events').select('id, status').eq('id', req.params.id).eq('club_id', req.club.clubId).single()
    if (!event) return res.status(404).json({ error: 'Event not found' })
    if (event.status === 'published') return res.status(400).json({ error: 'Unpublish the event before deleting' })
    await supabase.from('events').delete().eq('id', req.params.id)
    return res.json({ message: 'Event deleted' })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
