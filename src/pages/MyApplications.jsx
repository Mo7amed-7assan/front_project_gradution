import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyApplications, withdrawApplication } from '../services/applications'
import Spinner from '../components/Spinner'

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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
          <p className="text-sm text-gray-500 mt-1">Track the status of your project applications</p>
        </div>
        <Link to="/projects" className="text-sm text-indigo-600 hover:underline font-medium">
          Browse Projects →
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {notice && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between gap-4">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-red-700 hover:underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm mt-1">Find a project you love and apply for a role.</p>
          <Link to="/projects" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            Explore Projects
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map(a => {
              const statusKey  = (a.status || 'pending').toLowerCase()
              const statusClass = STATUS_STYLES[statusKey] || 'bg-gray-100 text-gray-600'
              const roleName   = getRoleName(a)
              const canWithdraw = statusKey === 'pending'

              return (
                <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Project name */}
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        {a.project?.title || a.project?.name || 'Project'}
                      </h3>

                      {/* Role */}
                      <div className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">Role:</span>{' '}
                        <span className="text-gray-800">{roleName}</span>
                      </div>

                      {/* Applied date */}
                      <div className="mt-0.5 text-xs text-gray-400">
                        Applied: {a.applied_at ? new Date(a.applied_at).toLocaleString() : new Date(a.created_at).toLocaleString()}
                      </div>

                      {/* Cover message */}
                      {a.cover_message && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 italic">
                          "{a.cover_message}"
                        </p>
                      )}
                    </div>

                    {/* Status + actions */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass}`}>
                        {a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending'}
                      </span>

                      {a.project?.id && (
                        <Link
                          to={`/projects/${a.project.id}`}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          View Project
                        </Link>
                      )}

                      {canWithdraw && (
                        <button
                          onClick={() => handleWithdraw(a.id)}
                          disabled={withdrawing === a.id}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
                        >
                          {withdrawing === a.id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
