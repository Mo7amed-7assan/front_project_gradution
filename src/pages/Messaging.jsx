import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { getConversations, startConversation } from '../services/messaging'
import { getConnections } from '../services/connections'
import RealtimeChatPanel from '../components/RealtimeChatPanel'
import { getCurrentUserId } from '../utils/projectAccess'
import { useAuth } from '../context/AuthContext'

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

const extractConnectionList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data?.data)) return value.data.data
  if (Array.isArray(value?.data?.connections)) return value.data.connections
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.connections)) return value.connections
  if (Array.isArray(value?.items)) return value.items
  return []
}

const normalizeId = (value) => {
  if (value === null || value === undefined) return ''
  return `${value}`
}

const normalizeKey = (value) => normalizeId(value).toLowerCase()

const getRequesterId = (connection) =>
  normalizeKey(
    connection?.requester?.id ||
    connection?.requester?.uuid ||
    connection?.requester_id ||
    connection?.requester_uuid ||
    connection?.requester
  )

const getRecipientId = (connection) =>
  normalizeKey(
    connection?.recipient?.id ||
    connection?.recipient?.uuid ||
    connection?.recipient_id ||
    connection?.recipient_uuid ||
    connection?.recipient
  )

const getPersonId = (person) =>
  normalizeId(person?.id || person?.uuid || person?.user_id || person?.user?.id || person)

const getPersonName = (person) =>
  person?.full_name || person?.name || person?.username || person?.email || `User ${getPersonId(person) || ''}`

const getPersonAvatar = (person) =>
  person?.profile_picture_url || person?.avatar_url || person?.avatar || '/default-avatar.png'

const getConversationId = (conversation) =>
  conversation?.id || conversation?.uuid || conversation?.conversation_id

const getConversationData = (value) =>
  value?.data?.data?.conversation ||
  value?.data?.data ||
  value?.data?.conversation ||
  value?.data ||
  value?.conversation ||
  value

const getConversationParticipantIds = (conversation) => {
  const fields = [
    conversation?.recipient_id,
    conversation?.recipient?.id,
    conversation?.other_user_id,
    conversation?.other_user?.id,
    conversation?.user_id,
    conversation?.user?.id,
  ]

  const groups = [
    conversation?.participants,
    conversation?.users,
    conversation?.members,
    conversation?.participant_ids,
    conversation?.user_ids,
  ]

  groups.forEach((group) => {
    if (!Array.isArray(group)) return
    group.forEach((item) => {
      fields.push(item?.id, item?.uuid, item?.user_id, item?.user?.id, item)
    })
  })

  return fields.map(normalizeKey).filter(Boolean)
}

const conversationIncludesPerson = (conversation, personId) => {
  const id = normalizeKey(personId)
  if (!id) return false
  return getConversationParticipantIds(conversation).includes(id)
}

const createDirectConversation = async (personId) => {
  const payloads = [
    { conversation_type: 'direct', participant_ids: [personId] },
    { conversation_type: 'private', participant_ids: [personId] },
    { conversation_type: 'one_to_one', participant_ids: [personId] },
    { recipient_id: personId },
    { user_id: personId },
    { participant_id: personId },
    { participant_ids: [personId] },
    { participants: [personId] },
    { conversation_type: 'direct', recipient_id: personId },
    { type: 'direct', recipient_id: personId },
  ]
  let lastError = null

  for (const payload of payloads) {
    try {
      const res = await startConversation(payload)
      return getConversationData(res)
    } catch (err) {
      lastError = err
      const status = err?.response?.status
      if (status !== 400 && status !== 409 && status !== 422) throw err
    }
  }

  throw lastError || new Error('Failed to create conversation.')
}

const getCallLabel = (call) => {
  const context = call.conversation_id ? `Conversation ${call.conversation_id}` : `Project ${call.project_id || ''}`
  return call.room_name || call.title || context
}

const canJoin = (call) => ['scheduled', 'active'].includes(`${call.status || ''}`.toLowerCase())

