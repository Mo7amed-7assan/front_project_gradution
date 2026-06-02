import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

const statusMap = {
  pending:      { cls: 'badge-yellow', label: 'Pending' },
  under_review: { cls: 'badge-blue',   label: 'Under Review' },
  resolved:     { cls: 'badge-green',  label: 'Resolved' },
  dismissed:    { cls: 'badge-slate',  label: 'Dismissed' },
  escalated:    { cls: 'badge-red',    label: 'Escalated' },
  withdrawn:    { cls: 'badge-slate',  label: 'Withdrawn' },
}

const getStatusBadge = (status) => statusMap[`${status || ''}`.toLowerCase()] || { cls: 'badge-slate', label: status || 'Unknown' }

export default function AdminReportsUI({ items, loading, filterStatus, setFilterStatus }) {
  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner /></div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">Reports</h1>
          <p className="page-subtitle">Review and manage user-submitted reports.</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-select w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No reports found</h3>
          <p className="text-slate-500 text-sm">No reports match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const badge = getStatusBadge(it.status)
            return (
              <div key={it.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-brand-primary/30 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-base group-hover:text-brand-primary transition-colors truncate">
                    {it.title || it.subject || 'Report'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Reporter: <span className="font-medium text-slate-700">{it.reporter?.full_name || it.reporter?.name || it.reporter_id || 'Unknown'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      About: <span className="font-medium text-slate-700">{it.reported_user?.full_name || it.reported_user?.name || it.target_type || 'Unknown'}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`badge ${badge.cls}`}>{badge.label}</span>
                  <Link
                    to={`/admin/reports/${it.id}`}
                    className="btn-primary text-xs px-4 py-2 shadow-brand-primary/20"
                  >
                    View
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
