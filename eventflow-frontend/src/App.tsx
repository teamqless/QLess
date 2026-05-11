import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'

import DashboardLayout  from '@/components/layout/DashboardLayout'
import AuthLayout       from '@/components/layout/AuthLayout'

import Landing          from '@/pages/Landing'
import Login            from '@/pages/Login'
import Signup           from '@/pages/Signup'
import Pricing          from '@/pages/Pricing'
import Dashboard        from '@/pages/Dashboard'
import EventList        from '@/pages/EventList'
import EventCreate      from '@/pages/EventCreate'
import EventDetail      from '@/pages/EventDetail'
import Register         from '@/pages/Register'
import RegisterSuccess  from '@/pages/RegisterSuccess'
import ScannerLogin     from '@/pages/ScannerLogin'
import Scanner          from '@/pages/Scanner'
import Volunteers       from '@/pages/Volunteers'
import Settings         from '@/pages/Settings'
import NotFound         from '@/pages/NotFound'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────── */}
      <Route path="/"                       element={<Landing />} />
      <Route path="/pricing"                element={<Pricing />} />
      <Route path="/register/:slug"         element={<Register />} />
      <Route path="/register/:slug/success" element={<RegisterSuccess />} />
      <Route path="/scanner/login"          element={<ScannerLogin />} />
      <Route path="/scanner/:eventId"       element={<Scanner />} />

      {/* ── Auth ───────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* ── Protected dashboard ────────────────────── */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/events"     element={<EventList />} />
        <Route path="/events/new" element={<EventCreate />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/settings"   element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
