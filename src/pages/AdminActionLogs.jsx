import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listActionLogs } from '../services/adminActionLogs'
import { useAuth } from '../context/AuthContext'

export default function AdminActionLogs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionType, setActionType] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = actionType ? { action_type: actionType, per_page: 100 } : { per_page: 100 }
        const data = await listActionLogs(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load action logs', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, actionType])

  const getActionBadgeColor = (action) => {
    const a = (action || '').toLowerCase()
    if (a.includes('create')) return 'bg-green-100 text-green-700'
    if (a.includes('update') || a.includes('edit')) return 'bg-blue-100 text-blue-700'
    if (a.includes('delete')) return 'bg-red-100 text-red-700'
    if (a.includes('restrict') || a.includes('ban')) return 'bg-orange-100 text-orange-700'
    if (a.includes('approve') || a.includes('reject')) return 'bg-purple-100 text-purple-700'
    return 'bg-gray-100 text-gray-700'
  }

  const actionTypes = [...new Set(items.map(it => it.action_type || it.action))].filter(Boolean)

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin Action Logs</h1>
        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Actions</option>
          {actionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-gray-600">No action logs found.</div>
      ) : (
        <div className="space-y-2">
          {items.map((log) => (
            <Link key={log.id} to={`/admin/action-logs/${log.id}`}>
              <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(log.action_type || log.action)}`}>
                        {log.action_type || log.action || 'unknown'}
                      </span>
                      <span className="text-sm text-gray-600 font-mono">
                        {log.admin_user?.full_name || log.admin_user?.name || log.performed_by_id || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      <strong>Target:</strong> {log.target_type || 'N/A'} {log.target_id ? `(${log.target_id})` : ''}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {log.description || log.reason || 'No description'}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown'}
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
