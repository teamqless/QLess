const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const signupSchema = z.object({
  name:    z.string().min(2, 'Club name must be at least 2 characters'),
  email:   z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  college: z.string().optional(),
  phone:   z.string().optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ─── Helper: generate JWT ─────────────────────────────────────────────────────

const generateToken = (club, expiresIn = '7d') => {
  return jwt.sign(
    {
      clubId: club.id,
      email:  club.email,
      name:   club.name,
      plan:   club.plan,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// ─── POST /auth/signup ────────────────────────────────────────────────────────

router.post('/signup', async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, password, college, phone } = parsed.data;

    // Check if club already exists
    const { data: existing } = await supabase
      .from('clubs')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({ error: 'A club with this email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert club
    const { data: club, error } = await supabase
      .from('clubs')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash,
        college: college || null,
        phone:   phone || null,
        plan:    'free',
      })
      .select('id, name, email, college, phone, plan, logo_url, created_at')
      .single();

    if (error) {
      console.error('Signup DB error:', error);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    const token = generateToken(club);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      club: {
        id:      club.id,
        name:    club.name,
        email:   club.email,
        college: club.college,
        phone:   club.phone,
        plan:    club.plan,
      },
    });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid email or password format' });
    }

    const { email, password } = parsed.data;

    // Fetch club
    const { data: club, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !club) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, club.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(club);

    return res.json({
      message: 'Logged in successfully',
      token,
      club: {
        id:         club.id,
        name:       club.name,
        email:      club.email,
        college:    club.college,
        phone:      club.phone,
        plan:       club.plan,
        logo_url:   club.logo_url,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data: club, error } = await supabase
      .from('clubs')
      .select('id, name, email, college, phone, plan, logo_url, smtp_host, smtp_from_name, smtp_from_email, created_at')
      .eq('id', req.club.clubId)
      .single();

    if (error || !club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    return res.json({ club });

  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /auth/profile ──────────────────────────────────────────────────────

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { name, college, phone, logo_url } = req.body;

    const updates = {};
    if (name)     updates.name     = name;
    if (college)  updates.college  = college;
    if (phone)    updates.phone    = phone;
    if (logo_url) updates.logo_url = logo_url;

    const { data: club, error } = await supabase
      .from('clubs')
      .update(updates)
      .eq('id', req.club.clubId)
      .select('id, name, email, college, phone, plan, logo_url')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    return res.json({ message: 'Profile updated', club });

  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /auth/smtp ─────────────────────────────────────────────────────────
// Save club's own SMTP settings (used for QR email delivery in Pro plan)

router.patch('/smtp', requireAuth, async (req, res) => {
  try {
    if (req.club.plan === 'free') {
      return res.status(403).json({
        error: 'Custom SMTP is a Pro plan feature. Upgrade to use your club email.',
      });
    }

    const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_name, smtp_from_email } = req.body;

    const { data: club, error } = await supabase
      .from('clubs')
      .update({ smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_name, smtp_from_email })
      .eq('id', req.club.clubId)
      .select('id, smtp_host, smtp_port, smtp_from_name, smtp_from_email')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to save SMTP settings' });
    }

    return res.json({ message: 'SMTP settings saved', smtp: club });

  } catch (err) {
    console.error('SMTP update error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /auth/change-password ───────────────────────────────────────────────

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const { data: club } = await supabase
      .from('clubs')
      .select('password_hash')
      .eq('id', req.club.clubId)
      .single();

    const match = await bcrypt.compare(currentPassword, club.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const password_hash = await bcrypt.hash(newPassword, 12);

    await supabase
      .from('clubs')
      .update({ password_hash })
      .eq('id', req.club.clubId);

    return res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
