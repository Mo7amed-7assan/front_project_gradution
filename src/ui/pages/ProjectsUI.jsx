import React from 'react'
import { Link } from 'react-router-dom'
import SkeletonCard from '../../components/SkeletonCard'
import SuggestedMatches from '../../components/SuggestedMatches'
import { getProjectRelation } from '../../utils/projectAccess'

export default function ProjectsUI({
  activeTab,
  setActiveTab,
  projects,
  loading,
  page,
  perPage,
  setPerPage,
  totalPages,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  setPage,
  user,
  children,
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title text-3xl">Explore Projects</h1>
            <p className="page-subtitle">Find startup ideas and talented team members to build with.</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary text-sm font-semibold"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Per Page</label>
              <select
                value={perPage}
                onChange={e => setPerPage(Number(e.target.value))}
                className="form-select text-xs py-2 w-20"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200/80 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-3 text-sm font-semibold relative transition-colors ${
              activeTab === 'projects' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Projects
            {activeTab === 'projects' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"/>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('suggestions')}
            className={`py-3 text-sm font-semibold relative transition-colors ${
              activeTab === 'suggestions' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Suggested Projects
            {activeTab === 'suggestions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"/>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-projects')}
            className={`py-3 text-sm font-semibold relative transition-colors ${
              activeTab === 'my-projects' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Projects
            {activeTab === 'my-projects' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"/>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card p-5 bg-white space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="form-label text-xs">Status</label>
                <select
                  value={filters.status}
                  onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                  className="form-select text-sm py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="form-label text-xs">Category</label>
                <input
                  value={filters.category}
                  onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Tech, Finance"
                  className="form-input text-sm py-2"
                />
              </div>
              <div>
                <label className="form-label text-xs">Required Skill</label>
                <input
                  value={filters.skill}
                  onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))}
                  placeholder="e.g. React, Node.js"
                  className="form-input text-sm py-2"
                />
              </div>
              <div>
                <label className="form-label text-xs">Search Keywords</label>
                <input
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  placeholder="Search projects..."
                  className="form-input text-sm py-2"
                />
              </div>
              <div>
                <label className="form-label text-xs">Applications</label>
                <select
                  value={filters.accepting_applications}
                  onChange={e => setFilters(f => ({ ...f, accepting_applications: e.target.value }))}
                  className="form-select text-sm py-2"
                >
                  <option value="">All Settings</option>
                  <option value="true">Accepting Applications</option>
                  <option value="false">Applications Closed</option>
                </select>
              </div>
              <div>
                <label className="form-label text-xs">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                  className="form-select text-sm py-2"
                >
                  <option value="created_at">Newest First</option>
                  <option value="view_count">Most Viewed</option>
                  <option value="application_count">Most Applied</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setFilters({ status: '', category: '', skill: '', search: '', accepting_applications: '', sort: 'created_at' })}
                className="btn-secondary text-xs px-3 py-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </header>

      {activeTab === 'my-projects' ? (
        children
      ) : activeTab === 'suggestions' ? (
        <SuggestedMatches kind="project" />
      ) : (
        <>
          {/* Projects Feed */}
          <div className="max-w-2xl mx-auto space-y-8">
            {loading ? (
              Array.from({ length: perPage }).map((_, i) => <SkeletonCard key={i} />)
            ) : projects.length === 0 ? (
              <div className="card py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No projects found</h3>
                <p className="text-sm text-slate-400">Try adjusting your filters or keywords.</p>
              </div>
            ) : (
              projects.map(p => {
                const relation = getProjectRelation(p, user)
                const isAccepting = String(p?.accepting_applications) === 'true' || p?.accepting_applications === true || p?.accepting_applications === 1
                return (
                  <div key={p?.id} className="card bg-white p-0 overflow-hidden border border-slate-200">
                    <div className="p-5">
                      {/* Post Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                            {p?.owner?.profile_picture_url || p?.owner?.avatar ? (
                              <img src={p.owner.profile_picture_url || p.owner.avatar} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-indigo-600 text-lg">{(p?.owner?.full_name || p?.owner?.username || 'U')[0]}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {p?.owner?.full_name || p?.owner?.username || 'Unknown User'}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {p?.created_at ? new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'} • Project Post
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {(relation.isOwner || relation.isMember) && (
                            <span className="badge-indigo text-[10px] uppercase font-bold">
                              {relation.isOwner ? 'Owner' : 'Member'}
                            </span>
                          )}
                           <span className={`badge text-[10px] uppercase font-bold ${p?.status?.toLowerCase() === 'active' ? 'badge-green' : p?.status?.toLowerCase() === 'planning' ? 'badge-indigo' : 'badge-slate'}`}>
                            {p?.status || 'Active'}
                          </span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-3">
                        <h4 className="text-xl font-bold text-slate-900 leading-tight">
                          <Link to={`/projects/${p?.id}`} className="hover:text-indigo-600 transition-colors">
                            {p?.title || p?.name}
                          </Link>
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {p?.description || p?.short_description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {(p?.skills || p?.required_skills || p?.roles || []).map((s, idx) => (
                          <span key={idx} className="badge-slate text-[11px] font-medium px-2.5 py-1 rounded-md">
                            {s.skill_name || s.role_name || s.name || s.title || String(s)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Post Footer Actions */}
                    <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
                      <div className="flex gap-3">
                        <Link to={`/projects/${p?.id}?apply=true`} className="btn-primary text-xs px-4 py-2 shadow-sm font-bold flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                          Apply
                        </Link>
                      </div>
                      <Link to={`/projects/${p?.id}`} className="btn-secondary text-xs px-4 py-2 shadow-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary text-xs px-3.5 py-2"
              >
                Previous
              </button>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-secondary text-xs px-3.5 py-2"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
