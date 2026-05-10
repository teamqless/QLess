// ============================================================
// lib/socket.ts — Socket.IO client
// Manages WebSocket connection to the backend.
// Components subscribe to events using useSocket hook.
// ============================================================
import { io, Socket } from 'socket.io-client'
import { getToken, getVolunteerToken } from './auth'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return socket
}

export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect()
}

/**
 * Join an event room to receive real-time scan + registration events.
 * Uses club token for admin view, volunteer token for scanner view.
 */
export const joinEventRoom = (eventId: string, useVolunteer = false) => {
  const s = connectSocket()
  const token = useVolunteer ? getVolunteerToken() : getToken()
  if (token) {
    s.emit('join_event', { eventId, token })
  }
  return s
}

export const leaveEventRoom = (eventId: string) => {
  if (socket?.connected) {
    socket.emit('leave_event', { eventId })
  }
}
