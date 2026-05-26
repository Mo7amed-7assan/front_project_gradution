import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listModerations } from '../services/adminModeration'
import AdminModerationUI from '../ui/pages/AdminModerationUI'

export default function AdminModeration() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = filterAction !== 'all' ? { action: filterAction, per_page: 50 } : { per_page: 50 }
        const data = await listModerations(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load moderations', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, filterAction])

  return (
    <AdminModerationUI
      items={items}
      loading={loading}
      filterAction={filterAction}
      setFilterAction={setFilterAction}
    />
  )
}
