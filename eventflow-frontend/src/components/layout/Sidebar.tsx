import { NavLink, useNavigate } from 'react-router-dom'
import { getStoredClub, logout } from '@/lib/auth'
import { ThemeToggle } from '../ThemeToggle'

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
    <aside className="w-[260px] h-full flex flex-col shrink-0 bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-red-500/20 transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-red-500/20 relative">
        <div className="flex items-center gap-3 relative z-10 text-[#1F7BF5] dark:text-red-500">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="60 16"></circle>
            <path d="M22 22L30 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
            <path d="M14 16L18 20L26 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"></path>
          </svg>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
            Q<span className="text-[#1F7BF5] dark:text-red-500">Less</span>
          </span>
        </div>
      </div>

      {/* Club info */}
      {club && (
        <div className="p-5 border-b border-slate-200 dark:border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0fbff] dark:bg-red-500/10 flex items-center justify-center text-[#1F7BF5] dark:text-red-500 font-black text-lg shrink-0 border border-[#1F7BF5]/20 dark:border-red-500/20 shadow-sm transition-colors duration-300">
              {club.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate transition-colors duration-300">
                {club.name}
              </div>
              <div className="mt-1">
                <span className={`badge badge-${club.plan} text-[10px]`}>
                  {club.plan === 'free' ? 'Free Plan' : club.plan === 'pro' ? 'Club Pro' : 'Institution'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-4 mt-2">
          Menu
        </div>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-xl leading-none opacity-80">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Area (Theme + Logout) */}
      <div className="p-4 border-t border-slate-200 dark:border-red-500/20 flex items-center justify-between">
        <ThemeToggle />
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
          title="Logout"
        >
          Logout <span className="text-lg group-hover:translate-x-1 transition-transform">↪</span>
        </button>
      </div>
    </aside>
  )
}
