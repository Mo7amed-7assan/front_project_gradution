import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listVerifications } from '../services/adminVerification'
import AdminVerificationsUI from '../ui/pages/AdminVerificationsUI'

export default function AdminVerifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = statusFilter !== 'all' ? { status: statusFilter, per_page: 50 } : { per_page: 50 }
        const data = await listVerifications(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load verifications', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, statusFilter])

  return (
    <AdminVerificationsUI
      items={items}
      loading={loading}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
    />
  )
}
