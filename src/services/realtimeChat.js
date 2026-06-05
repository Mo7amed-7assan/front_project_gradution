import
{
  off,
  get,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  set,
} from 'firebase/database'
import { db } from './firebase'

const getMessagesRef = (conversationId) =>
  ref(db, `conversations/${String(conversationId)}/messages`)

const getConversationsRef = () => ref(db, 'conversations')
const getConversationRef = (conversationId) => ref(db, `conversations/${String(conversationId)}`)
const getGroupConversationsRef = () => ref(db, 'group_conversations')
const getGroupConversationRef = (projectId) => ref(db, `group_conversations/${String(projectId)}`)
const getGroupMessagesRef = (projectId) => ref(db, `group_conversations/${String(projectId)}/messages`)

const normalizeConversationParticipant = (participant) =>
{
  if (participant === null || participant === undefined) return ''
  if (typeof participant === 'string' || typeof participant === 'number') return String(participant).trim()
  if (typeof participant === 'object')
  {
    return String(participant.id || participant.uuid || participant.user_id || participant.user?.id || participant).trim()
  }
  return ''
}

const getConversationParticipantIds = (conversation) =>
{
  const rawParticipants = [
    conversation?.participants,
    conversation?.participant_ids,
    conversation?.users,
    conversation?.user_ids,
  ]

  return rawParticipants.flatMap((group) =>
  {
    if (!group) return []
    if (Array.isArray(group)) return group.map(normalizeConversationParticipant)
    return [normalizeConversationParticipant(group)]
  })
    .filter(Boolean)
    .map((id) => String(id).trim())
}

const isParticipantInConversation = (conversation, userId) =>
{
  if (!userId) return false
  const normalizedUserId = String(userId).trim()
  return getConversationParticipantIds(conversation).includes(normalizedUserId)
}

export const listenToConversationMessages = (conversationId, conversationType, onMessages, onError) =>
{
  if (!conversationId) return () => { }

  const messagesRef = conversationType === 'project'
    ? getGroupMessagesRef(conversationId)
    : getMessagesRef(conversationId)

  const messagesQuery = query(messagesRef, orderByChild('createdAt'))

  const handleValue = (snapshot) =>
  {
    const value = snapshot.val() || {}
    const messages = Object.entries(value)
      .map(([id, message]) => ({ id, ...message }))
      .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0))

    onMessages(messages)
  }

  const unsubscribe = onValue(messagesQuery, handleValue, onError)

  return () =>
  {
    unsubscribe()
    off(messagesQuery)
  }
}

const mergeConversationLists = (directConversations, groupConversations) =>
{
  const seenIds = new Set()
  return [...directConversations, ...groupConversations].filter((conversation) =>
  {
    const id = String(conversation?.id || conversation?.project_id || conversation?.conversation_id || '').trim()
    if (!id || seenIds.has(id)) return false
    seenIds.add(id)
    return true
  })
}

export const listenToUserConversations = (userId, onConversations, onError) =>
{
  if (!userId || !onConversations) return () => { }

  let directConversations = []
  let groupConversations = []

  const publish = () => onConversations(mergeConversationLists(directConversations, groupConversations))

  const handleDirectValue = (snapshot) =>
  {
    const value = snapshot.val() || {}
    directConversations = Object.entries(value)
      .map(([id, conversation]) => ({ id, ...conversation }))
      .filter((conversation) => isParticipantInConversation(conversation, userId))
    publish()
  }

  const handleGroupValue = (snapshot) =>
  {
    const value = snapshot.val() || {}
    groupConversations = Object.entries(value)
      .map(([id, conversation]) => ({ id, conversation_type: 'project', ...conversation }))
      .filter((conversation) => isParticipantInConversation(conversation, userId))
    publish()
  }

  const unsubscribeDirect = onValue(getConversationsRef(), handleDirectValue, onError)
  const unsubscribeGroup = onValue(getGroupConversationsRef(), handleGroupValue, onError)

  return () =>
  {
    unsubscribeDirect()
    unsubscribeGroup()
    off(getConversationsRef())
    off(getGroupConversationsRef())
  }
}

export const getFirebaseConversations = async (userId = '') =>
{
  const [directSnapshot, groupSnapshot] = await Promise.all([
    get(getConversationsRef()),
    get(getGroupConversationsRef()),
  ])

  const directValue = directSnapshot.val() || {}
  const groupValue = groupSnapshot.val() || {}

  const directConversations = Object.entries(directValue)
    .map(([id, conversation]) => ({ id, ...conversation }))

  const groupConversations = Object.entries(groupValue)
    .map(([id, conversation]) => ({ id, conversation_type: 'project', ...conversation }))

  return mergeConversationLists(directConversations, groupConversations)
    .filter((conversation) => !userId || isParticipantInConversation(conversation, userId))
}

