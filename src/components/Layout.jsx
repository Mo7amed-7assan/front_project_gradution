import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../services/notifications'
import { getMyProjects } from '../services/project'
import { getConnections } from '../services/connections'
import { getMySkills } from '../services/profile'
import { getMatches } from '../services/match'

/* ─── SVG Icons ─────────────────────────────────────────────────── */
const icons = {
  Home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  ),
  Network: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
  ),
  Check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  Bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
  ),
  Chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
  ),
  ChevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9" /></svg>
  ),
  Logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  ),
  Moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
  ),
  Link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
  ),
  Report: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  ),
}

const ADMIN_NAV_ITEMS = [
  { to: '/admin/verifications', label: 'Verifications' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/moderation', label: 'Moderation' },
  { to: '/admin/restrictions', label: 'Restrictions' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/action-logs', label: 'Action Logs' },
  { to: '/admin/system-logs', label: 'System Logs' },
]

/* ─── Top Navigation Bar ───────────────────────────────────────────── */
function TopNav({ user, logout, unreadCount }) {
  const location = useLocation()
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const isAdmin = user && ['administrator', 'admin', 'moderator'].includes(user.role)

  const avatar = (user?.full_name || user?.name || user?.username || 'U').charAt(0).toUpperCase()

  const navItems = [
    { to: '/home', icon: icons.Home, label: 'Home' },
    { to: '/projects', icon: icons.Projects, label: 'Projects' },
    { to: '/connections', icon: icons.Network, label: 'Network' },
    { to: '/reports', icon: icons.Report, label: 'Reports' },
    { to: '/verification', icon: icons.Check, label: 'Verify' },
  ]

  return (
    <header className="h-16 bg-[#1E1E35] border-b border-[#2D2D4E] fixed top-0 left-0 right-0 z-50 px-4 flex items-center justify-between shadow-lg shadow-black/30">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="CoFound Logo" className="w-8 h-8 rounded-xl object-cover border border-[#2D2D4E]" />
          <span className="text-xl font-bold text-white tracking-tight hidden sm:inline">CoFound</span>
        </Link>

        {/* Main Nav — icons on top, labels below */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'text-[#6C63FF] bg-[#6C63FF]/10'
                    : 'text-slate-400 hover:text-white hover:bg-[#2A2A4E]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Create Project */}
        <Link to="/projects/create" className="hidden sm:flex btn-primary bg-[#6C63FF] hover:bg-[#4F46E5] text-white !py-1.5 !px-4 shadow-[0_0_15px_rgba(108,99,255,0.4)] hover:shadow-[0_0_20px_rgba(108,99,255,0.6)]">
          + Create Project
        </Link>

        {/* Admin Dropdown */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="flex items-center gap-1 text-xs font-bold bg-[#00D4AA]/10 text-[#00D4AA] px-3 py-1.5 rounded-lg border border-[#00D4AA]/30 hover:bg-[#00D4AA]/20 transition-all shadow-[0_0_10px_rgba(0,212,170,0.15)]"
            >
              ADMIN {icons.ChevronDown}
            </button>
            {isAdminOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1E1E35] border border-[#2D2D4E] rounded-xl shadow-xl overflow-hidden py-1">
                {ADMIN_NAV_ITEMS.map(item => (
                  <Link key={item.to} to={item.to} onClick={() => setIsAdminOpen(false)} className="block px-4 py-2 text-sm text-slate-300 hover:bg-[#2A2A4E] hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="w-px h-6 bg-[#2D2D4E] mx-1"></div>

        {/* Icons */}
        <button onClick={() => document.documentElement.classList.toggle('dark')} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-[#2A2A4E] rounded-full">
          {icons.Moon}
        </button>
        <Link to="/notifications" className="relative text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-[#2A2A4E] rounded-full">
          {icons.Bell}
          {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-[#1E1E35]"></span>}
        </Link>
        <Link to="/messages" className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-[#2A2A4E] rounded-full">
          {icons.Chat}
        </Link>

        {/* Profile */}
        <div className="relative ml-1">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2">
            {(user?.profile_picture || user?.profile_picture_url || user?.avatar) ? (
              <img src={user.profile_picture || user.profile_picture_url || user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#2D2D4E]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center text-white font-bold text-xs">
                {avatar}
              </div>
            )}
            <span className="text-slate-400">{icons.ChevronDown}</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1E1E35] border border-[#2D2D4E] rounded-xl shadow-xl overflow-hidden py-1">
              <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-300 hover:bg-[#2A2A4E] hover:text-white">My Profile</Link>
              <div className="h-px bg-[#2D2D4E] my-1"></div>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:bg-[#2A2A4E] flex items-center gap-2">
                {icons.Logout} Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/* ─── Left Sidebar (Profile Card) ──────────────────────────────────── */
function LeftSidebar({ user, projectCount, connectionCount, skillsData }) {
  const avatar = (user?.full_name || user?.name || user?.username || 'U').charAt(0).toUpperCase()
  const displayName = user?.full_name || user?.name || user?.username || 'User'
  const username = user?.username ? `@${user.username}` : '@user'

  const userRole = user?.role === 'administrator' || user?.role === 'admin' ? 'Admin' :
                   user?.role === 'moderator' ? 'Moderator' : 'Regular User'

  // Parse skills — prefer skillsData from API, fall back to user.skills
  const rawSkills = (skillsData && skillsData.length > 0) ? skillsData : user?.skills
  let skillsArr = []
  if (rawSkills) {
    if (Array.isArray(rawSkills)) {
      skillsArr = rawSkills.map(s => typeof s === 'string' ? s : (s?.skill_name || s?.name || '')).filter(Boolean)
    } else {
      skillsArr = String(rawSkills).split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  const MAX_SKILLS = 6
  const displayedSkills = skillsArr.slice(0, MAX_SKILLS)
  const remainingSkills = skillsArr.length - MAX_SKILLS

  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-20 self-start">
      <div className="card p-6 flex flex-col items-center text-center overflow-y-auto no-scrollbar">
        {/* SECTION 1: Identity & About */}
        <Link to="/profile" className="relative mb-3 block group cursor-pointer shrink-0">
          <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {(user?.profile_picture || user?.profile_picture_url || user?.avatar) ? (
            <img src={user.profile_picture || user.profile_picture_url || user.avatar} alt={displayName} className="w-20 h-20 rounded-full object-cover border-4 border-[#1E1E35] shadow-[0_0_15px_rgba(108,99,255,0.3)]" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center text-white font-bold text-2xl border-4 border-[#1E1E35] shadow-[0_0_15px_rgba(108,99,255,0.3)]">
              {avatar}
            </div>
          )}
        </Link>

        <h2 className="text-lg font-bold text-white leading-tight">{displayName}</h2>
        <p className="text-sm text-slate-400 mb-3">{username}</p>
        <div className="badge badge-primary mb-4 capitalize">{userRole}</div>
        <p className="text-xs text-slate-300 mb-2 px-2 italic leading-relaxed">{user?.bio || user?.about || 'No bio provided. Update your profile.'}</p>

        {/* SECTION 2: Stats & Skills */}
        <div className="w-full border-t border-[#2D2D4E] pt-5 mt-4">
          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-slate-400 font-medium">Connections</span>
            <span className="font-bold text-white">{connectionCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-5">
            <span className="text-slate-400 font-medium">Projects</span>
            <span className="font-bold text-white">{projectCount}</span>
          </div>

          <div className="text-center">
            <span className="block text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">My Skills</span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {displayedSkills.length > 0 ? (
                <>
                  {displayedSkills.map((skill, idx) => {
                    const skillName = typeof skill === 'string' ? skill : (skill?.skill_name || skill?.name || String(skill))
                    return (
                      <span key={idx} className="text-[10px] font-bold px-2.5 py-1 bg-[#2D2D4E] text-[#00D4AA] rounded-full border border-[#00D4AA]/20">
                        {typeof skillName === 'string' ? skillName.trim() : skillName}
                      </span>
                    )
                  })}
                  {remainingSkills > 0 && (
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-[#2D2D4E] text-slate-400 rounded-full border border-[#2D2D4E]">
                      +{remainingSkills} more
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-500">No skills added</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ─── Right Sidebar (Widgets) ──────────────────────────────────────── */
function RightSidebar() {
  const [suggestedProjects, setSuggestedProjects] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await getMatches()
        let list = []
        if (Array.isArray(res)) list = res
        else if (Array.isArray(res?.data?.data?.data)) list = res.data.data.data
        else if (Array.isArray(res?.data?.data)) list = res.data.data
        else if (Array.isArray(res?.data?.matches)) list = res.data.matches
        else if (Array.isArray(res?.data)) list = res.data
        else if (Array.isArray(res?.matches)) list = res.matches
        else if (Array.isArray(res?.items)) list = res.items

        const projs = list.filter(m => m.project || m.matched_project || m.target_project)
        const users = list.filter(m => m.user || m.matched_user || m.target_user)
        
        setSuggestedProjects(projs.slice(0, 3))
        setSuggestedUsers(users.slice(0, 3))
      } catch (err) {
        console.error('Failed to load suggestions in sidebar', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [])

  if (loading) {
    return (
      <aside className="hidden lg:flex flex-col gap-6 sticky top-20 self-start pb-6">
        <div className="text-center text-slate-400 py-10">Loading suggestions...</div>
      </aside>
    )
  }

  return (
    <aside className="hidden lg:flex flex-col gap-6 sticky top-20 self-start pb-6">
      {/* Suggested Projects */}
      <div className="card p-5">
        <h3 className="text-base font-bold text-white mb-4">Suggested Projects</h3>
        {suggestedProjects.length === 0 ? (
          <p className="text-xs text-slate-400">No project suggestions yet.</p>
        ) : (
          <ul className="space-y-4">
            {suggestedProjects.map((match, idx) => {
              const proj = match.project || match.matched_project || match.target_project
              const avatar = proj?.owner?.profile_picture_url || proj?.owner?.avatar
              const initial = (proj?.title || proj?.name || 'P')[0]
              
              return (
                <Link to={`/projects/${proj.id}`} key={match.id} className="flex items-center gap-3 group cursor-pointer hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors">
                  <span className="text-sm font-bold text-slate-500 w-4">{idx + 1}.</span>
                  <div className="w-8 h-8 rounded-full bg-[#2D2D4E] flex items-center justify-center text-xs font-bold text-white shrink-0 group-hover:ring-2 group-hover:ring-[#00D4AA]/50 transition-all overflow-hidden">
                    {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate group-hover:text-[#00D4AA] transition-colors">
                      {proj.title || proj.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {Math.round((match.match_score || match.score || 0) * 100)}% Match
                    </p>
                  </div>
                </Link>
              )
            })}
          </ul>
        )}
      </div>

      {/* Suggested Users */}
      <div className="card p-5">
        <h3 className="text-base font-bold text-white mb-4">Suggested Connections</h3>
        {suggestedUsers.length === 0 ? (
          <p className="text-xs text-slate-400">No user suggestions yet.</p>
        ) : (
          <ul className="space-y-4">
            {suggestedUsers.map((match) => {
              const u = match.user || match.matched_user || match.target_user
              const avatar = u?.profile_picture_url || u?.avatar
              const name = u?.full_name || u?.username || 'User'
              const initial = name[0].toUpperCase()
              
              return (
                <Link to={`/users/${u.id}`} key={match.id} className="flex items-center justify-between gap-2 group hover:bg-slate-800/50 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#2D2D4E] flex items-center justify-center text-xs font-bold text-white shrink-0 group-hover:ring-2 group-hover:ring-[#6C63FF]/50 transition-all overflow-hidden">
                      {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-[#6C63FF] transition-colors">
                        {name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {Math.round((match.match_score || match.score || 0) * 100)}% Match
                      </p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold px-2 py-1 rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-400 transition-colors shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Connect logic here */ }}>
                    Connect
                  </button>
                </Link>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}

/* ─── Layout ───────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnread] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [connectionCount, setConnectionCount] = useState(0)
  const [skillsData, setSkillsData] = useState([])
  const isHome = location.pathname === '/home' || location.pathname === '/'

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
    if (user) {
      fetchUnread()
      const interval = setInterval(fetchUnread, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  /* fetch sidebar counts */
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [projRes, connRes, skillsRes] = await Promise.allSettled([
          getMyProjects({ is_user_participant: true, role: 'owner', per_page: 1 }),
          getConnections({ sort_by: 'all' }),
          getMySkills()
        ])

        // Project count
        if (projRes.status === 'fulfilled') {
          const meta = projRes.value?.data?.meta || projRes.value?.data?.pagination || {}
          const list = projRes.value?.data?.data || projRes.value?.data || []
          const count = meta?.total || (Array.isArray(list) ? list.length : 0)
          setProjectCount(count)
        }

        // Connection count
        if (connRes.status === 'fulfilled') {
          let list = []
          if (Array.isArray(connRes.value)) list = connRes.value
          else if (Array.isArray(connRes.value?.data?.data)) list = connRes.value.data.data
          else if (Array.isArray(connRes.value?.data?.connections)) list = connRes.value.data.connections
          else if (Array.isArray(connRes.value?.data)) list = connRes.value.data
          
          const accepted = list.filter(c => (c.status || '').toLowerCase() === 'accepted')
          setConnectionCount(accepted.length)
        }

        // Skills data
        if (skillsRes.status === 'fulfilled') {
          let list = []
          if (Array.isArray(skillsRes.value)) list = skillsRes.value
          else if (Array.isArray(skillsRes.value?.data?.data)) list = skillsRes.value.data.data
          else if (Array.isArray(skillsRes.value?.data)) list = skillsRes.value.data
          setSkillsData(list)
        }
      } catch { /* silent */ }
    }
    if (user) fetchCounts()
  }, [user])

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-slate-200 font-sans flex flex-col dark">
      <TopNav user={user} logout={logout} unreadCount={unreadCount} />

      {/* pt-16 offsets the fixed navbar height — overflow on body so sticky works */}
      <div className="flex-1 pt-16">
        <div className={`max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-[240px_1fr] ${isHome ? 'lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[280px_1fr_320px]' : 'lg:grid-cols-[280px_1fr]'} gap-4 xl:gap-6 px-4 py-6 items-start`}>
          <LeftSidebar user={user} projectCount={projectCount} connectionCount={connectionCount} skillsData={skillsData} />
          <main className="min-h-screen pb-20">{children}</main>
          {isHome && <RightSidebar />}
        </div>
      </div>
    </div>
  )
}
