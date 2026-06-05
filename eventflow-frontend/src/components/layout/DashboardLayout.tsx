import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const MOBILE_NAV = [
  { to: '/dashboard', icon: '▦', label: 'Home' },
  { to: '/events',    icon: '◈', label: 'Events' },
  { to: '/volunteers',icon: '◉', label: 'Volunteers' },
  { to: '/settings',  icon: '◎', label: 'Settings' },
]

export default function DashboardLayout() {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-surface-2 text-text-1">
      {/* Desktop sidebar */}
      <div className="sidebar-desktop shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-transparent">
        <Header />
        <main className="dashboard-main fade-in flex-1 overflow-y-auto p-4 md:p-8">
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
