import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { restrictUser } from '../services/adminRestrictions'
import Spinner from '../components/Spinner'

const RESTRICTION_TYPES = [
  { value: 'messaging_ban',    label: 'Messaging Ban',    icon: '💬', desc: 'Cannot send or receive messages' },
  { value: 'posting_ban',      label: 'Posting Ban',      icon: '📝', desc: 'Cannot create or edit posts' },
  { value: 'application_ban',  label: 'Application Ban',  icon: '📋', desc: 'Cannot apply to projects' },
  { value: 'full_suspension',  label: 'Full Suspension',  icon: '🚫', desc: 'Complete account suspension' },
]

export default function AdminRestrictUser() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const queryUserId = searchParams.get('userId') || location.state?.userId || ''

  const [targetUserId, setTargetUserId] = useState(queryUserId)
  const [restrictionType, setRestrictionType] = useState('messaging_ban')
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setProcessing(true)
    try {
      const payload = {
        user_id: targetUserId.trim(),
        restriction_type: restrictionType,
        reason: reason.trim(),
      }
      if (duration && !isNaN(duration)) {
        payload.duration_hours = parseInt(duration)
      } else {
        payload.duration_hours = null
      }
      console.log('Sending restriction payload:', payload)
      await restrictUser(payload)
      navigate('/admin/restrictions')
    } catch (err) {
      console.error('API Error Response:', err?.response?.data)
      const errorMsg = err?.response?.data ? JSON.stringify(err.response.data) : (err?.message || 'Failed to restrict user')
      setError(errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title text-brand-secondary">Restrict a User</h1>
        <p className="page-subtitle">Apply a feature restriction to a specific user account.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Target User ID <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="form-input font-mono"
              placeholder="UUID of the user to restrict"
              required
            />
          </div>

          <div>
            <label className="form-label">Restriction Type <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {RESTRICTION_TYPES.map(rt => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => setRestrictionType(rt.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    restrictionType === rt.value
                      ? 'border-rose-400 bg-rose-50 shadow-sm shadow-rose-400/10'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <span className="text-2xl">{rt.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${restrictionType === rt.value ? 'text-rose-600' : 'text-slate-800'}`}>
                      {rt.label}
                    </p>
                    <p className="text-xs text-slate-500">{rt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Reason <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-input"
              placeholder="e.g. Spam, Harassment, TOS Violation"
              required
            />
          </div>

          <div>
            <label className="form-label">Duration (hours)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="form-input"
              placeholder="Leave empty for permanent restriction"
              min="1"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Restriction will auto-lift after this many hours. Leave empty for permanent.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/admin/restrictions')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-sm shadow-rose-500/20 disabled:opacity-50">
              {processing ? <Spinner /> : '🔒 Apply Restriction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
