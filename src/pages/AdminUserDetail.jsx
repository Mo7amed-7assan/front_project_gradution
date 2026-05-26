import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getUserById, updateUser, deleteUser } from '../services/adminUsers'
import { useAuth } from '../context/AuthContext'

const statusMap = {
  active:    { cls: 'badge-green',  label: 'Active' },
  pending:   { cls: 'badge-yellow', label: 'Pending' },
  suspended: { cls: 'bg-orange-50 text-orange-700 border border-orange-200 badge', label: 'Suspended' },
  banned:    { cls: 'badge-red',    label: 'Banned' },
  deleted:   { cls: 'badge-slate',  label: 'Deleted' },
}
const roleMap = {
  administrator: { cls: 'bg-purple-50 text-purple-700 border border-purple-200 badge', label: 'Administrator' },
  moderator:     { cls: 'badge-blue',   label: 'Moderator' },
  regular_user:  { cls: 'badge-slate',  label: 'Regular User' },
  guest:         { cls: 'badge-yellow', label: 'Guest' },
}

function InfoRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  )
}

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [message, setMessage] = useState(null)
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
    setProcessing(true)
    setMessage(null)
    try {
      const payload = {}
      if (formRole && formRole !== item.role) payload.role = formRole
      if (formStatus && formStatus !== item.account_status) payload.account_status = formStatus
      if (Object.keys(payload).length === 0) {
        setMessage({ type: 'info', text: 'No changes to save.' })
        setProcessing(false)
        return
      }
      await updateUser(id, payload)
      const data = await getUserById(id)
      setItem(data)
      setEditMode(false)
      setMessage({ type: 'success', text: 'User updated successfully.' })
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to update user' })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Soft-delete this user? This action can be reversed.')) return
    setProcessing(true)
    try {
      await deleteUser(id)
      navigate('/admin/users')
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to delete user' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!item) return <div className="p-8 text-rose-600 font-bold">User not found.</div>

  const statusBadge = statusMap[item.account_status?.toLowerCase()] || { cls: 'badge-slate', label: item.account_status || 'Unknown' }
  const roleBadge   = roleMap[item.role?.toLowerCase()]    || { cls: 'badge-slate', label: item.role || 'Unknown' }
  const initial     = (item.full_name || item.username || 'U').charAt(0).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/users" className="text-sm text-brand-primary font-bold flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Users
          </Link>
          <h1 className="page-title text-brand-secondary">User Detail</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditMode(!editMode)
              if (editMode) { setFormRole(item.role); setFormStatus(item.account_status) }
            }}
            className="btn-secondary text-sm"
          >
            {editMode ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} disabled={processing} className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50">
            {processing ? <Spinner /> : '🗑️ Soft-Delete'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
          {message.text}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {/* User Header */}
        <div className="bg-gradient-to-r from-brand-primaryDark to-brand-primary p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-3xl shadow-inner">
            {initial}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{item.full_name || item.name || item.username || 'Unknown'}</h2>
            <p className="text-brand-primaryLight font-medium mt-0.5">{item.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`${roleBadge.cls} text-xs`}>{roleBadge.label}</span>
              <span className={`${statusBadge.cls} text-xs`}>{statusBadge.label}</span>
              {item.identity_verified && (
                <span className="badge badge-blue text-xs">✅ Verified</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <InfoRow label="Username">@{item.username || 'N/A'}</InfoRow>
            <InfoRow label="Location">{item.location || '—'}</InfoRow>
            <InfoRow label="Registered">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}</InfoRow>
            <InfoRow label="Last Active">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Unknown'}</InfoRow>
            <InfoRow label="Verification Level">{item.identity_verification_level || 'None'}</InfoRow>
            <InfoRow label="Identity Verified">{item.identity_verified ? '✅ Yes' : '❌ No'}</InfoRow>
          </div>

          {/* Edit Form */}
          {editMode && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Edit User</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Role</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="form-select bg-slate-50">
                    <option value="administrator">Administrator</option>
                    <option value="moderator">Moderator</option>
                    <option value="regular_user">Regular User</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Account Status</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="form-select bg-slate-50">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditMode(false); setFormRole(item.role); setFormStatus(item.account_status) }} className="btn-secondary flex-1">Discard</button>
                <button onClick={handleUpdate} disabled={processing} className="btn-primary flex-1 shadow-brand-primary/30">
                  {processing ? <Spinner /> : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Raw Data */}
          <details className="pt-4 border-t border-slate-100">
            <summary className="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors">
              Raw JSON Data
            </summary>
            <pre className="mt-3 p-4 bg-slate-50 rounded-xl text-xs overflow-auto border border-slate-100 text-slate-600 font-mono">
              {JSON.stringify(item, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
