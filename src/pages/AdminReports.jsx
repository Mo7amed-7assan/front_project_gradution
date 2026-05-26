import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listReports } from '../services/adminReports'
import AdminReportsUI from '../ui/pages/AdminReportsUI'

export default function AdminReports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = filterStatus !== 'all' ? { status: filterStatus, per_page: 50 } : { per_page: 50 }
        const data = await listReports(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load reports', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, filterStatus])

  return (
    <AdminReportsUI
      items={items}
      loading={loading}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
    />
  )
}
