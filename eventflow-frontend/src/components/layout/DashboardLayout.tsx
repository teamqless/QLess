import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MOBILE_NAV = [
  { to: '/dashboard', icon: '▦', label: 'Home' },
  { to: '/events',    icon: '◈', label: 'Events' },
  { to: '/volunteers',icon: '◉', label: 'Volunteers' },
  { to: '/import',    icon: '⬆', label: 'Import' },
  { to: '/settings',  icon: '◎', label: 'Settings' },
]

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--surface-2)' }}>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header />
        <main
          className="dashboard-main fade-in"
          style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="mobile-bottom-nav">
        {MOBILE_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
