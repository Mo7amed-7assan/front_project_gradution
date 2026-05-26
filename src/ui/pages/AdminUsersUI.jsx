import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

export default function AdminUsersUI({
  items,
  loading,
  filterRole,
  setFilterRole,
  getRoleBadgeColor,
  getStatusBadgeColor
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">User Management</h1>
          <p className="page-subtitle">View and manage all registered users on the platform.</p>
        </div>
      </div>

      <div className="card p-6 border-brand-primaryLight shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
           <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-brand-primaryLight rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-900">User Directory</h2>
               <p className="text-xs text-slate-500 font-medium">{items.length} total users</p>
             </div>
           </div>
           
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative w-full sm:w-48">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                <select 
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)} 
                  className="form-select pl-9 py-2 text-sm w-full bg-slate-50 focus:bg-white transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="administrator">Administrator</option>
                  <option value="moderator">Moderator</option>
                  <option value="regular_user">Regular User</option>
                  <option value="guest">Guest</option>
                </select>
             </div>
           </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
               <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No users found</h3>
            <p className="text-sm text-slate-500">Try adjusting your role filter or checking back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => {
              const roleColor = getRoleBadgeColor(it.role);
              const statusColor = getStatusBadgeColor(it.account_status);
              const initial = (it.full_name || it.name || it.email || '?').charAt(0).toUpperCase();

              return (
                <Link key={it.id} to={`/admin/users/${it.id}`} className="group relative card p-5 border-slate-100 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center text-slate-600 font-bold shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                        {it.profile_picture_url ? (
                          <img src={it.profile_picture_url} alt={it.full_name} className="w-full h-full object-cover" />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${roleColor.replace('badge-', 'bg-').replace('text-', 'text-')}`}>
                          {it.role || 'unknown'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${statusColor.replace('badge-', 'bg-').replace('text-', 'text-')}`}>
                          {it.account_status || 'unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-2 pr-4">
                      <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-brand-primary transition-colors">{it.full_name || it.name || 'Unknown User'}</h3>
                      <p className="text-sm text-slate-500 truncate">{it.email}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                       <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       {it.created_at ? new Date(it.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                    </span>
                    <span className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Manage <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
