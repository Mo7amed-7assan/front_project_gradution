import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { restrictUser } from '../services/adminRestrictions'
import { useAuth } from '../context/AuthContext'

export default function AdminRestrictUser() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [targetUserId, setTargetUserId] = useState('')
  const [restrictionType, setRestrictionType] = useState('messaging')
  const [reason, setReason] = useState('')
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
        restriction_type: restrictionType,
        reason: reason.trim(),
      }
      if (duration) {
        payload.expires_at = new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString()
      }
      await restrictUser(payload)
      alert('User restricted successfully')
      navigate('/admin/restrictions')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to restrict user')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-semibold mb-6">Restrict a User</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Target User ID *</label>
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="UUID of the user to restrict"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Restriction Type *</label>
          <select value={restrictionType} onChange={(e) => setRestrictionType(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
            <option value="messaging">Messaging</option>
            <option value="posting">Posting</option>
            <option value="applications">Applications</option>
            <option value="matching">Matching</option>
            <option value="comments">Comments</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Select which feature this user cannot access</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason *</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="e.g. Spam, Harassment, TOS Violation"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Leave empty for permanent restriction"
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">Restriction will auto-lift after this many days</p>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {processing ? 'Restricting...' : 'Restrict User'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/restrictions')}
            className="px-4 py-2 bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
