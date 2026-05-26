import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getVerificationById, claimVerification, escalateVerification, reviewVerification } from '../services/adminVerification'
import { useAuth } from '../context/AuthContext'

const statusMap = {
  pending:   { cls: 'badge-yellow', label: 'Pending',   icon: '⏳' },
  approved:  { cls: 'badge-green',  label: 'Approved',  icon: '✅' },
  rejected:  { cls: 'badge-red',    label: 'Rejected',  icon: '❌' },
  submitted: { cls: 'badge-blue',   label: 'Submitted', icon: '📤' },
}

function InfoRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  )
}

export default function AdminVerificationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [decision, setDecision] = useState('approve')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await getVerificationById(id)
      setData(res)
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to load verification' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [id, user?.id])

  const handleClaim = async () => {
    setProcessing(true)
    setMessage(null)
    try {
      await claimVerification(id)
      setMessage({ type: 'success', text: 'Verification claimed successfully.' })
      await fetch()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to claim verification.' })
    } finally {
      setProcessing(false)
    }
  }

  const handleEscalate = async () => {
    if (!confirm('Escalate this verification to admin review?')) return
    setProcessing(true)
    setMessage(null)
    try {
      await escalateVerification(id)
      setMessage({ type: 'success', text: 'Verification escalated.' })
      await fetch()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to escalate.' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReview = async () => {
    if (!decision) {
      setMessage({ type: 'error', text: 'Please select a decision.' })
      return
    }
    setProcessing(true)
    setMessage(null)
    try {
      let review_action = ''
      if (decision === 'approve') review_action = 'approved'
      else if (decision === 'reject') review_action = 'rejected'
      else if (decision === 'request_more_info') review_action = 'request_resubmission'

      const payload = {
        review_action,
        review_notes: notes || null
      }
      await reviewVerification(id, payload)
      navigate('/admin/verifications')
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to submit review' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!data) return <div className="p-8 text-rose-600 font-bold">Verification not found.</div>

  const status = data.status || data.verification_status || 'pending'
  const badge = statusMap[status.toLowerCase()] || { cls: 'badge-slate', label: status || 'Unknown', icon: '📋' }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/verifications" className="text-sm text-brand-primary font-bold flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Verifications
          </Link>
          <h1 className="page-title text-brand-secondary">Verification Review</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleClaim} disabled={processing} className="btn-secondary text-sm">Claim</button>
          <button onClick={handleEscalate} disabled={processing} className="btn-secondary text-sm border-amber-200 text-amber-700 hover:bg-amber-50">Escalate</button>
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
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Submission Details</h2>
              <span className={`badge ${badge.cls}`}>
                <span className="mr-1">{badge.icon}</span>{badge.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <InfoRow label="User">
                <Link to={`/admin/users/${data.user?.id || data.user_id}`} className="text-brand-primary hover:underline">
                  {data.user?.full_name || data.user?.name || data.user_id || 'Unknown User'}
                </Link>
              </InfoRow>
              <InfoRow label="Submitted At">
                {data.created_at || data.submitted_at ? new Date(data.created_at || data.submitted_at).toLocaleString() : 'Unknown'}
              </InfoRow>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Documents / Raw Data</p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto">
                <pre className="text-xs text-slate-700 font-mono">
                  {JSON.stringify(data.documents || data.liveness_check_data || data.payload || data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 border-brand-primary/30 shadow-md">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Submit Decision</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Review Action <span className="text-rose-500">*</span></label>
                <div className="space-y-2 mt-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${decision === 'approve' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input type="radio" name="decision" value="approve" checked={decision === 'approve'} onChange={(e) => setDecision(e.target.value)} className="text-emerald-500 focus:ring-emerald-500" />
                    <span className="font-bold text-slate-800">✅ Approve</span>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${decision === 'request_more_info' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input type="radio" name="decision" value="request_more_info" checked={decision === 'request_more_info'} onChange={(e) => setDecision(e.target.value)} className="text-amber-500 focus:ring-amber-500" />
                    <span className="font-bold text-slate-800">🔄 Request More Info</span>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${decision === 'reject' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input type="radio" name="decision" value="reject" checked={decision === 'reject'} onChange={(e) => setDecision(e.target.value)} className="text-rose-500 focus:ring-rose-500" />
                    <span className="font-bold text-slate-800">❌ Reject</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Review Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="Add notes for the user (required for rejection/more info)..."
                />
              </div>

              <button
                onClick={handleReview}
                disabled={processing}
                className={`w-full font-bold px-4 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50 flex justify-center items-center gap-2 text-white ${
                  decision === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                  decision === 'reject' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                  'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                }`}
              >
                {processing ? <Spinner /> : 'Submit Decision'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
