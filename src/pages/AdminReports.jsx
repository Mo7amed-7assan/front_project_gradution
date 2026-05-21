import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listReports } from '../services/adminReports'
import { useAuth } from '../context/AuthContext'

export default function AdminReports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const params = filterStatus !== 'all' ? { status: filterStatus, per_page: 50 } : { per_page: 50 }
        const data = await listReports(params)
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load reports', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, filterStatus])

  const getStatusBadgeColor = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'open' || s === 'pending') return 'bg-yellow-100 text-yellow-700'
    if (s === 'assigned') return 'bg-blue-100 text-blue-700'
    if (s === 'resolved') return 'bg-green-100 text-green-700'
    if (s === 'closed') return 'bg-gray-100 text-gray-700'
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded">
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-gray-600">No reports found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="p-4 border rounded flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{it.title || it.subject || 'Report'}</div>
                <div className="text-sm text-gray-600">Reported by: {it.reporter?.full_name || it.reporter?.name || it.reporter_id || 'Unknown'}</div>
                <div className="text-sm text-gray-500">About: {it.reported_user?.full_name || it.reported_user?.name || it.target_type || 'Unknown'}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(it.status)}`}>
                  {it.status || 'unknown'}
                </span>
                <Link to={`/admin/reports/${it.id}`} className="px-3 py-2 bg-blue-600 text-white rounded">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
