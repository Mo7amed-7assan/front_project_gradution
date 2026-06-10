import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProjectApplications, getMyApplications, reviewApplication } from '../services/applications'
import { getProjectTeam } from '../services/project'
import Spinner from '../components/Spinner'
import ProjectApplicationsUI from '../ui/pages/ProjectApplicationsUI'

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
  withdrawn: 'bg-[var(--bg-hover)]   text-[var(--text-secondary)]',
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
    <ProjectApplicationsUI
      id={id}
      applications={applications}
      loading={loading}
      error={error}
      reviewing={reviewing}
      handleReview={handleReview}
      getRoleName={getRoleName}
      getApplicantName={getApplicantName}
      isReviewing={isReviewing}
      pendingCount={pendingCount}
      STATUS_STYLES={STATUS_STYLES}
    />
  )
}
