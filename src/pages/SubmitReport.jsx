import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fileReport } from '../services/reports'
import { getUserById } from '../services/profile'
import { getProjectById } from '../services/project'
import Spinner from '../components/Spinner'

export default function SubmitReport() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  
  const reportedUserId = queryParams.get('userId') || ''
  const reportedProjectId = queryParams.get('projectId') || ''

  const [targetName, setTargetName] = useState('')
  const [targetLoading, setTargetLoading] = useState(false)
  const [reportType, setReportType] = useState('harassment')
  const [description, setDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadTarget() {
      if (!reportedUserId && !reportedProjectId) return
      setTargetLoading(true)
      try {
        if (reportedUserId) {
          const u = await getUserById(reportedUserId)
          const name = u?.data?.full_name || u?.data?.name || u?.data?.username || u?.full_name || u?.name || u?.username || 'User'
          setTargetName(`User: ${name}`)
        } else if (reportedProjectId) {
          const p = await getProjectById(reportedProjectId)
          const title = p?.title || p?.name || 'Project'
          setTargetName(`Project: ${title}`)
        }
      } catch (err) {
        console.error('Failed to load report target details', err)
        setTargetName(reportedUserId ? 'User' : 'Project')
      } finally {
        setTargetLoading(false)
      }
    }
    loadTarget()
  }, [reportedUserId, reportedProjectId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const evidenceArray = evidenceUrl.trim() 
        ? evidenceUrl.split(',').map(url => url.trim()).filter(url => url.length > 0)
        : []

      const payload = {
        report_type: reportType,
        description: description.trim(),
        evidence: evidenceArray.length > 0 ? evidenceArray : null,
      }

      if (reportedUserId) {
        payload.reported_user_id = reportedUserId
        payload.reported_content_type = null
        payload.reported_content_id = null
      } else if (reportedProjectId) {
        payload.reported_user_id = null
        payload.reported_content_type = 'project'
        payload.reported_content_id = reportedProjectId
      }

      await fileReport(payload)
      setSuccess(true)
      setTimeout(() => {
        navigate('/reports')
      }, 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to file report')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-800 text-center space-y-3 shadow-sm">
        <span className="text-4xl">✅</span>
        <h3 className="text-xl font-bold">Report Filed Successfully</h3>
        <p className="text-sm text-emerald-600">Thank you for helping keep Co-Found safe. Redirecting to your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title text-brand-secondary">File a Report</h1>
        <p className="page-subtitle">Submit a report to our safety and moderation team.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {(reportedUserId || reportedProjectId) && (
            <div>
              <label className="form-label">Report Target</label>
              {targetLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                  <Spinner /> Loading target details...
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl font-bold text-slate-800">
                  {targetName || (reportedUserId ? 'User' : 'Project')}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="form-label">Reason for Report <span className="text-rose-500">*</span></label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-select bg-slate-50"
              required
            >
              <option value="harassment">Harassment / Abuse</option>
              <option value="spam">Spam / Advertising</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="copyright">Copyright Violation</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="form-label">Description <span className="text-rose-500">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input bg-slate-50"
              rows={5}
              placeholder="Provide clear details about the violation. Be as specific as possible..."
              required
            />
          </div>

          <div>
            <label className="form-label">Evidence Links (Comma-separated URLs)</label>
            <input
              type="text"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="form-input bg-slate-50"
              placeholder="e.g. https://example.com/image1.png, https://example.com/image2.png"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              If you have screenshots or links to message logs/evidence, paste their URLs here separated by commas.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              {submitting ? <Spinner /> : '📤 Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
