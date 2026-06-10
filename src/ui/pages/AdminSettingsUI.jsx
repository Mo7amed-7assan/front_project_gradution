import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

export default function AdminSettingsUI({
  items,
  loading,
  search,
  setSearch,
  getTypeBadgeColor
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">System Settings</h1>
          <p className="page-subtitle">Manage global configuration, feature flags, and environment variables.</p>
        </div>
      </div>

      <div className="card p-6 border-brand-primaryLight shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border-color)]">
           <div className="flex items-center gap-2">
             <div className="w-10 h-10 bg-brand-primaryLight rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <div>
               <h2 className="text-lg font-bold text-[var(--text-primary)]">Configuration Registry</h2>
               <p className="text-xs text-[var(--text-secondary)] font-medium">{items.length} active variables</p>
             </div>
           </div>
           
           <div className="relative w-full sm:w-72">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-hint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Search keys or descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-9 py-2 text-sm w-full bg-[var(--bg-hover)] focus:bg-white transition-colors"
              />
           </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--bg-hover)]">
            <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border-color)]">
               <svg className="w-8 h-8 text-[var(--text-hint)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">No settings found</h3>
            <p className="text-sm text-[var(--text-secondary)]">Could not find any configuration matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((it) => (
              <Link key={it.key} to={`/admin/settings/${it.key}`} className="group card p-5 border-[var(--border-color)] hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                       <svg className="w-4 h-4 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                       <div className="font-bold text-[var(--text-primary)] font-mono text-sm group-hover:text-brand-primary transition-colors truncate" title={it.key}>{it.key}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                       {it.is_public && (
                         <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-700">Public</span>
                       )}
                       <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getTypeBadgeColor(it.type).replace('badge-', 'bg-').replace('text-', 'text-')}`}>
                         {it.type || 'unknown'}
                       </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{it.description || 'No description provided for this setting.'}</p>
                </div>
                
                <div className="pt-4 border-t border-[var(--border-color)] bg-[var(--bg-hover)] -mx-5 -mb-5 px-5 py-3 rounded-b-2xl flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-[10px] font-bold text-[var(--text-hint)] uppercase tracking-wider mb-1">Current Value</div>
                    <div className="font-mono text-xs text-[var(--text-primary)] truncate bg-[var(--bg-surface)] px-2 py-1.5 rounded-lg border border-[var(--border-color)]">
                       {String(it.value)}
                    </div>
                  </div>
                  <div className="shrink-0 text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
