import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../services/notifications'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'Home' },
  { to: '/projects', label: 'Explore Projects', icon: 'Projects' },
  { to: '/my-projects', label: 'My Projects', icon: 'Mine' },
  { to: '/projects/create', label: 'Create Project', icon: 'New' },
  { to: '/applications/mine', label: 'My Applications', icon: 'Apps' },
  { to: '/invitations', label: 'Invitations', icon: 'Invite' },
  { to: '/messages', label: 'Messages', icon: 'Chat' },
  { to: '/notifications', label: 'Notifications', icon: 'Bell', badge: true },
  { to: '/discover', label: 'Discover People', icon: 'People' },
  { to: '/profile', label: 'Profile', icon: 'User' },
  { to: '/verification', label: 'Verification', icon: 'Check' },
]

const ADMIN_NAV_ITEMS = [
  { to: '/admin/verifications', label: 'Admin Verifications', icon: 'Shield' },
  { to: '/admin/reports', label: 'Admin Reports', icon: 'Report' },
  { to: '/admin/moderation', label: 'Admin Moderation', icon: 'Gavel' },
  { to: '/admin/restrictions', label: 'Admin Restrictions', icon: 'Ban' },
  { to: '/admin/users', label: 'Admin Users', icon: 'Users' },
  { to: '/admin/settings', label: 'Admin Settings', icon: 'Settings' },
  { to: '/admin/action-logs', label: 'Admin Action Logs', icon: 'FileText' },
  { to: '/admin/system-logs', label: 'Admin System Logs', icon: 'Activity' },
]

function Sidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnread] = useState(0)
  const [isAdminOpen, setIsAdminOpen] = useState(false)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await getNotifications()
        const d = res?.data
        let list = []
        if (Array.isArray(d?.data?.data?.data)) list = d.data.data.data
        else if (Array.isArray(d?.data?.data)) list = d.data.data
        else if (Array.isArray(d?.data)) list = d.data
        else if (Array.isArray(d)) list = d

        const count = list.filter((n) => !(n.read_at || n.read || n.is_read)).length
        setUnread(count)
      } catch {
        // silent
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-expand admin menu if on admin route
    if (location.pathname.startsWith('/admin')) {
      setIsAdminOpen(true)
    }
  }, [location.pathname])

  const isActive = (path) => {
    if (path === '/projects' && location.pathname === '/projects') return true
    if (path !== '/projects') return location.pathname.startsWith(path)
    return false
  }

  const avatar = (user?.full_name || user?.name || user?.username || 'U').charAt(0).toUpperCase()

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="text-xl font-bold text-indigo-600 tracking-tight">Co-Found</div>
        <div className="text-xs text-gray-400 mt-0.5">Startup Collaboration Platform</div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {avatar}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-gray-800 truncate">
              {user?.full_name || user?.name || user?.username || 'User'}
            </div>
            <div className="text-xs text-gray-400 truncate">{user?.email || ''}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon, badge }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-[10px] leading-none w-10 shrink-0 text-gray-400 uppercase">{icon}</span>
              <span className="flex-1">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="ml-auto bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}

        {user && ['administrator', 'admin', 'moderator'].includes(user.role) && (
          <div>
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isAdminOpen
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-[10px] leading-none w-10 shrink-0 text-gray-400 uppercase">Admin</span>
              <span className="flex-1">Administration</span>
              <svg
                className={`w-4 h-4 transition-transform ${isAdminOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {isAdminOpen && (
              <div className="mt-1 ml-2 space-y-0.5 border-l-2 border-indigo-200 pl-2">
                {ADMIN_NAV_ITEMS.map(({ to, label }) => {
                  const active = isActive(to)
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="flex-1">{label.replace('Admin ', '')}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
