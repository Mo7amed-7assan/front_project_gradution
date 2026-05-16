import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getNotificationPreferences,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences
} from '../services/notifications'
import { respondToConnection } from '../services/connections'

const CONNECTION_REFRESH_EVENT = 'connections:refresh'

const TYPE_LABELS = {
  new_application: 'New Application',
  application_accepted: 'Application Accepted',
  application_rejected: 'Application Rejected',
  project_update: 'Project Update',
  team_invite: 'Team Invitation',
  message: 'New Message',
  connection_request: 'Connection Request',
}

const TYPE_COLORS = {
  new_application: 'bg-blue-100 text-blue-800',
  application_accepted: 'bg-green-100 text-green-800',
  application_rejected: 'bg-red-100 text-red-800',
  project_update: 'bg-yellow-100 text-yellow-800',
  team_invite: 'bg-purple-100 text-purple-800',
  message: 'bg-gray-100 text-gray-800',
  connection_request: 'bg-teal-100 text-teal-800',
}

const DEFAULT_PREFERENCES = {
  platform_notifications: true,
  email_notifications: false,
  push_notifications: true,
  notification_digest: 'immediate',
  quiet_hours_start: '',
  quiet_hours_end: '',
  quiet_hours_timezone: '',
  preferences: {},
}

// Extract project id from notification — handles multiple field shapes
function getProjectId(n) {
  return n.project_id || n.data?.project_id || n.meta?.project_id || null
}

