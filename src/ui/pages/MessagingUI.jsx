import React from 'react'
import RealtimeChatPanel from '../../components/RealtimeChatPanel'

function CallStatusBadge({ status }) {
  const map = { active: 'badge-green', scheduled: 'badge-yellow', cancelled: 'badge-slate', ended: 'badge-slate' }
  return <span className={`badge ${map[status] || 'badge-indigo'} capitalize`}>{status}</span>
}

function PersonAvatar({ name, avatar }) {
  const letter = (name || 'U').charAt(0).toUpperCase()
  if (avatar) return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover bg-slate-100 shrink-0" onError={(e) => { e.target.style.display = 'none' }} />
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
      {letter}
    </div>
  )
}

const getCallLabel = (call) => {
  const ctx = call.conversation_id ? `Conversation ${call.conversation_id}` : `Project ${call.project_id || ''}`
  return call.room_name || call.title || ctx
}

const canJoin = (call) => ['scheduled', 'active'].includes(`${call.status || ''}`.toLowerCase())

export default function MessagingUI({
  loading,
  connectedPeople,
  preparingConversation,
  selectedPersonId,
  selectedPerson,
  selectedConversationId,
  calls,
  loadingCallDetail,
  selectedCallDetail,
  activeCall,
  callFrameUrl,
  frameHeight,
  wideFrame,
  processingCallId,
  starting,
  error,
  conversations,
  onRefresh,
  onSelectPerson,
  onStartCall,
  onJoinCall,
  onShowCallDetail,
  onLeaveCall,
  onEndCall,
  onCancelCall,
  onGrowFrame,
  onShrinkFrame,
  onResetFrame,
  onToggleWide,
  setSelectedConversationId,
}) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Messaging & Calls</h1>
          <p className="page-subtitle">Premium video calling and real-time chat with your connections.</p>
        </div>
        <button onClick={onRefresh} className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div className={`grid grid-cols-1 ${wideFrame ? 'xl:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {/* LEFT SIDEBAR */}
        <div className={`${wideFrame ? 'xl:col-span-1' : 'lg:col-span-1'} space-y-4`}>
          {/* Connected People */}
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Connections</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 skeleton rounded-xl"/>)}
              </div>
            ) : connectedPeople.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No accepted connections yet.</p>
            ) : (
              <div className="space-y-1.5">
                {connectedPeople.map((item) => {
                  const active = String(item.id) === String(selectedPersonId)
                  return (
                    <button
                      key={item.connection?.id || item.id}
                      type="button"
                      onClick={() => onSelectPerson(item)}
                      disabled={preparingConversation}
                      className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-150 disabled:opacity-60 ${
                        active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <PersonAvatar name={item.name} avatar={item.avatar} />
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-sm truncate ${active ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                        <p className={`text-xs truncate ${active ? 'text-indigo-200' : 'text-slate-400'}`}>{item.username || item.id}</p>
                      </div>
                      {active && <span className="w-2 h-2 rounded-full bg-white shrink-0"/>}
                    </button>
                  )
                })}
              </div>
            )}
            {preparingConversation && (
              <p className="text-xs text-slate-400 mt-3 text-center animate-pulse">Opening conversation…</p>
            )}
          </div>

          {/* Start a Call */}
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Video Call</h3>
            <div className="mb-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-1">Selected</p>
              <p className="text-sm font-medium text-slate-800 truncate">
                {selectedPerson ? selectedPerson.name : 'Choose a connection first'}
              </p>
            </div>
            <button
              onClick={onStartCall}
              disabled={starting || preparingConversation || !selectedConversationId}
              className="btn-primary w-full justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.57 19.79 19.79 0 01.1 1.02 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09"/>
              </svg>
              {starting ? 'Starting…' : 'Start Video Call'}
            </button>
          </div>

          {/* My Calls */}
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">My Calls</h3>
            {loading ? (
              <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-16 skeleton rounded-xl"/>)}</div>
            ) : calls.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No calls yet.</p>
            ) : (
              <div className="space-y-2">
                {calls.map((call) => {
                  const status = `${call.status || 'scheduled'}`.toLowerCase()
                  return (
                    <div key={call.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{getCallLabel(call)}</p>
                          <p className="text-xs text-slate-400 capitalize mt-0.5">{call.call_type || 'call'}</p>
                        </div>
                        <CallStatusBadge status={status} />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <button onClick={() => onShowCallDetail(call.id)} disabled={loadingCallDetail} className="btn-secondary text-xs px-2.5 py-1.5">Details</button>
                        {canJoin(call) && (
                          <button onClick={() => onJoinCall(call.id)} disabled={processingCallId === call.id} className="btn-primary text-xs px-2.5 py-1.5">
                            {processingCallId === call.id ? 'Joining…' : 'Join'}
                          </button>
                        )}
                        {status === 'active' && (
                          <button onClick={() => onEndCall(call)} disabled={processingCallId === call.id} className="btn-danger text-xs px-2.5 py-1.5">End</button>
                        )}
                        {status === 'scheduled' && (
                          <button onClick={() => onCancelCall(call)} disabled={processingCallId === call.id} className="btn-ghost text-xs px-2.5 py-1.5">Cancel</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Call Detail */}
          <div className="card p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Call Details</h3>
            {loadingCallDetail ? (
              <div className="space-y-2">{[1, 2, 3, 4].map(i => <div key={i} className="h-6 skeleton rounded"/>)}</div>
            ) : !selectedCallDetail ? (
              <p className="text-sm text-slate-400 text-center py-4">Click any call to view details.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {[
                  ['Status', selectedCallDetail.status || '-'],
                  ['Type', selectedCallDetail.call_type || '-'],
                  ['Room', selectedCallDetail.room_name || '-'],
                  ['Participants', selectedCallDetail.active_participants_count ?? selectedCallDetail.participants?.length ?? 0],
                  ['Start', selectedCallDetail.start_time ? new Date(selectedCallDetail.start_time).toLocaleString() : '-'],
                  ['End', selectedCallDetail.end_time ? new Date(selectedCallDetail.end_time).toLocaleString() : '-'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-400 text-xs font-medium">{label}</span>
                    <span className="font-medium text-slate-800 text-right text-xs capitalize truncate max-w-[60%]">{value}</span>
                  </div>
                ))}
                {selectedCallDetail.room_url && (
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-400 mb-1">Room URL</p>
                    <p className="font-mono text-[10px] break-all text-slate-600">{selectedCallDetail.room_url}</p>
                  </div>
                )}
                {canJoin(selectedCallDetail) && (
                  <button onClick={() => onJoinCall(selectedCallDetail.id)} disabled={processingCallId === selectedCallDetail.id} className="btn-primary w-full justify-center mt-3">
                    {processingCallId === selectedCallDetail.id ? 'Joining…' : 'Join This Call'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={wideFrame ? 'xl:col-span-3' : 'lg:col-span-2'}>
          <div className={`grid grid-cols-1 ${wideFrame ? '2xl:grid-cols-2' : 'xl:grid-cols-2'} gap-6 items-start`}>
            {/* Video call frame */}
            <div>
              {callFrameUrl ? (
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl shadow-brand-primary/20 border border-slate-800 flex flex-col group">
                  {/* Top Bar (Glassmorphic) */}
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                    <div className="flex items-center gap-3">
                       <span className="flex h-3 w-3 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                       </span>
                      <p className="font-semibold text-white text-sm truncate drop-shadow-md">{activeCall ? getCallLabel(activeCall) : 'Live Video Call'}</p>
                    </div>
                    <div className="text-[11px] text-white/70 font-mono tracking-wider drop-shadow-md pointer-events-auto flex gap-2">
                       <button onClick={onShrinkFrame} className="hover:text-white transition-colors">-</button>
                       <span>{frameHeight}vh</span>
                       <button onClick={onGrowFrame} className="hover:text-white transition-colors">+</button>
                    </div>
                  </div>

                  {/* The actual iframe */}
                  <iframe
                    title="Video call"
                    src={callFrameUrl}
                    className="w-full bg-[#0F0F1A]"
                    style={{ height: `${frameHeight}vh` }}
                    allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  {/* Bottom Controls Overlay (Glassmorphic) */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <button type="button" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors" title="Mute/Unmute">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </button>
                    <button type="button" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors" title="Start/Stop Video">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button type="button" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors" title="Share Screen">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </button>
                    <div className="w-px h-8 bg-white/20 mx-1"></div>
                    <button type="button" onClick={onToggleWide} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors" title="Toggle Layout">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    </button>
                    <button onClick={onLeaveCall} disabled={processingCallId === activeCall?.id} className="ml-2 px-6 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50">
                      {processingCallId === activeCall?.id ? 'Leaving…' : 'Leave'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card min-h-[36rem] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-brand-primaryLight/30 to-slate-50 border-brand-primaryLight relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiM2QzYzRkYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50"></div>
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-brand-primary/10 flex items-center justify-center mb-6 relative z-10 border border-brand-primaryLight">
                    <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-brand-secondary mb-2 relative z-10">Premium Video Calling</h3>
                  <p className="text-sm text-slate-500 max-w-sm relative z-10">Select a connection to initiate a high-definition video session, or join an active scheduled call from your list.</p>
                </div>
              )}
            </div>

            {/* Chat panel */}
            <RealtimeChatPanel
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              compact={wideFrame}
              showConversationSelector={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
