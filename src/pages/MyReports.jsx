import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyReports } from '../services/reports'
import Spinner from '../components/Spinner'

const statusMap = {
  pending:      { cls: 'badge-yellow', label: 'Pending',      icon: '⏳' },
  under_review: { cls: 'badge-blue',   label: 'Under Review', icon: '🔍' },
  resolved:     { cls: 'badge-green',  label: 'Resolved',     icon: '✅' },
  dismissed:    { cls: 'badge-slate',  label: 'Dismissed',    icon: '📋' },
  escalated:    { cls: 'badge-red',    label: 'Escalated',    icon: '⚠️' },
  withdrawn:    { cls: 'badge-slate',  label: 'Withdrawn',    icon: '📤' },
}

const getBadge = (status) => statusMap[`${status || 'pending'}`.toLowerCase()] || { cls: 'badge-slate', label: status || 'Unknown', icon: '📋' }

export default function MyReports() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadReports() {
      setLoading(true)
      try {
        const res = await listMyReports({ per_page: 50 })
        const list = res?.data?.data || res?.data || []
        setItems(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Failed to load my reports', err)
        setError('Failed to fetch your submitted reports. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">My Submitted Reports</h1>
          <p className="page-subtitle">Track and manage reports you have submitted to moderation.</p>
        </div>
        <Link
          to="/reports/submit"
          className="btn-primary text-sm px-5 py-2.5 shadow-brand-primary/20 shrink-0"
        >
          🚩 File a Report
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-2xl">📋</div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No reports submitted</h3>
          <p className="text-slate-500 text-sm">Reports you file about users or projects will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((it) => {
            const status = it.status || 'pending'
            const badge = getBadge(status)
            const targetName = it.reported_user?.full_name || it.reported_user?.name || it.reported_user?.username || (it.reported_content_type === 'project' ? 'Project' : 'Unknown Target')
            const submittedAt = it.created_at || it.submitted_at

            return (
              <div key={it.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-brand-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 text-2xl shrink-0">
                  {it.report_type === 'harassment' ? '🤬' : it.report_type === 'spam' ? '📨' : '🚩'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors capitalize">
                    {it.report_type?.replaceAll('_', ' ')} Report
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      Target: {targetName}
                    </span>
                    {submittedAt && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`badge text-xs ${badge.cls}`}>
                    <span className="mr-1">{badge.icon}</span>{badge.label}
                  </span>
                  <Link to={`/reports/${it.id}`} className="btn-secondary text-xs px-4 py-2">
                    Details
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
