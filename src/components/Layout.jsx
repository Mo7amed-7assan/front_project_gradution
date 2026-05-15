import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../services/notifications'

const NAV_ITEMS = [
  { to: '/dashboard',        label: 'Dashboard',        icon: '🏠' },
  { to: '/projects',         label: 'Explore Projects',  icon: '🔍' },
  { to: '/my-projects',      label: 'My Projects',       icon: '📁' },
  { to: '/projects/create',  label: 'Create Project',    icon: '➕' },
  { to: '/applications/mine',label: 'My Applications',  icon: '📋' },
  { to: '/matches',          label: 'Smart Matches',     icon: '🎯' },
  { to: '/invitations',      label: 'Invitations',       icon: '📨' },
  { to: '/messages',         label: 'Messages',          icon: '💬' },
  { to: '/notifications',    label: 'Notifications',     icon: '🔔', badge: true },
  { to: '/discover',         label: 'Discover People',   icon: '🔎' },
  { to: '/profile',          label: 'Profile',           icon: '👤' },
  { to: '/verification',     label: 'Verification',      icon: '✅' },
]

function Sidebar() {
  const { logout, user }          = useAuth()
  const location                  = useLocation()
  const [unreadCount, setUnread]  = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res  = await getNotifications()
        const d    = res?.data
        let list   = []
        if (Array.isArray(d?.data?.data?.data)) list = d.data.data.data
        else if (Array.isArray(d?.data?.data))  list = d.data.data
        else if (Array.isArray(d?.data))        list = d.data
        else if (Array.isArray(d))              list = d

        const count = list.filter(n => !(n.read_at || n.read || n.is_read)).length
        setUnread(count)
      } catch { /* silent */ }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000) // poll every 60s
    return () => clearInterval(interval)
  }, [])

  const isActive = (path) => {
    if (path === '/projects' && location.pathname === '/projects') return true
    if (path !== '/projects') return location.pathname.startsWith(path)
    return false
  }

  const avatar = (user?.full_name || user?.name || user?.username || 'U').charAt(0).toUpperCase()

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="text-xl font-bold text-indigo-600 tracking-tight">Co-Found</div>
        <div className="text-xs text-gray-400 mt-0.5">Startup Collaboration Platform</div>
      </div>

      {/* User card */}
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

      {/* Nav */}
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
              <span className="text-base leading-none">{icon}</span>
              <span className="flex-1">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="ml-auto bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span>
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
