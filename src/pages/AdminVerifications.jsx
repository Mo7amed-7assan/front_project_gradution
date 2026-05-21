import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { listVerifications } from '../services/adminVerification'
import { useAuth } from '../context/AuthContext'

export default function AdminVerifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await listVerifications({ per_page: 50 })
        if (Array.isArray(data)) setItems(data)
        else if (Array.isArray(data?.data)) setItems(data.data)
        else setItems(data || [])
      } catch (err) {
        console.error('Failed to load verifications', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Identity Verifications</h1>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-gray-600">No verification submissions found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="p-4 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">User: {it.user?.full_name || it.user?.name || it.user_id || 'Unknown'}</div>
                <div className="text-sm text-gray-600">Status: {it.status || it.verification_status || 'unknown'}</div>
                <div className="text-sm text-gray-500">Submitted: {it.created_at || it.submitted_at || ''}</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/verifications/${it.id}`} className="px-3 py-2 bg-blue-600 text-white rounded">View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
