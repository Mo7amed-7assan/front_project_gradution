import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const getMessagesCollection = (conversationId) =>
  collection(db, 'conversations', String(conversationId), 'messages')

export const listenToConversationMessages = (conversationId, onMessages, onError) => {
  if (!conversationId) return () => {}

  const messagesQuery = query(getMessagesCollection(conversationId), orderBy('createdAt', 'asc'))

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      onMessages(messages)
    },
    onError
  )
}

export const sendRealtimeMessage = async (conversationId, payload) => {
  if (!conversationId) throw new Error('Conversation is required.')
  const text = `${payload?.text || ''}`.trim()
  if (!text) throw new Error('Message cannot be empty.')

  return addDoc(getMessagesCollection(conversationId), {
    text,
    senderId: payload.senderId ? String(payload.senderId) : 'unknown',
    senderName: payload.senderName || 'Unknown user',
    senderAvatar: payload.senderAvatar || '',
    conversationId: String(conversationId),
    createdAt: serverTimestamp(),
  })
}
