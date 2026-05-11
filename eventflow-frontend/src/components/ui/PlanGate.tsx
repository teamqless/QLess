import { Link } from 'react-router-dom'

interface PlanGateProps {
  feature:  string
  message?: string
}

export default function PlanGate({ feature, message }: PlanGateProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
      border: '1px solid #c4b5fd',
      borderRadius: 16,
      padding: '32px 28px',
      textAlign: 'center',
      maxWidth: 480,
      margin: '40px auto',
    }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>🔒</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#4c1d95', marginBottom: 8, letterSpacing: '-0.3px' }}>
        {feature} is a Pro feature
      </h3>
      <p style={{ fontSize: 14, color: '#7c3aed', lineHeight: 1.65, marginBottom: 24 }}>
        {message || 'Upgrade to Club Pro to unlock this feature and run unlimited events with no attendee caps.'}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/pricing" style={{
          padding: '10px 22px', background: '#7c3aed', color: 'white',
          borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
        }}>
          View plans →
        </Link>
        <Link to="/settings" style={{
          padding: '10px 18px', background: 'rgba(124,58,237,0.1)', color: '#7c3aed',
          borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: 500,
          border: '1px solid #c4b5fd',
        }}>
          Settings
        </Link>
      </div>
    </div>
  )
}
