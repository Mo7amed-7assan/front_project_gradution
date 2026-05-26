import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listUsers } from '../services/adminUsers'
import { useAuth } from '../context/AuthContext'
import AdminUsersUI from '../ui/pages/AdminUsersUI'

export default function AdminUsers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = filterRole !== 'all' ? { role: filterRole, per_page: 50 } : { per_page: 50 }
        const data = await listUsers(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load users', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, filterRole])

  const getRoleBadgeColor = (role) => {
    const r = (role || '').toLowerCase()
    if (r === 'administrator') return 'bg-red-100 text-red-700'
    if (r === 'moderator') return 'bg-orange-100 text-orange-700'
    if (r === 'regular_user') return 'bg-blue-100 text-blue-700'
    if (r === 'guest') return 'bg-gray-100 text-gray-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getStatusBadgeColor = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'active') return 'bg-green-100 text-green-700'
    if (s === 'pending') return 'bg-yellow-100 text-yellow-700'
    if (s === 'suspended') return 'bg-orange-100 text-orange-700'
    if (s === 'banned') return 'bg-red-100 text-red-700'
    if (s === 'deleted') return 'bg-gray-100 text-gray-700'
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <AdminUsersUI
      items={items}
      loading={loading}
      filterRole={filterRole}
      setFilterRole={setFilterRole}
      getRoleBadgeColor={getRoleBadgeColor}
      getStatusBadgeColor={getStatusBadgeColor}
    />
  )
}
