import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getActionLogById } from '../services/adminActionLogs'
import { useAuth } from '../context/AuthContext'

export default function AdminActionLogDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getActionLogById(id)
        setItem(data)
      } catch (err) {
        console.error('Failed to load action log', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  if (!item) return <div className="p-6 text-red-600">Action log not found</div>

  const getActionBadgeColor = (action) => {
    const a = (action || '').toLowerCase()
    if (a.includes('create')) return 'bg-green-100 text-green-700'
    if (a.includes('update') || a.includes('edit')) return 'bg-blue-100 text-blue-700'
    if (a.includes('delete')) return 'bg-red-100 text-red-700'
    if (a.includes('restrict') || a.includes('ban')) return 'bg-orange-100 text-orange-700'
    if (a.includes('approve') || a.includes('reject')) return 'bg-purple-100 text-purple-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Action Log Detail</h1>
        <button
          onClick={() => navigate('/admin/action-logs')}
          className="px-3 py-2 bg-gray-600 text-white rounded text-sm"
        >
          Back to Logs
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">Action Type</label>
          <div className="mt-1">
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getActionBadgeColor(item.action_type || item.action)}`}>
              {item.action_type || item.action || 'unknown'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Performed By</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.admin_user?.full_name || item.admin_user?.name || item.performed_by_id || 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timestamp</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Type</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.target_type || 'N/A'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target ID</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm font-mono">
              {item.target_id || 'N/A'}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description / Reason</label>
          <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
            {item.description || item.reason || 'No description'}
          </div>
        </div>

        {item.changes && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Changes</label>
            <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto">
              {typeof item.changes === 'string' ? item.changes : JSON.stringify(item.changes, null, 2)}
            </pre>
          </div>
        )}

        {item.ip_address && (
          <div>
            <label className="block text-sm font-medium text-gray-700">IP Address</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm font-mono">
              {item.ip_address}
            </div>
          </div>
        )}
      </div>

      <details className="border-t pt-4">
        <summary className="cursor-pointer font-medium text-gray-700">Raw Data</summary>
        <pre className="mt-3 p-3 bg-gray-50 rounded text-xs overflow-auto">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </div>
  )
}
