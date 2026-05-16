import React, { useEffect, useState } from 'react'
import {
  buildCallFrameUrl,
  cancelCall,
  endCall,
  extractCalls,
  getCall,
  initiateCall,
  joinCall,
  leaveCall,
  listCalls,
} from '../services/calls'
import { getConversations } from '../services/messaging'

const extractConversations = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data?.data?.data)) return value.data.data.data
  if (Array.isArray(value?.data?.data)) return value.data.data
  if (Array.isArray(value?.data?.conversations)) return value.data.conversations
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.conversations)) return value.conversations
  if (Array.isArray(value?.items)) return value.items
  return []
}

const getCallLabel = (call) => {
  const context = call.conversation_id ? `Conversation ${call.conversation_id}` : `Project ${call.project_id || ''}`
  return call.room_name || call.title || context
}

const canJoin = (call) => ['scheduled', 'active'].includes(`${call.status || ''}`.toLowerCase())

export default function Messaging(){
  const [conversations, setConversations] = useState([])
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [activeCall, setActiveCall] = useState(null)
  const [selectedCallDetail, setSelectedCallDetail] = useState(null)
  const [loadingCallDetail, setLoadingCallDetail] = useState(false)
  const [callFrameUrl, setCallFrameUrl] = useState('')
  const [frameHeight, setFrameHeight] = useState(78)
  const [wideFrame, setWideFrame] = useState(false)
  const [processingCallId, setProcessingCallId] = useState(null)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState(null)

  const fetchConversations = async () => {
    const res = await getConversations()
    const list = extractConversations(res)
    setConversations(list)
    if (!selectedConversationId && list[0]?.id) setSelectedConversationId(list[0].id)
  }

  const fetchCalls = async () => {
    const res = await listCalls({ per_page: 20 })
    setCalls(extractCalls(res))
  }

  const loadPage = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.allSettled([fetchConversations(), fetchCalls()])
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load messaging.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ loadPage() }, [])

  const openCallInPage = (call) => {
    const url = buildCallFrameUrl(call)
    if (!url) {
      setError('The call did not return a room URL yet. Try joining again.')
      return
    }
    setActiveCall(call)
    setCallFrameUrl(url)
  }

  const handleStartCall = async () => {
    setError(null)
    if (!selectedConversationId) {
      setError('Choose a conversation first. Calls must be linked to a conversation or project.')
      return
    }

    setStarting(true)
    try {
      const call = await initiateCall({ conversation_id: selectedConversationId, status: 'active' })
      openCallInPage(call)
      await fetchCalls()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to start call.')
    } finally {
      setStarting(false)
    }
  }

  const handleJoinCall = async (callId) => {
    setProcessingCallId(callId)
    setError(null)
    try {
      const call = await joinCall(callId)
      openCallInPage(call)
      await fetchCalls()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to join call.')
    } finally {
      setProcessingCallId(null)
    }
  }

  const handleShowCallDetail = async (callId) => {
    setLoadingCallDetail(true)
    setError(null)
    try {
      const call = await getCall(callId)
      setSelectedCallDetail(call)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load call details.')
    } finally {
      setLoadingCallDetail(false)
    }
  }

  const handleLeaveCall = async () => {
    if (!activeCall?.id) return
    setProcessingCallId(activeCall.id)
    try {
      await leaveCall(activeCall.id)
      setActiveCall(null)
      setCallFrameUrl('')
      await fetchCalls()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to leave call.')
    } finally {
      setProcessingCallId(null)
    }
  }

  const handleEndCall = async (call) => {
    setProcessingCallId(call.id)
    try {
      await endCall(call.id)
      if (activeCall?.id === call.id) {
        setActiveCall(null)
        setCallFrameUrl('')
      }
      await fetchCalls()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to end call.')
    } finally {
      setProcessingCallId(null)
    }
  }

  const handleCancelCall = async (call) => {
    setProcessingCallId(call.id)
    try {
      await cancelCall(call.id)
      await fetchCalls()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to cancel call.')
    } finally {
      setProcessingCallId(null)
    }
  }

  const growFrame = () => setFrameHeight((height) => Math.min(height + 8, 96))
  const shrinkFrame = () => setFrameHeight((height) => Math.max(height - 8, 48))
  const resetFrame = () => {
    setFrameHeight(78)
    setWideFrame(false)
  }

  return (
    <div className={`${wideFrame ? 'max-w-none' : 'max-w-6xl'} mx-auto bg-white p-6 rounded shadow`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Messaging</h2>
          <p className="text-sm text-gray-500 mt-1">Start, join, and manage video calls inside this page.</p>
        </div>
        <button onClick={loadPage} className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-50">Refresh</button>
      </div>

      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>}

      <div className={`grid grid-cols-1 ${wideFrame ? 'xl:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        <div className={`${wideFrame ? 'xl:col-span-1' : 'lg:col-span-1'} space-y-6`}>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Start a Call</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conversation</label>
            <select
              value={selectedConversationId}
              onChange={(e) => setSelectedConversationId(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
              disabled={conversations.length === 0}
            >
              {conversations.length === 0 ? (
                <option value="">No conversations available</option>
              ) : (
                conversations.map((conversation) => (
                  <option key={conversation.id} value={conversation.id}>
                    {conversation.title || conversation.conversation_type || `Conversation ${conversation.id}`}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={handleStartCall}
              disabled={starting || !selectedConversationId}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {starting ? 'Starting...' : 'Start Video Call'}
            </button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">My Calls</h3>
            {loading ? (
              <p className="text-gray-500">Loading calls...</p>
            ) : calls.length === 0 ? (
              <p className="text-gray-500">No calls yet.</p>
            ) : (
              <div className="space-y-3">
                {calls.map((call) => {
                  const status = `${call.status || 'scheduled'}`.toLowerCase()
                  return (
                    <div key={call.id} className="border rounded p-3">
                      <button
                        type="button"
                        onClick={() => handleShowCallDetail(call.id)}
                        className="w-full text-left"
                      >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{getCallLabel(call)}</p>
                          <p className="text-xs text-gray-500 capitalize">{call.call_type || 'call'} · {status}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          status === 'active' ? 'bg-green-100 text-green-800' :
                          status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {status}
                        </span>
                      </div>
                      </button>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => handleShowCallDetail(call.id)}
                          disabled={loadingCallDetail}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
                        >
                          Details
                        </button>
                        {canJoin(call) && (
                          <button
                            onClick={() => handleJoinCall(call.id)}
                            disabled={processingCallId === call.id}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs disabled:opacity-50"
                          >
                            {processingCallId === call.id ? 'Joining...' : 'Join'}
                          </button>
                        )}
                        {status === 'active' && (
                          <button
                            onClick={() => handleEndCall(call)}
                            disabled={processingCallId === call.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded text-xs disabled:opacity-50"
                          >
                            End
                          </button>
                        )}
                        {status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelCall(call)}
                            disabled={processingCallId === call.id}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Call Details</h3>
            {loadingCallDetail ? (
              <p className="text-gray-500">Loading call details...</p>
            ) : !selectedCallDetail ? (
              <p className="text-gray-500">Click any call to view its full details.</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>
                  <p className="font-mono text-xs break-all">{selectedCallDetail.id}</p>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium capitalize">{selectedCallDetail.status || '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{selectedCallDetail.call_type || '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Room</span>
                  <span className="font-medium text-right break-all">{selectedCallDetail.room_name || '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Participants</span>
                  <span className="font-medium">{selectedCallDetail.active_participants_count ?? selectedCallDetail.participants?.length ?? 0}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Start time</span>
                  <span className="font-medium text-right">{selectedCallDetail.start_time ? new Date(selectedCallDetail.start_time).toLocaleString() : '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">End time</span>
                  <span className="font-medium text-right">{selectedCallDetail.end_time ? new Date(selectedCallDetail.end_time).toLocaleString() : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Room URL:</span>
                  <p className="font-mono text-xs break-all">{selectedCallDetail.room_url || 'Not available until you join this call.'}</p>
                </div>

                {selectedCallDetail.initiator && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-500">Initiator:</span>
                    <p className="font-medium">
                      {selectedCallDetail.initiator.full_name || selectedCallDetail.initiator.name || selectedCallDetail.initiator.username || selectedCallDetail.initiator.id}
                    </p>
                  </div>
                )}

                {Array.isArray(selectedCallDetail.participants) && selectedCallDetail.participants.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-gray-500 mb-2">Participants</p>
                    <div className="space-y-2">
                      {selectedCallDetail.participants.map((participant) => (
                        <div key={participant.id || participant.user?.id || participant.user_id} className="bg-gray-50 rounded p-2">
                          <p className="font-medium">
                            {participant.user?.full_name || participant.user?.name || participant.user?.username || participant.user_id || 'Participant'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {participant.role || 'participant'} - {participant.left_at ? 'left' : 'active'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canJoin(selectedCallDetail) && (
                  <button
                    onClick={() => handleJoinCall(selectedCallDetail.id)}
                    disabled={processingCallId === selectedCallDetail.id}
                    className="w-full px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                  >
                    {processingCallId === selectedCallDetail.id ? 'Joining...' : 'Join This Call'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={wideFrame ? 'xl:col-span-3' : 'lg:col-span-2'}>
          {callFrameUrl ? (
            <div className="border rounded-lg overflow-hidden bg-gray-900">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 bg-gray-950 text-white">
                <div className="min-w-0">
                  <p className="font-medium truncate">{activeCall ? getCallLabel(activeCall) : 'Video call'}</p>
                  <p className="text-xs text-gray-300">Joined in this page · frame height {frameHeight}vh</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={shrinkFrame}
                    className="px-4 py-2 rounded text-sm font-bold shadow-sm"
                    style={{ backgroundColor: '#facc15', color: '#111827' }}
                  >
                    Make Smaller
                  </button>
                  <button
                    type="button"
                    onClick={growFrame}
                    className="px-4 py-2 rounded text-sm font-bold shadow-sm"
                    style={{ backgroundColor: '#22c55e', color: '#052e16' }}
                  >
                    Make Bigger
                  </button>
                  <button
                    type="button"
                    onClick={() => setWideFrame((value) => !value)}
                    className="px-4 py-2 rounded text-sm font-bold shadow-sm"
                    style={{ backgroundColor: '#38bdf8', color: '#082f49' }}
                  >
                    {wideFrame ? 'Normal Width' : 'Wide View'}
                  </button>
                  <button
                    type="button"
                    onClick={resetFrame}
                    className="px-4 py-2 rounded text-sm font-bold shadow-sm"
                    style={{ backgroundColor: '#c084fc', color: '#2e1065' }}
                  >
                    Reset Size
                  </button>
                  <button
                    onClick={handleLeaveCall}
                    disabled={processingCallId === activeCall?.id}
                    className="px-4 py-2 rounded text-sm font-bold shadow-sm disabled:opacity-50"
                    style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  >
                    {processingCallId === activeCall?.id ? 'Leaving...' : 'Leave Call'}
                  </button>
                </div>
              </div>
              <iframe
                title="Video call"
                src={callFrameUrl}
                className="w-full bg-black"
                style={{ height: `${frameHeight}vh` }}
                allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="border rounded-lg min-h-[28rem] flex items-center justify-center text-center p-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active call in page</h3>
                <p className="text-gray-500">Start or join a call and it will open here instead of a new tab.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
