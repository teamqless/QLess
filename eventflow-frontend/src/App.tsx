import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated, isAdminAuthenticated } from '@/lib/auth'

import DashboardLayout  from '@/components/layout/DashboardLayout'
import AuthLayout       from '@/components/layout/AuthLayout'
import AdminLayout      from '@/components/layout/AdminLayout'

import Landing          from '@/pages/Landing'
import Login            from '@/pages/Login'
import Dashboard        from '@/pages/Dashboard'
import EventList        from '@/pages/EventList'
import EventCreate      from '@/pages/EventCreate'
import EventDetail      from '@/pages/EventDetail'
import Register         from '@/pages/Register'
import RegisterSuccess  from '@/pages/RegisterSuccess'
import ScannerLogin     from '@/pages/ScannerLogin'
import Scanner          from '@/pages/Scanner'
import Volunteers       from '@/pages/Volunteers'
import Profile          from '@/pages/Profile'
import SheetImport      from '@/pages/SheetImport'
import NotFound         from '@/pages/NotFound'

import AdminDashboard   from '@/pages/admin/AdminDashboard'
import CreateClub       from '@/pages/admin/CreateClub'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAdminAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ────────────────────────────────────── */}
      <Route path="/"                       element={<Landing />} />
      <Route path="/register/:slug"         element={<Register />} />
      <Route path="/register/:slug/success" element={<RegisterSuccess />} />
      <Route path="/scanner/login"          element={<ScannerLogin />} />

      {/* Scanner with optional eventId — /scanner/ready for club-wide volunteers */}
      <Route path="/scanner/ready"          element={<Scanner />} />
      <Route path="/scanner/:eventId"       element={<Scanner />} />

      {/* ── Auth ──────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"  element={<Login />} />
      </Route>

      {/* ── Admin Auth & Dashboard ────────────────────── */}
      <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-club" element={<CreateClub />} />
      </Route>

      {/* ── Protected dashboard ───────────────────────── */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/events"     element={<EventList />} />
        <Route path="/events/new" element={<EventCreate />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/profile"    element={<Profile />} />
        <Route path="/import"     element={<SheetImport />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
