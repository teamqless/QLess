const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Multer: store in memory, 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  },
});

// ─── POST /upload/payment-screenshot — public upload (for registration form) ──

router.post('/payment-screenshot', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const filePath = `payment-screenshots/${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from('eventflow-uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    const { data: urlData } = supabase.storage
      .from('eventflow-uploads')
      .getPublicUrl(filePath);

    return res.json({ url: urlData.publicUrl });

  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// ─── POST /upload/banner — club admin uploads event banner ────────────────────

router.post('/banner', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const filePath = `banners/${req.club.clubId}/${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from('eventflow-uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ error: 'Failed to upload banner' });
    }

    const { data: urlData } = supabase.storage
      .from('eventflow-uploads')
      .getPublicUrl(filePath);

    return res.json({ url: urlData.publicUrl });

  } catch (err) {
    console.error('Banner upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// ─── POST /upload/logo — club logo upload ─────────────────────────────────────

router.post('/logo', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const filePath = `logos/${req.club.clubId}.${ext}`;

    const { error } = await supabase.storage
      .from('eventflow-uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) {
      return res.status(500).json({ error: 'Failed to upload logo' });
    }

    const { data: urlData } = supabase.storage
      .from('eventflow-uploads')
      .getPublicUrl(filePath);

    const logoUrl = urlData.publicUrl;

    // Save logo URL to club record
    await supabase
      .from('clubs')
      .update({ logo_url: logoUrl })
      .eq('id', req.club.clubId);

    return res.json({ url: logoUrl });

  } catch (err) {
    console.error('Logo upload error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

module.exports = router;