export default function Messaging(){
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const autoOpenedUserRef = useRef('')
  const [conversations, setConversations] = useState([])
  const [connections, setConnections] = useState([])
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [selectedPersonId, setSelectedPersonId] = useState('')
  const [activeCall, setActiveCall] = useState(null)
  const [selectedCallDetail, setSelectedCallDetail] = useState(null)
  const [loadingCallDetail, setLoadingCallDetail] = useState(false)
  const [callFrameUrl, setCallFrameUrl] = useState('')
  const [frameHeight, setFrameHeight] = useState(78)
  const [wideFrame, setWideFrame] = useState(false)
  const [processingCallId, setProcessingCallId] = useState(null)
  const [preparingConversation, setPreparingConversation] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState(null)

  const connectedPeople = useMemo(() => {
    const myId = normalizeKey(getCurrentUserId(user))
    return connections
      .filter((connection) => `${connection.status || ''}`.toLowerCase() === 'accepted')
      .map((connection) => {
        const isRequester = getRequesterId(connection) === myId
        const person = isRequester ? connection.recipient : connection.requester
        const fallbackId = isRequester ? getRecipientId(connection) : getRequesterId(connection)
        return {
          connection,
          person,
          id: getPersonId(person) || fallbackId,
          name: getPersonName(person || fallbackId),
          avatar: getPersonAvatar(person),
          username: person?.username || person?.email || '',
        }
      })
      .filter((item) => item.id)
  }, [connections, user])

  const selectedPerson = useMemo(
    () => connectedPeople.find((item) => normalizeKey(item.id) === normalizeKey(selectedPersonId)),
    [connectedPeople, selectedPersonId]
  )

  const fetchConversations = async () => {
    const res = await getConversations()
    const list = extractConversations(res)
    setConversations(list)
    return list
  }

  const fetchConnections = async () => {
    const res = await getConnections({ sort_by: 'all' })
    const list = extractConnectionList(res)
    setConnections(list)
    return list
  }

  const fetchCalls = async () => {
    const res = await listCalls({ per_page: 20 })
    setCalls(extractCalls(res))
  }

  const loadPage = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.allSettled([fetchConversations(), fetchConnections(), fetchCalls()])
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load messaging.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ loadPage() }, [])

  const ensureConversationForPerson = async (person) => {
    const personId = getPersonId(person?.person || person?.id)
    if (!personId) throw new Error('Cannot identify this user.')

    const existing = conversations.find((conversation) => conversationIncludesPerson(conversation, personId))
    const existingId = getConversationId(existing)
    if (existingId) return existing

    let created
    try {
      created = await createDirectConversation(personId)
    } catch (err) {
      if (err?.response?.status !== 409 && err?.response?.status !== 422) throw err
      const freshConversations = await fetchConversations()
      const existingAfterRefresh = freshConversations.find((conversation) => conversationIncludesPerson(conversation, personId))
      if (existingAfterRefresh) return existingAfterRefresh
      throw err
    }

    const createdId = getConversationId(created)
    if (!createdId) throw new Error('The API created a conversation but did not return its ID.')

    setConversations((prev) => {
      const exists = prev.some((conversation) => normalizeKey(getConversationId(conversation)) === normalizeKey(createdId))
      return exists ? prev : [created, ...prev]
    })
    return created
  }

  const handleSelectPerson = async (person) => {
    if (normalizeKey(person.id) === normalizeKey(selectedPersonId) && selectedConversationId) return
    setError(null)
    setSelectedPersonId(person.id)
    setPreparingConversation(true)
    try {
      const conversation = await ensureConversationForPerson(person)
      setSelectedConversationId(getConversationId(conversation))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to open conversation with this connection.')
    } finally {
      setPreparingConversation(false)
    }
  }

  useEffect(() => {
    const requestedUserId = searchParams.get('user')
    if (!requestedUserId || connectedPeople.length === 0 || preparingConversation) return
    if (normalizeKey(autoOpenedUserRef.current) === normalizeKey(requestedUserId)) return
    const person = connectedPeople.find((item) => normalizeKey(item.id) === normalizeKey(requestedUserId))
    if (person) {
      autoOpenedUserRef.current = requestedUserId
      handleSelectPerson(person)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, connectedPeople])

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
      setError('Choose a connected person first. Calls must be linked to a conversation.')
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
          <p className="text-sm text-gray-500 mt-1">Choose a connection, then chat or start a video call.</p>
        </div>
        <button onClick={loadPage} className="px-3 py-2 rounded border text-gray-700 hover:bg-gray-50">Refresh</button>
      </div>

      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>}

      <div className={`grid grid-cols-1 ${wideFrame ? 'xl:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        <div className={`${wideFrame ? 'xl:col-span-1' : 'lg:col-span-1'} space-y-6`}>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Connected People</h3>
            {loading ? (
              <p className="text-gray-500">Loading connections...</p>
            ) : connectedPeople.length === 0 ? (
              <p className="text-gray-500">No accepted connections yet.</p>
            ) : (
              <div className="space-y-2">
                {connectedPeople.map((item) => {
                  const active = normalizeKey(item.id) === normalizeKey(selectedPersonId)
                  return (
                    <button
                      key={item.connection?.id || item.id}
                      type="button"
                      onClick={() => handleSelectPerson(item)}
                      disabled={preparingConversation}
                      className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition disabled:opacity-60 ${
                        active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.username || item.id}</p>
                      </div>
                      {active && <span className="text-xs text-blue-700 font-medium">Open</span>}
                    </button>
                  )
                })}
              </div>
            )}
            {preparingConversation && <p className="text-xs text-gray-500 mt-3">Opening conversation...</p>}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Start a Call</h3>
            <div className="mb-3 rounded border bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Selected person</p>
              <p className="font-medium text-gray-900 truncate">
                {selectedPerson ? selectedPerson.name : 'Choose someone from your connections'}
              </p>
            </div>
            <button
              onClick={handleStartCall}
              disabled={starting || preparingConversation || !selectedConversationId}
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
                      <button type="button" onClick={() => handleShowCallDetail(call.id)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{getCallLabel(call)}</p>
                            <p className="text-xs text-gray-500 capitalize">{call.call_type || 'call'} - {status}</p>
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
                        <button onClick={() => handleShowCallDetail(call.id)} disabled={loadingCallDetail} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs disabled:opacity-50">
                          Details
                        </button>
                        {canJoin(call) && (
                          <button onClick={() => handleJoinCall(call.id)} disabled={processingCallId === call.id} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs disabled:opacity-50">
                            {processingCallId === call.id ? 'Joining...' : 'Join'}
                          </button>
                        )}
                        {status === 'active' && (
                          <button onClick={() => handleEndCall(call)} disabled={processingCallId === call.id} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs disabled:opacity-50">
                            End
                          </button>
                        )}
                        {status === 'scheduled' && (
                          <button onClick={() => handleCancelCall(call)} disabled={processingCallId === call.id} className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs disabled:opacity-50">
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
                  <button onClick={() => handleJoinCall(selectedCallDetail.id)} disabled={processingCallId === selectedCallDetail.id} className="w-full px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
                    {processingCallId === selectedCallDetail.id ? 'Joining...' : 'Join This Call'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={wideFrame ? 'xl:col-span-3' : 'lg:col-span-2'}>
          <div className={`grid grid-cols-1 ${wideFrame ? '2xl:grid-cols-2' : 'xl:grid-cols-2'} gap-6 items-start`}>
            <div>
              {callFrameUrl ? (
                <div className="border rounded-lg overflow-hidden bg-gray-900">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 bg-gray-950 text-white">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{activeCall ? getCallLabel(activeCall) : 'Video call'}</p>
                      <p className="text-xs text-gray-300">Joined in this page - frame height {frameHeight}vh</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={shrinkFrame} className="px-4 py-2 rounded text-sm font-bold shadow-sm" style={{ backgroundColor: '#facc15', color: '#111827' }}>Make Smaller</button>
                      <button type="button" onClick={growFrame} className="px-4 py-2 rounded text-sm font-bold shadow-sm" style={{ backgroundColor: '#22c55e', color: '#052e16' }}>Make Bigger</button>
                      <button type="button" onClick={() => setWideFrame((value) => !value)} className="px-4 py-2 rounded text-sm font-bold shadow-sm" style={{ backgroundColor: '#38bdf8', color: '#082f49' }}>
                        {wideFrame ? 'Normal Width' : 'Wide View'}
                      </button>
                      <button type="button" onClick={resetFrame} className="px-4 py-2 rounded text-sm font-bold shadow-sm" style={{ backgroundColor: '#c084fc', color: '#2e1065' }}>Reset Size</button>
                      <button onClick={handleLeaveCall} disabled={processingCallId === activeCall?.id} className="px-4 py-2 rounded text-sm font-bold shadow-sm disabled:opacity-50" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>
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
                <div className="border rounded-lg min-h-[32rem] flex items-center justify-center text-center p-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No active call in page</h3>
                    <p className="text-gray-500">Choose a connection, then start or join a call.</p>
                  </div>
                </div>
              )}
            </div>

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
