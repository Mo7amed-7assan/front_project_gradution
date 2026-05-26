import React, { useEffect, useState } from 'react'
import {
  getNotificationPreferences, getNotifications,
  markAllNotificationsAsRead, markNotificationAsRead,
  updateNotificationPreferences
} from '../services/notifications'
import { respondToConnection } from '../services/connections'
import NotificationsUI from '../ui/pages/NotificationsUI'

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

const TYPE_STYLES = {
  new_application:      'badge-blue',
  application_accepted: 'badge-green',
  application_rejected: 'badge-red',
  project_update:       'badge-yellow',
  team_invite:          'badge-indigo',
  message:              'badge-slate',
  connection_request:   'bg-teal-100 text-teal-700 badge',
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

function getProjectId(n) {
  return n.project_id || n.data?.project_id || n.meta?.project_id || null
}

function extractNotifications(res) {
  const d = res?.data
  if (Array.isArray(d?.data?.data?.data)) return d.data.data.data
  if (Array.isArray(d?.data?.data)) return d.data.data
  if (Array.isArray(d?.data?.data?.items)) return d.data.data.items
  if (Array.isArray(d?.data)) return d.data
  if (Array.isArray(d?.items)) return d.items
  if (Array.isArray(d)) return d
  return []
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  const [loadingPreferences, setLoadingPreferences] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [preferenceMessage, setPreferenceMessage] = useState(null)
  const [respondingTo, setRespondingTo] = useState(null)
  const [showPrefs, setShowPrefs] = useState(false)

  const isRead = (n) => n.read_at || n.is_read || n.read
  const unreadCount = notifications.filter((n) => !isRead(n)).length

  const notifyConnectionRefresh = () => {
    window.dispatchEvent(new CustomEvent(CONNECTION_REFRESH_EVENT))
  }

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getNotifications()
      setNotifications(extractNotifications(res))
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    setLoadingPreferences(true)
    try {
      const res = await getNotificationPreferences()
      const data = res?.data?.data || res?.data || res
      setPreferences({ ...DEFAULT_PREFERENCES, ...data })
    } catch (err) {
      console.error('Failed to load notification preferences', err)
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString(), is_read: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString(), is_read: true }))
      )
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const handleConnectionResponse = async (connectionId, status, notificationId) => {
    setRespondingTo(connectionId)
    try {
      await respondToConnection(connectionId, status)
      notifyConnectionRefresh()
      if (notificationId) await handleMarkAsRead(notificationId)
      await fetchNotifications()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to respond to connection request')
    } finally {
      setRespondingTo(null)
    }
  }

  const updatePreferenceField = (key) => (value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleSavePreferences = async () => {
    setSavingPreferences(true)
    setPreferenceMessage(null)
    try {
      await updateNotificationPreferences(preferences)
      setPreferenceMessage({ type: 'success', text: 'Preferences saved successfully.' })
    } catch (err) {
      setPreferenceMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save preferences.' })
    } finally {
      setSavingPreferences(false)
    }
  }

  return (
    <NotificationsUI
      notifications={notifications}
      preferences={preferences}
      loading={loading}
      loadingPreferences={loadingPreferences}
      savingPreferences={savingPreferences}
      error={error}
      preferenceMessage={preferenceMessage}
      respondingTo={respondingTo}
      showPrefs={showPrefs}
      setShowPrefs={setShowPrefs}
      handleMarkAsRead={handleMarkAsRead}
      handleConnectionResponse={handleConnectionResponse}
      markAllRead={markAllRead}
      updatePreferenceField={updatePreferenceField}
      handleSavePreferences={handleSavePreferences}
      fetchPreferences={fetchPreferences}
      isRead={isRead}
      unreadCount={unreadCount}
      getProjectId={getProjectId}
      TYPE_LABELS={TYPE_LABELS}
      TYPE_STYLES={TYPE_STYLES}
    />
  )
}
