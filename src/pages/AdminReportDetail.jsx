import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getReportById, updateReport } from '../services/adminReports'
import { useAuth } from '../context/AuthContext'

const statusMap = {
  pending:      { cls: 'badge-yellow', label: 'Pending' },
  under_review: { cls: 'badge-blue',   label: 'Under Review' },
  resolved:     { cls: 'badge-green',  label: 'Resolved' },
  dismissed:    { cls: 'badge-slate',  label: 'Dismissed' },
  escalated:    { cls: 'badge-red',    label: 'Escalated' },
  withdrawn:    { cls: 'badge-slate',  label: 'Withdrawn' },
}

function InfoRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  )
}

export default function AdminReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [resolutionAction, setResolutionAction] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [message, setMessage] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await getReportById(id)
      setData(res)
      setStatus(res.status || '')
      setPriority(res.priority || 'medium')
      setAssignedTo(res.assigned_to?.id || res.assigned_to_id || '')
      setResolutionAction(res.resolution_action || '')
      setResolutionNotes(res.resolution_notes || '')
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to load report' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [id, user?.id])

  const handleUpdate = async () => {
    setProcessing(true)
    setMessage(null)
    try {
      const payload = {
        status: status || undefined,
        priority: priority || undefined,
        assigned_to: assignedTo || null,
        resolution_action: resolutionAction || undefined,
        resolution_notes: resolutionNotes || undefined,
      }
      await updateReport(id, payload)
      setMessage({ type: 'success', text: 'Report updated successfully.' })
      await fetch()
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to update report' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!data) return <div className="p-8 text-rose-600 font-bold">Report not found.</div>

  const badge = statusMap[`${data.status || ''}`.toLowerCase()] || { cls: 'badge-slate', label: data.status || 'Unknown' }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/reports" className="text-sm text-brand-primary font-bold flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Reports
          </Link>
          <h1 className="page-title text-brand-secondary">Report Detail</h1>
        </div>
        <div className="flex items-center gap-2">
          {data.reported_user?.id && (
            <Link
              to={`/admin/restrict-user?userId=${data.reported_user.id}`}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-rose-500/20"
            >
              🔒 Restrict Reported User
            </Link>
          )}
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{data.title || data.subject || 'Report'}</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <InfoRow label="Reported By">
                {data.reporter?.id ? (
                  <Link to={`/admin/users/${data.reporter.id}`} className="text-brand-primary font-bold hover:underline">
                    {data.reporter.full_name || data.reporter.name || data.reporter.username || data.reporter_id}
                  </Link>
                ) : (
                  <span className="text-slate-500 font-semibold">{data.reporter_id || 'Unknown'}</span>
                )}
              </InfoRow>
              <InfoRow label="Reported User / Target">
                {data.reported_user?.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/users/${data.reported_user.id}`} className="text-rose-600 font-bold hover:underline">
                      {data.reported_user.full_name || data.reported_user.name || data.reported_user.username || data.reported_user.id}
                    </Link>
                    <Link
                      to={`/admin/restrict-user?userId=${data.reported_user.id}`}
                      className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-lg border border-rose-200 transition-colors ml-1"
                    >
                      🛡️ Restrict
                    </Link>
                  </div>
                ) : (
                  <span className="text-slate-500 font-semibold">{data.target_id || 'Unknown'}</span>
                )}
              </InfoRow>
              <InfoRow label="Report Type">
                {data.report_type || data.reason || 'Unknown'}
              </InfoRow>
              <InfoRow label="Submitted At">
                {data.created_at || data.submitted_at ? new Date(data.created_at || data.submitted_at).toLocaleString() : 'Unknown'}
              </InfoRow>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Content</p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap">
                {data.description || data.content || 'No description provided.'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Manage Report</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select bg-slate-50">
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="escalated">Escalated</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="form-label">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-select bg-slate-50">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="form-label">Assigned To (User ID)</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="form-input font-mono bg-slate-50"
                  placeholder="Leave empty if not assigned"
                />
              </div>

              <div>
                <label className="form-label">Resolution Action</label>
                <input
                  type="text"
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="form-input bg-slate-50"
                  placeholder="e.g. Banned user, Dismissed"
                />
              </div>

              <div>
                <label className="form-label">Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="form-input bg-slate-50"
                  rows={4}
                  placeholder="Notes visible only to admins..."
                />
              </div>

              <button onClick={handleUpdate} disabled={processing} className="btn-primary w-full shadow-brand-primary/20">
                {processing ? <Spinner /> : 'Update Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
