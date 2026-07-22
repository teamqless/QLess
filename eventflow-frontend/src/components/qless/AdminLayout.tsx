import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users2,
  Upload,
  Settings,
  Menu,
  LogOut,
  Bell,
  Search,
} from 'lucide-react'
import { QLessLogo } from './Logo'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { clearAuth, getStoredClub } from '@/lib/auth'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'My Events', icon: CalendarDays },
  { to: '/events/new', label: 'Create Event', icon: PlusCircle },
  { to: '/volunteers', label: 'Volunteers', icon: Users2 },
  { to: '/import', label: 'Import Data', icon: Upload },
  { to: '/profile', label: 'Settings & SMTP', icon: Settings },
]

export function AdminLayout({ children, title }: { children: ReactNode; title?: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const club = getStoredClub()
  const clubName = club?.name || 'Club'
  const email = club?.email || ''
  const initials = clubName.substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 84 : 260 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="glass-strong sticky top-0 h-screen flex flex-col border-r border-white/5 z-30 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <QLessLogo size={28} showWordmark={false} />
              </motion.div>
            ) : (
              <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <QLessLogo size={28} />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                  active
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebarActive"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl p-2 hover:bg-white/5',
              collapsed && 'justify-center',
            )}
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-violet grid place-items-center text-sm font-bold text-primary-foreground shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{clubName}</div>
                  <div className="text-xs text-muted-foreground truncate">{email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass-strong border-b border-white/5 h-16 px-6 flex items-center gap-4">
          <h1 className="text-lg font-semibold truncate">{title ?? 'Dashboard'}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 glass rounded-xl px-3 h-9 w-72">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search…"
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              />
            </div>
            <button className="relative h-9 w-9 grid place-items-center rounded-xl glass hover:bg-white/10">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
