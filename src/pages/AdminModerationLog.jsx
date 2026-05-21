import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createModeration } from '../services/adminModeration'
import { useAuth } from '../context/AuthContext'

export default function AdminModerationLog() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [targetUserId, setTargetUserId] = useState('')
  const [actionType, setActionType] = useState('warning')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!targetUserId.trim()) {
      alert('Please enter the target user ID')
      return
    }
    if (!reason.trim()) {
      alert('Please enter a reason')
      return
    }

    setProcessing(true)
    try {
      const payload = {
        target_user_id: targetUserId.trim(),
        action_type: actionType,
        reason: reason.trim(),
        description: description.trim() || undefined,
        duration: duration ? parseInt(duration) : undefined,
      }
      await createModeration(payload)
      alert('Moderation action logged successfully')
      navigate('/admin/moderation')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to log moderation action')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-semibold mb-6">Log Moderation Action</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Target User ID *</label>
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="UUID of the user to moderate"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Action Type *</label>
          <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
            <option value="warning">Warning</option>
            <option value="suspend">Suspend</option>
            <option value="ban">Ban</option>
            <option value="restriction">Restriction</option>
            <option value="note">Note</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason *</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="e.g. Spam, Harassment, Misinformation"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            rows={4}
            placeholder="Detailed explanation of the moderation action"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Leave empty for indefinite (if applicable)"
            min="1"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {processing ? 'Logging...' : 'Log Action'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/moderation')}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
