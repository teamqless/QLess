// ============================================================
// src/lib/socket.js
// WebSocket manager using Socket.IO
// Volunteers join a room per event. Scans broadcast live.
// ============================================================

let _io = null

/**
 * Initialise Socket.IO on the HTTP server.
 * Call once from index.js after server.listen()
 */
const init = (httpServer) => {
  const { Server } = require('socket.io')

  _io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        /\.vercel\.app$/,
        'http://localhost:5173',
        'http://localhost:3000',
      ],
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  _io.on('connection', (socket) => {
    // Volunteer / admin joins an event room to get live scan updates
    socket.on('join_event', ({ eventId, token }) => {
      if (!eventId) return
      // Basic token check — just verify it's a valid JWT format
      try {
        const jwt = require('jsonwebtoken')
        jwt.verify(token, process.env.JWT_SECRET)
        socket.join(`event:${eventId}`)
        socket.emit('joined', { eventId, room: `event:${eventId}` })
      } catch {
        socket.emit('error', { message: 'Invalid token' })
      }
    })

    socket.on('leave_event', ({ eventId }) => {
      socket.leave(`event:${eventId}`)
    })

    socket.on('disconnect', () => {})
  })

  console.log('🔌 WebSocket server initialised')
  return _io
}

/**
 * Broadcast a scan result to everyone watching this event.
 * Called from scanner route after every scan attempt.
 */
const broadcastScan = (eventId, payload) => {
  if (!_io) return
  _io.to(`event:${eventId}`).emit('scan_result', payload)
}

/**
 * Broadcast updated live stats to everyone watching this event.
 */
const broadcastStats = (eventId, stats) => {
  if (!_io) return
  _io.to(`event:${eventId}`).emit('live_stats', stats)
}

/**
 * Broadcast a new registration to the club admin watching the event.
 */
const broadcastNewRegistration = (eventId, registration) => {
  if (!_io) return
  _io.to(`event:${eventId}`).emit('new_registration', registration)
}

module.exports = { init, broadcastScan, broadcastStats, broadcastNewRegistration }
