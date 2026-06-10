import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getReport, updateReport, withdrawReport } from '../services/reports'
import Spinner from '../components/Spinner'

const statusMap = {
  pending:      { cls: 'badge-yellow', label: 'Pending',      icon: '⏳' },
  under_review: { cls: 'badge-blue',   label: 'Under Review', icon: '🔍' },
  resolved:     { cls: 'badge-green',  label: 'Resolved',     icon: '✅' },
  dismissed:    { cls: 'badge-slate',  label: 'Dismissed',    icon: '📋' },
  escalated:    { cls: 'badge-red',    label: 'Escalated',    icon: '⚠️' },
  withdrawn:    { cls: 'badge-slate',  label: 'Withdrawn',    icon: '📤' },
}

const getBadge = (status) => statusMap[`${status || 'pending'}`.toLowerCase()] || { cls: 'badge-slate', label: status || 'Unknown', icon: '📋' }

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [description, setDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [message, setMessage] = useState(null)

  const fetchDetails = async () => {
    setLoading(true)
    try {
      const res = await getReport(id)
      const report = res?.data?.data || res?.data || res
      setData(report)
      setDescription(report.description || '')
      if (Array.isArray(report.evidence)) {
        setEvidenceUrl(report.evidence.join(', '))
      } else if (typeof report.evidence === 'string') {
        setEvidenceUrl(report.evidence)
      } else {
        setEvidenceUrl('')
      }
    } catch (err) {
      console.error('Failed to load report detail', err)
      setMessage({ type: 'error', text: 'Failed to load report details.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setMessage(null)
    try {
      const evidenceArray = evidenceUrl.trim()
        ? evidenceUrl.split(',').map(url => url.trim()).filter(url => url.length > 0)
        : []

      const payload = {
        description: description.trim(),
        evidence: evidenceArray.length > 0 ? evidenceArray : null,
      }

      await updateReport(id, payload)
      setMessage({ type: 'success', text: 'Report updated successfully.' })
      setEditing(false)
      fetchDetails()
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to update report' })
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this report? This action cannot be undone.')) return
    setProcessing(true)
    setMessage(null)
    try {
      await withdrawReport(id)
      setMessage({ type: 'success', text: 'Report withdrawn successfully.' })
      fetchDetails()
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to withdraw report' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!data) return <div className="p-8 text-rose-600 font-bold">Report not found.</div>

  const status = data.status || 'pending'
  const badge = getBadge(status)
  const isWithdrawnOrResolved = ['resolved', 'dismissed', 'withdrawn'].includes(status.toLowerCase())
  const targetName = data.reported_user?.full_name || data.reported_user?.name || data.reported_user?.username || (data.reported_content_type === 'project' ? 'Project' : 'Unknown Target')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link to="/reports" className="text-sm text-brand-primary font-bold flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to My Reports
          </Link>
          <h1 className="page-title text-brand-secondary">Report Detail</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isWithdrawnOrResolved && (
            <>
              <button
                onClick={() => setEditing(!editing)}
                className="btn-secondary text-sm"
              >
                {editing ? 'Cancel' : 'Edit Evidence'}
              </button>
              <button
                onClick={handleWithdraw}
                disabled={processing}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                Withdraw Report
              </button>
            </>
          )}
          <span className={`badge ${badge.cls}`}>
            <span className="mr-1">{badge.icon}</span>{badge.label}
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-4 md:p-6 w-full">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 capitalize">{data.report_type?.replaceAll('_', ' ')} Report</h2>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-input bg-[var(--bg-hover)]"
                    rows={5}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Evidence Links (Comma-separated URLs)</label>
                  <input
                    type="text"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="form-input bg-[var(--bg-hover)]"
                    placeholder="URLs separated by commas"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1 py-2 text-sm">Discard</button>
                  <button type="submit" disabled={processing} className="btn-primary flex-1 py-2 text-sm">
                    {processing ? <Spinner /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-1">Reported Target</p>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {data.reported_user?.id ? (
                        <Link to={`/users/${data.reported_user.id}`} className="text-rose-600 hover:underline">
                          User: {targetName}
                        </Link>
                      ) : data.reported_content_id && data.reported_content_type === 'project' ? (
                        <Link to={`/projects/${data.reported_content_id}`} className="text-brand-primary hover:underline">
                          Project: {targetName}
                        </Link>
                      ) : (
                        targetName
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-1">Submitted At</p>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {data.created_at || data.submitted_at ? new Date(data.created_at || data.submitted_at).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-2">Description / Content</p>
                  <div className="p-4 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] whitespace-pre-wrap text-sm leading-relaxed">
                    {data.description || 'No description provided.'}
                  </div>
                </div>

                {data.evidence && (Array.isArray(data.evidence) ? data.evidence.length > 0 : data.evidence.trim().length > 0) && (
                  <div>
                    <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-2">Evidence Provided</p>
                    <div className="space-y-1">
                      {(Array.isArray(data.evidence) ? data.evidence : data.evidence.split(',')).map((url, idx) => (
                        <a
                          key={idx}
                          href={url.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-brand-primary font-semibold hover:underline truncate"
                        >
                          🔗 {url.trim()}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resolution Details Card */}
          {status.toLowerCase() === 'resolved' && (
            <div className="card p-6 border-l-4 border-l-emerald-500 bg-emerald-50/20">
              <h3 className="text-base font-black text-emerald-800 flex items-center gap-2 mb-4">
                ✅ Report Resolution Decision
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-1">Action Taken</p>
                    <div className="text-sm font-bold text-emerald-700 capitalize">
                      {data.resolution_action || 'Resolved'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-1">Resolved At</p>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {data.resolved_at ? new Date(data.resolved_at).toLocaleString() : 'Recently'}
                    </div>
                  </div>
                </div>
                {data.resolution_notes && (
                  <div>
                    <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-1.5">Resolution Notes</p>
                    <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-slate-200/60 text-xs text-[var(--text-secondary)] font-medium">
                      {data.resolution_notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-4 md:p-6 w-full">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Report Status</h3>
            <div className="space-y-4 text-sm text-[var(--text-secondary)]">
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="font-semibold">Priority</span>
                <span className="capitalize font-bold text-[var(--text-primary)]">{data.priority || 'Medium'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="font-semibold">Status</span>
                <span className="capitalize font-bold text-[var(--text-primary)]">{data.status || 'Pending'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Assigned Reviewer</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {data.assigned_to?.full_name || data.assigned_to?.name || 'Moderation Team'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
