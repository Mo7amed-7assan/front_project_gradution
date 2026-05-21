import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getSystemLogById } from '../services/adminSystemLogs'
import { useAuth } from '../context/AuthContext'

export default function AdminSystemLogDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getSystemLogById(id)
        setItem(data)
      } catch (err) {
        console.error('Failed to load system log', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  if (!item) return <div className="p-6 text-red-600">System log not found</div>

  const getLevelBadgeColor = (lvl) => {
    const l = (lvl || '').toLowerCase()
    if (l === 'error') return 'bg-red-100 text-red-700'
    if (l === 'warning') return 'bg-yellow-100 text-yellow-700'
    if (l === 'info') return 'bg-blue-100 text-blue-700'
    if (l === 'debug') return 'bg-gray-100 text-gray-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">System Log Detail</h1>
        <button
          onClick={() => navigate('/admin/system-logs')}
          className="px-3 py-2 bg-gray-600 text-white rounded text-sm"
        >
          Back to Logs
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <div className="mt-1">
            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getLevelBadgeColor(item.level)}`}>
              {(item.level || 'info').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Context</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm font-mono">
              {item.context || 'system'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Timestamp</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
            {item.message || item.event || 'No message'}
          </div>
        </div>

        {item.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.description}
            </div>
          </div>
        )}

        {item.user_id && (
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm font-mono">
              {item.user_id}
            </div>
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

        {item.user_agent && (
          <div>
            <label className="block text-sm font-medium text-gray-700">User Agent</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-xs break-all">
              {item.user_agent}
            </div>
          </div>
        )}

        {item.data && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Data</label>
            <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto">
              {typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2)}
            </pre>
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
