import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  buildCallFrameUrl, cancelCall, endCall, extractCalls,
  getCall, initiateCall, joinCall, leaveCall, listCalls,
} from '../services/calls'
import { getConversations } from '../services/messaging'
import { getConnections } from '../services/connections'
import { getMyProjects } from '../services/projects'
import { sendRealtimeMessage } from '../services/realtimeChat'
import { getCurrentUserId } from '../utils/projectAccess'
import { useAuth } from '../context/AuthContext'
import MessagingUI from '../ui/pages/MessagingUI'

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

const extractProjectList = (value) => {
  const data = value?.data ?? value
  if (Array.isArray(data?.data?.data?.data)) return data.data.data.data
  if (Array.isArray(data?.data?.data)) return data.data.data
  if (Array.isArray(data?.data?.items)) return data.data.items
  if (Array.isArray(data?.data?.projects)) return data.data.projects
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.projects)) return data.projects
  if (Array.isArray(data)) return data
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
  person?.profile_picture_url || person?.avatar_url || person?.avatar || null

const getConversationId = (conversation) =>
  conversation?.id || conversation?.uuid || conversation?.conversation_id

const getProjectId = (project) =>
  project?.id || project?.uuid || project?.project_id || project?.project_uuid

const getProjectName = (project) =>
  project?.title || project?.name || `Project ${getProjectId(project) || ''}`.trim()

const getConversationData = (value) =>
  value?.data?.data?.conversation ||
  value?.data?.data ||
  value?.data?.conversation ||
  value?.data ||
  value?.conversation ||
  value

const safeFirebaseKey = (value) =>
  normalizeId(value)
    .trim()
    .replace(/[.#$[\]/]/g, '_')

const buildDirectCallRoom = (conversationId) =>
  `cofound-${safeFirebaseKey(conversationId)}-${Date.now()}`

const buildDirectCallUrl = (roomName) =>
  `https://meet.jit.si/${encodeURIComponent(roomName)}`

const createFirebaseDirectConversation = (myId, person) => {
  const otherUser = person?.person || person
  const personId = getPersonId(otherUser || person?.id)
  const participants = [normalizeId(myId), normalizeId(personId)].filter(Boolean).sort()

  if (participants.length < 2) {
    throw new Error('Cannot create a chat without both user IDs.')
  }

  return {
    id: `direct_${participants.map(safeFirebaseKey).join('_')}`,
    conversation_type: 'direct',
    title: getPersonName(otherUser),
    participant_ids: participants,
    users: [
      { id: normalizeId(myId) },
      {
        id: normalizeId(personId),
        full_name: getPersonName(otherUser),
        username: otherUser?.username || otherUser?.email || '',
        profile_picture_url: getPersonAvatar(otherUser),
      },
    ],
    is_firebase_only: true,
  }
}

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

export default function Messaging() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const autoOpenedUserRef = useRef('')
  const [conversations, setConversations] = useState([])
  const [connections, setConnections] = useState([])
  const [projects, setProjects] = useState([])
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

  const fetchProjects = async () => {
    const res = await getMyProjects({ per_page: 100 })
    const list = extractProjectList(res).filter((project) => getProjectId(project))
    setProjects(list)
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
      await Promise.allSettled([fetchConversations(), fetchConnections(), fetchProjects(), fetchCalls()])
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load messaging.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPage() }, [])

  const ensureConversationForPerson = async (person) => {
    const personId = getPersonId(person?.person || person?.id)
    if (!personId) throw new Error('Cannot identify this user.')

    const existing = conversations.find((conversation) => conversationIncludesPerson(conversation, personId))
    const existingId = getConversationId(existing)
    if (existingId) return existing

    const created = createFirebaseDirectConversation(getCurrentUserId(user), person)
    const createdId = getConversationId(created)

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
      const roomName = buildDirectCallRoom(selectedConversationId)
      const callUrl = buildDirectCallUrl(roomName)
      await sendRealtimeMessage(selectedConversationId, {
        text: `${user?.full_name || user?.name || user?.username || 'Someone'} started a video call.`,
        senderId: getCurrentUserId(user),
        senderName: user?.full_name || user?.name || user?.username || user?.email || 'You',
        senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
        messageType: 'call_invite',
        callUrl,
        callRoomName: roomName,
      })
      openCallInPage({
        id: roomName,
        call_type: 'direct',
        status: 'active',
        room_name: roomName,
        join_url: callUrl,
      })
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to start call.')
    } finally {
      setStarting(false)
    }
  }

  const handleStartProjectCall = async (projectId) => {
    setError(null)
    if (!projectId) {
      setError('Choose a project first.')
      return
    }

    setStarting(true)
    try {
      const call = await initiateCall({ project_id: projectId, status: 'active' })
      openCallInPage(call)
      await fetchCalls()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to start project call.')
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

  const handleToggleWide = () => {
    setWideFrame((prev) => !prev)
  }

  return (
    <MessagingUI
      loading={loading}
      connectedPeople={connectedPeople}
      projects={projects}
      preparingConversation={preparingConversation}
      selectedPersonId={selectedPersonId}
      selectedPerson={selectedPerson}
      selectedConversationId={selectedConversationId}
      calls={calls}
      loadingCallDetail={loadingCallDetail}
      selectedCallDetail={selectedCallDetail}
      activeCall={activeCall}
      callFrameUrl={callFrameUrl}
      frameHeight={frameHeight}
      wideFrame={wideFrame}
      processingCallId={processingCallId}
      starting={starting}
      error={error}
      conversations={conversations}
      onRefresh={loadPage}
      onSelectPerson={handleSelectPerson}
      onStartCall={handleStartCall}
      onStartProjectCall={handleStartProjectCall}
      onJoinCall={handleJoinCall}
      onShowCallDetail={handleShowCallDetail}
      onCloseCallDetail={() => setSelectedCallDetail(null)}
      onLeaveCall={handleLeaveCall}
      onEndCall={handleEndCall}
      onCancelCall={handleCancelCall}
      onGrowFrame={growFrame}
      onShrinkFrame={shrinkFrame}
      onResetFrame={resetFrame}
      onToggleWide={handleToggleWide}
      setSelectedConversationId={setSelectedConversationId}
    />
  )
}
