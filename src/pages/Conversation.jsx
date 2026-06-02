import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import RealtimeChatPanel from '../components/RealtimeChatPanel'
import { useAuth } from '../context/AuthContext'
import { getCurrentUserId } from '../utils/projectAccess'
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

export default function Conversation() {
  const { id } = useParams()
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(id)
  const [error, setError] = useState(null)

  useEffect(() => { setSelectedConversationId(id) }, [id])

  const { user } = useAuth()

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const userId = getCurrentUserId(user)
        const res = await getConversations(userId)
        setConversations(extractConversations(res))
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load conversations.')
      }
    }
    if (user) {
      loadConversations()
    }
  }, [user])

  return (
    <div className="h-[calc(100vh-8rem)]">
      {error && (
        <div className="mb-4 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-bold flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}
      <RealtimeChatPanel
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />
    </div>
  )
}
