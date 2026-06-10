import React from 'react'
import { Link } from 'react-router-dom'

export default function DashboardUI({
  displayName,
  stats,
  allProjects = [],
  recentProjects = [],
  myApplications,
  loadingStats,
  loadingProjects,
  onWithdraw,
  filters = {},
  setFilters = () => {},
  showFilters = false,
  setShowFilters = () => {},
  isGuest = false,
}) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* ── Guest Banner ──────────────────────────────────────────────── */}
      {isGuest && (
        <div className="relative overflow-hidden rounded-2xl border border-[#6C63FF]/30 bg-gradient-to-r from-[#6C63FF]/10 via-[#1E1E35] to-[#00D4AA]/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(108,99,255,0.15)]">
          {/* Glow blobs */}
          <div className="absolute -top-6 -left-6 w-28 h-28 bg-[#6C63FF]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-[#00D4AA]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#6C63FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-0.5">You're browsing as a Guest</p>
              <p className="text-xs text-[var(--text-hint)] leading-relaxed">
                Create a free account to apply to projects, connect with founders, and unlock all features.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Link
              to="/register"
              className="btn-primary text-sm px-5 py-2 font-bold shadow-[0_0_15px_rgba(108,99,255,0.4)] whitespace-nowrap"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-sm px-4 py-2 font-semibold whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Projects</h1>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary text-sm font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-5 space-y-4 mb-6">
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

      {loadingProjects ? (
         <div className="text-[var(--text-hint)] text-center py-10">Loading projects...</div>
      ) : allProjects.length === 0 ? (
         <div className="text-[var(--text-hint)] text-center py-10">No projects found.</div>
      ) : (
        allProjects.map((post) => {
          const rawAuthor = post.owner?.full_name || post.owner?.name || post.owner?.username || post.author || 'Unknown Author'
          const authorName = typeof rawAuthor === 'string' ? rawAuthor : 'Unknown Author'
          const authorAvatar = (post.owner?.profile_picture || post.owner?.avatar) ? (
            <img src={post.owner.profile_picture || post.owner.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[var(--border-color)]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )

          const isAccepting = post?.accepting_applications !== false && post?.accepting_applications !== 'false' && post?.accepting_applications !== 0

          return (
            <div key={post.id} className="card p-5 transition-all duration-300 hover:border-[#6C63FF]/40 hover:shadow-[0_0_20px_rgba(108,99,255,0.1)]">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <Link to={`/users/${post.owner?.id || post.owner_id || post.user_id || ''}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  {authorAvatar}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">{authorName}</span>
                      <span className="text-sm text-[var(--text-hint)]">
                        @{post.owner?.username || authorName.replace(/\s+/g, '').toLowerCase()}
                      </span>
                      <span className="text-[var(--text-secondary)]">•</span>
                      <span className="text-sm text-[var(--text-hint)]">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'New'}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Post Content */}
              <Link to={`/projects/${post.id}`} className="block group">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#6C63FF] transition-colors">{post.title || post.name}</h3>
                <div className="mb-4 text-sm text-[var(--text-hint)] leading-relaxed whitespace-pre-wrap">
                  {(() => {
                    let desc = post.short_description || post.full_description || post.description || post.tagline || 'No description provided.';
                    if (desc.length > 150) desc = desc.substring(0, 150) + '...';
                    return desc.split(' ').map((word, i) => {
                      if (word.startsWith('#')) return <span key={i} className="text-[#00D4AA] cursor-pointer hover:underline">{word} </span>
                      return word + ' '
                    })
                  })()}
                </div>

                {/* Tags / Categories if any */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(post.skills || post.required_skills || post.roles || []).map((s, idx) => {
                    const label = typeof s === 'string' ? s : (s.skill_name || s.role_name || s.name || s.title || String(s));
                    return (
                      <span key={idx} className="text-[10px] font-bold px-2.5 py-1 bg-[var(--bg-hover)] text-[var(--color-accent,#00D4AA)] rounded-full border border-[var(--color-accent,#00D4AA)]/20">
                        {label}
                      </span>
                    )
                  })}
                </div>
              </Link>

              {/* Footer Interactions */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                <Link to={`/projects/${post.id}`} className="btn-secondary text-xs px-4 py-2 shadow-sm">
                  View Details
                </Link>
                {/* Apply button — hidden for guests */}
                {!isGuest && isAccepting && (
                  <Link to={`/projects/${post.id}?apply=true`} className="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 shadow-[0_4px_10px_rgba(108,99,255,0.2)]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    Apply Now
                  </Link>
                )}
                {/* Prompt guests to register to apply */}
                {isGuest && isAccepting && (
                  <Link to="/register" className="text-xs font-semibold text-[#6C63FF] hover:underline flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Sign up to apply
                  </Link>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