export const getFirebaseConversationMessages = async (conversationId, conversationType = 'direct') =>
{
  const snapshot = await get(
    conversationType === 'project'
      ? getGroupMessagesRef(conversationId)
      : getMessagesRef(conversationId)
  )
  const value = snapshot.val() || {}
  return Object.entries(value)
    .map(([id, message]) => ({ id, ...message }))
    .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0))
}

export const getGroupConversation = async (projectId) =>
{
  const snapshot = await get(getGroupConversationRef(projectId))
  const value = snapshot.val() || null
  return value ? { id: projectId, conversation_type: 'project', ...value } : null
}

export const createFirebaseGroupConversation = async (projectId, conversation) =>
{
  const now = new Date().toISOString()
  const payload = {
    ...conversation,
    id: projectId,
    project_id: projectId,
    conversation_type: 'project',
    created_at: conversation.created_at || now,
    updated_at: now,
  }
  await set(getGroupConversationRef(projectId), payload)
  return payload
}

const getPresenceRef = (userId) => ref(db, `presence/${String(userId)}`)

export const trackUserPresence = (userId) =>
{
  if (!userId) return () => { }

  const presenceRef = getPresenceRef(userId)
  const connectedRef = ref(db, '.info/connected')
  const onlineStatus = {
    state: 'online',
    status: 'online',
    online: true,
    last_changed: serverTimestamp(),
  }
  const offlineStatus = {
    state: 'offline',
    status: 'offline',
    online: false,
    last_changed: serverTimestamp(),
  }

  const markOffline = () => {
    set(presenceRef, offlineStatus).catch(() => { })
  }

  const unsubscribe = onValue(connectedRef, (snapshot) =>
  {
    if (snapshot.val() !== true) return

    onDisconnect(presenceRef)
      .set(offlineStatus)
      .then(() => set(presenceRef, onlineStatus))
      .catch(() => { })
  })

  window.addEventListener('pagehide', markOffline)
  window.addEventListener('beforeunload', markOffline)

  return () =>
  {
    unsubscribe()
    window.removeEventListener('pagehide', markOffline)
    window.removeEventListener('beforeunload', markOffline)
    markOffline()
  }
}

export const listenToUserPresence = (userId, onPresence, onError) =>
{
  if (!userId || typeof onPresence !== 'function') return () => { }

  const handleValue = (snapshot) =>
  {
    const value = snapshot.val()
    let state = 'offline'

    if (value && typeof value === 'object')
    {
      state = String(value.state || value.status || value.online || 'offline').toLowerCase()
    } else if (typeof value === 'boolean')
    {
      state = value ? 'online' : 'offline'
    } else if (typeof value === 'string')
    {
      state = value.toLowerCase()
    }

    const online = ['online', 'active', 'true', '1'].includes(state)
    const lastSeen = value?.last_changed || value?.lastSeen || value?.last_seen || null

    onPresence({
      state: online ? 'online' : 'offline',
      online,
      lastSeen,
      raw: value,
    })
  }

  const unsubscribe = onValue(getPresenceRef(userId), handleValue, onError)

  return () =>
  {
    unsubscribe()
    off(getPresenceRef(userId))
  }
}

export const createFirebaseConversation = async (conversation) =>
{
  const conversationRef = push(getConversationsRef())
  const conversationId = conversationRef.key
  const now = new Date().toISOString()
  const payload = {
    ...conversation,
    id: conversationId,
    created_at: conversation.created_at || now,
  }
  await set(conversationRef, payload)
  return payload
}

export const sendRealtimeMessage = async (conversationId, payload, conversationType = 'direct') =>
{
  if (!conversationId) throw new Error('Conversation is required.')
  const text = `${payload?.text || ''}`.trim()
  if (!text) throw new Error('Message cannot be empty.')

  const messagesRef = conversationType === 'project'
    ? getGroupMessagesRef(conversationId)
    : getMessagesRef(conversationId)

  return push(messagesRef, {
    text,
    senderId: payload.senderId ? String(payload.senderId) : 'unknown',
    senderName: payload.senderName || 'Unknown user',
    senderAvatar: payload.senderAvatar || '',
    messageType: payload.messageType || 'text',
    callId: payload.callId || '',
    callConversationId: payload.callConversationId || '',
    callProjectId: payload.callProjectId || '',
    callRoomUrl: payload.callRoomUrl || '',
    callJoinToken: payload.callJoinToken || '',
    callUrl: payload.callUrl || '',
    callRoomName: payload.callRoomName || '',
    callStatus: payload.callStatus || '',
    fileName: payload.fileName || '',
    fileType: payload.fileType || '',
    fileData: payload.fileData || '',
    audioData: payload.audioData || '',
    audioType: payload.audioType || '',
    conversationId: String(conversationId),
    createdAt: serverTimestamp(),
  })
}
