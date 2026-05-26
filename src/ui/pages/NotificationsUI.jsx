import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

/* ─── Toggle switch ─────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 ${checked ? 'bg-brand-primary' : 'bg-slate-200 hover:bg-slate-300'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

/* ─── Notification item ─────────────────────────────────────── */
function NotificationItem({ n, onMarkAsRead, onConnectionResponse, respondingTo, getProjectId, TYPE_LABELS, TYPE_STYLES }) {
  const read = !!(n.read_at || n.read || n.is_read)
  const projectId = getProjectId(n)
  const label = TYPE_LABELS[n.type] || n.type || 'Notification'
  let badgeClass = TYPE_STYLES[n.type] || 'badge-slate'
  
  // Custom styling overrides for premium look
  if (n.type === 'connection_request') badgeClass = 'bg-brand-primaryLight text-brand-primaryDark font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full'
  if (n.type === 'new_application') badgeClass = 'bg-blue-100 text-blue-700 font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full'
  if (n.type === 'application_accepted') badgeClass = 'bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full'
  if (n.type === 'application_rejected') badgeClass = 'bg-rose-100 text-rose-700 font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full'
  if (n.type === 'project_update') badgeClass = 'bg-amber-100 text-amber-700 font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full'
  if (n.type === 'team_invite') badgeClass = 'bg-purple-100 text-purple-700 font-bold px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full'

  return (
    <li className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 group ${
      read ? 'bg-white border-slate-100 hover:border-slate-200 shadow-sm' : 'bg-gradient-to-r from-brand-primaryLight/30 to-slate-50 border-brand-primaryLight shadow-md shadow-brand-primary/5 hover:border-brand-primary/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {!read && <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0 animate-pulse shadow-sm shadow-brand-primary/50"/>}
            <span className={badgeClass}>{label}</span>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
            </span>
          </div>

          {n.type === 'new_application' && projectId ? (
            <p className="text-base text-slate-800 leading-relaxed">
              You have a new application waiting for review.{' '}
              <Link to={`/projects/${projectId}/applications`} className="text-brand-primary hover:text-brand-primaryDark hover:underline font-bold transition-colors">
                View Applications →
              </Link>
            </p>
          ) : n.type === 'connection_request' ? (
            <div className="space-y-3">
              <p className="text-base text-slate-800 leading-relaxed">
                <span className="font-bold text-slate-900">{n.data?.requester?.full_name || 'Someone'}</span> would like to connect with you.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => onConnectionResponse(n.data?.connection_id, 'accepted')}
                  disabled={respondingTo === n.data?.connection_id}
                  className="btn-primary py-2 px-5 text-xs shadow-brand-primary/30"
                >
                  {respondingTo === n.data?.connection_id ? <Spinner /> : 'Accept Request'}
                </button>
                <button
                  onClick={() => onConnectionResponse(n.data?.connection_id, 'rejected')}
                  disabled={respondingTo === n.data?.connection_id}
                  className="btn-secondary text-rose-600 hover:bg-rose-50 hover:border-rose-200 py-2 px-5 text-xs"
                >
                  {respondingTo === n.data?.connection_id ? <Spinner /> : 'Decline'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-base font-bold text-slate-900">{n.title || n.subject || label}</p>
          )}

          {(n.message || n.body) && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-600 italic">
              {n.message || n.body}
            </div>
          )}
        </div>

        {!read && (
          <button
            onClick={() => onMarkAsRead(n.id)}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-colors shrink-0 group/btn shadow-sm"
            title="Mark as read"
          >
            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </button>
        )}
      </div>
    </li>
  )
}

