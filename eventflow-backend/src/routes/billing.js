const express  = require('express')
const supabase = require('../lib/supabase')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// Plan prices in paise (Razorpay uses smallest currency unit)
const PLAN_PRICES = {
  pro:         49900,   // ₹499
  institution: 499900,  // ₹4999
}

// ─── POST /billing/order — create Razorpay order ─────────────────────────────

router.post('/order', requireAuth, async (req, res) => {
  try {
    const { plan } = req.body

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ error: 'Invalid plan. Choose "pro" or "institution".' })
    }

    // Check Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_your')) {
      // If Razorpay not configured, allow manual upgrade for testing
      return res.status(503).json({
        error: 'Payment gateway not configured.',
        manual_upgrade: true,
        message: 'Contact EventFlow to upgrade your plan manually.',
      })
    }

    const Razorpay = require('razorpay')
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const order = await razorpay.orders.create({
      amount:   PLAN_PRICES[plan],
      currency: 'INR',
      notes: {
        club_id: req.club.clubId,
        plan,
        club_email: req.club.email,
      },
    })

    return res.json({
      order_id:   order.id,
      amount:     order.amount,
      currency:   order.currency,
      key_id:     process.env.RAZORPAY_KEY_ID,
      club_name:  req.club.name,
      plan,
    })
  } catch (err) {
    console.error('Create order error:', err)
    return res.status(500).json({ error: 'Failed to create payment order' })
  }
})

// ─── POST /billing/verify — verify payment + upgrade plan ────────────────────

router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' })
    }

    // Verify signature
    const crypto = require('crypto')
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' })
    }

    // Upgrade club plan
    const { data: club, error } = await supabase
      .from('clubs')
      .update({ plan })
      .eq('id', req.club.clubId)
      .select('id, name, email, plan')
      .single()

    if (error) {
      console.error('Plan upgrade DB error:', error)
      return res.status(500).json({ error: 'Payment verified but plan upgrade failed. Contact support.' })
    }

    // Log payment
    await supabase.from('payments').insert({
      club_id:            req.club.clubId,
      plan,
      amount:             PLAN_PRICES[plan],
      razorpay_order_id,
      razorpay_payment_id,
      status:             'success',
    }).catch(() => {}) // Don't fail if payments table doesn't exist yet

    return res.json({
      message: `Successfully upgraded to ${plan === 'pro' ? 'Club Pro' : 'Institution'} plan!`,
      club,
    })
  } catch (err) {
    console.error('Verify payment error:', err)
    return res.status(500).json({ error: 'Payment verification failed' })
  }
})

// ─── POST /billing/manual-upgrade — admin manually upgrades a club ────────────
// Use this from Supabase directly or a simple admin script

router.post('/manual-upgrade', async (req, res) => {
  try {
    const { club_email, plan, admin_secret } = req.body

    // Simple secret check — set ADMIN_SECRET in env
    if (admin_secret !== (process.env.ADMIN_SECRET || 'eventflow-admin-2026')) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (!['free', 'pro', 'institution'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    const { data: club, error } = await supabase
      .from('clubs')
      .update({ plan })
      .eq('email', club_email.toLowerCase())
      .select('id, name, email, plan')
      .single()

    if (error || !club) return res.status(404).json({ error: 'Club not found' })

    return res.json({ message: `Plan updated to ${plan}`, club })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /billing/status — current plan details ───────────────────────────────

router.get('/status', requireAuth, async (req, res) => {
  try {
    const { data: club } = await supabase
      .from('clubs')
      .select('id, name, plan')
      .eq('id', req.club.clubId)
      .single()

    const { count: eventCount } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', req.club.clubId)

    const limits = {
      free:        { events: 1,  attendees_per_event: 100 },
      pro:         { events: -1, attendees_per_event: -1  },
      institution: { events: -1, attendees_per_event: -1  },
    }

    return res.json({
      plan:        club.plan,
      event_count: eventCount,
      limits:      limits[club.plan] || limits.free,
      can_create_event: club.plan !== 'free' || eventCount < 1,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
