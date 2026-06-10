import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createModeration } from '../services/adminModeration'
import Spinner from '../components/Spinner'

const ACTION_TYPES = [
  { value: 'warning',     label: 'Warning',     icon: '⚠️', desc: 'Formal warning issued to user' },
  { value: 'suspend',     label: 'Suspend',     icon: '⏸️', desc: 'Temporarily suspend account' },
  { value: 'ban',         label: 'Ban',         icon: '🚫', desc: 'Permanently ban from platform' },
  { value: 'restriction', label: 'Restriction', icon: '🔒', desc: 'Restrict specific feature access' },
  { value: 'note',        label: 'Note',        icon: '📝', desc: 'Internal moderation note' },
]

export default function AdminModerationLog() {
  const navigate = useNavigate()
  const [targetUserId, setTargetUserId] = useState('')
  const [actionType, setActionType] = useState('warning')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setProcessing(true)
    try {
      await createModeration({
        target_user_id: targetUserId.trim(),
        action_type: actionType,
        reason: reason.trim(),
        description: description.trim() || undefined,
        duration: duration ? parseInt(duration) : undefined,
      })
      navigate('/admin/moderation')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to log moderation action')
    } finally {
      setProcessing(false)
    }
  }

  const selectedAction = ACTION_TYPES.find(a => a.value === actionType)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title text-brand-secondary">Log Moderation Action</h1>
        <p className="page-subtitle">Record a moderation action against a platform user.</p>
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
              placeholder="UUID of the user to moderate"
              required
            />
          </div>

          <div>
            <label className="form-label">Action Type <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {ACTION_TYPES.map(action => (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => setActionType(action.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    actionType === action.value
                      ? 'border-brand-primary bg-brand-primaryLight/10 shadow-sm shadow-brand-primary/10'
                      : 'border-[var(--border-color)] hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${actionType === action.value ? 'text-brand-primary' : 'text-[var(--text-primary)]'}`}>
                      {action.label}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">{action.desc}</p>
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
              placeholder="e.g. Spam, Harassment, Misinformation"
              required
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              rows={4}
              placeholder="Detailed explanation of the moderation action..."
            />
          </div>

          {(actionType === 'suspend' || actionType === 'restriction') && (
            <div>
              <label className="form-label">Duration (days)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="form-input"
                placeholder="Leave empty for indefinite"
                min="1"
              />
              <p className="text-xs text-[var(--text-hint)] mt-1.5 font-medium">Leave empty for a permanent action.</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
            <button type="button" onClick={() => navigate('/admin/moderation')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="btn-primary flex-1 shadow-brand-primary/30">
              {processing ? <Spinner /> : `Log ${selectedAction?.label || 'Action'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
