import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listActionLogs } from '../services/adminActionLogs'
import AdminActionLogsUI from '../ui/pages/AdminActionLogsUI'

export default function AdminActionLogs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionType, setActionType] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = actionType ? { action_type: actionType, per_page: 100 } : { per_page: 100 }
        const data = await listActionLogs(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load action logs', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, actionType])

  const actionTypes = [...new Set(items.map(it => it.action_type || it.action))].filter(Boolean)

  return (
    <AdminActionLogsUI
      items={items}
      loading={loading}
      actionType={actionType}
      setActionType={setActionType}
      actionTypes={actionTypes}
    />
  )
}
