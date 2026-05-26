import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

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

const getTypeBadge  = (t) => typeMap[`${t||''}`.toLowerCase()]   || { cls: 'badge-slate', icon: '🔒' }
const getStatusBadge = (s) => statusMap[`${s||''}`.toLowerCase()] || { cls: 'badge-blue',  label: s || 'Unknown' }

export default function AdminRestrictionsUI({ items, loading, filterType, setFilterType }) {
  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">User Restrictions</h1>
          <p className="page-subtitle">Manage active and historical user restrictions.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="form-select w-auto">
            <option value="all">All Types</option>
            <option value="messaging">Messaging</option>
            <option value="posting">Posting</option>
            <option value="applications">Applications</option>
            <option value="matching">Matching</option>
            <option value="comments">Comments</option>
          </select>
          <Link to="/admin/restrict-user" className="btn-primary text-sm shadow-brand-primary/20 whitespace-nowrap">
            Restrict User
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-2xl">🔓</div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">No restrictions found</h3>
          <p className="text-slate-500 text-sm">No user restrictions match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const type   = getTypeBadge(it.restriction_type || it.type)
            const status = getStatusBadge(it.status)
            return (
              <Link key={it.id} to={`/admin/restrictions/${it.id}`} className="block">
                <div className="card p-5 hover:border-brand-primary/30 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0">
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                        {it.target_user?.full_name || it.target_user?.name || it.target_user_id || 'Unknown User'}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">{it.reason || 'No reason provided'}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-400">
                        {(it.created_at || it.restricted_at) && (
                          <span>Since: {new Date(it.created_at || it.restricted_at).toLocaleDateString()}</span>
                        )}
                        {it.expires_at && <span>Expires: {new Date(it.expires_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`${type.cls} text-xs`}>{it.restriction_type || it.type || 'Unknown'}</span>
                      <span className={`${status.cls} text-xs`}>{status.label}</span>
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
