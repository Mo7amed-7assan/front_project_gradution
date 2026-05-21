import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getUserById, updateUser, deleteUser } from '../services/adminUsers'
import { useAuth } from '../context/AuthContext'

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [formRole, setFormRole] = useState('')
  const [formStatus, setFormStatus] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getUserById(id)
        setItem(data)
        setFormRole(data?.role || '')
        setFormStatus(data?.account_status || '')
      } catch (err) {
        console.error('Failed to load user', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  const handleUpdate = async () => {
    if (!confirm('Are you sure you want to update this user?')) return
    setProcessing(true)
    try {
      const payload = {}
      if (formRole && formRole !== item.role) payload.role = formRole
      if (formStatus && formStatus !== item.account_status) payload.account_status = formStatus
      
      if (Object.keys(payload).length === 0) {
        alert('No changes to save')
        setProcessing(false)
        return
      }

      await updateUser(id, payload)
      alert('User updated successfully')
      setEditMode(false)
      // Reload user data
      const data = await getUserById(id)
      setItem(data)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to update user')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to soft-delete this user? This action can be reversed.')) return
    setProcessing(true)
    try {
      await deleteUser(id)
      alert('User soft-deleted successfully')
      navigate('/admin/users')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to delete user')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  if (!item) return <div className="p-6 text-red-600">User not found</div>

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">User Details</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            disabled={processing}
            className="px-3 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-50"
          >
            {processing ? 'Deleting...' : 'Soft-Delete'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <div className="mt-1 p-3 bg-gray-50 rounded">
              {item.full_name || item.name || 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm break-all">
              {item.email}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            {editMode ? (
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              >
                <option value="administrator">Administrator</option>
                <option value="moderator">Moderator</option>
                <option value="regular_user">Regular User</option>
                <option value="guest">Guest</option>
              </select>
            ) : (
              <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                {item.role}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Status</label>
            {editMode ? (
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="deleted">Deleted</option>
              </select>
            ) : (
              <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                {item.account_status}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Identity Verified</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.identity_verified ? 'Yes' : 'No'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Verification Level</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.identity_verification_level || 'None'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Registered</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Active</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.updated_at ? new Date(item.updated_at).toLocaleString() : 'Unknown'}
            </div>
          </div>
        </div>

        {item.location && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.location}
            </div>
          </div>
        )}

        {editMode && (
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleUpdate}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false)
                setFormRole(item.role)
                setFormStatus(item.account_status)
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Discard
            </button>
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
