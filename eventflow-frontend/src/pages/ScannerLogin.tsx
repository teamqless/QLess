// ============================================================
// pages/ScannerLogin.tsx — PHASE 4
// Volunteer login at /scanner/login?event=<eventId>
// ============================================================

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVolunteerLogin } from '@/hooks/useScanner'

export default function ScannerLogin() {
  const navigate          = useNavigate()
  const [params]          = useSearchParams()
  const eventId           = params.get('event') || ''
  const login             = useVolunteerLogin()

  const [accessCode, setAccessCode] = useState('')
  const [manualEventId, setManualEventId] = useState(eventId)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ access_code: accessCode, event_id: manualEventId })
      navigate(`/scanner/${manualEventId}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid access code')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📷</span>
          </div>
          <h1 className="text-xl font-bold text-white">Volunteer Scanner</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your access code to begin scanning</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!eventId && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Event ID</label>
              <input
                type="text"
                value={manualEventId}
                onChange={e => setManualEventId(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Paste event ID here"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Access Code</label>
            <input
              type="text"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value.toUpperCase())}
              required
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm tracking-widest font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. TECH24-V1"
            />
          </div>
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {login.isPending ? 'Verifying...' : 'Start Scanning'}
          </button>
        </form>
      </div>
    </div>
  )
}
