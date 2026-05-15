import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../services/notifications'
import { getMyApplications, withdrawApplication } from '../services/applications'
import { getMyProjects, getProjects } from '../services/project'
import { getCurrentUserId, getProjectOwnerId } from '../utils/projectAccess'

const APPLICATION_REFRESH_EVENT = 'applications:refresh'
const PROJECT_REFRESH_EVENT = 'projects:refresh'

function extractList(res) {
  const list = res?.data?.data || res?.data || []
  return Array.isArray(list) ? list : []
}

function StatCard({ label, value, icon, to, color }) {
  return (
    <Link to={to} className={`block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`text-4xl opacity-80`}>{icon}</div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const displayName = user?.full_name || user?.name || user?.username || 'there'

  const [stats, setStats] = useState({ projects: 0, applications: 0, unread: 0 })
  const [recentProjects, setRecentProjects] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true)
      try {
        const [projRes, mineProjRes, appRes, notifRes] = await Promise.allSettled([
          getProjects({ per_page: 100 }),
          getMyProjects({ is_user_participant: true, role: 'owner', per_page: 50 }),
          getMyApplications({ per_page: 5 }),
          getNotifications(),
        ])

        // Projects
        let allProjects = []
        if (projRes.status === 'fulfilled') {
          allProjects = extractList(projRes.value)

          console.log('Current User:', getCurrentUserId(user))
          allProjects.forEach(p => console.log('Project Owner:', getProjectOwnerId(p)))
        }

        const mineProjects = mineProjRes.status === 'fulfilled' ? extractList(mineProjRes.value) : []

        // Applications
        let acceptedApplicationProjects = []
        if (appRes.status === 'fulfilled') {
          const list = extractList(appRes.value)
          if (Array.isArray(list)) {
            setMyApplications(list.slice(0, 5)) // Keep recent 5
            setStats(s => ({ ...s, applications: list.length }))
            acceptedApplicationProjects = list
              .filter(app => (app.status || '').toLowerCase() === 'accepted' && app.project)
              .map(app => ({ ...app.project, id: app.project.id || app.project_id, member_status: 'accepted' }))
          }
        }

        if (mineProjRes.status === 'fulfilled' || mineProjects.length > 0) {
          const projectsById = new Map([...mineProjects, ...acceptedApplicationProjects].map((p) => [p.id, p]))
          setRecentProjects(Array.from(projectsById.values()).slice(0, 3))
          setStats(s => ({ ...s, projects: projectsById.size }))
        }

        // Notifications unread
        if (notifRes.status === 'fulfilled') {
          const d = notifRes.value?.data
          const list =
            d?.data?.data?.data || d?.data?.data || d?.data || []
          const unread = Array.isArray(list)
            ? list.filter(n => !(n.read_at || n.read || n.is_read)).length
            : 0
          setStats(s => ({ ...s, unread }))
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoadingStats(false)
      }
    }
    load()

    const onApplicationRefresh = () => load()
    const onProjectRefresh = () => load()
    window.addEventListener(APPLICATION_REFRESH_EVENT, onApplicationRefresh)
    window.addEventListener(PROJECT_REFRESH_EVENT, onProjectRefresh)
    return () => {
      window.removeEventListener(APPLICATION_REFRESH_EVENT, onApplicationRefresh)
      window.removeEventListener(PROJECT_REFRESH_EVENT, onProjectRefresh)
    }
  }, [user])

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {displayName} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your co-founding journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="My Projects"
          value={loadingStats ? '…' : stats.projects}
          icon="📁"
          to="/my-projects"
          color="text-indigo-600"
        />
        <StatCard
          label="My Applications"
          value={loadingStats ? '…' : stats.applications}
          icon="📋"
          to="/applications/mine"
          color="text-emerald-600"
        />
        <StatCard
          label="Unread Notifications"
          value={loadingStats ? '…' : stats.unread}
          icon="🔔"
          to="/notifications"
          color="text-amber-600"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent projects */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">My Recent Projects</h3>
            <Link to="/my-projects" className="text-xs text-indigo-600 hover:underline">View all →</Link>
          </div>
          {loadingStats ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No projects yet.</p>
              <Link to="/projects/create" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                Create your first project →
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentProjects.map(p => (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800 truncate">{p.title || p.name}</span>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">{p.status || 'open'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/projects/create', label: 'Create Project', icon: '➕', color: 'bg-indigo-50 text-indigo-700' },
              { to: '/projects',        label: 'Find Projects',  icon: '🔍', color: 'bg-blue-50 text-blue-700' },
              { to: '/connections',     label: 'My Network',     icon: '🤝', color: 'bg-teal-50 text-teal-700' },
              { to: '/notifications',   label: 'Notifications',  icon: '🔔', color: 'bg-amber-50 text-amber-700' },
              { to: '/profile',         label: 'Edit Profile',   icon: '👤', color: 'bg-gray-50 text-gray-700' },
              { to: '/messages',        label: 'Messages',       icon: '💬', color: 'bg-purple-50 text-purple-700' },
            ].map(({ to, label, icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${color} hover:opacity-80 transition-opacity`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* My Sent Applications */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">My Sent Applications</h3>
          <Link to="/applications/mine" className="text-xs text-indigo-600 hover:underline">View all →</Link>
        </div>
        {loadingStats ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : myApplications.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm">No applications sent yet.</p>
            <Link to="/projects" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
              Browse projects to apply →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {myApplications.map(app => (
              <li key={app.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <Link to={`/projects/${app.project_id}`} className="text-sm font-medium text-gray-800 hover:underline">
                    {app.project?.title || app.project_title || `Project ${app.project_id}`}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: <span className={`font-medium ${
                      app.status === 'accepted' ? 'text-green-600' :
                      app.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>{app.status || 'pending'}</span>
                  </p>
                </div>
                {app.status === 'pending' && (
                  <button
                    onClick={async () => {
                      if (confirm('Withdraw this application?')) {
                        try {
                          await withdrawApplication(app.id)
                          setMyApplications(prev => prev.filter(a => a.id !== app.id))
                          setStats(s => ({ ...s, applications: s.applications - 1 }))
                        } catch (err) {
                          alert('Failed to withdraw application')
                        }
                      }
                    }}
                    className="text-xs text-red-600 hover:underline ml-2"
                  >
                    Withdraw
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
