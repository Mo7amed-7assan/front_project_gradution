import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications, withdrawApplication } from '../services/applications'
import Spinner from '../components/Spinner'
import MyApplicationsUI from '../ui/pages/MyApplicationsUI'

// Robust extractor — handles multiple response shapes
function extractApplications(res) {
  const d = res?.data ?? res
  if (Array.isArray(d?.data?.data?.data)) return d.data.data.data
  if (Array.isArray(d?.data?.data))       return d.data.data
  if (Array.isArray(d?.data?.items))      return d.data.items
  if (Array.isArray(d?.data))             return d.data
  if (Array.isArray(d?.items))            return d.items
  if (Array.isArray(d?.applications))     return d.applications
  if (Array.isArray(d))                   return d
  return []
}

const APPLICATION_REFRESH_EVENT = 'applications:refresh'
const APPLICATION_STATUS_CACHE_KEY = 'my_application_statuses'

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-green-100  text-green-800',
  rejected:  'bg-red-100    text-red-800',
  withdrawn: 'bg-gray-100   text-gray-600',
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [page, setPage]                 = useState(1)
  const [totalPages, setTotalPages]     = useState(1)
  const [withdrawing, setWithdrawing]   = useState(null)
  const [notice, setNotice]             = useState(null)

  const fetchApps = async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await getMyApplications({ page })
      const list = extractApplications(res)
      setApplications(list)
      syncStatusNotification(list)

      // pagination
      const meta = res?.data?.data?.meta || res?.data?.meta || res?.data?.pagination || {}
      if (meta?.last_page)  setTotalPages(meta.last_page)
      else if (meta?.total && meta?.per_page) setTotalPages(Math.ceil(meta.total / meta.per_page))
    } catch (err) {
      console.error('MyApplications fetch error:', err)
      setError('Failed to load your applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApps() }, [page])

  useEffect(() => {
    const onRefresh = () => fetchApps()
    window.addEventListener(APPLICATION_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(APPLICATION_REFRESH_EVENT, onRefresh)
  }, [page])

  const syncStatusNotification = (list) => {
    try {
      const previous = JSON.parse(localStorage.getItem(APPLICATION_STATUS_CACHE_KEY) || '{}')
      const next = {}
      let changedRejected = null

      list.forEach((app) => {
        if (!app?.id) return
        const status = (app.status || 'pending').toLowerCase()
        next[app.id] = status
        if (previous[app.id] && previous[app.id] !== status && status === 'rejected') {
          changedRejected = app
        }
      })

      localStorage.setItem(APPLICATION_STATUS_CACHE_KEY, JSON.stringify(next))
      if (changedRejected) {
        const projectName = changedRejected.project?.title || changedRejected.project?.name || 'a project'
        setNotice(`Your application to ${projectName} was rejected.`)
      }
    } catch (err) {
      console.error('Failed to sync application status cache:', err)
    }
  }

  const handleWithdraw = async (id) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return
    setWithdrawing(id)
    try {
      await withdrawApplication(id)
      fetchApps()
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to withdraw application.'
      alert(message)
    } finally {
      setWithdrawing(null)
    }
  }

  // Role name — try multiple field paths
  const getRoleName = (a) =>
    a.role?.role_name ||
    a.role?.name ||
    a.role?.title ||
    a.proposed_role ||
    a.role_name ||
    '—'

  return (
    <MyApplicationsUI
      applications={applications}
      loading={loading}
      error={error}
      page={page}
      setPage={setPage}
      totalPages={totalPages}
      withdrawing={withdrawing}
      notice={notice}
      setNotice={setNotice}
      handleWithdraw={handleWithdraw}
      getRoleName={getRoleName}
      STATUS_STYLES={STATUS_STYLES}
    />
  )
}
