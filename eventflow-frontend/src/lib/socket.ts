// ============================================================
// lib/socket.ts — Socket.IO client
// ============================================================
import { io, Socket } from 'socket.io-client'
import { getToken } from './auth'

// FIX: getVolunteerToken lives in useScanner, not auth.
// Read directly from localStorage here to avoid circular imports.
const getVolunteerToken = () =>
  localStorage.getItem('eventflow_volunteer_token')

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
