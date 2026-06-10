import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listSettings } from '../services/adminSettings'
import { useAuth } from '../context/AuthContext'
import AdminSettingsUI from '../ui/pages/AdminSettingsUI'

export default function AdminSettings() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = search ? { search, per_page: 50 } : { per_page: 50 }
        const data = await listSettings(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load settings', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, search])

  const getTypeBadgeColor = (type) => {
    const t = (type || '').toLowerCase()
    if (t === 'string') return 'bg-blue-100 text-blue-700'
    if (t === 'boolean') return 'bg-purple-100 text-purple-700'
    if (t === 'integer' || t === 'number') return 'bg-green-100 text-green-700'
    if (t === 'json') return 'bg-pink-100 text-pink-700'
    return 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <AdminSettingsUI
      items={items}
      loading={loading}
      search={search}
      setSearch={setSearch}
      getTypeBadgeColor={getTypeBadgeColor}
    />
  )
}
