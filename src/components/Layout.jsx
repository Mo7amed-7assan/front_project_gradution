import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../services/notifications'

/* ─── SVG Icon Map ─────────────────────────────────────────────────── */
const icons = {
  Home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
    </svg>
  ),
  Projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Mine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  ),
  New: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  Apps: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  Invite: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  ),
  Chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  People: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  User: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Report: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/><polyline points="12 15 14 17 18 13"/>
    </svg>
  ),
  ChevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
}

/* ─── Nav Config ───────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/dashboard',         label: 'Dashboard',        icon: 'Home' },
  { to: '/projects',          label: 'Explore Projects',  icon: 'Projects' },
  { to: '/my-projects',       label: 'My Projects',       icon: 'Mine' },
  { to: '/projects/create',   label: 'Create Project',    icon: 'New' },
  { to: '/applications/mine', label: 'My Applications',   icon: 'Apps' },
  { to: '/invitations',       label: 'Invitations',       icon: 'Invite' },
  { to: '/messages',          label: 'Messages',          icon: 'Chat' },
  { to: '/notifications',     label: 'Notifications',     icon: 'Bell', badge: true },
  { to: '/discover',          label: 'Discover People',   icon: 'People' },
  { to: '/profile',           label: 'My Profile',        icon: 'User' },
  { to: '/verification',      label: 'Verification',      icon: 'Check' },
]

const ADMIN_NAV_ITEMS = [
  { to: '/admin/verifications', label: 'Verifications' },
  { to: '/admin/reports',       label: 'Reports' },
  { to: '/admin/moderation',    label: 'Moderation' },
  { to: '/admin/restrictions',  label: 'Restrictions' },
  { to: '/admin/users',         label: 'Users' },
  { to: '/admin/settings',      label: 'Settings' },
  { to: '/admin/action-logs',   label: 'Action Logs' },
  { to: '/admin/system-logs',   label: 'System Logs' },
]

/* ─── Sidebar ──────────────────────────────────────────────────────── */
function Sidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnread] = useState(0)
  const [isAdminOpen, setIsAdminOpen] = useState(false)

  /* fetch unread badge count */
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
      } catch { /* silent */ }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  /* auto-expand admin section */
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) setIsAdminOpen(true)
  }, [location.pathname])

  const isActive = (path) => {
    if (path === '/projects' && location.pathname === '/projects') return true
    if (path !== '/projects') return location.pathname.startsWith(path)
    return false
  }

  const avatar = (user?.full_name || user?.name || user?.username || 'U').charAt(0).toUpperCase()
  const displayName = user?.full_name || user?.name || user?.username || 'User'
  const isAdmin = user && ['administrator', 'admin', 'moderator'].includes(user.role)

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col select-none shrink-0">

      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-tight leading-none">Co-Found</div>
            <div className="text-[10px] text-slate-400 mt-0.5 tracking-wide uppercase">Startup Platform</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow">
              {avatar}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"/>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{displayName}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ to, label, icon, badge }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {icons[icon]}
              </span>
              <span className="flex-1 truncate">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}

        {/* Admin section */}
        {isAdmin && (
          <div className="pt-3">
            <div className="px-3 mb-2">
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Administration</span>
            </div>
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isAdminOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-slate-500">{icons.Admin}</span>
              <span className="flex-1 text-left">Admin Panel</span>
              <span className={`transition-transform duration-200 text-slate-500 ${isAdminOpen ? 'rotate-180' : ''}`}>
                {icons.ChevronDown}
              </span>
            </button>

            {isAdminOpen && (
              <div className="mt-1 ml-4 pl-3 border-l border-slate-700/60 space-y-0.5">
                {ADMIN_NAV_ITEMS.map(({ to, label }) => {
                  const active = isActive(to)
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        active
                          ? 'bg-indigo-600/80 text-white'
                          : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700/60">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-900/30 hover:text-rose-400 transition-all duration-150"
        >
          {icons.Logout}
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

/* ─── Layout ───────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
