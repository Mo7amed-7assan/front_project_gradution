import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getActionLogById } from '../services/adminActionLogs'
import { useAuth } from '../context/AuthContext'

const getActionBadge = (action) => {
  const a = `${action || ''}`.toLowerCase()
  if (a.includes('create')) return { cls: 'badge-green',  icon: '✨' }
  if (a.includes('update') || a.includes('edit')) return { cls: 'badge-blue', icon: '✏️' }
  if (a.includes('delete')) return { cls: 'badge-red',   icon: '🗑️' }
  if (a.includes('restrict') || a.includes('ban')) return { cls: 'bg-orange-50 text-orange-700 border border-orange-200 badge', icon: '🚫' }
  if (a.includes('approve') || a.includes('reject')) return { cls: 'bg-purple-50 text-purple-700 border border-purple-200 badge', icon: '✅' }
  return { cls: 'badge-slate', icon: '📋' }
}

function InfoRow({ label, children, copyable = false }) {
  return (
    <div>
      <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-1">{label}</p>
      <div className={`text-sm font-semibold text-[var(--text-primary)] ${copyable ? 'font-mono bg-[var(--bg-hover)] px-2 py-1 rounded inline-block border border-[var(--border-color)]' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default function AdminActionLogDetail() {
  const { id } = useParams()
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

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!item) return <div className="p-8 text-rose-600 font-bold">Action log not found.</div>

  const badge = getActionBadge(item.action_type || item.action)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link to="/admin/action-logs" className="text-sm text-brand-primary font-bold flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Action Logs
          </Link>
          <h1 className="page-title text-brand-secondary">Action Log Detail</h1>
        </div>
      </div>

      <div className="card p-4 md:p-6 w-full">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border-color)]">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center text-2xl shrink-0">
            {badge.icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[var(--text-primary)] capitalize">
                {item.action_type || item.action || 'Unknown Action'}
              </h2>
              <span className={`${badge.cls} text-xs uppercase tracking-wider`}>Logged Action</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Performed by:{' '}
              <span className="font-semibold text-brand-primary">
                {item.admin_user?.full_name || item.admin_user?.name || item.performed_by_id || 'Unknown'}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <InfoRow label="Timestamp">
              {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}
            </InfoRow>
            
            <div>
              <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-2">Description / Reason</p>
              <div className="p-4 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] whitespace-pre-wrap">
                {item.description || item.reason || 'No description provided.'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <InfoRow label="Target Type">
              <span className="capitalize">{item.target_type || 'N/A'}</span>
            </InfoRow>
            
            <InfoRow label="Target ID" copyable>
              {item.target_id || 'N/A'}
            </InfoRow>

            {item.ip_address && (
              <InfoRow label="IP Address" copyable>
                {item.ip_address}
              </InfoRow>
            )}
          </div>
        </div>

        {item.changes && (
          <div>
            <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-2">Changes payload</p>
            <div className="p-4 bg-[var(--bg-hover)] rounded-xl border border-[var(--border-color)] overflow-x-auto">
              <pre className="text-xs text-[var(--text-secondary)] font-mono">
                {typeof item.changes === 'string' ? item.changes : JSON.stringify(item.changes, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider hover:text-slate-600 transition-colors inline-block ml-1">
          Raw JSON Data
        </summary>
        <pre className="mt-3 p-4 bg-[var(--bg-hover)] rounded-xl text-xs overflow-auto border border-[var(--border-color)] text-[var(--text-secondary)] font-mono">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </div>
  )
}
