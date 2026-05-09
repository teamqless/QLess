import { Link } from 'react-router-dom'

export default function RegisterSuccess() {
  return (
    <div style={{
      minHeight: '100vh', background: '#f8f8fc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif', padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
        padding: '52px 40px', maxWidth: 440, width: '100%', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        {/* Animated checkmark */}
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 0 8px #f0fdf4',
          fontSize: 32,
        }}>
          ✓
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f0e1a', letterSpacing: '-0.4px', marginBottom: 10 }}>
          Registration submitted!
        </h1>

        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, marginBottom: 28 }}>
          Your registration is in. Once the organizer reviews your details
          and verifies your payment, you'll receive your{' '}
          <strong style={{ color: '#0f0e1a' }}>QR entry pass via email</strong>.
        </p>

        <div style={{
          background: '#f8f8fc', border: '1px solid #e5e7eb',
          borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left',
        }}>
          {[
            { icon: '📧', text: 'Check your inbox for a confirmation' },
            { icon: '📂', text: 'Also check your spam/promotions folder' },
            { icon: '📱', text: 'Screenshot or save your QR when it arrives' },
          ].map(tip => (
            <div key={tip.text} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#6b7280', marginBottom: 8, lineHeight: 1.4 }}>
              <span>{tip.icon}</span> {tip.text}
            </div>
          ))}
        </div>

        <Link to="/" style={{
          display: 'inline-block', padding: '10px 24px',
          background: '#f3f4f6', color: '#374151', borderRadius: 8,
          textDecoration: 'none', fontSize: 14, fontWeight: 500,
        }}>
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
