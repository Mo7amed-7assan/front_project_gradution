import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listModerations } from '../services/adminModeration'
import { useAuth } from '../context/AuthContext'

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

  const getActionBadgeColor = (action) => {
    const a = (action || '').toLowerCase()
    if (a === 'warning') return 'bg-yellow-100 text-yellow-700'
    if (a === 'suspend') return 'bg-orange-100 text-orange-700'
    if (a === 'ban') return 'bg-red-100 text-red-700'
    if (a === 'restriction') return 'bg-purple-100 text-purple-700'
    if (a === 'note') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Moderation Actions</h1>
        <div className="flex gap-2">
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="px-3 py-2 border rounded">
            <option value="all">All Actions</option>
            <option value="warning">Warning</option>
            <option value="suspend">Suspend</option>
            <option value="ban">Ban</option>
            <option value="restriction">Restriction</option>
            <option value="note">Note</option>
          </select>
          <Link to="/admin/moderation/log" className="px-3 py-2 bg-green-600 text-white rounded">Log Action</Link>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-gray-600">No moderation actions logged.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="p-4 border rounded">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{it.reason || it.action_type || 'Moderation Action'}</div>
                  <div className="text-sm text-gray-600">Target: {it.target_user?.full_name || it.target_user?.name || it.target_user_id || 'Unknown'}</div>
                  <div className="text-sm text-gray-600">Moderator: {it.moderator?.full_name || it.moderator?.name || it.moderator_id || 'Unknown'}</div>
                  <div className="text-sm text-gray-500 mt-1">{it.created_at || it.logged_at}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(it.action_type || it.action)}`}>
                  {it.action_type || it.action || 'unknown'}
                </span>
              </div>
              {it.description && (
                <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{it.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
