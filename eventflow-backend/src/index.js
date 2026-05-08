require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const supabase = require('./lib/supabase');

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────────

app.use(helmet());

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    /\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate limiting ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later' },
});

const scanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,                    // 60 scans per minute per IP
  message: { error: 'Scan rate limit exceeded' },
});

app.use(globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/auth',           authLimiter,  require('./routes/auth'));
app.use('/events',                       require('./routes/events'));
app.use('/registrations',               require('./routes/registrations'));
app.use('/scanner',        scanLimiter,  require('./routes/scanner'));
app.use('/upload',                       require('./routes/upload'));
app.use('/dashboard',                   require('./routes/dashboard'));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', async (req, res) => {
  try {
    // Quick DB connectivity check
    const { error } = await supabase.from('clubs').select('id').limit(1);
    return res.json({
      status:   'ok',
      db:       error ? 'error' : 'connected',
      version:  '1.0.0',
      service:  'EventFlow API',
    });
  } catch (e) {
    return res.status(500).json({ status: 'error', db: 'unreachable' });
  }
});

// ─── 404 handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// ─── Ensure Supabase storage bucket exists on startup ─────────────────────────

const ensureStorageBucket = async () => {
  const BUCKET = 'eventflow-uploads';
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5242880,   // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    });
    if (error) {
      console.warn('Could not create storage bucket:', error.message);
    } else {
      console.log(`Storage bucket "${BUCKET}" created`);
    }
  }
};

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n🚀 EventFlow API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Env:    ${process.env.NODE_ENV || 'development'}\n`);
  await ensureStorageBucket();
});

module.exports = app;