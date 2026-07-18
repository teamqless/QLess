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
    <div className="max-w-[720px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight text-ink">Import from Google Sheets</h1>
        <p className="text-ink-soft mt-1">Import attendees from a Google Form response sheet and send QR codes automatically</p>
      </div>

      {/* How it works */}
      <div className="bg-teal-soft border border-teal/20 rounded-xl px-5 py-4 mb-6 text-sm text-teal-deep leading-relaxed">
        <strong>How this works:</strong>
        <ol className="list-decimal ml-4 mt-2 p-0 space-y-1">
          <li>Your club collects registrations via Google Forms (responses go to a Google Sheet)</li>
          <li>Make the sheet public: <strong>Share → Anyone with the link → Viewer</strong></li>
          <li>Paste the sheet URL here, map columns, and we import all attendees</li>
          <li>Each attendee gets an approved registration + QR code emailed to them</li>
          <li>Use <strong>"Sync"</strong> later to add only new rows without duplicating</li>
        </ol>
      </div>

      {/* Step progress */}
      <div className="flex items-center mb-7">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`flex items-center ${i < STEP_LABELS.length - 1 ? 'flex-1' : 'flex-none'}`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0
                ${stepIdx > i ? 'bg-teal text-paper' : stepIdx === i ? 'bg-amber-deep text-paper' : 'bg-paper-dim border border-line-soft text-ink-soft'}`}>
                {stepIdx > i ? '✓' : i + 1}
              </div>
              <span className={`text-[13px] ${stepIdx === i ? 'font-semibold text-ink' : 'font-normal text-ink-soft'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-[1px] mx-3 ${stepIdx > i ? 'bg-teal' : 'bg-line-soft'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-rust-soft border border-rust/20 rounded-xl px-4 py-3 text-[13px] text-rust mb-5 font-medium flex items-center gap-2">
          <span className="text-lg">⚠</span> {error}
        </div>
      )}

      {/* ── Step 1: URL + Event ── */}
      {step === 'url' && (
        <div className="vc-card p-7">
          <h2 className="text-base font-semibold mb-5 text-ink">
            Enter your Google Sheet URL
          </h2>

          <div className="flex flex-col gap-5">
            <div>
              <label className="section-label block mb-2">Google Sheet URL *</label>
              <input className="input" type="url" value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                autoFocus />
              <p className="text-xs text-ink-soft mt-1.5 leading-relaxed">
                Make sure the sheet is set to "Anyone with the link can view" in Google Sheets sharing settings.
              </p>
            </div>

            <div>
              <label className="section-label block mb-2">Select Event *</label>
              <select className="input" value={eventId} onChange={e => setEventId(e.target.value)}>
                <option value="">Choose which event these attendees belong to</option>
                {events?.map((event: any) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
              {events?.length === 0 && (
                <p className="text-xs text-rust mt-1.5 font-medium">
                  No published events found. Publish an event first.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={fetchPreview} disabled={loading || !sheetUrl || !eventId}
              className={`inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 text-sm px-4.5 py-2.5 ${loading || !sheetUrl || !eventId ? 'bg-ink-soft text-paper cursor-not-allowed opacity-70' : 'bg-ink text-paper hover:bg-ink-soft cursor-pointer shadow-sm'}`}>
              {loading ? 'Fetching sheet…' : 'Fetch sheet & preview →'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Column mapping ── */}
      {step === 'map' && preview && (
        <div>
          {/* Sheet preview */}
          <div className="vc-card p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-ink m-0">
                Sheet preview
              </h2>
              <span className="text-xs font-medium text-ink-soft bg-paper-dim border border-line-soft px-2.5 py-1 rounded-md">{preview.total_rows} rows found</span>
            </div>
            <div className="overflow-x-auto border border-line rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-paper-dim border-b border-line">
                  <tr className="text-xs font-semibold text-ink-soft uppercase tracking-wider">{preview.headers.map(h => <th className="px-4 py-2 font-medium" key={h}>{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {preview.preview_rows.map((row, i) => (
                    <tr key={i} className="hover:bg-paper-dim transition-colors duration-150">{row.map((cell, j) => <td className="px-4 py-2 text-xs text-ink max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" key={j}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column mapping */}
          <div className="vc-card p-6 mb-5">
            <h2 className="text-base font-semibold mb-1.5 text-ink">Map your columns</h2>
            <p className="text-[13px] text-ink-soft mb-5 leading-relaxed">
              Tell us which columns contain the attendee name and email. These are used to send QR passes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="section-label block mb-2">
                  Email column * <span className="text-rust ml-1 font-normal normal-case">required</span>
                </label>
                <select className="input" value={colMap.email}
                  onChange={e => setColMap(p => ({ ...p, email: e.target.value }))}>
                  <option value="">Select email column</option>
                  {preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <p className="text-[11px] text-ink-faint mt-1.5 font-medium">
                  QR passes are sent to this email address
                </p>
              </div>
              <div>
                <label className="section-label block mb-2">Name column</label>
                <select className="input" value={colMap.name}
                  onChange={e => setColMap(p => ({ ...p, name: e.target.value }))}>
                  <option value="">Select name column (optional)</option>
                  {preview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <p className="text-[11px] text-ink-faint mt-1.5 font-medium">
                  Used to personalise the QR email
                </p>
              </div>
            </div>

            {/* Additional columns */}
            <div className="mt-5 pt-5 border-t border-line-soft">
              <div className="text-[13px] font-semibold text-ink mb-2.5">
                Other columns to store (optional)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {preview.headers
                  .filter(h => h !== colMap.email && h !== colMap.name)
                  .map(h => {
                    const key = h.toLowerCase().replace(/[^a-z0-9]/g, '_')
                    return (
                      <label key={h} className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer px-3 py-2 bg-paper-dim hover:bg-paper border border-transparent hover:border-line-soft rounded-lg transition-all duration-150">
                        <input type="checkbox"
                          checked={!!colMap[key]}
                          onChange={e => setColMap(p => e.target.checked
                            ? { ...p, [key]: h }
                            : Object.fromEntries(Object.entries(p).filter(([k]) => k !== key))
                          )}
                          className="w-4 h-4 rounded border-line-soft text-amber focus:ring-amber/50 bg-paper transition-all"
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
          <div className="vc-card p-5 mb-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={sendQr} onChange={e => setSendQr(e.target.checked)}
                className="w-4 h-4 rounded border-line-soft text-amber focus:ring-amber/50 bg-paper transition-all mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-ink mb-1">
                  Send QR codes immediately after import
                </div>
                <div className="text-[13px] text-ink-soft leading-relaxed">
                  Each imported attendee will receive their QR entry pass via email right away.
                  If unchecked, registrations are created as approved but QR emails are not sent —
                  you can send them later from the event's registrations page.
                </div>
              </div>
            </label>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep('url')} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5">← Back</button>
            <button
              onClick={runImport}
              disabled={loading || !colMap.email}
              className={`inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 text-sm px-4.5 py-2.5 ${loading || !colMap.email ? 'bg-ink-soft text-paper cursor-not-allowed opacity-70' : 'bg-ink text-paper hover:bg-ink-soft shadow-sm'}`}>
              {loading
                ? `Importing ${preview.total_rows} rows…`
                : `Import ${preview.total_rows} attendees →`}
            </button>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {step === 'done' && result && (
        <div className="vc-card p-9 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-[22px] font-bold text-ink mb-2">Import complete</h2>
          <p className="text-sm text-ink-soft mb-7">{result.message}</p>

          <div className="grid grid-cols-3 gap-3.5 mb-7">
            <div className="bg-teal-soft border border-teal/20 rounded-xl p-4">
              <div className="text-[28px] font-black text-teal-deep leading-tight">{result.results.imported}</div>
              <div className="text-xs font-semibold text-teal-deep mt-1">Imported</div>
            </div>
            <div className="bg-amber-soft/50 border border-amber/20 rounded-xl p-4">
              <div className="text-[28px] font-black text-amber-deep leading-tight">{result.results.skipped}</div>
              <div className="text-xs font-semibold text-amber-deep mt-1">Skipped (duplicates)</div>
            </div>
            <div className={`border rounded-xl p-4 ${result.results.failed > 0 ? 'bg-rust-soft border-rust/20 text-rust' : 'bg-paper-dim border-line-soft text-ink-soft'}`}>
              <div className={`text-[28px] font-black leading-tight ${result.results.failed > 0 ? 'text-rust' : 'text-ink-soft'}`}>{result.results.failed}</div>
              <div className={`text-xs font-semibold mt-1 ${result.results.failed > 0 ? 'text-rust' : 'text-ink-soft'}`}>Failed</div>
            </div>
          </div>

          {result.results.errors.length > 0 && (
            <div className="bg-rust-soft border border-rust/20 rounded-xl px-4 py-3.5 mb-6 text-left">
              <div className="text-[13px] font-semibold text-rust mb-2">Errors:</div>
              {result.results.errors.slice(0, 5).map((e, i) => (
                <div key={i} className="text-xs text-rust mb-1">• {e}</div>
              ))}
              {result.results.errors.length > 5 && (
                <div className="text-xs text-rust font-medium mt-1">...and {result.results.errors.length - 5} more</div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-paper text-ink border border-line hover:bg-paper-dim shadow-sm text-sm px-4.5 py-2.5">Import another sheet</button>
            <a href={`/events/${eventId}`} className="inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 ease-out active:scale-95 bg-ink text-paper hover:bg-ink-soft shadow-sm text-sm px-4.5 py-2.5">View event registrations →</a>
          </div>
        </div>
      )}
    </div>
  )
}
