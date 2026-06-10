import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

const getActionBadge = (action) => {
  const a = `${action || ''}`.toLowerCase()
  if (a.includes('create')) return { cls: 'badge-green',  icon: '✨' }
  if (a.includes('update') || a.includes('edit')) return { cls: 'badge-blue', icon: '✏️' }
  if (a.includes('delete')) return { cls: 'badge-red',   icon: '🗑️' }
  if (a.includes('restrict') || a.includes('ban')) return { cls: 'bg-orange-50 text-orange-700 border border-orange-200 badge', icon: '🚫' }
  if (a.includes('approve') || a.includes('reject')) return { cls: 'bg-purple-50 text-purple-700 border border-purple-200 badge', icon: '✅' }
  return { cls: 'badge-slate', icon: '📋' }
}

export default function AdminActionLogsUI({ items, loading, actionType, setActionType, actionTypes }) {
  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">Admin Action Logs</h1>
          <p className="page-subtitle">Audit trail of all administrative actions performed.</p>
        </div>
        <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="form-select w-auto">
          <option value="">All Actions</option>
          {actionTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-[var(--border-color)]">
          <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)] text-2xl">📋</div>
          <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">No action logs found</h3>
          <p className="text-[var(--text-secondary)] text-sm">No admin actions match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((log) => {
            const badge = getActionBadge(log.action_type || log.action)
            return (
              <Link key={log.id} to={`/admin/action-logs/${log.id}`} className="block">
                <div className="card p-4 hover:border-brand-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center text-base shrink-0">
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`${badge.cls} text-xs`}>{log.action_type || log.action || 'unknown'}</span>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {log.admin_user?.full_name || log.admin_user?.name || log.performed_by_id || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">Target:</span>{' '}
                        {log.target_type || 'N/A'} {log.target_id ? `(${log.target_id})` : ''}
                      </p>
                      {(log.description || log.reason) && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">{log.description || log.reason}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-[var(--text-hint)] shrink-0 font-medium">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
