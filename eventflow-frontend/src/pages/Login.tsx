import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { setToken, setStoredClub } from '@/lib/auth'

const FEATURES = [
  { icon: '◈', text: 'Custom registration forms' },
  { icon: '◉', text: 'QR codes emailed automatically' },
  { icon: '▦', text: 'Live entry dashboard' },
  { icon: '✦', text: 'Mobile gate scanner — no app needed' },
]

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      setToken(data.token)
      setStoredClub(data.club)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password')
      setLoading(false)
    }
  }

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
        .auth-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
        .auth-brand { background: linear-gradient(145deg,#0f0e1a 0%,#1a1040 100%); display:flex; flex-direction:column; padding:40px 48px; position:relative; overflow:hidden; }
        .auth-form-side { display:flex; align-items:center; justify-content:center; padding:40px 48px; background:#fafafa; }
        @media (max-width:768px) {
          .auth-wrap { grid-template-columns: 1fr !important; }
          .auth-brand { display: none !important; }
          .auth-form-side { padding: 32px 24px !important; align-items: flex-start !important; padding-top: 60px !important; }
        }
        .auth-input:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.12) !important; }
        .auth-submit { transition: transform 0.15s, box-shadow 0.15s; }
        .auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.45) !important; }
        .auth-submit:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div className="auth-wrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>

        {/* ── Brand panel ── */}
        <div className="auth-brand">
          <div style={{ position:'absolute', top:'25%', left:'10%', width:400, height:400, background:'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'10%', right:'-10%', width:300, height:300, background:'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)', pointerEvents:'none' }} />

          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', zIndex:1 }}>
            <div style={{ width:34, height:34, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:17, color:'white' }}>E</div>
            <span style={{ fontWeight:700, fontSize:17, color:'#f0eeff', letterSpacing:'-0.3px' }}>EventFlow</span>
          </Link>

          <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', zIndex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>
              Club management platform
            </div>
            <h1 style={{ fontSize:36, fontWeight:800, color:'#f0eeff', letterSpacing:'-1px', lineHeight:1.15, margin:'0 0 16px' }}>
              Run your events<br />
              <span style={{ background:'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                without the chaos
              </span>
            </h1>
            <p style={{ fontSize:14, color:'#6b6890', lineHeight:1.7, maxWidth:320, margin:'0 0 36px' }}>
              From registration to gate entry — everything automated.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {FEATURES.map(f => (
                <div key={f.text} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:30, height:30, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#818cf8', flexShrink:0 }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize:13, color:'#9893b8' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize:12, color:'#2a2848', zIndex:1 }}>© 2026 EventFlow</div>
        </div>

        {/* ── Form panel ── */}
        <div className="auth-form-side">
          <div style={{ width:'100%', maxWidth:400, animation:'fadeUp 0.3s ease' }}>

            <h2 style={{ fontSize:26, fontWeight:700, color:'#0f0e1a', letterSpacing:'-0.5px', margin:'0 0 6px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize:14, color:'#9896b0', margin:'0 0 30px' }}>
              New to EventFlow?{' '}
              <Link to="/signup" style={{ color:'#6366f1', fontWeight:600, textDecoration:'none' }}>Create a free account</Link>
            </p>

            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'11px 14px', fontSize:13, color:'#dc2626', marginBottom:20, display:'flex', alignItems:'center', gap:8, animation:'fadeUp 0.2s ease' }}>
                <span style={{ flexShrink:0 }}>⚠</span> {error}
              </div>
            )}

            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4a4868', marginBottom:7 }}>Email address</label>
                <input
                  className="auth-input"
                  name="email" type="email" required autoFocus
                  value={form.email} onChange={handle}
                  placeholder="club@college.edu"
                  style={inputCls}
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#4a4868', marginBottom:7 }}>Password</label>
                <div style={{ position:'relative' }}>
                  <input
                    className="auth-input"
                    name="password" type={showPw ? 'text' : 'password'} required
                    value={form.password} onChange={handle}
                    placeholder="••••••••"
                    style={{ ...inputCls, paddingRight:44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9896b0', padding:4 }}
                  >{showPw ? '🙈' : '👁'}</button>
                </div>
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
                  marginTop:4,
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block', flexShrink:0 }} />
                    Signing in…
                  </>
                ) : 'Sign in →'}
              </button>
            </form>

            <div style={{ marginTop:28, padding:'18px', background:'#f8f8fc', borderRadius:12, border:'1px solid #e4e3f0' }}>
              <p style={{ fontSize:12, color:'#9896b0', margin:0, lineHeight:1.6, textAlign:'center' }}>
                Your data is secured with JWT authentication and Supabase Row Level Security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
