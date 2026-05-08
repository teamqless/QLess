// ============================================================
// pages/NotFound.tsx — 404 page
// ============================================================
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm font-medium">← Go home</Link>
      </div>
    </div>
  )
}
