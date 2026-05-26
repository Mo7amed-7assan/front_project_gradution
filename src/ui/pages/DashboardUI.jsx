import React from 'react'
import { Link } from 'react-router-dom'

function StatCard({ label, value, icon, to, color, bgColor, loading }) {
  return (
    <Link
      to={to}
      className="card p-6 flex items-center justify-between group hover:-translate-y-1 transition-transform border-slate-100 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
    >
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-4xl font-black mt-2 tracking-tight ${color}`}>
          {loading ? (
            <span className="skeleton inline-block w-12 h-10 rounded-xl"/>
          ) : value}
        </p>
      </div>
      <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        {icon}
      </div>
    </Link>
  )
}

function SkeletonRows({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 skeleton rounded-xl" />
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    accepted: 'badge-green',
    rejected: 'badge-red',
    pending: 'badge-yellow',
    withdrawn: 'badge-slate',
  }
  return (
    <span className={map[(status || 'pending').toLowerCase()] || 'badge-slate'}>
      {status || 'pending'}
    </span>
  )
}

function QuickTile({ to, label, icon, bgClass, iconClass }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold ${bgClass} hover:opacity-90 transition-all duration-200 hover:shadow-md`}
    >
      <span className={`text-xl shrink-0 ${iconClass}`}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  )
}

export default function DashboardUI({
  displayName,
  stats,
  recentProjects,
  myApplications,
  loadingStats,
  onWithdraw,
}) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-gradient-to-r from-brand-primaryDark to-brand-primary p-8 rounded-3xl text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-brand-accent opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            {greeting}, <span className="text-brand-accent">{displayName}</span> 👋
          </h1>
          <p className="text-brand-primaryLight font-medium text-lg">
            Here's what's happening with your co-founding journey today.
          </p>
        </div>
        <Link to="/projects/create" className="btn-secondary bg-white text-brand-primary hover:bg-slate-50 border-none shadow-lg relative z-10 shrink-0 py-3 px-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="My Projects"
          value={stats.projects}
          icon="🚀"
          to="/my-projects"
          color="text-brand-primary"
          bgColor="bg-brand-primaryLight"
          loading={loadingStats}
        />
        <StatCard
          label="My Applications"
          value={stats.applications}
          icon="📋"
          to="/applications/mine"
          color="text-emerald-600"
          bgColor="bg-emerald-100"
          loading={loadingStats}
        />
        <StatCard
          label="Unread Alerts"
          value={stats.unread}
          icon="🔔"
          to="/notifications"
          color="text-amber-600"
          bgColor="bg-amber-100"
          loading={loadingStats}
        />
      </div>

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent projects */}
        <div className="card p-6 lg:col-span-2 shadow-sm border-brand-primaryLight">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-brand-secondary">My Recent Projects</h2>
            <Link to="/my-projects" className="text-sm font-bold text-brand-primary hover:text-brand-primaryDark transition-colors flex items-center gap-1">
              View all <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {loadingStats ? (
            <SkeletonRows count={3} />
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No active projects</h3>
              <p className="text-sm text-slate-500 mb-4">Start your journey by creating or joining a project.</p>
              <Link to="/projects/create" className="btn-primary shadow-brand-primary/30 py-2.5">
                Create Project
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentProjects.map(p => {
                const initial = (p.title || p.name || 'P').charAt(0).toUpperCase()
                return (
                  <li key={p.id}>
                    <Link
                      to={`/projects/${p.id}`}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-brand-primary/30 bg-slate-50 hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primaryDark flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-white text-lg font-bold">
                            {initial}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-base font-bold text-slate-900 block truncate group-hover:text-brand-primary transition-colors">
                            {p.title || p.name}
                          </span>
                          <span className="text-xs text-slate-500 font-medium mt-0.5 block truncate">
                            {p.tagline || 'Project workspace'}
                          </span>
                        </div>
                      </div>
                      <span className="badge-slate shrink-0 capitalize">{p.status || 'open'}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-6 shadow-sm border-brand-primaryLight h-fit">
          <h2 className="text-xl font-bold text-brand-secondary mb-6 pb-4 border-b border-slate-100">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { to: '/projects/create', label: 'Create Project', icon: '✨', bgClass: 'bg-brand-primaryLight text-brand-primaryDark border border-brand-primary/20 hover:bg-brand-primary hover:text-white', iconClass: '' },
              { to: '/projects',        label: 'Find Projects',  icon: '🔍', bgClass: 'bg-slate-50 text-slate-800 border border-slate-200',   iconClass: '' },
              { to: '/connections',     label: 'My Network',     icon: '🤝', bgClass: 'bg-slate-50 text-slate-800 border border-slate-200',   iconClass: '' },
              { to: '/notifications',   label: 'Notifications',  icon: '🔔', bgClass: 'bg-slate-50 text-slate-800 border border-slate-200', iconClass: '' },
              { to: '/profile',         label: 'Edit Profile',   icon: '👤', bgClass: 'bg-slate-50 text-slate-800 border border-slate-200',iconClass: '' },
              { to: '/messages',        label: 'Messages',       icon: '💬', bgClass: 'bg-slate-50 text-slate-800 border border-slate-200',iconClass: '' },
            ].map(tile => (
              <QuickTile key={tile.to} {...tile} />
            ))}
          </div>
        </div>
      </div>

      {/* My Sent Applications */}
      <div className="card p-6 shadow-sm border-brand-primaryLight">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-brand-secondary">My Sent Applications</h2>
          <Link to="/applications/mine" className="text-sm font-bold text-brand-primary hover:text-brand-primaryDark transition-colors flex items-center gap-1">
            View all <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {loadingStats ? (
          <SkeletonRows count={3} />
        ) : myApplications.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No applications sent</h3>
            <p className="text-sm text-slate-500 mb-4">Find exciting projects and apply to join their teams.</p>
            <Link to="/projects" className="btn-secondary text-brand-primary py-2.5">
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Project</th>
                  <th className="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-5"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myApplications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-5">
                      <Link
                        to={`/projects/${app.project_id}`}
                        className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors block truncate"
                      >
                        {app.project?.title || app.project_title || `Project ${app.project_id}`}
                      </Link>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      {app.status === 'pending' && (
                        <button
                          onClick={() => onWithdraw(app)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
