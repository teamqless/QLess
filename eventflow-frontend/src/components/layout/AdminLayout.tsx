import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, UserPlus, LogOut, Menu, X } from 'lucide-react'
import { adminLogout } from '@/lib/auth'

export default function AdminLayout() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar - Collapsed by default, expands on hover */}
      <div className={`
        fixed inset-y-0 left-0 z-50 group w-[260px] md:w-[76px] md:hover:w-[260px] transition-[width,transform] duration-300 ease-in-out bg-background border-r border-white/10 overflow-hidden shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <aside className="w-[260px] h-full flex flex-col shrink-0 bg-background transition-colors duration-300">
          <div className="h-20 flex items-center px-5 border-b border-white/10 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-soft border border-amber/20 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-amber-deep font-bold text-xl">S</span>
            </div>
            <h2 className="text-xl font-display font-black text-foreground ml-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">Super Admin</h2>
            
            {/* Close button (mobile) */}
            <button 
              className="absolute right-4 p-2 text-muted-foreground hover:bg-white/5 rounded-lg md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-6 overflow-y-auto overflow-x-hidden">
            {/* <div className="section-label px-3 mb-4 mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Admin Menu
            </div> */}
            <Link
              to="/admin/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className={`nav-link py-3 w-[230px] flex items-center ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
            >
              <span className="text-xl leading-none w-10 flex items-center justify-center shrink-0"><LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-foreground" /></span>
              <span className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap">Overview</span>
            </Link>
            <Link
              to="/admin/create-club"
              onClick={() => setIsSidebarOpen(false)}
              className={`nav-link py-3 w-[230px] flex items-center ${location.pathname === '/admin/create-club' ? 'active' : ''}`}
            >
              <span className="text-xl leading-none w-10 flex items-center justify-center shrink-0"><UserPlus className="w-5 h-5 text-muted-foreground group-hover:text-foreground" /></span>
              <span className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap">Create Club</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10 flex items-center overflow-hidden">
            <button
              onClick={adminLogout}
              className="w-[230px] flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group/btn"
              title="Sign Out"
            >
              <span className="text-xl w-8 flex items-center justify-center shrink-0 group-hover/btn:translate-x-1 transition-transform"><LogOut className="w-5 h-5" /></span>
              <span className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Sign Out</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden min-w-0 relative md:ml-[76px]">
        <header className="h-20 bg-background/80 backdrop-blur-md flex items-center px-4 md:px-8 shrink-0 sticky top-0 z-30 shadow-sm w-full gap-3 border-b border-white/10">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-muted-foreground hover:bg-white/5 rounded-lg transition-colors md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-display font-bold text-foreground text-xl">Admin Panel</h1>
        </header>
        
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-background">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
