import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listUsers } from '../services/adminUsers'
import { useAuth } from '../context/AuthContext'

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
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">All Users</h1>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-3 py-2 border rounded">
          <option value="all">All Roles</option>
          <option value="administrator">Administrator</option>
          <option value="moderator">Moderator</option>
          <option value="regular_user">Regular User</option>
          <option value="guest">Guest</option>
        </select>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-gray-600">No users found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Link key={it.id} to={`/admin/users/${it.id}`}>
              <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{it.full_name || it.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{it.email}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Registered: {it.created_at ? new Date(it.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(it.role)}`}>
                      {it.role || 'unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(it.account_status)}`}>
                      {it.account_status || 'unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
