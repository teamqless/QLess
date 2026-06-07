import { NavLink, useNavigate } from 'react-router-dom'
import { getStoredClub, logout } from '@/lib/auth'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  icon: '▦' },
  { to: '/events',    label: 'Events',     icon: '◈' },
  { to: '/volunteers',label: 'Volunteers', icon: '◉' },
  { to: '/settings',  label: 'Settings',   icon: '◎' },
]

export default function Sidebar() {
  const club     = getStoredClub()
  const navigate = useNavigate()

  return (
    <aside style={{
      width: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--brand)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 700,
          }}>E</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', letterSpacing: '-0.3px' }}>
            EventFlow
          </span>
        </div>
      </div>

      {/* Club info */}
      {club && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>
              {club.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text-1)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{club.name}</div>
              <span className={`badge badge-${club.plan}`} style={{ marginTop: 2 }}>
                {club.plan === 'free' ? 'Free' : club.plan === 'pro' ? 'Club Pro' : 'Institution'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 12px 8px' }}>
          Menu
        </div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade CTA for free plan */}
      {club?.plan === 'free' && (
        <div style={{ margin: '12px', padding: '14px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 4 }}>
            Upgrade to Pro
          </div>
          <div style={{ fontSize: 11, color: '#7c3aed', lineHeight: 1.4, marginBottom: 10 }}>
            Unlimited attendees, custom email & more
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#5b21b6' }}>₹499 / event</div>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={logout}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13 }}
        >
          <span>↩</span> Logout
        </button>
      </div>
    </aside>
  )
}
