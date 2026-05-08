// ============================================================
// components/layout/Sidebar.tsx — PHASE 2
// Left navigation for club admin dashboard
// ============================================================
import { NavLink } from 'react-router-dom'
import { getStoredClub } from '@/lib/auth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/events',    label: 'Events',    icon: '🎫' },
  // Phase 2: Add Volunteers, Settings
]

export default function Sidebar() {
  const club = getStoredClub()

  return (
    <aside className="w-56 bg-white border-r h-full flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b">
        <span className="font-bold text-indigo-600 text-lg">EventFlow</span>
      </div>

      {/* Club name */}
      {club && (
        <div className="px-5 py-4 border-b">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">{club.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block
            ${club.plan === 'free' ? 'bg-gray-100 text-gray-500' :
              club.plan === 'pro'  ? 'bg-indigo-100 text-indigo-600' :
              'bg-amber-100 text-amber-700'}`}>
            {club.plan === 'free' ? 'Free' : club.plan === 'pro' ? 'Club Pro' : 'Institution'}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }>
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Phase 2: Add upgrade CTA for free plan users */}
    </aside>
  )
}
