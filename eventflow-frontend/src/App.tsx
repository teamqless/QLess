// ============================================================
// App.tsx — Root Router
// PHASE 2: Add route components as they are built
// ============================================================
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Pages — add imports here as you build each phase
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Dashboard from '@/pages/Dashboard'
import EventList from '@/pages/EventList'
import EventCreate from '@/pages/EventCreate'
import EventDetail from '@/pages/EventDetail'
import Register from '@/pages/Register'
import RegisterSuccess from '@/pages/RegisterSuccess'
import ScannerLogin from '@/pages/ScannerLogin'
import Scanner from '@/pages/Scanner'
import NotFound from '@/pages/NotFound'

// Auth guard — replace with real hook in Phase 2
const isAuthenticated = () => !!localStorage.getItem('eventflow_token')

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/register/:slug" element={<Register />} />
      <Route path="/register/:slug/success" element={<RegisterSuccess />} />
      <Route path="/scanner/login" element={<ScannerLogin />} />
      <Route path="/scanner/:eventId" element={<Scanner />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Protected club admin routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/new" element={<EventCreate />} />
        <Route path="/events/:id" element={<EventDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