// Extract the notifications array from multiple API response shapes
function extractNotifications(res) {
  const d = res?.data
  // shape: { data: { data: { data: [...] } } }  ← confirmed by task description
  if (Array.isArray(d?.data?.data?.data)) return d.data.data.data
  // shape: { data: { data: [...] } }
  if (Array.isArray(d?.data?.data)) return d.data.data
  // shape: { data: { data: { items: [...] } } }
  if (Array.isArray(d?.data?.data?.items)) return d.data.data.items
  // shape: { data: [...] }
  if (Array.isArray(d?.data)) return d.data
  // shape: { data: { items: [...] } }
  if (Array.isArray(d?.items)) return d.items
  // raw array
  if (Array.isArray(d)) return d
  return []
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [loadingPreferences, setLoadingPreferences] = useState(true)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [error, setError] = useState(null)
  const [preferenceMessage, setPreferenceMessage] = useState(null)
  const [respondingTo, setRespondingTo] = useState(null)

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getNotifications()
      const list = extractNotifications(res)
      setNotifications(list)
    } catch (err) {
      console.error('Notifications fetch error:', err)
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    setLoadingPreferences(true)
    setPreferenceMessage(null)
    try {
      const data = await getNotificationPreferences()
      setPreferences({ ...DEFAULT_PREFERENCES, ...(data || {}) })
    } catch (err) {
      setPreferenceMessage(err?.response?.data?.message || 'Failed to load notification preferences.')
    } finally {
      setLoadingPreferences(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchPreferences()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString(), read: true, is_read: true } : n))
    } catch (err) {
      console.error('Mark-as-read error:', err)
    }
  }

  const handleConnectionResponse = async (connectionId, status) => {
    setRespondingTo(connectionId)
    try {
      await respondToConnection(connectionId, status)
      window.dispatchEvent(new CustomEvent(CONNECTION_REFRESH_EVENT))
      // Remove the notification after responding
      setNotifications(prev => prev.filter(n => n.data?.connection_id !== connectionId))
    } catch (err) {
      console.error('Connection response error:', err)
      alert('Failed to respond to connection request')
    } finally {
      setRespondingTo(null)
    }
  }

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString(), read: true, is_read: true })))
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark all notifications as read.')
    }
  }

  const isRead = (n) => !!(n.read_at || n.read || n.is_read)

  const unreadCount = notifications.filter(n => !isRead(n)).length

  const updatePreferenceField = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  const handleSavePreferences = async () => {
    setSavingPreferences(true)
    setPreferenceMessage(null)
    try {
      const payload = {
        ...preferences,
        quiet_hours_start: preferences.quiet_hours_start || '',
        quiet_hours_end: preferences.quiet_hours_end || '',
        quiet_hours_timezone: preferences.quiet_hours_timezone || '',
        preferences: preferences.preferences || {},
      }
      const updated = await updateNotificationPreferences(payload)
      setPreferences({ ...DEFAULT_PREFERENCES, ...(updated || payload) })
      setPreferenceMessage('Notification preferences saved.')
    } catch (err) {
      setPreferenceMessage(err?.response?.data?.message || 'Failed to save notification preferences.')
    } finally {
      setSavingPreferences(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-500">Control how and when you receive notifications.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchPreferences}
              disabled={loadingPreferences || savingPreferences}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {loadingPreferences ? 'Loading...' : 'Load Preferences'}
            </button>
            <button
              onClick={handleSavePreferences}
              disabled={savingPreferences || loadingPreferences}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {savingPreferences ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {preferenceMessage && (
          <div className={`mb-4 text-sm ${preferenceMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {preferenceMessage}
          </div>
        )}

        {loadingPreferences ? (
          <p className="text-sm text-gray-500">Loading preferences...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <span className="text-sm font-medium text-gray-700">Platform notifications</span>
              <input
                type="checkbox"
                checked={!!preferences.platform_notifications}
                onChange={(e) => updatePreferenceField('platform_notifications', e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <span className="text-sm font-medium text-gray-700">Email notifications</span>
              <input
                type="checkbox"
                checked={!!preferences.email_notifications}
                onChange={(e) => updatePreferenceField('email_notifications', e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <span className="text-sm font-medium text-gray-700">Push notifications</span>
              <input
                type="checkbox"
                checked={!!preferences.push_notifications}
                onChange={(e) => updatePreferenceField('push_notifications', e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Digest</label>
              <select
                value={preferences.notification_digest || 'immediate'}
                onChange={(e) => updatePreferenceField('notification_digest', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiet hours start</label>
              <input
                type="time"
                value={preferences.quiet_hours_start || ''}
                onChange={(e) => updatePreferenceField('quiet_hours_start', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiet hours end</label>
              <input
                type="time"
                value={preferences.quiet_hours_end || ''}
                onChange={(e) => updatePreferenceField('quiet_hours_end', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiet hours timezone</label>
              <input
                type="text"
                value={preferences.quiet_hours_timezone || ''}
                onChange={(e) => updatePreferenceField('quiet_hours_timezone', e.target.value)}
                placeholder="Africa/Cairo"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">You'll see updates here when something happens.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map(n => {
            const read = isRead(n)
            const projectId = getProjectId(n)
            const label = TYPE_LABELS[n.type] || n.type || 'Notification'
            const colorClass = TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-800'

            return (
              <li
                key={n.id}
                className={`p-4 rounded-xl border transition-all ${read ? 'bg-white border-gray-100' : 'bg-indigo-50 border-indigo-200 shadow-sm'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Type Badge */}
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${colorClass}`}>
                      {label}
                    </span>

                    {/* Title / Message */}
                    {n.type === 'new_application' && projectId ? (
                      <p className="font-medium text-gray-900">
                        You have a new application.{' '}
                        <Link
                          to={`/projects/${projectId}/applications`}
                          className="text-indigo-600 hover:underline"
                        >
                          View Applications →
                        </Link>
                      </p>
                    ) : n.type === 'connection_request' ? (
                      <div>
                        <p className="font-medium text-gray-900">
                          {n.data?.requester?.full_name || 'Someone'} wants to connect with you.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleConnectionResponse(n.data?.connection_id, 'accepted')}
                            disabled={respondingTo === n.data?.connection_id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                          >
                            {respondingTo === n.data?.connection_id ? '...' : '✓ Accept'}
                          </button>
                          <button
                            onClick={() => handleConnectionResponse(n.data?.connection_id, 'rejected')}
                            disabled={respondingTo === n.data?.connection_id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                          >
                            {respondingTo === n.data?.connection_id ? '...' : '✕ Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900">{n.title || n.subject || label}</p>
                    )}

                    {/* Body message */}
                    {n.message && (
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                    )}
                    {n.body && !n.message && (
                      <p className="text-sm text-gray-600 mt-1">{n.body}</p>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 mt-2">
                      {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!read && (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" title="Unread" />
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-xs text-indigo-600 hover:underline whitespace-nowrap"
                        >
                          Mark read
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
