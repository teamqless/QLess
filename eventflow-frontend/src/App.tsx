import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { isAuthenticated, isAdminAuthenticated } from '@/lib/auth'

import AuthLayout      from '@/components/layout/AuthLayout'
import AdminLayout     from '@/components/layout/AdminLayout'

import Landing         from '@/pages/Landing'
import Login           from '@/pages/Login'
import Dashboard       from '@/pages/Dashboard'
import EventList       from '@/pages/EventList'
import EventCreate     from '@/pages/EventCreate'
import EventDetail     from '@/pages/EventDetail'
import Register        from '@/pages/Register'
import RegisterSuccess from '@/pages/RegisterSuccess'
import ScannerLogin    from '@/pages/ScannerLogin'
import Scanner         from '@/pages/Scanner'
import Volunteers      from '@/pages/Volunteers'
import Profile         from '@/pages/Profile'
import SheetImport     from '@/pages/SheetImport'
import NotFound        from '@/pages/NotFound'

import AdminDashboard  from '@/pages/admin/AdminDashboard'
import CreateClub      from '@/pages/admin/CreateClub'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAdminAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'oklch(0.18 0.025 255 / 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid oklch(1 0 0 / 0.1)',
            color: 'oklch(0.98 0.005 240)',
          },
        }}
      />
      <Routes>
        {/* ── Public ────────────────────────────────────── */}
        <Route path="/"                       element={<Landing />} />
        <Route path="/register/:slug"         element={<Register />} />
        <Route path="/register/:slug/success" element={<RegisterSuccess />} />
        <Route path="/scanner/login"          element={<ScannerLogin />} />
        <Route path="/scanner/ready"          element={<Scanner />} />
        <Route path="/scanner/:eventId"       element={<Scanner />} />

        {/* ── Auth ──────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ── Admin Dashboard ───────────────────────────── */}
        <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route path="/admin/dashboard"  element={<AdminDashboard />} />
          <Route path="/admin/create-club" element={<CreateClub />} />
        </Route>

        {/* ── Protected dashboard (now uses AdminLayout internally) */}
        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/events"     element={<ProtectedRoute><EventList /></ProtectedRoute>} />
        <Route path="/events/new" element={<ProtectedRoute><EventCreate /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/volunteers" element={<ProtectedRoute><Volunteers /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/import"     element={<ProtectedRoute><SheetImport /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
