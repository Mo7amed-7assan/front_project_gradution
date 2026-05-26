import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listRestrictions } from '../services/adminRestrictions'
import AdminRestrictionsUI from '../ui/pages/AdminRestrictionsUI'

export default function AdminRestrictions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = filterType !== 'all' ? { restriction_type: filterType, per_page: 50 } : { per_page: 50 }
        const data = await listRestrictions(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load restrictions', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, filterType])

  return (
    <AdminRestrictionsUI
      items={items}
      loading={loading}
      filterType={filterType}
      setFilterType={setFilterType}
    />
  )
}
