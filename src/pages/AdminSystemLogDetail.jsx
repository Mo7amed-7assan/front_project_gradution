import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getSystemLogById } from '../services/adminSystemLogs'
import { useAuth } from '../context/AuthContext'

const levelMap = {
  error:   { cls: 'badge-red',    icon: '❌',  label: 'ERROR' },
  warning: { cls: 'badge-yellow', icon: '⚠️',  label: 'WARN' },
  info:    { cls: 'badge-blue',   icon: 'ℹ️',  label: 'INFO' },
  debug:   { cls: 'badge-slate',  icon: '🐛',  label: 'DEBUG' },
  success: { cls: 'badge-green',  icon: '✅',  label: 'OK' },
}
const getLevelBadge = (lvl) => levelMap[`${lvl||'info'}`.toLowerCase()] || { cls: 'badge-slate', icon: '📋', label: `${lvl||'INFO'}`.toUpperCase() }

function InfoRow({ label, children, copyable = false }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <div className={`text-sm font-semibold text-slate-800 break-all ${copyable ? 'font-mono bg-slate-50 px-2 py-1 rounded inline-block border border-slate-100' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default function AdminSystemLogDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getSystemLogById(id)
        setItem(data)
      } catch (err) {
        console.error('Failed to load system log', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!item) return <div className="p-8 text-rose-600 font-bold">System log not found.</div>

  const badge = getLevelBadge(item.level)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/system-logs" className="text-sm text-brand-primary font-bold flex items-center gap-1 mb-2 hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to System Logs
          </Link>
          <h1 className="page-title text-brand-secondary">System Log Detail</h1>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0">
            {badge.icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {item.message || item.event || 'System Event'}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`${badge.cls} text-[10px] font-black`}>{badge.label}</span>
              <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                {item.context || 'system'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <InfoRow label="Timestamp">
              {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}
            </InfoRow>
            
            {item.description && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap">
                  {item.description}
                </div>
              </div>
            )}
            
            {item.user_agent && (
              <InfoRow label="User Agent">
                <span className="text-xs font-mono text-slate-500">{item.user_agent}</span>
              </InfoRow>
            )}
          </div>

          <div className="space-y-6">
            {item.user_id && (
              <InfoRow label="User ID" copyable>
                {item.user_id}
              </InfoRow>
            )}
            
            {item.ip_address && (
              <InfoRow label="IP Address" copyable>
                {item.ip_address}
              </InfoRow>
            )}
          </div>
        </div>

        {item.data && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Metadata Payload</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto">
              <pre className="text-xs text-slate-600 font-mono">
                {typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors inline-block ml-1">
          Raw JSON Data
        </summary>
        <pre className="mt-3 p-4 bg-slate-50 rounded-xl text-xs overflow-auto border border-slate-100 text-slate-600 font-mono">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </div>
  )
}
