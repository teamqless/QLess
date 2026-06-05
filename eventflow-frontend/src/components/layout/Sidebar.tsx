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
    <aside className="w-[260px] bg-white/60 backdrop-blur-xl border-r border-white/50 flex flex-col shrink-0 h-[100dvh] shadow-soft transition-all duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-white/50">
        <div className="flex items-center gap-3 hover-lift cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 bg-gradient-to-br from-brand to-brand-light rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md">
            E
          </div>
          <span className="font-bold text-xl text-text-1 tracking-tight">
            EventFlow
          </span>
        </div>
      </div>

      {/* Club info */}
      {club && (
        <div className="p-5 border-b border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center text-white text-base font-bold shrink-0 shadow-sm">
              {club.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-text-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {club.name}
              </div>
              <span className={`badge badge-${club.plan} mt-1 shadow-sm`}>
                {club.plan === 'free' ? 'Free' : club.plan === 'pro' ? 'Club Pro' : 'Institution'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="text-[11px] font-bold text-text-3 uppercase tracking-wider px-3 pb-3">
          Menu
        </div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="text-xl leading-none w-6 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade CTA for free plan */}
      {club?.plan === 'free' && (
        <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl border border-white shadow-sm hover-lift cursor-pointer">
          <div className="text-sm font-bold text-brand-dark mb-1">
            Upgrade to Pro
          </div>
          <div className="text-xs text-brand-light leading-relaxed mb-3">
            Unlimited attendees, custom email & more
          </div>
          <div className="text-sm font-extrabold text-brand-dark">₹499 / event</div>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-white/50">
        <button
          onClick={logout}
          className="btn btn-ghost w-full justify-start text-sm font-semibold hover:bg-red-50 hover:text-danger hover:border-red-100 transition-colors"
        >
          <span className="text-lg">↩</span> Logout
        </button>
      </div>
    </aside>
  )
}
