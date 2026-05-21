import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listRestrictions } from '../services/adminRestrictions'
import { useAuth } from '../context/AuthContext'

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

  const getTypeBadgeColor = (type) => {
    const t = (type || '').toLowerCase()
    if (t === 'messaging') return 'bg-red-100 text-red-700'
    if (t === 'posting') return 'bg-orange-100 text-orange-700'
    if (t === 'applications') return 'bg-yellow-100 text-yellow-700'
    if (t === 'matching') return 'bg-purple-100 text-purple-700'
    if (t === 'comments') return 'bg-pink-100 text-pink-700'
    return 'bg-gray-100 text-gray-700'
  }

  const getStatusBadgeColor = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'active') return 'bg-red-100 text-red-700'
    if (s === 'lifted') return 'bg-green-100 text-green-700'
    if (s === 'expired') return 'bg-gray-100 text-gray-700'
    return 'bg-blue-100 text-blue-700'
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">User Restrictions</h1>
        <div className="flex gap-2">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border rounded">
            <option value="all">All Types</option>
            <option value="messaging">Messaging</option>
            <option value="posting">Posting</option>
            <option value="applications">Applications</option>
            <option value="matching">Matching</option>
            <option value="comments">Comments</option>
          </select>
          <Link to="/admin/restrict-user" className="px-3 py-2 bg-green-600 text-white rounded">Restrict User</Link>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-gray-600">No restrictions found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Link key={it.id} to={`/admin/restrictions/${it.id}`}>
              <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{it.target_user?.full_name || it.target_user?.name || it.target_user_id || 'Unknown User'}</div>
                    <div className="text-sm text-gray-600">Reason: {it.reason || 'No reason provided'}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Restricted: {it.created_at || it.restricted_at}
                      {it.expires_at && ` • Expires: ${it.expires_at}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(it.restriction_type || it.type)}`}>
                      {it.restriction_type || it.type || 'unknown'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(it.status)}`}>
                      {it.status || 'active'}
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
