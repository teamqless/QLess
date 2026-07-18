import { NavLink, useNavigate } from 'react-router-dom'
import { getStoredClub, logout } from '@/lib/auth'
import { Badge } from '@/components/ui/Badge'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  icon: '▦' },
  { to: '/events',    label: 'Events',     icon: '◈' },
  { to: '/volunteers',label: 'Volunteers', icon: '◉' },
  { to: '/profile',   label: 'Profile',    icon: '👤' },
]

export default function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
  const club     = getStoredClub()
  const navigate = useNavigate()

  return (
    <aside className="w-[260px] h-full flex flex-col shrink-0 bg-paper transition-colors duration-300">
      {/* Logo */}
      <div className="h-20 flex items-center px-5 border-b border-line-soft relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10 text-amber w-[220px]">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-amber">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="60 16"></circle>
            <path d="M22 22L30 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
            <path d="M14 16L18 20L26 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"></path>
          </svg>
          <span className="font-display font-black text-2xl tracking-tight text-ink md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-100">
            Event<span className="text-amber">Flow</span>
          </span>
        </div>
      </div>

      {/* Club info */}
      {club && (
        <div className="p-4 border-b border-line-soft overflow-hidden">
          <div className="flex items-center gap-3 w-[220px]">
            <div className="w-10 h-10 rounded-xl bg-paper-card flex items-center justify-center text-amber-deep font-black text-lg shrink-0 border border-line shadow-sm">
              {club?.name?.charAt(0)?.toUpperCase() ?? 'C'}
            </div>
            <div className="min-w-0 flex-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75">
              <div className="font-bold text-sm text-ink truncate">
                {club?.name || 'Club Member'}
              </div>
              <div className="mt-1">
                <Badge color={club.plan === 'pro' ? 'amber' : 'default'}>
                  {club.plan === 'free' ? 'Free Plan' : club.plan === 'pro' ? 'Club Pro' : 'Institution'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
        <div className="section-label px-3 mb-4 mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Menu
        </div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) => `nav-link w-[230px] flex items-center ${isActive ? 'active' : ''}`}
          >
            <span className="text-xl leading-none w-10 flex items-center justify-center shrink-0">{item.icon}</span>
            <span className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Area (Logout) */}
      <div className="p-4 border-t border-line-soft flex items-center overflow-hidden">
        <button
          onClick={logout}
          className="w-[230px] flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-ink-soft hover:text-rust hover:bg-rust-soft transition-colors group/btn"
          title="Logout"
        >
          <span className="text-xl w-8 flex items-center justify-center shrink-0 group-hover/btn:translate-x-1 transition-transform">↪</span>
          <span className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Logout</span>
        </button>
      </div>
    </aside>
  )
}
