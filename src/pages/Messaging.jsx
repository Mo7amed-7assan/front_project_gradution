import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  buildCallFrameUrl, cancelCall, endCall, extractCalls,
  getCall, initiateCall, joinCall, leaveCall, listCalls,
} from '../services/calls'
import { getConversations, startConversation } from '../services/messaging'
import { getConnections } from '../services/connections'
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

export default function Messaging() {
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

  useEffect(() => { loadPage() }, [])

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

  const handleToggleWide = () => {
    setWideFrame((prev) => !prev)
  }

  return (
    <MessagingUI
      loading={loading}
      connectedPeople={connectedPeople}
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
      onJoinCall={handleJoinCall}
      onShowCallDetail={handleShowCallDetail}
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
