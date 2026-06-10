import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

export default function ProjectApplicationsUI({
  id,
  applications,
  loading,
  error,
  reviewing,
  handleReview,
  getRoleName,
  getApplicantName,
  isReviewing,
  pendingCount,
  STATUS_STYLES
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">Project Applications</h1>
          <p className="page-subtitle">
            {pendingCount > 0
              ? `${pendingCount} pending application${pendingCount !== 1 ? 's' : ''} awaiting your review.`
              : 'All applications have been reviewed.'}
          </p>
        </div>
        <Link to={`/projects/${id}`} className="btn-secondary text-brand-primary shrink-0 self-start sm:self-auto flex items-center gap-2">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           Back to Project
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-2 border-[var(--border-color)] mt-6">
          <div className="w-20 h-20 bg-brand-primaryLight rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform">
             <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /></svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No applications yet</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">Applications will appear here when people apply for open roles on your project.</p>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {applications.map(a => {
            const statusKey   = (a.status || 'pending').toLowerCase()
            const isPending   = statusKey === 'pending'
            let statusBadge = 'badge-slate'
            if (statusKey === 'pending') statusBadge = 'badge-yellow'
            if (statusKey === 'accepted') statusBadge = 'badge-green'
            if (statusKey === 'rejected') statusBadge = 'badge-red'
            
            const roleName    = getRoleName(a)
            const applicant   = getApplicantName(a)
            const initial     = applicant.charAt(0).toUpperCase()

            return (
              <div key={a.id} className={`card p-5 md:p-6 group transition-all border-l-4 ${isPending ? 'border-l-amber-400 shadow-md' : 'border-l-transparent hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5'}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Left — applicant info */}
                  <div className="flex-1 min-w-0 flex gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                      {initial}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="font-bold text-[var(--text-primary)] text-lg group-hover:text-brand-primary transition-colors">{applicant}</div>
                        <span className={statusBadge}>
                          {a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending'}
                        </span>
                      </div>
                      
                      {a.applicant?.email && (
                        <div className="text-sm text-[var(--text-secondary)] mb-3">{a.applicant.email}</div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-hover)] rounded-lg text-[var(--text-primary)] font-medium">
                          <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          Role: <span className="text-[var(--text-primary)]">{roleName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-hint)]">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Applied: {a.applied_at ? new Date(a.applied_at).toLocaleDateString() : (a.created_at ? new Date(a.created_at).toLocaleDateString() : '—')}
                        </div>
                      </div>

                      {/* Cover message */}
                      {a.cover_message && (
                        <div className="bg-[var(--bg-hover)] rounded-xl p-4 border border-[var(--border-color)] relative">
                          <svg className="w-6 h-6 text-slate-200 absolute -top-2 -left-2 bg-[var(--bg-surface)]" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed italic pl-3 relative z-10">
                            {a.cover_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right — actions */}
                  {isPending && (
                    <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-32 border-t md:border-t-0 border-[var(--border-color)] pt-4 md:pt-0">
                      <button
                        onClick={() => handleReview(a.id, 'accepted')}
                        disabled={!!reviewing}
                        className="btn-primary flex-1 shadow-brand-primary/30 flex items-center justify-center gap-1.5"
                      >
                        {isReviewing(a.id, 'accepted') ? <Spinner /> : (
                          <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Accept</>
                        )}
                      </button>
                      <button
                        onClick={() => handleReview(a.id, 'rejected')}
                        disabled={!!reviewing}
                        className="btn-secondary text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex-1 flex items-center justify-center gap-1.5"
                      >
                        {isReviewing(a.id, 'rejected') ? <Spinner /> : (
                          <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> Reject</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
