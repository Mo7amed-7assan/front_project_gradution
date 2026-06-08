import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import RealtimeChatPanel from '../../components/RealtimeChatPanel'

function CallStatusBadge({ status }) {
  const map = { active: 'bg-green-100 text-green-700', scheduled: 'bg-yellow-100 text-yellow-700', cancelled: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]', canceled: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]', ended: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]' }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${map[status] || 'bg-indigo-100 text-indigo-700'}`}>{status}</span>
}

function PersonAvatar({ name, avatar }) {
  const letter = (name || 'U').charAt(0).toUpperCase()
  if (avatar) return <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-[var(--border-color)] shrink-0" onError={(e) => { e.target.style.display = 'none' }} />
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 border border-indigo-200">
      {letter}
    </div>
  )
}

const getCallLabel = (call) => {
  const ctx = call.conversation_id ? `Conversation ${call.conversation_id}` : `Project ${call.project_id || ''}`
  return call.room_name || call.title || ctx
}

const canJoin = (call) => {
  const status = `${call.status || ''}`.toLowerCase()
  if (status === 'active') return true
  if (status === 'scheduled') {
    const startTime = call.start_time ? new Date(call.start_time) : null
    return startTime ? startTime.getTime() <= Date.now() : false
  }
  return false
}

export default function MessagingUI({
  loading,
  connectedPeople,
  projects = [],
  preparingConversation,
  selectedPersonId,
  selectedPerson,
  selectedProject,
  selectedConversation,
  selectedConversationId,
  selectedPersonPresence,
  calls,
  loadingCallDetail,
  selectedCallDetail,
  activeCall,
  callFrameUrl,
  processingCallId,
  starting,
  error,
  conversations,
  onSelectPerson,
  onSelectProject,
  onStartCall,
  onScheduleCall,
  onStartProjectCall,
  onJoinCall,
  onShowCallDetail,
  onCloseCallDetail,
  onLeaveCall,
  onEndCall,
  onCancelCall,
  setSelectedConversationId,
}) {
  const [activeRightTab, setActiveRightTab] = useState('messages')
  const [sidebarTab, setSidebarTab] = useState('connections')
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [localFullScreen, setLocalFullScreen] = useState(false)
  const [callOnlyMode, setCallOnlyMode] = useState(false)
  const [showCallOptions, setShowCallOptions] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduling, setScheduling] = useState(false)
  const [callOptionError, setCallOptionError] = useState(null)
  const videoContainerRef = useRef(null)
  const navigate = useNavigate()

  const handleHeaderClick = () => {
    if (selectedProject) {
      const projectId = getProjectId(selectedProject)
      if (projectId) navigate(`/projects/${projectId}`)
      return
    }
    if (selectedPerson?.id) {
      navigate(`/users/${selectedPerson.id}`)
    }
  }

  useEffect(() => {
    if (activeCall) {
      setSidebarTab('calls')
      setActiveRightTab('video')
      // If no person selected, enter call-only mode
      if (!selectedPerson) setCallOnlyMode(true)
    }
  }, [activeCall])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const hasFullScreenElement = !!document.fullscreenElement
      setIsFullScreen(hasFullScreenElement)
      if (hasFullScreenElement) setLocalFullScreen(false)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
      return
    }

    if (localFullScreen) {
      setLocalFullScreen(false)
      return
    }

    if (videoContainerRef.current?.requestFullscreen) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
        setLocalFullScreen(true)
      })
      return
    }

    setLocalFullScreen(true)
  }

  const getProjectId = (project) => project?.id || project?.uuid || project?.project_id || project?.project_uuid
  const getProjectName = (project) => project?.title || project?.name || `Project ${getProjectId(project) || ''}`.trim()
  const toggleCallOptions = () => {
    setShowCallOptions((prev) => !prev)
    setCallOptionError(null)
  }
  const handleCallNow = async () => {
    setCallOptionError(null)
    setShowCallOptions(false)
    await onStartCall?.()
  }
  const handleScheduleNow = async () => {
    if (!scheduleTime) {
      setCallOptionError('Please select a date and time.')
      return
    }
    setCallOptionError(null)
    setScheduling(true)
    try {
      await onScheduleCall?.(scheduleTime)
      setShowCallOptions(false)
      setScheduleTime('')
      setSidebarTab('calls')
    } catch (err) {
      setCallOptionError(err?.message || 'Failed to schedule call.')
    } finally {
      setScheduling(false)
    }
  }
  const formatCallDate = (value) => value ? new Date(value).toLocaleString() : '-'
  const callDetailRows = selectedCallDetail ? [
    ['Status', selectedCallDetail.status || '-'],
    ['Type', selectedCallDetail.call_type || '-'],
    ['Room', selectedCallDetail.room_name || '-'],
    ['Participants', selectedCallDetail.active_participants_count ?? selectedCallDetail.participants?.length ?? 0],
    ['Conversation ID', selectedCallDetail.conversation_id || '-'],
    ['Project ID', selectedCallDetail.project_id || '-'],
    ['Start', formatCallDate(selectedCallDetail.start_time)],
    ['End', formatCallDate(selectedCallDetail.end_time)],
    ['Created', formatCallDate(selectedCallDetail.created_at)],
  ] : []
  const isCallExpanded = isFullScreen || localFullScreen
  const fullScreenContainerClass = isCallExpanded ? 'fixed inset-0 z-[80] rounded-none border-none' : ''
  const fullScreenTitle = isCallExpanded ? 'Exit Full Screen' : 'Full Screen'
  const fullScreenIcon = isCallExpanded ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M15 9V4.5M15 9h4.5M9 15v4.5M9 15H4.5M15 15v4.5M15 15h4.5" /></svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
  )

  return (
    <div className="flex bg-[var(--bg-surface)] overflow-hidden h-[calc(100vh-4rem)]">
      
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-page)] relative z-10">
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm shrink-0">
          <div className="flex gap-2 bg-[var(--bg-hover)] p-1.5 rounded-xl border border-[var(--border-color)]/60">
             <button 
               onClick={() => setSidebarTab('connections')} 
               className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${sidebarTab === 'connections' ? 'bg-[var(--bg-surface)] shadow-sm text-indigo-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
             >
               Chats
             </button>
             <button 
               onClick={() => setSidebarTab('calls')} 
               className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${sidebarTab === 'calls' ? 'bg-[var(--bg-surface)] shadow-sm text-indigo-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
             >
               Calls
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold mb-2 text-center">
               {error}
            </div>
          )}

          {sidebarTab === 'connections' ? (
             <>
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 skeleton rounded-2xl" />)}
                  </div>
                ) : connectedPeople.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">No connections yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectedPeople.map((item) => {
                      const active = String(item.id) === String(selectedPersonId)
                      return (
                        <button
                          key={item.connection?.id || item.id}
                          onClick={() => onSelectPerson(item)}
                          disabled={preparingConversation}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${active ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-[var(--bg-surface)] border border-transparent hover:shadow-sm'}`}
                        >
                           <PersonAvatar name={item.name} avatar={item.avatar} />
                           <div className="flex-1 min-w-0 text-left">
                             <p className={`font-bold text-sm truncate ${active ? 'text-indigo-900' : 'text-[var(--text-primary)]'}`}>{item.name}</p>
                             <p className={`text-[11px] font-medium truncate ${active ? 'text-indigo-600' : 'text-[var(--text-hint)]'}`}>Start chatting...</p>
                           </div>
                           {active && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-sm"/>}
                        </button>
                      )
                    })}
                  </div>
                )}
                <div className="pt-4 border-t border-[var(--border-color)]">
                  <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-[var(--text-secondary)] font-bold">
                    <span>Project Chats</span>
                  </div>
                  {loading ? (
                    <div className="text-sm text-[var(--text-hint)]">Loading projects...</div>
                  ) : projects.length === 0 ? (
                    <div className="text-sm text-[var(--text-hint)]">No project chats available.</div>
                  ) : (
                    <div className="space-y-2">
                      {projects.map((project) => {
                        const projectId = getProjectId(project)
                        const projectName = getProjectName(project)
                        const active = String(projectId) === String(getProjectId(selectedProject) || '')
                        return (
                          <button
                            key={projectId}
                            onClick={() => onSelectProject(project)}
                            disabled={preparingConversation}
                            className={`w-full text-left p-3 rounded-2xl transition-all ${active ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-[var(--bg-surface)] border border-transparent hover:shadow-sm'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200">
                                {projectName?.charAt(0).toUpperCase() || 'P'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm truncate ${active ? 'text-indigo-900' : 'text-[var(--text-primary)]'}`}>{projectName}</p>
                                <p className="text-[11px] font-medium text-[var(--text-hint)] truncate">Project group chat</p>
                              </div>
                              {active && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-sm"/>}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
             </>
          ) : (
             <div className="flex flex-col h-full">
                   {loading ? (
                  <div className="space-y-3">
                    {[1,2].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
                  </div>
                ) : calls.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm font-medium text-[var(--text-secondary)]">No recent calls.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {calls.map((call) => {
                      const status = `${call.status || 'scheduled'}`.toLowerCase()
                      return (
                        <div key={call.id} className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-4 shadow-sm hover:shadow-md transition-all">
                           <div className="flex items-start justify-between gap-2 mb-3">
                             <div className="min-w-0">
                               <p className="font-bold text-[var(--text-primary)] text-sm truncate">{getCallLabel(call)}</p>
                               <p className="text-[10px] text-[var(--text-hint)] font-bold uppercase tracking-wider mt-1">{call.call_type || 'call'}</p>
                             </div>
                             <CallStatusBadge status={status} />
                           </div>
                           <div className="flex gap-2">
                              <button
                                onClick={() => onShowCallDetail(call.id)}
                                disabled={loadingCallDetail}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs px-3 py-1.5 flex-1 justify-center rounded-lg transition-colors border border-indigo-200 disabled:opacity-50"
                              >
                                {loadingCallDetail ? 'Loading...' : 'Details'}
                              </button>
                              {canJoin(call) && (
                                <button onClick={() => { onJoinCall(call.id); if (!selectedPerson) { setCallOnlyMode(true) } setActiveRightTab('video') }} className="btn-primary text-xs px-3 py-1.5 flex-1 justify-center rounded-lg shadow-sm">Join</button>
                              )}
                              {status === 'active' && (
                                <button onClick={() => onEndCall(call)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-3 py-1.5 flex-1 justify-center rounded-lg transition-colors border border-rose-200">End</button>
                              )}
                              {status === 'scheduled' && (
                                <button onClick={() => onCancelCall(call)} className="bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] font-bold text-xs px-3 py-1.5 flex-1 justify-center rounded-lg transition-colors border border-[var(--border-color)]">Cancel</button>
                              )}
                           </div>
                        </div>
                      )
                    })}
                  </div>
                )}
             </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-surface)] overflow-hidden relative">
         {sidebarTab === 'connections' && (selectedPerson || selectedProject) ? (
           <>
              {/* Header */}
              <div className="sticky top-0 z-20 h-[76px] border-b border-[var(--border-color)] flex items-center justify-between px-6 shrink-0 bg-[var(--bg-surface)]/80 backdrop-blur-md">
                 <button
                   type="button"
                   onClick={handleHeaderClick}
                   className="flex items-center gap-4 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/30 rounded-2xl px-2 py-1"
                 >
                    <PersonAvatar name={selectedProject ? getProjectName(selectedProject) : selectedPerson.name} avatar={selectedPerson?.avatar} />
                    <div>
                       <h3 className="font-bold text-[var(--text-primary)] text-lg leading-none mb-1.5 hover:text-indigo-600 transition-colors">
                         {selectedProject ? getProjectName(selectedProject) : selectedPerson.name}
                       </h3>
                       <p className="text-xs font-bold flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${selectedProject ? 'bg-indigo-500' : selectedPersonPresence?.online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {selectedProject
                            ? 'Project group chat'
                            : selectedPersonPresence
                              ? selectedPersonPresence.online ? 'Online' : 'Offline'
                              : 'Checking status...'}
                       </p>
                    </div>
                 </button>
                 <div className="flex items-center gap-3 relative">
                    <button
                      type="button"
                      onClick={toggleCallOptions}
                      disabled={!selectedConversationId || starting}
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Start call"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {showCallOptions && (
                      <div className="absolute right-0 top-full mt-2 w-[280px] rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl p-4 z-50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-[var(--text-primary)]">Video Call</span>
                          <button type="button" onClick={() => setShowCallOptions(false)} className="text-[var(--text-hint)] hover:text-[var(--text-secondary)] transition-colors">✕</button>
                        </div>
                        <button
                          type="button"
                          onClick={handleCallNow}
                          disabled={!selectedConversationId || starting}
                          className="w-full mb-2 rounded-2xl bg-indigo-600 text-white py-2 text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {starting ? 'Starting...' : 'Call now'}
                        </button>
                        <div className="border-t border-[var(--border-color)] pt-3">
                          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)] font-semibold mb-2">Schedule</p>
                          <input
                            type="datetime-local"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)]"
                          />
                          <button
                            type="button"
                            onClick={handleScheduleNow}
                            disabled={!scheduleTime || scheduling}
                            className="w-full mt-3 rounded-2xl bg-yellow-500 text-white py-2 text-sm font-bold hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {scheduling ? 'Scheduling...' : 'Schedule call'}
                          </button>
                          {callOptionError && <p className="mt-2 text-xs text-rose-600">{callOptionError}</p>}
                        </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden relative bg-[var(--bg-input)]">
                 {true ? (
                    <div className="absolute inset-0 flex flex-col [&>section]:border-none [&>section]:shadow-none [&>section]:h-full [&>section]:bg-transparent">
                       <RealtimeChatPanel
                          conversations={conversations}
                          selectedConversationId={selectedConversationId}
                          selectedConversation={selectedConversation}
                          selectedPersonPresence={selectedPersonPresence}
                          onSelectConversation={setSelectedConversationId}
                          onStartConversationCall={async () => {
                            await onStartCall()
                            setSidebarTab('calls')
                            setActiveRightTab('video')
                          }}
                          onJoinConversationCall={async (callId) => {
                            await onJoinCall(callId)
                            setSidebarTab('calls')
                            setActiveRightTab('video')
                          }}
                          compact={false}
                          showConversationSelector={false}
                          hideHeader={true}
                        />
                    </div>
                 ) : (
                    <div className="absolute inset-0 p-6 flex flex-col bg-[var(--bg-hover)]">
                       {callFrameUrl ? (
                         <div ref={videoContainerRef} className={`group rounded-3xl overflow-hidden bg-slate-900 shadow-2xl relative border border-[var(--border-color)] flex flex-col transition-all duration-300 ${isCallExpanded ? 'w-full h-full' : 'flex-1'} ${fullScreenContainerClass}`}>
                           <iframe
                              title="Video call"
                              src={callFrameUrl}
                              className="w-full h-full bg-[#0F0F1A]"
                              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                            {/* Fullscreen Toggle */}
                            <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={toggleFullScreen} className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all shadow-lg border border-white/10" title={fullScreenTitle}>
                                {fullScreenIcon}
                              </button>
                            </div>
                            
                            <div className="absolute top-6 left-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={onLeaveCall} disabled={processingCallId === activeCall?.id} className="px-4 py-2 rounded-full font-bold bg-rose-600/95 hover:bg-rose-500 text-white shadow-xl transition-all border border-rose-400/40 flex items-center gap-2 text-sm">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                 {processingCallId === activeCall?.id ? 'Leaving...' : 'End Call'}
                               </button>
                            </div>
                         </div>
                       ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-28 h-28 rounded-[2rem] bg-indigo-100 flex items-center justify-center mb-8 shadow-inner border border-white">
                               <svg className="w-14 h-14 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </div>
                            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">Ready to connect?</h2>
                            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-10 text-base leading-relaxed">Start a high-definition video call with <strong className="text-[var(--text-primary)]">{selectedPerson.name}</strong> instantly. Face-to-face collaboration is just one click away.</p>
                            <button 
                              onClick={() => { onStartCall(); setActiveRightTab('video') }}
                              disabled={starting || !selectedConversationId}
                              className="btn-primary px-10 py-4 text-lg rounded-2xl shadow-xl shadow-indigo-600/30 hover:-translate-y-1 transition-all flex items-center gap-3"
                            >
                               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                               {starting ? 'Starting Call...' : 'Start Video Call'}
                            </button>
                         </div>
                       )}
                    </div>
                 )}
              </div>
           </>
         ) : sidebarTab === 'calls' && callFrameUrl ? (
           // Call-only view — joined from calls tab without selecting a person
           <div className="flex-1 flex flex-col overflow-hidden relative bg-[var(--bg-hover)]">
             <div className="h-[76px] border-b border-[var(--border-color)] flex items-center justify-between px-6 shrink-0 bg-[var(--bg-surface)]/80 backdrop-blur-md z-20">
               <h3 className="font-bold text-[var(--text-primary)] text-lg">
                 {activeCall ? getCallLabel(activeCall) : 'Active Call'}
               </h3>
               <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">Live</span>
             </div>
             <div ref={videoContainerRef} className={`group flex-1 relative bg-slate-900 ${fullScreenContainerClass}`}>
               <iframe
                 title="Video call"
                 src={callFrameUrl}
                 className="absolute inset-0 w-full h-full bg-[#0F0F1A]"
                 allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                 referrerPolicy="no-referrer-when-downgrade"
               />
               <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={toggleFullScreen} className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all shadow-lg border border-white/10" title={fullScreenTitle}>
                   {fullScreenIcon}
                 </button>
               </div>
               <div className="absolute top-6 left-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={onLeaveCall} disabled={processingCallId === activeCall?.id} className="flex items-center gap-2 px-4 py-2 bg-rose-600/95 hover:bg-rose-500 text-white rounded-full font-bold text-sm transition-all shadow-xl border border-rose-400/40">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   {processingCallId === activeCall?.id ? 'Leaving...' : 'End Call'}
                 </button>
               </div>
             </div>
           </div>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-page)]">
             <div className="w-24 h-24 bg-[var(--bg-surface)] rounded-[2rem] shadow-sm flex items-center justify-center mb-6 border border-[var(--border-color)]">
               <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
               {sidebarTab === 'calls' ? 'No Active Call' : 'Your Messages'}
             </h2>
             <p className="text-[var(--text-secondary)] max-w-sm text-base">
               {sidebarTab === 'calls' ? 'Start or join a call from the calls list.' : 'Select a connection from the left sidebar to start chatting.'}
             </p>
           </div>
         )}
      </div>


      {selectedCallDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Call Details</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{getCallLabel(selectedCallDetail)}</p>
              </div>
              <button onClick={onCloseCallDetail} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-hint)] hover:text-[var(--text-secondary)] transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-3">
              {callDetailRows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-hint)]">{label}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] text-right break-all">{value}</span>
                </div>
              ))}
              {selectedCallDetail.room_url && (
                <div className="rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-hint)] mb-1">Room URL</p>
                  <p className="text-xs font-mono text-[var(--text-primary)] break-all">{selectedCallDetail.room_url}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
