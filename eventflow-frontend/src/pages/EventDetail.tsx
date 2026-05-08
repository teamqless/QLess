// ============================================================
// pages/EventDetail.tsx — PHASE 2 + 3
// Event management page at /events/:id
// ============================================================
// Sections:
// - Event header (title, status, publish toggle, edit button)
// - Stats bar (total, approved, pending, scanned)
// - Registration link (copy to clipboard)
// - Registrations table with approve/reject/resend-QR actions
// - Volunteer management section (create volunteers, show access codes)
// - Export CSV button
// - Live entry counter (links to scanner view)

import { useParams, Link } from 'react-router-dom'
import { useEvent, usePublishEvent } from '@/hooks/useEvents'
import { useRegistrations, useApproveRegistration, useRejectRegistration } from '@/hooks/useRegistrations'
import { exportCSV } from '@/hooks/useDashboard'

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading }     = useEvent(id!)
  const publishEvent            = usePublishEvent(id!)
  const { data: registrations } = useRegistrations(id!)
  const approve                 = useApproveRegistration(id!)
  const reject                  = useRejectRegistration(id!)

  if (isLoading) return <div className="p-8 text-gray-500">Loading event...</div>
  if (!data)     return <div className="p-8 text-red-500">Event not found</div>

  const { event, stats } = data
  const registrationUrl  = `${window.location.origin}/register/${event.slug}`

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium
              ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                event.status === 'draft'     ? 'bg-gray-100 text-gray-600' :
                'bg-amber-100 text-amber-700'}`}>
              {event.status}
            </span>
          </div>
          <p className="text-sm text-gray-400">{event.venue} • {event.entry_fee === 0 ? 'Free' : `₹${event.entry_fee}`}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => publishEvent.mutate()}
            disabled={publishEvent.isPending}
            className={`px-4 py-2 rounded-lg text-sm font-medium
              ${event.status === 'published'
                ? 'border border-gray-300 hover:bg-gray-50'
                : 'bg-green-600 text-white hover:bg-green-700'}`}>
            {event.status === 'published' ? 'Unpublish' : 'Publish Event'}
          </button>
          <button onClick={() => exportCSV(event.id, event.title)}
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',    value: stats.total },
          { label: 'Approved', value: stats.approved,                   color: 'text-green-600' },
          { label: 'Pending',  value: stats.pending,                    color: stats.pending > 0 ? 'text-amber-600' : '' },
          { label: 'Scanned',  value: `${stats.scanned}/${stats.approved}` },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-xl p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color || 'text-gray-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Registration link */}
      {event.status === 'published' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-indigo-700 mb-1">Registration Link</p>
            <p className="text-sm text-indigo-600 font-mono">{registrationUrl}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(registrationUrl)}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
            Copy Link
          </button>
        </div>
      )}

      {/* Scanner link */}
      <div className="mb-6">
        <Link to={`/scanner/login?event=${event.id}`}
          className="text-sm text-indigo-600 hover:underline">
          → Open Scanner for this event
        </Link>
      </div>

      {/* Registrations table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Registrations</h2>
          {/* Phase 3: Add search + status filter here */}
        </div>

        {!registrations || registrations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No registrations yet. Share the registration link to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Attendee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Payment</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">QR</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.map(reg => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{reg.attendee_name}</p>
                    <p className="text-xs text-gray-400">{reg.attendee_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                      ${reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                        reg.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {reg.payment_screenshot_url ? (
                      <a href={reg.payment_screenshot_url} target="_blank" rel="noreferrer"
                        className="text-indigo-600 hover:underline text-xs">View screenshot</a>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {event.entry_fee === 0 ? 'Free' : 'No screenshot'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {reg.qr_codes?.[0]?.scanned_at ? (
                      <span className="text-xs text-green-600 font-medium">✓ Scanned</span>
                    ) : reg.qr_codes?.[0]?.email_sent ? (
                      <span className="text-xs text-blue-600">Email sent</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {reg.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approve.mutate(reg.id)}
                            disabled={approve.isPending}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                            Approve
                          </button>
                          <button
                            onClick={() => reject.mutate({ id: reg.id })}
                            disabled={reject.isPending}
                            className="text-xs border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
