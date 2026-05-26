import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listSystemLogs } from '../services/adminSystemLogs'
import AdminSystemLogsUI from '../ui/pages/AdminSystemLogsUI'

export default function AdminSystemLogs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = level ? { level, per_page: 100 } : { per_page: 100 }
        const data = await listSystemLogs(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load system logs', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, level])

  const levels = [...new Set(items.map(it => it.level || 'info'))].filter(Boolean)

  return (
    <AdminSystemLogsUI
      items={items}
      loading={loading}
      level={level}
      setLevel={setLevel}
      levels={levels}
    />
  )
}
