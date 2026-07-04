const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const supabase = require('../lib/supabase')
const { requireAdminAuth } = require('../middleware/adminAuth')

const router = express.Router()

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const createClubSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  plan: z.enum(['free', 'pro', 'institution']).default('free'),
})

const generateAdminToken = (admin, expiresIn = '7d') =>
  jwt.sign({ adminId: admin.id, username: admin.username, role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn })

// ─── POST /admin/login ───────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid username or password format' })

    const { username, password } = parsed.data

    const { data: admin, error } = await supabase.from('super_admins').select('*').eq('username', username).single()
    if (error || !admin) return res.status(401).json({ error: 'Invalid username or password' })

    const match = await bcrypt.compare(password, admin.password_hash)
    if (!match) return res.status(401).json({ error: 'Invalid username or password' })

    return res.json({
      message: 'Admin logged in successfully',
      token: generateAdminToken(admin),
      admin: { id: admin.id, username: admin.username },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /admin/clubs ────────────────────────────────────────────────────────
router.get('/clubs', requireAdminAuth, async (req, res) => {
  try {
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('id, name, email, plan, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return res.json({ clubs })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /admin/clubs ───────────────────────────────────────────────────────
router.post('/clubs', requireAdminAuth, async (req, res) => {
  try {
    const parsed = createClubSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors })

    const { name, email, password, plan } = parsed.data

    const { data: existing } = await supabase.from('clubs').select('id').eq('email', email.toLowerCase()).single()
    if (existing) return res.status(409).json({ error: 'A club with this email already exists' })

    const password_hash = await bcrypt.hash(password, 12)

    const { data: club, error } = await supabase
      .from('clubs')
      .insert({ name, email: email.toLowerCase(), password_hash, plan })
      .select('id, name, email, plan, created_at')
      .single()

    if (error) throw error

    return res.status(201).json({ message: 'Club created successfully', club })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── PATCH /admin/clubs/:id ──────────────────────────────────────────────────
router.patch('/clubs/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { password, plan } = req.body

    const updates = {}
    if (plan) updates.plan = plan
    if (password) updates.password_hash = await bcrypt.hash(password, 12)

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' })
    }

    const { data: club, error } = await supabase
      .from('clubs')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, plan')
      .single()

    if (error) throw error

    return res.json({ message: 'Club updated successfully', club })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
