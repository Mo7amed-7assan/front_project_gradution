import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getRestrictionById, liftRestriction } from '../services/adminRestrictions'
import { useAuth } from '../context/AuthContext'

export default function AdminRestrictionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getRestrictionById(id)
        setItem(data)
      } catch (err) {
        console.error('Failed to load restriction', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  const handleLift = async () => {
    if (!confirm('Are you sure you want to lift this restriction?')) return
    setProcessing(true)
    try {
      await liftRestriction(id)
      alert('Restriction lifted successfully')
      navigate('/admin/restrictions')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to lift restriction')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  if (!item) return <div className="p-6 text-red-600">Restriction not found</div>

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Restriction Details</h1>
        <button
          onClick={handleLift}
          disabled={processing || item.status === 'lifted'}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {processing ? 'Lifting...' : 'Lift Restriction'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Restricted User</label>
          <div className="mt-1 p-3 bg-gray-50 rounded">
            {item.target_user?.full_name || item.target_user?.name || item.target_user_id}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Restriction Type</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.restriction_type || item.type || 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.status || 'Active'}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">
            {item.reason || 'No reason provided'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Restricted By</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.restricted_by?.full_name || item.restricted_by?.name || item.restricted_by_id || 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Restricted At</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.created_at || item.restricted_at}
            </div>
          </div>
        </div>

        {item.expires_at && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Expires At</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.expires_at}
            </div>
          </div>
        )}

        {item.lifted_at && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Lifted By</label>
              <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                {item.lifted_by?.full_name || item.lifted_by?.name || 'Unknown'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Lifted At</label>
              <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                {item.lifted_at}
              </div>
            </div>
          </div>
        )}

        <details className="pt-4 border-t">
          <summary className="cursor-pointer font-medium text-gray-700">Raw Data</summary>
          <pre className="mt-3 p-3 bg-gray-50 rounded text-xs overflow-auto">
            {JSON.stringify(item, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
