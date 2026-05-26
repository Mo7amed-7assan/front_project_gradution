import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

const actionMap = {
  warning:     { cls: 'badge-yellow', icon: '⚠️' },
  suspend:     { cls: 'bg-orange-50 text-orange-700 border border-orange-200 badge', icon: '⏸️' },
  ban:         { cls: 'badge-red',    icon: '🚫' },
  restriction: { cls: 'bg-purple-50 text-purple-700 border border-purple-200 badge', icon: '🔒' },
  note:        { cls: 'badge-blue',   icon: '📝' },
}
const getActionBadge = (action) => actionMap[`${action || ''}`.toLowerCase()] || { cls: 'badge-slate', icon: '📋' }

export default function AdminModerationUI({ items, loading, filterAction, setFilterAction }) {
  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner /></div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">Moderation Actions</h1>
          <p className="page-subtitle">Track all moderation actions taken by administrators.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="form-select w-auto"
          >
            <option value="all">All Actions</option>
            <option value="warning">Warning</option>
            <option value="suspend">Suspend</option>
            <option value="ban">Ban</option>
            <option value="restriction">Restriction</option>
            <option value="note">Note</option>
          </select>
          <Link to="/admin/moderation/log" className="btn-primary text-sm shadow-brand-primary/20 whitespace-nowrap">
            Log Action
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No moderation actions</h3>
          <p className="text-slate-500 text-sm">No actions match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const badge = getActionBadge(it.action_type || it.action)
            return (
              <div key={it.id} className="card p-5 hover:border-brand-primary/30 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                        {it.reason || it.action_type || 'Moderation Action'}
                      </p>
                      <span className={`${badge.cls} text-xs`}>{it.action_type || it.action || 'unknown'}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Target: <span className="font-semibold text-slate-700">{it.target_user?.full_name || it.target_user?.name || it.target_user_id || 'Unknown'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Moderator: <span className="font-semibold text-slate-700">{it.moderator?.full_name || it.moderator?.name || it.moderator_id || 'Unknown'}</span>
                      </span>
                      {(it.created_at || it.logged_at) && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {new Date(it.created_at || it.logged_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {it.description && (
                      <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                        {it.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
