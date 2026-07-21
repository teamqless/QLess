import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { setToken, setStoredClub } from '@/lib/auth'

const STEPS = [
  { label: 'Create account', sub: 'Takes 30 seconds' },
  { label: 'Create your event', sub: 'Set up in minutes' },
  { label: 'Go live', sub: 'Share & collect registrations' },
]

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', college: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [pwStrength, setPwStrength] = useState(0)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (e.target.name === 'password') {
      const pw = e.target.value
      let strength = 0
      if (pw.length >= 8) strength++
      if (/[A-Z]/.test(pw)) strength++
      if (/[0-9]/.test(pw)) strength++
      if (/[^A-Za-z0-9]/.test(pw)) strength++
      setPwStrength(strength)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/signup', form)
      setToken(data.token)
      setStoredClub(data.club)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account')
      setLoading(false)
    }
  }

  const pwColors = ['#e4e3f0', '#ef4444', '#f59e0b', '#6366f1', '#16a34a']
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const inputCls: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: 14,
    border: '1.5px solid #e4e3f0', borderRadius: 10,
    outline: 'none', background: '#fff', color: '#0f0e1a',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .auth-input:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.12) !important; }
        .auth-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,102,241,0.45) !important; }
        .auth-submit:active:not(:disabled) { transform:translateY(0); }
        @media (max-width:768px) {
          .signup-wrap { grid-template-columns: 1fr !important; }
          .signup-brand { display: none !important; }
          .signup-form-side { padding: 32px 24px !important; padding-top: 50px !important; }
        }
      `}</style>

      <div className="signup-wrap" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'100vh', fontFamily:'DM Sans, sans-serif' }}>

        {/* ── Brand panel ── */}
        <div className="signup-brand" style={{ background:'linear-gradient(145deg,#0f0e1a,#1a1040)', display:'flex', flexDirection:'column', padding:'40px 48px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'20%', right:'-5%', width:350, height:350, background:'radial-gradient(circle,rgba(99,102,241,0.2),transparent 70%)', pointerEvents:'none' }} />

          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', zIndex:1 }}>
            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:17, color:'white' }}>E</div>
            <span style={{ fontWeight:700, fontSize:17, color:'#f0eeff', letterSpacing:'-0.3px' }}>QLess</span>
          </Link>

          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', zIndex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>
              Get started in 3 steps
            </div>
            <h1 style={{ fontSize:34, fontWeight:800, color:'#f0eeff', letterSpacing:'-0.8px', lineHeight:1.2, margin:'0 0 40px' }}>
              Your first event<br />
              <span style={{ color:'#818cf8' }}>in under 5 minutes</span>
            </h1>

            {/* Steps */}
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {STEPS.map((step, i) => (
                <div key={step.label} style={{ display:'flex', gap:16, paddingBottom: i < STEPS.length - 1 ? 28 : 0, position:'relative' }}>
                  {/* Line connector */}
                  {i < STEPS.length - 1 && (
                    <div style={{ position:'absolute', left:15, top:32, width:2, height:'calc(100% - 4px)', background:'rgba(99,102,241,0.2)' }} />
                  )}
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(99,102,241,0.2)', border:'2px solid rgba(99,102,241,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#818cf8', flexShrink:0, zIndex:1 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#ddd9f5', marginBottom:2 }}>{step.label}</div>
                    <div style={{ fontSize:12, color:'#5e5a80' }}>{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div style={{ marginTop:48, padding:'16px 18px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12 }}>
              <div style={{ fontSize:13, color:'#9893b8', lineHeight:1.6 }}>
                ✓ Free to start &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ 1 event free
              </div>
            </div>
          </div>

          <div style={{ fontSize:12, color:'#2a2848', zIndex:1 }}>© 2026 QLess</div>
        </div>

        {/* ── Form panel ── */}
        <div className="signup-form-side" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 48px', background:'#fafafa' }}>
          <div style={{ width:'100%', maxWidth:420, animation:'fadeUp 0.3s ease' }}>

            <h2 style={{ fontSize:26, fontWeight:700, color:'#0f0e1a', letterSpacing:'-0.5px', margin:'0 0 6px' }}>
              Create your club account
            </h2>
            <p style={{ fontSize:14, color:'#9896b0', margin:'0 0 28px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'#6366f1', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
            </p>

            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#dc2626', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ flexShrink:0 }}>⚠</span> {error}
              </div>
            )}

            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:15 }}>

              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4a4868', marginBottom:7 }}>Club Name *</label>
                <input className="auth-input" name="name" type="text" required autoFocus
                  value={form.name} onChange={handle}
                  placeholder="e.g. IEEE Student Branch"
                  style={inputCls} />
              </div>

              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4a4868', marginBottom:7 }}>Email address *</label>
                <input className="auth-input" name="email" type="email" required
                  value={form.email} onChange={handle}
                  placeholder="club@college.edu"
                  style={inputCls} />
              </div>

              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4a4868', marginBottom:7 }}>Password *</label>
                <div style={{ position:'relative' }}>
                  <input className="auth-input" name="password" type={showPw ? 'text' : 'password'}
                    required minLength={8}
                    value={form.password} onChange={handle}
                    placeholder="Min 8 characters"
                    style={{ ...inputCls, paddingRight:44 }} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9896b0', padding:4 }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                {/* Password strength meter */}
                {form.password.length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:'flex', gap:4, marginBottom:5 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex:1, height:3, borderRadius:10, background: i <= pwStrength ? pwColors[pwStrength] : '#e4e3f0', transition:'background 0.2s' }} />
                      ))}
                    </div>
                    <div style={{ fontSize:11, color: pwColors[pwStrength] || '#9896b0', fontWeight:500 }}>
                      {pwLabels[pwStrength]}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4a4868', marginBottom:7 }}>
                  College <span style={{ color:'#9896b0', fontWeight:400 }}>(optional)</span>
                </label>
                <input className="auth-input" name="college" type="text"
                  value={form.college} onChange={handle}
                  placeholder="VIT Bhopal, IIT BHU…"
                  style={inputCls} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit"
                style={{
                  width:'100%', padding:'13px', fontSize:15, fontWeight:700,
                  color:'white',
                  background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#4f46e5)',
                  border:'none', borderRadius:10,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  fontFamily:'DM Sans, sans-serif',
                  marginTop:4, transition:'transform 0.15s, box-shadow 0.15s',
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block', flexShrink:0 }} />
                    Creating account…
                  </>
                ) : 'Create account — it\'s free →'}
              </button>

              <p style={{ fontSize:12, color:'#9896b0', textAlign:'center', margin:'4px 0 0', lineHeight:1.5 }}>
                By signing up, you agree to our Terms of Service
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
