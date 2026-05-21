import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listSettings } from '../services/adminSettings'
import { useAuth } from '../context/AuthContext'

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
    return 'bg-gray-100 text-gray-700'
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">System Settings</h1>
        <input
          type="text"
          placeholder="Search by key or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded w-64"
        />
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-gray-600">No settings found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Link key={it.key} to={`/admin/settings/${it.key}`}>
              <div className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium font-mono text-sm">{it.key}</div>
                    <div className="text-sm text-gray-600 mt-1">{it.description || 'No description'}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Value: <span className="font-mono">{String(it.value).substring(0, 50)}{String(it.value).length > 50 ? '...' : ''}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(it.type)}`}>
                      {it.type || 'unknown'}
                    </span>
                    {it.is_public && (
                      <div className="text-xs text-green-600 mt-2">Public</div>
                    )}
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