export default function NotificationsUI({
  notifications,
  preferences,
  loading,
  loadingPreferences,
  savingPreferences,
  error,
  preferenceMessage,
  respondingTo,
  showPrefs,
  setShowPrefs,
  handleMarkAsRead,
  handleConnectionResponse,
  markAllRead,
  updatePreferenceField,
  handleSavePreferences,
  fetchPreferences,
  isRead,
  unreadCount,
  getProjectId,
  TYPE_LABELS,
  TYPE_STYLES
}) {
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title !mb-0 text-brand-secondary">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="page-subtitle">Stay updated on your projects and connections.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-brand-primary py-2 px-4 text-sm flex items-center gap-2 border-brand-primary/20 hover:bg-brand-primaryLight/50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Mark all read
            </button>
          )}
          <button onClick={() => setShowPrefs(v => !v)} className={`btn-primary py-2 px-4 text-sm flex items-center gap-2 shadow-brand-primary/30 transition-all ${showPrefs ? 'bg-brand-primaryDark shadow-inner' : ''}`}>
            <svg className={`w-4 h-4 transition-transform duration-300 ${showPrefs ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            {showPrefs ? 'Close Settings' : 'Settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {error}
        </div>
      )}

      {/* Preferences panel */}
      {showPrefs && (
        <div className="card p-6 border-brand-primaryLight shadow-md shadow-brand-primary/5 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
              <p className="text-sm text-slate-500 font-medium">Control how and when you receive notifications.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={fetchPreferences} disabled={loadingPreferences || savingPreferences} className="btn-secondary py-2 px-4 text-sm">
                {loadingPreferences ? 'Reloading...' : 'Reload'}
              </button>
              <button onClick={handleSavePreferences} disabled={savingPreferences || loadingPreferences} className="btn-primary shadow-brand-primary/30 py-2 px-6 text-sm">
                {savingPreferences ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {preferenceMessage && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${preferenceMessage.includes('Failed') ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {preferenceMessage.includes('Failed') 
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
              </svg>
              {preferenceMessage}
            </div>
          )}

          {loadingPreferences ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 skeleton rounded-xl"/>)}</div>
          ) : (
            <div className="space-y-8">
              {/* Toggles */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Delivery Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { field: 'platform_notifications', label: 'In-App Alerts', desc: 'Alerts while you use Co-Found', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
                    { field: 'email_notifications',    label: 'Email Updates', desc: 'Summaries sent to your inbox', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
                    { field: 'push_notifications',     label: 'Push Notifications', desc: 'Browser notifications', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> },
                  ].map(({ field, label, desc, icon }) => (
                    <div key={field} className="flex flex-col p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-brand-primary/30 transition-colors group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
                        </div>
                        <Toggle checked={!!preferences[field]} onChange={(v) => updatePreferenceField(field, v)} />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-800">{label}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other fields */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Quiet Hours & Digest</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="lg:col-span-1">
                    <label className="form-label">Digest Frequency</label>
                    <select value={preferences.notification_digest || 'immediate'} onChange={e => updatePreferenceField('notification_digest', e.target.value)} className="form-select bg-slate-50 font-medium">
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="form-label">Timezone</label>
                    <input type="text" value={preferences.quiet_hours_timezone || ''} onChange={e => updatePreferenceField('quiet_hours_timezone', e.target.value)} placeholder="e.g. Africa/Cairo" className="form-input bg-slate-50 font-medium"/>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="form-label">Quiet Hours Start</label>
                    <input type="time" value={preferences.quiet_hours_start || ''} onChange={e => updatePreferenceField('quiet_hours_start', e.target.value)} className="form-input bg-slate-50 font-medium"/>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="form-label">Quiet Hours End</label>
                    <input type="time" value={preferences.quiet_hours_end || ''} onChange={e => updatePreferenceField('quiet_hours_end', e.target.value)} className="form-input bg-slate-50 font-medium"/>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="card text-center py-16 px-4 border-2 border-dashed border-slate-200 mt-6">
          <div className="w-20 h-20 bg-brand-primaryLight rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform shadow-sm">
             <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">No new notifications. We'll let you know when something important happens.</p>
        </div>
      ) : (
        <ul className="space-y-4 pt-2">
          {notifications.map(n => (
            <NotificationItem
              key={n.id}
              n={n}
              onMarkAsRead={handleMarkAsRead}
              onConnectionResponse={handleConnectionResponse}
              respondingTo={respondingTo}
              getProjectId={getProjectId}
              TYPE_LABELS={TYPE_LABELS}
              TYPE_STYLES={TYPE_STYLES}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
