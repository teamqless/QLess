import { useState } from 'react'
import { useEvents } from '@/hooks/useEvents'
import api from '@/lib/api'

type Step = 'url' | 'map' | 'import' | 'done'

interface PreviewData {
  headers:      string[]
  preview_rows: string[][]
  total_rows:   number
  csv_url:      string
}

interface ImportResult {
  message: string
  results: { imported: number; skipped: number; failed: number; errors: string[] }
}

export default function SheetImport() {
  const { data: events } = useEvents('published')

  const [step, setStep]           = useState<Step>('url')
  const [sheetUrl, setSheetUrl]   = useState('')
  const [eventId, setEventId]     = useState('')
  const [preview, setPreview]     = useState<PreviewData | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [sendQr, setSendQr]       = useState(true)
  const [result, setResult]       = useState<ImportResult | null>(null)

  // Column mapping — which sheet column maps to which field
  const [colMap, setColMap] = useState<Record<string, string>>({
    name:  '',
    email: '',
  })

  const fetchPreview = async () => {
    if (!sheetUrl.trim()) { setError('Enter a Google Sheets URL'); return }
    if (!eventId)         { setError('Select an event'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/sheets/preview', { sheet_url: sheetUrl })
      setPreview(data)
      // Auto-detect common column names
      const headers = data.headers.map((h: string) => h.toLowerCase())
      const nameGuess  = data.headers.find((_: string, i: number) =>
        headers[i].includes('name') && !headers[i].includes('email'))
      const emailGuess = data.headers.find((_: string, i: number) =>
        headers[i].includes('email') || headers[i].includes('mail'))
      setColMap(p => ({
        ...p,
        name:  nameGuess  || p.name  || '',
        email: emailGuess || p.email || '',
      }))
      setStep('map')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch sheet')
    } finally { setLoading(false) }
  }

  const runImport = async () => {
    if (!colMap.email) { setError('You must map the Email column'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/sheets/import', {
        sheet_url:  sheetUrl,
        event_id:   eventId,
        column_map: colMap,
        send_qr:    sendQr,
      })
      setResult(data)
      setStep('done')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed')
    } finally { setLoading(false) }
  }

  const reset = () => {
    setStep('url'); setSheetUrl(''); setEventId(''); setPreview(null)
    setResult(null); setError(''); setColMap({ name: '', email: '' })
  }

  const STEP_LABELS = ['Enter sheet URL', 'Map columns', 'Import & send']
  const stepIdx = ['url','map','import','done'].indexOf(step)

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Import from Google Sheets</h1>
          <p className="page-subtitle">Import attendees from a Google Form response sheet and send QR codes automatically</p>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#1e40af', lineHeight: 1.7 }}>
        <strong>How this works:</strong>
        <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
          <li>Your club collects registrations via Google Forms (responses go to a Google Sheet)</li>
          <li>Make the sheet public: <strong>Share → Anyone with the link → Viewer</strong></li>
          <li>Paste the sheet URL here, map columns, and we import all attendees</li>
          <li>Each attendee gets an approved registration + QR code emailed to them</li>
          <li>Use <strong>"Sync"</strong> later to add only new rows without duplicating</li>
        </ol>
      </div>

      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {STEP_LABELS.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: stepIdx > i ? 'var(--success)' : stepIdx === i ? 'var(--brand)' : 'var(--surface-3)',
                color: stepIdx >= i ? 'white' : 'var(--text-3)',
              }}>
                {stepIdx > i ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: stepIdx === i ? 600 : 400, color: stepIdx === i ? 'var(--text-1)' : 'var(--text-3)' }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: stepIdx > i ? 'var(--success)' : 'var(--border)', margin: '0 12px' }} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid #fca5a5', borderRadius: 10, padding: '11px 16px', fontSize: 13, color: 'var(--danger)', marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Step 1: URL + Event ── */}
      {step === 'url' && (
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text-1)' }}>
            Enter your Google Sheet URL
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Google Sheet URL *</label>
              <input className="input" type="url" value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                autoFocus />
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.5 }}>
                Make sure the sheet is set to "Anyone with the link can view" in Google Sheets sharing settings.
              </p>
            </div>

            <div>
              <label className="label">Select Event *</label>
              <select className="input" value={eventId} onChange={e => setEventId(e.target.value)}>
                <option value="">Choose which event these attendees belong to</option>
                {events?.map((event: any) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
              {events?.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 6 }}>
                  No published events found. Publish an event first.
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button onClick={fetchPreview} disabled={loading || !sheetUrl || !eventId}
              className="btn btn-primary">
              {loading ? 'Fetching sheet…' : 'Fetch sheet & preview →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Column mapping ── */}
      {step === 'map' && preview && (
        <div>
          {/* Sheet preview */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>
                Sheet preview
              </h2>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{preview.total_rows} rows found</span>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>{preview.headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.preview_rows.map((row, i) => (
                    <tr key={i}>{row.map((cell, j) => <td key={j} style={{ fontSize: 12, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column mapping */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'var(--text-1)' }}>Map your columns</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.5 }}>
              Tell us which columns contain the attendee name and email. These are used to send QR passes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label">
                  Email column * <span style={{ color: 'var(--danger)' }}>required</span>
                </label>
                <select className="input" value={colMap.email}
                  onChange={e => setColMap(p => ({ ...p, email: e.target.value }))}>
                  <option value="">Select email column</option>
                  {preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
                  QR passes are sent to this email address
                </p>
              </div>
              <div>
                <label className="label">Name column</label>
                <select className="input" value={colMap.name}
                  onChange={e => setColMap(p => ({ ...p, name: e.target.value }))}>
                  <option value="">Select name column (optional)</option>
                  {preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
                  Used to personalise the QR email
                </p>
              </div>
            </div>

            {/* Additional columns */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 10 }}>
                Other columns to store (optional)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {preview.headers
                  .filter(h => h !== colMap.email && h !== colMap.name)
                  .map(h => {
                    const key = h.toLowerCase().replace(/[^a-z0-9]/g, '_')
                    return (
                      <label key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)', cursor: 'pointer', padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 7 }}>
                        <input type="checkbox"
                          checked={!!colMap[key]}
                          onChange={e => setColMap(p => e.target.checked
                            ? { ...p, [key]: h }
                            : Object.fromEntries(Object.entries(p).filter(([k]) => k !== key))
                          )}
                          style={{ accentColor: 'var(--brand)' }}
                        />
                        {h}
                      </label>
                    )
                  })
                }
              </div>
            </div>
          </div>

          {/* QR send option */}
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={sendQr} onChange={e => setSendQr(e.target.checked)}
                style={{ accentColor: 'var(--brand)', width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>
                  Send QR codes immediately after import
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Each imported attendee will receive their QR entry pass via email right away.
                  If unchecked, registrations are created as approved but QR emails are not sent —
                  you can send them later from the event's registrations page.
                </div>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep('url')} className="btn btn-ghost">← Back</button>
            <button
              onClick={runImport}
              disabled={loading || !colMap.email}
              className="btn btn-primary">
              {loading
                ? `Importing ${preview.total_rows} rows…`
                : `Import ${preview.total_rows} attendees →`}
            </button>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {step === 'done' && result && (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Import complete</h2>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 28 }}>{result.message}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
            <div style={{ background: 'var(--success-bg)', border: '1px solid #86efac', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{result.results.imported}</div>
              <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>Imported</div>
            </div>
            <div style={{ background: 'var(--warning-bg)', border: '1px solid #fde68a', borderRadius: 10, padding: '16px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>{result.results.skipped}</div>
              <div style={{ fontSize: 12, color: 'var(--warning)', marginTop: 4 }}>Skipped (duplicates)</div>
            </div>
            <div style={{ background: result.results.failed > 0 ? 'var(--danger-bg)' : 'var(--surface-2)', border: `1px solid ${result.results.failed > 0 ? '#fca5a5' : 'var(--border)'}`, borderRadius: 10, padding: '16px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: result.results.failed > 0 ? 'var(--danger)' : 'var(--text-3)' }}>{result.results.failed}</div>
              <div style={{ fontSize: 12, color: result.results.failed > 0 ? 'var(--danger)' : 'var(--text-3)', marginTop: 4 }}>Failed</div>
            </div>
          </div>

          {result.results.errors.length > 0 && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 16px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>Errors:</div>
              {result.results.errors.slice(0, 5).map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 4 }}>• {e}</div>
              ))}
              {result.results.errors.length > 5 && (
                <div style={{ fontSize: 12, color: 'var(--danger)' }}>...and {result.results.errors.length - 5} more</div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={reset} className="btn btn-ghost">Import another sheet</button>
            <a href={`/events/${eventId}`} className="btn btn-primary">View event registrations →</a>
          </div>
        </div>
      )}
    </div>
  )
}
