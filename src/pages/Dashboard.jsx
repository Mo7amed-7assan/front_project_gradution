import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getNotifications } from '../services/notifications'
import { getMyApplications, withdrawApplication } from '../services/applications'
import { getMyProjects, getProjects } from '../services/project'
import { getCurrentUserId, getProjectOwnerId } from '../utils/projectAccess'
import DashboardUI from '../ui/pages/DashboardUI'

const APPLICATION_REFRESH_EVENT = 'applications:refresh'
const PROJECT_REFRESH_EVENT = 'projects:refresh'

function extractList(res) {
  const list = res?.data?.data || res?.data || []
  return Array.isArray(list) ? list : []
}

export default function Dashboard() {
  const { user } = useAuth()
  const displayName = user?.full_name || user?.name || user?.username || 'there'

  const [stats, setStats] = useState({ projects: 0, applications: 0, unread: 0 })
  const [recentProjects, setRecentProjects] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    skill: '',
    search: '',
    accepting_applications: '',
    sort: 'created_at'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)

  const loadProjects = async () => {
    setLoadingProjects(true)
    try {
      const params = { per_page: 100, ...filters }
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
      const projRes = await getProjects(params)
      if (projRes) {
        setAllProjects(extractList(projRes))
      }
    } catch (err) {
      console.error('Dashboard loadProjects error:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [filters, user])

  const load = async () => {
    setLoadingStats(true)
    try {
      const [mineProjRes, appRes, notifRes] = await Promise.allSettled([
        getMyProjects({ is_user_participant: true, role: 'owner', per_page: 50 }),
        getMyApplications({ per_page: 5 }),
        getNotifications(),
      ])

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
        const list = d?.data?.data?.data || d?.data?.data || d?.data || []
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

  useEffect(() => {
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

  const handleWithdraw = async (app) => {
    if (confirm('Withdraw this application?')) {
      try {
        await withdrawApplication(app.id)
        setMyApplications(prev => prev.filter(a => a.id !== app.id))
        setStats(s => ({ ...s, applications: s.applications - 1 }))
      } catch (err) {
        alert('Failed to withdraw application')
      }
    }
  }

  return (
    <DashboardUI
      displayName={displayName}
      stats={stats}
      allProjects={allProjects}
      recentProjects={recentProjects}
      myApplications={myApplications}
      loadingStats={loadingStats}
      loadingProjects={loadingProjects}
      onWithdraw={handleWithdraw}
      filters={filters}
      setFilters={setFilters}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
    />
  )
}
