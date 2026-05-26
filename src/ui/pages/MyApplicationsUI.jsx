import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

export default function MyApplicationsUI({
  applications,
  loading,
  error,
  page,
  setPage,
  totalPages,
  withdrawing,
  notice,
  setNotice,
  handleWithdraw,
  getRoleName,
  STATUS_STYLES
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">My Applications</h1>
          <p className="page-subtitle">Track the status of your project applications.</p>
        </div>
        <Link to="/projects" className="btn-secondary text-brand-primary shrink-0 self-start sm:self-auto flex items-center gap-2">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           Browse Projects
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {error}
        </div>
      )}

      {notice && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
           <div className="flex items-center gap-2">
             <svg className="w-5 h-5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span>{notice}</span>
           </div>
           <button onClick={() => setNotice(null)} className="text-rose-700 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors text-xs uppercase tracking-wider">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-2 border-slate-200 mt-6">
          <div className="w-20 h-20 bg-brand-primaryLight rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform">
             <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No applications yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Find a project you love and apply for a role to start collaborating.</p>
          <Link to="/projects" className="btn-primary shadow-brand-primary/30">
            Explore Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {applications.map(a => {
            const statusKey   = (a.status || 'pending').toLowerCase()
            let statusBadge = 'badge-slate'
            if (statusKey === 'pending') statusBadge = 'badge-yellow'
            if (statusKey === 'accepted') statusBadge = 'badge-green'
            if (statusKey === 'rejected') statusBadge = 'badge-red'
            
            const roleName    = getRoleName(a)
            const canWithdraw = statusKey === 'pending'
            const projectTitle = a.project?.title || a.project?.name || 'Project'
            const initial = projectTitle.charAt(0).toUpperCase()

            return (
              <div key={a.id} className="card p-5 md:p-6 group transition-all hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Left — application info */}
                  <div className="flex-1 min-w-0 flex gap-4">
                    {/* Project Avatar */}
                    <Link to={`/projects/${a.project?.id}`} className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primaryDark text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      {initial}
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <Link to={`/projects/${a.project?.id}`} className="font-bold text-slate-900 text-lg group-hover:text-brand-primary transition-colors truncate block">
                          {projectTitle}
                        </Link>
                        <span className={statusBadge}>
                          {a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm mb-4 mt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium">
                          <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          Role: <span className="text-slate-900">{roleName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Applied: {a.applied_at ? new Date(a.applied_at).toLocaleDateString() : (a.created_at ? new Date(a.created_at).toLocaleDateString() : '—')}
                        </div>
                      </div>

                      {/* Cover message */}
                      {a.cover_message && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
                          <svg className="w-6 h-6 text-slate-200 absolute -top-2 -left-2 bg-white" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                          <p className="text-sm text-slate-700 leading-relaxed italic pl-3 relative z-10 line-clamp-3">
                            {a.cover_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right — actions */}
                  <div className="flex flex-row md:flex-col items-center justify-end gap-2 shrink-0 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 md:w-32">
                    {a.project?.id && (
                      <Link
                        to={`/projects/${a.project.id}`}
                        className="btn-secondary w-full flex items-center justify-center text-xs"
                      >
                        View Project
                      </Link>
                    )}

                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(a.id)}
                        disabled={withdrawing === a.id}
                        className="btn-ghost text-rose-600 hover:bg-rose-50 w-full flex items-center justify-center text-xs"
                      >
                        {withdrawing === a.id ? <Spinner /> : 'Withdraw'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-ghost disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-1.5 rounded-xl">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-ghost disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
