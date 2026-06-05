import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVolunteerLogin } from '@/hooks/useScanner'

export default function ScannerLogin() {
  const navigate        = useNavigate()
  const [params]        = useSearchParams()
  const presetEventId   = params.get('event') || ''
  const login           = useVolunteerLogin()

  const [code, setCode]   = useState('')
  const [eid, setEid]     = useState(presetEventId)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter your access code')
      return
    }

    try {
      const result = await login.mutateAsync({
        access_code: code.trim(),
        event_id:    eid.trim() || '',  // empty string = club-wide
      })

      // If no event_id was provided and the server returned an event, use it
      // Otherwise navigate to a generic scanner
      const targetEventId = eid.trim() || result?.event?.id || ''
      if (targetEventId) {
        navigate(`/scanner/${targetEventId}`)
      } else {
        navigate('/scanner/ready')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid access code. Please try again.')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#080714] flex items-center justify-center font-sans p-5 box-border relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="bg-[#10102a]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-8 w-full max-w-[400px] box-border relative z-10 shadow-2xl">
        
        {/* Icon + Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-indigo-500/20">📷</div>
          <h1 className="text-[22px] font-bold text-[#f0eeff] mb-2 tracking-tight">
            Gate Scanner
          </h1>
          <p className="text-[13px] text-[#5e5a80] leading-relaxed">
            Enter your access code to start scanning
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-[13px] text-red-400 mb-5 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-5">
          
          {/* Access Code */}
          <div>
            <label className="block text-[11px] font-bold text-[#6b6890] mb-2 uppercase tracking-widest">Access Code *</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              required
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="e.g. TECH-V1"
              className="w-full bg-[#1a1a3a] border border-white/10 rounded-xl px-4 py-3.5 text-[#f0eeff] text-[22px] font-mono tracking-[0.2em] font-bold text-center outline-none focus:border-indigo-500/60 focus:bg-[#1a1a3a]/80 transition-all placeholder:text-white/20"
            />
          </div>

          {/* Event ID */}
          {!presetEventId && (
            <div>
              <label className="block text-[11px] font-bold text-[#6b6890] mb-2 uppercase tracking-widest">
                Event ID
                <span className="text-[#3d3a5c] font-normal normal-case tracking-normal ml-1.5">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={eid}
                onChange={e => setEid(e.target.value.trim())}
                placeholder="Paste event ID here if given"
                className="w-full bg-[#1a1a3a] border border-white/10 rounded-xl px-4 py-3 text-[#f0eeff] text-[15px] outline-none focus:border-indigo-500/60 focus:bg-[#1a1a3a]/80 transition-all placeholder:text-white/20"
              />
              <p className="text-[11px] text-[#3d3a5c] mt-2 leading-relaxed">
                The event admin will share this with you. Leave blank for club-wide access.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending || !code.trim()}
            className={`
              mt-2 p-4 text-base font-bold text-white rounded-xl transition-all duration-300
              ${(login.isPending || !code.trim()) ? 'bg-indigo-500/40 cursor-not-allowed opacity-70' : 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer'}
            `}
          >
            {login.isPending ? 'Verifying…' : 'Start Scanning'}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#2a2848] mt-6">
          Contact your event organizer if you don't have an access code
        </p>
      </div>
    </div>
  )
}
