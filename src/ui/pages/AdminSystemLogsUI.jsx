import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

const levelMap = {
  error:   { cls: 'badge-red',    dot: 'bg-rose-500',    label: 'ERROR' },
  warning: { cls: 'badge-yellow', dot: 'bg-amber-500',   label: 'WARN' },
  info:    { cls: 'badge-blue',   dot: 'bg-blue-500',    label: 'INFO' },
  debug:   { cls: 'badge-slate',  dot: 'bg-slate-400',   label: 'DEBUG' },
  success: { cls: 'badge-green',  dot: 'bg-emerald-500', label: 'OK' },
}
const getLevelBadge = (lvl) => levelMap[`${lvl||'info'}`.toLowerCase()] || { cls: 'badge-green', dot: 'bg-emerald-500', label: `${lvl||'INFO'}`.toUpperCase() }

export default function AdminSystemLogsUI({ items, loading, level, setLevel, levels }) {
  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-brand-secondary">System Logs</h1>
          <p className="page-subtitle">Real-time system events and application log stream.</p>
        </div>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="form-select w-auto">
          <option value="">All Levels</option>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-[var(--border-color)]">
          <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)] text-2xl">🖥️</div>
          <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">No system logs found</h3>
          <p className="text-[var(--text-secondary)] text-sm">No logs match the selected level filter.</p>
        </div>
      ) : (
        <div className="card p-0 divide-y divide-slate-100 overflow-hidden">
          {items.map((log) => {
            const badge = getLevelBadge(log.level)
            return (
              <Link key={log.id} to={`/admin/system-logs/${log.id}`} className="block">
                <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${badge.dot}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`${badge.cls} text-[10px] font-black`}>{badge.label}</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
                        {log.context || 'system'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-brand-primary transition-colors truncate">
                      {log.message || log.event || 'No message'}
                    </p>
                    {log.description && (
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{log.description}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-[var(--text-hint)] font-medium shrink-0 pt-1">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown'}
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
