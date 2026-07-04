require('dotenv').config()
const express   = require('express')
const http      = require('http')
const cors      = require('cors')
const helmet    = require('helmet')
const rateLimit = require('express-rate-limit')
const supabase  = require('./lib/supabase')
const socketLib = require('./lib/socket')

const app    = express()
const server = http.createServer(app)

app.use(helmet())
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', /\.vercel\.app$/, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const globalLimiter = rateLimit({ windowMs: 15*60*1000, max: 300, message: { error: 'Too many requests' } })
const authLimiter   = rateLimit({ windowMs: 15*60*1000, max: 20,  message: { error: 'Too many login attempts' } })
const scanLimiter   = rateLimit({ windowMs: 1*60*1000,  max: 120, message: { error: 'Scan rate limit exceeded' } })

app.use(globalLimiter)

app.use('/auth',          authLimiter, require('./routes/auth'))
app.use('/admin',                      require('./routes/admin'))
app.use('/events',                     require('./routes/events'))
app.use('/registrations',              require('./routes/registrations'))
app.use('/scanner',       scanLimiter, require('./routes/scanner'))
app.use('/upload',                     require('./routes/upload'))
app.use('/dashboard',                  require('./routes/dashboard'))
app.use('/billing',                    require('./routes/billing'))
app.use('/sheets',                     require('./routes/sheets'))

app.get('/health', async (req, res) => {
  try {
    const { error } = await supabase.from('clubs').select('id').limit(1)
    return res.json({ status: 'ok', db: error ? 'error' : 'connected', ws: 'enabled', version: '3.0.0', service: 'EventFlow API' })
  } catch { return res.status(500).json({ status: 'error' }) }
})

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }))
app.use((err, req, res, next) => { console.error('Unhandled:', err); res.status(500).json({ error: 'Something went wrong' }) })

const ensureStorageBucket = async () => {
  const BUCKET = 'eventflow-uploads'
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.some(b => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true, fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/jpeg','image/png','image/webp','image/gif','application/pdf'],
    })
    if (error) console.warn('Storage bucket warn:', error.message)
    else console.log('Storage bucket created')
  }
}

const PORT = process.env.PORT || 5000
server.listen(PORT, async () => {
  console.log(`\n🚀 EventFlow API v3.0 on port ${PORT}`)
  socketLib.init(server)
  await ensureStorageBucket()
})

module.exports = { app, server }
