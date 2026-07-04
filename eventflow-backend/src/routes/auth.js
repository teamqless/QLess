const express  = require('express')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const { z }    = require('zod')
const supabase = require('../lib/supabase')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

const loginSchema = z.object({
  email:    z.string().min(1), // can be email or admin username
  password: z.string().min(1),
})

const generateToken = (club, expiresIn = '7d') =>
  jwt.sign({ clubId: club.id, email: club.email, name: club.name, plan: club.plan }, process.env.JWT_SECRET, { expiresIn })

const generateAdminToken = (admin, expiresIn = '7d') =>
  jwt.sign({ adminId: admin.id, username: admin.username, role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn })

// ─── POST /auth/signup ────────────────────────────────────────────────────────
// Public signup is disabled. Clubs must be created by super admin.

// ─── POST /auth/login ─────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid email or password format' })

    const { email, password } = parsed.data

    // 1. Check if it's a super admin
    const { data: admin } = await supabase.from('super_admins').select('*').eq('username', email).single()
    if (admin) {
      const match = await bcrypt.compare(password, admin.password_hash)
      if (match) {
        return res.json({
          message: 'Admin logged in successfully',
          role: 'admin',
          token: generateAdminToken(admin),
          admin: { id: admin.id, username: admin.username },
        })
      }
    }

    // 2. Check if it's a club
    const { data: club, error } = await supabase.from('clubs').select('*').eq('email', email.toLowerCase()).single()
    if (error || !club) return res.status(401).json({ error: 'Invalid email or password' })

    const match = await bcrypt.compare(password, club.password_hash)
    if (!match) return res.status(401).json({ error: 'Invalid email or password' })

    return res.json({
      message: 'Logged in successfully',
      role: 'club',
      token:   generateToken(club),
      club: { id: club.id, name: club.name, email: club.email, college: club.college, phone: club.phone, plan: club.plan, logo_url: club.logo_url },
    })
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data: club, error } = await supabase
      .from('clubs')
      .select('id, name, email, college, phone, plan, logo_url, smtp_host, smtp_port, smtp_from_name, smtp_from_email, created_at')
      .eq('id', req.club.clubId)
      .single()

    if (error || !club) return res.status(404).json({ error: 'Club not found' })
    return res.json({ club })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── PATCH /auth/profile ──────────────────────────────────────────────────────

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const allowed = ['name', 'college', 'phone', 'logo_url']
    const updates = {}
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    }

    const { data: club, error } = await supabase
      .from('clubs').update(updates).eq('id', req.club.clubId)
      .select('id, name, email, college, phone, plan, logo_url').single()

    if (error) return res.status(500).json({ error: 'Failed to update profile' })
    return res.json({ message: 'Profile updated', club })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── PATCH /auth/smtp — save club SMTP settings (Pro only) ───────────────────

router.patch('/smtp', requireAuth, async (req, res) => {
  try {
    if (req.club.plan === 'free') {
      return res.status(403).json({ error: 'Custom SMTP is a Club Pro feature. Upgrade to use your own email.', upgrade_required: true })
    }

    const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_name, smtp_from_email } = req.body

    const { data: club, error } = await supabase
      .from('clubs')
      .update({ smtp_host, smtp_port: smtp_port ? Number(smtp_port) : 587, smtp_user, smtp_pass, smtp_from_name, smtp_from_email })
      .eq('id', req.club.clubId)
      .select('id, smtp_host, smtp_port, smtp_from_name, smtp_from_email')
      .single()

    if (error) return res.status(500).json({ error: 'Failed to save SMTP settings' })
    return res.json({ message: 'SMTP settings saved', smtp: club })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

// ─── POST /auth/smtp/test — send a test email ────────────────────────────────

router.post('/smtp/test', requireAuth, async (req, res) => {
  try {
    if (req.club.plan === 'free') {
      return res.status(403).json({ error: 'Custom SMTP is a Pro feature', upgrade_required: true })
    }

    const { data: club } = await supabase.from('clubs').select('*').eq('id', req.club.clubId).single()
    if (!club.smtp_host || !club.smtp_user) {
      return res.status(400).json({ error: 'Configure SMTP settings first' })
    }

    const { sendEmail } = require('../services/email')
    await sendEmail({
      to:      club.email,
      subject: 'EventFlow SMTP Test ✓',
      html:    `<p>Your SMTP configuration is working correctly! Emails for <strong>${club.name}</strong> will be sent from <strong>${club.smtp_from_email || club.smtp_user}</strong>.</p>`,
      club,
    })

    return res.json({ message: `Test email sent to ${club.email}` })
  } catch (err) {
    console.error('SMTP test error:', err)
    return res.status(500).json({ error: `SMTP test failed: ${err.message}` })
  }
})

// ─── POST /auth/change-password ───────────────────────────────────────────────

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }

    const { data: club } = await supabase.from('clubs').select('password_hash').eq('id', req.club.clubId).single()
    const match = await bcrypt.compare(currentPassword, club.password_hash)
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' })

    const password_hash = await bcrypt.hash(newPassword, 12)
    await supabase.from('clubs').update({ password_hash }).eq('id', req.club.clubId)

    return res.json({ message: 'Password changed successfully' })
  } catch (err) { return res.status(500).json({ error: 'Internal server error' }) }
})

module.exports = router
