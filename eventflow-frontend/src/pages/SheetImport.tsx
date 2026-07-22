import { useState, useEffect } from 'react'
import { useEvents } from '@/hooks/useEvents'
import { Link, useSearchParams } from 'react-router-dom'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLayout } from '@/components/qless/AdminLayout'
import { MagneticButton } from '@/components/qless/MagneticButton'
import { FileSpreadsheet, Database, Columns, Info, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Table as TableIcon, Mail, User, ShieldCheck, ChevronLeft } from 'lucide-react'

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
  const [searchParams] = useSearchParams()
  const initialEventId = searchParams.get('event') || ''

  const [step, setStep]           = useState<Step>('url')
  const [sheetUrl, setSheetUrl]   = useState('')
  const [eventId, setEventId]     = useState(initialEventId)
  const [preview, setPreview]     = useState<PreviewData | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [sendQr, setSendQr]       = useState(true)
  const [result, setResult]       = useState<ImportResult | null>(null)

  // Wait for events to load if we have an initialEventId but eventId isn't set
  useEffect(() => {
    if (initialEventId && events && !eventId) {
      setEventId(initialEventId)
    }
  }, [initialEventId, events, eventId])

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
    setStep('url'); setSheetUrl(''); setPreview(null)
    setResult(null); setError(''); setColMap({ name: '', email: '' })
  }

  const STEP_LABELS = ['Enter sheet URL', 'Map columns', 'Import & send']
  const stepIdx = ['url','map','import','done'].indexOf(step)

  return (
    <AdminLayout title="Import Data">
      <div className="max-w-4xl mx-auto pb-12 pt-4 animate-fade-in-up">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="mb-6">
          <Link 
            to="/events" 
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all duration-300 group hover:scale-105 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" /> Back to Events
          </Link>
        </div>
        <h1 className="font-display font-bold text-4xl tracking-tight text-foreground flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-green-400" /> Import from Google Sheets
        </h1>
        <p className="text-muted-foreground mt-2">Import attendees from a Google Form response sheet and send QR codes automatically.</p>
      </div>

      {/* How it works */}
      {step === 'url' && (
        <div className="glass rounded-2xl p-6 mb-8 border border-white/5 bg-gradient-to-br from-green-500/10 to-transparent">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-green-400" /> How this works
          </h3>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-muted-foreground">
            <li>Your club collects registrations via Google Forms (responses go to a Google Sheet)</li>
            <li>Make the sheet public: <strong className="text-foreground">Share → Anyone with the link → Viewer</strong></li>
            <li>Paste the sheet URL here, map columns, and we import all attendees</li>
            <li>Each attendee gets an approved registration + QR code emailed to them</li>
            <li>Use <strong className="text-foreground">"Sync Sheet"</strong> later to add only new rows without duplicating</li>
          </ol>
        </div>
      )}

      {/* Step Progress Bar */}
      <div className="flex items-center mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`flex items-center ${i < STEP_LABELS.length - 1 ? 'flex-1 min-w-[140px]' : 'shrink-0'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors duration-300
                ${stepIdx > i ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : stepIdx === i ? 'bg-green-500 text-white ring-4 ring-green-500/20' : 'bg-white/10 text-muted-foreground'}
              `}>
                {stepIdx > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm whitespace-nowrap transition-colors duration-300 ${stepIdx >= i ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-[2px] mx-4 transition-colors duration-300 rounded-full ${stepIdx > i ? 'bg-green-500/50' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" /> 
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Step 1: URL + Event ── */}
        {step === 'url' && (
          <motion.div
            key="url"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-strong rounded-3xl p-6 md:p-8 ring-glow space-y-6"
          >
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Google Sheet URL <span className="text-destructive">*</span></label>
              <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-green-500/50 focus-within:bg-white/10">
                <Database className="w-4 h-4 text-muted-foreground" />
                <input className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" type="url" value={sheetUrl}
                  onChange={e => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  autoFocus />
              </div>
              <p className="text-xs text-muted-foreground mt-2 px-1">
                Make sure the sheet is set to "Anyone with the link can view" in sharing settings.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Select Event <span className="text-destructive">*</span></label>
              <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-green-500/50 focus-within:bg-white/10">
                <select className="flex-1 bg-transparent outline-none text-sm text-foreground w-full cursor-pointer appearance-none" value={eventId} onChange={e => setEventId(e.target.value)}>
                  <option value="" className="bg-background text-muted-foreground">Choose which event these attendees belong to</option>
                  {events?.map((event: any) => (
                    <option key={event.id} value={event.id} className="bg-background text-foreground">{event.title}</option>
                  ))}
                </select>
              </div>
              {events?.length === 0 && (
                <p className="text-xs text-destructive mt-2 px-1 font-medium">
                  No published events found. Publish an event first.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <MagneticButton onClick={fetchPreview} disabled={loading || !sheetUrl || !eventId}>
                {loading ? 'Fetching sheet…' : 'Fetch sheet & preview'} <ArrowRight className="w-4 h-4 ml-2" />
              </MagneticButton>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Column mapping ── */}
        {step === 'map' && preview && (
          <motion.div
            key="map"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Sheet preview */}
            <div className="glass-strong rounded-3xl p-6 md:p-8 ring-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-green-400" /> Sheet Preview
                </h2>
                <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-lg">{preview.total_rows} rows found</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10 scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {preview.headers.map(h => <th className="px-4 py-3 whitespace-nowrap" key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {preview.preview_rows.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors duration-150">
                        {row.map((cell, j) => <td className="px-4 py-3 text-sm text-foreground max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" key={j}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column mapping */}
            <div className="glass-strong rounded-3xl p-6 md:p-8 ring-glow">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
                <Columns className="w-5 h-5 text-primary" /> Map your columns
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Tell us which columns contain the attendee name and email. These are required to send QR entry passes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email column <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <select className="flex-1 bg-transparent outline-none text-sm text-foreground w-full cursor-pointer appearance-none" value={colMap.email} onChange={e => setColMap(p => ({ ...p, email: e.target.value }))}>
                      <option value="" className="bg-background text-muted-foreground">Select email column</option>
                      {preview.headers.map(h => <option key={h} value={h} className="bg-background text-foreground">{h}</option>)}
                    </select>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 px-1">
                    QR passes are sent to this email address
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" /> Name column <span className="opacity-50 lowercase normal-case">(optional)</span>
                  </label>
                  <div className="flex items-center gap-2 glass rounded-xl px-4 h-12 transition-all duration-300 focus-within:ring-1 focus-within:ring-primary/50 focus-within:bg-white/10">
                    <select className="flex-1 bg-transparent outline-none text-sm text-foreground w-full cursor-pointer appearance-none" value={colMap.name} onChange={e => setColMap(p => ({ ...p, name: e.target.value }))}>
                      <option value="" className="bg-background text-muted-foreground">Select name column</option>
                      {preview.headers.map(h => <option key={h} value={h} className="bg-background text-foreground">{h}</option>)}
                    </select>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 px-1">
                    Used to personalise the QR email
                  </p>
                </div>
              </div>

              {/* Additional columns */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="text-sm font-semibold text-foreground mb-4">
                  Other columns to store <span className="text-muted-foreground font-normal">(optional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {preview.headers
                    .filter(h => h !== colMap.email && h !== colMap.name)
                    .map(h => {
                      const key = h.toLowerCase().replace(/[^a-z0-9]/g, '_')
                      return (
                        <label key={h} className="flex items-center gap-3 text-sm text-foreground cursor-pointer px-4 py-3 glass rounded-xl border border-transparent hover:border-white/10 transition-all duration-200">
                          <input type="checkbox"
                            checked={!!colMap[key]}
                            onChange={e => setColMap(p => e.target.checked
                              ? { ...p, [key]: h }
                              : Object.fromEntries(Object.entries(p).filter(([k]) => k !== key))
                            )}
                            className="w-4 h-4 rounded border-white/20 text-primary focus:ring-primary/50 bg-black/50 transition-all"
                          />
                          <span className="truncate">{h}</span>
                        </label>
                      )
                    })
                  }
                </div>
              </div>
            </div>

            {/* QR send option */}
            <div className="glass-strong rounded-3xl p-6 ring-glow">
              <label className="flex items-start gap-4 cursor-pointer group">
                <input type="checkbox" checked={sendQr} onChange={e => setSendQr(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary/50 bg-black/50 transition-all mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Send QR codes immediately after import
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    Each imported attendee will receive their QR entry pass via email right away.
                    If unchecked, registrations are created as approved but QR emails are not sent —
                    you can send them later from the event's registrations page.
                  </div>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
              <button onClick={() => setStep('url')} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 text-foreground text-sm font-medium transition-colors order-2 sm:order-1">
                ← Back
              </button>
              <MagneticButton onClick={runImport} disabled={loading || !colMap.email} className="order-1 sm:order-2">
                {loading
                  ? `Importing ${preview.total_rows} rows…`
                  : `Import ${preview.total_rows} attendees`} <ArrowRight className="w-4 h-4 ml-2" />
              </MagneticButton>
            </div>
          </motion.div>
        )}

        {/* ── Done ── */}
        {step === 'done' && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-8 md:p-12 text-center ring-glow"
          >
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <ShieldCheck className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-3">Import Complete</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">{result.message}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                <div className="text-4xl font-black text-green-400 font-display mb-1">{result.results.imported}</div>
                <div className="text-xs font-semibold text-green-400/80 uppercase tracking-wider">Imported</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                <div className="text-4xl font-black text-amber-400 font-display mb-1">{result.results.skipped}</div>
                <div className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">Skipped (Dupes)</div>
              </div>
              <div className={`border rounded-2xl p-6 ${result.results.failed > 0 ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-white/5 border-white/10 text-muted-foreground'}`}>
                <div className={`text-4xl font-black font-display mb-1 ${result.results.failed > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{result.results.failed}</div>
                <div className={`text-xs font-semibold uppercase tracking-wider ${result.results.failed > 0 ? 'text-destructive/80' : 'text-muted-foreground'}`}>Failed</div>
              </div>
            </div>

            {result.results.errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 mb-8 text-left max-w-2xl mx-auto">
                <div className="text-sm font-bold text-destructive mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Import Errors</div>
                <ul className="space-y-1.5 ml-1">
                  {result.results.errors.slice(0, 5).map((e, i) => (
                    <li key={i} className="text-xs text-destructive/90">• {e}</li>
                  ))}
                  {result.results.errors.length > 5 && (
                    <li className="text-xs font-semibold text-destructive mt-2 pt-2 border-t border-destructive/20">...and {result.results.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={reset} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 text-foreground text-sm font-medium transition-colors">Import another sheet</button>
              <Link to={`/events/${eventId}`} className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2">
                View event dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AdminLayout>
  )
}
