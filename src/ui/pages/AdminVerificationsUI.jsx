import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

const statusMap = {
  pending:      { cls: 'badge-yellow', label: 'Pending',      icon: '⏳' },
  under_review: { cls: 'badge-blue',   label: 'Under Review', icon: '🔍' },
  verified:     { cls: 'badge-green',  label: 'Verified',     icon: '✅' },
  approved:     { cls: 'badge-green',  label: 'Approved',     icon: '✅' },
  rejected:     { cls: 'badge-red',    label: 'Rejected',     icon: '❌' },
  escalated:    { cls: 'badge-red',    label: 'Escalated',    icon: '⚠️' },
  submitted:    { cls: 'badge-blue',   label: 'Submitted',    icon: '📤' },
}
const getBadge = (status) => statusMap[`${status || 'pending'}`.toLowerCase()] || { cls: 'badge-slate', label: status || 'Unknown', icon: '📋' }

export default function AdminVerificationsUI({ items, loading, statusFilter, setStatusFilter }) {
  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  const pendingCount = items.filter(it => `${it.status || it.verification_status || ''}`.toLowerCase() === 'pending').length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">Identity Verifications</h1>
          <p className="page-subtitle">Review and approve user identity verification submissions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold px-4 py-2.5 rounded-2xl">
              <span className="text-amber-500">⏳</span> {pendingCount} awaiting review
            </div>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-[var(--border-color)]">
          <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)] text-2xl">🪪</div>
          <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">No verification submissions</h3>
          <p className="text-[var(--text-secondary)] text-sm">
            {statusFilter && statusFilter !== 'all'
              ? 'No verification submissions match the selected filter.'
              : 'Verification requests from users will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const status = it.status || it.verification_status || 'pending'
            const badge = getBadge(status)
            const userName = it.user?.full_name || it.user?.name || it.user_id || 'Unknown'
            const initial = userName.charAt(0).toUpperCase()
            const submittedAt = it.created_at || it.submitted_at
            return (
              <div key={it.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-brand-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primaryLight to-brand-primary flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--text-primary)] group-hover:text-brand-primary transition-colors">
                    {userName}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-[var(--text-secondary)]">
                    {it.document_type && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {it.document_type.replaceAll('_', ' ')}
                      </span>
                    )}
                    {submittedAt && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`badge text-xs ${badge.cls}`}>
                    <span className="mr-1">{badge.icon}</span>{badge.label}
                  </span>
                  <Link to={`/admin/verifications/${it.id}`} className="btn-primary text-xs px-4 py-2 shadow-brand-primary/20">
                    Review
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
