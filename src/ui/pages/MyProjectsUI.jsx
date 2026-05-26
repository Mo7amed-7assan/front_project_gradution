import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'
import SkeletonCard from '../../components/SkeletonCard'

export default function MyProjectsUI({
  projects,
  loading,
  error,
  deleting,
  handleDelete,
  user,
  STATUS_STYLES,
  getProjectRelation
}) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">My Projects</h1>
          <p className="page-subtitle">
            {loading ? 'Loading...' : `Managing ${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          to="/projects/create"
          className="btn-primary shadow-brand-primary/30 shrink-0 self-start sm:self-auto flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create Project
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : projects.length === 0
          ? (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 card p-12 text-center border-dashed border-2 border-slate-200">
              <div className="w-20 h-20 bg-brand-primaryLight rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform">
                <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.39 3.32a1.5 1.5 0 011.06-.44h11.1m-16.5 0a3.004 3.004 0 00.621-4.72L19.61 3.32a1.5 1.5 0 00-1.06-.44H5.45" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create your first project and start building your team.</p>
              <Link
                to="/projects/create"
                className="btn-primary shadow-brand-primary/30"
              >
                Create a Project
              </Link>
            </div>
          )
          : projects.map(p => {
            const statusKey   = (p.status || 'planning').toLowerCase()
            let statusBadge = 'badge-slate'
            if (statusKey === 'planning') statusBadge = 'badge-yellow'
            if (statusKey === 'active') statusBadge = 'badge-green'
            if (statusKey === 'on_hold') statusBadge = 'badge-slate'
            if (statusKey === 'completed') statusBadge = 'badge-slate'
            if (statusKey === 'cancelled') statusBadge = 'badge-red'

            const roles       = p.project_roles || p.roles || []
            const relation    = getProjectRelation(p, user)
            const initial = (p.title || p.name || 'P').charAt(0).toUpperCase()

            return (
              <div key={p.id} className="card p-0 flex flex-col group hover:-translate-y-1 transition-all hover:shadow-xl hover:shadow-brand-primary/10 border-slate-100 hover:border-brand-primary/30 overflow-hidden">
                <div className="p-5 flex-1 flex flex-col">
                  {/* Title & Avatar */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primaryDark flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-lg">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/projects/${p.id}`}
                        className="font-bold text-slate-900 text-lg hover:text-brand-primary truncate block transition-colors leading-tight"
                      >
                        {p.title || p.name}
                      </Link>
                      {p.status && (
                        <span className={`inline-block mt-1 ${statusBadge}`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 text-sm flex-1 mb-4 line-clamp-3">
                    {p.description || 'No description provided.'}
                  </p>

                  {/* Roles */}
                  {roles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2 mt-auto">
                      {roles.slice(0, 3).map(r => (
                        <span
                          key={r.id}
                          className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md"
                        >
                          {r.role_name || r.name || r.title}
                        </span>
                      ))}
                      {roles.length > 3 && (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-md">
                          +{roles.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-px bg-slate-100 mt-auto">
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex-1 text-center text-sm font-bold px-2 py-3 bg-white text-brand-primary hover:bg-slate-50 transition-colors"
                  >
                    Open
                  </Link>
                  {relation.isOwner && (
                    <Link
                      to={`/projects/${p.id}/edit`}
                      className="flex-1 text-center text-sm font-bold px-2 py-3 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Edit
                    </Link>
                  )}
                  {relation.isOwner && (
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      disabled={deleting === p.id}
                      className="flex-1 text-sm font-bold px-2 py-3 bg-white text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    >
                      {deleting === p.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
