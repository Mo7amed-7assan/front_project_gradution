import {
  off,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
} from 'firebase/database'
import { db } from './firebase'

const getMessagesRef = (conversationId) =>
  ref(db, `conversations/${String(conversationId)}/messages`)

export const listenToConversationMessages = (conversationId, onMessages, onError) => {
  if (!conversationId) return () => {}

  const messagesQuery = query(getMessagesRef(conversationId), orderByChild('createdAt'))

  const handleValue = (snapshot) => {
    const value = snapshot.val() || {}
    const messages = Object.entries(value)
      .map(([id, message]) => ({ id, ...message }))
      .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0))

    onMessages(messages)
  }

  const unsubscribe = onValue(messagesQuery, handleValue, onError)

  return () => {
    unsubscribe()
    off(messagesQuery)
  }
}

export const sendRealtimeMessage = async (conversationId, payload) => {
  if (!conversationId) throw new Error('Conversation is required.')
  const text = `${payload?.text || ''}`.trim()
  if (!text) throw new Error('Message cannot be empty.')

  return push(getMessagesRef(conversationId), {
    text,
    senderId: payload.senderId ? String(payload.senderId) : 'unknown',
    senderName: payload.senderName || 'Unknown user',
    senderAvatar: payload.senderAvatar || '',
    messageType: payload.messageType || 'text',
    callUrl: payload.callUrl || '',
    callRoomName: payload.callRoomName || '',
    fileName: payload.fileName || '',
    fileType: payload.fileType || '',
    fileData: payload.fileData || '',
    audioData: payload.audioData || '',
    audioType: payload.audioType || '',
    conversationId: String(conversationId),
    createdAt: serverTimestamp(),
  })
}
