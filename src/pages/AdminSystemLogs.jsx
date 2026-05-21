import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listSystemLogs } from '../services/adminSystemLogs'
import { useAuth } from '../context/AuthContext'

export default function AdminSystemLogs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = level ? { level, per_page: 100 } : { per_page: 100 }
        const data = await listSystemLogs(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load system logs', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, level])

  const getLevelBadgeColor = (lvl) => {
    const l = (lvl || '').toLowerCase()
    if (l === 'error') return 'bg-red-100 text-red-700'
    if (l === 'warning') return 'bg-yellow-100 text-yellow-700'
    if (l === 'info') return 'bg-blue-100 text-blue-700'
    if (l === 'debug') return 'bg-gray-100 text-gray-700'
    return 'bg-green-100 text-green-700'
  }

  const levels = [...new Set(items.map(it => it.level || 'info'))].filter(Boolean)

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">System Logs</h1>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Levels</option>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-gray-600">No system logs found.</div>
      ) : (
        <div className="space-y-2">
          {items.map((log) => (
            <Link key={log.id} to={`/admin/system-logs/${log.id}`}>
              <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadgeColor(log.level)}`}>
                        {(log.level || 'info').toUpperCase()}
                      </span>
                      <span className="text-sm font-mono text-gray-600">
                        {log.context || 'system'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mt-2 font-semibold">
                      {log.message || log.event || 'No message'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {log.description || ''}
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
