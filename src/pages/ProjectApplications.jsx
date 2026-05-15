import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProjectApplications, getMyApplications, reviewApplication } from '../services/applications'
import { getProjectTeam } from '../services/project'
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
  if (Array.isArray(d?.team))             return d.team
  if (Array.isArray(d))                   return d
  return []
}

const APPLICATION_REFRESH_EVENT = 'applications:refresh'

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-green-100  text-green-800',
  rejected:  'bg-red-100    text-red-800',
  withdrawn: 'bg-gray-100   text-gray-500',
}

export default function ProjectApplications() {
  const { id } = useParams()
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [reviewing, setReviewing]       = useState(null) // { appId, status }

  const fetchApps = async () => {
    setLoading(true)
    setError(null)
    try {
      const res  = await getProjectApplications(id)
      const list = extractApplications(res)
      setApplications(list)
    } catch (err) {
      console.error('ProjectApplications fetch error:', err)
      setError('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (id) fetchApps() }, [id])

  useEffect(() => {
    const onRefresh = (event) => {
      const projectId = event.detail?.projectId
      if (!projectId || `${projectId}` === `${id}`) fetchApps()
    }
    window.addEventListener(APPLICATION_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(APPLICATION_REFRESH_EVENT, onRefresh)
  }, [id])

  const handleReview = async (applicationId, status) => {
    const label = status === 'accepted' ? 'Accept' : 'Reject'
    if (!confirm(`${label} this application?`)) return
    
    const feedback = status === 'rejected' ? prompt('Optional feedback for rejection:') : ''
    setReviewing({ appId: applicationId, status })
    
    try {
      await reviewApplication(id, applicationId, { status, feedback: feedback || undefined })
      if (status === 'accepted') await getProjectTeam(id)
      await Promise.allSettled([
        fetchApps(),
        getMyApplications({ per_page: 100 }),
      ])
      window.dispatchEvent(new CustomEvent(APPLICATION_REFRESH_EVENT, { detail: { projectId: id, applicationId, status } }))
    } catch (err) {
      const message = err.response?.data?.message || `Failed to ${label.toLowerCase()} application.`
      alert(message)
    } finally {
      setReviewing(null)
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

  // Applicant name
  const getApplicantName = (a) =>
    a.applicant?.full_name ||
    a.applicant?.name ||
    a.applicant?.username ||
    a.user?.full_name ||
    a.user?.username ||
    'Applicant'

  const isReviewing = (appId, status) =>
    reviewing?.appId === appId && reviewing?.status === status

  const pendingCount = applications.filter(a => (a.status || '').toLowerCase() === 'pending').length

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Applications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {pendingCount > 0
              ? `${pendingCount} pending application${pendingCount !== 1 ? 's' : ''} awaiting review`
              : 'All applications have been reviewed'}
          </p>
        </div>
        <Link to={`/projects/${id}`} className="text-sm text-indigo-600 hover:underline font-medium">
          ← Back to Project
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm mt-1">Applications will appear here when people apply for roles.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(a => {
            const statusKey   = (a.status || 'pending').toLowerCase()
            const statusClass = STATUS_STYLES[statusKey] || 'bg-gray-100 text-gray-600'
            const roleName    = getRoleName(a)
            const applicant   = getApplicantName(a)
            const isPending   = statusKey === 'pending'

            return (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Left — applicant info */}
                  <div className="flex-1 min-w-0">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {applicant.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{applicant}</div>
                        {a.applicant?.email && (
                          <div className="text-xs text-gray-400">{a.applicant.email}</div>
                        )}
                      </div>
                    </div>

                    {/* Role applied for */}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Role:</span>{' '}
                      <span className="text-gray-800">{roleName}</span>
                    </div>

                    {/* Applied date */}
                    <div className="mt-0.5 text-xs text-gray-400">
                      Applied: {a.applied_at
                        ? new Date(a.applied_at).toLocaleString()
                        : (a.created_at ? new Date(a.created_at).toLocaleString() : '—')}
                    </div>

                    {/* Cover message */}
                    {a.cover_message && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 italic">
                        "{a.cover_message}"
                      </p>
                    )}
                  </div>

                  {/* Right — status + actions */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass}`}>
                      {a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending'}
                    </span>

                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(a.id, 'accepted')}
                          disabled={!!reviewing}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                        >
                          {isReviewing(a.id, 'accepted') ? '...' : '✓ Accept'}
                        </button>
                        <button
                          onClick={() => handleReview(a.id, 'rejected')}
                          disabled={!!reviewing}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                        >
                          {isReviewing(a.id, 'rejected') ? '...' : '✕ Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
