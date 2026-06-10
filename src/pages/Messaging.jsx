import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  buildCallFrameUrl, cancelCall, endCall, extractCalls,
  getCall, initiateCall, joinCall, leaveCall, listCalls,
} from '../services/calls'
import { getConversations } from '../services/messaging'
import { getConnections } from '../services/connections'
import { getMyProjects, getProjectDetails } from '../services/project'
import { createFirebaseConversation, createFirebaseGroupConversation, getGroupConversation, listenToUserConversations, listenToUserPresence, sendRealtimeMessage } from '../services/realtimeChat'
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

const getCallId = (call) =>
  call?.id || call?.uuid || call?.call_id

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

const buildFirebaseDirectConversation = (myId, person) => {
    const otherUser = person?.person || person
    const personId = getPersonId(otherUser || person?.id)
    const participants = [normalizeId(myId), normalizeId(personId)].filter(Boolean).sort()

    if (participants.length < 2) {
      throw new Error('Cannot create a chat without both user IDs.')
    }

    return {
      conversation_type: 'direct',
      title: getPersonName(otherUser),
      participant_ids: participants,
      participants,
      users: [
        { id: normalizeId(myId) },
        {
          id: normalizeId(personId),
          full_name: getPersonName(otherUser),
          username: otherUser?.username || otherUser?.email || '',
          profile_picture_url: getPersonAvatar(otherUser),
        },
      ],
    }
  }

  const getProjectTeamMembers = (project) => {
    const rawTeam = project?.team || project?.team_members || project?.teamMembers || project?.members || project?.project_team || []
    if (!Array.isArray(rawTeam)) return []
    return rawTeam.map((member) => {
      const source = member?.user || member
      return getPersonId(source) || normalizeId(source)
    }).filter(Boolean)
  }

  const buildFirebaseProjectConversation = (myId, project, teamMembers = []) => {
    const projectId = getProjectId(project)
    if (!projectId) throw new Error('Cannot identify this project.')

    const members = Array.isArray(teamMembers) ? teamMembers : []
    const participantIds = new Set([normalizeId(myId)])
    const users = [{ id: normalizeId(myId) }]

    members.forEach((member) => {
      const source = member?.user || member
      const memberId = getPersonId(source)
      if (!memberId) return
      const normalizedId = normalizeId(memberId)
      if (participantIds.has(normalizedId)) return
      participantIds.add(normalizedId)
      users.push({
        id: normalizedId,
        full_name: getPersonName(source),
        username: source?.username || source?.email || '',
        profile_picture_url: getPersonAvatar(source),
      })
    })

    return {
      id: projectId,
      conversation_type: 'project',
      title: `Project: ${getProjectName(project)}`,
      project_id: projectId,
      participant_ids: Array.from(participantIds),
      participants: Array.from(participantIds),
      users,
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
  const autoOpenedProjectRef = useRef('')
  const [conversations, setConversations] = useState([])
  const [connections, setConnections] = useState([])
  const [projects, setProjects] = useState([])
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [selectedPersonId, setSelectedPersonId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedPersonPresence, setSelectedPersonPresence] = useState(null)
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

  const selectedProject = useMemo(
    () => projects.find((item) => normalizeKey(getProjectId(item)) === normalizeKey(selectedProjectId)),
    [projects, selectedProjectId]
  )

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => normalizeKey(getConversationId(conversation)) === normalizeKey(selectedConversationId)),
    [conversations, selectedConversationId]
  )

  useEffect(() => {
    if (!selectedPerson?.id) {
      setSelectedPersonPresence(null)
      return undefined
    }

    return listenToUserPresence(
      selectedPerson.id,
      (presence) => setSelectedPersonPresence(presence),
      () => {}
    )
  }, [selectedPerson?.id])

  const fetchConversations = async () => {
    const userId = getCurrentUserId(user)
    if (!userId) return []

    const res = await getConversations(userId)
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

  const upsertCall = (call) => {
    const callId = getCallId(call)
    if (!callId) return
    setCalls((prev) => {
      const exists = prev.some((item) => normalizeKey(getCallId(item)) === normalizeKey(callId))
      return exists
        ? prev.map((item) => normalizeKey(getCallId(item)) === normalizeKey(callId) ? { ...item, ...call } : item)
        : [call, ...prev]
    })
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

  useEffect(() => {
    const userId = getCurrentUserId(user)
    if (!userId) return undefined
    return listenToUserConversations(userId, setConversations, (err) => {
      setError(err?.message || 'Failed to load conversations.')
    })
  }, [user])

  const findDirectConversationForPerson = (personId) => {
    const myId = normalizeKey(getCurrentUserId(user))
    const targetId = normalizeKey(personId)
    return conversations.find((conversation) => {
      if (`${conversation?.conversation_type || ''}`.toLowerCase() !== 'direct') return false
      const participants = (conversation?.participants || conversation?.participant_ids || []).map(normalizeKey)
      return participants.length === 2 && participants.includes(myId) && participants.includes(targetId)
    })
  }

  const ensureConversationForPerson = async (person) => {
    const personId = getPersonId(person?.person || person?.id)
    if (!personId) throw new Error('Cannot identify this user.')

    const existing = findDirectConversationForPerson(personId)
    const existingId = getConversationId(existing)
    if (existingId) return existing

    const createdPayload = buildFirebaseDirectConversation(getCurrentUserId(user), person)
    const created = await createFirebaseConversation(createdPayload)

    setConversations((prev) => {
      const exists = prev.some((conversation) => normalizeKey(getConversationId(conversation)) === normalizeKey(getConversationId(created)))
      return exists ? prev : [created, ...prev]
    })
    return created
  }

  const ensureConversationForProject = async (project) => {
    const projectId = getProjectId(project)
    if (!projectId) throw new Error('Cannot identify this project.')

    const existing = conversations.find((conversation) => normalizeKey(conversation?.project_id) === normalizeKey(projectId))
    const existingId = getConversationId(existing)
    if (existingId) return existing

    const projectDetails = await getProjectDetails(projectId)
    const teamMembers = getProjectTeamMembers(projectDetails)
    const currentUserId = normalizeKey(getCurrentUserId(user))
    if (!teamMembers.map(normalizeKey).includes(currentUserId)) {
      throw new Error('You are not authorized to join this project chat.')
    }

    const existingGroupConversation = await getGroupConversation(projectId)
    if (existingGroupConversation) {
      setConversations((prev) => {
        const exists = prev.some((conversation) => normalizeKey(getConversationId(conversation)) === normalizeKey(getConversationId(existingGroupConversation)))
        return exists ? prev : [existingGroupConversation, ...prev]
      })
      return existingGroupConversation
    }

    const createdPayload = buildFirebaseProjectConversation(getCurrentUserId(user), projectDetails, projectDetails.team || teamMembers)
    const created = await createFirebaseGroupConversation(projectId, createdPayload)

    setConversations((prev) => {
      const exists = prev.some((conversation) => normalizeKey(getConversationId(conversation)) === normalizeKey(getConversationId(created)))
      return exists ? prev : [created, ...prev]
    })
    return created
  }

  const handleSelectPerson = async (person) => {
    if (normalizeKey(person.id) === normalizeKey(selectedPersonId) && selectedConversationId) return
    setError(null)
    setSelectedProjectId('')
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

  const handleSelectProject = async (project) => {
    const projectId = getProjectId(project)
    if (!projectId) return
    if (normalizeKey(projectId) === normalizeKey(selectedProjectId) && selectedConversationId) return

    setError(null)
    setSelectedPersonId('')
    setSelectedProjectId(projectId)
    setPreparingConversation(true)
    try {
      const conversation = await ensureConversationForProject(project)
      setSelectedConversationId(getConversationId(conversation))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to open project conversation.')
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
  }, [searchParams, connectedPeople, preparingConversation])

  useEffect(() => {
    const requestedProjectId = searchParams.get('project')
    if (!requestedProjectId || preparingConversation) return
    if (normalizeKey(autoOpenedProjectRef.current) === normalizeKey(requestedProjectId)) return
    if (projects.length === 0) return

    const project = projects.find((item) => normalizeKey(getProjectId(item)) === normalizeKey(requestedProjectId)) || { id: requestedProjectId, project_id: requestedProjectId }
    if (project) {
      autoOpenedProjectRef.current = requestedProjectId
      handleSelectProject(project)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, projects, preparingConversation])

  const openCallInPage = (call) => {
    const url = buildCallFrameUrl(call)
    if (!url) {
      setError('The call did not return a room URL yet. Try joining again.')
      return
    }
    setActiveCall(call)
    setCallFrameUrl(url)
  }

  const handleScheduleCall = async (scheduledAt) => {
    setError(null)
    if (!selectedConversationId) {
      setError('Choose a connected person or project first. Calls must be linked to a conversation.')
      throw new Error('No conversation selected.')
    }
    if (!scheduledAt) {
      setError('Please choose a date and time for the scheduled call.')
      throw new Error('No schedule date selected.')
    }

    const selectedConversation = conversations.find((conversation) =>
      normalizeKey(getConversationId(conversation)) === normalizeKey(selectedConversationId)
    )

    setStarting(true)
    try {
      const startTime = new Date(scheduledAt)
      if (Number.isNaN(startTime.getTime())) {
        throw new Error('Invalid scheduled date.')
      }
      const payload = selectedConversation?.conversation_type === 'project'
        ? { project_id: selectedConversation.project_id, status: 'scheduled', start_time: startTime.toISOString() }
        : { conversation_id: selectedConversationId, status: 'scheduled', start_time: startTime.toISOString() }

      const call = await initiateCall(payload)
      const callId = getCallId(call)
      if (!callId) throw new Error('The scheduled call was created, but no call ID was returned.')

      await sendRealtimeMessage(selectedConversationId, {
        text: `${user?.full_name || user?.name || user?.username || 'Someone'} scheduled a video call for ${startTime.toLocaleString()}.`,
        senderId: getCurrentUserId(user),
        senderName: user?.full_name || user?.name || user?.username || user?.email || 'You',
        senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
        messageType: 'call_invite',
        callId,
        callConversationId: call?.conversation_id || selectedConversationId,
        callProjectId: call?.project_id || selectedConversation?.project_id || '',
        callRoomName: call?.room_name || '',
      }, selectedConversation?.conversation_type)

      upsertCall(call)
      await fetchCalls()
      return call
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to schedule the call.')
      throw err
    } finally {
      setStarting(false)
    }
  }

  const handleStartCall = async () => {
    setError(null)
    if (!selectedConversationId) {
      setError('Choose a connected person or project first. Calls must be linked to a conversation.')
      return
    }

    const selectedConversation = conversations.find((conversation) =>
      normalizeKey(getConversationId(conversation)) === normalizeKey(selectedConversationId)
    )

    setStarting(true)
    try {
      const payload = selectedConversation?.conversation_type === 'project'
        ? { project_id: selectedConversation.project_id, status: 'active' }
        : { conversation_id: selectedConversationId, status: 'active' }

      const call = await initiateCall(payload)
      const callId = getCallId(call)
      if (!callId) throw new Error('The call was created, but no call ID was returned.')

      await sendRealtimeMessage(selectedConversationId, {
        text: `${user?.full_name || user?.name || user?.username || 'Someone'} started a video call.`,
        senderId: getCurrentUserId(user),
        senderName: user?.full_name || user?.name || user?.username || user?.email || 'You',
        senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
        messageType: 'call_invite',
        callId,
        callConversationId: call?.conversation_id || selectedConversationId,
        callProjectId: call?.project_id || selectedConversation?.project_id || '',
        callRoomUrl: call?.room_url || '',
        callJoinToken: call?.join_token || '',
        callRoomName: call?.room_name || '',
      }, selectedConversation?.conversation_type)
      upsertCall(call)
      openCallInPage(call)
      await fetchCalls()
      return call
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to start call.')
      throw err
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
      const project = projects.find((item) => normalizeKey(getProjectId(item)) === normalizeKey(projectId))
      const conversation = await ensureConversationForProject(project || { id: projectId, project_id: projectId })
      setSelectedProjectId(projectId)
      setSelectedPersonId('')
      setSelectedConversationId(getConversationId(conversation))

      const call = await initiateCall({ project_id: projectId, status: 'active' })

      await sendRealtimeMessage(getConversationId(conversation), {
        text: `${user?.full_name || user?.name || user?.username || 'Someone'} started a project call.`,
        senderId: getCurrentUserId(user),
        senderName: user?.full_name || user?.name || user?.username || user?.email || 'You',
        senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
        messageType: 'call_invite',
        callId: getCallId(call),
        callProjectId: call?.project_id || projectId,
        callRoomUrl: call?.room_url || '',
        callJoinToken: call?.join_token || '',
        callRoomName: call?.room_name || '',
        callUrl: call?.join_url || call?.meeting_url || call?.call_url || '',
      }, 'project')

      upsertCall(call)
      openCallInPage(call)
      await fetchCalls()
      return call
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to start project call.')
      throw err
    } finally {
      setStarting(false)
    }
  }

  const handleJoinCall = async (callId) => {
    setProcessingCallId(callId)
    setError(null)
    try {
      const call = await joinCall(callId)
      upsertCall(call)
      openCallInPage(call)
      await fetchCalls()
      return call
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to join call.')
      throw err
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

  const getCallConversationContext = (call) => {
    const projectConversation = call?.project_id
      ? conversations.find((conversation) => normalizeKey(conversation?.project_id) === normalizeKey(call.project_id))
      : null

    const conversationId = call?.conversation_id || getConversationId(projectConversation) || selectedConversationId
    const conversationType =
      selectedConversation?.conversation_type ||
      projectConversation?.conversation_type ||
      (call?.project_id ? 'project' : undefined)

    return { conversationId, conversationType }
  }

  const handleEndCall = async (call) => {
    const callId = getCallId(call)
    if (!callId) return
    setProcessingCallId(callId)
    try {
      await endCall(callId)
      if (normalizeKey(getCallId(activeCall)) === normalizeKey(callId)) {
        setActiveCall(null)
        setCallFrameUrl('')
      }
      const { conversationId, conversationType } = getCallConversationContext(call)
      if (conversationId) {
        await sendRealtimeMessage(conversationId, {
          text: `${user?.full_name || user?.name || user?.username || 'Someone'} ended the video call.`,
          senderId: getCurrentUserId(user),
          senderName: user?.full_name || user?.name || user?.username || user?.email || 'You',
          senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
          messageType: 'call_status',
          callId,
          callConversationId: call?.conversation_id || conversationId,
          callProjectId: call?.project_id || '',
          callStatus: 'ended',
        }, conversationType)
      }
      await fetchCalls()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to end call.')
    } finally {
      setProcessingCallId(null)
    }
  }

  const handleCancelCall = async (call) => {
    const callId = getCallId(call)
    if (!callId) return
    setProcessingCallId(callId)
    try {
      const cancelledCall = await cancelCall(callId)
      const nextCall = {
        ...call,
        ...cancelledCall,
        id: getCallId(cancelledCall) || callId,
        status: cancelledCall?.status || 'cancelled',
      }
      upsertCall(nextCall)
      if (normalizeKey(getCallId(activeCall)) === normalizeKey(callId)) {
        setActiveCall(null)
        setCallFrameUrl('')
      }

      const { conversationId, conversationType } = getCallConversationContext(nextCall)
      if (conversationId) {
        await sendRealtimeMessage(conversationId, {
          text: `${user?.full_name || user?.name || user?.username || 'Someone'} cancelled the video call.`,
          senderId: getCurrentUserId(user),
          senderName: user?.full_name || user?.name || user?.username || user?.email || 'You',
          senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
          messageType: 'call_status',
          callId,
          callConversationId: nextCall?.conversation_id || conversationId,
          callProjectId: nextCall?.project_id || '',
          callStatus: 'cancelled',
        }, conversationType)
      }
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

  const handleClearSelection = () => {
    setSelectedPersonId('')
    setSelectedProjectId('')
    setSelectedConversationId('')
    if (searchParams.toString()) {
      // Clear URL params via window.history to avoid unnecessary re-renders
      window.history.pushState({}, '', '/messages')
    }
  }

  return (
    <MessagingUI
      onClearSelection={handleClearSelection}
      loading={loading}
      connectedPeople={connectedPeople}
      projects={projects}
      preparingConversation={preparingConversation}
      selectedPersonId={selectedPersonId}
      selectedPerson={selectedPerson}
      selectedConversationId={selectedConversationId}
      selectedProject={selectedProject}
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
      onSelectProject={handleSelectProject}
      onStartCall={handleStartCall}
      onScheduleCall={handleScheduleCall}
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
      selectedConversation={selectedConversation}
      selectedPersonPresence={selectedPersonPresence}
    />
  )
}
