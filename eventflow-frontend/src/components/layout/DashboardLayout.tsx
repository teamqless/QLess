import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const MOBILE_NAV = [
  { to: '/dashboard', icon: '▦', label: 'Home' },
  { to: '/events',    icon: '◈', label: 'Events' },
  { to: '/volunteers',icon: '◉', label: 'Volunteers' },
  { to: '/import',    icon: '⬆', label: 'Import' },
  { to: '/profile',   icon: '👤', label: 'Profile' },
]

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-surface-base">
      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Collapsed by default, expands on hover */}
      <div className={`
        fixed inset-y-0 left-0 z-50 group w-[260px] md:w-[76px] md:hover:w-[260px] transition-[width,transform] duration-300 ease-in-out bg-surface-base border-r border-border-light overflow-hidden shadow-[4px_0_24px_rgba(113,54,0,0.05)]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onNavClick={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative md:ml-[76px]">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="dashboard-main fade-in flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
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
