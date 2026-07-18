import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, UserPlus, LogOut, Menu, X } from 'lucide-react'
import { adminLogout } from '@/lib/auth'

export default function AdminLayout() {
  const location = useLocation()
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

      {/* Admin Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-surface-base border-r border-border-light flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 p-6 border-b border-border-light relative">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="text-xl font-black text-text-1">Super Admin</h2>
          
          {/* Close button (mobile) */}
          <button 
            className="absolute right-4 p-2 text-text-3 hover:bg-border-light rounded-lg md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/admin/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          <Link
            to="/admin/create-club"
            onClick={() => setIsSidebarOpen(false)}
            className={`nav-link ${location.pathname === '/admin/create-club' ? 'active' : ''}`}
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Club</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border-light">
          <button
            onClick={adminLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-text-2 hover:text-danger hover:bg-danger-bg transition-colors group"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden min-w-0 relative">
        <header className="h-16 bg-surface-base border-b border-border-light flex items-center px-4 md:px-8 shrink-0 sticky top-0 z-30 shadow-sm w-full gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-text-3 hover:bg-border-light rounded-lg transition-colors md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-text-1">Admin Panel</h1>
        </header>
        
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
