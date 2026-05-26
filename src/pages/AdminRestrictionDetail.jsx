import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getRestrictionById, liftRestriction } from '../services/adminRestrictions'
import { useAuth } from '../context/AuthContext'

const typeMap = {
  messaging:    { cls: 'badge-red',    icon: '💬' },
  posting:      { cls: 'bg-orange-50 text-orange-700 border border-orange-200 badge', icon: '📝' },
  applications: { cls: 'badge-yellow', icon: '📋' },
  matching:     { cls: 'bg-purple-50 text-purple-700 border border-purple-200 badge', icon: '🔀' },
  comments:     { cls: 'bg-pink-50 text-pink-700 border border-pink-200 badge', icon: '💭' },
}

const statusMap = {
  active:  { cls: 'badge-red',   label: 'Active' },
  lifted:  { cls: 'badge-green', label: 'Lifted' },
  expired: { cls: 'badge-slate', label: 'Expired' },
}

function InfoRow({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  )
}

export default function AdminRestrictionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getRestrictionById(id)
        setItem(data)
      } catch (err) {
        console.error(err)
        setMessage({ type: 'error', text: 'Failed to load restriction details.' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  const handleLift = async () => {
    if (!confirm('Are you sure you want to lift this restriction?')) return
    setProcessing(true)
    setMessage(null)
    try {
      await liftRestriction(id)
      setMessage({ type: 'success', text: 'Restriction lifted successfully.' })
      navigate('/admin/restrictions')
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to lift restriction' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!item) return <div className="p-8 text-rose-600 font-bold">Restriction not found.</div>

  const typeData = typeMap[`${item.restriction_type || item.type || ''}`.toLowerCase()] || { cls: 'badge-slate', icon: '🔒' }
  const statusData = statusMap[`${item.status || 'active'}`.toLowerCase()] || { cls: 'badge-slate', label: item.status || 'Active' }
  const isActive = item.status?.toLowerCase() === 'active' || !item.status

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/restrictions" className="text-sm text-brand-primary font-bold flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Restrictions
          </Link>
          <h1 className="page-title text-brand-secondary">Restriction Detail</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${statusData.cls}`}>{statusData.label}</span>
          {isActive && (
            <button
              onClick={handleLift}
              disabled={processing}
              className="btn-primary px-4 py-2 text-sm shadow-brand-primary/20"
            >
              {processing ? <Spinner /> : 'Lift Restriction'}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0">
            {typeData.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="capitalize">{item.restriction_type || item.type || 'Unknown'}</span> Restriction
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Target: <Link to={`/admin/users/${item.target_user_id || item.target_user?.id}`} className="font-semibold text-brand-primary hover:underline">
                {item.target_user?.full_name || item.target_user?.name || item.target_user_id || 'Unknown User'}
              </Link>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <InfoRow label="Restricted By">
              {item.restricted_by?.full_name || item.restricted_by?.name || item.restricted_by_id || 'Unknown'}
            </InfoRow>
            <InfoRow label="Restricted At">
              {item.created_at || item.restricted_at ? new Date(item.created_at || item.restricted_at).toLocaleString() : 'Unknown'}
            </InfoRow>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap">
              {item.reason || 'No reason provided.'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {item.expires_at && (
              <InfoRow label="Expires At">
                <span className="text-amber-600 font-bold">
                  {new Date(item.expires_at).toLocaleString()}
                </span>
              </InfoRow>
            )}
            
            {item.lifted_at && (
              <>
                <InfoRow label="Lifted By">
                  {item.lifted_by?.full_name || item.lifted_by?.name || 'Unknown'}
                </InfoRow>
                <InfoRow label="Lifted At">
                  <span className="text-emerald-600 font-bold">
                    {new Date(item.lifted_at).toLocaleString()}
                  </span>
                </InfoRow>
              </>
            )}
          </div>
        </div>
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors inline-block ml-1">
          Raw JSON Data
        </summary>
        <pre className="mt-3 p-4 bg-slate-50 rounded-xl text-xs overflow-auto border border-slate-100 text-slate-600 font-mono">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </div>
  )
}
